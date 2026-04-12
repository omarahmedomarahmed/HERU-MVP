import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Staff, Tournament } from '@/api/heruClient'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, Trophy, Users, MessageSquare, Layers, Settings, X } from 'lucide-react'

const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 w-full"
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
)

function DetailsTab({ t, onSave }) {
  const [form, setForm] = useState({
    name: t.name||'', game: t.game||'', status: t.status||'draft',
    format: t.format||'', max_teams: t.max_teams||8,
    description: t.description||'', venue: t.venue||'',
    is_offline: t.is_offline||false,
    total_cost: t.total_cost||0, prizepool_total: t.prizepool_total||0,
    platform_fee: t.platform_fee||0, stream_link: t.stream_link||'',
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Name"><input className={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></Field>
        <Field label="Game"><input className={inp} value={form.game} onChange={e=>setForm(p=>({...p,game:e.target.value}))}/></Field>
        <Field label="Status">
          <select className={inp} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
            {['draft','published','live','completed'].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Format"><input className={inp} value={form.format} onChange={e=>setForm(p=>({...p,format:e.target.value}))}/></Field>
        <Field label="Max Teams"><input type="number" className={inp} value={form.max_teams} onChange={e=>setForm(p=>({...p,max_teams:e.target.value}))}/></Field>
        <Field label="Stream Link"><input className={inp} value={form.stream_link} onChange={e=>setForm(p=>({...p,stream_link:e.target.value}))}/></Field>
        <Field label="Total Cost (EGP)"><input type="number" className={inp} value={form.total_cost} onChange={e=>setForm(p=>({...p,total_cost:e.target.value}))}/></Field>
        <Field label="Platform Fee (EGP)"><input type="number" className={inp} value={form.platform_fee} onChange={e=>setForm(p=>({...p,platform_fee:e.target.value}))}/></Field>
        <Field label="Prizepool (EGP)"><input type="number" className={inp} value={form.prizepool_total} onChange={e=>setForm(p=>({...p,prizepool_total:e.target.value}))}/></Field>
        <Field label="Venue"><input className={inp} value={form.venue} onChange={e=>setForm(p=>({...p,venue:e.target.value}))}/></Field>
      </div>
      <Field label="Description">
        <textarea rows={3} className={inp} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
      </Field>
      <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
        <input type="checkbox" checked={form.is_offline} onChange={e=>setForm(p=>({...p,is_offline:e.target.checked}))}
          className="rounded border-zinc-600 bg-zinc-800"/>
        Offline Event
      </label>
      <div className="flex justify-end">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">
          <Save size={14}/> Save Changes
        </button>
      </div>
    </div>
  )
}

function TeamsTab({ t }) {
  const teams = t.teams || []
  const joinReqs = t.join_requests || []
  return (
    <div className="space-y-5">
      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Registered Teams ({teams.length})</h3>
        {teams.length === 0
          ? <p className="text-xs text-zinc-600">No teams registered</p>
          : <div className="flex flex-wrap gap-2">
              {teams.map((tid,i) => (
                <span key={i} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-mono rounded-lg">{tid}</span>
              ))}
            </div>
        }
      </div>
      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Join Requests ({joinReqs.length})</h3>
        {joinReqs.length === 0
          ? <p className="text-xs text-zinc-600">No pending requests</p>
          : <div className="divide-y divide-zinc-800/30">
              {joinReqs.map((r,i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{r.team_name||r.team_id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.status==='pending'?'bg-yellow-500/20 text-yellow-400':'bg-zinc-800 text-zinc-400'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}

function ChatTab({ chats, label }) {
  const msgs = chats || []
  return (
    <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-4 max-h-[500px] overflow-y-auto">
      {msgs.length === 0
        ? <p className="text-xs text-zinc-600">No messages</p>
        : <div className="space-y-3">
            {msgs.map((m,i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-zinc-800 shrink-0 flex items-center justify-center text-xs font-bold text-zinc-400">
                  {(m.sender_name||m.author_name||'?')[0]?.toUpperCase()}
                </div>
                <div>
                  <span className="text-zinc-300 font-semibold text-xs">{m.sender_name||m.author_name||'—'}</span>
                  <span className="text-zinc-600 text-xs ml-2">
                    {m.created_at ? new Date(m.created_at).toLocaleString() : m.timestamp||''}
                  </span>
                  <p className="text-zinc-400 text-sm mt-0.5">{m.text||m.message||m.content}</p>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

function BracketsTab({ t }) {
  const brackets = t.brackets || []
  return (
    <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white mb-3">Brackets ({brackets.length} matches)</h3>
      {brackets.length === 0
        ? <p className="text-xs text-zinc-600">No brackets generated yet</p>
        : <div className="divide-y divide-zinc-800/30">
            {brackets.map((b,i) => (
              <div key={i} className="py-2.5 flex items-center gap-4">
                <span className="text-[10px] text-zinc-600 font-mono w-12">R{b.round||i+1}</span>
                <span className="text-sm text-zinc-300 flex-1">{b.team1_name||b.team1_id||'TBD'}</span>
                <span className="text-xs font-mono text-white">
                  {b.score1??'—'} : {b.score2??'—'}
                </span>
                <span className="text-sm text-zinc-300 flex-1 text-right">{b.team2_name||b.team2_id||'TBD'}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-20 text-center
                  ${b.status==='complete'?'bg-green-500/20 text-green-400':b.status==='live'?'bg-yellow-500/20 text-yellow-400':'bg-zinc-800 text-zinc-400'}`}>
                  {b.status||'pending'}
                </span>
              </div>
            ))}
          </div>
      }
    </div>
  )
}

export default function StaffTournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('details')
  const [delConfirm, setDelConfirm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['staff-tournament-detail', id],
    queryFn:  () => Tournament.get(id),
  })
  const t = data?.tournament || data || {}

  const saveMut = useMutation({
    mutationFn: (body) => Staff.updateTournament(id, body),
    onSuccess: () => { qc.invalidateQueries(['staff-tournament-detail', id]); toast.success('Tournament saved') },
    onError: (e) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: () => Staff.deleteTournament(id),
    onSuccess: () => { navigate('/staff/tournaments'); toast.success('Tournament deleted') },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading…</div>

  const tabs = [
    { id:'details',  label:'Details',   icon:Settings   },
    { id:'teams',    label:'Teams',     icon:Users      },
    { id:'brackets', label:'Brackets',  icon:Trophy     },
    { id:'org_chat', label:'Org Chat',  icon:MessageSquare },
    { id:'gen_chat', label:'General Chat', icon:MessageSquare },
    { id:'sup_chat', label:'Support Chat', icon:MessageSquare },
    { id:'log',      label:'Log',       icon:Layers     },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/staff/tournaments')}
          className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={16}/>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{t.name||'Tournament'}</h1>
          <p className="text-xs text-zinc-500 font-mono">{t.id}</p>
        </div>
        <button onClick={() => setDelConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg border border-red-500/20 transition-colors">
          <Trash2 size={14}/> Delete
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800 overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap
              ${tab===tb.id ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            <tb.icon size={13}/>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'details'  && <DetailsTab t={t} onSave={saveMut.mutate}/>}
      {tab === 'teams'    && <TeamsTab t={t}/>}
      {tab === 'brackets' && <BracketsTab t={t}/>}
      {tab === 'org_chat' && <ChatTab chats={t.organizer_chat} label="Organizer Chat"/>}
      {tab === 'gen_chat' && <ChatTab chats={t.general_chat} label="General Chat"/>}
      {tab === 'sup_chat' && <ChatTab chats={t.support_chat} label="Support Chat"/>}
      {tab === 'log'      && (
        <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-4 space-y-2 max-h-[500px] overflow-y-auto">
          {(t.tournament_log||[]).length === 0
            ? <p className="text-xs text-zinc-600">No log entries</p>
            : (t.tournament_log||[]).map((l,i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="text-zinc-600 whitespace-nowrap">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</span>
                  <span className="text-zinc-400">{l.action||l.message||JSON.stringify(l)}</span>
                </div>
              ))
          }
        </div>
      )}

      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white">Delete Tournament?</h3>
            <p className="text-sm text-zinc-400">This will permanently delete <span className="text-white">{t.name}</span> and all its data.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDelConfirm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
