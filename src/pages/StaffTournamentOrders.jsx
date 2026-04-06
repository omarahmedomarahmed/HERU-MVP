import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Search, Shield, DollarSign, Users, MessageSquare, Send, CheckCircle, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import { TournamentOrder, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


const FULFILLMENT_COLORS = {
  draft: 'text-zinc-400 border-zinc-600 bg-zinc-700/30',
  pending_payment: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  in_fulfillment: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  fulfilled: 'text-green-400 border-green-500/30 bg-green-500/10',
  cancelled: 'text-red-400 border-red-500/30 bg-red-500/10',
};

const ITEM_STATUS_COLORS = {
  pending: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  in_progress: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  fulfilled: 'text-green-400 border-green-500/30 bg-green-500/10',
  cancelled: 'text-red-400 border-red-500/30 bg-red-500/10',
};

const CATEGORY_COLORS = {
  branding: 'text-purple-400',
  production: 'text-blue-400',
  prizepool: 'text-yellow-400',
  venue: 'text-orange-400',
  talent: 'text-pink-400',
};

export default function StaffTournamentOrders() {
  const [user, setUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [expandedItems, setExpandedItems] = useState(false);
  const [orgChatMsg, setOrgChatMsg] = useState('');
  const [supportChatMsg, setSupportChatMsg] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => navigate('/admin'));
  }, []);

  const { data: tournamentOrders = [], isLoading } = useQuery({
    queryKey: ['all-tournament-orders'],
    queryFn: () => TournamentOrder.list('-created_date'),
  });

  const allBrands = [...new Set(tournamentOrders.map(o => o.main_organizer_brand).filter(Boolean))];

  const filtered = tournamentOrders.filter(o => {
    const matchSearch = !searchQuery || o.tournament_name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.main_organizer_brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'all' || o.tournament_type === typeFilter;
    const matchStatus = statusFilter === 'all' || o.fulfillment_status === statusFilter;
    const matchBrand = !brandFilter || o.main_organizer_brand?.toLowerCase().includes(brandFilter.toLowerCase());
    return matchSearch && matchType && matchStatus && matchBrand;
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ orderId, itemIndex, newStatus, notes }) => {
      const order = tournamentOrders.find(o => o.id === orderId);
      const items = [...(order.items || [])];
      items[itemIndex] = { ...items[itemIndex], status: newStatus, ...(notes !== undefined ? { notes } : {}) };
      return TournamentOrder.update(orderId, { items });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['all-tournament-orders']);
      if (selected?.id === vars.orderId) {
        const updated = tournamentOrders.find(o => o.id === vars.orderId);
        if (updated) setSelected({ ...updated });
      }
    }
  });

  const updateOrderNoteMutation = useMutation({
    mutationFn: ({ orderId, note }) => TournamentOrder.update(orderId, { staff_notes: note }),
    onSuccess: () => queryClient.invalidateQueries(['all-tournament-orders'])
  });

  const sendOrgChatMutation = useMutation({
    mutationFn: async ({ orderId, message }) => {
      const order = tournamentOrders.find(o => o.id === orderId);
      const chat = [...(order.internal_chat || [])];
      chat.push({ sender_id: user?.id, sender_name: 'HERU Staff', sender_role: 'staff', message, timestamp: new Date().toISOString() });
      return TournamentOrder.update(orderId, { internal_chat: chat });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['all-tournament-orders']);
      setOrgChatMsg('');
      const fresh = tournamentOrders.find(o => o.id === vars.orderId);
      if (fresh) setSelected(s => ({ ...s, internal_chat: [...(s.internal_chat || []), { sender_id: user?.id, sender_name: 'HERU Staff', sender_role: 'staff', message: vars.message, timestamp: new Date().toISOString() }] }));
    }
  });

  const markCoOrgPaidMutation = useMutation({
    mutationFn: async ({ orderId, coOrgIndex }) => {
      const order = tournamentOrders.find(o => o.id === orderId);
      const coOrgs = [...(order.co_organizers || [])];
      coOrgs[coOrgIndex] = { ...coOrgs[coOrgIndex], payment_status: 'paid', access_granted: true };
      return TournamentOrder.update(orderId, { co_organizers: coOrgs });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['all-tournament-orders']);
      setSelected(s => {
        const coOrgs = [...(s.co_organizers || [])];
        coOrgs[vars.coOrgIndex] = { ...coOrgs[vars.coOrgIndex], payment_status: 'paid', access_granted: true };
        return { ...s, co_organizers: coOrgs };
      });
    }
  });

  const openDetail = (order) => {
    setSelected(order);
    setOrderNote(order.staff_notes || '');
    setExpandedItems(false);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">TOURNAMENT <span className="text-red-500">ORDERS</span></h1>
        <p className="text-gray-400">{tournamentOrders.length} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['pending_payment','in_fulfillment','fulfilled','draft'].map(s => (
          <FloatingPanel key={s} className="p-4">
            <p className="text-2xl font-bold text-white">{tournamentOrders.filter(o => o.fulfillment_status === s).length}</p>
            <p className="text-gray-500 text-xs capitalize">{s.replace('_', ' ')}</p>
          </FloatingPanel>
        ))}
      </div>

      {/* Filters */}
      <FloatingPanel className="p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by tournament or organizer..." className="pl-10 bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="solo">Solo</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Fulfillment Status" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_payment">Pending Payment</SelectItem>
              <SelectItem value="in_fulfillment">In Fulfillment</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FloatingPanel>

      {/* Table */}
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-gray-500 font-medium p-4">Tournament</th>
                <th className="text-left text-gray-500 font-medium p-4">Type</th>
                <th className="text-left text-gray-500 font-medium p-4">Main Organizer</th>
                <th className="text-center text-gray-500 font-medium p-4">Co-Orgs</th>
                <th className="text-right text-gray-500 font-medium p-4">Grand Total</th>
                <th className="text-center text-gray-500 font-medium p-4">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-white/5 cursor-pointer" onClick={() => openDetail(order)}>
                  <td className="p-4">
                    <p className="text-white font-medium truncate max-w-48">{order.tournament_name}</p>
                    <p className="text-gray-500 text-xs">{order.items?.length || 0} items</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${order.tournament_type === 'shared' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>
                      {order.tournament_type || 'solo'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300 truncate max-w-36">{order.main_organizer_brand || '—'}</td>
                  <td className="p-4 text-center text-gray-300">{order.co_organizers?.length || 0}</td>
                  <td className="p-4 text-right text-green-400 font-bold">EGP {(order.grand_total || 0).toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded border ${FULFILLMENT_COLORS[order.fulfillment_status] || ''}`}>
                      {order.fulfillment_status?.replace('_', ' ') || 'draft'}
                    </span>
                  </td>
                  <td className="p-4"><GlowButton variant="ghost" size="sm">View</GlowButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {selected?.tournament_name}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded border ${selected?.tournament_type === 'shared' ? 'text-purple-400 border-purple-500/30' : 'text-blue-400 border-blue-500/30'}`}>
                {selected?.tournament_type}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <Tabs defaultValue="items" className="w-full mt-2">
              <TabsList className="bg-zinc-800 mb-4">
                <TabsTrigger value="items" className="data-[state=active]:bg-red-600">Items</TabsTrigger>
                <TabsTrigger value="billing" className="data-[state=active]:bg-red-600">Billing</TabsTrigger>
                {selected.tournament_type === 'shared' && (
                  <TabsTrigger value="chat" className="data-[state=active]:bg-red-600">Chats</TabsTrigger>
                )}
                <TabsTrigger value="notes" className="data-[state=active]:bg-red-600">Notes</TabsTrigger>
              </TabsList>

              {/* Items Tab */}
              <TabsContent value="items" className="space-y-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Grand Total</p>
                    <p className="text-green-400 font-bold">EGP {(selected.grand_total || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Main Org Owes</p>
                    <p className="text-red-400 font-bold">EGP {(selected.main_organizer_owes || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded border ${FULFILLMENT_COLORS[selected.fulfillment_status] || ''}`}>
                      {selected.fulfillment_status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {selected.items?.length > 0 ? selected.items.map((item, i) => (
                  <div key={i} className="p-3 bg-zinc-800/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold uppercase ${CATEGORY_COLORS[item.category] || 'text-gray-400'}`}>{item.category}</span>
                        <span className="text-white font-medium text-sm">{item.title}</span>
                        {item.assigned_to && <span className="text-xs text-gray-500">→ {item.assigned_to}</span>}
                      </div>
                      <span className="text-green-400 font-bold text-sm">EGP {(item.price || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={item.status || 'pending'} onValueChange={v => {
                        updateItemStatusMutation.mutate({ orderId: selected.id, itemIndex: i, newStatus: v });
                        setSelected(s => {
                          const items = [...s.items]; items[i] = { ...items[i], status: v };
                          return { ...s, items };
                        });
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
                      <span className={`text-xs px-2 py-0.5 rounded border ${ITEM_STATUS_COLORS[item.status] || ''}`}>{item.status}</span>
                    </div>
                    <Input
                      value={item.notes || ''}
                      onChange={e => {
                        const v = e.target.value;
                        setSelected(s => { const items = [...s.items]; items[i] = { ...items[i], notes: v }; return { ...s, items }; });
                      }}
                      onBlur={e => updateItemStatusMutation.mutate({ orderId: selected.id, itemIndex: i, newStatus: item.status, notes: e.target.value })}
                      placeholder="Item notes..."
                      className="h-7 text-xs bg-zinc-700 border-zinc-600 text-white"
                    />
                  </div>
                )) : <p className="text-gray-500 text-center py-8">No items</p>}
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-400 text-sm">Main Organizer — {selected.main_organizer_brand}</span>
                    <span className="text-red-400 font-bold">EGP {(selected.main_organizer_owes || 0).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 text-xs">Primary commitment</p>
                </div>

                {selected.co_organizers?.length > 0 ? selected.co_organizers.map((co, i) => {
                  const owes = selected.grand_total ? (selected.grand_total * (co.commitment_percent || 0) / 100) : (co.commitment_amount || 0);
                  const assignedItems = selected.items?.filter(item => item.assigned_to === co.organizer_id || item.assigned_to === co.brand_name) || [];
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
                          <GlowButton size="sm" variant="secondary" onClick={() => markCoOrgPaidMutation.mutate({ orderId: selected.id, coOrgIndex: i })}>
                            <CreditCard className="w-3 h-3" /> Mark as Paid
                          </GlowButton>
                        )}
                        {co.payment_status === 'paid' && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Access granted</span>}
                      </div>
                    </div>
                  );
                }) : <p className="text-gray-500 text-sm text-center py-4">No co-organizers</p>}
              </TabsContent>

              {/* Chats Tab (shared only) */}
              {selected.tournament_type === 'shared' && (
                <TabsContent value="chat" className="space-y-6">
                  {/* Organizer Chat */}
                  <div>
                    <h3 className="text-white font-bold mb-2 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" /> Organizer Chat (Co-Organizers)
                    </h3>
                    <div className="h-44 overflow-y-auto bg-zinc-950 rounded-lg p-3 space-y-2 mb-2">
                      {selected.internal_chat?.length > 0 ? selected.internal_chat.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg text-sm ${msg.sender_role === 'staff' ? 'bg-red-600' : 'bg-zinc-800'}`}>
                            <p className="text-xs opacity-60 mb-1">{msg.sender_name} · {msg.sender_role}</p>
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      )) : <p className="text-gray-500 text-center py-6 text-sm">No messages</p>}
                    </div>
                    <div className="flex gap-2">
                      <Input value={orgChatMsg} onChange={e => setOrgChatMsg(e.target.value)} placeholder="Write to organizer chat..." className="bg-zinc-800 border-zinc-700 text-white" onKeyDown={e => { if (e.key === 'Enter' && orgChatMsg.trim()) { sendOrgChatMutation.mutate({ orderId: selected.id, message: orgChatMsg }); }}} />
                      <GlowButton size="sm" disabled={!orgChatMsg.trim()} onClick={() => sendOrgChatMutation.mutate({ orderId: selected.id, message: orgChatMsg })}><Send className="w-4 h-4" /></GlowButton>
                    </div>
                  </div>
                </TabsContent>
              )}

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Staff Notes (internal)</label>
                  <Textarea
                    value={orderNote}
                    onChange={e => setOrderNote(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    className="bg-zinc-800 border-zinc-700 text-white min-h-32"
                  />
                  <GlowButton className="mt-3" size="sm" onClick={() => updateOrderNoteMutation.mutate({ orderId: selected.id, note: orderNote })} disabled={updateOrderNoteMutation.isPending}>
                    <CheckCircle className="w-4 h-4" /> Save Notes
                  </GlowButton>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}