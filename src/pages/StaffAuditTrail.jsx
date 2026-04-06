import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Filter, ChevronDown, ChevronRight, Calendar, Terminal,
  LogIn, UserPlus, Trophy, Pencil, Zap, Users, Briefcase,
  CreditCard, CheckCircle, Shield, Activity, BarChart3,
  Target, Gamepad2, X, Clock, Globe, Mail, User,
} from 'lucide-react'
import { Tournament, Staff, Bill, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACTION_TYPES = [
  { key: 'login', label: 'Login', icon: LogIn, color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { key: 'registration', label: 'Registration', icon: UserPlus, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { key: 'tournament_created', label: 'Tournament Created', icon: Trophy, color: 'bg-violet-500/15 text-violet-400 border-violet-500/25' },
  { key: 'tournament_edited', label: 'Tournament Edited', icon: Pencil, color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  { key: 'tournament_live', label: 'Tournament Live', icon: Zap, color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { key: 'team_created', label: 'Team Created', icon: Users, color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  { key: 'team_joined', label: 'Team Joined', icon: Users, color: 'bg-teal-500/15 text-teal-400 border-teal-500/25' },
  { key: 'gig_accepted', label: 'Gig Accepted', icon: Briefcase, color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  { key: 'bill_created', label: 'Bill Created', icon: CreditCard, color: 'bg-pink-500/15 text-pink-400 border-pink-500/25' },
  { key: 'bill_paid', label: 'Bill Paid', icon: CheckCircle, color: 'bg-green-500/15 text-green-400 border-green-500/25' },
  { key: 'profile_updated', label: 'Profile Updated', icon: User, color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { key: 'co_organizer_committed', label: 'Co-Organizer Committed', icon: Shield, color: 'bg-red-500/15 text-red-400 border-red-500/25' },
  { key: 'brackets_updated', label: 'Brackets Updated', icon: BarChart3, color: 'bg-sky-500/15 text-sky-400 border-sky-500/25' },
  { key: 'score_updated', label: 'Score Updated', icon: Target, color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' },
]

const ACTION_MAP = Object.fromEntries(ACTION_TYPES.map(a => [a.key, a]))

// ---------------------------------------------------------------------------
// Generate synthetic audit entries from real data
// ---------------------------------------------------------------------------

function generateMockEntries(tournaments = [], users = [], bills = [], teams = []) {
  const entries = []
  const randomIP = () =>
    `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`

  // From tournaments
  tournaments.forEach((t) => {
    entries.push({
      id: `t-created-${t.id}`,
      timestamp: t.created_at,
      user_name: t.organizer_brand?.brand_name || 'Unknown Organizer',
      user_email: t.organizer_brand?.email || 'organizer@heru.gg',
      action: 'tournament_created',
      details: { tournament_name: t.name, game: t.game, format: t.format, tournament_id: t.id },
      ip: randomIP(),
    })

    if (t.status === 'live' || t.status === 'completed') {
      entries.push({
        id: `t-live-${t.id}`,
        timestamp: t.updated_at || t.created_at,
        user_name: t.organizer_brand?.brand_name || 'Unknown Organizer',
        user_email: t.organizer_brand?.email || 'organizer@heru.gg',
        action: 'tournament_live',
        details: { tournament_name: t.name, status: t.status, teams_count: t.teams?.length || 0 },
        ip: randomIP(),
      })
    }

    if (t.brackets?.length) {
      entries.push({
        id: `t-brackets-${t.id}`,
        timestamp: t.updated_at || t.created_at,
        user_name: t.organizer_brand?.brand_name || 'System',
        user_email: t.organizer_brand?.email || 'system@heru.gg',
        action: 'brackets_updated',
        details: { tournament_name: t.name, rounds: t.brackets.length },
        ip: randomIP(),
      })
    }

    // Score updates from bracket matches
    if (t.brackets?.length) {
      t.brackets.forEach((round, ri) => {
        const matches = round?.matches || round?.games || []
        matches.forEach((match, mi) => {
          if (match?.score_a != null || match?.score_b != null) {
            const ts = new Date(t.updated_at || t.created_at)
            ts.setMinutes(ts.getMinutes() + ri * 30 + mi * 5)
            entries.push({
              id: `score-${t.id}-${ri}-${mi}`,
              timestamp: ts.toISOString(),
              user_name: t.organizer_brand?.brand_name || 'Organizer',
              user_email: t.organizer_brand?.email || 'organizer@heru.gg',
              action: 'score_updated',
              details: {
                tournament_name: t.name,
                round: ri + 1,
                match: mi + 1,
                team_a: match.team_a_name || match.team_a,
                team_b: match.team_b_name || match.team_b,
                score: `${match.score_a ?? '?'} - ${match.score_b ?? '?'}`,
              },
              ip: randomIP(),
            })
          }
        })
      })
    }

    // Co-organizer commits
    if (t.co_organizers?.length) {
      t.co_organizers.forEach((co) => {
        entries.push({
          id: `co-commit-${t.id}-${co.organizer_id || co.id}`,
          timestamp: co.committed_at || t.updated_at || t.created_at,
          user_name: co.brand_name || 'Co-Organizer',
          user_email: co.email || 'co-org@heru.gg',
          action: 'co_organizer_committed',
          details: {
            tournament_name: t.name,
            percent: co.percent || co.commitment_percent,
            brand_name: co.brand_name,
          },
          ip: randomIP(),
        })
      })
    }
  })

  // From users
  users.forEach((u) => {
    entries.push({
      id: `reg-${u.id}`,
      timestamp: u.created_at,
      user_name: u.full_name || u.email?.split('@')[0] || 'User',
      user_email: u.email || '',
      action: 'registration',
      details: { role: u.role, user_id: u.id },
      ip: randomIP(),
    })

    // Simulate a login entry slightly after registration
    const loginTime = new Date(u.created_at || Date.now())
    loginTime.setHours(loginTime.getHours() + Math.floor(Math.random() * 48))
    entries.push({
      id: `login-${u.id}`,
      timestamp: loginTime.toISOString(),
      user_name: u.full_name || u.email?.split('@')[0] || 'User',
      user_email: u.email || '',
      action: 'login',
      details: { role: u.role, method: 'email_password' },
      ip: randomIP(),
    })
  })

  // From bills
  bills.forEach((b) => {
    entries.push({
      id: `bill-created-${b.id}`,
      timestamp: b.created_at || b.issued_at,
      user_name: b.payer_name || 'System',
      user_email: b.payer_email || 'billing@heru.gg',
      action: 'bill_created',
      details: {
        bill_number: b.bill_number,
        amount: b.grand_total,
        bill_type: b.bill_type,
        tournament_name: b.tournament_name,
      },
      ip: randomIP(),
    })

    if (b.payment_status === 'paid') {
      entries.push({
        id: `bill-paid-${b.id}`,
        timestamp: b.paid_date || b.updated_at || b.created_at,
        user_name: b.payer_name || 'Payer',
        user_email: b.payer_email || 'payer@heru.gg',
        action: 'bill_paid',
        details: {
          bill_number: b.bill_number,
          amount: b.grand_total,
          payment_method: b.payment_method || 'paymob',
        },
        ip: randomIP(),
      })
    }
  })

  // From teams
  teams.forEach((t) => {
    entries.push({
      id: `team-created-${t.id}`,
      timestamp: t.created_at,
      user_name: t.leader_id ? `Leader ${t.leader_id.slice(0, 8)}` : 'Unknown',
      user_email: '',
      action: 'team_created',
      details: { team_name: t.name, games: t.games },
      ip: randomIP(),
    })
  })

  // Sort descending by timestamp
  entries.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
  return entries
}

// ---------------------------------------------------------------------------
// Action Badge
// ---------------------------------------------------------------------------

function ActionBadge({ action }) {
  const info = ACTION_MAP[action]
  if (!info) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border bg-zinc-800/50 text-zinc-400 border-zinc-700/50">
        <Activity className="w-3 h-3" />
        {action}
      </span>
    )
  }
  const Icon = info.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${info.color}`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Detail JSON
// ---------------------------------------------------------------------------

function DetailJSON({ data }) {
  return (
    <pre className="text-[11px] leading-relaxed text-zinc-400 bg-[#0c0c18] rounded-lg p-3 border border-zinc-800/50 overflow-x-auto font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

// ---------------------------------------------------------------------------
// Audit Row
// ---------------------------------------------------------------------------

function AuditRow({ entry }) {
  const [expanded, setExpanded] = useState(false)

  const formattedTime = entry.timestamp
    ? new Date(entry.timestamp).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    : '--'

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="border-b border-zinc-800/40 hover:bg-zinc-800/20 cursor-pointer transition-colors group"
      >
        <td className="px-4 py-3 text-xs text-zinc-500 font-mono whitespace-nowrap">
          {formattedTime}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-white font-medium">{entry.user_name}</p>
          {entry.user_email && (
            <p className="text-[11px] text-zinc-600">{entry.user_email}</p>
          )}
        </td>
        <td className="px-4 py-3">
          <ActionBadge action={entry.action} />
        </td>
        <td className="px-4 py-3 text-xs text-zinc-500 max-w-xs truncate">
          {entry.details?.tournament_name || entry.details?.team_name || entry.details?.bill_number || entry.details?.role || '--'}
        </td>
        <td className="px-4 py-3 text-xs text-zinc-600 font-mono">
          {entry.ip || '--'}
        </td>
        <td className="px-3 py-3 text-zinc-600 group-hover:text-zinc-400 transition-colors">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-zinc-800/40">
          <td colSpan={6} className="px-4 py-3">
            <DetailJSON data={entry.details} />
          </td>
        </tr>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Console Log Viewer
// ---------------------------------------------------------------------------

function ConsoleLogViewer() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-zinc-800/50 bg-[#0a0a14] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/20 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Terminal className="w-4 h-4 text-red-400" />
          Console Logs
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-zinc-800/50 p-4">
          <div className="bg-[#060610] rounded-lg border border-zinc-800/40 p-5 font-mono text-xs min-h-[200px] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-3 text-zinc-600 text-[10px]">heru-platform-logs</span>
            </div>
            <div className="space-y-1.5 text-zinc-600">
              <p><span className="text-zinc-500">[INFO]</span> <span className="text-red-400/60">2026-04-06 00:00:00</span> Platform audit logging initialized</p>
              <p><span className="text-zinc-500">[INFO]</span> <span className="text-red-400/60">2026-04-06 00:00:01</span> Connected to Supabase realtime channel</p>
              <p><span className="text-yellow-500/60">[WARN]</span> <span className="text-red-400/60">2026-04-06 00:00:02</span> Console logging will be implemented with backend integration</p>
              <p><span className="text-zinc-500">[INFO]</span> <span className="text-red-400/60">2026-04-06 00:00:03</span> Awaiting structured log events from API server...</p>
              <p className="mt-4 text-zinc-700 animate-pulse">_ waiting for events...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function StaffAuditTrail() {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch platform data to generate synthetic audit entries
  const { data: tournaments = [] } = useQuery({
    queryKey: ['audit-tournaments'],
    queryFn: () => Tournament.list(),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['audit-users'],
    queryFn: () => Staff.users(),
  })

  const { data: bills = [] } = useQuery({
    queryKey: ['audit-bills'],
    queryFn: () => Bill.list(),
  })

  const { data: teams = [] } = useQuery({
    queryKey: ['audit-teams'],
    queryFn: () => Team.list(),
  })

  const isLoading = !tournaments && !users && !bills && !teams

  // Generate & filter entries
  const allEntries = useMemo(
    () => generateMockEntries(tournaments, users, bills, teams),
    [tournaments, users, bills, teams],
  )

  const filtered = useMemo(() => {
    return allEntries.filter((entry) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          entry.user_name?.toLowerCase().includes(q) ||
          entry.user_email?.toLowerCase().includes(q) ||
          entry.action?.toLowerCase().includes(q) ||
          JSON.stringify(entry.details || {}).toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      // Action type filter
      if (activeFilters.length > 0 && !activeFilters.includes(entry.action)) {
        return false
      }

      // Date range filter
      if (dateFrom) {
        const entryDate = new Date(entry.timestamp)
        if (entryDate < new Date(dateFrom)) return false
      }
      if (dateTo) {
        const entryDate = new Date(entry.timestamp)
        const toEnd = new Date(dateTo)
        toEnd.setHours(23, 59, 59, 999)
        if (entryDate > toEnd) return false
      }

      return true
    })
  }, [allEntries, search, activeFilters, dateFrom, dateTo])

  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    )
  }

  const clearFilters = () => {
    setActiveFilters([])
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  const hasActiveFilters = activeFilters.length > 0 || dateFrom || dateTo || search

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Audit <span className="text-red-400">Trail</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Track all platform activity and system events</p>
      </div>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search by name, email, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-zinc-800/60 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-[#0f0f1a] border-zinc-800/60 text-zinc-400 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilters.length > 0 && (
            <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
              {activeFilters.length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-zinc-800/60 bg-[#0f0f1a] text-xs text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl border border-zinc-800/50 bg-[#0a0a14] p-5 space-y-4">
          {/* Action type chips */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Action Type</p>
            <div className="flex flex-wrap gap-2">
              {ACTION_TYPES.map(({ key, label, icon: Icon, color }) => {
                const isActive = activeFilters.includes(key)
                return (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                      isActive
                        ? color
                        : 'bg-zinc-900/50 border-zinc-800/60 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 bg-[#0c0c18] border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 bg-[#0c0c18] border border-zinc-800/60 rounded-lg text-sm text-white focus:outline-none focus:border-red-500/40 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {hasActiveFilters && ` (filtered from ${allEntries.length})`}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-zinc-700">
          <Clock className="w-3 h-3" />
          Synthetic data from live platform records
        </div>
      </div>

      {/* Audit Table */}
      <div className="rounded-xl border border-zinc-800/50 bg-[#0a0a14] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800/60">
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">Timestamp</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">User</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">Action</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">Details</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">IP Address</th>
                <th className="px-3 py-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                    <p className="text-sm text-zinc-600">No audit entries found</p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-xs text-red-400 hover:text-red-300"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.slice(0, 200).map((entry) => (
                  <AuditRow key={entry.id} entry={entry} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 200 && (
          <div className="px-4 py-3 border-t border-zinc-800/50 text-center">
            <p className="text-xs text-zinc-600">
              Showing 200 of {filtered.length} entries. Refine your filters to see more specific results.
            </p>
          </div>
        )}
      </div>

      {/* Console Logs */}
      <ConsoleLogViewer />
    </div>
  )
}
