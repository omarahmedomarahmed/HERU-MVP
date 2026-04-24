import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import OrganizerLayout from '@/components/layouts/OrganizerLayout'
import {
  Radio, Search, Calendar, ChevronRight, Loader2,
  Package, TrendingUp, Star, Target, CheckCircle, AlertCircle,
} from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

function PackageRow({ pkg, sponsors = [] }) {
  const sold = sponsors.filter(s => s.package_id === pkg.id).length
  const totalRaised = sponsors
    .filter(s => s.package_id === pkg.id && s.payment_status === 'paid')
    .reduce((sum, s) => sum + (s.amount || pkg.price || 0), 0)

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{pkg.title}</p>
          <p className="text-xs text-gray-400">{fmtEGP(pkg.price)} · {pkg.tier || 'Standard'} tier</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-white">{fmtEGP(totalRaised)}</p>
        <p className="text-xs text-gray-500">{sold} sponsor{sold !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}

function TournamentRadarCard({ tournament, packages = [], sponsors = [] }) {
  const navigate = useNavigate()
  const myPackages = packages.filter(p => p.tournament_id === tournament.id)
  const mySponsors = sponsors.filter(s => s.tournament_id === tournament.id)
  const totalRaised = mySponsors
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + (s.amount || 0), 0)
  const totalPackageValue = myPackages.reduce((sum, p) => sum + (p.price || 0), 0)
  const pct = totalPackageValue > 0 ? Math.round((totalRaised / totalPackageValue) * 100) : 0

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">{tournament.game}</p>
            <h3 className="text-white font-black text-base">{tournament.name}</h3>
            {tournament.schedule && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(tournament.schedule).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            {tournament.sponsorship_enabled ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> On Radar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
                Not Listed
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        {myPackages.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Sponsorship raised</span>
              <span className="text-xs font-bold text-white">{pct}%</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{fmtEGP(totalRaised)} raised</span>
              <span className="text-xs text-gray-500">{fmtEGP(totalPackageValue)} total</span>
            </div>
          </div>
        )}
      </div>

      {/* Packages */}
      <div className="p-5">
        {myPackages.length === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No packages created yet</p>
            <button
              onClick={() => navigate(`/organizer/tournaments/${tournament.id}/manage`)}
              className="mt-2 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              Set up packages →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {myPackages.map(pkg => (
              <PackageRow key={pkg.id} pkg={pkg} sponsors={mySponsors} />
            ))}
          </div>
        )}

        <button
          onClick={() => navigate(`/organizer/tournaments/${tournament.id}/manage`)}
          className="w-full mt-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
        >
          Manage Tournament <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function OrganizerRadar() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const { data: rawTournaments = [], isLoading: tLoading } = useQuery({
    queryKey: ['organizer-radar-tournaments', user?.id],
    queryFn: () => apiCall('/tournaments?my=true&limit=50'),
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const { data: rawPackages = [] } = useQuery({
    queryKey: ['organizer-radar-packages', user?.id],
    queryFn: () => apiCall('/sponsorship-packages?my=true'),
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const { data: rawSponsors = [] } = useQuery({
    queryKey: ['organizer-radar-sponsors', user?.id],
    queryFn: () => apiCall('/sponsorships?my_tournament=true'),
    enabled: !!user?.id,
    staleTime: 60_000,
  })

  const tournaments = Array.isArray(rawTournaments) ? rawTournaments : rawTournaments.data || []
  const packages = Array.isArray(rawPackages) ? rawPackages : rawPackages.data || []
  const sponsors = Array.isArray(rawSponsors) ? rawSponsors : rawSponsors.data || []

  const filtered = tournaments.filter(t =>
    !search || t.name?.toLowerCase().includes(search.toLowerCase())
  )

  const listedCount = tournaments.filter(t => t.sponsorship_enabled).length
  const totalRaised = sponsors.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + (s.amount || 0), 0)
  const totalPackages = packages.length

  return (
    <OrganizerLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Sponsorship Radar</h1>
            <p className="text-sm text-gray-400 mt-1">Track your sponsorship packages and sponsor interest per tournament</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { icon: Radio,      label: 'On Radar',       value: listedCount,             color: 'text-green-400' },
            { icon: Package,    label: 'Active Packages', value: totalPackages,           color: 'text-red-400' },
            { icon: TrendingUp, label: 'Total Raised',    value: fmtEGP(totalRaised),    color: 'text-amber-400' },
          ].map((s, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
              <s.icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
              <div>
                <p className="text-white font-black text-xl">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tournaments..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {tLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Radio className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold text-lg">No tournaments yet</p>
            <p className="text-gray-600 text-sm mt-1">Create a tournament and add sponsorship packages to appear on radar</p>
            <Link
              to="/organizer/tournaments/new"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
            >
              Build a Tournament
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(tournament => (
              <TournamentRadarCard
                key={tournament.id}
                tournament={tournament}
                packages={packages}
                sponsors={sponsors}
              />
            ))}
          </div>
        )}
      </div>
    </OrganizerLayout>
  )
}
