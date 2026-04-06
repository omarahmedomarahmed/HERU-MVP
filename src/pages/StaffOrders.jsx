import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Filter, ShoppingCart, Trophy, DollarSign, Eye, Package,
} from 'lucide-react';
import { Order, TournamentOrder } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const STATUS_BADGE = {
  pending:    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  completed:  'bg-green-500/20 text-green-400 border border-green-500/30',
  cancelled:  'bg-red-500/20 text-red-400 border border-red-500/30',
  draft:           'bg-zinc-700 text-zinc-300',
  pending_payment: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  in_fulfillment:  'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  fulfilled:       'bg-green-500/20 text-green-400 border border-green-500/30',
};

export default function StaffOrders() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('gamer');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: gamerOrders = [], isLoading: loadingGamer } = useQuery({
    queryKey: ['staff-gamer-orders'],
    queryFn: () => Order.list(),
  });

  const { data: tournamentOrders = [], isLoading: loadingTournament } = useQuery({
    queryKey: ['staff-tournament-orders'],
    queryFn: () => TournamentOrder.list(),
  });

  const filteredGamer = useMemo(() => {
    return gamerOrders.filter(o => {
      const matchSearch = !search ||
        o.id?.toLowerCase().includes(search.toLowerCase()) ||
        o.shipping_address?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [gamerOrders, search, statusFilter]);

  const filteredTournament = useMemo(() => {
    return tournamentOrders.filter(o => {
      const matchSearch = !search ||
        o.id?.toLowerCase().includes(search.toLowerCase()) ||
        o.tournament_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.main_organizer_brand?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.fulfillment_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tournamentOrders, search, statusFilter]);

  const gamerStatuses = ['all', 'pending', 'processing', 'completed', 'cancelled'];
  const tournamentStatuses = ['all', 'draft', 'pending_payment', 'in_fulfillment', 'fulfilled', 'cancelled'];

  const totalGamerRevenue = gamerOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalTournamentRevenue = tournamentOrders.reduce((s, o) => s + (o.grand_total || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        All <span className="text-blue-400">Orders</span>
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400">Gamer Orders</span>
          </div>
          <p className="text-xl font-bold text-white">{gamerOrders.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Tournament Orders</span>
          </div>
          <p className="text-xl font-bold text-white">{tournamentOrders.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-green-400">EGP {(totalGamerRevenue + totalTournamentRevenue).toLocaleString()}</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => { setTab('gamer'); setStatusFilter('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'gamer' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Gamer Orders ({gamerOrders.length})
        </button>
        <button
          onClick={() => { setTab('tournament'); setStatusFilter('all'); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'tournament' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" /> Tournament Orders ({tournamentOrders.length})
        </button>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tab === 'gamer' ? 'Search by order ID or customer...' : 'Search by order ID, tournament, or organizer...'}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {(tab === 'gamer' ? gamerStatuses : tournamentStatuses).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gamer Orders Table */}
      {tab === 'gamer' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Order ID</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Type</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Customer</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-3">Items</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-3">Total (EGP)</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Created</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingGamer ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-500">Loading...</td></tr>
                ) : filteredGamer.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-500">No gamer orders found</td></tr>
                ) : filteredGamer.map(order => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-white font-mono text-xs">{order.id?.slice(0, 8)}...</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-1 rounded bg-zinc-700 text-gray-300">
                        {order.order_type || 'marketplace'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{order.shipping_address?.name || '--'}</td>
                    <td className="px-5 py-3 text-center text-gray-400">{order.items?.length || 0}</td>
                    <td className="px-5 py-3 text-right text-white font-bold">EGP {(order.total || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_BADGE[order.status] || 'bg-zinc-700 text-gray-300'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => navigate(`/staff/orders/gamer/${order.id}`)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tournament Orders Table */}
      {tab === 'tournament' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Order ID</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Type</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Tournament</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-3">Items</th>
                  <th className="text-right text-gray-400 font-medium px-5 py-3">Total (EGP)</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Created</th>
                  <th className="text-center text-gray-400 font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingTournament ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-500">Loading...</td></tr>
                ) : filteredTournament.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-500">No tournament orders found</td></tr>
                ) : filteredTournament.map(order => (
                  <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-white font-mono text-xs">{order.id?.slice(0, 8)}...</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.tournament_type === 'shared'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.tournament_type || 'solo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-300 truncate max-w-48">{order.tournament_name || '--'}</td>
                    <td className="px-5 py-3 text-center text-gray-400">{order.items?.length || 0}</td>
                    <td className="px-5 py-3 text-right text-white font-bold">EGP {(order.grand_total || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_BADGE[order.fulfillment_status] || 'bg-zinc-700 text-gray-300'}`}>
                        {order.fulfillment_status?.replace(/_/g, ' ') || 'draft'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : '--'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => navigate(`/staff/orders/tournament/${order.id}`)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
