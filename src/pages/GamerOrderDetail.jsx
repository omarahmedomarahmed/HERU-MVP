import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Package, ArrowLeft, MessageSquare, Send, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Order, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const STATUS_STYLES = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  processing: { icon: Truck, color: 'text-red-400', bg: 'bg-red-500/10' },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function GamerOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => Order.get(id),
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const chat = [...(order.support_chat || []), {
        sender: user?.id,
        sender_name: 'You',
        message: newMessage,
        timestamp: new Date().toISOString(),
      }];
      await Order.update(id, { support_chat: chat });
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries(['order', id]);
    },
  });

  if (isLoading) {
    return (
      <GamerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      </GamerLayout>
    );
  }

  if (!order) {
    return (
      <GamerLayout>
        <div className="max-w-3xl mx-auto p-8 text-center">
          <p className="text-gray-400">Order not found</p>
          <button onClick={() => navigate('/gamer/orders')} className="text-red-400 mt-2 underline">Back to orders</button>
        </div>
      </GamerLayout>
    );
  }

  const statusInfo = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <GamerLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => navigate('/gamer/orders')} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Package className="w-6 h-6 text-red-500" /> Order
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">{order.id?.slice(0, 8)}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusInfo.bg}`}>
            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`text-sm font-bold capitalize ${statusInfo.color}`}>{order.status}</span>
          </div>
        </div>

        {/* Items */}
        <FloatingPanel className="p-6">
          <h2 className="text-lg font-bold text-white mb-4">Items ({(order.items || []).length})</h2>
          <div className="space-y-3">
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0">
                <div>
                  <p className="text-white">{item.title || item.name}</p>
                  <p className="text-gray-500 text-sm capitalize">{item.category}</p>
                </div>
                <p className="text-white font-bold">EGP {(item.price || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-zinc-700">
            <span className="text-white font-bold">Total</span>
            <span className="text-white font-black text-lg">EGP {(order.total || 0).toLocaleString()}</span>
          </div>
        </FloatingPanel>

        {/* Shipping */}
        {order.shipping_address && (
          <FloatingPanel className="p-6">
            <h2 className="text-lg font-bold text-white mb-2">Shipping Address</h2>
            <p className="text-gray-300">{order.shipping_address.address || order.shipping_address.line1}</p>
            <p className="text-gray-400">{order.shipping_address.city}</p>
          </FloatingPanel>
        )}

        {/* Support Chat */}
        <FloatingPanel className="p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Support Chat
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {(order.support_chat || []).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No messages yet. Send a message to start.</p>
            ) : (
              (order.support_chat || []).map((msg, i) => (
                <div key={i} className={`p-3 rounded-lg ${msg.sender === user?.id ? 'bg-red-500/10 ml-8' : 'bg-zinc-800 mr-8'}`}>
                  <p className="text-xs text-gray-500 mb-1">{msg.sender_name}</p>
                  <p className="text-gray-200 text-sm">{msg.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-zinc-900 border-zinc-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && newMessage.trim() && sendMessageMutation.mutate()}
            />
            <GlowButton
              onClick={() => newMessage.trim() && sendMessageMutation.mutate()}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </GlowButton>
          </div>
        </FloatingPanel>
      </div>
    </GamerLayout>
  );
}
