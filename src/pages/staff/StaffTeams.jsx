import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { Search, Edit2, Trash2, UsersRound } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function StaffTeams() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editTeam, setEdit] = useState(null)
  const [form, setForm]     = useState({})
  const [delId, setDelId]   = useState(null)

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['staff-teams', search],
    queryFn: () => Staff.teams({ search: search||undefined }),
    staleTime: 15000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => Staff.updateTeam(id, data),
    onSuccess: () => { qc.invalidateQueries(['staff-teams']); setEdit(null); toast({ title: 'Team updated', duration: 3000 }) },
    onError: e => toast({ title: 'Failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => Staff.deleteTeam(id),
    onSuccess: () => { qc.invalidateQueries(['staff-teams']); setDelId(null); toast({ title: 'Team deleted', duration: 3000 }) },
    onError: e => toast({ title: 'Failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const openEdit = (t) => {
    setEdit(t)
    setForm({ name: t.name||'', description: t.description||'', is_recruiting: t.is_recruiting||false, contact_number: t.contact_number||'' })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">Teams <span className="text-red-500">({teams.length})</span></h1>
        <p className="text-zinc-600 text-xs mt-0.5">Edit team data, remove teams, manage members</p>
      </div>

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teams..."
          className="w-full pl-8 pr-3 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-500/50" />
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] overflow-hidden">
        {isLoading ? <div className="p-12 text-center text-zinc-600">Loading...</div> :
        teams.length===0 ? <div className="p-12 text-center text-zinc-600">No teams found</div> : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06]">
              <tr>{['Logo','Team Name','Members','Games','Recruiting','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {teams.map(t => (
                <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] group">
                  <td className="px-4 py-3">
                    {t.logo ? <img src={t.logo} className="w-8 h-8 rounded-lg object-cover" />
                      : <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center"><UsersRound size={13} className="text-zinc-500" /></div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-200 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{(t.members||[]).length} members</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{(t.games||[]).slice(0,2).join(', ')||'—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase ${t.is_recruiting?'text-emerald-400':'text-zinc-600'}`}>{t.is_recruiting?'Open':'Closed'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10"><Edit2 size={13}/></button>
                      <button onClick={() => setDelId(t.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-white font-black text-lg">Edit Team</h3>
            {[{ key:'name', label:'Team Name' },{ key:'description', label:'Description', area:true },{ key:'contact_number', label:'Contact Number' }].map(({ key, label, area }) => (
              <div key={key}>
                <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
                {area ? <textarea value={form[key]} onChange={e => setForm(p=>({...p,[key]:e.target.value}))} rows={2}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50 resize-none" />
                  : <input value={form[key]} onChange={e => setForm(p=>({...p,[key]:e.target.value}))}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50" />}
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={form.is_recruiting} onChange={e => setForm(p=>({...p,is_recruiting:e.target.checked}))} className="accent-red-500" />
              Recruiting
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEdit(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-sm">Cancel</button>
              <button onClick={() => updateMut.mutate({ id: editTeam.id, data: form })} disabled={updateMut.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50">
                {updateMut.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-black mb-2">Delete Team?</h3>
            <p className="text-zinc-400 text-sm mb-5">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-sm">Cancel</button>
              <button onClick={() => deleteMut.mutate(delId)} disabled={deleteMut.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold disabled:opacity-50">
                {deleteMut.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
