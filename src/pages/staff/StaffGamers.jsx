import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { Search, Edit2, Gamepad2, Star, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function StaffGamers() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [search, setSearch]    = useState('')
  const [talent, setTalent]    = useState('all')
  const [editGamer, setEdit]   = useState(null)
  const [form, setForm]        = useState({})

  const { data: gamers = [], isLoading } = useQuery({
    queryKey: ['staff-gamers', search, talent],
    queryFn: () => Staff.gamers({ search: search||undefined, is_talent: talent==='all'?undefined: talent==='yes' }),
    staleTime: 15000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => Staff.updateGamer(id, data),
    onSuccess: () => { qc.invalidateQueries(['staff-gamers']); setEdit(null); toast({ title: 'Gamer updated', duration: 3000 }) },
    onError: e => toast({ title: 'Failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const openEdit = (g) => {
    setEdit(g)
    setForm({ username: g.username||'', bio: g.bio||'', is_talent: g.is_talent||false,
      talent_type: g.talent_type||'', talent_price: g.talent_price||0,
      talent_rating: g.talent_rating||0, talent_video_link: g.talent_video_link||'' })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">Gamers <span className="text-red-500">({gamers.length})</span></h1>
        <p className="text-zinc-600 text-xs mt-0.5">Edit gamer profiles, toggle talent status, manage stats</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gamers..."
            className="w-full pl-8 pr-3 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-500/50" />
        </div>
        {['all','yes','no'].map(t => (
          <button key={t} onClick={() => setTalent(t)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${talent===t?'bg-red-500 text-white':'bg-[#111] text-zinc-500 hover:text-zinc-300 border border-white/[0.06]'}`}>
            {t==='all'?'All Gamers':t==='yes'?'Talents Only':'Non-Talent'}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] overflow-hidden">
        {isLoading ? <div className="p-12 text-center text-zinc-600">Loading...</div> :
        gamers.length===0 ? <div className="p-12 text-center text-zinc-600">No gamers found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>{['Avatar','Username','Talent','Type','Price','Rating','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {gamers.map(g => (
                  <tr key={g.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] group">
                    <td className="px-4 py-3">
                      {g.avatar ? <img src={g.avatar} className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center"><Gamepad2 size={13} className="text-zinc-500" /></div>}
                    </td>
                    <td className="px-4 py-3 text-zinc-200 font-medium">{g.username||'—'}</td>
                    <td className="px-4 py-3">{g.is_talent ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-zinc-700" />}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{g.talent_type||'—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs font-mono">{g.talent_price ? `EGP ${g.talent_price}` : '—'}</td>
                    <td className="px-4 py-3">
                      {g.talent_rating ? <span className="flex items-center gap-1 text-amber-400 text-xs"><Star size={11} />{g.talent_rating}</span> : <span className="text-zinc-700">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(g)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editGamer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 max-w-lg w-full space-y-4 overflow-y-auto max-h-[90vh]">
            <h3 className="text-white font-black text-lg">Edit Gamer <span className="text-red-500 text-sm">#{editGamer.id?.slice(0,8)}</span></h3>
            {[
              { key:'username', label:'Username', type:'text' },
              { key:'bio', label:'Bio', type:'textarea' },
              { key:'talent_type', label:'Talent Type', type:'text' },
              { key:'talent_price', label:'Talent Price (EGP)', type:'number' },
              { key:'talent_rating', label:'Talent Rating (0-5)', type:'number' },
              { key:'talent_video_link', label:'Talent Video Link', type:'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-xs text-zinc-500 mb-1 block">{label}</label>
                {type === 'textarea'
                  ? <textarea value={form[key]} onChange={e => setForm(p=>({...p,[key]:e.target.value}))} rows={2}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50 resize-none" />
                  : <input type={type} value={form[key]} onChange={e => setForm(p=>({...p,[key]:e.target.value}))}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50" />
                }
              </div>
            ))}
            <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={form.is_talent} onChange={e => setForm(p=>({...p,is_talent:e.target.checked}))} className="accent-red-500" />
              Is Talent
            </label>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEdit(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-sm">Cancel</button>
              <button onClick={() => updateMut.mutate({ id: editGamer.id, data: form })} disabled={updateMut.isPending}
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
