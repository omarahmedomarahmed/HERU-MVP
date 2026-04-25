import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import { useToast } from '@/components/ui/use-toast'
import {
  Trophy, Users, GitBranch, MessageSquare, Settings,
  Loader2, Calendar, Gamepad2, DollarSign, Globe,
  Building, ArrowLeft, Play, Flag, CheckCircle2,
  Pencil, Trash2, UserPlus, Package, Send, ChevronRight,
  Clock, Zap, BarChart3,
} from 'lucide-react'

const formatEGP = (n) => `EGP ${(n || 0).toLocaleString()}`
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const STATUS_STYLES = {
  draft:     { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'DRAFT' },
  published: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',       label: 'PUBLISHED' },
  live:      { cls: 'bg-green-500/20 text-green-400 border-green-500/30',     label: 'LIVE' },
  completed: { cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30',  label: 'COMPLETED' },
  cancelled: { cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',        label: 'CANCELLED' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border uppercase ${s.cls}`}>
      {status === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
      {s.label}
    </span>
  )
}

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: Trophy },
  { id: 'teams',      label: 'Teams',      icon: Users },
  { id: 'brackets',   label: 'Brackets',   icon: GitBranch },
  { id: 'providers',  label: 'Providers',  icon: Package },
  { id: 'chat',       label: 'Chat',       icon: MessageSquare },
  { id: 'settings',   label: 'Settings',   icon: Settings },
]

// ─── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab({ tournament, onStatusChange, isUpdating }) {
  const nextActions = {
    draft:     { label: 'Publish Tournament', icon: Play,        next: 'published', color: 'bg-blue-600 hover:bg-blue-500' },
    published: { label: 'Go Live',            icon: Zap,         next: 'live',      color: 'bg-green-600 hover:bg-green-500' },
    live:      { label: 'Mark Completed',     icon: CheckCircle2, next: 'completed', color: 'bg-purple-600 hover:bg-purple-500' },
    completed: null,
  }
  const action = nextActions[tournament.status]

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className="flex items-center justify-between p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <StatusBadge status={tournament.status} />
            {tournament.sponsorship_enabled && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">ON RADAR</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            {tournament.registration_open ? 'Registration is open' : 'Registration is closed'}
          </p>
        </div>
        {action && (
          <button
            onClick={() => onStatusChange(action.next)}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-bold transition-colors disabled:opacity-50 ${action.color}`}
          >
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <action.icon className="w-4 h-4" />}
            {action.label}
          </button>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tournament Info</h3>
          {[
            ['Game',      tournament.game || '—', <Gamepad2 className="w-3 h-3 text-purple-400" />],
            ['Format',    tournament.format || '—', null],
            ['Start',     fmtDate(tournament.start_date), <Calendar className="w-3 h-3 text-purple-400" />],
            ['End',       fmtDate(tournament.end_date), null],
            ['Location',  tournament.is_online !== false ? 'Online' : (tournament.venue_name || 'Offline TBD'),
              tournament.is_online !== false ? <Globe className="w-3 h-3 text-purple-400" /> : <Building className="w-3 h-3 text-purple-400" />],
            ['Skill',     tournament.skill_level || 'Open', null],
          ].map(([k, v, icon]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{k}</span>
              <span className="text-white font-medium flex items-center gap-1.5">{icon}{v}</span>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Financial</h3>
          {[
            ['Prize Pool',  formatEGP(tournament.prizepool_total)],
            ['Entry Fee',   Number(tournament.entry_fee) > 0 ? formatEGP(tournament.entry_fee) : 'Free'],
            ['Max Teams',   tournament.max_teams || '—'],
            ['Registered',  tournament.teams?.length || 0],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">{k}</span>
              <span className="text-white font-bold">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link
          to={`/organizer/tournaments/new/${tournament.id}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-600 hover:text-white transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit Details
        </Link>
        <Link
          to={`/tournaments/${tournament.id}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-600 hover:text-white transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" /> Public View
        </Link>
      </div>
    </div>
  )
}

// ─── Teams Tab ─────────────────────────────────────────────────────────────────

function TeamsTab({ tournamentId }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['tournament-teams', tournamentId],
    queryFn: () => apiCall(`/tournaments/${tournamentId}/teams`),
    staleTime: 30_000,
  })
  const teams = Array.isArray(raw) ? raw : raw?.teams || raw?.data || []

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>

  if (teams.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
        <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No teams registered yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-400">{teams.length} team{teams.length !== 1 ? 's' : ''} registered</p>
      </div>
      {teams.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
              {t.team_logo || t.logo ? (
                <img src={t.team_logo || t.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-zinc-600" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{t.team_name || t.name || 'Team'}</p>
              <p className="text-zinc-500 text-xs">{t.members?.length || 0} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {t.checked_in && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">CHECKED IN</span>
            )}
            <Link
              to={`/teams/${t.team_id || t.id}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
            >
              View
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Brackets Tab ──────────────────────────────────────────────────────────────

function BracketsTab({ tournament }) {
  const brackets = tournament.brackets || []
  if (brackets.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
        <GitBranch className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm mb-2">No bracket generated yet</p>
        <p className="text-xs text-zinc-600">Brackets are generated automatically when the tournament goes live with registered teams.</p>
      </div>
    )
  }
  return (
    <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
      <p className="text-sm text-zinc-400">Bracket data available. Visual bracket editor coming soon.</p>
      <pre className="mt-3 text-xs text-zinc-600 overflow-auto max-h-96">
        {JSON.stringify(brackets, null, 2)}
      </pre>
    </div>
  )
}

// ─── Providers Tab ─────────────────────────────────────────────────────────────

function ProvidersTab({ tournamentId }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['tournament-bookings', tournamentId],
    queryFn: () => apiCall(`/service-bookings?tournament_id=${tournamentId}`),
    staleTime: 30_000,
  })
  const bookings = Array.isArray(raw) ? raw : raw?.bookings || raw?.data || []

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-zinc-900 rounded-xl border border-zinc-800">
        <Package className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm mb-2">No service providers booked</p>
        <Link to="/providers" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          Browse providers →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-400">{bookings.length} service booking{bookings.length !== 1 ? 's' : ''}</p>
      {bookings.map((b) => (
        <div key={b.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-semibold text-sm">{b.service_name || b.service?.name || 'Service'}</p>
              <p className="text-zinc-500 text-xs mt-0.5 capitalize">{b.category || b.service?.category}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">{formatEGP(b.total_price || b.price)}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${
                b.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                b.status === 'pending'   ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                b.status === 'completed' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}>
                {(b.status || 'pending').toUpperCase()}
              </span>
            </div>
          </div>
          {b.notes && <p className="text-xs text-zinc-600 mt-2">{b.notes}</p>}
        </div>
      ))}
    </div>
  )
}

