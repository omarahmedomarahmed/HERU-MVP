import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import {
  ArrowLeft, Package, Clock, Send, User, MessageSquare,
  CheckCircle, XCircle, Loader2, ShoppingBag,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700',
    processing: 'bg-blue-50 text-blue-700',
    completed: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
    draft: 'bg-gray-100 text-gray-600',
    pending_payment: 'bg-amber-50 text-amber-700',
    in_fulfillment: 'bg-blue-50 text-blue-700',
    fulfilled: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

const GAMER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const TOURNAMENT_STATUSES = ['draft', 'pending_payment', 'in_fulfillment', 'fulfilled', 'cancelled'];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [chatMessage, setChatMessage] = useState('');

  // Staff guard
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Try fetching as gamer order first, then tournament order
  const { data: gamerOrder, isLoading: loadingGamer, isError: gamerError } = useQuery({
    queryKey: ['staff-order', id],
    queryFn: () => apiCall(`/orders/${id}`),
    staleTime: 30_000,
    retry: 0,
  });

  const { data: tournamentOrder, isLoading: loadingTournament } = useQuery({
    queryKey: ['staff-tournament-order', id],
    queryFn: () => apiCall(`/tournament-orders/${id}`),
    staleTime: 30_000,
    retry: 0,
    enabled: !!gamerError,
  });

  // Determine which order we have
  const order = gamerOrder || tournamentOrder;
  const isTournamentOrder = !gamerOrder && !!tournamentOrder;
  const isLoading = loadingGamer || (gamerError && loadingTournament);

  const currentStatus = isTournamentOrder
    ? (order?.fulfillment_status || order?.status)
    : order?.status;

  const statusOptions = isTournamentOrder ? TOURNAMENT_STATUSES : GAMER_STATUSES;

  // Update status mutation
  const updateMutation = useMutation({
    mutationFn: (newStatus) => {
      const endpoint = isTournamentOrder ? `/tournament-orders/${id}` : `/orders/${id}`;
      const body = isTournamentOrder ? { fulfillment_status: newStatus } : { status: newStatus };
      return apiCall(endpoint, { method: 'PUT', body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-order', id] });
      queryClient.invalidateQueries({ queryKey: ['staff-tournament-order', id] });
    },
  });

  // Send chat message mutation
  const chatMutation = useMutation({
    mutationFn: (message) => {
      const endpoint = isTournamentOrder
        ? `/tournament-orders/${id}/chat`
        : `/orders/${id}/chat`;
      return apiCall(endpoint, {
        method: 'POST',
        body: { message, sender_role: 'staff', sender_name: 'Staff' },
      });
    },
    onSuccess: () => {
      setChatMessage('');
      queryClient.invalidateQueries({ queryKey: ['staff-order', id] });
      queryClient.invalidateQueries({ queryKey: ['staff-tournament-order', id] });
    },
  });

  const items = useMemo(() => {
    if (!order?.items) return [];
    return Array.isArray(order.items) ? order.items : [];
  }, [order]);

  const supportChat = useMemo(() => {
    const chat = order?.support_chat || order?.internal_chat || [];
    return Array.isArray(chat) ? chat : [];
  }, [order]);

  function handleSendChat(e) {
    e.preventDefault();
    if (!chatMessage.trim() || chatMutation.isPending) return;
    chatMutation.mutate(chatMessage.trim());
  }

  // Loading
  if (isLoading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-400">Loading order...</span>
        </div>
      </StaffLayout>
    );
  }

  // Not found
  if (!order) {
    return (
      <StaffLayout>
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Order not found</p>
          <Link
            to="/staff/orders"
            className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to orders
          </Link>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/staff/orders')}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{(order.id || '').slice(0, 8)}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isTournamentOrder ? 'Tournament Order' : 'Gamer Marketplace Order'}
              {' '} - Created {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: order info + items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <StatusBadge status={currentStatus} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatEGP(order.grand_total || order.total)}</p>
                </div>
                {isTournamentOrder ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tournament</p>
                      <p className="text-sm text-gray-900">{order.tournament_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Organizer</p>
                      <p className="text-sm text-gray-900">{order.main_organizer_brand || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <p className="text-sm text-gray-900 capitalize">{order.tournament_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Platform Fee</p>
                      <p className="text-sm text-gray-900">{formatEGP(order.platform_fee)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gamer</p>
                      <p className="text-sm text-gray-900">{order.gamer_name || order.gamer_id?.slice(0, 8) || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Order Type</p>
                      <p className="text-sm text-gray-900 capitalize">{order.order_type || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">
                  Items ({items.length})
                </h2>
              </div>
              {items.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-gray-400">No items</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between px-6 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title || item.name || 'Item'}</p>
                          {item.category && (
                            <p className="text-xs text-gray-400 capitalize">{item.category}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-medium text-gray-900">{formatEGP(item.price)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support chat */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Support Chat</h2>
              </div>
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {supportChat.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
                ) : (
                  supportChat.map((msg, idx) => {
                    const isStaff = msg.sender_role === 'staff' || msg.sender_role === 'admin';
                    return (
                      <div key={idx} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                          isStaff ? 'bg-blue-50 text-blue-900' : 'bg-gray-100 text-gray-800'
                        }`}>
                          <div className="flex items-center gap-2 mb-0.5">
                            <User className="w-3 h-3" />
                            <span className="text-[11px] font-medium">
                              {msg.sender_name || msg.sender_role || 'Unknown'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {msg.timestamp ? formatDate(msg.timestamp) : ''}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSendChat} className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim() || chatMutation.isPending}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right column: status update */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">Update Status</h2>
              <div className="space-y-2">
                {statusOptions.map((s) => {
                  const isActive = currentStatus === s;
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        if (!isActive && !updateMutation.isPending) {
                          updateMutation.mutate(s);
                        }
                      }}
                      disabled={isActive || updateMutation.isPending}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'
                      } disabled:cursor-not-allowed`}
                    >
                      {isActive ? (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="capitalize">{s.replace(/_/g, ' ')}</span>
                    </button>
                  );
                })}
              </div>
              {updateMutation.isError && (
                <p className="mt-3 text-xs text-red-600">
                  Failed to update status. Please try again.
                </p>
              )}
              {updateMutation.isSuccess && (
                <p className="mt-3 text-xs text-emerald-600">
                  Status updated successfully.
                </p>
              )}
            </div>

            {/* Staff notes (tournament orders) */}
            {isTournamentOrder && order.staff_notes && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Staff Notes</h2>
                <p className="text-sm text-gray-600">{order.staff_notes}</p>
              </div>
            )}

            {/* Co-organizers (tournament orders) */}
            {isTournamentOrder && Array.isArray(order.co_organizers) && order.co_organizers.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Co-Organizers</h2>
                <div className="space-y-2">
                  {order.co_organizers.map((co, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{co.brand_name || co.organizer_id?.slice(0, 8)}</span>
                      <span className="text-gray-500">{co.commitment_percent || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
