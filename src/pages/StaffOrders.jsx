import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Ticket, Search, Eye, Package, MapPin, Phone, 
  MessageSquare, Check, X, Send, DollarSign, Trophy, ShoppingCart
} from 'lucide-react';

export default function StaffOrders() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTournamentOrder, setSelectedTournamentOrder] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [tournamentChatMsg, setTournamentChatMsg] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
      return;
    }
    loadUser();
  }, [navigate]);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/admin');
    }
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => Order.list('-created_date'),
  });

  // Get tournaments that have purchases (total_cost > 0)
  const { data: tournamentOrders = [] } = useQuery({
    queryKey: ['tournament-orders'],
    queryFn: async () => {
      const tournaments = await Tournament.list('-created_date');
      return tournaments.filter(t => 
        (t.total_cost && t.total_cost > 0) || 
        t.talents?.length > 0 || 
        t.branding_items?.length > 0 || 
        t.production_items?.length > 0 ||
        t.prizepool_items?.length > 0 ||
        t.venue_items?.length > 0
      );
    },
  });

  const gamerOrders = orders.filter(o => o.gamer_id);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.shipping_address?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }) => Order.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-orders']);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ orderId, message }) => {
      const order = orders.find(o => o.id === orderId);
      const chat = order.support_chat || [];
      chat.push({
        sender_id: user?.id,
        sender_name: user?.full_name,
        sender_role: 'staff',
        message,
        timestamp: new Date().toISOString()
      });
      return Order.update(orderId, { support_chat: chat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-orders']);
      setChatMessage('');
    }
  });

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          ORDER <span className="text-red-500">MANAGEMENT</span>
        </h1>
        <p className="text-gray-400">{orders.length} gamer orders • {tournamentOrders.length} tournament orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <FloatingPanel className="p-4">
          <ShoppingCart className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-white">{gamerOrders.length}</p>
          <p className="text-gray-500 text-xs">Gamer Orders</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-white">{tournamentOrders.length}</p>
          <p className="text-gray-500 text-xs">Tournament Orders</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <DollarSign className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-white">
            EGP {orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(0)}
          </p>
          <p className="text-gray-500 text-xs">Total Revenue</p>
        </FloatingPanel>
      </div>

      {/* Filters */}
      <FloatingPanel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FloatingPanel>

      <Tabs defaultValue="gamer" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
          <TabsTrigger value="gamer" className="data-[state=active]:bg-red-600">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Gamer Orders ({gamerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="tournament" className="data-[state=active]:bg-red-600">
            <Trophy className="w-4 h-4 mr-2" />
            Tournament Orders ({tournamentOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* Gamer Orders */}
        <TabsContent value="gamer">
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 bg-zinc-900/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <FloatingPanel key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center">
                        <Package className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">Order #{order.id.slice(0, 8)}</p>
                          <HexBadge className={
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                            order.status === 'processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            order.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/50'
                          }>
                            {order.status}
                          </HexBadge>
                        </div>
                        <p className="text-gray-500 text-sm">
                          {order.items?.length || 0} items • EGP {order.total?.toFixed(2)}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {order.shipping_address?.name} • {order.shipping_address?.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlowButton variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                        <Eye className="w-4 h-4" /> View
                      </GlowButton>
                    </div>
                  </div>
                </FloatingPanel>
              ))}

              {filteredOrders.length === 0 && (
                <FloatingPanel className="p-12 text-center">
                  <Ticket className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-gray-400">No orders found</p>
                </FloatingPanel>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tournament Orders */}
        <TabsContent value="tournament">
          <div className="space-y-3">
            {tournamentOrders.map((tournament) => {
              const allItems = [
                ...(tournament.branding_items || []).map(id => ({ id, category: 'branding' })),
                ...(tournament.production_items || []).map(id => ({ id, category: 'production' })),
                ...(tournament.prizepool_items || []).map(id => ({ id, category: 'prizepool' })),
                ...(tournament.venue_items || []).map(id => ({ id, category: 'venue' })),
                ...(tournament.talents || []).map(t => ({ id: t.user_id, category: 'talent', talent_type: t.talent_type, price: t.price })),
              ];
              return (
                <FloatingPanel key={tournament.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-600/30 to-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {tournament.tournament_image ? (
                          <img src={tournament.tournament_image} className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="w-6 h-6 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold">{tournament.name}</p>
                          <HexBadge className={
                            tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                            tournament.status === 'published' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          }>
                            {tournament.status}
                          </HexBadge>
                        </div>
                        <p className="text-gray-500 text-sm">{tournament.game} • {allItems.length} items</p>
                        <p className="text-gray-600 text-xs">by {tournament.organizer_brand?.name || 'Unknown Organizer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-green-400 font-bold">EGP {(tournament.total_cost || 0).toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">Total</p>
                      </div>
                      <GlowButton variant="ghost" size="sm" onClick={() => setSelectedTournamentOrder(tournament)}>
                        <Eye className="w-4 h-4" /> View Order
                      </GlowButton>
                    </div>
                  </div>
                </FloatingPanel>
              );
            })}
            {tournamentOrders.length === 0 && (
              <FloatingPanel className="p-12 text-center">
                <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400">No tournament orders yet</p>
              </FloatingPanel>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status</span>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(status) => {
                    updateOrderStatusMutation.mutate({ id: selectedOrder.id, status });
                    setSelectedOrder({ ...selectedOrder, status });
                  }}
                >
                  <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Shipping Address */}
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" /> Shipping Address
                </h3>
                <p className="text-gray-300">{selectedOrder.shipping_address?.name}</p>
                <p className="text-gray-400 text-sm">{selectedOrder.shipping_address?.street}</p>
                <p className="text-gray-400 text-sm">
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postal_code}
                </p>
                <p className="text-gray-400 text-sm">{selectedOrder.shipping_address?.country}</p>
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-2">
                  <Phone className="w-3 h-3" /> {selectedOrder.shipping_address?.phone}
                </p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-white font-bold mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                      <div>
                        <p className="text-white">{item.title}</p>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white font-bold">EGP {item.price?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-zinc-800">
                  <span className="text-gray-400">Total</span>
                  <span className="text-white font-bold text-lg">EGP {selectedOrder.total?.toFixed(2)}</span>
                </div>
                {selectedOrder.discount_applied > 0 && (
                  <p className="text-green-400 text-sm text-right">
                    Discount: -EGP {selectedOrder.discount_applied?.toFixed(2)} ({selectedOrder.promo_code_used})
                  </p>
                )}
              </div>

              {/* Support Chat */}
              <div>
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-500" /> Purchase Support Chat
                </h3>
                <div className="h-48 overflow-y-auto bg-zinc-800/50 rounded-lg p-4 mb-3 space-y-3">
                  {selectedOrder.support_chat?.length > 0 ? (
                    selectedOrder.support_chat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          msg.sender_role === 'staff' 
                            ? 'bg-red-500/20 text-white' 
                            : 'bg-zinc-700 text-gray-300'
                        }`}>
                          <p className="text-xs text-gray-500 mb-1">{msg.sender_name}</p>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No messages yet</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && chatMessage) {
                        sendMessageMutation.mutate({ orderId: selectedOrder.id, message: chatMessage });
                      }
                    }}
                  />
                  <GlowButton 
                    onClick={() => {
                      if (chatMessage) {
                        sendMessageMutation.mutate({ orderId: selectedOrder.id, message: chatMessage });
                      }
                    }}
                    disabled={!chatMessage}
                  >
                    <Send className="w-4 h-4" />
                  </GlowButton>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Tournament Order Detail Modal */}
      <Dialog open={!!selectedTournamentOrder} onOpenChange={() => setSelectedTournamentOrder(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {selectedTournamentOrder?.name} — Order
            </DialogTitle>
          </DialogHeader>
          {selectedTournamentOrder && (
            <div className="space-y-5 py-2">
              {/* Header info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Status</p>
                  <HexBadge className={selectedTournamentOrder.status === 'live' ? 'bg-green-500/20 text-green-400' : ''}>{selectedTournamentOrder.status}</HexBadge>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-green-400 font-bold">EGP {(selectedTournamentOrder.total_cost || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Organizer</p>
                  <p className="text-white text-xs font-bold truncate">{selectedTournamentOrder.organizer_brand?.name || 'Unknown'}</p>
                </div>
              </div>

              {/* Branding Items */}
              {selectedTournamentOrder.branding_items?.length > 0 && (
                <div>
                  <p className="text-white font-bold mb-2 text-sm">Branding Items ({selectedTournamentOrder.branding_items.length})</p>
                  <div className="space-y-2">
                    {selectedTournamentOrder.branding_items.map((itemId, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                        <span className="text-gray-300 text-sm">Item #{itemId?.slice(0, 8)}</span>
                        <div className="flex items-center gap-2">
                          <HexBadge className="bg-blue-500/20 text-blue-400 text-xs">branding</HexBadge>
                          <button
                            onClick={async () => {
                              const updated = selectedTournamentOrder.branding_items.list((_, idx) => idx !== i);
                              await Tournament.update(selectedTournamentOrder.id, { branding_items: updated });
                              setSelectedTournamentOrder({ ...selectedTournamentOrder, branding_items: updated });
                              queryClient.invalidateQueries(['tournament-orders']);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Talents */}
              {selectedTournamentOrder.talents?.length > 0 && (
                <div>
                  <p className="text-white font-bold mb-2 text-sm">Talent Bookings ({selectedTournamentOrder.talents.length})</p>
                  <div className="space-y-2">
                    {selectedTournamentOrder.talents.map((talent, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                        <div>
                          <span className="text-gray-300 text-sm capitalize">{talent.talent_type}</span>
                          <span className="text-gray-500 text-xs ml-2">User: {talent.user_id?.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold text-sm">EGP {talent.price || 0}</span>
                          <button
                            onClick={async () => {
                              const updated = selectedTournamentOrder.talents.list((_, idx) => idx !== i);
                              await Tournament.update(selectedTournamentOrder.id, { talents: updated });
                              setSelectedTournamentOrder({ ...selectedTournamentOrder, talents: updated });
                              queryClient.invalidateQueries(['tournament-orders']);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prize Pool Items */}
              {selectedTournamentOrder.prizepool_items?.length > 0 && (
                <div>
                  <p className="text-white font-bold mb-2 text-sm">Prize Pool ({selectedTournamentOrder.prizepool_items.length} items)</p>
                  <div className="space-y-2">
                    {selectedTournamentOrder.prizepool_items.map((itemId, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                        <span className="text-gray-300 text-sm">Prize #{itemId?.slice(0, 8)}</span>
                        <div className="flex items-center gap-2">
                          <HexBadge className="bg-yellow-500/20 text-yellow-400 text-xs">prize</HexBadge>
                          <button
                            onClick={async () => {
                              const updated = selectedTournamentOrder.prizepool_items.list((_, idx) => idx !== i);
                              await Tournament.update(selectedTournamentOrder.id, { prizepool_items: updated });
                              setSelectedTournamentOrder({ ...selectedTournamentOrder, prizepool_items: updated });
                              queryClient.invalidateQueries(['tournament-orders']);
                            }}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Chat with Organizer */}
              <div>
                <p className="text-white font-bold mb-2 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-red-500" /> Staff Chat with Organizer
                </p>
                <div className="h-48 overflow-y-auto bg-zinc-950 rounded-lg p-3 space-y-2 mb-3">
                  {selectedTournamentOrder.support_chat?.length > 0 ? (
                    selectedTournamentOrder.support_chat.map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_role === 'staff' ? 'bg-red-600' : 'bg-zinc-800'}`}>
                          <p className="text-xs opacity-60 mb-1">{msg.sender_name} • {msg.sender_role}</p>
                          <p>{msg.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8 text-sm">No messages yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tournamentChatMsg}
                    onChange={(e) => setTournamentChatMsg(e.target.value)}
                    placeholder="Message the organizer..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                    onKeyPress={async (e) => {
                      if (e.key === 'Enter' && tournamentChatMsg.trim()) {
                        const msg = { sender_id: user?.id, sender_name: 'HERU Staff', sender_role: 'staff', message: tournamentChatMsg, timestamp: new Date().toISOString() };
                        const updated = [...(selectedTournamentOrder.support_chat || []), msg];
                        await Tournament.update(selectedTournamentOrder.id, { support_chat: updated });
                        setSelectedTournamentOrder({ ...selectedTournamentOrder, support_chat: updated });
                        setTournamentChatMsg('');
                        queryClient.invalidateQueries(['tournament-orders']);
                      }
                    }}
                  />
                  <GlowButton size="sm" onClick={async () => {
                    if (!tournamentChatMsg.trim()) return;
                    const msg = { sender_id: user?.id, sender_name: 'HERU Staff', sender_role: 'staff', message: tournamentChatMsg, timestamp: new Date().toISOString() };
                    const updated = [...(selectedTournamentOrder.support_chat || []), msg];
                    await Tournament.update(selectedTournamentOrder.id, { support_chat: updated });
                    setSelectedTournamentOrder({ ...selectedTournamentOrder, support_chat: updated });
                    setTournamentChatMsg('');
                    queryClient.invalidateQueries(['tournament-orders']);
                  }}>
                    <Send className="w-4 h-4" />
                  </GlowButton>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}