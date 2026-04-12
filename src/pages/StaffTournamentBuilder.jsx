import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { Hammer, ChevronRight, Trophy } from 'lucide-react'

const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 w-full"
const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] text-zinc-500 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default function StaffTournamentBuilder() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    organizer_id: '',
    name: '',
    game: '',
    format: 'Single Elimination',
    max_teams: 8,
    description: '',
    schedule: '',
    is_offline: false,
    venue: '',
    tournament_type: 'solo',
    total_cost: 0,
    prizepool_total: 0,
    platform_fee_percent: 15,
    status: 'draft',
  })

  const { data: orgData } = useQuery({
    queryKey: ['staff-organizers-list'],
    queryFn: () => Staff.organizers({}),
  })
  const organizers = orgData?.organizers || orgData || []

  const buildMut = useMutation({
    mutationFn: (body) => Staff.buildOnBehalf(body),
    onSuccess: (res) => {
      const id = res?.tournament?.id || res?.id
      toast.success('Tournament created!')
      if (id) navigate(`/staff/tournaments/${id}`)
      else navigate('/staff/tournaments')
    },
    onError: (e) => toast.error(e.message),
  })

  const subtotal  = Number(form.total_cost||0) + Number(form.prizepool_total||0)
  const fee       = subtotal * (Number(form.platform_fee_percent||15)/100)
  const grandTotal = subtotal + fee

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Hammer size={18} className="text-red-400"/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Build Tournament</h1>
          <p className="text-xs text-zinc-500">Create a tournament on behalf of any organizer</p>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Organizer</h2>
        <Field label="Select Organizer" required>
          <select className={inp} value={form.organizer_id} onChange={e=>set('organizer_id',e.target.value)}>
            <option value="">— Choose organizer —</option>
            {organizers.map(o => (
              <option key={o.id||o.user_id} value={o.user_id||o.id}>
                {o.brand_name||o.user_id} {o.user_id ? `(${o.user_id.slice(0,8)}…)` : ''}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Tournament Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tournament Name" required>
            <input className={inp} placeholder="HERU Egypt Open S3" value={form.name} onChange={e=>set('name',e.target.value)}/>
          </Field>
          <Field label="Game" required>
            <input className={inp} placeholder="Valorant" value={form.game} onChange={e=>set('game',e.target.value)}/>
          </Field>
          <Field label="Format">
            <select className={inp} value={form.format} onChange={e=>set('format',e.target.value)}>
              {['Single Elimination','Double Elimination','Round Robin','Swiss','League'].map(f=>(
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Max Teams">
            <input type="number" min={2} className={inp} value={form.max_teams} onChange={e=>set('max_teams',Number(e.target.value))}/>
          </Field>
          <Field label="Schedule (Date/Time)">
            <input type="datetime-local" className={inp} value={form.schedule} onChange={e=>set('schedule',e.target.value)}/>
          </Field>
          <Field label="Status">
            <select className={inp} value={form.status} onChange={e=>set('status',e.target.value)}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="live">live</option>
            </select>
          </Field>
        </div>
        <Field label="Description">
          <textarea rows={3} className={inp} placeholder="Tournament description…" value={form.description} onChange={e=>set('description',e.target.value)}/>
        </Field>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={form.is_offline} onChange={e=>set('is_offline',e.target.checked)}
              className="rounded border-zinc-600 bg-zinc-800"/>
            Offline Event
          </label>
          {form.is_offline && (
            <div className="flex-1">
              <input className={inp} placeholder="Venue address" value={form.venue} onChange={e=>set('venue',e.target.value)}/>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Financials</h2>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Tournament Type">
            <select className={inp} value={form.tournament_type} onChange={e=>set('tournament_type',e.target.value)}>
              <option value="solo">solo</option>
              <option value="shared">shared</option>
            </select>
          </Field>
          <Field label="Items Cost (EGP)">
            <input type="number" min={0} className={inp} value={form.total_cost} onChange={e=>set('total_cost',e.target.value)}/>
          </Field>
          <Field label="Prizepool (EGP)">
            <input type="number" min={0} className={inp} value={form.prizepool_total} onChange={e=>set('prizepool_total',e.target.value)}/>
          </Field>
        </div>

        {/* Cost breakdown */}
        <div className="bg-[#080808] border border-zinc-800 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-zinc-400">
            <span>Items + Prizepool</span>
            <span className="font-mono">EGP {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Platform Fee ({form.platform_fee_percent}%)</span>
            <span className="font-mono">EGP {fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-white font-bold border-t border-zinc-700 pt-2">
            <span>Grand Total</span>
            <span className="font-mono text-red-400">EGP {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => buildMut.mutate({
            ...form,
            platform_fee: fee,
            total_cost: subtotal,
          })}
          disabled={buildMut.isPending || !form.organizer_id || !form.name || !form.game}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm">
          <Trophy size={15}/>
          {buildMut.isPending ? 'Creating…' : 'Create Tournament'}
          <ChevronRight size={14}/>
        </button>
      </div>
    </div>
  )
}
