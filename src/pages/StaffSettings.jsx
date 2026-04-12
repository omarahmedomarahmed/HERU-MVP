import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { toast } from 'sonner'
import { Plus, Trash2, X, KeyRound, Settings, Monitor, ShieldOff } from 'lucide-react'

function AccessKeysTab() {
  const qc = useQueryClient()
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ access_key: '', staff_name: '', staff_email: '', notes: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['staff-access-keys'],
    queryFn: () => Staff.accessKeys(),
  })
  const keys = data?.keys || data || []

  const createMut = useMutation({
    mutationFn: (body) => Staff.createAccessKey(body),
    onSuccess: () => { qc.invalidateQueries(['staff-access-keys']); setCreating(false); setForm({ access_key:'',staff_name:'',staff_email:'',notes:'' }); toast.success('Access key created') },
    onError: (e) => toast.error(e.message),
  })

  const deactivateMut = useMutation({
    mutationFn: (id) => Staff.deactivateKey(id),
    onSuccess: () => { qc.invalidateQueries(['staff-access-keys']); toast.success('Key deactivated') },
    onError: (e) => toast.error(e.message),
  })

  const inp = "bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500/50"

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus size={14}/> New Key
        </button>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? <div className="p-6 text-center text-zinc-500 text-sm">Loading…</div>
        : keys.length === 0 ? <div className="p-6 text-center text-zinc-600 text-sm">No access keys</div>
        : (
          <div className="divide-y divide-zinc-800/30">
            {keys.map(k => (
              <div key={k.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-sm text-white">{k.access_key}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                      ${k.is_active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {k.is_active ? 'active' : 'inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {k.staff_name} &bull; {k.staff_email}
                    {k.use_count > 0 && <span className="ml-2">Used {k.use_count}×</span>}
                    {k.last_used_at && <span className="ml-2">Last: {new Date(k.last_used_at).toLocaleDateString()}</span>}
                  </p>
                  {k.notes && <p className="text-xs text-zinc-600 mt-0.5">{k.notes}</p>}
                </div>
                {k.is_active && (
                  <button onClick={() => deactivateMut.mutate(k.id)}
                    disabled={deactivateMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-colors">
                    <ShieldOff size={12}/> Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <span className="font-bold text-white">New Access Key</span>
              <button onClick={() => setCreating(false)} className="text-zinc-500 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Access Key', key: 'access_key', placeholder: 'HERU-STAFF-XXX-2026' },
                { label: 'Staff Name', key: 'staff_name', placeholder: 'John Doe' },
                { label: 'Staff Email', key: 'staff_email', placeholder: 'john@heru.gg' },
                { label: 'Notes', key: 'notes', placeholder: 'Optional notes' },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="text-[11px] text-zinc-500 uppercase tracking-wider">{f.label}</label>
                  <input className={inp} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-zinc-800">
              <button onClick={() => setCreating(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button onClick={() => createMut.mutate(form)}
                disabled={createMut.isPending || !form.access_key || !form.staff_name}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg disabled:opacity-50">
                {createMut.isPending ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SessionsTab() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['staff-sessions'],
    queryFn: () => Staff.sessions(),
  })
  const sessions = data?.sessions || data || []

  const terminateMut = useMutation({
    mutationFn: (id) => Staff.terminateSession(id),
    onSuccess: () => { qc.invalidateQueries(['staff-sessions']); toast.success('Session terminated') },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
      {isLoading ? <div className="p-6 text-center text-zinc-500 text-sm">Loading…</div>
      : sessions.length === 0 ? <div className="p-6 text-center text-zinc-600 text-sm">No active sessions</div>
      : (
        <div className="divide-y divide-zinc-800/30">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm text-white font-medium">{s.staff_name||s.staff_email}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                    ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    {s.is_active ? 'active' : 'expired'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {s.ip_address && <span className="mr-2">IP: {s.ip_address}</span>}
                  Started: {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
                  {s.expires_at && <span className="ml-2">Expires: {new Date(s.expires_at).toLocaleString()}</span>}
                </p>
              </div>
              {s.is_active && (
                <button onClick={() => terminateMut.mutate(s.id)}
                  disabled={terminateMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-colors">
                  <Trash2 size={12}/> Terminate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AppSettingsTab() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['staff-app-settings'],
    queryFn: () => Staff.appSettings(),
  })
  const settings = data?.settings || data || []

  const saveMut = useMutation({
    mutationFn: ({ key, value }) => Staff.updateAppSetting(key, { setting_value: value }),
    onSuccess: () => { qc.invalidateQueries(['staff-app-settings']); toast.success('Setting saved') },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
      {isLoading ? <div className="p-6 text-center text-zinc-500 text-sm">Loading…</div>
      : settings.length === 0 ? <div className="p-6 text-center text-zinc-600 text-sm">No settings</div>
      : (
        <div className="divide-y divide-zinc-800/30">
          {settings.map(s => (
            <div key={s.id||s.setting_key} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-zinc-300">{s.setting_key}</p>
                {s.description && <p className="text-xs text-zinc-600 mt-0.5">{s.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  className="bg-[#1a1a1a] border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500/50 w-48"
                  value={editing[s.setting_key] ?? s.setting_value ?? ''}
                  onChange={e=>setEditing(p=>({...p,[s.setting_key]:e.target.value}))}
                />
                <button
                  onClick={() => saveMut.mutate({ key: s.setting_key, value: editing[s.setting_key] ?? s.setting_value })}
                  disabled={saveMut.isPending}
                  className="px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function StaffSettings() {
  const [tab, setTab] = useState('keys')

  const tabs = [
    { id: 'keys',     label: 'Access Keys',   icon: KeyRound  },
    { id: 'sessions', label: 'Active Sessions',icon: Monitor   },
    { id: 'app',      label: 'App Settings',   icon: Settings  },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">System Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Access keys, sessions, and application configuration</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px
              ${tab===t.id ? 'border-red-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            <t.icon size={14}/>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'keys'     && <AccessKeysTab/>}
      {tab === 'sessions' && <SessionsTab/>}
      {tab === 'app'      && <AppSettingsTab/>}
    </div>
  )
}
