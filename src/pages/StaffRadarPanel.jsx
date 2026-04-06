import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Radar, Shield, DollarSign, Users, Filter,
} from 'lucide-react';
import { SponsorshipRadar } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const STATUS_COLORS = {
  open:         'bg-green-500/20 text-green-400 border border-green-500/30',
  in_progress:  'bg-red-500/20 text-red-400 border border-red-500/30',
  fully_funded: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  closed:       'bg-zinc-700 text-zinc-400 border border-zinc-600',
};

function FundingBar({ percent }) {
  const pct = Math.min(100, percent || 0);
  const color = pct >= 100 ? 'bg-yellow-400' : pct >= 60 ? 'bg-green-400' : pct >= 30 ? 'bg-red-400' : 'bg-red-400';
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-400">Funded</span>
        <span className="text-white font-medium">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function StaffRadarPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: radarListings = [], isLoading } = useQuery({
    queryKey: ['staff-radar-listings'],
    queryFn: () => SponsorshipRadar.list(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => SponsorshipRadar.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-radar-listings'] });
    },
  });

  const filtered = useMemo(() => {
    return radarListings.filter(r => {
      const matchSearch = !search ||
        r.tournament_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.main_organizer_brand?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [radarListings, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { open: 0, in_progress: 0, fully_funded: 0, closed: 0 };
    radarListings.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    return counts;
  }, [radarListings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Sponsorship <span className="text-red-400">Radar</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">{radarListings.length} total listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-gray-500 text-xs capitalize mt-1">{status.replace(/_/g, ' ')}</p>
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
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {['all', 'open', 'in_progress', 'fully_funded', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === s ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                {s === 'all' ? 'All' : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading radar listings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Radar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-500">No radar listings found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div
              key={r.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4 hover:border-zinc-700 transition-colors cursor-pointer"
              onClick={() => setSelected(r)}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {r.main_organizer_brand?.logo ? (
                    <img src={r.main_organizer_brand.logo} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-zinc-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium text-sm">{r.tournament_name}</p>
                    <p className="text-gray-500 text-xs">{r.main_organizer_brand?.name || 'Unknown'}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[r.status] || 'bg-zinc-700 text-gray-400'}`}>
                  {r.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Funding bar */}
              <FundingBar percent={r.funding_percent} />

              {/* Info */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  EGP {(r.total_cost || 0).toLocaleString()}
                </span>
                <span className="text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {r.co_organizers?.length || 0} co-organizers
                </span>
              </div>

              {/* Co-organizers preview */}
              {r.co_organizers?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {r.co_organizers.map((co, i) => (
                    <span key={i} className="text-xs bg-zinc-800 text-gray-300 px-2 py-1 rounded">
                      {co.brand_name} ({co.committed_percent}%)
                    </span>
                  ))}
                </div>
              )}

              {/* Staff status change */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <span className="text-xs text-gray-500">Change status:</span>
                <select
                  value={r.status}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    e.stopPropagation();
                    updateStatusMutation.mutate({ id: r.id, status: e.target.value });
                  }}
                  className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 focus:outline-none focus:border-red-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="fully_funded">Fully Funded</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Radar className="w-5 h-5 text-red-400" />
                {selected.tournament_name}
              </h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Total Cost</p>
                <p className="text-green-400 font-bold text-sm">EGP {(selected.total_cost || 0).toLocaleString()}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Still Needed</p>
                <p className="text-red-400 font-bold text-sm">EGP {(selected.amount_still_needed || 0).toLocaleString()}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Prize Pool</p>
                <p className="text-yellow-400 font-bold text-sm">EGP {(selected.prizepool_amount || 0).toLocaleString()}</p>
              </div>
            </div>

            <FundingBar percent={selected.funding_percent} />

            <div className="bg-zinc-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-2">Main Organizer</p>
              <div className="flex items-center gap-3">
                {selected.main_organizer_brand?.logo ? (
                  <img src={selected.main_organizer_brand.logo} className="w-8 h-8 rounded-lg object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center"><Shield className="w-4 h-4 text-zinc-500" /></div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">{selected.main_organizer_brand?.name}</p>
                  <p className="text-gray-500 text-xs">{selected.main_organizer_percent || 33}% committed</p>
                </div>
              </div>
            </div>

            {selected.co_organizers?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Co-Organizers</p>
                <div className="space-y-2">
                  {selected.co_organizers.map((co, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-zinc-700 flex items-center justify-center overflow-hidden">
                          {co.brand_logo ? <img src={co.brand_logo} className="w-full h-full object-cover" alt="" /> : <Shield className="w-3 h-3 text-zinc-500" />}
                        </div>
                        <div>
                          <p className="text-white text-sm">{co.brand_name}</p>
                          <p className="text-gray-500 text-xs">{co.committed_percent}% - EGP {(co.committed_amount || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        co.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {co.payment_status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.description && (
              <div className="bg-zinc-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-300 text-sm">{selected.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
