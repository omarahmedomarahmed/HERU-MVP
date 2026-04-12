import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { Search, Edit2, CheckCircle, XCircle, Building2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function StaffOrganizers() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [search, setSearch]  = useState('')
  const [filter, setFilter]  = useState('all')
  const [edit, setEdit]      = useState(null)
  const [form, setForm]      = useState({})

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['staff-organizers', search, filter],
    queryFn: () => Staff.organizers({ search: search||undefined, is_verified: filter==='all'?undefined: filter==='verified' }),
    staleTime: 15000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => Staff.updateOrganizer(id, data),
    onSuccess: () => { qc.invalidateQueries(['staff-organizers']); setEdit(null); toast({ title: 'Organizer updated', duration: 3000 }) },
    onError: e => toast({ title: 'Failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const openEdit = (o) => {
    setEdit(o)
    setForm({ brand_name: o.brand_name||'', description: o.description||'', bio: o.bio||'',
      location: o.location||'', is_verified: o.is_verified||false, primary_color: o.primary_color||'#ff1a1a' })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">Organizers <span className="text-red-500">({orgs.length})</span></h1>
        <p className="text-zinc-600 text-xs mt-0.5">Verify organizers, edit brand profiles, full god-mode access</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by brand name..."
            className="w-full pl-8 pr-3 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-500/50" />
        </div>
        {['all','verified','unverified'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${filter===f?'bg-red-500 text-white':'bg-[#111] text-zinc-500 hover:text-zinc-300 border border-white/[0.06]'}`}>{f}</button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] overflow-hidden">
        {isLoading ? <div className="p-12 text-center text-zinc-600">Loading...</div> :
        orgs.length===0 ? <div className="p-12 text-center text-zinc-600">No organizers found</div> : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/[0.06]">
              <tr>{['Logo','Brand','Location','Verified','Tournaments','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {orgs.map(o => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] group">
                  <td className="px-4 py-3">
                    {o.brand_logo ? <img src={o.brand_logo} className="w-9 h-9 rounded-lg object-cover" />
                      : <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center"><Building2 size={14} className="text-zinc-500" /></div>}
                  </td>
                  <td className="px-4 py-3 text-zinc-200 font-medium">{o.brand_name||'—'}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{o.location||'—'}</td>
                  <td className="px-4 py-3">{o.is_verified ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-zinc-700" />}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{o.total_tournaments_organized||0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(o)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <Edit2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 max-w-lg w-full space-y-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-white font-black text-lg">Edit Organizer</h3>
            {[{k:'brand_name',l:'Brand Name'},{k:'description',l:'Description',area:true},{k:'bio',l:'Bio',area:true},{k:'location',l:'Location'},{k:'primary_color',l:'Primary Color',type:'color'}].map(({k,l,area,type}) => (
              <div key={k}>
                <label className="text-xs text-zinc-500 mb-1 block">{l}</label>
                {area ? <textarea value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))} rows={2}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none resize-none" />
                  : <input type={type||'text'} value={form[k]} onChange={e => setForm(p=>({...p,[k]:e.target.value}))}
                    className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none" />}
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={form.is_verified} onChange={e => setForm(p=>({...p,is_verified:e.target.checked}))} className="accent-red-500" />
              Verified Organizer
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEdit(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-sm">Cancel</button>
              <button onClick={() => updateMut.mutate({ id: edit.id, data: form })} disabled={updateMut.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50">
                {updateMut.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
