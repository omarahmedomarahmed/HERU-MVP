import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Tournament, TournamentOrder, Team, apiCall } from '@/api/heruClient'
import {
  ArrowLeft, Trophy, Users, Swords, DollarSign, Calendar,
  Gamepad2, LayoutGrid, Shield, Loader2, AlertTriangle,
  TrendingUp, Monitor, Share2, Camera, Video, Image,
  BarChart3, Globe, Star,
} from 'lucide-react'

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const STATUS_COLORS = {
  draft:     'bg-zinc-700 text-zinc-300',
  published: 'bg-blue-500/20 text-blue-400',
  live:      'bg-green-500/20 text-green-400',
  completed: 'bg-yellow-500/20 text-yellow-400',
}

function StatCard({ icon: Icon, label, value, accent = 'text-red-400' }) {
  return (
    <div className="bg-[#12121f] border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${accent}`} />
        <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function TournamentSummaryReport() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    data: tournament,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => Tournament.get(id),
    enabled: !!id,
  })

  const { data: tournamentOrders = [] } = useQuery({
    queryKey: ['tournament-orders', id],
    queryFn: () => TournamentOrder.list({ tournament_id: id }),
    enabled: !!id,
  })

  const { data: brandReport } = useQuery({
    queryKey: ['report', id],
    queryFn: () => apiCall(`/tournament-reports?tournament_id=${id}`).then(r => r?.[0]),
    enabled: !!id,
  })

  // Fetch team objects for the tournament so we can resolve IDs to names
  const teamIds = tournament?.teams || []
  const { data: allTeams = [] } = useQuery({
    queryKey: ['tournament-teams-report', id, teamIds.join(',')],
    queryFn: () => Promise.all(teamIds.map(tid => Team.get(tid).catch(() => null))).then(r => r.filter(Boolean)),
    enabled: teamIds.length > 0,
    staleTime: 120_000,
  })
  const teamById = Object.fromEntries(allTeams.map(t => [t.id, t]))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center px-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-md text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 text-sm">
            Failed to load tournament: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => navigate('/organizer/tournaments')}
            className="mt-4 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Back to Tournaments
          </button>
        </div>
      </div>
    )
  }

  const bracketRounds = tournament?.brackets || []
  const coOrganizers = tournament?.co_organizers || []
  const isShared = tournament?.tournament_type === 'shared'

  // Build rounds map from {round, matches:[]} structure
  const rounds = {}
  let totalMatches = 0
  let completedMatches = 0
  bracketRounds.forEach((roundData) => {
    const roundNum = roundData.round || '?'
    const roundKey = roundNum === bracketRounds.length ? 'Finals'
      : roundNum === bracketRounds.length - 1 ? 'Semi-Finals'
      : roundNum === 1 ? 'Round 1'
      : `Round ${roundNum}`
    const matches = Array.isArray(roundData.matches) ? roundData.matches
      : Array.isArray(roundData) ? roundData : []
    if (!rounds[roundKey]) rounds[roundKey] = []
    rounds[roundKey].push(...matches)
    totalMatches += matches.length
    completedMatches += matches.filter(m => !!m.winner).length
  })

  const order = Array.isArray(tournamentOrders)
    ? tournamentOrders[0]
    : tournamentOrders

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(`/organizer/tournaments/${id}/manage`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Manage
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {tournament?.name || 'Tournament'}{' '}
            <span className="text-red-400">Report</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview and results summary
          </p>
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize self-start ${
            STATUS_COLORS[tournament?.status] || 'bg-zinc-700 text-zinc-400'
          }`}
        >
          {tournament?.status || 'unknown'}
        </span>
      </div>

      {/* Tournament Info */}
      <section className="bg-[#12121f] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-red-400" />
          Tournament Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Game</span>
            <span className="text-white font-medium">{tournament?.game || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Format</span>
            <span className="text-white font-medium">{tournament?.format || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Schedule</span>
            <span className="text-white font-medium">
              {tournament?.schedule
                ? new Date(tournament.schedule).toLocaleDateString()
                : '-'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Type</span>
            <span className="text-white font-medium capitalize">
              {tournament?.tournament_type || 'solo'}
            </span>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Teams" value={teamIds.length} />
        <StatCard icon={Swords} label="Matches Played" value={`${completedMatches} / ${totalMatches}`} accent="text-blue-400" />
        <StatCard icon={DollarSign} label="Total Cost" value={formatEGP(tournament?.total_cost)} accent="text-green-400" />
        <StatCard icon={Trophy} label="Prize Pool" value={formatEGP(tournament?.prizepool_total)} accent="text-yellow-400" />
      </section>

      {/* Teams List */}
      {allTeams.length > 0 && (
        <section className="bg-[#12121f] border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Participating Teams ({allTeams.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allTeams.map((team, i) => (
              <div key={team.id} className="flex items-center gap-2 bg-[#0a0a14] border border-white/5 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500 font-mono w-5 shrink-0">#{i+1}</span>
                {team.logo ? (
                  <img src={team.logo} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                ) : (
                  <div className="w-6 h-6 rounded bg-zinc-800 shrink-0" />
                )}
                <span className="text-white text-sm font-medium truncate">{team.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Platform Fee */}
      <section className="bg-[#12121f] border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Financial Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Items Subtotal</span>
            <span className="text-white font-medium">
              {formatEGP(
                (tournament?.total_cost || 0) -
                  (tournament?.platform_fee || 0) -
                  (tournament?.prizepool_total || 0)
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Prize Pool</span>
            <span className="text-white font-medium">
              {formatEGP(tournament?.prizepool_total)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">Platform Fee (15%)</span>
            <span className="text-white font-medium">
              {formatEGP(tournament?.platform_fee)}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Grand Total</span>
          <span className="text-xl font-bold text-red-400">
            {formatEGP(tournament?.total_cost)}
          </span>
        </div>
      </section>

      {/* Bracket Results */}
      {Object.keys(rounds).length > 0 && (
        <section className="bg-[#12121f] border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-red-400" />
            Bracket Results
          </h2>
          <div className="space-y-4">
            {Object.entries(rounds).map(([roundName, matches]) => (
              <div key={roundName}>
                <h3 className="text-sm font-medium text-gray-400 mb-2">{roundName}</h3>
                <div className="space-y-2">
                  {matches.map((match, idx) => {
                    const t1 = teamById[match.team1] || null
                    const t2 = teamById[match.team2] || null
                    const team1Name = t1?.name || match.team1_name || (match.team1 ? match.team1.slice(0,8)+'...' : 'TBD')
                    const team2Name = t2?.name || match.team2_name || (match.team2 ? match.team2.slice(0,8)+'...' : 'TBD')
                    const score1 = match.score1 ?? match.team1_score ?? '-'
                    const score2 = match.score2 ?? match.team2_score ?? '-'
                    const winnerTeam = teamById[match.winner] || null
                    const winnerName = winnerTeam?.name || match.winner_name || null
                    const isComplete = !!match.winner

                    return (
                      <div
                        key={match.match_id || match.id || idx}
                        className={`flex items-center justify-between bg-[#0a0a14] border rounded-lg px-4 py-2.5 text-sm ${
                          isComplete ? 'border-green-500/20' : 'border-white/5'
                        }`}
                      >
                        <span className={`flex-1 ${match.winner === match.team1 ? 'text-green-400 font-medium' : 'text-white'}`}>
                          {team1Name}
                        </span>
                        <span className="text-gray-500 mx-3 font-mono text-xs">
                          {score1} — {score2}
                        </span>
                        <span className={`flex-1 text-right ${match.winner === match.team2 ? 'text-green-400 font-medium' : 'text-white'}`}>
                          {team2Name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Co-Organizer Contributions (shared tournaments) */}
      {isShared && coOrganizers.length > 0 && (
        <section className="bg-[#12121f] border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            Co-Organizer Contributions
          </h2>
          <div className="space-y-3">
            {coOrganizers.map((co, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-[#0a0a14] border border-white/5 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {co.brand_logo ? (
                    <img
                      src={co.brand_logo}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-zinc-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{co.brand_name}</p>
                    <p className="text-gray-500 text-xs capitalize">{co.label || 'co-organizer'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">
                    {co.commitment_percent || co.percent || 0}%
                  </p>
                  <p className="text-gray-500 text-xs">
                    {formatEGP(co.amount || co.committed_amount || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Brand Impact Report */}
      {brandReport && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-black text-white">Brand Impact Report</h2>
          </div>

          {brandReport.summary && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-5">
              <h3 className="text-violet-400 font-semibold text-sm mb-2">Executive Summary</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{brandReport.summary}</p>
              {brandReport.key_highlights && <p className="text-gray-400 text-sm mt-3 italic">{brandReport.key_highlights}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {brandReport.total_reach > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Total Reach</p><p className="text-xl font-bold text-blue-400">{Number(brandReport.total_reach).toLocaleString()}</p></div>}
            {brandReport.total_viewers > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Monitor className="w-3 h-3" /> Live Viewers</p><p className="text-xl font-bold text-red-400">{Number(brandReport.total_viewers).toLocaleString()}</p></div>}
            {brandReport.peak_viewers > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Peak Viewers</p><p className="text-xl font-bold text-orange-400">{Number(brandReport.peak_viewers).toLocaleString()}</p></div>}
            {brandReport.total_engagement > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Engagements</p><p className="text-xl font-bold text-green-400">{Number(brandReport.total_engagement).toLocaleString()}</p></div>}
            {brandReport.social_media_reach > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Share2 className="w-3 h-3" /> Social Reach</p><p className="text-xl font-bold text-cyan-400">{Number(brandReport.social_media_reach).toLocaleString()}</p></div>}
            {brandReport.photos_delivered > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Camera className="w-3 h-3" /> Photos</p><p className="text-xl font-bold text-yellow-400">{brandReport.photos_delivered}</p></div>}
            {brandReport.videos_delivered > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Video className="w-3 h-3" /> Videos</p><p className="text-xl font-bold text-yellow-400">{brandReport.videos_delivered}</p></div>}
            {brandReport.platform_signups > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Platform Signups</p><p className="text-xl font-bold text-violet-400">{brandReport.platform_signups}</p></div>}
          </div>

          {(brandReport.social_links || []).length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-white font-semibold text-sm mb-3">Social Media Content</h3>
              <div className="space-y-2">
                {brandReport.social_links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                    <span className="text-gray-500 w-20 flex-shrink-0">{link.platform}</span>
                    <span className="truncate underline">{link.url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {(brandReport.screenshots || []).length > 0 && (
            <div className="rounded-xl border border-white/10 p-5">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Image className="w-4 h-4" /> Proof Screenshots</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {brandReport.screenshots.map((ss, i) => (
                  <div key={i} className="space-y-2">
                    {ss.url && <img src={ss.url} alt={ss.caption || ''} className="w-full rounded-lg border border-white/10 object-cover max-h-48" onError={e => e.target.style.display='none'} />}
                    <p className="text-xs text-gray-400">{ss.category} {ss.caption && `— ${ss.caption}`}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!brandReport && tournament?.status === 'completed' && (
        <div className="mt-6 rounded-xl border border-dashed border-violet-500/30 p-6 text-center">
          <Star className="w-8 h-8 text-violet-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No brand impact report yet</p>
          <p className="text-gray-400 text-sm">The main organizer hasn't published a brand impact report for this tournament.</p>
        </div>
      )}
    </div>
  )
}
