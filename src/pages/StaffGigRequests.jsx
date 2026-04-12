import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { Search, Pencil, X, Briefcase } from 'lucide-react'

const STATUS_COLORS = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted:  'bg-green-500/20 text-green-400 border-green-500/30',
  rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
  completed: 'bg-zinc-800 text-zinc-400 border-zinc-700',
}

export default function StaffGigRequests() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState('all')
  const [editing, setEditing] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['staff-gigs', statusF],
    queryFn:  () => Staff.gigs(statusF !== 'all' ? { status: statusF } : {}),
  })
  const gigs = data?.gigs || data || []

  const saveMut = useMutation({
    mutationFn: ({ id, body }) => Staff.updateGig(id, body),
    onSuccess: () => { qc.invalidateQueries(['staff-gigs']); setEditing(null); toast.success('Gig updated') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = gigs.filter(g => {
    const q = search.toLowerCase()
    return !q || (g.tournament_name||'').toLowerCase().includes(q) ||
      (g.organizer_brand||'').toLowerCase().includes(q) ||
      (g.talent_type||'').toLowerCase().includes(q)
  })

  const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 w-full"
  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Gig Requests</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} gigs</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all','pending','accepted','rejected','completed'].map(s => (
          <button key={s} onClick={() => setStatusF(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors
              ${statusF===s ? 'bg-red-600 text-white' : 'bg-[#111] text-zinc-400 hover:text-white border border-zinc-800'}`}>
            {s}
          </button>
        ))}
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5 ml-auto">
          <Search size={13} className="text-zinc-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search gigs…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-44"/>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
        : filtered.length === 0 ? <div className="p-8 text-center text-zinc-600 text-sm">No gig requests found</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Tournament','Organizer','Talent Type','Price (EGP)','Status','Created',''].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-zinc-300 max-w-[160px] truncate">{g.tournament_name||'—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{g.organizer_brand||'—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{g.talent_type||'—'}</td>
                    <td className="px-4 py-3 font-mono text-white">{Number(g.price||0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[g.status]||STATUS_COLORS.pending}`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {g.created_at ? new Date(g.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditing({...g})}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Pencil size={14}/>
                      </button>
                    </td>
                  </tr>
                ))}
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
                <Briefcase size={15} className="text-red-400"/>
                <span className="font-bold text-white">Edit Gig</span>
              </div>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Status">
                <select className={inp} value={editing.status||'pending'} onChange={e=>setEditing(p=>({...p,status:e.target.value}))}>
                  {['pending','accepted','rejected','completed'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Talent Type">
                <input className={inp} value={editing.talent_type||''} onChange={e=>setEditing(p=>({...p,talent_type:e.target.value}))}/>
              </Field>
              <Field label="Price (EGP)">
                <input type="number" className={inp} value={editing.price||0} onChange={e=>setEditing(p=>({...p,price:e.target.value}))}/>
              </Field>
              <Field label="Notes">
                <textarea rows={3} className={inp} value={editing.notes||''} onChange={e=>setEditing(p=>({...p,notes:e.target.value}))}/>
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => saveMut.mutate({ id: editing.id, body: {
                status: editing.status,
                talent_type: editing.talent_type,
                price: editing.price,
                notes: editing.notes,
              }})} disabled={saveMut.isPending}
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
