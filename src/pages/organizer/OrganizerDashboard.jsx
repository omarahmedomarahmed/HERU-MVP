import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { Tournament, SponsorshipRadar, OrganizerProfile } from '@/api/heruClient'
import {
  Trophy, Zap, DollarSign, Shield, Plus, Radar,
  ChevronRight, Calendar, Gamepad2, TrendingUp, Loader2, Headphones,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const statusColors = {
  draft: 'bg-gray-600/30 text-gray-300',
  published: 'bg-red-600/30 text-red-300',
  live: 'bg-green-500/30 text-green-300',
  completed: 'bg-red-500/30 text-red-300',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        statusColors[status] || 'bg-gray-600/30 text-gray-300'
      }`}
    >
      {status}
    </span>
  )
}

function FundingBar({ percent }) {
  return (
    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-red-500 transition-all duration-500"
        style={{ width: `${Math.min(percent || 0, 100)}%` }}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="relative group rounded-xl border border-white/10 bg-[#1a1a2e] p-5 hover:border-violet-500/40 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-lg ${
            accent
              ? 'bg-gradient-to-br from-violet-600 to-red-600'
              : 'bg-white/5'
          }`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

function QuickActions({ navigate }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => navigate('/organizer/tournaments/new')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-red-600 text-white font-medium text-sm hover:brightness-110 transition"
      >
        <Plus className="w-4 h-4" />
        Build Tournament
      </button>
      <button
        onClick={() => navigate('/organizer/radar')}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-violet-500/40 text-violet-300 font-medium text-sm hover:bg-violet-500/10 transition"
      >
        <Radar className="w-4 h-4" />
        Browse Radar
      </button>
    </div>
  )
}

function RecentTournamentCard({ tournament, onClick }) {
  const scheduledDate = tournament.schedule
    ? new Date(tournament.schedule).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No date set'

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 bg-[#1a1a2e] p-4 hover:border-violet-500/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold truncate group-hover:text-violet-300 transition-colors">
            {tournament.name}
          </h4>
          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-400">
            {tournament.game && (
              <span className="inline-flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                {tournament.game}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {scheduledDate}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={tournament.status} />
          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors" />
        </div>
      </div>
    </button>
  )
}

function RadarCard({ listing, onClick }) {
  const percentFunded = listing.funding_percent || 0
  const amountNeeded = listing.amount_still_needed || 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 bg-[#1a1a2e] p-4 hover:border-red-500/40 transition-colors group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-white font-semibold truncate group-hover:text-red-300 transition-colors">
            {listing.tournament_name}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            {listing.game && (
              <span className="inline-flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                {listing.game}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {formatEGP(listing.total_cost)}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors shrink-0 mt-1" />
      </div>

      <FundingBar percent={percentFunded} />
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-500">{Math.round(percentFunded)}% funded</span>
        <span className="text-red-400 font-medium">{formatEGP(amountNeeded)} needed</span>
      </div>
    </button>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
      <Icon className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OrganizerDashboard() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()

  // Fetch organizer profile for brand name + verification
  const {
    data: orgProfile,
    isLoading: orgLoading,
  } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => OrganizerProfile.me(),
    enabled: !!user,
    staleTime: 0,
  })

  // Fetch this organizer's tournaments
  const {
    data: tournamentsData,
    isLoading: tournamentsLoading,
  } = useQuery({
    queryKey: ['organizer-tournaments'],
    queryFn: () => Tournament.list({ organizer_id: user?.id, limit: 5, include_drafts: 'true' }),
    enabled: !!user,
    staleTime: 30_000,
  })

  // Fetch open radar listings
  const isVerified = !!(orgProfile?.is_verified)
  const {
    data: radarData,
    isLoading: radarLoading,
  } = useQuery({
    queryKey: ['radar-open'],
    queryFn: () => SponsorshipRadar.list({ status: 'open', limit: 6 }),
    enabled: !!user && isVerified,
    staleTime: 30_000,
  })

  // Normalize data — backend may return array or { data: [...] }
  const tournaments = Array.isArray(tournamentsData)
    ? tournamentsData
    : tournamentsData?.data || []

  const radarListings = Array.isArray(radarData)
    ? radarData
    : radarData?.data || []

  // Derived stats
  const totalTournaments = tournaments.length
  const activeTournaments = tournaments.filter((t) => t.status === 'live').length
  const totalRevenue = tournaments.reduce((sum, t) => sum + (t.total_cost || 0), 0)
  const brandName = orgProfile?.brand_name || userProfile?.full_name || 'Organizer'

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* ----------------------------------------------------------------- */}
      {/* Welcome Header                                                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, <span className="text-violet-400">{brandName}</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Here is what is happening with your tournaments today.
          </p>
        </div>
        <QuickActions navigate={navigate} />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Stat Cards                                                        */}
      {/* ----------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Trophy}
          label="Total Tournaments"
          value={orgLoading ? '...' : totalTournaments}
        />
        <StatCard
          icon={Zap}
          label="Active Tournaments"
          value={orgLoading ? '...' : activeTournaments}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={orgLoading ? '...' : formatEGP(totalRevenue)}
        />
        <StatCard
          icon={Shield}
          label="Verification"
          value={
            orgLoading ? (
              '...'
            ) : isVerified ? (
              <span className="text-green-400">Verified</span>
            ) : (
              <span className="text-yellow-400">Unverified</span>
            )
          }
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Recent Tournaments                                                */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Tournaments</h2>
          <button
            onClick={() => navigate('/organizer/tournaments')}
            className="text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {tournamentsLoading ? (
          <SectionLoader />
        ) : tournaments.length === 0 ? (
          <EmptyState
            icon={Trophy}
            message="No tournaments yet. Build your first tournament to get started."
          />
        ) : (
          <div className="grid gap-3">
            {tournaments.map((t) => (
              <RecentTournamentCard
                key={t.id}
                tournament={t}
                onClick={() => navigate(`/organizer/tournaments/${t.id}/manage`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Sponsorship Radar Feed                                            */}
      {/* ----------------------------------------------------------------- */}
      {isVerified && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Sponsorship Radar</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Open tournaments seeking co-organizers
              </p>
            </div>
            <button
              onClick={() => navigate('/organizer/radar')}
              className="text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-1 transition-colors"
            >
              Browse all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {radarLoading ? (
            <SectionLoader />
          ) : radarListings.length === 0 ? (
            <EmptyState
              icon={Radar}
              message="No open radar listings right now. Check back soon."
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {radarListings.map((listing) => (
                <RadarCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/organizer/radar/${listing.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Build It For Me CTA */}
      <section className="rounded-xl border border-blue-500/20 bg-blue-900/10 p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/15 shrink-0">
            <Headphones className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">Want us to build it for you?</h3>
            <p className="text-sm text-gray-400 mt-1">
              HERU consultants can plan, staff, fund, and execute your entire event from scratch.
              Request a consultation and our team will reach out within 24 hours.
            </p>
          </div>
          <button
            onClick={() => navigate('/organizer/profile')}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            Request Consultation <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Nudge for unverified organizers */}
      {!orgLoading && !isVerified && (
        <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium">Get Verified</h3>
              <p className="text-sm text-gray-400 mt-1">
                Verified organizers can access the Sponsorship Radar to find co-organizers
                and sponsors for shared tournaments. Complete your profile to apply for
                verification.
              </p>
              <button
                onClick={() => navigate('/organizer/profile')}
                className="mt-3 text-sm text-yellow-400 hover:text-yellow-300 inline-flex items-center gap-1 transition-colors"
              >
                Complete profile <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
