import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Trophy, DollarSign, Zap, Clock, Radar,
  ArrowUpRight, AlertTriangle, FileText,
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';
import StaffStatCard from '@/components/staff/StaffStatCard';
import StaffBadge from '@/components/staff/StaffBadge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(n) {
  return `EGP ${(n || 0).toLocaleString('en-EG')}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Quick Actions
// ---------------------------------------------------------------------------

const QUICK_ACTIONS = [
  { label: 'Review Pending Approvals', to: '/staff/approvals' },
  { label: 'View Revenue', to: '/staff/revenue' },
  { label: 'All Users', to: '/staff/users' },
  { label: 'Manage Tournaments', to: '/staff/tournaments' },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffDashboard() {
  const navigate = useNavigate();

  // Guard: require staff token
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: () => apiCall('/staff/dashboard'),
    staleTime: 30_000,
    retry: 1,
  });

  // Derived values
  const stats              = dashboard?.stats || {};
  const recentActivity     = dashboard?.recent_activity || dashboard?.audit_log || [];
  const pendingApprovals   = (dashboard?.pending_approvals ?? 0) +
                             (stats.pending_providers ?? 0) +
                             (stats.pending_services ?? 0);
  const unpaidBills        = dashboard?.unpaid_bills ?? 0;
  const totalUsers         = stats.total_users ?? 0;
  const liveTournaments    = stats.live_tournaments ?? stats.active_tournaments ?? 0;
  const revenueMTD         = stats.revenue_mtd ?? dashboard?.revenue_mtd ?? 0;
  const activeSponsorships = stats.active_sponsorships ?? 0;
  const publishedTourneys  = stats.published_tournaments ?? stats.total_tournaments ?? 0;

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">Staff Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Platform overview and recent activity</p>
        </div>

        {/* Alerts */}
        {(pendingApprovals > 0 || unpaidBills > 0) && (
          <div className="mb-6 flex flex-wrap gap-3">
            {pendingApprovals > 0 && (
              <Link
                to="/staff/approvals"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                {pendingApprovals} pending approval{pendingApprovals !== 1 ? 's' : ''}
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
            {unpaidBills > 0 && (
              <Link
                to="/staff/billing"
                className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition"
              >
                <FileText className="w-4 h-4" />
                {unpaidBills} unpaid bill{unpaidBills !== 1 ? 's' : ''}
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
          </div>
        )}

        {/* Stat cards — 6 across */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StaffStatCard
            icon={Users}
            label="Total Users"
            value={totalUsers.toLocaleString()}
            accent="red"
          />
          <StaffStatCard
            icon={Trophy}
            label="Live Tournaments"
            value={liveTournaments}
            accent="violet"
          />
          <StaffStatCard
            icon={DollarSign}
            label="Revenue MTD"
            value={formatEGP(revenueMTD)}
            sub="15% platform fees"
            accent="green"
          />
          <StaffStatCard
            icon={Clock}
            label="Pending Approvals"
            value={pendingApprovals}
            accent="amber"
          />
          <StaffStatCard
            icon={Radar}
            label="Active Sponsorships"
            value={activeSponsorships}
            accent="violet"
          />
          <StaffStatCard
            icon={Zap}
            label="Published Tournaments"
            value={publishedTourneys}
            accent="green"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Activity feed — 2/3 */}
          <div className="lg:col-span-2 bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
              <h2 className="text-sm font-semibold text-zinc-100">Recent Activity</h2>
              <Link
                to="/staff/audit"
                className="text-xs font-medium text-red-500 hover:text-red-400"
              >
                View audit trail
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-600">
                No recent activity yet
              </div>
            ) : (
              <ul className="divide-y divide-[#1e1e1e]">
                {recentActivity.slice(0, 12).map((item, i) => (
                  <li key={item.id ?? i} className="flex items-start justify-between px-6 py-3.5 hover:bg-[#161616] transition">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {((item.user_email || item.action || '?').charAt(0)).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-200 font-medium truncate">
                          {item.action?.replace(/_/g, ' ') || 'Unknown action'}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {item.user_email || item.user_id?.slice(0, 8) || 'System'}
                          {item.target_type ? ` · ${item.target_type}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0 ml-4 mt-0.5">
                      {timeAgo(item.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick actions — 1/3 */}
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1e1e1e]">
              <h2 className="text-sm font-semibold text-zinc-100">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[#1e1e1e] text-sm text-zinc-300 hover:text-zinc-100 hover:bg-[#161616] hover:border-[#2a2a2a] transition-colors group"
                >
                  <span>{action.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-500 transition-colors" />
                </Link>
              ))}
            </div>

            {/* Platform health note */}
            <div className="mx-4 mb-4 mt-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-xs text-zinc-500">
                Platform fee:{' '}
                <span className="text-red-400 font-semibold">15%</span>
                {' '}on all transactions · Currency:{' '}
                <span className="text-zinc-300 font-semibold">EGP</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
