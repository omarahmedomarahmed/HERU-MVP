import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Radar, Search, Filter, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, Users, X
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
    open: 'bg-emerald-50 text-emerald-700',
    in_progress: 'bg-amber-50 text-amber-700',
    fully_funded: 'bg-blue-50 text-blue-700',
    closed: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

function FundingBar({ percent }) {
  const p = Math.min(100, Math.max(0, percent || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${p}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-10 text-right">{Math.round(p)}%</span>
    </div>
  );
}

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'fully_funded', label: 'Fully Funded' },
  { value: 'closed', label: 'Closed' },
];

// ---------------------------------------------------------------------------
// Detail panel (inline expand)
// ---------------------------------------------------------------------------

function RadarDetail({ item, onClose }) {
  const coOrgs = item.co_organizers || [];

  return (
    <tr>
      <td colSpan={7} className="px-6 py-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{item.tournament_name} - Funding Breakdown</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total Cost</p>
            <p className="text-lg font-bold text-gray-900">{formatEGP(item.total_cost)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Main Organizer Contribution</p>
            <p className="text-lg font-bold text-gray-900">{formatEGP(item.main_organizer_contribution)}</p>
            <p className="text-xs text-gray-400 mt-1">{item.main_organizer_percent || 33}% commitment</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Amount Still Needed</p>
            <p className="text-lg font-bold text-gray-900">{formatEGP(item.amount_still_needed)}</p>
          </div>
        </div>

        {/* Co-organizers */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Co-Organizers ({coOrgs.length} / {item.max_co_organizers || 2})
          </h4>
          {coOrgs.length === 0 ? (
            <p className="text-sm text-gray-400">No co-organizers yet</p>
          ) : (
            <div className="space-y-2">
              {coOrgs.map((co, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {(co.brand_name || co.organizer_brand || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{co.brand_name || co.organizer_brand || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">
                        {co.commitment_percent || 0}% - {(co.commitment_percent || 0) >= 66 ? 'Sponsor' : 'Co-Organizer'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatEGP(co.amount)}</p>
                    <p className="text-xs text-gray-400">
                      {co.access_granted ? (
                        <span className="text-emerald-600">Access granted</span>
                      ) : (
                        <span className="text-amber-600">Pending payment</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main organizer info */}
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <span>Main organizer:</span>
          <span className="font-medium text-gray-600">
            {item.main_organizer_brand?.brand_name || 'Unknown'}
          </span>
          {item.prizepool_amount > 0 && (
            <>
              <span className="mx-1">|</span>
              <span>Prizepool: {formatEGP(item.prizepool_amount)}</span>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffRadarPanel() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
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

  // Fetch
  const { data: rawRadar = [], isLoading } = useQuery({
    queryKey: ['staff-radar-list'],
    queryFn: () => apiCall('/radar'),
    staleTime: 30_000,
  });

  const radarItems = Array.isArray(rawRadar) ? rawRadar : rawRadar.data || [];

  // Filter + search
  const filtered = useMemo(() => {
    return radarItems.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (r.tournament_name || '').toLowerCase().includes(q);
        const orgMatch = (r.main_organizer_brand?.brand_name || '').toLowerCase().includes(q);
        if (!nameMatch && !orgMatch) return false;
      }
      return true;
    });
  }, [radarItems, statusFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sponsorship Radar</h1>
            <p className="text-sm text-gray-500 mt-0.5">{radarItems.length} total listings</p>
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
              placeholder="Search by tournament or organizer..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading radar listings...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {search || statusFilter !== 'all' ? 'No listings match your filters.' : 'No radar listings found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tournament</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total Cost</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Funded</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Co-Orgs</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((r) => (
                    <React.Fragment key={r.id}>
                      <tr
                        onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                              <Radar className="w-4 h-4 text-violet-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {r.tournament_name || 'Untitled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[150px]">
                          {r.main_organizer_brand?.brand_name || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                          {formatEGP(r.total_cost)}
                        </td>
                        <td className="px-6 py-3.5">
                          <FundingBar percent={r.funding_percent} />
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-3.5 h-3.5 text-gray-400" />
                            <span>{(r.co_organizers || []).length}/{r.max_co_organizers || 2}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          {expandedId === r.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                      </tr>
                      {expandedId === r.id && (
                        <RadarDetail item={r} onClose={() => setExpandedId(null)} />
                      )}
                    </React.Fragment>
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
