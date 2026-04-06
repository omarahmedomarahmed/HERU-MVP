import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Filter, Trophy, DollarSign, Eye, Shield,
} from 'lucide-react';
import { TournamentOrder, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const FULFILLMENT_BADGE = {
  draft:           'bg-zinc-700 text-zinc-300',
  pending_payment: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  in_fulfillment:  'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  fulfilled:       'bg-green-500/20 text-green-400 border border-green-500/30',
  cancelled:       'bg-red-500/20 text-red-400 border border-red-500/30',
};

export default function StaffTournamentOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: tournamentOrders = [], isLoading } = useQuery({
    queryKey: ['staff-all-tournament-orders'],
    queryFn: () => TournamentOrder.list(),
  });

  const filtered = useMemo(() => {
    return tournamentOrders.filter(o => {
      const matchSearch = !search ||
        o.tournament_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.main_organizer_brand?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.fulfillment_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tournamentOrders, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const c = {};
    tournamentOrders.forEach(o => {
      const s = o.fulfillment_status || 'draft';
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [tournamentOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Tournament <span className="text-blue-400">Orders</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">{tournamentOrders.length} total orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['pending_payment', 'in_fulfillment', 'fulfilled', 'draft'].map(s => (
          <div key={s} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{statusCounts[s] || 0}</p>
            <p className="text-gray-500 text-xs capitalize mt-1">{s.replace(/_/g, ' ')}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by tournament or organizer..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {['all', 'draft', 'pending_payment', 'in_fulfillment', 'fulfilled', 'cancelled'].map(s => (
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

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-gray-400 font-medium px-5 py-3">Order ID</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Tournament</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Type</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Main Organizer</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Subtotal (EGP)</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Platform Fee (EGP)</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Grand Total (EGP)</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Fulfillment</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : filtered.map(order => (
                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-white font-mono text-xs">{order.id?.slice(0, 8)}...</td>
                  <td className="px-5 py-3 text-gray-300 truncate max-w-40">{order.tournament_name || '--'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.tournament_type === 'shared' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {order.tournament_type || 'solo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-400 truncate max-w-32">{order.main_organizer_brand || '--'}</td>
                  <td className="px-5 py-3 text-right text-gray-300">EGP {(order.subtotal_items || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-blue-400">EGP {(order.platform_fee || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-white font-bold">EGP {(order.grand_total || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${FULFILLMENT_BADGE[order.fulfillment_status] || 'bg-zinc-700 text-gray-300'}`}>
                      {order.fulfillment_status?.replace(/_/g, ' ') || 'draft'}
                    </span>
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
    </div>
  );
}
