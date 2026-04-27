import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall, Staff } from '@/api/heruClient'
import { Settings, Save, RotateCcw, CheckCircle, Plus, Key, Mail, Link2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Setting row (Platform tab)
// ---------------------------------------------------------------------------

function SettingRow({ setting, onSave, saving }) {
  const [value, setValue] = useState(setting.setting_value || '')
  const [saved, setSaved] = useState(false)
  const isDirty = value !== (setting.setting_value || '')
  const isBool = value === 'true' || value === 'false'

  function handleSave() {
    onSave(setting.id || setting.setting_key, value, () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-[#1e1e1e] last:border-0">
      <div className="sm:w-1/3 min-w-0">
        <p className="text-sm font-medium text-zinc-200 font-mono">{setting.setting_key}</p>
        {setting.description && (
          <p className="text-xs text-zinc-600 mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="flex-1 flex items-center gap-2">
        {isBool ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 rounded-lg focus:outline-none focus:border-red-500/50"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-red-500/50 font-mono"
          />
        )}
        {isDirty && (
          <button
            onClick={() => setValue(setting.setting_value || '')}
            className="p-2 text-zinc-600 hover:text-zinc-300 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
        >
          {saved ? (
            <><CheckCircle className="w-3.5 h-3.5" /> Saved</>
          ) : (
            <><Save className="w-3.5 h-3.5" /> Save</>
          )}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Integrations tab status indicator
// ---------------------------------------------------------------------------

function IntegrationRow({ name, envKey, status }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1e1e1e] last:border-0">
      <div>
        <p className="text-sm font-semibold text-zinc-200">{name}</p>
        {envKey && <p className="text-xs text-zinc-600 font-mono mt-0.5">{envKey}</p>}
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
        status === 'connected'
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      }`}>
        {status === 'connected' ? 'Connected' : 'Check Config'}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffSettings() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('platform')
  const [savingKey, setSavingKey] = useState(null)

  // New access key form
  const [newKey, setNewKey] = useState({ access_key: '', staff_name: '', staff_email: '' })

  // Platform settings
  const { data: rawSettings = [], isLoading: loadingSettings } = useQuery({
    queryKey: ['staff-settings'],
    queryFn: () => apiCall('/settings'),
    staleTime: 60_000,
    retry: 1,
  })

  const settings = Array.isArray(rawSettings) ? rawSettings : rawSettings.data || []

  const saveMutation = useMutation({
    mutationFn: ({ key, value }) =>
      apiCall(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ setting_value: value }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-settings'] }),
  })

  function handleSave(key, value, onDone) {
    setSavingKey(key)
    saveMutation.mutate({ key, value }, {
      onSettled: () => {
        setSavingKey(null)
        if (onDone) onDone()
      },
    })
  }

  // Access keys
  const { data: rawKeys = [], isLoading: loadingKeys } = useQuery({
    queryKey: ['staff-access-keys'],
    queryFn: () => Staff.accessKeys(),
    staleTime: 60_000,
    retry: 1,
    enabled: activeTab === 'staff-access',
  })

  const accessKeys = Array.isArray(rawKeys) ? rawKeys : rawKeys.data || []

  const addKeyMutation = useMutation({
    mutationFn: (data) => Staff.createAccessKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-access-keys'] })
      setNewKey({ access_key: '', staff_name: '', staff_email: '' })
    },
  })

  const revokeKeyMutation = useMutation({
    mutationFn: (id) => Staff.deactivateKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-access-keys'] }),
  })

  const TABS = [
    { value: 'platform',     label: 'Platform',     icon: Settings },
    { value: 'staff-access', label: 'Staff Access',  icon: Key },
    { value: 'email',        label: 'Email',         icon: Mail },
    { value: 'integrations', label: 'Integrations',  icon: Link2 },
  ]

  const defaultSettings = [
    { setting_key: 'platform_fee_percent',    setting_value: '15',    description: 'Platform fee % on all transactions' },
    { setting_key: 'maintenance_mode',        setting_value: 'false', description: 'Show maintenance banner to all users' },
    { setting_key: 'min_commitment_percent',  setting_value: '33',    description: 'Min commitment % for organizer agreements' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-[#1a1a1a] p-2.5">
          <Settings className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">App Settings</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Platform configuration and integrations</p>
        </div>
      </div>

      {/* Tab pills */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* --- Platform tab --- */}
      {activeTab === 'platform' && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {loadingSettings ? (
            <div className="px-6 py-16 text-center text-sm text-zinc-600">Loading settings...</div>
          ) : settings.length === 0 ? (
            <div className="px-6 py-4">
              <p className="text-xs text-zinc-600 mb-4">No database settings found. Defaults shown for reference:</p>
              <div>
                {defaultSettings.map(s => (
                  <div key={s.setting_key} className="flex items-start gap-3 py-3 border-b border-[#1e1e1e] last:border-0">
                    <div className="sm:w-1/3">
                      <p className="text-sm font-medium text-zinc-400 font-mono">{s.setting_key}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{s.description}</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-zinc-400 font-mono">{s.setting_value}</span>
                      <span className="ml-2 text-xs text-zinc-600">(default)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 py-2">
              {settings.map(s => (
                <SettingRow
                  key={s.id || s.setting_key}
                  setting={s}
                  onSave={handleSave}
                  saving={savingKey === (s.id || s.setting_key)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Staff Access tab --- */}
      {activeTab === 'staff-access' && (
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e1e1e]">
              <h2 className="text-sm font-bold text-zinc-200">Staff Access Keys</h2>
            </div>
            {loadingKeys ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-600">Loading keys...</div>
            ) : accessKeys.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-600">No access keys found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1e1e1e]">
                      {['Key', 'Name', 'Email', 'Active', 'Created', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accessKeys.map(key => (
                      <tr key={key.id} className="border-b border-[#1e1e1e] hover:bg-[#161616] transition-colors">
                        <td className="px-4 py-3">
                          <code className="text-xs font-mono text-zinc-300 bg-[#1a1a1a] px-1.5 py-0.5 rounded">{key.access_key}</code>
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{key.staff_name || '—'}</td>
                        <td className="px-4 py-3 text-zinc-400">{key.staff_email || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold uppercase ${key.is_active ? 'text-emerald-400' : 'text-zinc-600'}`}>
                            {key.is_active ? 'Active' : 'Revoked'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">
                          {key.created_at ? new Date(key.created_at).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {key.is_active && (
                            <button
                              onClick={() => revokeKeyMutation.mutate(key.id)}
                              disabled={revokeKeyMutation.isPending}
                              className="px-2 py-1 rounded text-xs font-medium bg-red-600/10 text-red-400 hover:bg-red-600/20 border border-red-600/20 transition disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Add new key form */}
          <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
            <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Access Key
            </h3>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input
                type="text"
                value={newKey.access_key}
                onChange={e => setNewKey(k => ({ ...k, access_key: e.target.value }))}
                placeholder="Access key (e.g. HERU-STAFF-…)"
                className="px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-red-500/50 font-mono"
              />
              <input
                type="text"
                value={newKey.staff_name}
                onChange={e => setNewKey(k => ({ ...k, staff_name: e.target.value }))}
                placeholder="Staff name"
                className="px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-red-500/50"
              />
              <input
                type="email"
                value={newKey.staff_email}
                onChange={e => setNewKey(k => ({ ...k, staff_email: e.target.value }))}
                placeholder="Staff email"
                className="px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-red-500/50"
              />
            </div>
            <button
              onClick={() => addKeyMutation.mutate(newKey)}
              disabled={!newKey.access_key || addKeyMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {addKeyMutation.isPending ? 'Adding...' : 'Add Key'}
            </button>
          </div>
        </div>
      )}

      {/* --- Email tab --- */}
      {activeTab === 'email' && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-8 text-center">
          <Mail className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-300 font-semibold mb-1">Email Templates via Resend</p>
          <p className="text-zinc-500 text-sm mb-4">Email templates and logs are managed via the Resend dashboard.</p>
          <a
            href="https://resend.com/emails"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-300 hover:text-zinc-100 hover:border-zinc-500 transition"
          >
            <Link2 className="w-4 h-4" /> Open Resend Dashboard
          </a>
        </div>
      )}

      {/* --- Integrations tab --- */}
      {activeTab === 'integrations' && (
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e1e]">
            <h2 className="text-sm font-bold text-zinc-200">Integration Status</h2>
          </div>
          <div className="px-5 divide-y divide-[#1e1e1e]">
            <IntegrationRow name="Supabase"   envKey="VITE_SUPABASE_URL"       status="connected" />
            <IntegrationRow name="Paymob"     envKey="PAYMOB_ENABLED"          status="check" />
            <IntegrationRow name="Resend"     envKey="RESEND_API_KEY"          status="check" />
            <IntegrationRow name="Riot API"   envKey="RIOT_API_KEY"            status="check" />
            <IntegrationRow name="Discord"    envKey="DISCORD_BOT_TOKEN"       status="check" />
          </div>
        </div>
      )}

      {/* Info note */}
      <div className="rounded-lg bg-red-600/5 border border-red-600/20 px-4 py-3">
        <p className="text-xs text-red-400">
          Changes take effect immediately. Some settings (like maintenance mode) may require a page refresh for users to see the update.
        </p>
      </div>
    </div>
  )
}
