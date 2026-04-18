import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Badge } from '@/api/heruClient'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Edit2, Trash2, Award, Check, X } from 'lucide-react'

const PRESET_COLORS = ['#ff1a1a','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#0ea5e9','#a855f7']

export default function StaffBadges() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editBadge, setEditBadge] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '🏅', color: '#ff1a1a' })
  const [awardForm, setAwardForm] = useState({ userId: '', badgeId: '' })

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ['staff-badges'],
    queryFn: () => Badge.list(),
  })

  const createMutation = useMutation({
    mutationFn: (data) => editBadge ? Badge.update(editBadge.id, data) : Badge.create(data),
    onSuccess: () => {
      toast({ title: editBadge ? 'Badge updated' : 'Badge created' })
      queryClient.invalidateQueries(['staff-badges'])
      setShowForm(false); setEditBadge(null)
      setForm({ name: '', description: '', icon: '🏅', color: '#ff1a1a' })
    },
    onError: err => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => Badge.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['staff-badges']),
  })

  const awardMutation = useMutation({
    mutationFn: (data) => Badge.award(data),
    onSuccess: () => {
      toast({ title: 'Badge awarded!' })
      setAwardForm({ userId: '', badgeId: '' })
    },
    onError: err => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  })

  function openEdit(badge) {
    setEditBadge(badge)
    setForm({ name: badge.name, description: badge.description || '', icon: badge.icon || '🏅', color: badge.color || '#ff1a1a' })
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" /> Badge Management
        </h1>
        <button onClick={() => { setEditBadge(null); setForm({ name: '', description: '', icon: '🏅', color: '#ff1a1a' }); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> New Badge
        </button>
      </div>

      {/* Award badge to user */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-bold text-slate-700 mb-3">Award Badge to Gamer</h2>
        <div className="flex gap-3 flex-wrap">
          <input value={awardForm.userId} onChange={e => setAwardForm(f => ({...f, userId: e.target.value}))} placeholder="Gamer user_id (UUID)" className="flex-1 min-w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400" />
          <select value={awardForm.badgeId} onChange={e => setAwardForm(f => ({...f, badgeId: e.target.value}))} className="flex-1 min-w-48 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400">
            <option value="">Select badge…</option>
            {badges.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
          </select>
          <button onClick={() => awardForm.userId && awardForm.badgeId && awardMutation.mutate({ gamer_user_id: awardForm.userId, badge_id: awardForm.badgeId })}
            disabled={!awardForm.userId || !awardForm.badgeId || awardMutation.isPending}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-lg text-sm disabled:opacity-50 transition-colors">
            {awardMutation.isPending ? '…' : 'Award'}
          </button>
        </div>
      </div>

      {/* Badge list */}
      {isLoading ? <div className="py-12 text-center text-slate-400">Loading…</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map(badge => (
            <div key={badge.id} className={`bg-white rounded-xl border p-4 flex items-start gap-3 ${!badge.is_active ? 'opacity-50' : ''}`}>
              <span className="text-3xl">{badge.icon || '🏅'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-slate-800 truncate">{badge.name}</p>
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: badge.color || '#ff1a1a' }} />
                </div>
                {badge.description && <p className="text-slate-500 text-xs line-clamp-2">{badge.description}</p>}
                <p className="text-slate-400 text-[10px] mt-1 uppercase font-medium">{badge.badge_type}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(badge)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => toggleMutation.mutate({ id: badge.id, is_active: !badge.is_active })} className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors rounded" title={badge.is_active ? 'Deactivate' : 'Activate'}>
                  {badge.is_active ? <X className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="font-bold text-slate-800 text-lg mb-4">{editBadge ? 'Edit Badge' : 'Create Badge'}</h2>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Badge name *" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
              <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Short description" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400" />
              <div className="flex gap-3 items-center">
                <input value={form.icon} onChange={e => setForm(f => ({...f, icon: e.target.value}))} placeholder="Emoji icon" className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 text-center text-xl" />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({...f, color: c}))}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? 'border-slate-700 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowForm(false); setEditBadge(null) }} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors">Cancel</button>
                <button onClick={() => form.name && createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm disabled:opacity-50 transition-colors">
                  {createMutation.isPending ? '…' : editBadge ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