// ─── Chat Tab ──────────────────────────────────────────────────────────────────

function ChatTab({ tournament }) {
  const [msg, setMsg] = useState('')
  const { user } = useAuth()
  const qc = useQueryClient()
  const { toast } = useToast()

  const chat = tournament.general_chat || []

  const sendMutation = useMutation({
    mutationFn: (content) => apiCall(`/tournaments/${tournament.id}/chat`, { method: 'POST', body: { content } }),
    onSuccess: () => {
      setMsg('')
      qc.invalidateQueries({ queryKey: ['tournament', tournament.id] })
    },
    onError: () => toast({ title: 'Failed to send', variant: 'destructive' }),
  })

  return (
    <div className="flex flex-col h-[500px] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white">Tournament Chat</h3>
        <p className="text-xs text-zinc-500">Visible to all registered participants</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chat.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm">No messages yet</div>
        ) : chat.map((m, i) => (
          <div key={i} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.sender_id === user?.id ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-zinc-800 flex gap-2">
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && msg.trim() && sendMutation.mutate(msg.trim())}
          placeholder="Announce something to participants…"
          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => msg.trim() && sendMutation.mutate(msg.trim())}
          disabled={!msg.trim() || sendMutation.isPending}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ tournament }) {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [regOpen, setRegOpen] = useState(tournament.registration_open)
  const [featured, setFeatured] = useState(tournament.is_featured)

  const updateMutation = useMutation({
    mutationFn: (body) => apiCall(`/tournaments/${tournament.id}`, { method: 'PUT', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournament', tournament.id] })
      toast({ title: 'Updated' })
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  })

  function Toggle({ label, hint, value, onChange }) {
    return (
      <div className="flex items-center justify-between py-4 border-b border-zinc-800 last:border-0">
        <div>
          <p className="text-white text-sm font-medium">{label}</p>
          {hint && <p className="text-zinc-500 text-xs mt-0.5">{hint}</p>}
        </div>
        <button
          onClick={onChange}
          className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-purple-600' : 'bg-zinc-700'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-sm font-bold text-white mb-2">Quick Controls</h3>
        <Toggle
          label="Registration Open"
          hint="Allow teams/players to register"
          value={regOpen}
          onChange={() => {
            const next = !regOpen
            setRegOpen(next)
            updateMutation.mutate({ registration_open: next })
          }}
        />
        <Toggle
          label="Featured Tournament"
          hint="Show on homepage and search highlights"
          value={featured}
          onChange={() => {
            const next = !featured
            setFeatured(next)
            updateMutation.mutate({ is_featured: next })
          }}
        />
      </div>
      <Link
        to={`/organizer/tournaments/new/${tournament.id}`}
        className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Pencil className="w-4 h-4 text-zinc-500" />
          <span className="text-sm text-white">Full Edit in Builder</span>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </Link>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TournamentManage({ defaultTab = 'overview' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(defaultTab)

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => apiCall(`/tournaments/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  })

  const statusMutation = useMutation({
    mutationFn: (status) => apiCall(`/tournaments/${id}`, { method: 'PUT', body: { status } }),
    onSuccess: (_, status) => {
      qc.invalidateQueries({ queryKey: ['tournament', id] })
      toast({ title: `Tournament ${status}` })
    },
    onError: () => toast({ title: 'Status update failed', variant: 'destructive' }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="text-center py-20">
        <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <p className="text-white font-bold">Tournament not found</p>
        <Link to="/organizer/tournaments" className="text-purple-400 text-sm mt-3 block hover:text-purple-300">
          ← Back to tournaments
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <Link to="/organizer/tournaments" className="text-zinc-500 text-xs hover:text-zinc-400 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Tournaments
          </Link>
          <h1 className="text-2xl font-black text-white truncate">{tournament.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={tournament.status} />
            <span className="text-xs text-zinc-600">{tournament.game}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900/60 rounded-xl border border-zinc-800 p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab
          tournament={tournament}
          onStatusChange={(s) => statusMutation.mutate(s)}
          isUpdating={statusMutation.isPending}
        />
      )}
      {activeTab === 'teams'     && <TeamsTab tournamentId={id} />}
      {activeTab === 'brackets'  && <BracketsTab tournament={tournament} />}
      {activeTab === 'providers' && <ProvidersTab tournamentId={id} />}
      {activeTab === 'chat'      && <ChatTab tournament={tournament} />}
      {activeTab === 'settings'  && <SettingsTab tournament={tournament} />}
    </div>
  )
}
