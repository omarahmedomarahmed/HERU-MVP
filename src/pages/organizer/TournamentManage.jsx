import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { Tournament, Team, apiCall } from '@/api/heruClient'
import BracketVisual from '@/components/tournament/BracketVisual'
import {
  Trophy, Users, GitBranch, MessageSquare, FileText,
  ChevronRight, Loader2, Send, CheckCircle2, XCircle,
  Radio, Clock, Calendar, Gamepad2, DollarSign,
  Shield, ArrowLeft, AlertTriangle, GripVertical,
  Play, Flag,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const statusConfig = {
  draft:     { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'DRAFT' },
  published: { bg: 'bg-red-500/20',   text: 'text-red-400',   border: 'border-red-500/30',   label: 'PUBLISHED' },
  live:      { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30',  label: 'LIVE' },
  completed: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'COMPLETED' },
}

function StatusBadge({ status }) {
  const c = statusConfig[status] || statusConfig.draft
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      {status === 'live' && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />}
      {c.label}
    </span>
  )
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-red-400" />
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <Icon className="w-10 h-10 mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: Trophy },
  { id: 'teams',     label: 'Teams',     icon: Users },
  { id: 'brackets',  label: 'Brackets',  icon: GitBranch },
  { id: 'chat',      label: 'Chat',      icon: MessageSquare },
  { id: 'report',    label: 'Report',    icon: FileText },
]

// ---------------------------------------------------------------------------
// Overview Tab
// ---------------------------------------------------------------------------

