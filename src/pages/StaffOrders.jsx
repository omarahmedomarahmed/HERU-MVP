import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { Search, Pencil, X, ShoppingBag, Layers } from 'lucide-react'

const STATUS_COLORS = {
  pending:    'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed:  'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled:  'bg-red-500/20 text-red-400 border-red-500/30',
}

function OrdersTab({ orders, isLoading, onEdit }) {
  const [search, setSearch] = useState('')
  const filtered = (orders||[]).filter(o => {
    const q = search.toLowerCase()
    return !q || (o.id||'').toLowerCase().includes(q) ||
      (o.tournament_name||'').toLowerCase().includes(q)
  })
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5 w-64">
        <Search size={13} className="text-zinc-500"/>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search orders…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none flex-1"/>
      </div>
      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
        : filtered.length === 0 ? <div className="p-8 text-center text-zinc-600 text-sm">No orders found</div>
        : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Order ID','Tournament','Type','Total (EGP)','Status','Created',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{o.id?.slice(0,8)}…</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[160px] truncate">{o.tournament_name||'—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                        {o.order_type||o.tournament_type||'—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-white font-semibold">{Number(o.total||o.grand_total||0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[o.status||o.fulfillment_status]||STATUS_COLORS.pending}`}>
                        {o.status||o.fulfillment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => onEdit(o)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
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
    </div>
  )
}

export default function StaffOrders() {
  const qc = useQueryClient()
  const [tab, setTab]         = useState('marketplace')
  const [editing, setEditing] = useState(null)

  const { data: ordersData, isLoading: ol } = useQuery({
    queryKey: ['staff-orders'],
    queryFn:  () => Staff.allOrders({}),
  })
  const { data: toData, isLoading: tol } = useQuery({
    queryKey: ['staff-tournament-orders'],
    queryFn:  () => Staff.allTournamentOrders({}),
  })

  const orders   = ordersData?.orders || ordersData || []
  const toOrders = toData?.orders || toData || []

  const saveMut = useMutation({
    mutationFn: ({ id, type, body }) =>
      type === 'marketplace' ? Staff.updateOrder(id, body) : Staff.updateTournamentOrder(id, body),
    onSuccess: () => {
      qc.invalidateQueries(['staff-orders'])
      qc.invalidateQueries(['staff-tournament-orders'])
      setEditing(null)
      toast.success('Order updated')
    },
    onError: (e) => toast.error(e.message),
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
      <div>
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Marketplace + Tournament orders</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {[
          { id: 'marketplace', label: 'Marketplace Orders', icon: ShoppingBag, count: orders.length },
          { id: 'tournament',  label: 'Tournament Orders', icon: Layers, count: toOrders.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px
              ${tab===t.id ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            <t.icon size={14}/>
            {t.label}
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'marketplace'
        ? <OrdersTab orders={orders} isLoading={ol} onEdit={o => setEditing({...o, _type:'marketplace'})}/>
        : <OrdersTab orders={toOrders} isLoading={tol} onEdit={o => setEditing({...o, _type:'tournament'})}/>
      }

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <span className="font-bold text-white">Edit Order</span>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              {editing._type === 'marketplace' ? (
                <>
                  <Field label="Status">
                    <select className={inp} value={editing.status||'pending'} onChange={e=>setEditing(p=>({...p,status:e.target.value}))}>
                      {['pending','processing','completed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Total (EGP)">
                    <input type="number" className={inp} value={editing.total||0} onChange={e=>setEditing(p=>({...p,total:e.target.value}))}/>
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Fulfillment Status">
                    <select className={inp} value={editing.fulfillment_status||'draft'} onChange={e=>setEditing(p=>({...p,fulfillment_status:e.target.value}))}>
                      {['draft','pending_payment','in_fulfillment','fulfilled','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Staff Notes">
                    <textarea rows={3} className={inp} value={editing.staff_notes||''} onChange={e=>setEditing(p=>({...p,staff_notes:e.target.value}))}/>
                  </Field>
                  <Field label="Grand Total (EGP)">
                    <input type="number" className={inp} value={editing.grand_total||0} onChange={e=>setEditing(p=>({...p,grand_total:e.target.value}))}/>
                  </Field>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button
                onClick={() => saveMut.mutate({ id: editing.id, type: editing._type, body: editing })}
                disabled={saveMut.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
