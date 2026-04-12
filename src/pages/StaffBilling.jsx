import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { Plus, Search, Pencil, Trash2, CheckCircle, X, Receipt } from 'lucide-react'

const STATUS_COLORS = {
  unpaid:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  partial: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  paid:    'bg-green-500/20 text-green-400 border-green-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const EMPTY_BILL = {
  bill_number: '', bill_type: 'organizer', payer_name: '', payer_email: '',
  grand_total: '', payment_status: 'unpaid', tournament_name: '', notes: '',
  due_date: '', paid_amount: 0,
}

export default function StaffBilling() {
  const qc = useQueryClient()
  const [search, setSearch]       = useState('')
  const [statusF, setStatusF]     = useState('all')
  const [editing, setEditing]     = useState(null)   // bill object
  const [creating, setCreating]   = useState(false)
  const [newBill, setNewBill]     = useState(EMPTY_BILL)
  const [deleting, setDeleting]   = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['staff-bills', statusF],
    queryFn: () => Staff.allBills(statusF !== 'all' ? { payment_status: statusF } : {}),
  })
  const bills = data?.bills || data || []

  const saveMut = useMutation({
    mutationFn: ({ id, body }) => Staff.updateBill(id, body),
    onSuccess: () => { qc.invalidateQueries(['staff-bills']); setEditing(null); toast.success('Bill updated') },
    onError: (e) => toast.error(e.message),
  })

  const createMut = useMutation({
    mutationFn: (body) => Staff.createBill(body),
    onSuccess: () => { qc.invalidateQueries(['staff-bills']); setCreating(false); setNewBill(EMPTY_BILL); toast.success('Bill created') },
    onError: (e) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => Staff.deleteBill(id),
    onSuccess: () => { qc.invalidateQueries(['staff-bills']); setDeleting(null); toast.success('Bill deleted') },
    onError: (e) => toast.error(e.message),
  })

  const markPaidMut = useMutation({
    mutationFn: (id) => Staff.updateBill(id, { payment_status: 'paid', paid_amount: bills.find(b=>b.id===id)?.grand_total }),
    onSuccess: () => { qc.invalidateQueries(['staff-bills']); toast.success('Marked as paid') },
    onError: (e) => toast.error(e.message),
  })

  const filtered = bills.filter(b => {
    const q = search.toLowerCase()
    return !q || (b.bill_number||'').toLowerCase().includes(q) ||
      (b.payer_name||'').toLowerCase().includes(q) ||
      (b.tournament_name||'').toLowerCase().includes(q)
  })

  const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
  const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Billing</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} bills</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={14}/> New Bill
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all','unpaid','partial','paid','overdue'].map(s => (
          <button key={s} onClick={() => setStatusF(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors
              ${statusF===s ? 'bg-red-600 text-white' : 'bg-[#111] text-zinc-400 hover:text-white border border-zinc-800'}`}>
            {s}
          </button>
        ))}
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5 ml-auto">
          <Search size={13} className="text-zinc-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search bills…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-44"/>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-600 text-sm">No bills found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Bill #','Tournament','Payer','Type','Total (EGP)','Status','Due',''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{b.bill_number}</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[160px] truncate">{b.tournament_name || '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{b.payer_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">
                        {b.bill_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-white font-semibold">
                      {Number(b.grand_total||0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[b.payment_status]||STATUS_COLORS.unpaid}`}>
                        {b.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{b.due_date||'—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {b.payment_status !== 'paid' && (
                          <button onClick={() => markPaidMut.mutate(b.id)}
                            title="Mark Paid" className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors">
                            <CheckCircle size={14}/>
                          </button>
                        )}
                        <button onClick={() => setEditing({...b})}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          <Pencil size={14}/>
                        </button>
                        <button onClick={() => setDeleting(b)}
                          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-red-400"/>
                <span className="font-bold text-white">Edit Bill</span>
                <span className="text-xs text-zinc-500 font-mono">{editing.bill_number}</span>
              </div>
              <button onClick={() => setEditing(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Payer Name">
                <input className={inp} value={editing.payer_name||''} onChange={e=>setEditing(p=>({...p,payer_name:e.target.value}))}/>
              </Field>
              <Field label="Payer Email">
                <input className={inp} value={editing.payer_email||''} onChange={e=>setEditing(p=>({...p,payer_email:e.target.value}))}/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bill Type">
                  <select className={inp} value={editing.bill_type||'organizer'} onChange={e=>setEditing(p=>({...p,bill_type:e.target.value}))}>
                    <option value="gamer">gamer</option>
                    <option value="organizer">organizer</option>
                    <option value="co_organizer">co_organizer</option>
                  </select>
                </Field>
                <Field label="Payment Status">
                  <select className={inp} value={editing.payment_status||'unpaid'} onChange={e=>setEditing(p=>({...p,payment_status:e.target.value}))}>
                    <option value="unpaid">unpaid</option>
                    <option value="partial">partial</option>
                    <option value="paid">paid</option>
                    <option value="overdue">overdue</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Grand Total (EGP)">
                  <input type="number" className={inp} value={editing.grand_total||''} onChange={e=>setEditing(p=>({...p,grand_total:e.target.value}))}/>
                </Field>
                <Field label="Paid Amount (EGP)">
                  <input type="number" className={inp} value={editing.paid_amount||0} onChange={e=>setEditing(p=>({...p,paid_amount:e.target.value}))}/>
                </Field>
              </div>
              <Field label="Due Date">
                <input type="date" className={inp} value={editing.due_date||''} onChange={e=>setEditing(p=>({...p,due_date:e.target.value}))}/>
              </Field>
              <Field label="Notes">
                <textarea rows={2} className={inp} value={editing.notes||''} onChange={e=>setEditing(p=>({...p,notes:e.target.value}))}/>
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => saveMut.mutate({ id: editing.id, body: editing })}
                disabled={saveMut.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                {saveMut.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-red-400"/>
                <span className="font-bold text-white">Create Bill</span>
              </div>
              <button onClick={() => setCreating(false)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              <Field label="Bill Number">
                <input className={inp} placeholder="HERU-2026-0001" value={newBill.bill_number} onChange={e=>setNewBill(p=>({...p,bill_number:e.target.value}))}/>
              </Field>
              <Field label="Tournament Name">
                <input className={inp} value={newBill.tournament_name} onChange={e=>setNewBill(p=>({...p,tournament_name:e.target.value}))}/>
              </Field>
              <Field label="Payer Name">
                <input className={inp} value={newBill.payer_name} onChange={e=>setNewBill(p=>({...p,payer_name:e.target.value}))}/>
              </Field>
              <Field label="Payer Email">
                <input className={inp} value={newBill.payer_email} onChange={e=>setNewBill(p=>({...p,payer_email:e.target.value}))}/>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bill Type">
                  <select className={inp} value={newBill.bill_type} onChange={e=>setNewBill(p=>({...p,bill_type:e.target.value}))}>
                    <option value="gamer">gamer</option>
                    <option value="organizer">organizer</option>
                    <option value="co_organizer">co_organizer</option>
                  </select>
                </Field>
                <Field label="Grand Total (EGP)">
                  <input type="number" className={inp} value={newBill.grand_total} onChange={e=>setNewBill(p=>({...p,grand_total:e.target.value}))}/>
                </Field>
              </div>
              <Field label="Due Date">
                <input type="date" className={inp} value={newBill.due_date} onChange={e=>setNewBill(p=>({...p,due_date:e.target.value}))}/>
              </Field>
              <Field label="Notes">
                <textarea rows={2} className={inp} value={newBill.notes} onChange={e=>setNewBill(p=>({...p,notes:e.target.value}))}/>
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => createMut.mutate(newBill)}
                disabled={createMut.isPending || !newBill.bill_number || !newBill.grand_total}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
                {createMut.isPending ? 'Creating…' : 'Create Bill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white">Delete Bill?</h3>
            <p className="text-sm text-zinc-400">This will permanently delete bill <span className="text-white font-mono">{deleting.bill_number}</span>. This cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleting(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => deleteMut.mutate(deleting.id)}
                disabled={deleteMut.isPending}
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
