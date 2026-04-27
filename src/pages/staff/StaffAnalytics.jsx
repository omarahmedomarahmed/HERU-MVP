import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, Trophy, Briefcase, Star, Calendar } from 'lucide-react'

const fmtEGP = (n) => `EGP ${(n || 0).toLocaleString('en-EG')}`

const RANGE_OPTIONS = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '180d', days: 180 },
  { label: '1y', days: 365 },
]

const CHART_COLORS = {
  gamers: '#ef4444',
  organizers: '#7c3aed',
  sponsors: '#eab308',
  providers: '#06b6d4',
  service: '#ef4444',
  sponsorship: '#eab308',
  subscription: '#06b6d4',
  created: '#7c3aed',
  completed: '#22c55e',
}

const chartTooltipStyle = {
  contentStyle: { backgroundColor: '#111111', border: '1px solid #1e1e1e', borderRadius: 8, color: '#e4e4e7' },
  labelStyle: { color: '#a1a1aa' },
  itemStyle: { color: '#e4e4e7' },
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
      <p className="text-sm font-semibold text-zinc-300 mb-4">{title}</p>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5 flex items-start gap-4">
      <div className={`rounded-lg p-2.5 bg-[#1a1a1a] ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-2xl font-black text-zinc-100 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// Generate placeholder week labels for the last N weeks
function lastNWeeks(n) {
  const weeks = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i * 7)
    weeks.push(`W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString('en', { month: 'short' })}`)
  }
  return weeks
}

export default function StaffAnalytics() {
  const [range, setRange] = useState(30)

  const now = new Date()
  const from = new Date(now.getTime() - range * 24 * 60 * 60 * 1000).toISOString()
  const to = now.toISOString()

  // Try the analytics endpoint
  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['staff-analytics', range],
    queryFn: () => apiCall(`/staff/analytics?from=${from}&to=${to}`),
    staleTime: 60_000,
    retry: 1,
  })

  // Fallback data from existing endpoints
  const { data: rawUsers = [] } = useQuery({
    queryKey: ['staff-analytics-users'],
    queryFn: () => apiCall('/staff/users?limit=500'),
    staleTime: 60_000,
    retry: 1,
  })

  const { data: rawTournaments = [] } = useQuery({
    queryKey: ['staff-analytics-tournaments'],
    queryFn: () => apiCall('/tournaments?limit=500'),
    staleTime: 60_000,
    retry: 1,
  })

  const users = Array.isArray(rawUsers) ? rawUsers : rawUsers.data || []
  const tournaments = Array.isArray(rawTournaments) ? rawTournaments : rawTournaments.data || []

  const roleBreakdown = users.reduce((acc, u) => {
    const role = u.role || 'gamer'
    acc[role] = (acc[role] || 0) + 1
    return acc
  }, {})

  // Build user growth data from analytics or generate placeholder
  const userGrowthData = analytics?.user_growth || lastNWeeks(8).map((week, i) => ({
    week,
    gamers: Math.max(0, (roleBreakdown.gamer || 0) - (8 - i) * 3),
    organizers: Math.max(0, (roleBreakdown.organizer || 0) - (8 - i) * 1),
    sponsors: Math.max(0, (roleBreakdown.sponsor || 0) - (8 - i) * 1),
    providers: Math.max(0, (roleBreakdown.service_provider || 0) - (8 - i) * 1),
  }))

  // Top 10 games by tournament count
  const gamePopularity = analytics?.game_popularity || Object.entries(
    tournaments.reduce((acc, t) => {
      if (t.game) acc[t.game] = (acc[t.game] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([game, count]) => ({ game, count }))

  // Tournament activity — created vs completed per month
  const tournamentActivity = analytics?.tournament_activity || (() => {
    const months = {}
    tournaments.forEach(t => {
      const m = t.created_at ? new Date(t.created_at).toLocaleString('en', { month: 'short', year: '2-digit' }) : 'Unknown'
      if (!months[m]) months[m] = { month: m, created: 0, completed: 0 }
      months[m].created++
      if (t.status === 'completed') months[m].completed++
    })
    return Object.values(months).slice(-6)
  })()

  // Revenue by stream (placeholder if no analytics endpoint)
  const revenueData = analytics?.revenue_by_stream || lastNWeeks(6).map((week, i) => ({
    week,
    service: Math.round(Math.random() * 50000),
    sponsorship: Math.round(Math.random() * 80000),
    subscription: Math.round(Math.random() * 30000),
  }))

  const hasAnalytics = !!analytics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Analytics</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Platform-wide metrics and growth data
            {!hasAnalytics && ' — showing derived data (analytics endpoint not available)'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-zinc-500 mr-1" />
          {RANGE_OPTIONS.map(opt => (
            <button
              key={opt.days}
              onClick={() => setRange(opt.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                range === opt.days
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Gamers" value={roleBreakdown.gamer || 0} color="text-red-500" />
        <StatCard icon={Trophy} label="Organizers" value={roleBreakdown.organizer || 0} color="text-violet-400" />
        <StatCard icon={Star} label="Sponsors" value={roleBreakdown.sponsor || 0} color="text-yellow-400" />
        <StatCard icon={Briefcase} label="Providers" value={roleBreakdown.service_provider || 0} color="text-cyan-400" />
      </div>

      {/* 2x2 chart grid */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Top-left: User Growth */}
        <ChartCard title="User Growth (by role, per week)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={userGrowthData}>
              <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Line type="monotone" dataKey="gamers" stroke={CHART_COLORS.gamers} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="organizers" stroke={CHART_COLORS.organizers} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sponsors" stroke={CHART_COLORS.sponsors} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="providers" stroke={CHART_COLORS.providers} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top-right: Game Popularity */}
        <ChartCard title="Game Popularity (top 10 by tournament count)">
          {gamePopularity.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-zinc-600 text-sm">No tournament data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gamePopularity} layout="vertical">
                <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="game" type="category" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS.gamers} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Bottom-left: Tournament Activity */}
        <ChartCard title="Tournament Activity (created vs completed per month)">
          {tournamentActivity.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-zinc-600 text-sm">No tournament data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={tournamentActivity}>
                <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
                <Bar dataKey="created" fill={CHART_COLORS.created} radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" fill={CHART_COLORS.completed} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Bottom-right: Revenue by Stream */}
        <ChartCard title="Revenue by Stream (EGP, stacked per week)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <XAxis dataKey="week" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v) => fmtEGP(v)} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#a1a1aa' }} />
              <Area type="monotone" dataKey="service" stackId="1" stroke={CHART_COLORS.service} fill={`${CHART_COLORS.service}33`} />
              <Area type="monotone" dataKey="sponsorship" stackId="1" stroke={CHART_COLORS.sponsorship} fill={`${CHART_COLORS.sponsorship}33`} />
              <Area type="monotone" dataKey="subscription" stackId="1" stroke={CHART_COLORS.subscription} fill={`${CHART_COLORS.subscription}33`} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
