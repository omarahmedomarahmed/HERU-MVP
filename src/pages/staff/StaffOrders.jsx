import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import {
  ShoppingCart, Trophy, Search, ChevronLeft, ChevronRight, Inbox,
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

const PAGE_SIZE = 15;

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gamer');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  // Fetch gamer orders
  const { data: rawGamerOrders, isLoading: loadingGamer } = useQuery({
    queryKey: ['staff-gamer-orders'],
    queryFn: () => apiCall('/orders'),
    staleTime: 30_000,
    retry: 1,
  });

  // Fetch tournament orders
  const { data: rawTournamentOrders, isLoading: loadingTournament } = useQuery({
    queryKey: ['staff-tournament-orders'],
    queryFn: () => apiCall('/tournament-orders'),
    staleTime: 30_000,
    retry: 1,
  });

  const gamerOrders = useMemo(() => {
    if (Array.isArray(rawGamerOrders)) return rawGamerOrders;
    return rawGamerOrders?.data || [];
  }, [rawGamerOrders]);

  const tournamentOrders = useMemo(() => {
    if (Array.isArray(rawTournamentOrders)) return rawTournamentOrders;
    return rawTournamentOrders?.data || [];
  }, [rawTournamentOrders]);

  // Filter by search
  const filteredGamer = useMemo(() => {
    if (!search) return gamerOrders;
    const q = search.toLowerCase();
    return gamerOrders.filter((o) => {
      const idMatch = (o.id || '').toLowerCase().includes(q);
      const nameMatch = (o.gamer_name || o.gamer_email || '').toLowerCase().includes(q);
      return idMatch || nameMatch;
    });
  }, [gamerOrders, search]);

  const filteredTournament = useMemo(() => {
    if (!search) return tournamentOrders;
    const q = search.toLowerCase();
    return tournamentOrders.filter((o) => {
      const idMatch = (o.id || '').toLowerCase().includes(q);
      const nameMatch = (o.tournament_name || '').toLowerCase().includes(q);
      const orgMatch = (o.main_organizer_brand || '').toLowerCase().includes(q);
      return idMatch || nameMatch || orgMatch;
    });
  }, [tournamentOrders, search]);

  const activeList = activeTab === 'gamer' ? filteredGamer : filteredTournament;
  const isLoading = activeTab === 'gamer' ? loadingGamer : loadingTournament;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = activeList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page on tab/search change
  React.useEffect(() => { setPage(1); }, [activeTab, search]);

  return (
    <StaffLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gamer marketplace orders and tournament fulfillment orders
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab('gamer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'gamer'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Gamer Orders
            <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 font-semibold ${
              activeTab === 'gamer' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {gamerOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tournament')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tournament'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Tournament Orders
            <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 font-semibold ${
              activeTab === 'tournament' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              {tournamentOrders.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-5 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'gamer' ? 'Search by Order ID or gamer...' : 'Search by Order ID, tournament, or organizer...'}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading orders...</div>
          ) : activeList.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {search ? 'No orders match your search.' : 'No orders found.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'gamer' ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gamer</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Items</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => navigate(`/staff/orders/${o.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-mono text-gray-700">
                            #{(o.id || '').slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[180px]">
                          {o.gamer_name || o.gamer_email || o.gamer_id?.slice(0, 8) || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 text-center">
                          {Array.isArray(o.items) ? o.items.length : 0}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                          {formatEGP(o.total)}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">
                          {formatDate(o.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tournament</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizer</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fulfillment</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => navigate(`/staff/orders/${o.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-mono text-gray-700">
                            #{(o.id || '').slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[200px]">
                          {o.tournament_name || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[160px]">
                          {o.main_organizer_brand || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                          {formatEGP(o.grand_total || o.total)}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={o.fulfillment_status || o.status} />
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">
                          {formatDate(o.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, activeList.length)} of {activeList.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-2 text-xs font-medium text-gray-700">{safePage} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
