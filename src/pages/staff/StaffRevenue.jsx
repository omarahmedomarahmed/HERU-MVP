import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign, TrendingUp, Trophy, FileText,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Staff, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function StatCard({ icon: Icon, label, value, sub, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-500/20 text-blue-400',
    green:  'bg-green-500/20 text-green-400',
    amber:  'bg-amber-500/20 text-amber-400',
    violet: 'bg-purple-500/20 text-purple-400',
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function MonthlyChart({ months }) {
  if (!months || months.length === 0) {
    return <p className="text-sm text-gray-500 py-8 text-center">No monthly data available</p>;
  }

  const max = Math.max(...months.map(m => m.amount), 1);

  return (
    <div className="space-y-3">
      {months.map((m, i) => {
        const prev = i > 0 ? months[i - 1].amount : null;
        const change = prev != null && prev > 0 ? ((m.amount - prev) / prev) * 100 : null;

        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 text-xs font-medium text-gray-500 shrink-0">{m.label}</span>
            <div className="flex-1 h-7 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${Math.max((m.amount / max) * 100, 4)}%` }}
              >
                {(m.amount / max) * 100 > 20 && (
                  <span className="text-[10px] font-semibold text-white">{formatEGP(m.amount)}</span>
                )}
              </div>
            </div>
            <span className="text-xs font-semibold text-gray-300 w-28 text-right">
              {formatEGP(m.amount)}
            </span>
            {change !== null && (
              <span className={`w-14 text-right text-[10px] font-medium flex items-center justify-end gap-0.5 ${
                change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {change >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(change).toFixed(0)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function StaffRevenue() {
  // Fetch revenue data
  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['staff-revenue-full'],
    queryFn: () => Staff.revenue(),
    staleTime: 60_000,
  });

  // Fetch bills for tournament breakdown
  const { data: rawBills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['staff-revenue-bills'],
    queryFn: () => apiCall('/bills'),
    staleTime: 60_000,
  });

  const bills = Array.isArray(rawBills) ? rawBills : rawBills.data || [];

  // Derived stats
  const totalPlatformFees = revenueData?.total_platform_fees
    ?? bills.reduce((sum, b) => sum + (b.platform_fee || 0), 0);

  const paidFees = bills
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.platform_fee || 0), 0);

  const pendingFees = totalPlatformFees - paidFees;

  const monthlyRevenue = revenueData?.monthly || [];

  const totalTournaments = revenueData?.total_tournaments
    ?? new Set(bills.filter(b => b.tournament_id).map(b => b.tournament_id)).size;

  // Tournament breakdown: aggregate platform fees by tournament
  const tournamentBreakdown = useMemo(() => {
    const map = {};
    bills.forEach((b) => {
      if (!b.tournament_id && !b.tournament_name) return;
      const key = b.tournament_id || b.tournament_name;
      if (!map[key]) {
        map[key] = {
          name: b.tournament_name || 'Unknown Tournament',
          tournament_id: b.tournament_id,
          total_fee: 0,
          bill_count: 0,
          paid: 0,
        };
      }
      map[key].total_fee += b.platform_fee || 0;
      map[key].bill_count += 1;
      if (b.payment_status === 'paid') {
        map[key].paid += b.platform_fee || 0;
      }
    });

    return Object.values(map).sort((a, b) => b.total_fee - a.total_fee);
  }, [bills]);

  const isLoading = revLoading || billsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-500 text-sm">Loading revenue data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Platform <span className="text-blue-400">Revenue</span>
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">HERU 15% platform fee earnings</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Platform Fees"
          value={formatEGP(totalPlatformFees)}
          sub="15% of all tournament costs"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Collected"
          value={formatEGP(paidFees)}
          sub="From paid invoices"
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Pending Collection"
          value={formatEGP(pendingFees)}
          sub="Awaiting payment"
          color="amber"
        />
        <StatCard
          icon={Trophy}
          label="Tournaments"
          value={totalTournaments}
          sub="With platform fees"
          color="violet"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly revenue chart - 2 cols */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Monthly Revenue</h2>
            </div>
          </div>
          <div className="px-6 py-5">
            <MonthlyChart months={monthlyRevenue} />
          </div>
        </div>

        {/* Tournament breakdown - 1 col */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-white">By Tournament</h2>
            </div>
            <span className="text-xs text-gray-500">{tournamentBreakdown.length} tournaments</span>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {tournamentBreakdown.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500 text-center">No tournament fees yet</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {tournamentBreakdown.map((t, i) => (
                  <li key={i} className="px-5 py-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{t.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t.bill_count} bill{t.bill_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-semibold text-white">{formatEGP(t.total_fee)}</p>
                        {t.paid < t.total_fee ? (
                          <p className="text-[10px] text-amber-400 mt-0.5">
                            {formatEGP(t.paid)} collected
                          </p>
                        ) : (
                          <p className="text-[10px] text-green-400 mt-0.5">Fully collected</p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
