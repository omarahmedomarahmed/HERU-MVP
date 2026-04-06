import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Trophy,
  Plus,
  Users,
  Calendar,
  Search,
  Settings,
  Pencil,
  Gamepad2,
  Swords,
  DollarSign,
  Loader2,
  Share2,
  User,
} from 'lucide-react'
import { Tournament } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_STYLES = {
  draft: {
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/40',
    dot: 'bg-yellow-400',
    label: 'Draft',
  },
  published: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    dot: 'bg-blue-400',
    label: 'Published',
  },
  live: {
    bg: 'bg-green-500/15',
    text: 'text-green-400',
    border: 'border-green-500/40',
    dot: 'bg-green-400',
    label: 'Live',
  },
  completed: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    dot: 'bg-purple-400',
    label: 'Completed',
  },
}

function formatEGP(amount) {
  if (amount == null) return 'EGP 0'
  return `EGP ${Number(amount).toLocaleString('en-EG')}`
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} ${status === 'live' ? 'animate-pulse' : ''}`} />
      {style.label}
    </span>
  )
}

function TypeBadge({ type }) {
  if (type === 'shared') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
        <Share2 className="w-3 h-3" />
        Shared
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-700/50 text-zinc-400 border border-zinc-600/40">
      <User className="w-3 h-3" />
      Solo
    </span>
  )
}

function TournamentCard({ tournament }) {
  const status = tournament.status || 'draft'
  const teamsCount = tournament.teams?.length || 0
  const maxTeams = tournament.max_teams || 0
  const isDraft = status === 'draft'

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-200">
      {/* Image / Placeholder */}
      <div className="relative h-36 overflow-hidden">
        {tournament.tournament_image ? (
          <img
            src={tournament.tournament_image}
            alt={tournament.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-900/40 via-zinc-900 to-zinc-800 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-red-500/30" />
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

        {/* Badges floating on image */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusBadge status={status} />
          <TypeBadge type={tournament.tournament_type} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title + Game */}
        <div>
          <h3 className="text-base font-bold text-white truncate leading-tight">
            {tournament.name}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-zinc-400">
            {tournament.game && (
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                {tournament.game}
              </span>
            )}
            {tournament.format && (
              <span className="flex items-center gap-1">
                <Swords className="w-3.5 h-3.5" />
                {tournament.format}
              </span>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-4 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {teamsCount}/{maxTeams || '--'}
          </span>
          {tournament.schedule && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(tournament.schedule).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Cost */}
        {tournament.total_cost != null && tournament.total_cost > 0 && (
          <div className="flex items-center gap-1 text-sm font-semibold text-red-400">
            <DollarSign className="w-3.5 h-3.5" />
            {formatEGP(tournament.total_cost)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/organizer/tournaments/${tournament.id}/manage`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Manage
          </Link>
          {isDraft && (
            <Link
              to={`/organizer/tournaments/new/${tournament.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium border border-zinc-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrganizerTournaments() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const {
    data: tournaments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['organizer-tournaments', user?.id],
    queryFn: () => Tournament.list({ organizer_id: user?.id }),
    enabled: !!user?.id,
  })

  // Filter by status tab
  const statusFiltered = useMemo(() => {
    if (activeTab === 'all') return tournaments
    return tournaments.filter((t) => t.status === activeTab)
  }, [tournaments, activeTab])

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return statusFiltered
    const q = search.toLowerCase()
    return statusFiltered.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.game?.toLowerCase().includes(q)
    )
  }, [statusFiltered, search])

  // Counts per status
  const counts = useMemo(() => {
    const c = { all: tournaments.length, draft: 0, published: 0, live: 0, completed: 0 }
    tournaments.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status]++
    })
    return c
  }, [tournaments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Tournaments
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create, manage, and track all your tournaments
          </p>
        </div>
        <Link
          to="/organizer/tournaments/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Build New Tournament
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${
                  isActive ? 'text-red-400/80' : 'text-zinc-600'
                }`}
              >
                {counts[tab.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name or game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-colors"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
          <p className="text-zinc-400 text-sm">Loading tournaments...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Trophy className="w-12 h-12 text-red-500/40 mb-3" />
          <p className="text-zinc-400 text-sm">Failed to load tournaments. Please try again.</p>
        </div>
      ) : filtered.length === 0 && tournaments.length === 0 ? (
        /* Empty state - no tournaments at all */
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/20 to-zinc-800 flex items-center justify-center mb-5">
            <Trophy className="w-10 h-10 text-red-500/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No tournaments yet</h3>
          <p className="text-zinc-400 text-sm text-center max-w-sm mb-6">
            Build your first tournament and start competing. Set up brackets, add prizes, and invite teams.
          </p>
          <Link
            to="/organizer/tournaments/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-600/20"
          >
            <Plus className="w-4 h-4" />
            Build Your First Tournament
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state - no results for current filter/search */
        <div className="flex flex-col items-center justify-center py-16">
          <Search className="w-10 h-10 text-zinc-600 mb-3" />
          <p className="text-zinc-400 text-sm">
            No tournaments match your filters.
          </p>
        </div>
      ) : (
        /* Tournament grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  )
}
