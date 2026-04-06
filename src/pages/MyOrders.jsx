import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, ArrowLeft, MessageSquare, Send, Clock, CheckCircle, Truck } from 'lucide-react';
import { GamerProfile, Order, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


export default function MyOrders() {
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/gamer/home');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return Order.list({ gamer_id: user.id }, '-created_date');
    },
    enabled: !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ orderId, message }) => {
      const order = orders.find(o => o.id === orderId);
      const msgObj = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        sender_role: 'gamer',
        message,
        timestamp: new Date().toISOString()
      };
      const updatedChat = [...(order.support_chat || []), msgObj];
      await Order.update(orderId, { support_chat: updatedChat });
      
      // Sync to DM thread for order support
      const allDms = await Order.list();
      const orderDm = allDms.find(dm => dm.chat_type === 'order_support' && dm.reference_id === orderId);
      
      if (orderDm) {
        const messages = orderDm.messages || [];
        messages.push({
          sender_id: user.id,
          sender_name: profile?.username || user.full_name,
          content: message,
          timestamp: new Date().toISOString()
        });
        await Order.update(orderDm.id, {
          messages,
          last_message_at: new Date().toISOString()
        });
      } else {
        await Order.create({
          chat_type: 'order_support',
          chat_name: `Order #${orderId.slice(0, 8).toUpperCase()} Support`,
          reference_id: orderId,
          participants: [user.id],
          messages: [{
            sender_id: user.id,
            sender_name: profile?.username || user.full_name,
            content: message,
            timestamp: new Date().toISOString()
          }],
          last_message_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-orders', user?.id]);
      queryClient.invalidateQueries(['my-conversations', user?.id]);
      setNewMessage('');
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'processing': return <Truck className="w-5 h-5 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <Link to={'/gamer/home'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <HexBadge className="mb-3">
            <Package className="w-3 h-3 mr-1" /> ORDERS
          </HexBadge>
          <h1 className="text-3xl font-black text-white">
            MY <span className="text-red-500">ORDERS</span>
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-400">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <FloatingPanel className="p-12 text-center">
          <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">No Orders Yet</h3>
          <p className="text-gray-400 mb-6">Start shopping to see your orders here!</p>
          <Link to={'/gamer/marketplace'}>
            <GlowButton>
              <Package className="w-4 h-4" />
              Browse Shop
            </GlowButton>
          </Link>
        </FloatingPanel>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <GameCard key={order.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <h3 className="text-lg font-bold text-white">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.created_date).toLocaleDateString()} • {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
                <HexBadge className={getStatusColor(order.status)}>
                  {order.status?.toUpperCase()}
                </HexBadge>
              </div>

              {/* Order Items */}
              <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-zinc-700 last:border-0">
                    <span className="text-gray-300">{item.title}</span>
                    <span className="text-white font-bold">EGP {item.price}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-700">
                  <span className="text-gray-400">Total</span>
                  <span className="text-xl font-bold text-red-400">EGP {order.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className="mb-4 text-sm text-gray-400">
                  <p className="font-medium text-white mb-1">Shipping to:</p>
                  <p>{order.shipping_address.name}</p>
                  <p>{order.shipping_address.street}, {order.shipping_address.city}</p>
                  <p>{order.shipping_address.country} {order.shipping_address.postal_code}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <GlowButton variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>
                  <MessageSquare className="w-4 h-4" />
                  Chat with Support ({order.support_chat?.length || 0})
                </GlowButton>
              </div>
            </GameCard>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id?.slice(0, 8).toUpperCase()} - Support Chat</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Status:</span>
                  <HexBadge className={getStatusColor(selectedOrder.status)}>{selectedOrder.status}</HexBadge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-bold">EGP {selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>

              <div className="h-64 overflow-y-auto mb-4 space-y-2 p-2 bg-zinc-950 rounded-lg">
                {selectedOrder.support_chat?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_role === 'gamer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_role === 'gamer' ? 'bg-red-600' : 'bg-zinc-800'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name} • {msg.sender_role}</p>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs opacity-50 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {(!selectedOrder.support_chat || selectedOrder.support_chat.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No messages yet. Ask us anything!</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message staff..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessageMutation.mutate({ orderId: selectedOrder.id, message: newMessage });
                    }
                  }}
                />
                <GlowButton onClick={() => newMessage.trim() && sendMessageMutation.mutate({ orderId: selectedOrder.id, message: newMessage })}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}