import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Trophy, DollarSign, Zap, Clock, AlertTriangle,
  FileText, ArrowUpRight, TrendingUp, UserPlus
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue: 'bg-red-50 text-red-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge used in tables
// ---------------------------------------------------------------------------

function StatusBadge({ status }) {
  const map = {
    draft: 'bg-gray-100 text-gray-600',
    published: 'bg-red-50 text-red-700',
    live: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-gray-100 text-gray-500',
    pending: 'bg-amber-50 text-amber-700',
    unpaid: 'bg-red-50 text-red-600',
    paid: 'bg-emerald-50 text-emerald-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Revenue mini-chart (simple bar list)
// ---------------------------------------------------------------------------

function RevenueChart({ months }) {
  if (!months || months.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">No revenue data yet</p>;
  }

  const max = Math.max(...months.map(m => m.amount), 1);

  return (
    <div className="space-y-3">
      {months.map((m, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-20 text-xs font-medium text-gray-500 shrink-0">{m.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${Math.max((m.amount / max) * 100, 2)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-700 w-28 text-right">
            {formatEGP(m.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

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

  // ---------- Data fetching ----------

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: () => apiCall('/staff/dashboard'),
    staleTime: 30_000,
    retry: 1,
  });

  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['staff-revenue'],
    queryFn: () => apiCall('/staff/revenue'),
    staleTime: 60_000,
    retry: 1,
  });

  // Derived values with safe fallbacks
  const stats = dashboard?.stats || {};
  const recentTournaments = dashboard?.recent_tournaments || [];
  const recentUsers = dashboard?.recent_users || [];
  const pendingApprovals = dashboard?.pending_approvals ?? 0;
  const unpaidBills = dashboard?.unpaid_bills ?? 0;
  const monthlyRevenue = revenueData?.monthly || [];
  const totalRevenue = revenueData?.total_platform_fees ?? stats.total_revenue ?? 0;
  const activeTournaments = stats.active_tournaments ?? 0;
  const totalUsers = stats.total_users ?? 0;
  const totalTournaments = stats.total_tournaments ?? 0;

  // ---------- Loading state ----------

  if (dashLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  // ---------- Render ----------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and recent activity</p>
        </div>

        {/* Alerts */}
        {(pendingApprovals > 0 || unpaidBills > 0) && (
          <div className="mb-6 flex flex-wrap gap-3">
            {pendingApprovals > 0 && (
              <Link
                to="/staff/approvals"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition"
              >
                <AlertTriangle className="w-4 h-4" />
                {pendingApprovals} pending approval{pendingApprovals !== 1 ? 's' : ''}
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
            {unpaidBills > 0 && (
              <Link
                to="/staff/billing"
                className="inline-flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-100 transition"
              >
                <FileText className="w-4 h-4" />
                {unpaidBills} unpaid bill{unpaidBills !== 1 ? 's' : ''}
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            )}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={totalUsers} color="blue" />
          <StatCard icon={Trophy} label="Total Tournaments" value={totalTournaments} color="violet" />
          <StatCard
            icon={DollarSign}
            label="Platform Revenue"
            value={formatEGP(totalRevenue)}
            sub="15% platform fees"
            color="green"
          />
          <StatCard
            icon={Zap}
            label="Active Tournaments"
            value={activeTournaments}
            sub="Live + Published"
            color="amber"
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart - takes 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-semibold text-gray-900">Monthly Revenue</h2>
              </div>
              <Link
                to="/staff/revenue"
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                View full report
              </Link>
            </div>
            <div className="px-6 py-5">
              {revLoading ? (
                <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>
              ) : (
                <RevenueChart months={monthlyRevenue} />
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Recent tournaments */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-violet-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Recent Tournaments</h2>
                </div>
                <Link
                  to="/staff/tournaments"
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {recentTournaments.length === 0 && (
                  <li className="px-5 py-4 text-sm text-gray-400 text-center">No tournaments yet</li>
                )}
                {recentTournaments.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/staff/tournaments/${t.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                        <p className="text-xs text-gray-400">{t.game} {t.created_at ? `- ${timeAgo(t.created_at)}` : ''}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent registrations */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Recent Registrations</h2>
                </div>
                <Link
                  to="/staff/users"
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  View all
                </Link>
              </div>
              <ul className="divide-y divide-gray-100">
                {recentUsers.length === 0 && (
                  <li className="px-5 py-4 text-sm text-gray-400 text-center">No users yet</li>
                )}
                {recentUsers.slice(0, 5).map((u) => (
                  <li key={u.id}>
                    <Link
                      to={`/staff/users/${u.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {u.full_name || u.email}
                          </p>
                          <p className="text-xs text-gray-400">{u.role} {u.created_at ? `- ${timeAgo(u.created_at)}` : ''}</p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
