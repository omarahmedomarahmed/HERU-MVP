import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import { Trophy, Plus, Calendar, Users, ChevronRight } from 'lucide-react'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Drafts' },
  { key: 'published', label: 'Published' },
  { key: 'live', label: 'Live' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_STYLES = {
  draft: 'bg-gray-600/30 text-gray-300 border border-gray-500/40',
  published: 'bg-red-600/20 text-red-400 border border-red-500/40',
  live: 'bg-green-600/20 text-green-400 border border-green-500/40',
  completed: 'bg-red-600/20 text-red-400 border border-red-500/40',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return 'No date set'
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return 'Invalid date'
  }
}

function formatEGP(amount) {
  if (amount == null) return 'EGP 0'
  return `EGP ${Number(amount).toLocaleString('en-US')}`
}

// ---------------------------------------------------------------------------
// StatusBadge
// ---------------------------------------------------------------------------

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${style}`}>
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// TournamentCard
// ---------------------------------------------------------------------------

function TournamentCard({ tournament, onClick }) {
  const teamCount = tournament.teams?.length || 0
  const maxTeams = tournament.max_teams || '?'

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10
                 bg-[#1a1a2e] hover:border-red-500/50 transition-all duration-200
                 text-left w-full focus:outline-none focus:ring-2 focus:ring-red-500/50"
    >
      {/* Image / placeholder */}
      <div className="relative h-40 w-full overflow-hidden">
        {tournament.tournament_image ? (
          <img
            src={tournament.tournament_image}
            alt={tournament.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-red-700/40 via-red-800/30 to-red-900/40 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-red-400/50" />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={tournament.status} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold text-white truncate group-hover:text-red-300 transition-colors">
          {tournament.name || 'Untitled Tournament'}
        </h3>

        {tournament.game && (
          <span className="text-xs text-red-400 font-medium uppercase tracking-wide">
            {tournament.game}
          </span>
        )}

        {/* Meta row */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(tournament.schedule)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {teamCount}/{maxTeams}
          </span>
        </div>

        {/* Cost */}
        <div className="mt-1 text-sm font-medium text-red-400">
          {formatEGP(tournament.total_cost)}
        </div>
      </div>

      {/* Hover arrow indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        <ChevronRight className="h-5 w-5 text-red-400" />
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

function EmptyState({ activeTab, onCreateClick }) {
  const isFiltered = activeTab !== 'all'
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-red-600/10 p-4">
        <Trophy className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">
        {isFiltered ? `No ${activeTab} tournaments` : 'No tournaments yet'}
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mb-6">
        {isFiltered
          ? `You don't have any tournaments with "${activeTab}" status.`
          : 'Create your first tournament and start building your esports events!'}
      </p>
      {!isFiltered && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white
                     hover:bg-red-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Tournament
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function OrganizerTournaments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  // Fetch all tournaments for the current organizer (including drafts)
  const {
    data: tournaments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['organizer-tournaments', user?.id],
    queryFn: () =>
      apiCall(`/tournaments?organizer_id=${user?.id}&include_drafts=true`)
        .then(d => Array.isArray(d) ? d : d?.tournaments || d?.data || []),
    enabled: !!user?.id,
  })

  // Filter by active tab
  const filtered = useMemo(() => {
    if (activeTab === 'all') return tournaments
    return tournaments.filter((t) => t.status === activeTab)
  }, [tournaments, activeTab])

  // Navigation helpers
  const goToCreate = () => navigate('/organizer/tournaments/new')

  const goToTournament = (tournament) => {
    if (tournament.status === 'draft') {
      navigate(`/organizer/tournaments/new?edit=${tournament.id}`)
    } else {
      navigate(`/organizer/tournaments/${tournament.id}/manage`)
    }
  }

  // Tab counts
  const counts = useMemo(() => {
    const map = { all: tournaments.length, draft: 0, published: 0, live: 0, completed: 0 }
    tournaments.forEach((t) => {
      if (map[t.status] !== undefined) map[t.status]++
    })
    return map
  }, [tournaments])

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tournaments</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your events and track their progress
          </p>
        </div>
        <button
          onClick={goToCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white
                     hover:bg-red-500 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create New
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                }
              `}
            >
              {tab.label}
              <span
                className={`text-xs ml-0.5 ${
                  isActive ? 'text-red-200' : 'text-gray-500'
                }`}
              >
                ({counts[tab.key]})
              </span>
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          Failed to load tournaments: {error?.message || 'Unknown error'}
        </div>
      )}

      {/* Tournament grid */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onClick={() => goToTournament(tournament)}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState activeTab={activeTab} onCreateClick={goToCreate} />
      )}
    </div>
  )
}
