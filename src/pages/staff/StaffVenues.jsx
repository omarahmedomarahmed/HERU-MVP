import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Venue } from '@/api/heruClient'
import { useToast } from '@/components/ui/use-toast'
import { Building2, Check, X, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'

const STATUS_STYLES = {
  pending:  { icon: Clock,       color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  approved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  rejected: { icon: XCircle,     color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

export default function StaffVenues() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('pending')
  const [noteModal, setNoteModal] = useState(null) // { id, status }
  const [staffNote, setStaffNote] = useState('')

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['staff-venues', filter],
    queryFn: () => Venue.staffAll(filter ? { status: filter } : {}),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, staff_notes }) => Venue.review(id, { status, staff_notes }),
    onSuccess: (_, vars) => {
      toast({ title: vars.status === 'approved' ? 'Venue approved & listed on marketplace!' : 'Venue rejected' })
      queryClient.invalidateQueries(['staff-venues'])
      setNoteModal(null); setStaffNote('')
    },
    onError: err => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-500" /> Venue Submissions
        </h1>
        <div className="flex gap-2">
          {['pending','approved','rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
          <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${!filter ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
        </div>
      </div>

      {isLoading ? <div className="py-12 text-center text-slate-400">Loading…</div>
        : submissions.length === 0 ? (
          <div className="py-16 text-center rounded-xl bg-slate-50 border border-slate-200">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">No {filter} submissions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map(s => {
              const st = STATUS_STYLES[s.status] || STATUS_STYLES.pending
              const Icon = st.icon
              return (
                <div key={s.id} className={`rounded-xl border p-5 ${st.bg}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">{s.venue_name}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${st.color}`}><Icon className="w-3 h-3" />{s.status}</span>
                      </div>
                      <p className="text-slate-500 text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.venue_address}{s.city ? `, ${s.city}` : ''}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                        {s.capacity && <span>Capacity: {s.capacity}</span>}
                        {s.price_per_day && <span>EGP {Number(s.price_per_day).toLocaleString()}/day</span>}
                        {s.contact_number && <span>📞 {s.contact_number}</span>}
                        {s.contact_email && <span>✉️ {s.contact_email}</span>}
                      </div>
                      {s.description && <p className="text-slate-500 text-xs mt-2">{s.description}</p>}
                      {s.amenities?.length > 0 && <p className="text-slate-400 text-xs mt-1">Amenities: {s.amenities.join(', ')}</p>}
                      {s.staff_notes && <p className="text-slate-600 text-xs mt-2 italic">Note: {s.staff_notes}</p>}
                    </div>
                    {s.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setNoteModal({ id: s.id, status: 'approved' }); setStaffNote('') }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => { setNoteModal({ id: s.id, status: 'rejected' }); setStaffNote('') }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-400 text-white font-bold rounded-lg text-xs transition-colors">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      {/* Note modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-3">
              {noteModal.status === 'approved' ? '✅ Approve Venue' : '❌ Reject Venue'}
            </h2>
            <textarea value={staffNote} onChange={e => setStaffNote(e.target.value)} rows={3} placeholder="Optional note to organizer…" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg text-sm">Cancel</button>
              <button
                onClick={() => reviewMutation.mutate({ id: noteModal.id, status: noteModal.status, staff_notes: staffNote || null })}
                disabled={reviewMutation.isPending}
                className={`flex-1 px-4 py-2 font-bold rounded-lg text-sm text-white disabled:opacity-50 transition-colors ${noteModal.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-500 hover:bg-red-400'}`}>
                {reviewMutation.isPending ? '…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
