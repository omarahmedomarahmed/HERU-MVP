import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, User, Shield, AlertTriangle } from 'lucide-react'

const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50 w-full"
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
)

export default function StaffUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [delConfirm, setDelConfirm] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['staff-user-detail', id],
    queryFn:  () => Staff.getUser(id),
  })
  const user = data?.user || data || {}

  const [form, setForm] = useState(null)
  const f = form || {
    full_name: user.full_name||'',
    role: user.role||'gamer',
    is_verified: user.is_verified||false,
    disabled: user.disabled||false,
  }

  const saveMut = useMutation({
    mutationFn: (body) => Staff.updateUser(id, body),
    onSuccess: () => { qc.invalidateQueries(['staff-user-detail',id]); toast.success('User updated') },
    onError: (e) => toast.error(e.message),
  })

  const deleteMut = useMutation({
    mutationFn: () => Staff.deleteUser(id),
    onSuccess: () => { navigate('/staff/users'); toast.success('User deleted') },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) return <div className="p-8 text-center text-zinc-500">Loading…</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/staff/users')}
          className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={16}/>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{user.full_name||user.email||'User'}</h1>
          <p className="text-xs text-zinc-500 font-mono">{user.id}</p>
        </div>
        <button onClick={() => setDelConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg border border-red-500/20 transition-colors">
          <Trash2 size={14}/> Delete
        </button>
      </div>

      {/* Auth info (read-only) */}
      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Auth Info</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-zinc-600 text-xs mb-0.5">Email</p><p className="text-zinc-200">{user.email||'—'}</p></div>
          <div><p className="text-zinc-600 text-xs mb-0.5">Created</p><p className="text-zinc-200">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p></div>
          <div><p className="text-zinc-600 text-xs mb-0.5">Last Sign In</p><p className="text-zinc-200">{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}</p></div>
          <div><p className="text-zinc-600 text-xs mb-0.5">Email Confirmed</p><p className="text-zinc-200">{user.email_confirmed_at ? 'Yes' : 'No'}</p></div>
        </div>
      </div>

      {/* Editable profile */}
      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Profile</h2>
        <Field label="Full Name">
          <input className={inp} value={f.full_name} onChange={e=>setForm(p=>({...(p||f),full_name:e.target.value}))}/>
        </Field>
        <Field label="Role">
          <select className={inp} value={f.role} onChange={e=>setForm(p=>({...(p||f),role:e.target.value}))}>
            <option value="gamer">gamer</option>
            <option value="organizer">organizer</option>
            <option value="admin">admin</option>
          </select>
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input type="checkbox" checked={f.is_verified} onChange={e=>setForm(p=>({...(p||f),is_verified:e.target.checked}))}
              className="rounded border-zinc-600 bg-zinc-800"/>
            Verified
          </label>
          <label className="flex items-center gap-2 text-sm text-red-400 cursor-pointer">
            <input type="checkbox" checked={f.disabled} onChange={e=>setForm(p=>({...(p||f),disabled:e.target.checked}))}
              className="rounded border-zinc-600 bg-zinc-800"/>
            Disabled
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={() => saveMut.mutate(f)} disabled={saveMut.isPending}
            className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
            <Save size={14}/> {saveMut.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {delConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400"/>
              <h3 className="font-bold text-white">Delete User?</h3>
            </div>
            <p className="text-sm text-zinc-400">
              This permanently deletes <span className="text-white">{user.email}</span> from Supabase Auth and all associated data. This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDelConfirm(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}
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
