import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import {
  Radio, Search, Gamepad2, Calendar, ChevronRight,
  Loader2, Shield, Filter, Users, Trophy, Zap,
  Star, TrendingUp, Award, Target, CheckCircle
} from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const STATUS_CONFIG = {
  open:         { label: 'Open',         cls: 'bg-green-500/20 text-green-400 border-green-500/30',    dot: 'bg-green-400' },
  in_progress:  { label: 'In Progress',  cls: 'bg-violet-500/20 text-violet-400 border-violet-500/30', dot: 'bg-violet-400' },
  fully_funded: { label: 'Fully Funded', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',       dot: 'bg-cyan-400' },
  closed:       { label: 'Closed',       cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',       dot: 'bg-zinc-500' },
}

const GAME_GRADIENTS = {
  'Valorant':          'from-red-900/80 to-pink-900/60',
  'CS2':               'from-orange-900/80 to-yellow-900/60',
  'League of Legends': 'from-blue-900/80 to-cyan-900/60',
  'PUBG':              'from-yellow-900/80 to-amber-900/60',
  'FIFA':              'from-green-900/80 to-emerald-900/60',
  'Fortnite':          'from-purple-900/80 to-violet-900/60',
  'Apex Legends':      'from-red-900/80 to-orange-900/60',
  'Dota 2':            'from-red-950/80 to-rose-900/60',
}

function getGameGradient(game) {
  return GAME_GRADIENTS[game] || 'from-violet-900/80 to-indigo-900/60'
}

function StatusBadge({ status }) {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.open
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'open' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  )
}

function FundingBar({ percent }) {
  const pct = Math.min(percent || 0, 100)
  return (
    <div>
      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : 'linear-gradient(to right, #7c3aed, #2563eb)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs text-gray-500">
        <span className="font-medium text-violet-400">{Math.round(pct)}% funded</span>
        <span>{100 - Math.round(pct)}% remaining</span>
      </div>
    </div>
  )
}

// ── Featured (large) card ───────────────────────────────────────────────────
function FeaturedCard({ listing, isSelf, onClick }) {
  const brandName = listing.main_organizer_brand?.name || listing.main_organizer_brand?.brand_name || 'Unknown Organizer'
  const brandLogo = listing.main_organizer_brand?.logo || listing.main_organizer_brand?.brand_logo
  const coOrgs = listing.co_organizers || []
  const slotsTotal = listing.max_co_organizers || 2
  const slotsUsed = coOrgs.length
  const slotsLeft = slotsTotal - slotsUsed
  const gradient = getGameGradient(listing.game)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all duration-300 group relative"
      style={{ minHeight: 320 }}
    >
      {/* Background image or gradient */}
      {listing.tournament_image ? (
        <img
          src={listing.tournament_image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f1a]/80 to-transparent" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-bold text-white backdrop-blur-sm">
          <Gamepad2 className="w-3.5 h-3.5 text-violet-400" />
          {listing.game || 'TBD'}
        </span>
        <StatusBadge status={listing.status} />
      </div>

      {/* Content */}
      <div className="relative p-6 pt-16 flex flex-col justify-end" style={{ minHeight: 320 }}>
        {/* Organizer brand */}
        <Link
          to={`/organizer/${listing.main_organizer_id}`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-2 mb-3 w-fit group/brand"
        >
          <div className="w-8 h-8 rounded-lg border border-white/20 overflow-hidden flex items-center justify-center bg-zinc-800/80 backdrop-blur-sm">
            {brandLogo
              ? <img src={brandLogo} alt="" className="w-full h-full object-cover" />
              : <span className="text-xs font-black text-white">{brandName[0]}</span>}
          </div>
          <span className="text-gray-300 text-sm font-medium group-hover/brand:text-violet-300 transition-colors">
            {brandName}
          </span>
          {(listing.main_organizer_brand?.is_verified) && (
            <Shield className="w-3.5 h-3.5 text-green-400" />
          )}
        </Link>

        <h2 className="text-2xl font-black text-white mb-1 group-hover:text-violet-200 transition-colors leading-tight">
          {listing.tournament_name}
        </h2>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
          {listing.schedule && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(listing.schedule).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {listing.prizepool_amount > 0 && (
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <Award className="w-3.5 h-3.5" />
              {fmtEGP(listing.prizepool_amount)} Prize
            </span>
          )}
          <span className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            {fmtEGP(listing.total_cost)} Total
          </span>
        </div>

        {/* Funding bar */}
        <div className="mb-4">
          <FundingBar percent={listing.funding_percent} />
        </div>

        {/* Bottom row: slots + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Co-org avatars */}
            {coOrgs.length > 0 && (
              <div className="flex -space-x-2">
                {coOrgs.slice(0, 3).map((co, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0f0f1a] bg-zinc-700 overflow-hidden flex items-center justify-center">
                    {co.brand_logo
                      ? <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[9px] font-black text-white">{(co.brand_name || '?')[0]}</span>}
                  </div>
                ))}
              </div>
            )}
            <span className="text-xs text-gray-400">
              {slotsLeft > 0 ? (
                <span className="text-green-400 font-bold">{slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} open</span>
              ) : (
                <span className="text-gray-500">All slots filled</span>
              )}
            </span>
          </div>

          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
            isSelf
              ? 'bg-white/5 border border-white/10 text-gray-400'
              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40 group-hover:shadow-violet-900/60'
          }`}>
            {isSelf ? (
              <><Shield className="w-4 h-4" /> Your Tournament</>
            ) : (
              <><Zap className="w-4 h-4" /> View & Commit</>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

// ── Standard (compact) card ─────────────────────────────────────────────────
function RadarCard({ listing, isSelf, onClick }) {
  const brandName = listing.main_organizer_brand?.name || listing.main_organizer_brand?.brand_name || 'Unknown Organizer'
  const brandLogo = listing.main_organizer_brand?.logo || listing.main_organizer_brand?.brand_logo
  const coOrgs = listing.co_organizers || []
  const slotsTotal = listing.max_co_organizers || 2
  const slotsLeft = slotsTotal - coOrgs.length

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 bg-[#1a1a2e] hover:border-violet-500/40 hover:bg-[#1e1e36] transition-all duration-200 group overflow-hidden"
    >
      {/* Mini banner */}
      <div className="relative h-24 overflow-hidden">
        {listing.tournament_image ? (
          <img src={listing.tournament_image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGameGradient(listing.game)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
        <div className="absolute top-2 right-2">
          <StatusBadge status={listing.status} />
        </div>
        <div className="absolute bottom-2 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-xs text-white font-medium backdrop-blur-sm">
            <Gamepad2 className="w-3 h-3 text-violet-400" />{listing.game}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded border border-white/10 overflow-hidden flex items-center justify-center bg-zinc-800 flex-shrink-0">
            {brandLogo
              ? <img src={brandLogo} alt="" className="w-full h-full object-cover" />
              : <span className="text-[9px] font-black text-white">{brandName[0]}</span>}
          </div>
          <span className="text-gray-500 text-xs truncate">{brandName}</span>
        </div>

        <h3 className="text-white font-bold text-sm leading-tight mb-3 group-hover:text-violet-300 transition-colors line-clamp-2">
          {listing.tournament_name}
        </h3>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{fmtEGP(listing.total_cost)}</span>
          {listing.prizepool_amount > 0 && (
            <span className="text-yellow-400 font-bold">{fmtEGP(listing.prizepool_amount)} prize</span>
          )}
        </div>

        <FundingBar percent={listing.funding_percent} />

        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-bold ${slotsLeft > 0 ? 'text-green-400' : 'text-gray-500'}`}>
            {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} open` : 'Full'}
          </span>
          <span className="text-violet-400 text-xs font-bold flex items-center gap-1">
            {isSelf ? 'Your listing' : <>View <ChevronRight className="w-3 h-3" /></>}
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Radar Header Animation ───────────────────────────────────────────────────
function RadarHeader() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f0f1a] to-[#1a0f2e] border border-violet-500/20 p-8 mb-8">
      {/* Animated radar rings */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none">
        {[140, 100, 60, 30].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-violet-400"
            style={{
              width: size,
              height: size,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `ping ${2 + i * 0.5}s cubic-bezier(0,0,0.2,1) infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
        <Radio className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-violet-400" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <Radio className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Sponsorship Radar</h1>
            <p className="text-violet-300/70 text-sm">Find tournaments to co-organize or sponsor</p>
          </div>
        </div>
        <p className="text-gray-400 text-sm max-w-xl mt-3">
          Commit your share to join a tournament as a co-organizer (33%) or exclusive sponsor (66%).
          Pay your invoice and unlock full access to the tournament workspace.
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300">
            <Star className="w-3.5 h-3.5" /> 33% = Co-Organizer (2 slots)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
            <TrendingUp className="w-3.5 h-3.5" /> 66% = Exclusive Sponsor (1 slot)
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function OrganizerRadar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('browse')
  const [gameFilter, setGameFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')

  const { data: radarData = [], isLoading } = useQuery({
    queryKey: ['radar-listings', statusFilter],
    queryFn: () => apiCall(`/radar?status=${statusFilter === 'all' ? 'all' : statusFilter}&limit=50`),
    enabled: !!user,
    staleTime: 30_000,
  })

  // Fetch ALL radar listings to find ones where user is co-organizer
  const { data: allRadarData = [] } = useQuery({
    queryKey: ['radar-all-listings'],
    queryFn: () => apiCall('/radar?status=all&limit=200'),
    enabled: !!user,
    staleTime: 60_000,
  })

  const allListings = Array.isArray(radarData) ? radarData : (radarData?.data || [])
  const allRadarListings = Array.isArray(allRadarData) ? allRadarData : (allRadarData?.data || [])

  // My commitments = listings where I'm in co_organizers
  const myCommitments = useMemo(() => {
    return allRadarListings.filter(l =>
      (l.co_organizers || []).some(co => co.organizer_id === user?.id)
    )
  }, [allRadarListings, user?.id])

  const gameOptions = useMemo(() => {
    const games = [...new Set(allListings.map(l => l.game).filter(Boolean))].sort()
    return games
  }, [allListings])

  const listings = useMemo(() => {
    let result = allListings
    if (gameFilter !== 'all') result = result.filter(l => l.game === gameFilter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(l =>
        (l.tournament_name || '').toLowerCase().includes(q) ||
        (l.game || '').toLowerCase().includes(q) ||
        (l.main_organizer_brand?.name || l.main_organizer_brand?.brand_name || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [allListings, gameFilter, searchQuery])

  const featuredListings = listings.slice(0, 2)
  const restListings = listings.slice(2)

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <RadarHeader />

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'browse' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            Browse Radar
          </button>
          <button
            onClick={() => setActiveTab('commitments')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${activeTab === 'commitments' ? 'border-violet-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
          >
            My Commitments
            {myCommitments.length > 0 && (
              <span className="text-[10px] bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full font-bold">{myCommitments.length}</span>
            )}
          </button>
        </div>

        {/* My Commitments Tab */}
        {activeTab === 'commitments' && (
          <div className="space-y-4">
            {myCommitments.length === 0 ? (
              <div className="flex flex-col items-center py-20 text-gray-500">
                <Shield className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">No commitments yet</p>
                <p className="text-xs text-gray-600 mt-1">Commit to a tournament from the Browse tab</p>
                <button onClick={() => setActiveTab('browse')} className="mt-4 text-violet-400 text-sm hover:text-violet-300 transition-colors">Browse Radar →</button>
              </div>
            ) : (
              myCommitments.map(listing => {
                const myEntry = (listing.co_organizers || []).find(co => co.organizer_id === user?.id)
                const mainBrand = listing.main_organizer_brand?.name || listing.main_organizer_brand?.brand_name || 'Main Organizer'
                return (
                  <div key={listing.id} className="rounded-xl border border-violet-500/20 bg-[#1a1a2e] p-5 hover:border-violet-500/40 transition-all cursor-pointer" onClick={() => navigate(`/organizer/radar/${listing.id}`)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold uppercase">
                            {myEntry?.label || 'Co-Organizer'}
                          </span>
                          <StatusBadge status={listing.status} />
                        </div>
                        <h3 className="text-white font-bold text-sm truncate">{listing.tournament_name}</h3>
                        <p className="text-gray-500 text-xs mt-0.5">{listing.game} · by {mainBrand}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-violet-400 font-black text-lg">{myEntry?.percent || 0}%</p>
                        <p className="text-gray-500 text-xs">{fmtEGP(myEntry?.amount || 0)}</p>
                        {myEntry?.access_granted ? (
                          <span className="text-[10px] text-green-400 font-bold flex items-center gap-1 justify-end mt-1">
                            <CheckCircle className="w-3 h-3" /> Access Granted
                          </span>
                        ) : (
                          <span className="text-[10px] text-yellow-400 mt-1 block">Awaiting Payment</span>
                        )}
                      </div>
                    </div>
                    <FundingBar percent={listing.funding_percent} />
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'browse' && (
        <>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tournaments, games, organizers..."
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 transition"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={gameFilter}
                onChange={e => setGameFilter(e.target.value)}
                className="appearance-none bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition cursor-pointer"
              >
                <option value="all">All Games</option>
                {gameOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#1a1a2e] border border-white/10 rounded-xl pl-10 pr-8 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition cursor-pointer"
              >
                <option value="open">Open Only</option>
                <option value="in_progress">In Progress</option>
                <option value="all">All Listings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-6 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6 relative">
              <Radio className="w-12 h-12 text-violet-400" />
              <div className="absolute inset-0 rounded-2xl border border-violet-400/20 animate-ping" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">No tournaments on the radar</h3>
            <p className="text-gray-500 text-sm max-w-sm">
              {allListings.length > 0
                ? 'Try adjusting your search or filters.'
                : 'Check back soon. Organizers will list tournaments here seeking co-organizers and sponsors.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-violet-400" />
              {listings.length} tournament{listings.length !== 1 ? 's' : ''} seeking partners
            </p>

            {/* Featured cards (first 2, full-width or 2-col) */}
            {featuredListings.length > 0 && (
              <div className={`grid gap-4 mb-4 ${featuredListings.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                {featuredListings.map(listing => (
                  <FeaturedCard
                    key={listing.id}
                    listing={listing}
                    isSelf={listing.main_organizer_id === user?.id}
                    onClick={() => navigate(`/organizer/radar/${listing.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Rest of listings grid */}
            {restListings.length > 0 && (
              <>
                {featuredListings.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 mt-6">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-xs text-gray-600 font-medium">More Listings</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {restListings.map(listing => (
                    <RadarCard
                      key={listing.id}
                      listing={listing}
                      isSelf={listing.main_organizer_id === user?.id}
                      onClick={() => navigate(`/organizer/radar/${listing.id}`)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
        </>
        )}
      </div>
    </div>
  )
}
