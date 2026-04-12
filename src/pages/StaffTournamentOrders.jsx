import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff, TournamentOrder } from '@/api/heruClient'
import { toast } from 'sonner'
import { Search, Pencil, X, MessageSquare } from 'lucide-react'

const FS_COLORS = {
  draft:           'bg-zinc-800 text-zinc-400 border-zinc-700',
  pending_payment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_fulfillment:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fulfilled:       'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:       'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function StaffTournamentOrders() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [fsFilter, setFsFilter] = useState('all')
  const [editing, setEditing]   = useState(null)
  const [chatMsg, setChatMsg]   = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['staff-tournament-orders-full', fsFilter],
    queryFn:  () => Staff.allTournamentOrders(fsFilter !== 'all' ? { fulfillment_status: fsFilter } : {}),
  })
  const orders = data?.orders || data || []

  const saveMut = useMutation({
    mutationFn: ({ id, body }) => Staff.updateTournamentOrder(id, body),
    onSuccess: () => { qc.invalidateQueries(['staff-tournament-orders-full']); setEditing(null); toast.success('Order updated') },
    onError: (e) => toast.error(e.message),
  })

  const chatMut = useMutation({
    mutationFn: ({ id, msg }) => TournamentOrder.sendInternalChat(id, { text: msg, sender_name: 'Staff' }),
    onSuccess: () => { qc.invalidateQueries(['staff-tournament-orders-full']); setChatMsg(''); toast.success('Message sent') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    return !q || (o.tournament_name||'').toLowerCase().includes(q) ||
      (o.main_organizer_brand||'').toLowerCase().includes(q)
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Tournament Orders</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} orders</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all','pending_payment','in_fulfillment','fulfilled','cancelled'].map(s => (
          <button key={s} onClick={() => setFsFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors
              ${fsFilter===s ? 'bg-red-600 text-white' : 'bg-[#111] text-zinc-400 hover:text-white border border-zinc-800'}`}>
            {s.replace(/_/g,' ')}
          </button>
        ))}
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5 ml-auto">
          <Search size={13} className="text-zinc-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search orders…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-44"/>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
        : filtered.length === 0 ? <div className="p-8 text-center text-zinc-600 text-sm">No orders found</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Tournament','Organizer','Type','Grand Total','Status','Co-Orgs',''].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium max-w-[180px] truncate">{o.tournament_name||'—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{o.main_organizer_brand||'—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${o.tournament_type==='shared'?'bg-purple-500/20 text-purple-400':'bg-zinc-800 text-zinc-400'}`}>
                        {o.tournament_type||'solo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-white font-semibold">
                      EGP {Number(o.grand_total||0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${FS_COLORS[o.fulfillment_status]||FS_COLORS.draft}`}>
                        {(o.fulfillment_status||'draft').replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">
                      {(o.co_organizers||[]).length}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditing({...o})}
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
          <div className="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <span className="font-bold text-white">Edit Tournament Order</span>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fulfillment Status">
                  <select className={inp} value={editing.fulfillment_status||'draft'}
                    onChange={e=>setEditing(p=>({...p,fulfillment_status:e.target.value}))}>
                    {['draft','pending_payment','in_fulfillment','fulfilled','cancelled'].map(s=>(
                      <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Grand Total (EGP)">
                  <input type="number" className={inp} value={editing.grand_total||0}
                    onChange={e=>setEditing(p=>({...p,grand_total:e.target.value}))}/>
                </Field>
              </div>
              <Field label="Staff Notes">
                <textarea rows={3} className={inp} value={editing.staff_notes||''}
                  onChange={e=>setEditing(p=>({...p,staff_notes:e.target.value}))}/>
              </Field>

              {/* Internal chat */}
              <div>
                <label className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-2">Internal Chat</label>
                <div className="bg-[#0e0e0e] border border-zinc-800 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 mb-2">
                  {(editing.internal_chat||[]).length === 0
                    ? <p className="text-xs text-zinc-600">No messages yet</p>
                    : (editing.internal_chat||[]).map((m,i) => (
                      <div key={i} className="text-xs">
                        <span className="text-zinc-400 font-semibold">{m.sender_name||'Staff'}: </span>
                        <span className="text-zinc-300">{m.text||m.message}</span>
                      </div>
                    ))
                  }
                </div>
                <div className="flex gap-2">
                  <input className={`${inp} flex-1`} placeholder="Send internal message…"
                    value={chatMsg} onChange={e=>setChatMsg(e.target.value)}
                    onKeyDown={e=>e.key==='Enter' && chatMsg && chatMut.mutate({ id:editing.id, msg:chatMsg })}/>
                  <button onClick={() => chatMsg && chatMut.mutate({ id:editing.id, msg:chatMsg })}
                    disabled={!chatMsg||chatMut.isPending}
                    className="px-3 py-2 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded-lg disabled:opacity-50">
                    <MessageSquare size={14}/>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => saveMut.mutate({ id: editing.id, body: {
                fulfillment_status: editing.fulfillment_status,
                staff_notes: editing.staff_notes,
                grand_total: editing.grand_total,
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
