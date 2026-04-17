import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Trophy,
  Radar,
  FileText,
  Handshake,
  Plus,
  Search,
  MessageSquare,
  CreditCard,
  Calendar,
  Gamepad2,
  ArrowRight,
  Loader2,
  BarChart3,
  Clock,
  Users,
  Bot,
  ExternalLink,
} from 'lucide-react'
import { Tournament, SponsorshipRadar, Bill, OrganizerProfile, Connect, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(amount) {
  if (amount == null || isNaN(amount)) return 'EGP 0'
  return `EGP ${Number(amount).toLocaleString('en-EG')}`
}

function formatDate(dateStr) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function statusColor(status) {
  switch (status) {
    case 'live':
      return 'bg-green-500/20 text-green-400 border border-green-500/40'
    case 'published':
      return 'bg-red-500/20 text-red-400 border border-red-500/40'
    case 'draft':
      return 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
    case 'completed':
      return 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
    default:
      return 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
  }
}

function radarStatusColor(status) {
  switch (status) {
    case 'open':
      return 'text-green-400'
    case 'in_progress':
      return 'text-amber-400'
    case 'fully_funded':
      return 'text-red-400'
    case 'closed':
      return 'text-zinc-500'
    default:
      return 'text-zinc-400'
  }
}

function radarStatusLabel(status) {
  switch (status) {
    case 'open':
      return 'Open'
    case 'in_progress':
      return 'In Progress'
    case 'fully_funded':
      return 'Fully Funded'
    case 'closed':
      return 'Closed'
    default:
      return status || '--'
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, color = 'red', to }) {
  const colorMap = {
    red: 'from-red-600/20 to-red-900/10 border-red-500/20',
    green: 'from-green-600/20 to-green-900/10 border-green-500/20',
    amber: 'from-amber-600/20 to-amber-900/10 border-amber-500/20',
    blue: 'from-red-600/20 to-red-900/10 border-red-500/20',
  }
  const iconColorMap = {
    red: 'text-red-500',
    green: 'text-green-500',
    amber: 'text-amber-500',
    blue: 'text-red-500',
  }

  const card = (
    <div
      className={`relative rounded-xl border bg-gradient-to-br ${colorMap[color]} p-5 transition-all duration-200 hover:scale-[1.02] hover:brightness-110`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80">
          <Icon className={`h-5 w-5 ${iconColorMap[color]}`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value ?? '--'}</p>
        </div>
      </div>
    </div>
  )

  if (to) return <Link to={to}>{card}</Link>
  return card
}

function QuickAction({ icon: Icon, label, description, to }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all duration-200 hover:border-red-500/40 hover:bg-zinc-800/60"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600/10 transition-colors group-hover:bg-red-600/20">
        <Icon className="h-6 w-6 text-red-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-red-500" />
    </Link>
  )
}

function SectionHeader({ title, to, linkLabel = 'View All' }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {to && (
        <Link
          to={to}
          className="flex items-center gap-1 text-sm text-red-500 transition-colors hover:text-red-400"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-10 text-center">
      <Icon className="mb-3 h-10 w-10 text-zinc-700" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}

function LoadingBlock() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Discord Bot Card
// ---------------------------------------------------------------------------

function DiscordBotCard() {
  const [installUrl, setInstallUrl] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  async function handleGetInstallUrl() {
    setLoading(true)
    try {
      const url = await Connect.botInstallUrl()
      setInstallUrl(url)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      // fallback — open Discord OAuth directly
      window.open(
        `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env.VITE_DISCORD_APPLICATION_ID || '1494378715709313064'}&permissions=277025770560&scope=bot+applications.commands`,
        '_blank',
        'noopener,noreferrer'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-zinc-900/50 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600/20 border border-indigo-500/30">
          <Bot className="h-6 w-6 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-lg">Add HERU Bot to Your Discord Server</h3>
          <p className="text-gray-400 text-sm mt-0.5">
            Let your community browse tournaments, join via Discord, and get live updates — all without leaving Discord.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
            <li className="flex items-center gap-1"><span className="text-indigo-400">✦</span> Natural language tournament builder</li>
            <li className="flex items-center gap-1"><span className="text-indigo-400">✦</span> Live bracket + score announcements</li>
            <li className="flex items-center gap-1"><span className="text-indigo-400">✦</span> Gamers join with one Discord click</li>
          </ul>
        </div>
        <button
          onClick={handleGetInstallUrl}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-colors shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          Add to Discord
        </button>
      </div>
    </section>
  )
}

// Main component
// ---------------------------------------------------------------------------

export default function OrganizerDashboard() {
  const { user, userProfile } = useAuth()

  // -- Organizer profile
  const { data: orgProfile, isLoading: orgLoading } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => OrganizerProfile.me(),
    enabled: !!user,
  })

  // -- My tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ['organizer-tournaments', user?.id],
    queryFn: () => Tournament.list({ organizer_id: user?.id, include_drafts: 'true' }),
    enabled: !!user?.id,
  })

  // -- Radar listings (open ones for feed)
  const { data: radarListings = [], isLoading: radarLoading } = useQuery({
    queryKey: ['radar-listings'],
    queryFn: () => SponsorshipRadar.list({ status: 'open' }),
    enabled: !!user,
  })

  // -- My bills
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['organizer-bills', user?.id],
    queryFn: () => Bill.list({ payer_id: user?.id }),
    enabled: !!user?.id,
  })

  const brandName = orgProfile?.brand_name || userProfile?.full_name || 'Organizer'
  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Derived stats
  const myTournamentCount = tournaments.length
  const activeRadarCount = radarListings.filter(
    (r) => r.main_organizer_id === user?.id && (r.status === 'open' || r.status === 'in_progress')
  ).length
  const pendingBillCount = bills.filter(
    (b) => b.payment_status === 'unpaid' || b.payment_status === 'partial'
  ).length
  const coOrganizedCount = tournaments.filter((t) => {
    const coOrgs = t.co_organizers || []
    return coOrgs.some((c) => c.organizer_id === user?.id)
  }).length

  // Recent 5 tournaments
  const recentTournaments = [...tournaments]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  // Latest 5 radar listings
  const recentRadar = [...radarListings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isLoading = orgLoading && tournamentsLoading

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Welcome Header ---- */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="text-red-500">{brandName}</span>
        </h1>
        <p className="mt-1 text-gray-400">{todayStr}</p>
      </div>

      {/* ---- Quick Stats ---- */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="My Tournaments"
          value={myTournamentCount}
          color="red"
          to="/organizer/tournaments"
        />
        <StatCard
          icon={Radar}
          label="Active Radar"
          value={activeRadarCount}
          color="green"
          to="/organizer/radar"
        />
        <StatCard
          icon={FileText}
          label="Pending Bills"
          value={pendingBillCount}
          color="amber"
          to="/organizer/billing"
        />
        <StatCard
          icon={Handshake}
          label="Co-Organized"
          value={coOrganizedCount}
          color="blue"
          to="/organizer/sponsored"
        />
      </div>

      {/* ---- Quick Actions ---- */}
      <section>
        <SectionHeader title="Quick Actions" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            icon={Plus}
            label="Build New Tournament"
            description="Create a new tournament from scratch"
            to="/organizer/tournaments/new"
          />
          <QuickAction
            icon={Search}
            label="Browse Radar"
            description="Find tournaments seeking co-organizers"
            to="/organizer/radar"
          />
          <QuickAction
            icon={MessageSquare}
            label="View Messages"
            description="Check your recent conversations"
            to="/organizer/messages"
          />
          <QuickAction
            icon={CreditCard}
            label="My Billing"
            description="View invoices and payment status"
            to="/organizer/billing"
          />
        </div>
      </section>

      {/* ---- Two-column layout: Tournaments + Radar ---- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tournaments */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <SectionHeader title="Recent Tournaments" to="/organizer/tournaments" />

          {tournamentsLoading ? (
            <LoadingBlock />
          ) : recentTournaments.length === 0 ? (
            <EmptyState icon={Trophy} message="No tournaments yet. Build your first one!" />
          ) : (
            <div className="space-y-3">
              {recentTournaments.map((t) => (
                <Link
                  key={t.id}
                  to={`/organizer/tournaments/${t.id}/manage`}
                  className="flex items-center gap-4 rounded-lg border border-zinc-800/60 bg-zinc-800/30 p-4 transition-colors hover:border-red-500/30 hover:bg-zinc-800/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <Gamepad2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{t.name}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      {t.game && <span>{t.game}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(t.schedule || t.created_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor(t.status)}`}
                  >
                    {t.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Radar Activity */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <SectionHeader title="Radar Activity" to="/organizer/radar" />

          {radarLoading ? (
            <LoadingBlock />
          ) : recentRadar.length === 0 ? (
            <EmptyState icon={Radar} message="No open radar listings right now." />
          ) : (
            <div className="space-y-3">
              {recentRadar.map((r) => {
                const fundingPct = Math.min(r.funding_percent || 0, 100)

                return (
                  <Link
                    key={r.id}
                    to={`/organizer/radar/${r.id}`}
                    className="block rounded-lg border border-zinc-800/60 bg-zinc-800/30 p-4 transition-colors hover:border-red-500/30 hover:bg-zinc-800/50"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="truncate font-medium text-white">
                        {r.tournament_name || 'Unnamed Tournament'}
                      </p>
                      <span className={`text-xs font-medium ${radarStatusColor(r.status)}`}>
                        {radarStatusLabel(r.status)}
                      </span>
                    </div>

                    <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                      <span>{r.game || '--'}</span>
                      <span>{formatEGP(r.total_cost)}</span>
                    </div>

                    {/* Funding progress bar */}
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-gray-500">Funding</span>
                        <span className="font-medium text-white">{Math.round(fundingPct)}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
                          style={{ width: `${fundingPct}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* ---- Add HERU Bot to Discord ---- */}
      <DiscordBotCard />

      {/* ---- Recent Messages ---- */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <SectionHeader title="Recent Messages" to="/organizer/messages" />

        {/* Messages require tournament chat data -- show summary based on tournaments with chat activity */}
        {tournamentsLoading ? (
          <LoadingBlock />
        ) : (() => {
          const tournamentsWithChat = tournaments.filter(
            (t) => t.organizer_chat && t.organizer_chat.length > 0
          )
          const recentChats = tournamentsWithChat
            .map((t) => {
              const lastMsg = t.organizer_chat[t.organizer_chat.length - 1]
              return { tournament: t, lastMessage: lastMsg }
            })
            .sort(
              (a, b) =>
                new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
            )
            .slice(0, 4)

          if (recentChats.length === 0) {
            return (
              <EmptyState icon={MessageSquare} message="No recent messages. Start a conversation from your tournament." />
            )
          }

          return (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentChats.map(({ tournament, lastMessage }) => (
                <Link
                  key={tournament.id}
                  to={`/organizer/tournaments/${tournament.id}/manage/chat`}
                  className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-800/30 p-4 transition-colors hover:border-red-500/30 hover:bg-zinc-800/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{tournament.name}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {lastMessage?.sender_name && (
                        <span className="text-gray-400">{lastMessage.sender_name}: </span>
                      )}
                      {lastMessage?.message || lastMessage?.text || 'No messages yet'}
                    </p>
                    {lastMessage?.timestamp && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        {formatDate(lastMessage.timestamp)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )
        })()}
      </section>
    </div>
  )
}
