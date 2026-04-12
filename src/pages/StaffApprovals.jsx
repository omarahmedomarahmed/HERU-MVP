import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Search, X, Clock } from 'lucide-react'

const TYPE_COLORS = {
  team_join:            'bg-blue-500/20 text-blue-400',
  tournament_publish:   'bg-purple-500/20 text-purple-400',
  talent_application:   'bg-amber-500/20 text-amber-400',
}
const STATUS_COLORS = {
  pending:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function StaffApprovals() {
  const qc = useQueryClient()
  const [tab, setTab]       = useState('pending')
  const [search, setSearch] = useState('')
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason]       = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['staff-approvals', tab],
    queryFn: () => Staff.allApprovals(tab !== 'all' ? { status: tab } : {}),
  })
  const approvals = data?.approvals || data || []

  const filtered = approvals.filter(a => {
    const q = search.toLowerCase()
    return !q || (a.requester_name||'').toLowerCase().includes(q) ||
      (a.reference_name||'').toLowerCase().includes(q) ||
      (a.approval_type||'').toLowerCase().includes(q)
  })

  const approveMut = useMutation({
    mutationFn: (id) => Staff.updateApproval(id, { status: 'approved' }),
    onSuccess: () => { qc.invalidateQueries(['staff-approvals']); toast.success('Approved') },
    onError: (e) => toast.error(e.message),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => Staff.updateApproval(id, { status: 'rejected', rejection_reason: reason }),
    onSuccess: () => {
      qc.invalidateQueries(['staff-approvals'])
      setRejecting(null)
      setReason('')
      toast.success('Rejected')
    },
    onError: (e) => toast.error(e.message),
  })

  const counts = { pending: 0, approved: 0, rejected: 0, all: approvals.length }
  approvals.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++ })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Approvals</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{counts.pending} pending</p>
        </div>
        <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-zinc-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-40"/>
        </div>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {[
          { id: 'pending',  label: 'Pending',  icon: Clock },
          { id: 'approved', label: 'Approved', icon: CheckCircle },
          { id: 'rejected', label: 'Rejected', icon: XCircle },
          { id: 'all',      label: 'All',      icon: null },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px
              ${tab===t.id ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t.icon && <t.icon size={13}/>}
            {t.label}
            {counts[t.id] > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${t.id==='pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-zinc-800 text-zinc-400'}`}>
                {counts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-600 text-sm">No approvals found</div>
        ) : (
          <div className="divide-y divide-zinc-800/30">
            {filtered.map(a => (
              <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[a.approval_type]||'bg-zinc-800 text-zinc-400'}`}>
                      {(a.approval_type||'').replace(/_/g,' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[a.status]||STATUS_COLORS.pending}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium truncate">{a.reference_name || a.reference_id}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    By <span className="text-zinc-400">{a.requester_name||'—'}</span>
                    {a.requester_email && <span className="ml-1 text-zinc-600">({a.requester_email})</span>}
                    <span className="ml-2">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}</span>
                  </p>
                  {a.rejection_reason && (
                    <p className="text-xs text-red-400 mt-1">Reason: {a.rejection_reason}</p>
                  )}
                </div>
                {a.status === 'pending' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => approveMut.mutate(a.id)}
                      disabled={approveMut.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-xs font-semibold rounded-lg border border-green-500/30 transition-colors disabled:opacity-50">
                      <CheckCircle size={12}/> Approve
                    </button>
                    <button onClick={() => { setRejecting(a); setReason('') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-colors">
                      <XCircle size={12}/> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Reject Approval</h3>
              <button onClick={() => setRejecting(null)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <p className="text-sm text-zinc-400">
              Rejecting: <span className="text-white">{rejecting.reference_name}</span>
            </p>
            <textarea
              rows={3}
              value={reason}
              onChange={e=>setReason(e.target.value)}
              placeholder="Rejection reason (optional)…"
              className="w-full bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500/50"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejecting(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => rejectMut.mutate({ id: rejecting.id, reason })}
                disabled={rejectMut.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {rejectMut.isPending ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
