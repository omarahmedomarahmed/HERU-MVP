import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Tournament, Bill, SponsorshipRadar, Staff, ApprovalRequest, apiCall,
} from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import {
  DollarSign, Trophy, Users, Radar, ArrowRight, UserPlus, CreditCard,
  ClipboardCheck, Shield, AlertCircle, FileText, Clock, Activity,
  TrendingUp, ChevronRight, Zap, Eye,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(amount) {
  return `EGP ${(amount || 0).toLocaleString('en-EG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, subtext, color = 'blue' }) {
  const colorMap = {
    blue:   'from-red-500/20 to-red-600/5 border-red-500/20 text-red-400',
    green:  'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    purple: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400',
    amber:  'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  }
  const iconColor = {
    blue: 'text-red-400', green: 'text-emerald-400', purple: 'text-violet-400', amber: 'text-amber-400',
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${colorMap[color]} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-white">{value}</p>
          {subtext && <p className="mt-1 text-xs text-zinc-500">{subtext}</p>}
        </div>
        <div className={`rounded-lg bg-zinc-800/60 p-2.5 ${iconColor[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Quick Action Button
// ---------------------------------------------------------------------------

function QuickAction({ icon: Icon, label, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-3.5 transition-all hover:border-red-500/30 hover:bg-zinc-800/80"
    >
      <div className="rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors group-hover:bg-red-500/20">
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-red-400" />
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Activity Item
// ---------------------------------------------------------------------------

function ActivityItem({ icon: Icon, iconColor, description, timestamp, linkTo }) {
  const Wrapper = linkTo ? Link : 'div'
  const wrapperProps = linkTo ? { to: linkTo } : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={`flex items-start gap-3 rounded-lg px-3 py-3 transition-colors ${
        linkTo ? 'cursor-pointer hover:bg-zinc-800/50' : ''
      }`}
    >
      <div className={`mt-0.5 rounded-md bg-zinc-800 p-1.5 ${iconColor || 'text-red-400'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-zinc-300">{description}</p>
        <p className="mt-0.5 text-xs text-zinc-600">{timeAgo(timestamp)}</p>
      </div>
      {linkTo && <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-700" />}
    </Wrapper>
  )
}

// ---------------------------------------------------------------------------
// Health Indicator
// ---------------------------------------------------------------------------

function HealthItem({ label, count, to, urgent }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 transition-all hover:border-red-500/20 hover:bg-zinc-800/60"
    >
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${
        urgent && count > 0
          ? 'bg-amber-500/20 text-amber-400'
          : count > 0
            ? 'bg-red-500/15 text-red-400'
            : 'bg-zinc-800 text-zinc-500'
      }`}>
        {count}
      </span>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function StaffDashboard() {
  const navigate = useNavigate()

  // --- Auth check ---
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token')
    const expires = localStorage.getItem('heru_staff_expires')
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token')
      localStorage.removeItem('heru_staff_expires')
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  // --- Data queries ---
  const { data: dashboardData, isLoading: dashLoading } = useQuery({
    queryKey: ['staff-dashboard'],
    queryFn: () => Staff.dashboard(),
    staleTime: 30_000,
  })

  const { data: tournaments = [] } = useQuery({
    queryKey: ['staff-tournaments-overview'],
    queryFn: () => Tournament.list(),
    staleTime: 60_000,
  })

  const { data: bills = [] } = useQuery({
    queryKey: ['staff-bills-overview'],
    queryFn: () => Bill.list(),
    staleTime: 60_000,
  })

  const { data: radarListings = [] } = useQuery({
    queryKey: ['staff-radar-overview'],
    queryFn: () => SponsorshipRadar.list(),
    staleTime: 60_000,
  })

  const { data: approvals = [] } = useQuery({
    queryKey: ['staff-approvals-overview'],
    queryFn: () => ApprovalRequest.list(),
    staleTime: 60_000,
  })

  // --- Derived stats ---
  // Prefer authoritative counts from the backend dashboard endpoint; fall back
  // to client-side derivation only when the dashboard query hasn't loaded yet.
  const totalRevenue = dashboardData?.total_platform_revenue ?? bills.reduce((sum, b) => sum + (b.platform_fee || 0), 0)
  const totalTournaments = dashboardData?.total_tournaments ?? tournaments.length
  const totalUsers = dashboardData?.total_users ?? '--'
  const activeRadar = radarListings.filter(r => r.status === 'open' || r.status === 'in_progress').length

  const pendingApprovals = approvals.filter(a => a.status === 'pending').length
  const unpaidBills = bills.filter(b => b.payment_status === 'unpaid' || b.payment_status === 'overdue').length
  const draftTournaments = tournaments.filter(t => t.status === 'draft').length
  const activeSessions = dashboardData?.active_staff_sessions ?? '--'

  // --- Build activity feed from real data ---
  const activityFeed = React.useMemo(() => {
    const entries = []

    // Recent tournaments
    tournaments.slice(0, 5).forEach(t => {
      if (t.status === 'live') {
        entries.push({
          icon: Zap,
          iconColor: 'text-green-400',
          description: `Tournament "${t.name}" is now LIVE`,
          timestamp: t.updated_at || t.created_at,
          linkTo: `/staff/tournaments/${t.id}`,
        })
      } else if (t.status === 'draft') {
        entries.push({
          icon: FileText,
          iconColor: 'text-zinc-400',
          description: `Draft tournament "${t.name}" created`,
          timestamp: t.created_at,
          linkTo: `/staff/tournaments/${t.id}`,
        })
      } else if (t.status === 'published') {
        entries.push({
          icon: Trophy,
          iconColor: 'text-red-400',
          description: `Tournament "${t.name}" published`,
          timestamp: t.updated_at || t.created_at,
          linkTo: `/staff/tournaments/${t.id}`,
        })
      } else if (t.status === 'completed') {
        entries.push({
          icon: ClipboardCheck,
          iconColor: 'text-emerald-400',
          description: `Tournament "${t.name}" completed`,
          timestamp: t.updated_at || t.created_at,
          linkTo: `/staff/tournaments/${t.id}`,
        })
      }
    })

    // Recent bill payments
    bills.filter(b => b.payment_status === 'paid').slice(0, 3).forEach(b => {
      entries.push({
        icon: CreditCard,
        iconColor: 'text-emerald-400',
        description: `Bill ${b.bill_number} paid - ${formatEGP(b.grand_total)}`,
        timestamp: b.paid_date || b.updated_at,
        linkTo: `/staff/billing`,
      })
    })

    // Pending approvals
    approvals.filter(a => a.status === 'pending').slice(0, 3).forEach(a => {
      entries.push({
        icon: AlertCircle,
        iconColor: 'text-amber-400',
        description: `Pending ${a.approval_type?.replace(/_/g, ' ')} from ${a.requester_name || 'unknown'}`,
        timestamp: a.created_at,
        linkTo: '/staff/approvals',
      })
    })

    // Radar activity
    radarListings.slice(0, 2).forEach(r => {
      entries.push({
        icon: Radar,
        iconColor: 'text-violet-400',
        description: `Radar listing "${r.tournament_name}" - ${r.funding_percent || 0}% funded`,
        timestamp: r.updated_at || r.created_at,
        linkTo: '/staff/radar',
      })
    })

    // Sort by timestamp desc, take 10
    return entries
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 10)
  }, [tournaments, bills, approvals, radarListings])

  // --- Render ---
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Staff <span className="text-red-400">Dashboard</span>
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Platform control center. All data in real time.</p>
      </div>

      {/* 1. Platform Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatEGP(totalRevenue)}
          subtext="Platform fees collected"
          color="green"
        />
        <StatCard
          icon={Trophy}
          label="Total Tournaments"
          value={totalTournaments}
          subtext={`${draftTournaments} drafts`}
          color="blue"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={totalUsers}
          subtext="All roles combined"
          color="purple"
        />
        <StatCard
          icon={Radar}
          label="Active Radar"
          value={activeRadar}
          subtext="Open listings"
          color="amber"
        />
      </div>

      {/* 2. Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-zinc-500">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={Users} label="View All Users" to="/staff/users" />
          <QuickAction icon={Trophy} label="Manage Tournaments" to="/staff/tournaments" />
          <QuickAction icon={ClipboardCheck} label="Review Approvals" to="/staff/approvals" />
          <QuickAction icon={Eye} label="Audit Trail" to="/staff/audit" />
        </div>
      </div>

      {/* 3 + 4 + 5: Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left: Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70">
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Recent Activity</h2>
              </div>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">
                Last {activityFeed.length} events
              </span>
            </div>
            <div className="divide-y divide-zinc-800/50 px-2 py-1">
              {activityFeed.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-zinc-600">No recent activity</p>
              )}
              {activityFeed.map((item, i) => (
                <ActivityItem key={i} {...item} />
              ))}
            </div>
          </div>

          {/* Revenue Chart placeholder */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Revenue Trend</h2>
            </div>
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30">
              <DollarSign className="h-8 w-8 text-red-500/40" />
              <p className="mt-2 text-lg font-bold text-white">{formatEGP(totalRevenue)}</p>
              <p className="text-xs text-zinc-500">Total platform fees collected</p>
              <Link
                to="/staff/revenue"
                className="mt-3 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                View full revenue breakdown &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Right: System Health */}
        <div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/70">
            <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
              <Shield className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">System Health</h2>
            </div>
            <div className="space-y-2 p-4">
              <HealthItem
                label="Pending Approvals"
                count={pendingApprovals}
                to="/staff/approvals"
                urgent
              />
              <HealthItem
                label="Unpaid Bills"
                count={unpaidBills}
                to="/staff/billing"
                urgent
              />
              <HealthItem
                label="Draft Tournaments"
                count={draftTournaments}
                to="/staff/tournaments"
              />
              <HealthItem
                label="Active Staff Sessions"
                count={activeSessions}
                to="/staff/settings"
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Staff Pages</h3>
            <div className="space-y-1">
              {[
                { label: 'Marketplace', to: '/staff/marketplace' },
                { label: 'Orders', to: '/staff/orders' },
                { label: 'Radar Panel', to: '/staff/radar' },
                { label: 'Organizers', to: '/staff/organizers' },
                { label: 'Messages', to: '/staff/messages' },
                { label: 'Settings', to: '/staff/settings' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white"
                >
                  {link.label}
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
