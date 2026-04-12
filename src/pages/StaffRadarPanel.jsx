import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { Search, Pencil, X, Radar } from 'lucide-react'

const STATUS_COLORS = {
  open:         'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fully_funded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  closed:       'bg-zinc-800 text-zinc-400 border-zinc-700',
}

export default function StaffRadarPanel() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['staff-radar'],
    queryFn:  () => Staff.allRadar({}),
  })
  const listings = data?.listings || data || []

  const saveMut = useMutation({
    mutationFn: ({ id, body }) => Staff.updateRadar(id, body),
    onSuccess: () => { qc.invalidateQueries(['staff-radar']); setEditing(null); toast.success('Radar listing updated') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = listings.filter(r => {
    const q = search.toLowerCase()
    return !q || (r.tournament_name||'').toLowerCase().includes(q) ||
      (r.game||'').toLowerCase().includes(q)
  })

  const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"
  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Sponsorship Radar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} listings</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-zinc-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search radar…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-44"/>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-600 text-sm">No radar listings</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Tournament','Game','Total Cost','Funded %','Slots Left','Status',''].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const coOrgs = r.co_organizers||[]
                  const slotsLeft = (r.max_co_organizers||2) - coOrgs.length
                  return (
                    <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{r.tournament_name}</td>
                      <td className="px-4 py-3 text-zinc-400">{r.game||'—'}</td>
                      <td className="px-4 py-3 font-mono text-zinc-300">EGP {Number(r.total_cost||0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-zinc-800 rounded-full h-1.5 w-16">
                            <div className="bg-red-500 h-1.5 rounded-full" style={{width:`${Math.min(r.funding_percent||0,100)}%`}}/>
                          </div>
                          <span className="text-xs font-mono text-zinc-300">{r.funding_percent||0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-300 font-mono">{slotsLeft}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[r.status]||STATUS_COLORS.open}`}>
                          {(r.status||'').replace(/_/g,' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditing({...r})}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Pencil size={14}/>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Radar size={15} className="text-red-400"/>
                <span className="font-bold text-white">Edit Radar Listing</span>
              </div>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Status">
                <select className={inp} value={editing.status||'open'} onChange={e=>setEditing(p=>({...p,status:e.target.value}))}>
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="fully_funded">fully_funded</option>
                  <option value="closed">closed</option>
                </select>
              </Field>
              <Field label="Funding Percent">
                <input type="number" min={0} max={100} className={inp} value={editing.funding_percent||0}
                  onChange={e=>setEditing(p=>({...p,funding_percent:e.target.value}))}/>
              </Field>
              <Field label="Total Cost (EGP)">
                <input type="number" className={inp} value={editing.total_cost||0}
                  onChange={e=>setEditing(p=>({...p,total_cost:e.target.value}))}/>
              </Field>
              <Field label="Amount Still Needed (EGP)">
                <input type="number" className={inp} value={editing.amount_still_needed||0}
                  onChange={e=>setEditing(p=>({...p,amount_still_needed:e.target.value}))}/>
              </Field>
              <Field label="Description">
                <textarea rows={2} className={inp} value={editing.description||''}
                  onChange={e=>setEditing(p=>({...p,description:e.target.value}))}/>
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => saveMut.mutate({ id: editing.id, body: editing })}
                disabled={saveMut.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
