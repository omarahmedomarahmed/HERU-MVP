import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { SponsorshipRadar, OrganizerProfile } from '@/api/heruClient'
import {
  Radar, Search, Gamepad2, DollarSign, ChevronRight,
  Loader2, Shield, Filter, Users, Calendar,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

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

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Radar Card
// ---------------------------------------------------------------------------

function RadarCard({ listing, onClick }) {
  const percentFunded = listing.funding_percent || 0
  const amountNeeded = listing.amount_still_needed || 0
  const totalCost = listing.total_cost || 0
  const coOrgs = listing.co_organizers || []
  const slotsUsed = coOrgs.length
  const maxSlots = listing.max_co_organizers || 2

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 bg-[#1a1a2e] p-5 hover:border-violet-500/40 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-semibold text-base truncate group-hover:text-violet-300 transition-colors">
            {listing.tournament_name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
            {listing.game && (
              <span className="inline-flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5" />
                {listing.game}
              </span>
            )}
            {listing.schedule && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {listing.schedule}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors shrink-0 mt-1" />
      </div>

      {/* Organizer brand */}
      {listing.main_organizer_brand && (
        <div className="flex items-center gap-2 mb-3">
          {listing.main_organizer_brand.brand_logo && (
            <img
              src={listing.main_organizer_brand.brand_logo}
              alt=""
              className="w-5 h-5 rounded-full object-cover bg-white/5"
            />
          )}
          <span className="text-xs text-gray-500">
            by {listing.main_organizer_brand.brand_name || 'Unknown Organizer'}
          </span>
        </div>
      )}

      {/* Cost + slots */}
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-gray-400 flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />
          Total: {formatEGP(totalCost)}
        </span>
        <span className="text-gray-500 flex items-center gap-1 text-xs">
          <Users className="w-3 h-3" />
          {slotsUsed}/{maxSlots} slots
        </span>
      </div>

      {/* Funding bar */}
      <FundingBar percent={percentFunded} />
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="text-gray-500">{Math.round(percentFunded)}% funded</span>
        <span className="text-red-400 font-medium">{formatEGP(amountNeeded)} needed</span>
      </div>

      {/* Description preview */}
      {listing.description && (
        <p className="text-xs text-gray-500 mt-3 line-clamp-2">{listing.description}</p>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OrganizerRadar() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const [gameFilter, setGameFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch organizer profile for verification status
  const { data: orgProfile } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => OrganizerProfile.me(),
    enabled: !!user,
    staleTime: 60_000,
  })

  const isVerified = orgProfile?.is_verified ?? userProfile?.is_verified ?? false

  // Fetch open radar listings
  const {
    data: radarData,
    isLoading,
  } = useQuery({
    queryKey: ['radar-open'],
    queryFn: () => SponsorshipRadar.list({ status: 'open' }),
    enabled: !!user,
    staleTime: 30_000,
  })

  // Normalize
  const allListings = Array.isArray(radarData) ? radarData : radarData?.data || []

  // Unique games for the filter dropdown
  const gameOptions = useMemo(() => {
    const games = [...new Set(allListings.map((l) => l.game).filter(Boolean))]
    return games.sort()
  }, [allListings])

  // Filtered listings
  const listings = useMemo(() => {
    let result = allListings
    if (gameFilter !== 'all') {
      result = result.filter((l) => l.game === gameFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          (l.tournament_name || '').toLowerCase().includes(q) ||
          (l.game || '').toLowerCase().includes(q) ||
          (l.main_organizer_brand?.brand_name || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [allListings, gameFilter, searchQuery])

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Radar className="w-7 h-7 text-violet-400" />
            Sponsorship Radar
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Find tournaments to co-organize or sponsor. Commit your share and join as a partner.
          </p>
        </div>

        {/* Verification warning */}
        {!isVerified && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 flex items-start gap-3">
            <Shield className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-white font-medium text-sm">Verification Required</h3>
              <p className="text-gray-400 text-sm mt-1">
                Get verified to join as a co-organizer or sponsor. Complete your organizer profile to apply.
              </p>
              <button
                onClick={() => navigate('/organizer/profile')}
                className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 inline-flex items-center gap-1 transition-colors"
              >
                Complete profile <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Filters                                                           */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 transition"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="appearance-none bg-[#1a1a2e] border border-white/10 rounded-lg pl-10 pr-8 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition cursor-pointer"
            >
              <option value="all">All Games</option>
              {gameOptions.map((game) => (
                <option key={game} value={game}>{game}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Listings Grid                                                     */}
        {/* ----------------------------------------------------------------- */}
        {isLoading ? (
          <SectionLoader />
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Radar className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">No open radar listings</p>
            <p className="text-xs text-gray-600 mt-1">
              {allListings.length > 0
                ? 'Try adjusting your filters.'
                : 'Check back soon for new opportunities.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              {listings.length} tournament{listings.length !== 1 ? 's' : ''} seeking partners
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <RadarCard
                  key={listing.id}
                  listing={listing}
                  onClick={() => navigate(`/organizer/radar/${listing.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
