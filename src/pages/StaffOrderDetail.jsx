import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Shield, DollarSign, Users, MessageSquare, Send, CheckCircle, ChevronLeft, CreditCard } from 'lucide-react';
import { TournamentOrder, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


const CATEGORY_COLORS = {
  branding: 'text-purple-400',
  production: 'text-blue-400',
  prizepool: 'text-yellow-400',
  venue: 'text-orange-400',
  talent: 'text-pink-400',
};

const ITEM_STATUS_COLORS = {
  pending: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  in_progress: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  fulfilled: 'text-green-400 border-green-500/30 bg-green-500/10',
  cancelled: 'text-red-400 border-red-500/30 bg-red-500/10',
};

export default function StaffOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [orgChatMsg, setOrgChatMsg] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => navigate('/staff/login'));
  }, []);

  const { data: order, isLoading } = useQuery({
    queryKey: ['tournament-order', id],
    queryFn: async () => {
      const orders = await TournamentOrder.list();
      return orders.find(o => o.id === id);
    },
    enabled: !!id,
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ itemIndex, newStatus, notes }) => {
      const items = [...(order.items || [])];
      items[itemIndex] = { ...items[itemIndex], status: newStatus, ...(notes !== undefined ? { notes } : {}) };
      return TournamentOrder.update(id, { items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament-order', id]);
    }
  });

  const updateOrderNoteMutation = useMutation({
    mutationFn: (note) => TournamentOrder.update(id, { staff_notes: note }),
    onSuccess: () => queryClient.invalidateQueries(['tournament-order', id])
  });

  const sendOrgChatMutation = useMutation({
    mutationFn: async (message) => {
      const chat = [...(order.internal_chat || [])];
      chat.push({ sender_id: user?.id, sender_name: 'HERU Staff', sender_role: 'staff', message, timestamp: new Date().toISOString() });
      return TournamentOrder.update(id, { internal_chat: chat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament-order', id]);
      setOrgChatMsg('');
    }
  });

  const markCoOrgPaidMutation = useMutation({
    mutationFn: async (coOrgIndex) => {
      const coOrgs = [...(order.co_organizers || [])];
      coOrgs[coOrgIndex] = { ...coOrgs[coOrgIndex], payment_status: 'paid', access_granted: true };
      return TournamentOrder.update(id, { co_organizers: coOrgs });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament-order', id]);
    }
  });

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Order not found</p>
          <GlowButton className="mt-4" onClick={() => navigate('/staff/tournament-orders')}>Back to Orders</GlowButton>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <button onClick={() => navigate('/staff/tournament-orders')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>
        <h1 className="text-3xl font-black text-white">
          <Trophy className="w-8 h-8 inline text-yellow-500 mr-2" />
          {order.tournament_name}
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <FloatingPanel className="p-4">
          <p className="text-gray-400 text-xs mb-1 uppercase">Grand Total</p>
          <p className="text-green-400 font-bold text-2xl">EGP {(order.grand_total || 0).toLocaleString()}</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <p className="text-gray-400 text-xs mb-1 uppercase">Main Org Owes</p>
          <p className="text-red-400 font-bold text-2xl">EGP {(order.main_organizer_owes || 0).toLocaleString()}</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <p className="text-gray-400 text-xs mb-1 uppercase">Status</p>
          <p className="text-blue-400 font-bold text-sm capitalize">{order.fulfillment_status?.replace('_', ' ')}</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <p className="text-gray-400 text-xs mb-1 uppercase">Items</p>
          <p className="text-yellow-400 font-bold text-2xl">{order.items?.length || 0}</p>
        </FloatingPanel>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="bg-zinc-800 mb-4">
          <TabsTrigger value="items" className="data-[state=active]:bg-red-600">Items</TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-red-600">Billing</TabsTrigger>
          {order.tournament_type === 'shared' && (
            <TabsTrigger value="chat" className="data-[state=active]:bg-red-600">Chat</TabsTrigger>
          )}
          <TabsTrigger value="notes" className="data-[state=active]:bg-red-600">Notes</TabsTrigger>
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <FloatingPanel className="p-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Order Items
            </h3>
            {order.items?.length > 0 ? (
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="p-3 bg-zinc-800/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase ${CATEGORY_COLORS[item.category] || 'text-gray-400'}`}>{item.category}</span>
                        <span className="text-white font-medium text-sm">{item.title}</span>
                        {item.assigned_to && <span className="text-xs text-gray-500">→ {item.assigned_to}</span>}
                      </div>
                      <span className="text-green-400 font-bold">EGP {(item.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={item.status || 'pending'} onValueChange={v => {
                        updateItemStatusMutation.mutate({ itemIndex: i, newStatus: v });
                      }}>
                        <SelectTrigger className="h-7 text-xs w-40 bg-zinc-700 border-zinc-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="fulfilled">Fulfilled</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className={`text-xs px-2 py-0.5 rounded border ${ITEM_STATUS_COLORS[item.status] || ''}`}>
                        {item.status || 'pending'}
                      </span>
                    </div>
                    <Input
                      value={item.notes || ''}
                      onChange={e => {
                        // Update locally for immediate feedback
                      }}
                      onBlur={e => updateItemStatusMutation.mutate({ itemIndex: i, newStatus: item.status, notes: e.target.value })}
                      placeholder="Item notes..."
                      className="h-7 text-xs bg-zinc-700 border-zinc-600 text-white"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No items</p>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <FloatingPanel className="p-4">
            <h3 className="text-white font-bold mb-4">Billing Details</h3>
            
            <div className="p-3 bg-zinc-800/50 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400 text-sm">Main Organizer — {order.main_organizer_brand}</span>
                <span className="text-red-400 font-bold">EGP {(order.main_organizer_owes || 0).toLocaleString()}</span>
              </div>
              <p className="text-gray-600 text-xs">Primary commitment</p>
            </div>

            {order.co_organizers?.length > 0 ? (
              order.co_organizers.map((co, i) => {
                const owes = order.grand_total ? (order.grand_total * (co.commitment_percent || 0) / 100) : (co.commitment_amount || 0);
                const assignedItems = order.items?.filter(item => item.assigned_to === co.organizer_id || item.assigned_to === co.brand_name) || [];
                return (
                  <div key={i} className="p-4 bg-zinc-800/50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center overflow-hidden">
                          {co.brand_logo ? <img src={co.brand_logo} className="w-full h-full object-cover" alt="" /> : <Shield className="w-4 h-4 text-zinc-500" />}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{co.brand_name}</p>
                          <p className="text-gray-500 text-xs">{co.commitment_percent}% committed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-bold">EGP {owes.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">owes</p>
                      </div>
                    </div>

                    {assignedItems.length > 0 && (
                      <div className="text-xs text-gray-400 space-y-1">
                        <p className="font-medium text-gray-500">Assigned items:</p>
                        {assignedItems.map((item, j) => (
                          <div key={j} className="flex justify-between">
                            <span>{item.title}</span>
                            <span className="text-green-400">EGP {(item.price || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                      <span className={`text-xs px-2 py-0.5 rounded border ${co.payment_status === 'paid' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                        {co.payment_status || 'pending'}
                      </span>
                      {co.payment_status !== 'paid' && (
                        <GlowButton size="sm" variant="secondary" onClick={() => markCoOrgPaidMutation.mutate(i)}>
                          <CreditCard className="w-3 h-3" /> Mark as Paid
                        </GlowButton>
                      )}
                      {co.payment_status === 'paid' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Access granted</span>}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No co-organizers</p>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Chat Tab */}
        {order.tournament_type === 'shared' && (
          <TabsContent value="chat" className="space-y-4">
            <FloatingPanel className="p-4">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" /> Organizer Chat
              </h3>
              <div className="h-48 overflow-y-auto bg-zinc-950 rounded-lg p-3 space-y-2 mb-3">
                {order.internal_chat?.length > 0 ? (
                  order.internal_chat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_role === 'staff' ? 'bg-red-600' : 'bg-zinc-800'}`}>
                        <p className="text-xs opacity-60 mb-1">{msg.sender_name} · {msg.sender_role}</p>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-6 text-sm">No messages</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  value={orgChatMsg} 
                  onChange={e => setOrgChatMsg(e.target.value)} 
                  placeholder="Write to organizer chat..." 
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyDown={e => { if (e.key === 'Enter' && orgChatMsg.trim()) { sendOrgChatMutation.mutate(orgChatMsg); }}}
                />
                <GlowButton size="sm" disabled={!orgChatMsg.trim()} onClick={() => sendOrgChatMutation.mutate(orgChatMsg)}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </FloatingPanel>
          </TabsContent>
        )}

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <FloatingPanel className="p-4">
            <h3 className="text-white font-bold mb-4">Staff Notes</h3>
            <label className="text-sm text-gray-400 block mb-2">Internal notes (only visible to staff)</label>
            <Textarea
              value={order.staff_notes || ''}
              onChange={e => setOrderNote(e.target.value)}
              placeholder="Add internal notes about this order..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-32"
            />
            <GlowButton className="mt-3" size="sm" onClick={() => updateOrderNoteMutation.mutate(orderNote)} disabled={updateOrderNoteMutation.isPending}>
              <CheckCircle className="w-4 h-4" /> Save Notes
            </GlowButton>
          </FloatingPanel>
        </TabsContent>
      </Tabs>
    </>
  );
}