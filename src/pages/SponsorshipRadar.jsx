import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SponsorshipRadar as RadarAPI } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import HeruLogo from '@/components/shared/HeruLogo'
import {
  Radar, Search, Trophy, Users, Calendar, ArrowRight, Shield,
  Zap, Star, TrendingUp, Award, Target, Gamepad2, Lock, ChevronRight, X
} from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (Number(n) || 0).toLocaleString()

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

function getGradient(game) {
  return GAME_GRADIENTS[game] || 'from-red-900/60 to-zinc-900'
}

function StatusBadge({ status }) {
  const map = {
    open:         { label: 'OPEN',         cls: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
    in_progress:  { label: 'IN PROGRESS',  cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',  dot: 'bg-amber-400' },
    fully_funded: { label: 'FULLY FUNDED', cls: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',     dot: 'bg-cyan-400' },
    closed:       { label: 'CLOSED',       cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',     dot: 'bg-zinc-500' },
  }
  const s = map[status] || map.open
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${status === 'open' ? 'animate-pulse' : ''}`} />
      {s.label}
    </span>
  )
}

function FundingBar({ percent }) {
  const pct = Math.min(percent || 0, 100)
  return (
    <div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(to right, #10b981, #06b6d4)'
              : 'linear-gradient(to right, #ef4444, #dc2626)',
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span className="font-medium text-red-400">{Math.round(pct)}% funded</span>
        <span>{100 - Math.round(pct)}% remaining</span>
      </div>
    </div>
  )
}

// Public card — shows info but directs non-organizers to register
function PublicRadarCard({ listing, onSignUpClick }) {
  const brandName = listing.main_organizer_brand?.name || listing.main_organizer_brand?.brand_name || 'Organizer'
  const brandLogo = listing.main_organizer_brand?.logo || listing.main_organizer_brand?.brand_logo
  const coOrgs = listing.co_organizers || []
  const slotsTotal = listing.max_co_organizers || 2
  const slotsLeft = Math.max(0, slotsTotal - coOrgs.length)

  return (
    <div className="rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-900/60 hover:border-red-500/30 transition-all duration-300 group">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden">
        {listing.tournament_image ? (
          <img src={listing.tournament_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(listing.game)}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-xs text-white font-medium backdrop-blur-sm">
            <Gamepad2 className="w-3 h-3 text-red-400" />{listing.game || 'TBD'}
          </span>
          <StatusBadge status={listing.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Organizer — clickable */}
        <Link
          to={`/organizer/${listing.main_organizer_id}`}
          className="flex items-center gap-2 mb-2 w-fit group/brand"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-6 h-6 rounded border border-white/10 overflow-hidden flex items-center justify-center bg-zinc-800 flex-shrink-0">
            {brandLogo
              ? <img src={brandLogo} alt="" className="w-full h-full object-cover" />
              : <span className="text-[9px] font-black text-white">{brandName[0]}</span>}
          </div>
          <span className="text-gray-500 text-xs hover:text-red-400 transition-colors">{brandName}</span>
          {listing.main_organizer_brand?.is_verified && <Shield className="w-3 h-3 text-green-400" />}
        </Link>

        <h3 className="text-white font-bold text-sm leading-tight mb-1 group-hover:text-red-300 transition-colors line-clamp-2">
          {listing.tournament_name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          {listing.schedule && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(listing.schedule).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {listing.prizepool_amount > 0 && (
            <span className="flex items-center gap-1 text-yellow-400 font-bold">
              <Award className="w-3 h-3" />{fmtEGP(listing.prizepool_amount)}
            </span>
          )}
          <span className="ml-auto">{fmtEGP(listing.total_cost)}</span>
        </div>

        <FundingBar percent={listing.funding_percent} />

        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-bold ${slotsLeft > 0 ? 'text-green-400' : 'text-gray-500'}`}>
            {slotsLeft > 0 ? `${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} open` : 'All slots filled'}
          </span>
          <button
            onClick={onSignUpClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-600/30 transition-colors"
          >
            <Lock className="w-3 h-3" /> Join as Organizer
          </button>
        </div>
      </div>
    </div>
  )
}

// Sign-up prompt modal
function SignUpPrompt({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Radar className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Organizers Only</h3>
          <p className="text-gray-400 text-sm mb-6">
            The Sponsorship Radar is exclusively for esports organizers. Register your brand and start co-organizing tournaments.
          </p>
          <div className="space-y-3">
            <Link
              to="/auth/organizer/register"
              className="block w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors text-center"
            >
              Register as Organizer
            </Link>
            <Link
              to="/auth/organizer/login"
              className="block w-full px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-bold text-sm transition-colors text-center"
            >
              Sign in to Existing Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SponsorshipRadar() {
  const { user, userRole } = useAuth()
  const navigate = useNavigate()
  const [showSignUp, setShowSignUp] = useState(false)
  const [gameFilter, setGameFilter] = useState('All')
  const [search, setSearch] = useState('')

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['public-radar'],
    queryFn: () => RadarAPI.list({ status: 'open' }),
    staleTime: 60_000,
  })

  // If organizer is logged in, redirect to organizer radar
  if (userRole === 'organizer') {
    navigate('/organizer/radar', { replace: true })
    return null
  }

  const games = ['All', ...new Set(listings.map(l => l.game).filter(Boolean))]

  const filtered = listings.filter(l => {
    const matchGame = gameFilter === 'All' || l.game === gameFilter
    const matchSearch = !search || l.tournament_name?.toLowerCase().includes(search.toLowerCase())
    return matchGame && matchSearch && l.status !== 'closed'
  })

  const openCount = listings.filter(l => l.status === 'open').length
  const totalPrize = listings.reduce((s, l) => s + (l.prizepool_amount || 0), 0)
  const totalValue = listings.reduce((s, l) => s + (l.total_cost || 0), 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <HeruLogo className="h-7" />
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-400">
            <Link to="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
            <Link to="/radar" className="text-red-400 font-bold">Radar</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth/organizer/login" className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors">
              Organizer Login
            </Link>
            <Link to="/auth/organizer/register" className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors">
              Register Brand
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/50">
        {/* Radar animation */}
        <div className="absolute right-0 top-0 w-96 h-96 opacity-10 pointer-events-none">
          {[140, 100, 65, 35].map((size, i) => (
            <div key={i} className="absolute top-1/2 right-16 -translate-y-1/2 rounded-full border border-red-500"
              style={{ width: size * 2, height: size * 2, marginLeft: -size, marginTop: -size, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {openCount} tournaments seeking co-organizers
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Sponsorship<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Radar</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              Browse live tournaments seeking co-organizers and sponsors across the MENA esports scene.
              Register your brand to commit and co-build major events.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/auth/organizer/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-900/30"
              >
                <Zap className="w-4 h-4" /> Register Your Brand
              </Link>
              <Link
                to="/auth/organizer/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-colors"
              >
                Sign In <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-3 divide-x divide-zinc-800">
          {[
            { icon: TrendingUp, label: 'Open Listings', value: openCount },
            { icon: Trophy,     label: 'Total Prize Pool', value: fmtEGP(totalPrize) },
            { icon: Target,     label: 'Total Value', value: fmtEGP(totalValue) },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-4 first:pl-0 last:pr-0">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <s.icon className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white font-black text-lg leading-none">{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tournaments..."
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {games.slice(0, 6).map(g => (
              <button
                key={g}
                onClick={() => setGameFilter(g)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  gameFilter === g
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl bg-zinc-800/40 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Radar className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold text-lg">No open listings found</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon or register as an organizer to create your own</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(listing => (
              <PublicRadarCard
                key={listing.id}
                listing={listing}
                onSignUpClick={() => setShowSignUp(true)}
              />
            ))}
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-red-900/20 to-zinc-900 border border-red-500/20 p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <Star className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Ready to co-organize?
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Register your brand on HERU.gg, commit to tournaments, and build the MENA esports ecosystem together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth/organizer/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-900/30"
            >
              <Zap className="w-4 h-4" /> Create Organizer Account
            </Link>
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
            >
              Browse Tournaments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {showSignUp && <SignUpPrompt onClose={() => setShowSignUp(false)} />}
    </div>
  )
}
