import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { Search, Edit2, Trash2, Shield, CheckCircle, XCircle, User } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const ROLE_COLORS = { admin:'bg-red-500/15 text-red-400 border-red-500/20', organizer:'bg-violet-500/15 text-violet-400 border-violet-500/20', gamer:'bg-blue-500/15 text-blue-400 border-blue-500/20' }
const ROLES = ['all','gamer','organizer','admin']

export default function StaffUsers() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('all')
  const [editUser, setEdit]   = useState(null)
  const [delId, setDelId]     = useState(null)
  const [form, setForm]       = useState({})

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['staff-users', roleFilter, search],
    queryFn: () => Staff.users({ role: roleFilter !== 'all' ? roleFilter : undefined, search: search || undefined }),
    staleTime: 15000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => Staff.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries(['staff-users']); setEdit(null); toast({ title: 'User updated', duration: 3000 }) },
    onError: e => toast({ title: 'Update failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => Staff.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries(['staff-users']); setDelId(null); toast({ title: 'User deleted', duration: 3000 }) },
    onError: e => toast({ title: 'Delete failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const openEdit = (u) => { setEdit(u); setForm({ role: u.role, full_name: u.full_name||'', is_verified: u.is_verified||false, disabled: u.disabled||false }) }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-black text-white">Users <span className="text-red-500">({users.length})</span></h1>
        <p className="text-zinc-600 text-xs mt-0.5">Edit roles, disable accounts, delete users</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-8 pr-3 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-500/50" />
        </div>
        <div className="flex gap-1">
          {ROLES.map(r => (
            <button key={r} onClick={() => setRole(r)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${roleFilter===r?'bg-red-500 text-white':'bg-[#111] text-zinc-500 hover:text-zinc-300 border border-white/[0.06]'}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] overflow-hidden">
        {isLoading ? <div className="p-12 text-center text-zinc-600">Loading...</div> :
        users.length === 0 ? <div className="p-12 text-center text-zinc-600">No users found</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>{['User','Email','Role','Verified','Status','Joined','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                          <User size={12} className="text-zinc-500" />
                        </div>
                        <Link to={`/staff/users/${u.id}`} className="text-zinc-200 hover:text-red-400 font-medium truncate max-w-[140px]">{u.full_name || u.id?.slice(0,8)}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs font-mono">{u.email || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${ROLE_COLORS[u.role]||'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">{u.is_verified ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-zinc-700" />}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase ${u.disabled?'text-red-400':'text-emerald-400'}`}>{u.disabled?'Disabled':'Active'}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10" title="Edit"><Edit2 size={13}/></button>
                        <button onClick={() => setDelId(u.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10" title="Delete"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-white font-black text-lg">Edit User <span className="text-red-500 text-sm font-mono">{editUser.email}</span></h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Full Name</label>
                <input value={form.full_name} onChange={e => setForm(p=>({...p,full_name:e.target.value}))}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Role</label>
                <select value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:border-red-500/50">
                  <option value="gamer">Gamer</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={form.is_verified} onChange={e => setForm(p=>({...p,is_verified:e.target.checked}))} className="accent-red-500" />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
                  <input type="checkbox" checked={form.disabled} onChange={e => setForm(p=>({...p,disabled:e.target.checked}))} className="accent-red-500" />
                  Disabled
                </label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEdit(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 text-sm">Cancel</button>
              <button onClick={() => updateMut.mutate({ id: editUser.id, data: form })} disabled={updateMut.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50">
                {updateMut.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-black text-lg mb-2">Delete User?</h3>
            <p className="text-zinc-400 text-sm mb-5">This permanently deletes the auth account and all profile data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 text-sm">Cancel</button>
              <button onClick={() => deleteMut.mutate(delId)} disabled={deleteMut.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50">
                {deleteMut.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
