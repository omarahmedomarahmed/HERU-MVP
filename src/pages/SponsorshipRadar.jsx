import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SponsorshipRadar as RadarAPI, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { Radar, Search, Trophy, Users, DollarSign, ArrowRight, X, Check, AlertCircle, TrendingUp, Zap, Star, BarChart3, Shield } from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const GAMES = ['All Games', 'Valorant', 'League of Legends', 'CS2', 'Fortnite', 'Rocket League', 'FIFA', 'PUBG Mobile']

function formatEGP(amount) {
  if (!amount && amount !== 0) return 'EGP 0'
  return `EGP ${Number(amount).toLocaleString()}`
}

function fundingColor(percent) {
  if (percent >= 100) return 'bg-green-500'
  if (percent >= 66) return 'bg-red-500'
  if (percent >= 33) return 'bg-yellow-500'
  return 'bg-red-500'
}

function fundingTextColor(percent) {
  if (percent >= 100) return 'text-green-400'
  if (percent >= 66) return 'text-red-400'
  if (percent >= 33) return 'text-yellow-400'
  return 'text-red-400'
}

function slotsInfo(radar) {
  const maxCo = radar.max_co_organizers || 2
  const filled = (radar.co_organizers || []).length
  const remaining = Math.max(0, maxCo - filled)
  if (remaining === 0) return { text: 'Fully committed', color: 'text-green-400' }
  return { text: `${remaining} slot${remaining > 1 ? 's' : ''} available`, color: 'text-amber-400' }
}

function commitLabel(percent) {
  return percent >= 66 ? 'Sponsor' : 'Co-Organizer'
}

// ---------------------------------------------------------------------------
// Commit Modal
// ---------------------------------------------------------------------------

