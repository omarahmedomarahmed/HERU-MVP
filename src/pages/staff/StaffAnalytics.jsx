import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import { Users, Trophy, TrendingUp, BarChart3, Briefcase, Star } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'text-blue-600', bg = 'bg-blue-50' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function StaffAnalytics() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: stats } = useQuery({
    queryKey: ['staff-analytics-stats'],
    queryFn: () => apiCall('/staff/stats'),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: rawUsers = [] } = useQuery({
    queryKey: ['staff-analytics-users'],
    queryFn: () => apiCall('/staff/users?limit=200'),
    staleTime: 60_000,
    retry: 1,
  });

  const { data: rawTournaments = [] } = useQuery({
    queryKey: ['staff-analytics-tournaments'],
    queryFn: () => apiCall('/tournaments?limit=200'),
    staleTime: 60_000,
    retry: 1,
  });

  const users = Array.isArray(rawUsers) ? rawUsers : rawUsers.data || [];
  const tournaments = Array.isArray(rawTournaments) ? rawTournaments : rawTournaments.data || [];

  const roleBreakdown = users.reduce((acc, u) => {
    const role = u.role || 'gamer';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const tournamentsByStatus = tournaments.reduce((acc, t) => {
    const s = t.status || 'draft';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const topGames = Object.entries(
    tournaments.reduce((acc, t) => { if (t.game) acc[t.game] = (acc[t.game] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <StaffLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide metrics and growth data.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}    label="Total Users"       value={users.length || stats?.total_users || 0}        color="text-blue-600"   bg="bg-blue-50" />
          <StatCard icon={Trophy}   label="Total Tournaments" value={tournaments.length || stats?.total_tournaments || 0} color="text-purple-600" bg="bg-purple-50" />
          <StatCard icon={Briefcase} label="Service Providers" value={roleBreakdown.service_provider || 0}           color="text-cyan-600"   bg="bg-cyan-50" />
          <StatCard icon={Star}     label="Sponsors"          value={roleBreakdown.sponsor || 0}                     color="text-amber-600"  bg="bg-amber-50" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Users by role */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" /> Users by Role
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {Object.entries(roleBreakdown).map(([role, count]) => {
                const pct = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                const colors = { gamer: 'bg-red-500', organizer: 'bg-purple-500', sponsor: 'bg-amber-500', service_provider: 'bg-cyan-500', admin: 'bg-gray-500' };
                return (
                  <div key={role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{role.replace('_', ' ')}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[role] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournaments by status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-gray-500" /> Tournaments by Status
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {Object.entries(tournamentsByStatus).map(([status, count]) => {
                const pct = tournaments.length > 0 ? Math.round((count / tournaments.length) * 100) : 0;
                const colors = { draft: 'bg-gray-400', published: 'bg-blue-500', live: 'bg-green-500', completed: 'bg-purple-500' };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{status}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${colors[status] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top games */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-500" /> Top Games by Tournaments
              </h2>
            </div>
            <div className="p-6 space-y-3">
              {topGames.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No tournament data</p>
              ) : topGames.map(([game, count], i) => (
                <div key={game} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm text-gray-900 flex-1">{game}</span>
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
