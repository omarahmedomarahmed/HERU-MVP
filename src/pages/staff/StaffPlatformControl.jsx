import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import { Save, ToggleLeft, ToggleRight, Shield, Zap } from 'lucide-react'

const FEATURE_TOGGLES = [
  { key: 'coaching_enabled',            label: 'Enable Coaching Marketplace',  description: 'Allow gamers to book coaching sessions.' },
  { key: 'radar_enabled',               label: 'Enable Sponsorship Radar',      description: 'Show sponsorship packages to verified sponsors.' },
  { key: 'community_builder_enabled',   label: 'Enable Community Builder',      description: 'Allow gamers to create community tournaments.' },
  { key: 'service_marketplace_enabled', label: 'Enable Service Marketplace',    description: 'Allow service providers to list and accept bookings.' },
  { key: 'managed_services_enabled',    label: 'Enable Managed Services',       description: 'Allow sponsors to request managed campaigns.' },
  { key: 'maintenance_mode',            label: 'Maintenance Mode',              description: 'Show a site-wide maintenance banner to all users.' },
]

const FEE_SETTINGS = [
  { key: 'platform_fee_percent',        label: 'Platform Fee %',                default: '15' },
  { key: 'sponsorship_fee_percent',     label: 'Sponsorship Fee %',             default: '15' },
  { key: 'coaching_fee_percent',        label: 'Coaching Fee %',                default: '15' },
  { key: 'min_sponsorship_multiplier',  label: 'Min Sponsorship Multiplier',    default: '1.5' },
]

export default function StaffPlatformControl() {
  const queryClient = useQueryClient()

  const { data: rawSettings = [], isLoading } = useQuery({
    queryKey: ['staff-app-settings'],
    queryFn: () => apiCall('/settings'),
    staleTime: 30_000,
    retry: 1,
  })

  const settings = Array.isArray(rawSettings) ? rawSettings : rawSettings.data || []

  // Local state for toggles and fees
  const [features, setFeatures] = useState({
    coaching_enabled: true,
    radar_enabled: true,
    community_builder_enabled: true,
    service_marketplace_enabled: true,
    managed_services_enabled: true,
    maintenance_mode: false,
  })

  const [fees, setFees] = useState({
    platform_fee_percent: '15',
    sponsorship_fee_percent: '15',
    coaching_fee_percent: '15',
    min_sponsorship_multiplier: '1.5',
  })

  // Sync from DB when loaded
  useEffect(() => {
    if (settings.length > 0) {
      const vals = {}
      settings.forEach(s => { vals[s.setting_key] = s.setting_value })
      setFeatures(prev => {
        const next = { ...prev }
        FEATURE_TOGGLES.forEach(t => {
          if (vals[t.key] !== undefined) next[t.key] = vals[t.key] === 'true' || vals[t.key] === true
        })
        return next
      })
      setFees(prev => {
        const next = { ...prev }
        FEE_SETTINGS.forEach(f => {
          if (vals[f.key] !== undefined) next[f.key] = vals[f.key]
        })
        return next
      })
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: ({ key, value }) =>
      apiCall(`/settings/${key}`, { method: 'PUT', body: JSON.stringify({ setting_value: String(value) }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-app-settings'] }),
  })

  function toggle(key) {
    const newVal = !features[key]
    setFeatures(prev => ({ ...prev, [key]: newVal }))
    saveMutation.mutate({ key, value: String(newVal) })
  }

  function saveFee(key) {
    saveMutation.mutate({ key, value: fees[key] })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-red-600/10 p-2.5">
          <Shield className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Platform Control</h1>
          <p className="text-xs text-zinc-500 mt-0.5">God Mode — Full System Access</p>
        </div>
        <span className="ml-auto text-[10px] font-bold bg-red-600/20 text-red-400 border border-red-600/30 rounded-full px-2.5 py-1 uppercase tracking-wider">
          God Mode
        </span>
      </div>

      {/* Section 1: Feature Toggles */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-bold text-zinc-200">Feature Toggles</h2>
          </div>
        </div>
        <div className="divide-y divide-[#1e1e1e]">
          {FEATURE_TOGGLES.map(setting => {
            const isOn = features[setting.key]
            return (
              <div key={setting.key} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-zinc-200">{setting.label}</p>
                    <code className="text-[10px] font-mono bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded text-zinc-500">{setting.key}</code>
                  </div>
                  <p className="text-xs text-zinc-600">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggle(setting.key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    isOn
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {isOn ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {isOn ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 2: Fee Settings */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-bold text-zinc-200">Fee Settings</h2>
        </div>
        <div className="divide-y divide-[#1e1e1e]">
          {FEE_SETTINGS.map(setting => (
            <div key={setting.key} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-200">{setting.label}</p>
                <code className="text-[10px] font-mono text-zinc-600">{setting.key}</code>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  step="0.1"
                  value={fees[setting.key]}
                  onChange={(e) => setFees(prev => ({ ...prev, [setting.key]: e.target.value }))}
                  className="w-24 px-2 py-1.5 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 text-center rounded-lg focus:outline-none focus:border-red-500/50"
                />
                <button
                  onClick={() => saveFee(setting.key)}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Platform Info */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-bold text-zinc-200">Platform Info</h2>
        </div>
        <div className="divide-y divide-[#1e1e1e]">
          {[
            { label: 'Node.js Version',   value: '20.x LTS' },
            { label: 'React Version',     value: '18.x' },
            { label: 'Database',          value: 'Supabase PostgreSQL 15' },
            { label: 'Auth',              value: 'Supabase Auth (JWT)' },
            { label: 'Payments',          value: 'Paymob API (EGP)' },
            { label: 'Hosting',           value: 'Hostinger VPS (Ubuntu 22.04, Nginx, PM2)' },
            { label: 'Last Deploy',       value: 'N/A' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-zinc-500">{row.label}</span>
              <span className="text-sm text-zinc-300 font-mono">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