function CommitModal({ radar, onClose, onConfirm, isLoading }) {
  const totalCost = radar.total_cost || 0
  const amountNeeded = radar.amount_still_needed || 0
  const filledCo = (radar.co_organizers || []).length
  const maxCo = radar.max_co_organizers || 2
  const slotsLeft = Math.max(0, maxCo - filledCo)

  // Determine available commitment option(s)
  const remainingPercent = totalCost > 0 ? Math.round((amountNeeded / totalCost) * 100) : 0
  const slotPercent = slotsLeft > 0 ? Math.round(remainingPercent / slotsLeft) : remainingPercent
  const commitPercent = Math.min(slotPercent, remainingPercent)
  const commitAmount = Math.round((commitPercent / 100) * totalCost)

  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Radar className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg">Commit to Tournament</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Tournament info */}
          <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
            <p className="text-white font-bold text-sm">{radar.tournament_name}</p>
            <p className="text-gray-400 text-xs mt-1">{radar.game} &middot; {radar.schedule || 'TBD'}</p>
            <p className="text-gray-500 text-xs mt-1">
              by {radar.main_organizer_brand?.name || radar.main_organizer_brand?.brand_name || 'Unknown Organizer'}
            </p>
          </div>

          {/* Commitment breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Tournament Cost</span>
              <span className="text-white font-bold">{formatEGP(totalCost)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Amount Still Needed</span>
              <span className="text-amber-400 font-bold">{formatEGP(amountNeeded)}</span>
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your Commitment</span>
              <span className="text-red-400 font-bold">{commitPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your Amount</span>
              <span className="text-white font-extrabold text-lg">{formatEGP(commitAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Your Role</span>
              <span className={`font-bold ${commitPercent >= 66 ? 'text-purple-400' : 'text-red-400'}`}>
                {commitLabel(commitPercent)}
              </span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-400/80 text-xs leading-relaxed">
              An invoice for {formatEGP(commitAmount)} will be generated. You will receive full tournament access
              once payment is confirmed. Minimum commitment is 33% of total cost.
            </p>
          </div>

          {/* Confirm checkbox */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                confirmed
                  ? 'bg-red-500 border-red-500'
                  : 'border-zinc-600 group-hover:border-zinc-400'
              }`}
              onClick={() => setConfirmed(!confirmed)}
            >
              {confirmed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-gray-300 text-sm" onClick={() => setConfirmed(!confirmed)}>
              I understand and want to commit {formatEGP(commitAmount)} ({commitPercent}%)
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-gray-300 text-sm font-bold hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ commitment_percent: commitPercent, amount: commitAmount })}
            disabled={!confirmed || isLoading}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              confirmed && !isLoading
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(255,26,26,0.3)]'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm Commitment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Radar Card
// ---------------------------------------------------------------------------

function RadarCard({ radar, onCommit, isMyCommitment, myEntry }) {
  const funding = radar.funding_percent || 0
  const slots = slotsInfo(radar)
  const totalCost = radar.total_cost || 0
  const amountNeeded = radar.amount_still_needed || 0
  const brandName = radar.main_organizer_brand?.name || radar.main_organizer_brand?.brand_name || 'Unknown'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all group">
      {/* Card Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-bold text-base truncate group-hover:text-red-400 transition-colors">
              {radar.tournament_name || 'Untitled Tournament'}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-medium bg-zinc-800 text-gray-300 px-2 py-0.5 rounded-md">
                {radar.game || 'N/A'}
              </span>
              <span className="text-xs text-gray-500">{radar.schedule || 'TBD'}</span>
            </div>
          </div>
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
            radar.status === 'fully_funded'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : radar.status === 'in_progress'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {radar.status === 'fully_funded' ? 'Funded' : radar.status === 'in_progress' ? 'In Progress' : 'Open'}
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 mt-3">
          {radar.main_organizer_brand?.logo || radar.main_organizer_brand?.brand_logo ? (
            <img
              src={radar.main_organizer_brand.logo || radar.main_organizer_brand.brand_logo}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
              <Users className="w-3 h-3 text-gray-500" />
            </div>
          )}
          <span className="text-gray-400 text-xs">by {brandName}</span>
        </div>
      </div>

      {/* Funding Section */}
      <div className="px-5 pb-4 space-y-3">
        {/* Cost row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">Total Cost</p>
            <p className="text-white font-bold text-sm mt-0.5">{formatEGP(totalCost)}</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <p className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">Still Needed</p>
            <p className="text-amber-400 font-bold text-sm mt-0.5">{formatEGP(amountNeeded)}</p>
          </div>
        </div>

        {/* Funding bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-gray-500 text-xs">Funding Progress</span>
            <span className={`text-xs font-bold ${fundingTextColor(funding)}`}>{funding}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${fundingColor(funding)}`}
              style={{ width: `${Math.min(100, funding)}%` }}
            />
          </div>
        </div>

        {/* Slots */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${slots.color}`}>{slots.text}</span>
          {radar.co_organizers?.length > 0 && (
            <div className="flex -space-x-1.5">
              {radar.co_organizers.slice(0, 3).map((co, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-900 flex items-center justify-center"
                  title={co.brand_name || 'Co-organizer'}
                >
                  {co.brand_logo ? (
                    <img src={co.brand_logo} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[8px] text-gray-400 font-bold">
                      {(co.brand_name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My commitment info (for commitments tab) */}
      {isMyCommitment && myEntry && (
        <div className="px-5 pb-4">
          <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">My Commitment</span>
              <span className="text-yellow-400 font-bold">
                {formatEGP(myEntry.committed_amount)} ({myEntry.committed_percent}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Role</span>
              <span className={`font-bold ${myEntry.committed_percent >= 66 ? 'text-purple-400' : 'text-red-400'}`}>
                {commitLabel(myEntry.committed_percent)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Payment</span>
              <span className={`font-bold ${myEntry.payment_status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                {myEntry.payment_status === 'paid' ? 'Paid' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Access</span>
              <span className={`font-bold ${myEntry.access_granted ? 'text-green-400' : 'text-gray-500'}`}>
                {myEntry.access_granted ? 'Granted' : 'Pending Payment'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <Link
          to={`/organizer/radar/${radar.id}`}
          className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-gray-300 text-sm font-bold text-center hover:bg-zinc-700 transition-colors"
        >
          View Details
        </Link>
        {onCommit && radar.status !== 'fully_funded' && (
          <button
            onClick={onCommit}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-[0_0_15px_rgba(255,26,26,0.2)] hover:shadow-[0_0_25px_rgba(255,26,26,0.4)] flex items-center justify-center gap-1.5"
          >
            Commit
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function SponsorshipRadarPage() {
  const { user, userProfile } = useAuth()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('browse')
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState('All Games')
  const [commitTarget, setCommitTarget] = useState(null)

  // Fetch organizer profile for the logged-in user
  const { data: orgProfile } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => apiCall('/organizers/me'),
    enabled: !!user,
  })

  const myOrganizerId = orgProfile?.id || null
  const myUserId = user?.id || null

  // Fetch all radar records (no status filter — we filter client-side per tab)
  const { data: radarRecords = [], isLoading } = useQuery({
    queryKey: ['sponsorship-radar'],
    queryFn: () => RadarAPI.list(),
    enabled: !!user,
  })

  // ---------- Filtered lists ----------

  const browseRecords = radarRecords.filter(r => {
    // Only open or in_progress, not my own, not already committed
    if (r.status !== 'open' && r.status !== 'in_progress') return false
    // Exclude tournaments where the user is the main organizer (check both profile ID and user ID)
    if (r.main_organizer_id === myOrganizerId || r.main_organizer_id === myUserId) return false
    // Exclude tournaments where user already committed (check both organizer_id fields)
    if (r.co_organizers?.some(co =>
      co.organizer_id === myOrganizerId || co.organizer_id === myUserId
    )) return false

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      const matches =
        r.tournament_name?.toLowerCase().includes(q) ||
        r.game?.toLowerCase().includes(q) ||
        r.main_organizer_brand?.name?.toLowerCase().includes(q) ||
        r.main_organizer_brand?.brand_name?.toLowerCase().includes(q)
      if (!matches) return false
    }

    // Game filter
    if (gameFilter !== 'All Games' && r.game !== gameFilter) return false

    return true
  })

  const myCommitments = radarRecords.filter(r => {
    const isNotMain = r.main_organizer_id !== myOrganizerId && r.main_organizer_id !== myUserId
    const hasMyCommitment = r.co_organizers?.some(co =>
      co.organizer_id === myOrganizerId || co.organizer_id === myUserId
    )
    return isNotMain && hasMyCommitment
  })

  // ---------- Commit mutation ----------

  const commitMutation = useMutation({
    mutationFn: async ({ radarId, commitment_percent, amount }) => {
      return RadarAPI.commit(radarId, {
        commitment_percent,
        organizer_id: myOrganizerId,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorship-radar'] })
      setCommitTarget(null)
    },
  })

  // ---------- Stats ----------

  const totalOpen = radarRecords.filter(r => r.status === 'open' || r.status === 'in_progress').length
  const totalFunded = radarRecords.filter(r => r.status === 'fully_funded').length

  return (
    <>
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-zinc-900 via-red-950/20 to-zinc-900 border border-red-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent" />
        <div className="relative px-8 py-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Radar className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-red-400 uppercase bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">NEW</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Sponsorship Radar</h1>
              <p className="text-gray-400 max-w-lg">
                Co-organize tournaments with other brands, share costs, and grow your esports reach together.
                Commit as low as 33% to become a co-organizer.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-3xl font-black text-white">{totalOpen}</p>
                <p className="text-gray-500 text-xs">Open Now</p>
              </div>
            </div>
          </div>

          {/* Success Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <div className="bg-black/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Open</span>
              </div>
              <p className="text-2xl font-black text-white">{totalOpen}</p>
              <p className="text-gray-500 text-xs mt-0.5">Tournaments seeking partners</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-red-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active</span>
              </div>
              <p className="text-2xl font-black text-white">{myCommitments.length}</p>
              <p className="text-gray-500 text-xs mt-0.5">Your active commitments</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Funded</span>
              </div>
              <p className="text-2xl font-black text-white">{totalFunded}</p>
              <p className="text-gray-500 text-xs mt-0.5">Successfully funded</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Min</span>
              </div>
              <p className="text-2xl font-black text-white">33%</p>
              <p className="text-gray-500 text-xs mt-0.5">Minimum commitment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6 border border-zinc-800">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'browse'
              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(255,26,26,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Browse Open
        </button>
        <button
          onClick={() => setActiveTab('commitments')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'commitments'
              ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(255,26,26,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Commitments
          {myCommitments.length > 0 && (
            <span className="ml-2 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {myCommitments.length}
            </span>
          )}
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Search + Game filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tournaments, games, or organizers..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm pl-10 pr-4 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
              />
            </div>
            <select
              value={gameFilter}
              onChange={e => setGameFilter(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg text-gray-300 text-sm px-3 py-2.5 focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer min-w-[160px]"
            >
              {GAMES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
            </div>
          ) : browseRecords.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <Radar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No open tournaments on the radar</p>
              <p className="text-gray-600 text-sm mt-1">Check back later or create a shared tournament of your own</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {browseRecords.map(radar => (
                <RadarCard
                  key={radar.id}
                  radar={radar}
                  onCommit={() => setCommitTarget(radar)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Commitments Tab */}
      {activeTab === 'commitments' && (
        <div className="space-y-5">
          {myCommitments.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No commitments yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Browse open tournaments and commit as a co-organizer or sponsor
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors inline-flex items-center gap-2"
              >
                Browse Tournaments
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {myCommitments.map(radar => {
                const myEntry = radar.co_organizers?.find(co =>
                  co.organizer_id === myOrganizerId || co.organizer_id === myUserId
                )
                return (
                  <RadarCard
                    key={radar.id}
                    radar={radar}
                    isMyCommitment
                    myEntry={myEntry}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Commit Modal */}
      {commitTarget && (
        <CommitModal
          radar={commitTarget}
          onClose={() => setCommitTarget(null)}
          isLoading={commitMutation.isPending}
          onConfirm={({ commitment_percent, amount }) =>
            commitMutation.mutate({
              radarId: commitTarget.id,
              commitment_percent,
              amount,
            })
          }
        />
      )}
    </>
  )
}
