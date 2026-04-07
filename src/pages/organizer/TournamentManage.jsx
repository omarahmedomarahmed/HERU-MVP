import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { Tournament, Team, Deliverable, GigRequest, apiCall } from '@/api/heruClient'
import BracketVisual from '@/components/tournament/BracketVisual'
import TeamManagementPanel from '@/components/tournament/TeamManagementPanel'
import SeedingPanel from '@/components/tournament/SeedingPanel'
import BracketMatchPanel from '@/components/tournament/BracketMatchPanel'
import OrganizerChat from '@/components/tournament/OrganizerChat'
import {
  Trophy, Users, GitBranch, MessageSquare, FileText,
  ChevronRight, Loader2, Send, CheckCircle2, XCircle,
  Radio, Clock, Calendar, Gamepad2, DollarSign,
  Shield, ArrowLeft, AlertTriangle, GripVertical,
  Play, Flag, Package, Upload, Briefcase, Eye,
  Settings, BarChart3, ListChecks,
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
  { id: 'overview',      label: 'Overview',      icon: Trophy },
  { id: 'teams',         label: 'Teams',         icon: Users },
  { id: 'seeding',       label: 'Seeding',       icon: GripVertical },
  { id: 'brackets',      label: 'Brackets',      icon: GitBranch },
  { id: 'deliverables',  label: 'Deliverables',  icon: Package },
  { id: 'gig-workers',   label: 'Gig Workers',   icon: Briefcase },
  { id: 'chat',          label: 'Chat',          icon: MessageSquare },
  { id: 'report',        label: 'Report',        icon: FileText },
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

  const coOrganizers = tournament.co_organizers || []

  const stats = [
    { icon: Users,      label: 'Teams Registered', value: tournament.teams?.length || 0 },
    { icon: Users,      label: 'Max Teams',        value: tournament.max_teams || 'Unlimited' },
    { icon: DollarSign, label: 'Total Cost',       value: formatEGP(tournament.total_cost) },
    { icon: DollarSign, label: 'Prizepool',        value: formatEGP(tournament.prizepool_total) },
    { icon: DollarSign, label: 'Platform Fee (15%)',value: formatEGP(tournament.platform_fee) },
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

      {/* Co-organizer partners */}
      {coOrganizers.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Partners</h3>
          <div className="space-y-2">
            {coOrganizers.map((co, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="flex items-center gap-3">
                  {co.brand_logo && (
                    <img src={co.brand_logo} alt="" className="w-8 h-8 rounded-full object-cover bg-white/5" />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{co.brand_name || 'Co-Organizer'}</p>
                    <p className="text-xs text-gray-500">{(co.commitment_percent || co.percent || 0) >= 66 ? 'Sponsor' : 'Co-Organizer'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-300">{co.commitment_percent || co.percent || 0}%</p>
                  <p className="text-xs text-gray-500">{co.access_granted ? 'Access Granted' : 'Pending Payment'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer"
            className="text-sm text-red-400 hover:text-red-300 underline">
            {tournament.stream_link}
          </a>
        </div>
      )}

      {/* Tournament Log */}
      {tournament.tournament_log?.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Activity Log</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...tournament.tournament_log].reverse().slice(0, 20).map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-gray-600 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-gray-400">{log.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Deliverables Tab
// ---------------------------------------------------------------------------

function DeliverablesTab({ tournament, queryClient }) {
  const tournamentId = tournament.id

  // Build deliverables from tournament order items
  const { data: orderData } = useQuery({
    queryKey: ['tournament-order', tournamentId],
    queryFn: () => apiCall(`/tournament-orders?tournament_id=${tournamentId}`),
    staleTime: 30_000,
  })

  const order = Array.isArray(orderData) ? orderData[0] : orderData
  const items = order?.items || []

  const updateItemStatus = useMutation({
    mutationFn: async ({ itemIndex, status }) => {
      const updatedItems = items.map((item, i) => i === itemIndex ? { ...item, status } : item)
      await apiCall(`/tournament-orders/${order.id}`, { method: 'PUT', body: { items: updatedItems } })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournament-order', tournamentId] }),
  })

  const deliverableStatuses = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pending' },
    confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Confirmed' },
    fulfilled: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Fulfilled' },
  }

  if (items.length === 0) {
    return <EmptyState icon={Package} message="No deliverables yet. Publish the tournament to create the order." />
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Tournament Deliverables</h3>
        <div className="space-y-3">
          {items.map((item, idx) => {
            const st = deliverableStatuses[item.status] || deliverableStatuses.pending
            return (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 capitalize">{item.category} &middot; {formatEGP(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                  <select
                    value={item.status || 'pending'}
                    onChange={(e) => updateItemStatus.mutate({ itemIndex: idx, status: e.target.value })}
                    className="bg-[#0f0f1a] border border-white/10 text-white text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-red-500/50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="fulfilled">Fulfilled</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fulfillment status */}
      {order && (
        <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Fulfillment Status</p>
              <p className="text-white font-semibold capitalize">{(order.fulfillment_status || 'draft').replace(/_/g, ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Grand Total</p>
              <p className="text-white font-bold">{formatEGP(order.grand_total)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gig Workers Tab
// ---------------------------------------------------------------------------

function GigWorkersTab({ tournament }) {
  const talents = tournament.talents || []

  const { data: gigs = [] } = useQuery({
    queryKey: ['tournament-gigs', tournament.id],
    queryFn: () => apiCall(`/gigs?tournament_id=${tournament.id}`),
    staleTime: 30_000,
  })

  const gigStatusBadge = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    accepted: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    completed: 'bg-blue-500/20 text-blue-400',
  }

  if (talents.length === 0 && gigs.length === 0) {
    return <EmptyState icon={Briefcase} message="No gig workers assigned to this tournament." />
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-5">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Assigned Talent</h3>
        <div className="space-y-3">
          {(gigs.length > 0 ? gigs : talents).map((gig, idx) => (
            <div key={gig.id || idx} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium capitalize">{gig.talent_type || gig.type || 'Talent'}</p>
                <p className="text-xs text-gray-500">
                  {gig.organizer_brand || ''} &middot; {formatEGP(gig.price)}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gigStatusBadge[gig.status] || gigStatusBadge.pending}`}>
                {(gig.status || 'pending').toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
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

export default function TournamentManage({ defaultTab = 'overview' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(defaultTab)

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
    refetchInterval: 30_000,
  })

  // Fetch confirmed teams for seeding/brackets
  const registeredTeamIds = tournament?.teams || []
  const { data: confirmedTeams = [] } = useQuery({
    queryKey: ['confirmed-teams', registeredTeamIds],
    queryFn: async () => {
      if (!registeredTeamIds.length) return []
      const all = await Team.list()
      return all.filter(t => registeredTeamIds.includes(t.id))
    },
    enabled: registeredTeamIds.length > 0,
    staleTime: 30_000,
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

  // Chat mutation
  const sendChatMutation = useMutation({
    mutationFn: (message) => Tournament.sendChat(id, {
      message,
      sender_id: user?.id,
      sender_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Organizer',
      sender_role: 'organizer',
    }),
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

  // Filter visible tabs based on status
  const visibleTabs = TABS.filter((t) => {
    if (t.id === 'report' && tournament.status !== 'completed') return false
    return true
  })

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
                {goLive.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Go Live
              </button>
            )}
            {tournament.status === 'live' && (
              <button
                onClick={() => completeTournament.mutate()}
                disabled={completeTournament.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 disabled:opacity-50 transition"
              >
                {completeTournament.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                Complete
              </button>
            )}
            <button
              onClick={() => navigate(`/organizer/tournaments/new/${id}`)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-gray-300 text-sm font-medium hover:border-red-500/40 hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
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
          {activeTab === 'teams' && (
            <TeamManagementPanel tournament={tournament} canEdit={true} />
          )}
          {activeTab === 'seeding' && (
            <SeedingPanel
              tournament={tournament}
              confirmedTeams={confirmedTeams}
              onBracketsGenerated={() => setActiveTab('brackets')}
            />
          )}
          {activeTab === 'brackets' && (
            <BracketMatchPanel
              tournament={tournament}
              teams={confirmedTeams}
              canEdit={true}
            />
          )}
          {activeTab === 'deliverables' && (
            <DeliverablesTab tournament={tournament} queryClient={queryClient} />
          )}
          {activeTab === 'gig-workers' && (
            <GigWorkersTab tournament={tournament} />
          )}
          {activeTab === 'chat' && (
            <OrganizerChat
              tournament={tournament}
              currentUser={user}
              onSendMessage={(msg) => sendChatMutation.mutate(msg)}
              isLoading={sendChatMutation.isPending}
            />
          )}
          {activeTab === 'report' && <ReportTab tournament={tournament} navigate={navigate} />}
        </div>
      </div>
    </div>
  )
}
