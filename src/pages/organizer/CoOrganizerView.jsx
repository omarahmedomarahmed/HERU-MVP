import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tournament, Team, apiCall } from '@/api/heruClient'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import BracketVisual from '@/components/tournament/BracketVisual'
import {
  Loader2, AlertTriangle, ArrowLeft, Trophy, Calendar, Gamepad2,
  Users, MapPin, Monitor, Shield, Send, MessageSquare, ChevronRight,
  DollarSign, Eye, Package, Briefcase, BarChart3, Activity,
  TrendingUp, Clock, CheckCircle, Lock, Radio, FileText, Star,
  Share2, Camera, Video, Image, Globe,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const formatDate = (dateStr) => {
  if (!dateStr) return 'No date set'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statusColors = {
  draft: 'bg-gray-600/30 text-gray-300',
  published: 'bg-red-600/30 text-red-300',
  live: 'bg-green-500/30 text-green-300',
  completed: 'bg-red-500/30 text-red-300',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-gray-500 shrink-0" />
      <span className="text-sm text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-white">{value || '--'}</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = 'text-violet-400' }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function ChatPanel({ messages, onSend, isSending, canSend = true }) {
  const [chatInput, setChatInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    const trimmed = chatInput.trim()
    if (!trimmed) return
    onSend(trimmed)
    setChatInput('')
  }

  const chatMessages = Array.isArray(messages) ? messages : []

  return (
    <div className="flex flex-col h-[400px]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 p-4 scrollbar-thin scrollbar-thumb-white/10"
      >
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">{canSend ? 'No messages yet. Start the conversation.' : 'No messages yet.'}</p>
          </div>
        ) : (
          chatMessages.map((msg, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center shrink-0 text-xs font-bold text-violet-300">
                {(msg.sender_name || msg.sender || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-violet-300">
                    {msg.sender_name || msg.sender || 'Unknown'}
                  </span>
                  {msg.sender_role && (
                    <span className="text-[10px] text-gray-600 uppercase">{msg.sender_role}</span>
                  )}
                  {msg.timestamp && (
                    <span className="text-xs text-gray-600">
                      {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-0.5 break-words">{msg.message || msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {canSend ? (
        <form onSubmit={handleSend} className="border-t border-white/10 p-3 flex items-center gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-violet-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !chatInput.trim()}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      ) : (
        <div className="border-t border-white/10 p-3 flex items-center gap-2 bg-white/5">
          <Lock className="w-4 h-4 text-gray-500" />
          <p className="text-xs text-gray-500">You can view this chat but cannot send messages.</p>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CoOrganizerView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')

  // ---- Fetch tournament ----
  const {
    data: tournament,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => apiCall(`/tournaments/${id}`),
    enabled: !!id,
    staleTime: 30_000,
    refetchInterval: activeTab === 'organizer-chat' ? 10_000 : 30_000,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  // ---- Fetch teams ----
  const teamIds = tournament?.teams || []
  const { data: teamsData } = useQuery({
    queryKey: ['tournament-teams', id, teamIds],
    queryFn: async () => {
      if (teamIds.length === 0) return []
      const results = await Promise.allSettled(
        teamIds.map((tid) => apiCall(`/teams/${tid}`))
      )
      return results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
    },
    enabled: teamIds.length > 0,
    staleTime: 60_000,
  })
  const teams = Array.isArray(teamsData) ? teamsData : []

  // ---- Fetch tournament order for deliverables ----
  const { data: orderData } = useQuery({
    queryKey: ['tournament-order', id],
    queryFn: () => apiCall(`/tournament-orders?tournament_id=${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })
  const order = Array.isArray(orderData) ? orderData[0] : orderData
  const deliverableItems = order?.items || []

  // ---- Fetch gig workers ----
  const { data: gigs = [] } = useQuery({
    queryKey: ['tournament-gigs', id],
    queryFn: () => apiCall(`/gigs?tournament_id=${id}`),
    enabled: !!id,
    staleTime: 60_000,
  })

  const { data: brandReport } = useQuery({
    queryKey: ['report', id],
    queryFn: () => apiCall(`/tournament-reports?tournament_id=${id}`).then(r => r?.[0]),
    enabled: !!id,
    staleTime: 60_000,
  })

  // ---- Chat mutations ----
  const orgChatMutation = useMutation({
    mutationFn: (message) =>
      Tournament.sendChat(id, {
        message,
        sender_id: user?.id,
        sender_name: user?.user_metadata?.full_name || 'Co-Organizer',
        sender_role: 'co-organizer',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournament', id] }),
    onError: (err) => {
      toast({ title: 'Message failed', description: err.message, variant: 'destructive' })
    },
  })

  // ---- Derive co-org details ----
  const coOrganizers = tournament?.co_organizers || []
  const myCoOrgEntry = coOrganizers.find(
    (co) => co.organizer_id === user?.id || co.user_id === user?.id
  )
  const commitmentPercent = myCoOrgEntry?.commitment_percent || myCoOrgEntry?.percent || 0
  const commitmentAmount = myCoOrgEntry?.commitment_amount || myCoOrgEntry?.amount || 0
  const hasPaymentAccess = myCoOrgEntry?.access_granted === true
  const myCoOrgName = myCoOrgEntry?.brand_name || myCoOrgEntry?.organizer_name || 'Co-Organizer'
  const mainOrgBrand = tournament?.organizer_brand || {}
  const mainOrgName = mainOrgBrand?.name || mainOrgBrand?.brand_name || 'Main Organizer'
  const mainOrgLogo = mainOrgBrand?.logo || mainOrgBrand?.brand_logo

  // Engagement metrics (derived)
  const totalTeams = teamIds.length
  const totalMatches = (tournament?.brackets || []).reduce((sum, r) => sum + (r.matches?.length || 0), 0)
  const completedMatches = (tournament?.brackets || []).reduce(
    (sum, r) => sum + (r.matches || []).filter(m => m.winner).length, 0
  )
  const chatMessages = (tournament?.organizer_chat || []).length
  const gamerChatMessages = (tournament?.general_chat || []).length

  // Deliverable stats
  const pendingDeliverables = deliverableItems.filter(i => !i.status || i.status === 'pending').length
  const confirmedDeliverables = deliverableItems.filter(i => i.status === 'confirmed').length
  const fulfilledDeliverables = deliverableItems.filter(i => i.status === 'fulfilled').length

  // ---- Tabs — gate access behind payment ----
  const allTabs = [
    { key: 'overview', label: 'Overview', icon: Eye, requiresPayment: false },
    { key: 'organizer-chat', label: 'Internal Chat', icon: MessageSquare, requiresPayment: false },
    { key: 'deliverables', label: 'Deliverables', icon: Package, requiresPayment: false },
    { key: 'gig-workers', label: 'Gig Workers', icon: Briefcase, requiresPayment: false },
    { key: 'engagement', label: 'Engagement', icon: BarChart3, requiresPayment: true },
    { key: 'brackets', label: 'Brackets', icon: Trophy, requiresPayment: true },
    { key: 'gamer-chat', label: 'Gamer Chat', icon: Users, requiresPayment: true },
    { key: 'report', label: 'Brand Report', icon: FileText, requiresPayment: true },
  ]
  const tabs = hasPaymentAccess ? allTabs : allTabs.filter(t => !t.requiresPayment)

  // ---- Loading / Error ----
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 max-w-md text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 text-sm">
            Failed to load tournament: {error?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => navigate('/organizer/sponsored')}
            className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            Back to Sponsored
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* ------ Back link ------ */}
      <button
        onClick={() => navigate('/organizer/sponsored')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sponsored Tournaments
      </button>

      {/* ------ Co-organizer banner ------ */}
      <div className={`rounded-xl border p-4 mb-6 ${hasPaymentAccess ? 'border-violet-500/30 bg-violet-500/10' : 'border-yellow-500/30 bg-yellow-500/10'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            {myCoOrgEntry?.brand_logo ? (
              <img src={myCoOrgEntry.brand_logo} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
            ) : (
              <Shield className={`w-5 h-5 shrink-0 ${hasPaymentAccess ? 'text-violet-400' : 'text-yellow-400'}`} />
            )}
            <div>
              <p className="text-white font-bold text-sm">
                {myCoOrgName} · {commitmentPercent >= 66 ? 'Sponsor' : 'Co-Organizer'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {hasPaymentAccess
                  ? 'Full access granted — you can view all tournament details.'
                  : 'Pay your invoice to unlock full tournament access. Chat and deliverables are available now.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {mainOrgLogo && (
              <div className="flex items-center gap-2">
                <img src={mainOrgLogo} alt="" className="w-8 h-8 rounded object-cover border border-white/10" />
                <span className="text-xs text-gray-500">{mainOrgName}</span>
              </div>
            )}
            {commitmentPercent > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-right">
                  <p className="text-xs text-gray-500">Your Share</p>
                  <p className="text-sm font-semibold text-violet-300">{commitmentPercent}% · {formatEGP(commitmentAmount)}</p>
                </div>
              </>
            )}
            {!hasPaymentAccess && (
              <button
                onClick={() => navigate('/organizer/billing')}
                className="px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Pay Invoice →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------ Page Header ------ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-white truncate">
            {tournament?.name || 'Tournament'}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {tournament?.game && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                <Gamepad2 className="w-4 h-4" /> {tournament.game}
              </span>
            )}
            {tournament?.schedule && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="w-4 h-4" /> {formatDate(tournament.schedule)}
              </span>
            )}
            {tournament?.status && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[tournament.status] || 'bg-gray-600/30 text-gray-300'}`}>
                {tournament.status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5" />}
                {tournament.status}
              </span>
            )}
          </div>
        </div>
        {tournament?.total_cost > 0 && (
          <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-right shrink-0">
            <p className="text-xs text-gray-500">Total Cost</p>
            <p className="text-lg font-bold text-white">{formatEGP(tournament.total_cost)}</p>
          </div>
        )}
      </div>

      {/* ------ Tabs ------ */}
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === key
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <TabIcon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ------ Tab Content ------ */}

      {/* Payment gate for locked tabs */}
      {allTabs.find(t => t.key === activeTab)?.requiresPayment && !hasPaymentAccess && (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
          <Lock className="w-12 h-12 text-yellow-400 mb-3 opacity-70" />
          <h3 className="text-white font-bold text-lg mb-1">Access Locked</h3>
          <p className="text-gray-400 text-sm text-center max-w-sm mb-4">
            Complete your invoice payment to unlock full tournament access including brackets, engagement data, and gamer chat.
          </p>
          <button
            onClick={() => navigate('/organizer/billing')}
            className="px-4 py-2 bg-yellow-500 text-black text-sm font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Go to Billing
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Tournament Info */}
          <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Tournament Details</h2>
            <div className="divide-y divide-white/5">
              <InfoRow icon={Trophy} label="Name" value={tournament?.name} />
              <InfoRow icon={Gamepad2} label="Game" value={tournament?.game} />
              <InfoRow icon={Monitor} label="Format" value={tournament?.format} />
              <InfoRow icon={Users} label="Max Teams" value={tournament?.max_teams} />
              <InfoRow icon={Calendar} label="Schedule" value={formatDate(tournament?.schedule)} />
              <InfoRow icon={MapPin} label="Location" value={tournament?.is_offline ? (tournament?.venue || 'Offline') : 'Online'} />
            </div>
            {tournament?.description && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-gray-400 leading-relaxed">{tournament.description}</p>
              </div>
            )}
          </section>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Teams" value={totalTeams} />
            <StatCard icon={Trophy} label="Matches" value={`${completedMatches}/${totalMatches}`} color="text-yellow-400" />
            <StatCard icon={Package} label="Deliverables" value={deliverableItems.length} color="text-green-400" />
            <StatCard icon={Briefcase} label="Gig Workers" value={gigs.length || (tournament?.talents?.length || 0)} color="text-red-400" />
          </div>

          {/* Co-organizers overview */}
          {coOrganizers.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Organizer Partners</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {tournament?.organizer_brand?.logo && (
                      <img src={tournament.organizer_brand.logo} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{tournament?.organizer_brand?.name || tournament?.organizer_brand?.brand_name || 'Main Organizer'}</p>
                      <p className="text-xs text-gray-500">Main Organizer</p>
                    </div>
                  </div>
                </div>
                {coOrganizers.map((co, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                      co.organizer_id === user?.id || co.user_id === user?.id
                        ? 'bg-violet-600/10 border border-violet-500/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {co.brand_logo && <img src={co.brand_logo} alt={co.brand_name} className="w-8 h-8 rounded-full object-cover border border-white/10" />}
                      <div>
                        <p className="text-sm font-medium text-white">{co.brand_name || co.organizer_name || 'Co-Organizer'}</p>
                        <p className="text-xs text-gray-500">{(co.commitment_percent || co.percent || 0) >= 66 ? 'Sponsor' : 'Co-Organizer'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-violet-300">{co.commitment_percent || co.percent || 0}%</p>
                      <p className="text-xs text-gray-500">{formatEGP(co.commitment_amount || co.amount || 0)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Registered Teams */}
          <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Registered Teams ({teamIds.length}{tournament?.max_teams ? `/${tournament.max_teams}` : ''})
            </h2>
            {teamIds.length === 0 ? (
              <p className="text-sm text-gray-500">No teams registered yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                    {team.logo ? (
                      <img src={team.logo} alt="" className="w-6 h-6 rounded object-cover" />
                    ) : (
                      <Users className="w-4 h-4 text-violet-400 shrink-0" />
                    )}
                    <span className="text-sm text-white truncate">{team.name}</span>
                    <span className="text-xs text-gray-500 ml-auto">{team.members?.length || 0} members</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={Users} label="Teams Registered" value={totalTeams} />
            <StatCard icon={Trophy} label="Matches Played" value={completedMatches} color="text-yellow-400" />
            <StatCard icon={Activity} label="Total Matches" value={totalMatches} color="text-green-400" />
            <StatCard icon={MessageSquare} label="Organizer Messages" value={chatMessages} color="text-violet-400" />
            <StatCard icon={Users} label="Gamer Chat Messages" value={gamerChatMessages} color="text-red-400" />
            <StatCard icon={TrendingUp} label="Progress" value={totalMatches > 0 ? `${Math.round((completedMatches / totalMatches) * 100)}%` : '0%'} color="text-cyan-400" />
          </div>

          {/* Tournament progress bar */}
          <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Tournament Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Match Completion</span>
                  <span className="text-white">{completedMatches} / {totalMatches}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-red-500 transition-all"
                    style={{ width: `${totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Deliverables Fulfilled</span>
                  <span className="text-white">{fulfilledDeliverables} / {deliverableItems.length}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                    style={{ width: `${deliverableItems.length > 0 ? (fulfilledDeliverables / deliverableItems.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Activity log */}
          {tournament?.tournament_log?.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[...tournament.tournament_log].reverse().slice(0, 15).map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-600 mt-0.5 shrink-0" />
                    <span className="text-gray-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-gray-400">{log.description}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Brackets Tab */}
      {activeTab === 'brackets' && (
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Tournament Brackets</h2>
          {tournament?.brackets && tournament.brackets.length > 0 ? (
            <BracketVisual brackets={tournament.brackets} teams={teams} allTeams={teams} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Trophy className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Brackets have not been generated yet.</p>
            </div>
          )}
        </section>
      )}

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{pendingDeliverables}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{confirmedDeliverables}</p>
              <p className="text-xs text-gray-400">Confirmed</p>
            </div>
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{fulfilledDeliverables}</p>
              <p className="text-xs text-gray-400">Fulfilled</p>
            </div>
          </div>

          <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Items</h2>
            {deliverableItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No deliverables available.</p>
            ) : (
              <div className="space-y-2">
                {deliverableItems.map((item, idx) => {
                  const stColor = item.status === 'fulfilled' ? 'text-green-400 bg-green-500/20' :
                    item.status === 'confirmed' ? 'text-blue-400 bg-blue-500/20' :
                    'text-yellow-400 bg-yellow-500/20'
                  return (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category} &middot; {formatEGP(item.price)}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stColor}`}>
                        {(item.status || 'pending').toUpperCase()}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Gig Workers Tab */}
      {activeTab === 'gig-workers' && (
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Gig Workers</h2>
          {(gigs.length > 0 || (tournament?.talents?.length || 0) > 0) ? (
            <div className="space-y-3">
              {(gigs.length > 0 ? gigs : tournament.talents).map((gig, idx) => {
                const statusColor = gig.status === 'completed' ? 'text-green-400 bg-green-500/20' :
                  gig.status === 'accepted' ? 'text-blue-400 bg-blue-500/20' :
                  gig.status === 'rejected' ? 'text-red-400 bg-red-500/20' :
                  'text-yellow-400 bg-yellow-500/20'
                return (
                  <div key={gig.id || idx} className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-violet-400" />
                      <div>
                        <p className="text-white text-sm font-medium capitalize">{gig.talent_type || gig.type || 'Talent'}</p>
                        <p className="text-xs text-gray-500">{formatEGP(gig.price)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                      {(gig.status || 'pending').toUpperCase()}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Briefcase className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">No gig workers assigned yet.</p>
            </div>
          )}
        </section>
      )}

      {/* Gamer Chat Tab (view only) */}
      {activeTab === 'gamer-chat' && (
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Gamer Chat</h2>
            <span className="text-xs text-gray-500 ml-auto flex items-center gap-1">
              <Eye className="w-3 h-3" /> View only
            </span>
          </div>
          <ChatPanel
            messages={tournament?.general_chat || []}
            onSend={() => {}}
            isSending={false}
            canSend={false}
          />
        </section>
      )}

      {/* Internal Organizer Chat Tab (can send) */}
      {activeTab === 'organizer-chat' && (
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Internal Tournament Chat</h2>
            <span className="text-xs text-gray-500 ml-auto">
              Organizers, co-organizers, staff, gig workers
            </span>
          </div>
          <ChatPanel
            messages={tournament?.organizer_chat || []}
            onSend={(msg) => orgChatMutation.mutate(msg)}
            isSending={orgChatMutation.isPending}
            canSend={true}
          />
        </section>
      )}

      {/* Brand Report Tab */}
      {activeTab === 'report' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-black text-white">Brand Impact Report</h2>
          </div>
          {!brandReport ? (
            <div className="rounded-xl border border-dashed border-violet-500/30 p-8 text-center">
              <FileText className="w-10 h-10 text-violet-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">No report published yet</p>
              <p className="text-gray-400 text-sm">The main organizer will publish a brand impact report once the tournament is complete.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {brandReport.summary && (
                <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-5">
                  <h3 className="text-violet-400 font-semibold text-sm mb-2">Executive Summary</h3>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{brandReport.summary}</p>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {brandReport.total_reach > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Total Reach</p><p className="text-xl font-bold text-blue-400">{Number(brandReport.total_reach).toLocaleString()}</p></div>}
                {brandReport.total_viewers > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Live Viewers</p><p className="text-xl font-bold text-red-400">{Number(brandReport.total_viewers).toLocaleString()}</p></div>}
                {brandReport.total_engagement > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Engagements</p><p className="text-xl font-bold text-green-400">{Number(brandReport.total_engagement).toLocaleString()}</p></div>}
                {brandReport.social_media_reach > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Social Reach</p><p className="text-xl font-bold text-cyan-400">{Number(brandReport.social_media_reach).toLocaleString()}</p></div>}
                {brandReport.photos_delivered > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Photos</p><p className="text-xl font-bold text-yellow-400">{brandReport.photos_delivered}</p></div>}
                {brandReport.videos_delivered > 0 && <div className="bg-[#12121f] border border-white/10 rounded-xl p-4"><p className="text-xs text-gray-500 mb-1">Videos</p><p className="text-xl font-bold text-yellow-400">{brandReport.videos_delivered}</p></div>}
              </div>
              {(brandReport.social_links || []).length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-white font-semibold text-sm mb-3">Social Media Content</h3>
                  <div className="space-y-2">
                    {brandReport.social_links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        <span className="text-gray-500 w-24 flex-shrink-0">{link.platform}</span>
                        <span className="truncate underline">{link.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {(brandReport.screenshots || []).length > 0 && (
                <div className="rounded-xl border border-white/10 p-5">
                  <h3 className="text-white font-semibold text-sm mb-4">Proof Screenshots</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {brandReport.screenshots.map((ss, i) => (
                      <div key={i} className="space-y-1">
                        {ss.url && <img src={ss.url} alt={ss.caption||''} className="w-full rounded-lg border border-white/10 object-cover max-h-48" onError={e=>e.target.style.display='none'} />}
                        <p className="text-xs text-gray-400">{ss.category}{ss.caption && ` — ${ss.caption}`}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
