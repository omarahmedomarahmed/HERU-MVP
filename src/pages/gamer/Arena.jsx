import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { Tournament, Team, apiCall } from '@/api/heruClient'
import { useToast } from '@/components/ui/use-toast'
import BracketVisual from '@/components/tournament/BracketVisual'
import {
  Trophy, Users, MessageSquare, Send, ArrowLeft, Upload, Flag,
  AlertTriangle, CheckCircle2, Clock, Play, Shield, Gamepad2,
  Calendar, MapPin, Radio, ChevronRight, Loader2, Camera, X,
  Swords, Star, Info, Zap, Search,
} from 'lucide-react'
import GamerLayout from '@/components/layouts/GamerLayout.jsx'

const formatEGP = (n) => 'EGP ' + (Number(n) || 0).toLocaleString()

function StatusBadge({ status }) {
  const map = {
    pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    started:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    disputed:  'bg-red-500/20 text-red-400 border-red-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${map[status] || map.pending}`}>
      {status === 'started' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
      {(status || 'pending').toUpperCase()}
    </span>
  )
}

function ChatPanel({ messages = [], onSend, isSending, placeholder = 'Send a message...' }) {
  const [msg, setMsg] = useState('')
  const scrollRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    const t = msg.trim()
    if (!t || isSending) return
    onSend(t)
    setMsg('')
  }

  return (
    <div className="flex flex-col h-full min-h-[300px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-3 scrollbar-thin scrollbar-thumb-white/10">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            <MessageSquare className="w-5 h-5 mr-2 opacity-40" /> No messages yet
          </div>
        ) : messages.map((m, i) => {
          const isMe = m.user_id === user?.id
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${isMe ? 'bg-red-600/80 text-white' : 'bg-white/10 text-gray-200'}`}>
                {!isMe && <p className="text-[10px] text-gray-400 mb-0.5">{m.sender_name}</p>}
                <p>{m.message}</p>
                <p className="text-[10px] opacity-50 mt-0.5 text-right">
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleSend} className="border-t border-white/10 p-2 flex gap-2">
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50"
        />
        <button type="submit" disabled={!msg.trim() || isSending}
          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 disabled:opacity-40 transition">
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}

export default function Arena() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [activeMatchId, setActiveMatchId] = useState(null)
  const [submitForm, setSubmitForm] = useState({ score: '', screenshot_url: '', notes: '' })
  const [reportForm, setReportForm] = useState({ reason: '', screenshot_url: '' })
  const [showReportModal, setShowReportModal] = useState(false)

  // Fetch tournament
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['arena-tournament', id],
    queryFn: () => Tournament.get(id),
    enabled: !!id,
    staleTime: 15_000,
    refetchInterval: 20_000,
  })

  // Fetch my team in this tournament
  const { data: myTeam } = useQuery({
    queryKey: ['arena-my-team', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !tournament?.teams?.length) return null
      const teams = await Team.list()
      return teams.find(t => tournament.teams.includes(t.id) && (t.leader_id === user.id || t.members?.includes(user.id))) || null
    },
    enabled: !!user?.id && !!tournament,
    staleTime: 30_000,
  })

  // Fetch match records for this tournament
  const { data: matchRecords = [] } = useQuery({
    queryKey: ['match-records', id],
    queryFn: () => apiCall(`/match-records?tournament_id=${id}`),
    enabled: !!id,
    staleTime: 15_000,
    refetchInterval: 15_000,
  })

  // Find my active match
  const myActiveMatch = matchRecords.find(r =>
    (r.team1_id === myTeam?.id || r.team2_id === myTeam?.id ||
     r.player1_id === user?.id || r.player2_id === user?.id) &&
    r.status !== 'completed'
  )
  const mySide = myActiveMatch
    ? (myActiveMatch.team1_id === myTeam?.id || myActiveMatch.player1_id === user?.id ? 'team1' : 'team2')
    : null

  // Submit match result
  const submitMutation = useMutation({
    mutationFn: (data) => apiCall(`/match-records/${activeMatchId}/submit`, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match-records', id] })
      toast({ title: 'Result submitted!', description: 'Waiting for opponent to confirm.' })
    },
    onError: (err) => toast({ title: 'Submit failed', description: err.message, variant: 'destructive' }),
  })

  // Send match chat
  const chatMutation = useMutation({
    mutationFn: ({ matchId, message }) => apiCall(`/match-records/${matchId}/chat`, {
      method: 'POST',
      body: { message, sender_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player' },
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['match-records', id] }),
  })

  // Report abuse
  const reportMutation = useMutation({
    mutationFn: (data) => apiCall(`/match-records/${activeMatchId}/report`, { method: 'POST', body: data }),
    onSuccess: () => {
      setShowReportModal(false)
      toast({ title: 'Report submitted', description: 'Staff will review this match.' })
    },
    onError: (err) => toast({ title: 'Report failed', description: err.message, variant: 'destructive' }),
  })

  // General tournament chat
  const generalChatMutation = useMutation({
    mutationFn: (message) => apiCall(`/tournaments/${id}/general-chat`, {
      method: 'POST',
      body: {
        message,
        user_id: user?.id,
        sender_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Player',
        sender_role: 'gamer',
      },
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['arena-tournament', id] }),
  })

  // ── ARENA HUB (no tournament id selected) ──────────────────────────────
  if (!id) {
    return <ArenaHub userId={user?.id} navigate={navigate} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-gray-400 gap-4 p-6">
        <Trophy className="w-12 h-12 text-red-400" />
        <p className="text-lg font-semibold">Tournament not found</p>
        <button onClick={() => navigate('/gamer/arena')} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Arena
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Trophy },
    { id: 'brackets', label: 'Brackets', icon: Swords },
    { id: 'my-match', label: myActiveMatch ? '🔴 My Match' : 'My Match', icon: Play },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ]

  const bracketMatches = (tournament.brackets || []).flat ? (tournament.brackets || []) : []
  const isParticipant = !!myTeam || tournament.gamer_participants?.includes(user?.id)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        {tournament.tournament_image ? (
          <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-950 via-[#0f0f1a] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-2">
            {tournament.status === 'live' && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" /> {tournament.game}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-white">{tournament.name}</h1>
          {tournament.schedule && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(tournament.schedule).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              {tournament.is_offline && tournament.venue && (
                <><MapPin className="w-3 h-3 ml-2" /> {tournament.venue}</>
              )}
            </p>
          )}
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition">
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-4">
        {/* Participant status */}
        {isParticipant ? (
          <div className="mb-4 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-400">You're competing</p>
              {myTeam && <p className="text-xs text-gray-400 truncate">Team: {myTeam.name}</p>}
            </div>
            {myActiveMatch && (
              <button onClick={() => { setActiveMatchId(myActiveMatch.id); setActiveTab('my-match') }}
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-500 transition whitespace-nowrap">
                Go to Match
              </button>
            )}
          </div>
        ) : (
          <div className="mb-4 rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-500 shrink-0" />
            <p className="text-sm text-gray-400">You are spectating this tournament.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 mb-6 pb-px">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Teams', value: tournament.teams?.length || 0, sub: `/ ${tournament.max_teams || '∞'}` },
                { label: 'Format', value: tournament.format || 'TBD', sub: '' },
                { label: 'Prizepool', value: formatEGP(tournament.prizepool_total), sub: '' },
                { label: 'Status', value: (tournament.status || 'draft').toUpperCase(), sub: '' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-lg font-bold text-white">{s.value}<span className="text-xs text-gray-500">{s.sub}</span></p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tournament log */}
            {tournament.tournament_log?.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Updates</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...tournament.tournament_log].reverse().slice(0, 10).map((log, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="text-gray-600 shrink-0">
                        {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-gray-400">{log.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stream */}
            {tournament.status === 'live' && tournament.stream_link && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400" /> Live Stream
                </h3>
                <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition">
                  Watch Now <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Prize breakdown */}
            {tournament.prizepool_total > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" /> Prizes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-center">
                    <p className="text-xs text-yellow-400">🥇 1st Place</p>
                    <p className="text-lg font-bold text-white">{formatEGP(tournament.prizepool_total * 0.5)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-500/10 border border-gray-500/20 p-3 text-center">
                    <p className="text-xs text-gray-400">🥈 2nd Place</p>
                    <p className="text-lg font-bold text-white">{formatEGP(tournament.prizepool_total * 0.3)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Brackets Tab ── */}
        {activeTab === 'brackets' && (
          <div>
            {bracketMatches.length > 0 ? (
              <BracketVisual brackets={tournament.brackets} teams={[]} readOnly />
            ) : (
              <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center text-gray-500">
                <Swords className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">Brackets will be announced soon</p>
              </div>
            )}

            {/* Completed matches list */}
            {matchRecords.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Match Results</h3>
                {matchRecords.map((mr) => (
                  <div key={mr.id} className={`rounded-xl border p-4 cursor-pointer transition hover:border-red-500/30 ${
                    myActiveMatch?.id === mr.id ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'
                  }`} onClick={() => { setActiveMatchId(mr.id); setActiveTab('my-match') }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Swords className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {mr.team1_id?.slice(0, 8) || 'Team 1'} vs {mr.team2_id?.slice(0, 8) || 'Team 2'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {mr.status === 'completed' && (
                          <span className="text-sm font-bold text-white">{mr.team1_score} – {mr.team2_score}</span>
                        )}
                        <StatusBadge status={mr.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── My Match Tab ── */}
        {activeTab === 'my-match' && (
          <div className="space-y-4">
            {/* Match selector */}
            {matchRecords.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {matchRecords.map(mr => (
                  <button key={mr.id} onClick={() => setActiveMatchId(mr.id)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition ${
                      activeMatchId === mr.id ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-red-500/30'
                    }`}>
                    Match {mr.match_id || mr.id.slice(0, 6)}
                  </button>
                ))}
              </div>
            )}

            {/* Active match detail */}
            {(() => {
              const match = activeMatchId ? matchRecords.find(r => r.id === activeMatchId) : myActiveMatch
              if (!match) {
                return (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-10 text-center text-gray-500">
                    <Play className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No active match. Select one above or wait for brackets.</p>
                  </div>
                )
              }
              const side = match.team1_id === myTeam?.id || match.player1_id === user?.id ? 'team1' : 'team2'
              const mySubmission = match[`${side}_submission`]
              const oppSubmission = match[side === 'team1' ? 'team2_submission' : 'team1_submission']
              const isMyTurn = !mySubmission?.submitted_at

              return (
                <div className="space-y-4">
                  {/* Match header */}
                  <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Swords className="w-4 h-4 text-red-400" /> Match {match.match_id || match.id.slice(0, 8)}
                      </h3>
                      <StatusBadge status={match.status} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                        <p className="text-xs text-gray-400 mb-1">{side === 'team1' ? '⚔️ You' : 'Opponent'}</p>
                        <p className="text-2xl font-bold text-white">{match.team1_score}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-gray-500 font-bold text-lg">VS</span>
                      </div>
                      <div className="rounded-lg bg-gray-500/10 border border-gray-500/20 p-3">
                        <p className="text-xs text-gray-400 mb-1">{side === 'team2' ? '⚔️ You' : 'Opponent'}</p>
                        <p className="text-2xl font-bold text-white">{match.team2_score}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit result (only if participant and not yet submitted) */}
                  {isParticipant && match.status !== 'completed' && (
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {isMyTurn ? 'Submit Your Result' : '✅ Waiting for opponent'}
                      </h3>
                      {isMyTurn ? (
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Your Score</label>
                            <input type="number" min="0"
                              value={submitForm.score}
                              onChange={e => setSubmitForm(f => ({ ...f, score: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                              placeholder="e.g. 13"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Screenshot URL (proof)</label>
                            <input type="url"
                              value={submitForm.screenshot_url}
                              onChange={e => setSubmitForm(f => ({ ...f, screenshot_url: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Notes (optional)</label>
                            <textarea rows={2}
                              value={submitForm.notes}
                              onChange={e => setSubmitForm(f => ({ ...f, notes: e.target.value }))}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50 resize-none"
                              placeholder="Any notes about the match..."
                            />
                          </div>
                          <button
                            onClick={() => {
                              setActiveMatchId(match.id)
                              submitMutation.mutate({
                                team_side: side,
                                score: Number(submitForm.score),
                                screenshot_url: submitForm.screenshot_url,
                                notes: submitForm.notes,
                              })
                            }}
                            disabled={!submitForm.score || submitMutation.isPending}
                            className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-40 transition flex items-center justify-center gap-2"
                          >
                            {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            Submit Result
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-green-400 text-sm flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          You submitted: score {mySubmission.score}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Match chat */}
                  <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-red-400" /> Match Chat
                      </h3>
                      {isParticipant && (
                        <button onClick={() => setShowReportModal(true)}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition">
                          <Flag className="w-3.5 h-3.5" /> Report
                        </button>
                      )}
                    </div>
                    <ChatPanel
                      messages={match.chat || []}
                      onSend={(msg) => chatMutation.mutate({ matchId: match.id, message: msg })}
                      isSending={chatMutation.isPending}
                      placeholder="Chat with teams..."
                    />
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* ── General Chat Tab ── */}
        {activeTab === 'chat' && (
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-400" /> Tournament Chat
              </h3>
              <p className="text-xs text-gray-500">Open to all participants and spectators</p>
            </div>
            <ChatPanel
              messages={tournament.general_chat || []}
              onSend={(msg) => generalChatMutation.mutate(msg)}
              isSending={generalChatMutation.isPending}
              placeholder="Chat with everyone..."
            />
          </div>
        )}
      </div>

      {/* Back to Arena Hub */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        <button onClick={() => navigate('/gamer/arena')} className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1 transition mt-2">
          <ArrowLeft className="w-3 h-3" /> All my tournaments
        </button>
      </div>

      {/* Report Abuse Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1a1a2e] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" /> Report Abuse
              </h2>
              <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Reason</label>
                <textarea rows={3}
                  value={reportForm.reason}
                  onChange={e => setReportForm(f => ({ ...f, reason: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-red-500/50"
                  placeholder="Describe the violation..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Screenshot URL (proof)</label>
                <input type="url"
                  value={reportForm.screenshot_url}
                  onChange={e => setReportForm(f => ({ ...f, screenshot_url: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500/50"
                  placeholder="https://..."
                />
              </div>
              <button
                onClick={() => reportMutation.mutate(reportForm)}
                disabled={!reportForm.reason || reportMutation.isPending}
                className="w-full py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-40 transition flex items-center justify-center gap-2"
              >
                {reportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Arena Hub: Landing page showing the gamer's active tournaments ────────────
function ArenaHub({ userId, navigate }) {
  const { data: myTournaments = [], isLoading } = useQuery({
    queryKey: ['my-arena', userId],
    queryFn: () => apiCall('/tournaments/my-arena'),
    enabled: !!userId,
    staleTime: 30_000,
  })

  const statusColor = (s) => {
    if (s === 'live') return 'text-red-400 bg-red-500/20 border-red-500/30'
    if (s === 'published') return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    if (s === 'completed') return 'text-green-400 bg-green-500/20 border-green-500/30'
    return 'text-gray-400 bg-white/10 border-white/20'
  }

  return (
    <GamerLayout>
      <div className="min-h-screen bg-[#0a0a0a] pb-20">
        {/* Hero header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-950/40 via-[#0f0f1a] to-black border-b border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.15),transparent_70%)]" />
          <div className="relative max-w-4xl mx-auto px-4 py-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/40">
                <Swords className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">ARENA</h1>
                <p className="text-gray-400 text-sm">Your tournament battle station</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => navigate('/gamer/tournaments')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition shadow-lg shadow-red-900/30"
              >
                <Search className="w-4 h-4" /> Browse Tournaments
              </button>
              <button
                onClick={() => navigate('/gamer/teams')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15 transition border border-white/10"
              >
                <Users className="w-4 h-4" /> My Teams
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
            </div>
          ) : myTournaments.length === 0 ? (
            /* ── Empty state ── */
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-900/30 to-black mx-auto mb-6 flex items-center justify-center border border-red-900/30">
                <Swords className="w-10 h-10 text-red-500/60" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No active battles</h2>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">
                Join a tournament to see your matches, brackets, and compete for prizes. Your next victory starts here.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/gamer/tournaments')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 transition shadow-lg shadow-red-900/30"
                >
                  <Zap className="w-4 h-4" /> Find a Tournament
                </button>
              </div>
            </div>
          ) : (
            /* ── Tournament cards ── */
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Your Tournaments ({myTournaments.length})
              </h2>
              {myTournaments.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate(`/gamer/arena/${t.id}`)}
                  className="w-full text-left rounded-2xl border border-white/10 bg-white/5 hover:border-red-500/30 hover:bg-white/8 transition-all p-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-red-900/30 to-black border border-white/10">
                      {t.tournament_image ? (
                        <img src={t.tournament_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-red-500/60" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(t.status)}`}>
                          {t.status === 'live' && <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse mr-1" />}
                          {(t.status || 'draft').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{t.game}</span>
                      </div>
                      <p className="text-white font-bold truncate">{t.name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {t.format} · {t.participant_type === 'player' ? 'Solo' : 'Teams'}
                        {t.prizepool_total > 0 && ` · EGP ${Number(t.prizepool_total).toLocaleString()} prize`}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 transition shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </GamerLayout>
  )
}
