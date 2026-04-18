import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import OrganizerLayout from '@/components/layouts/OrganizerLayout.jsx'
import { Venue } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { MapPin, Plus, Clock, CheckCircle, XCircle, Building2, X } from 'lucide-react'

const STATUS_STYLES = {
  pending:  { icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  approved: { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  rejected: { icon: XCircle,       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
}

const AMENITIES_OPTIONS = ['WiFi','Parking','AC','Stage','LED Screens','Sound System','Catering','Green Room','Streaming Setup','VIP Area']

export default function VenueSubmissions() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    venue_name: '', venue_address: '', city: '', country: 'Egypt',
    capacity: '', price_per_day: '', description: '',
    amenities: [], contact_number: '', contact_email: '',
  })

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['venue-submissions', user?.id],
    queryFn: () => Venue.list(),
    enabled: !!user,
  })

  const submitMutation = useMutation({
    mutationFn: (data) => Venue.submit(data),
    onSuccess: () => {
      toast({ title: 'Venue submitted!', description: 'Staff will review your submission within 24 hours.' })
      setShowForm(false)
      setForm({ venue_name: '', venue_address: '', city: '', country: 'Egypt', capacity: '', price_per_day: '', description: '', amenities: [], contact_number: '', contact_email: '' })
      queryClient.invalidateQueries(['venue-submissions', user?.id])
    },
    onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  function handleAmenity(a) {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.venue_name || !form.venue_address) return toast({ title: 'Missing fields', description: 'Venue name and address are required.', variant: 'destructive' })
    submitMutation.mutate({ ...form, capacity: form.capacity ? Number(form.capacity) : undefined, price_per_day: form.price_per_day ? Number(form.price_per_day) : undefined })
  }

  return (
    <OrganizerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-purple-400" /> Venue Submissions
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Submit your venue to be listed on the HERU marketplace under the Venue category.</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors text-sm">
            <Plus className="w-4 h-4" /> Submit Venue
          </button>
        </div>

        {/* Submissions list */}
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" /></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
            <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No venues submitted yet</p>
            <p className="text-zinc-600 text-sm mt-1">Submit a venue and we'll list it on the marketplace after review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(s => {
              const st = STATUS_STYLES[s.status] || STATUS_STYLES.pending
              const Icon = st.icon
              return (
                <div key={s.id} className={`rounded-xl border p-5 ${st.bg}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold">{s.venue_name}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${st.color}`}>
                          <Icon className="w-3 h-3" />{s.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />{s.venue_address}{s.city ? `, ${s.city}` : ''}
                      </p>
                      {s.capacity && <p className="text-zinc-500 text-xs mt-1">Capacity: {s.capacity} · EGP {Number(s.price_per_day || 0).toLocaleString()}/day</p>}
                      {s.staff_notes && <p className="text-zinc-400 text-xs mt-2 italic">Staff note: {s.staff_notes}</p>}
                      {s.status === 'approved' && s.marketplace_item_id && (
                        <p className="text-emerald-400 text-xs mt-2">✅ Listed on marketplace</p>
                      )}
                    </div>
                    <p className="text-zinc-600 text-xs shrink-0">{new Date(s.submitted_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Submission Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-lg font-bold text-white">Submit a Venue</h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-zinc-400 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 font-medium">Venue Name *</label>
                    <input value={form.venue_name} onChange={e => setForm(f => ({...f, venue_name: e.target.value}))} placeholder="e.g. Nexus Esports Center" required className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 font-medium">Address *</label>
                    <input value={form.venue_address} onChange={e => setForm(f => ({...f, venue_address: e.target.value}))} placeholder="Street, area, city" required className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">City</label>
                    <input value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Cairo" className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Country</label>
                    <input value={form.country} onChange={e => setForm(f => ({...f, country: e.target.value}))} className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Capacity</label>
                    <input type="number" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))} placeholder="200" className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Price per Day (EGP)</label>
                    <input type="number" value={form.price_per_day} onChange={e => setForm(f => ({...f, price_per_day: e.target.value}))} placeholder="5000" className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 font-medium">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} placeholder="Describe the venue..." className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Contact Number</label>
                    <input value={form.contact_number} onChange={e => setForm(f => ({...f, contact_number: e.target.value}))} placeholder="+20 1XX..." className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Contact Email</label>
                    <input type="email" value={form.contact_email} onChange={e => setForm(f => ({...f, contact_email: e.target.value}))} placeholder="venue@email.com" className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-zinc-400 font-medium mb-2 block">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES_OPTIONS.map(a => (
                        <button key={a} type="button" onClick={() => handleAmenity(a)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.amenities.includes(a) ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg text-sm transition-colors">Cancel</button>
                  <button type="submit" disabled={submitMutation.isPending} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50">
                    {submitMutation.isPending ? 'Submitting…' : 'Submit for Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  )
}
