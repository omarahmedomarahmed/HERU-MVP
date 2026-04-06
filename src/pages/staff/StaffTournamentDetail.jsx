import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Trophy, Users, GitBranch, ShoppingCart,
  Calendar, MapPin, Globe, Save
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
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

const TABS = [
  { key: 'details', label: 'Details', icon: Trophy },
  { key: 'teams', label: 'Teams', icon: Users },
  { key: 'brackets', label: 'Brackets', icon: GitBranch },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
];

const STATUS_OPTIONS = ['draft', 'published', 'live', 'completed'];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffTournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [newStatus, setNewStatus] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-tournament', id],
    queryFn: () => apiCall('/tournaments/' + id),
    staleTime: 30_000,
  });

  const tournament = raw?.data || raw || {};

  React.useEffect(() => {
    if (tournament.status && !newStatus) setNewStatus(tournament.status);
  }, [tournament.status, newStatus]);

  const statusMutation = useMutation({
    mutationFn: (status) =>
      apiCall('/tournaments/' + id, { method: 'PUT', body: { status } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-tournament', id] }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading tournament...</p>
      </div>
    );
  }

  const teams = tournament.teams || [];
  const brackets = tournament.brackets || [];
  const coOrgs = tournament.co_organizers || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate('/staff/tournaments')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Tournaments
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center shrink-0 overflow-hidden">
              {tournament.tournament_image ? (
                <img src={tournament.tournament_image} alt="" className="w-14 h-14 object-cover" />
              ) : (
                <Trophy className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tournament.name || 'Untitled'}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{tournament.game || 'No game'} &middot; {tournament.format || 'TBD'}</p>
            </div>
          </div>
          <StatusBadge status={tournament.status} />
        </div>

        {/* Status changer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Status</h3>
          <div className="flex items-center gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => statusMutation.mutate(newStatus)}
              disabled={statusMutation.isPending || newStatus === tournament.status}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Save className="w-4 h-4" />
              {statusMutation.isPending ? 'Saving...' : 'Update Status'}
            </button>
          </div>
          {statusMutation.isError && <p className="text-xs text-red-500 mt-2">Failed to update status.</p>}
          {statusMutation.isSuccess && <p className="text-xs text-emerald-600 mt-2">Status updated.</p>}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Details */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={Calendar} label="Schedule" value={formatDate(tournament.schedule)} />
              <InfoRow icon={Globe} label="Type" value={tournament.tournament_type === 'shared' ? 'Shared' : 'Solo'} />
              <InfoRow icon={Users} label="Max Teams" value={tournament.max_teams || '-'} />
              <InfoRow icon={MapPin} label="Venue" value={tournament.is_offline ? (tournament.venue || 'Offline') : 'Online'} />
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CostCard label="Items Cost" value={formatEGP(tournament.total_cost)} />
              <CostCard label="Prizepool" value={formatEGP(tournament.prizepool_total)} />
              <CostCard label="Platform Fee (15%)" value={formatEGP(tournament.platform_fee)} />
            </div>
            {tournament.description && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{tournament.description}</p>
              </div>
            )}
            {coOrgs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Co-Organizers</h4>
                <div className="space-y-2">
                  {coOrgs.map((co, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2.5">
                      <span className="text-gray-700">{co.brand_name || co.organizer_id}</span>
                      <span className="text-gray-500">{co.commitment_percent || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Teams */}
        {activeTab === 'teams' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {teams.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-gray-400">No teams registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teams.map((teamId, idx) => (
                      <tr key={teamId} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-3 text-sm font-mono text-red-600">{teamId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Brackets */}
        {activeTab === 'brackets' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {brackets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No bracket data available.</p>
            ) : (
              <div className="space-y-3">
                {brackets.map((match, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{match.team_a || 'TBD'}</span>
                      <span className="text-gray-400 mx-2">vs</span>
                      <span className="font-medium">{match.team_b || 'TBD'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.score_a != null ? `${match.score_a} - ${match.score_b}` : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && <OrdersTab tournamentId={id} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-gray-100 p-2 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function CostCard({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function OrdersTab({ tournamentId }) {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['staff-tournament-orders', tournamentId],
    queryFn: () => apiCall('/tournament-orders?tournament_id=' + tournamentId),
    staleTime: 30_000,
  });

  const orders = Array.isArray(raw) ? raw : raw.data || [];

  if (isLoading) return <div className="py-10 text-center text-sm text-gray-400">Loading orders...</div>;
  if (orders.length === 0) return <div className="py-10 text-center text-sm text-gray-400">No orders for this tournament.</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-mono text-red-600">{o.id?.slice(0, 8)}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                  EGP {(o.grand_total || 0).toLocaleString('en-EG')}
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-gray-100 text-gray-600">
                    {(o.fulfillment_status || 'unknown').replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
