import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import { useNavigate } from 'react-router-dom'
import { Radar, TrendingUp, DollarSign, Package, Ban, ExternalLink } from 'lucide-react'

const fmtEGP = (n) => `EGP ${(n || 0).toLocaleString('en-EG')}`

function TierBadge({ tier }) {
  const map = {
    title:  'bg-red-600/20 text-red-400 border border-red-600/30',
    gold:   'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    silver: 'bg-zinc-600/30 text-zinc-300 border border-zinc-600/30',
    bronze: 'bg-amber-700/20 text-amber-500 border border-amber-700/30',
    custom: 'bg-violet-600/20 text-violet-400 border border-violet-600/30',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[tier] || 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
      {tier || 'standard'}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    active:   'bg-emerald-500/20 text-emerald-400',
    disabled: 'bg-zinc-800 text-zinc-500',
    sold_out: 'bg-red-500/20 text-red-400',
    pending:  'bg-amber-500/20 text-amber-400',
    completed:'bg-zinc-700/50 text-zinc-500',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-zinc-800 text-zinc-400'}`}>
      {(status || 'active').replace(/_/g, ' ')}
    </span>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5 flex items-start gap-4">
      <div className={`rounded-lg p-2.5 bg-[#1a1a1a] ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-2xl font-black text-zinc-100 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function StaffRadarPanel() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: rawPackages = [], isLoading: loadingPkgs } = useQuery({
    queryKey: ['staff-packages'],
    queryFn: () => apiCall('/sponsorship-packages?limit=100'),
    staleTime: 30_000,
    retry: 1,
  })

  const { data: rawSponsorships = [], isLoading: loadingSpons } = useQuery({
    queryKey: ['staff-sponsorships'],
    queryFn: () => apiCall('/sponsorships?limit=100'),
    staleTime: 30_000,
    retry: 1,
  })

  const packages = Array.isArray(rawPackages) ? rawPackages : rawPackages.data || []
  const sponsorships = Array.isArray(rawSponsorships) ? rawSponsorships : rawSponsorships.data || []

  const disableMutation = useMutation({
    mutationFn: (id) => apiCall(`/sponsorship-packages/${id}`, { method: 'PUT', body: { status: 'disabled' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-packages'] }),
  })

  // Stats
  const totalPackages = packages.length
  const activeSponsorships = sponsorships.filter(s => s.status === 'active' || s.status === 'paid').length
  const totalRevenue = sponsorships.reduce((sum, s) => sum + (s.platform_fee || (s.amount * 0.15) || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Sponsorship Radar</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Staff oversight of all sponsorship packages and purchases</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Total Packages" value={totalPackages} color="text-violet-400" />
        <StatCard icon={Radar} label="Active Sponsorships" value={activeSponsorships} color="text-emerald-400" />
        <StatCard icon={DollarSign} label="Total Sponsorship Revenue" value={fmtEGP(totalRevenue)} color="text-yellow-400" />
      </div>

      {/* Section 1: Packages */}
      <div>
        <h2 className="text-sm font-bold text-zinc-200 mb-3">Sponsorship Packages</h2>
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {loadingPkgs ? (
            <div className="p-10 text-center text-zinc-600 text-sm">Loading packages...</div>
          ) : packages.length === 0 ? (
            <div className="p-10 text-center text-zinc-600 text-sm">No sponsorship packages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {['Tournament', 'Package Name', 'Tier', 'Price', 'Sold/Max', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {packages.map(pkg => (
                    <tr key={pkg.id} className="border-b border-[#1e1e1e] hover:bg-[#161616] transition-colors">
                      <td className="px-4 py-3 text-zinc-300 max-w-[160px] truncate">
                        {pkg.tournament_name || pkg.tournament_id?.slice(0, 8) || '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-200 font-medium max-w-[160px] truncate">{pkg.name || pkg.package_name || '—'}</td>
                      <td className="px-4 py-3"><TierBadge tier={pkg.tier} /></td>
                      <td className="px-4 py-3 text-zinc-200 font-mono">{fmtEGP(pkg.price)}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">
                        {pkg.sold_count || 0}/{pkg.max_sponsors || pkg.quantity || '∞'}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={pkg.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => disableMutation.mutate(pkg.id)}
                            disabled={pkg.status === 'disabled' || disableMutation.isPending}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 hover:text-red-400 hover:border-red-600/40 transition disabled:opacity-40"
                          >
                            <Ban className="w-3 h-3" /> Disable
                          </button>
                          {pkg.tournament_id && (
                            <button
                              onClick={() => navigate(`/staff/tournaments/${pkg.tournament_id}`)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 hover:text-zinc-100 transition"
                            >
                              <ExternalLink className="w-3 h-3" /> View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Purchases */}
      <div>
        <h2 className="text-sm font-bold text-zinc-200 mb-3">Sponsorship Purchases</h2>
        <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
          {loadingSpons ? (
            <div className="p-10 text-center text-zinc-600 text-sm">Loading sponsorships...</div>
          ) : sponsorships.length === 0 ? (
            <div className="p-10 text-center text-zinc-600 text-sm">No sponsorship purchases yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {['Sponsor Brand', 'Package', 'Tournament', 'Amount', 'Platform Fee', 'Net', 'Status', 'Date'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sponsorships.map(s => {
                    const amount = s.amount || s.total_amount || 0
                    const fee = s.platform_fee || (amount * 0.15)
                    const net = s.net_to_organizer || (amount * 0.85)
                    return (
                      <tr key={s.id} className="border-b border-[#1e1e1e] hover:bg-[#161616] transition-colors">
                        <td className="px-4 py-3 text-zinc-200 font-medium max-w-[140px] truncate">
                          {s.sponsor_brand || s.sponsor_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 max-w-[140px] truncate">
                          {s.package_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 max-w-[140px] truncate">
                          {s.tournament_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-zinc-200 font-mono text-xs">{fmtEGP(amount)}</td>
                        <td className="px-4 py-3 text-red-400 font-mono text-xs">{fmtEGP(fee)}</td>
                        <td className="px-4 py-3 text-emerald-400 font-mono text-xs">{fmtEGP(net)}</td>
                        <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                        <td className="px-4 py-3 text-zinc-500 text-xs">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString('en-GB') : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
