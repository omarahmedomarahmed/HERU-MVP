import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import {
  Swords, Users, Trophy, Link2, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2, Copy, Gamepad2,
} from 'lucide-react'

const FORMATS = [
  { value: '1v1', label: '1v1', desc: 'Head-to-head single player', maxSlots: 16, perTeam: 1 },
  { value: '2v2', label: '2v2', desc: '2-player team matches', maxSlots: 8, perTeam: 2 },
  { value: '3v3', label: '3v3', desc: '3-player team battles', maxSlots: 8, perTeam: 3 },
  { value: '5v5', label: '5v5', desc: 'Full team (5 players)', maxSlots: 8, perTeam: 5 },
]

const SLOT_OPTIONS = [2, 4, 8, 16]
const BRACKET_TYPES = [
  { value: 'Single Elimination', label: 'Single Elimination', desc: 'Lose once = out' },
  { value: 'Double Elimination', label: 'Double Elimination', desc: 'Two losses to eliminate' },
  { value: 'Round Robin',        label: 'Round Robin',        desc: 'Everyone plays everyone' },
]

const STEPS = [
  { id: 'setup',   label: 'Setup',   icon: Gamepad2 },
  { id: 'details', label: 'Details', icon: Trophy },
  { id: 'invite',  label: 'Invite',  icon: Link2 },
]

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {})
}

export default function GamerTournamentBuilder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    name: '',
    game: '',
    format: '5v5',
    bracket: 'Single Elimination',
    max_teams: 8,
    description: '',
    is_private: true,
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const selectedFormat = FORMATS.find(f => f.value === form.format)

  const { mutate: create, isLoading } = useMutation({
    mutationFn: () => apiCall('/tournaments', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        game: form.game || 'Custom',
        format: form.bracket,
        participant_type: form.format === '1v1' ? 'solo' : 'team',
        max_teams: form.max_teams,
        description: form.description,
        is_private: true,
        tournament_type: 'community',
        status: 'draft',
        is_online: true,
      }),
    }),
    onSuccess: (data) => {
      setCreated(data?.tournament || data)
      setStep(2)
    },
  })

  const handleNext = () => {
    if (step === 0 && !form.name.trim()) return
    if (step === 0 && !form.format) return
    if (step === 1) { create(); return }
    setStep(s => s + 1)
  }

  const inviteLink = created
    ? `${window.location.origin}/tournaments/${created.id}`
    : ''

  const handleCopy = () => {
    copyToClipboard(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
          <Swords className="h-3.5 w-3.5" /> Community Builder
        </div>
        <h1 className="text-2xl font-black text-white">Create a community tournament</h1>
        <p className="text-gray-400 text-sm mt-1">Private, invite-only. Run a scrim, clan war, or mini bracket in minutes.</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const done = i < step
          const active = i === step
          return (
            <React.Fragment key={s.id}>
              <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? 'text-red-400' : done ? 'text-green-400' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  done ? 'bg-green-500 border-green-500 text-white' :
                  active ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                  'bg-white/5 border-white/10 text-gray-600'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-green-500/40' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step 0: Setup */}
      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tournament Name *</label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. Sunday Scrim #3, Clan War Finals"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Game</label>
            <input
              value={form.game}
              onChange={e => set('game', e.target.value)}
              placeholder="Valorant, CS2, FIFA, Rocket League…"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Format *</label>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(fmt => (
                <button
                  key={fmt.value}
                  type="button"
                  onClick={() => set('format', fmt.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    form.format === fmt.value
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-white/4 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <p className="font-bold text-sm">{fmt.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{fmt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Number of {form.format === '1v1' ? 'Players' : 'Teams'}
            </label>
            <div className="flex gap-2">
              {SLOT_OPTIONS.filter(n => n <= (selectedFormat?.maxSlots || 16)).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('max_teams', n)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-colors ${
                    form.max_teams === n
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-white/4 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Bracket Type</label>
            <div className="space-y-2">
              {BRACKET_TYPES.map(bt => (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => set('bracket', bt.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.bracket === bt.value
                      ? 'bg-red-500/15 border-red-500/40'
                      : 'bg-white/4 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    form.bracket === bt.value ? 'border-red-500' : 'border-white/30'
                  }`}>
                    {form.bracket === bt.value && <div className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${form.bracket === bt.value ? 'text-red-300' : 'text-white'}`}>{bt.label}</p>
                    <p className="text-xs text-gray-500">{bt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Rules, check-in time, prize (EGP), any notes for participants…"
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Summary */}
          <div className="bg-white/4 border border-white/8 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3">Summary</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="text-white font-medium">{form.name || '—'}</span></div>
              <div><span className="text-gray-500">Game:</span> <span className="text-white font-medium">{form.game || 'Custom'}</span></div>
              <div><span className="text-gray-500">Format:</span> <span className="text-white font-medium">{form.format}</span></div>
              <div><span className="text-gray-500">Slots:</span> <span className="text-white font-medium">{form.max_teams}</span></div>
              <div><span className="text-gray-500">Bracket:</span> <span className="text-white font-medium">{form.bracket}</span></div>
              <div><span className="text-gray-500">Type:</span> <span className="text-white font-medium">Private</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Invite */}
      {step === 2 && created && (
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Tournament Created!</h2>
            <p className="text-gray-400 text-sm mt-1">Share the invite link with your players. They'll register and you run the bracket.</p>
          </div>

          <div className="bg-white/4 border border-white/8 rounded-xl p-4 text-left">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-2">Invite Link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono truncate"
              />
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copied ? 'bg-green-500/20 text-green-400' : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/gamer/tournaments/${created.id}`)}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
            >
              Go to Tournament
            </button>
            <button
              onClick={() => navigate('/gamer/home')}
              className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      {step < 2 && (
        <div className="flex items-center justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 text-sm hover:border-white/20 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              onClick={() => navigate('/gamer/home')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 text-sm hover:border-white/20 hover:text-white transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={isLoading || (step === 0 && !form.name.trim())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> :
             step === 1 ? <><CheckCircle2 className="w-4 h-4" /> Create Tournament</> :
             <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      )}
    </div>
  )
}
