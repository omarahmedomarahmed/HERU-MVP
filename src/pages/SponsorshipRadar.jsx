import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import HeruLogo from '@/components/shared/HeruLogo'
import {
  Radar, Search, Trophy, Calendar, ArrowRight, Star,
  Zap, TrendingUp, Target, ChevronRight, Package,
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

function TournamentCard({ tournament, packages = [] }) {
  const minPrice = packages.length > 0 ? Math.min(...packages.map(p => p.price || 0)) : 0
  const totalReach = packages.reduce((s, p) => s + (p.reach_estimate || 0), 0)

  return (
    <div className={`rounded-2xl overflow-hidden border border-zinc-800/80 bg-gradient-to-br ${getGradient(tournament.game)} hover:border-zinc-700 transition-all group`}>
      {tournament.tournament_image && (
        <div className="h-32 overflow-hidden">
          <img src={tournament.tournament_image} alt={tournament.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">{tournament.game}</p>
            <h3 className="text-white font-black text-base leading-snug">{tournament.name}</h3>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 uppercase whitespace-nowrap flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            OPEN
          </span>
        </div>

        {tournament.schedule && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(tournament.schedule).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}

        {/* Packages preview */}
        {packages.length > 0 ? (
          <div className="space-y-2 mb-4">
            {packages.slice(0, 2).map((pkg) => (
              <div key={pkg.id} className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-zinc-700/50">
                <span className="text-xs font-bold text-white">{pkg.title}</span>
                <span className="text-xs font-black text-red-400">{fmtEGP(pkg.price)}</span>
              </div>
            ))}
            {packages.length > 2 && (
              <p className="text-xs text-gray-500 text-center">+{packages.length - 2} more packages</p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-600 mb-4">Packages coming soon</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            {minPrice > 0 && (
              <p className="text-xs text-gray-400">From <span className="text-white font-bold">{fmtEGP(minPrice)}</span></p>
            )}
            {totalReach > 0 && (
              <p className="text-xs text-gray-500">{totalReach.toLocaleString()} est. reach</p>
            )}
          </div>
          <Link
            to={`/auth/sponsor/login`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
          >
            View Packages <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function SponsorshipRadar() {
  const { userRole } = useAuth()
  const navigate = useNavigate()
  const [gameFilter, setGameFilter] = useState('All')
  const [search, setSearch] = useState('')

  // Redirect organizers to their radar
  if (userRole === 'organizer') {
    navigate('/organizer/radar', { replace: true })
    return null
  }
  // Redirect sponsors to their sponsor radar
  if (userRole === 'sponsor') {
    navigate('/sponsor/radar', { replace: true })
    return null
  }

  const { data: rawTournaments = [], isLoading: tLoading } = useQuery({
    queryKey: ['public-radar-tournaments'],
    queryFn: () => apiCall('/tournaments?sponsorship_enabled=true&status=published'),
    staleTime: 60_000,
  })

  const { data: rawPackages = [] } = useQuery({
    queryKey: ['public-radar-packages'],
    queryFn: () => apiCall('/sponsorship-packages?status=active'),
    staleTime: 60_000,
  })

  const tournaments = Array.isArray(rawTournaments) ? rawTournaments : rawTournaments.data || []
  const packages = Array.isArray(rawPackages) ? rawPackages : rawPackages.data || []

  const games = ['All', ...new Set(tournaments.map(t => t.game).filter(Boolean))]

  const filtered = tournaments.filter(t => {
    const matchGame = gameFilter === 'All' || t.game === gameFilter
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase())
    return matchGame && matchSearch
  })

  const totalPackages = packages.length
  const minPackagePrice = packages.length > 0 ? Math.min(...packages.map(p => p.price || 0)) : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-400">
            <Link to="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
            <Link to="/radar" className="text-red-400 font-bold">Radar</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth/sponsor/login" className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors">
              Sponsor Login
            </Link>
            <Link to="/auth/sponsor/register" className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors">
              Register as Sponsor
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {filtered.length} tournaments seeking sponsors
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              Sponsorship<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Radar</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-xl">
              Browse structured sponsorship packages from verified organizers across the MENA esports scene.
              Clear deliverables. Clear pricing. Real ROI.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/auth/sponsor/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors shadow-lg shadow-red-900/30"
              >
                <Zap className="w-4 h-4" /> Register as Sponsor
              </Link>
              <Link
                to="/auth/sponsor/login"
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
            { icon: TrendingUp, label: 'Open Tournaments',    value: filtered.length },
            { icon: Package,    label: 'Active Packages',     value: totalPackages },
            { icon: Target,     label: 'Packages From',       value: minPackagePrice > 0 ? fmtEGP(minPackagePrice) : 'TBA' },
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

        {tLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-2xl bg-zinc-800/40 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Radar className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold text-lg">No open sponsorship listings</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon for new tournaments seeking sponsors</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(tournament => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                packages={packages.filter(p => p.tournament_id === tournament.id)}
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
            Put your brand where gamers are
          </h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Register as a sponsor on HERU.gg. Browse structured packages, buy in minutes, track your ROI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auth/sponsor/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors shadow-lg shadow-red-900/30"
            >
              <Zap className="w-4 h-4" /> Create Sponsor Account
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
    </div>
  )
}
