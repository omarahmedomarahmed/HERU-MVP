import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Trophy, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function StatusBadge({ status }) {
  const map = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-red-50 text-red-700',
    live: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || 'unknown'}
    </span>
  );
}

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffTournaments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Guard
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Fetch
  const { data: rawTournaments = [], isLoading } = useQuery({
    queryKey: ['staff-tournaments-list'],
    queryFn: () => apiCall('/tournaments?limit=200'),
    staleTime: 30_000,
  });

  // Normalize: API may return { data: [...] } or plain array
  const tournaments = Array.isArray(rawTournaments)
    ? rawTournaments
    : rawTournaments.data || [];

  // Filter + search
  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (t.name || '').toLowerCase().includes(q);
        const gameMatch = (t.game || '').toLowerCase().includes(q);
        const orgMatch = (t.organizer_brand?.brand_name || '').toLowerCase().includes(q);
        if (!nameMatch && !gameMatch && !orgMatch) return false;
      }
      return true;
    });
  }, [tournaments, statusFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when filters change
  React.useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
            <p className="text-sm text-gray-500 mt-0.5">{tournaments.length} total</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, game, or organizer..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading tournaments...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {search || statusFilter !== 'all' ? 'No tournaments match your filters.' : 'No tournaments found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Game</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Teams</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Cost</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/staff/tournaments/${t.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                            {t.tournament_image ? (
                              <img src={t.tournament_image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <Trophy className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">{t.game || '-'}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[160px]">
                        {t.organizer_brand?.brand_name || '-'}
                      </td>
                      <td className="px-6 py-3.5"><StatusBadge status={t.status} /></td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 text-center">
                        {t.teams?.length || 0}/{t.max_teams || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                        {t.total_cost ? formatEGP(t.total_cost) : '-'}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-500">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-2 text-xs font-medium text-gray-700">{safePage} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
    </div>
  );
}
