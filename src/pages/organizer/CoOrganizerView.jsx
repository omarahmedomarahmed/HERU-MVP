import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tournament, apiCall } from '@/api/heruClient'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import BracketVisual from '@/components/tournament/BracketVisual'
import {
  Loader2, AlertTriangle, ArrowLeft, Trophy, Calendar, Gamepad2,
  Users, MapPin, Monitor, Shield, Send, MessageSquare, ChevronRight,
  DollarSign, Eye,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const formatDate = (dateStr) => {
  if (!dateStr) return 'No date set'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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

function TeamList({ teams, teamIds }) {
  if (!teamIds || teamIds.length === 0) {
    return <p className="text-sm text-gray-500">No teams registered yet.</p>
  }

  const teamNames = teamIds.map((tid) => {
    const team = teams?.find((t) => t.id === tid)
    return team?.name || tid
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {teamNames.map((name, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2"
        >
          <Users className="w-4 h-4 text-violet-400 shrink-0" />
          <span className="text-sm text-white truncate">{name}</span>
        </div>
      ))}
    </div>
  )
}

function ChatPanel({ messages, onSend, isSending }) {
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
            <p className="text-sm">No messages yet. Start the conversation.</p>
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
                  {msg.timestamp && (
                    <span className="text-xs text-gray-600">
                      {new Date(msg.timestamp).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-300 mt-0.5 break-words">{msg.message || msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

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
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
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
  const [activeTab, setActiveTab] = useState('details')

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
    refetchInterval: activeTab === 'chat' ? 10_000 : false,
  })

  // ---- Fetch teams for bracket display ----
  const teamIds = tournament?.teams || []
  const {
    data: teamsData,
  } = useQuery({
    queryKey: ['tournament-teams', id, teamIds],
    queryFn: async () => {
      if (teamIds.length === 0) return []
      const results = await Promise.allSettled(
        teamIds.map((tid) => apiCall(`/teams/${tid}`))
      )
      return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value)
    },
    enabled: teamIds.length > 0,
    staleTime: 60_000,
  })

  const teams = Array.isArray(teamsData) ? teamsData : []

  // ---- Chat mutation ----
  const chatMutation = useMutation({
    mutationFn: (message) =>
      Tournament.sendChat(id, { message, sender: user?.id, sender_name: user?.user_metadata?.full_name || 'Co-Organizer' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] })
    },
    onError: (err) => {
      toast({
        title: 'Message failed',
        description: err.message || 'Could not send message.',
        variant: 'destructive',
      })
    },
  })

  // ---- Derive co-org details for current user ----
  const coOrganizers = tournament?.co_organizers || []
  const myCoOrgEntry = coOrganizers.find(
    (co) => co.organizer_id === user?.id || co.user_id === user?.id
  )
  const commitmentPercent = myCoOrgEntry?.commitment_percent || myCoOrgEntry?.percent || 0
  const commitmentAmount = myCoOrgEntry?.commitment_amount || myCoOrgEntry?.amount || 0

  // ---- Tabs ----
  const tabs = [
    { key: 'details', label: 'Details', icon: Eye },
    { key: 'brackets', label: 'Brackets', icon: Trophy },
    { key: 'chat', label: 'Chat', icon: MessageSquare },
  ]

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
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-white font-medium text-sm">
              You are a co-organizer of this tournament
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              You have read-only access to tournament details and can participate in the organizer chat.
            </p>
          </div>
        </div>
        {commitmentPercent > 0 && (
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-500">Your Commitment</p>
              <p className="text-sm font-semibold text-red-300">{commitmentPercent}%</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-right">
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-sm font-semibold text-white">{formatEGP(commitmentAmount)}</p>
            </div>
          </div>
        )}
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
                <Gamepad2 className="w-4 h-4" />
                {tournament.game}
              </span>
            )}
            {tournament?.schedule && (
              <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                {formatDate(tournament.schedule)}
              </span>
            )}
            {tournament?.status && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  statusColors[tournament.status] || 'bg-gray-600/30 text-gray-300'
                }`}
              >
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
      <div className="flex gap-1 mb-6 border-b border-white/10">
        {tabs.map(({ key, label, icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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

      {/* Details Tab */}
      {activeTab === 'details' && (
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
              <InfoRow
                icon={MapPin}
                label="Location"
                value={tournament?.is_offline ? (tournament?.venue || 'Offline') : 'Online'}
              />
              {tournament?.stream_link && (
                <InfoRow icon={Monitor} label="Stream" value={tournament.stream_link} />
              )}
            </div>

            {tournament?.description && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-gray-400 leading-relaxed">{tournament.description}</p>
              </div>
            )}
          </section>

          {/* Registered Teams */}
          <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Registered Teams ({teamIds.length}{tournament?.max_teams ? `/${tournament.max_teams}` : ''})
            </h2>
            <TeamList teams={teams} teamIds={teamIds} />
          </section>

          {/* Co-organizers overview */}
          {coOrganizers.length > 0 && (
            <section className="rounded-xl border border-white/10 bg-[#1a1a2e] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Organizer Partners</h2>
              <div className="space-y-3">
                {/* Main organizer */}
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                  <div className="flex items-center gap-3">
                    {tournament?.organizer_brand?.logo && (
                      <img
                        src={tournament.organizer_brand.logo}
                        alt="Main organizer"
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {tournament?.organizer_brand?.name || 'Main Organizer'}
                      </p>
                      <p className="text-xs text-gray-500">Main Organizer</p>
                    </div>
                  </div>
                </div>

                {/* Co-organizers */}
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
                      {co.brand_logo && (
                        <img
                          src={co.brand_logo}
                          alt={co.brand_name}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {co.brand_name || co.organizer_name || 'Co-Organizer'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(co.commitment_percent || co.percent || 0) >= 66 ? 'Sponsor' : 'Co-Organizer'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-violet-300">
                        {co.commitment_percent || co.percent || 0}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatEGP(co.commitment_amount || co.amount || 0)}
                      </p>
                    </div>
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
            <BracketVisual
              brackets={tournament.brackets}
              teams={teams}
              allTeams={teams}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Trophy className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm">Brackets have not been generated yet.</p>
            </div>
          )}
        </section>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <section className="rounded-xl border border-white/10 bg-[#1a1a2e] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-white">Organizer Chat</h2>
            <span className="text-xs text-gray-500 ml-auto">
              All organizers, co-organizers, and staff
            </span>
          </div>
          <ChatPanel
            messages={tournament?.organizer_chat || []}
            onSend={(msg) => chatMutation.mutate(msg)}
            isSending={chatMutation.isPending}
          />
        </section>
      )}
    </div>
  )
}