function OverviewTab({ tournament }) {
  const scheduledDate = tournament.schedule
    ? new Date(tournament.schedule).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : 'Not set'

  const stats = [
    { icon: Users,      label: 'Teams Registered', value: tournament.teams?.length || 0 },
    { icon: Users,      label: 'Max Teams',        value: tournament.max_teams || 'Unlimited' },
    { icon: DollarSign, label: 'Total Cost',       value: formatEGP(tournament.total_cost) },
    { icon: DollarSign, label: 'Prizepool',        value: formatEGP(tournament.prizepool_total) },
    { icon: DollarSign, label: 'Platform Fee',     value: formatEGP(tournament.platform_fee) },
  ]

  return (
    <div className="space-y-6">
      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5 space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tournament Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Game</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-red-400" />
                {tournament.game || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Format</span>
              <span className="text-white font-medium">{tournament.format || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Date</span>
              <span className="text-white font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                {scheduledDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white font-medium capitalize">{tournament.tournament_type || 'solo'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Venue</span>
              <span className="text-white font-medium">
                {tournament.is_offline ? (tournament.venue || 'TBD') : 'Online'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5 space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Financial Overview</h3>
          <div className="space-y-2">
            {stats.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </span>
                <span className="text-white font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {tournament.description && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{tournament.description}</p>
        </div>
      )}

      {/* Stream link */}
      {tournament.stream_link && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Stream</h3>
          <a
            href={tournament.stream_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-red-400 hover:text-red-300 underline"
          >
            {tournament.stream_link}
          </a>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Teams Tab
// ---------------------------------------------------------------------------

function TeamsTab({ tournament, queryClient }) {
  const registeredTeamIds = tournament.teams || []
  const joinRequests = tournament.join_requests || []

  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ['tournament-teams', tournament.id],
    queryFn: () => Promise.all(registeredTeamIds.map((tid) => Team.get(tid).catch(() => null))),
    enabled: registeredTeamIds.length > 0,
    staleTime: 30_000,
  })

  const handleJoinRequest = useMutation({
    mutationFn: ({ requestId, action }) =>
      Tournament.handleJoinRequest(tournament.id, requestId, { action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] })
      queryClient.invalidateQueries({ queryKey: ['tournament-teams', tournament.id] })
    },
  })

  const teams = (teamsData || []).filter(Boolean)
  const pendingRequests = joinRequests.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Pending join requests */}
      {pendingRequests.length > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Pending Join Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id || req.team_id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0f0f1a] p-3"
              >
                <div>
                  <p className="text-white text-sm font-medium">{req.team_name || req.team_id}</p>
                  {req.message && (
                    <p className="text-gray-500 text-xs mt-0.5">{req.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJoinRequest.mutate({ requestId: req.id || req.team_id, action: 'approve' })}
                    disabled={handleJoinRequest.isPending}
                    className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"
                    title="Approve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleJoinRequest.mutate({ requestId: req.id || req.team_id, action: 'reject' })}
                    disabled={handleJoinRequest.isPending}
                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registered teams */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
          Registered Teams ({teams.length}{tournament.max_teams ? ` / ${tournament.max_teams}` : ''})
        </h3>
        {teamsLoading ? (
          <SectionLoader />
        ) : teams.length === 0 ? (
          <EmptyState icon={Users} message="No teams registered yet." />
        ) : (
          <div className="space-y-2">
            {teams.map((team, idx) => (
              <div
                key={team.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-[#1a1a2e] p-3 hover:border-red-500/30 transition"
              >
                <span className="text-xs text-gray-600 font-mono w-6 text-center">{idx + 1}</span>
                {team.logo ? (
                  <img src={team.logo} alt="" className="w-8 h-8 rounded-lg object-cover bg-white/5" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-red-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{team.name}</p>
                  <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                </div>
                <GripVertical className="w-4 h-4 text-gray-600" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Brackets Tab
// ---------------------------------------------------------------------------

function BracketsTab({ tournament }) {
  const brackets = tournament.brackets || []
  const registeredTeamIds = tournament.teams || []

  const { data: teamsData } = useQuery({
    queryKey: ['tournament-teams', tournament.id],
    queryFn: () => Promise.all(registeredTeamIds.map((tid) => Team.get(tid).catch(() => null))),
    enabled: registeredTeamIds.length > 0,
    staleTime: 30_000,
  })

  const teams = (teamsData || []).filter(Boolean)

  if (brackets.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        message="No brackets generated yet. Add teams and generate brackets from the Teams tab."
      />
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5 overflow-x-auto">
      <BracketVisual brackets={brackets} teams={teams} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Chat Tab
// ---------------------------------------------------------------------------

function ChatTab({ tournament, queryClient }) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const chatEndRef = useRef(null)

  const messages = tournament.organizer_chat || []

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const sendMessage = useMutation({
    mutationFn: (msg) => Tournament.sendChat(tournament.id, { message: msg, sender_id: user?.id }),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['tournament', tournament.id] })
    },
  })

  const handleSend = (e) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return
    sendMessage.mutate(trimmed)
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a2e] flex flex-col" style={{ height: '500px' }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user?.id
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-red-600 to-red-600 text-white'
                      : 'bg-white/5 text-gray-300'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-medium text-red-400 mb-1">
                      {msg.sender_name || 'Unknown'}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.message || msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-gray-600'}`}>
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="border-t border-white/10 p-3 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-red-500/50 transition"
        />
        <button
          type="submit"
          disabled={!message.trim() || sendMessage.isPending}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-600 text-white text-sm font-medium disabled:opacity-40 hover:brightness-110 transition flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Report Tab
// ---------------------------------------------------------------------------

function ReportTab({ tournament, navigate }) {
  if (tournament.status !== 'completed') {
    return (
      <EmptyState
        icon={FileText}
        message="Tournament reports are available after the tournament is completed."
      />
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6 text-center">
      <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-white font-semibold text-lg mb-2">Tournament Report</h3>
      <p className="text-gray-400 text-sm mb-6">
        View the full tournament report including results, statistics, and financial summary.
      </p>
      <button
        onClick={() => navigate(`/organizer/tournaments/${tournament.id}/report`)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-600 text-white font-medium text-sm hover:brightness-110 transition"
      >
        View Report
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function TournamentManage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch tournament
  const {
    data: tournament,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => Tournament.get(id),
    enabled: !!id,
    staleTime: 15_000,
    refetchInterval: 30_000, // Poll for chat + bracket updates
  })

  // Status mutations
  const goLive = useMutation({
    mutationFn: () => Tournament.update(id, { status: 'live' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournament', id] }),
  })

  const completeTournament = useMutation({
    mutationFn: () => Tournament.update(id, { status: 'completed' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournament', id] }),
  })

  // Loading / error states
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-400" />
      </div>
    )
  }

  if (isError || !tournament) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-center text-gray-400 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p className="text-sm">{error?.message || 'Tournament not found.'}</p>
        <button
          onClick={() => navigate('/organizer/tournaments')}
          className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to tournaments
        </button>
      </div>
    )
  }

  // Filter visible tabs — hide report if not completed
  const visibleTabs = tournament.status === 'completed'
    ? TABS
    : TABS.filter((t) => t.id !== 'report')

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <button
              onClick={() => navigate('/organizer/tournaments')}
              className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to tournaments
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                {tournament.name}
              </h1>
              <StatusBadge status={tournament.status} />
            </div>
            {tournament.game && (
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" /> {tournament.game}
                {tournament.format && <span className="text-gray-600 mx-1">|</span>}
                {tournament.format && <span>{tournament.format}</span>}
              </p>
            )}
          </div>

          {/* Status controls */}
          <div className="flex items-center gap-2 shrink-0">
            {tournament.status === 'published' && (
              <button
                onClick={() => goLive.mutate()}
                disabled={goLive.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition"
              >
                {goLive.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Go Live
              </button>
            )}
            {tournament.status === 'live' && (
              <button
                onClick={() => completeTournament.mutate()}
                disabled={completeTournament.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition"
              >
                {completeTournament.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Flag className="w-4 h-4" />
                )}
                Complete
              </button>
            )}
            <button
              onClick={() => navigate(`/organizer/tournaments/${id}/manage/settings`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-300 text-sm font-medium hover:border-red-500/40 hover:text-white transition"
            >
              <Shield className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Tab Navigation                                                    */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'teams' && (tournament.join_requests || []).filter((r) => r.status === 'pending').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                    {(tournament.join_requests || []).filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Tab Content                                                       */}
        {/* ----------------------------------------------------------------- */}
        <div>
          {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
          {activeTab === 'teams' && <TeamsTab tournament={tournament} queryClient={queryClient} />}
          {activeTab === 'brackets' && <BracketsTab tournament={tournament} />}
          {activeTab === 'chat' && <ChatTab tournament={tournament} queryClient={queryClient} />}
          {activeTab === 'report' && <ReportTab tournament={tournament} navigate={navigate} />}
        </div>
      </div>
    </div>
  )
}
