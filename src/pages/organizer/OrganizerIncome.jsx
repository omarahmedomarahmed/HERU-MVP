import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import { TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

export default function OrganizerIncome() {
  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ['organizer-sponsorships'],
    queryFn: () => apiCall('/sponsorships?role=organizer').then(d => d?.sponsorships || d || []),
    staleTime: 60_000,
  })

  const totalEarned = sponsorships.filter(s => s.status === 'paid' || s.status === 'completed')
    .reduce((s, sp) => s + Number(sp.net_to_organizer || 0), 0)
  const totalGross = sponsorships.reduce((s, sp) => s + Number(sp.amount || 0), 0)
  const heruFees = totalGross - totalEarned
  const pending = sponsorships.filter(s => s.status === 'pending').length

  const statusStyle = {
    pending:   'bg-yellow-500/20 text-yellow-400',
    paid:      'bg-green-500/20 text-green-400',
    active:    'bg-blue-500/20 text-blue-400',
    completed: 'bg-purple-500/20 text-purple-400',
    refunded:  'bg-zinc-500/20 text-zinc-400',
    cancelled: 'bg-zinc-500/20 text-zinc-400',
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sponsorship Income</h1>
          <p className="text-zinc-400 mt-1 text-sm">Revenue from sponsorship package sales — 85% goes to you, 15% to HERU</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Earned (Net)', value: `EGP ${totalEarned.toLocaleString()}`, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Gross Sponsorships', value: `EGP ${totalGross.toLocaleString()}`, icon: DollarSign, color: 'text-purple-400' },
            { label: 'HERU Fees (15%)', value: `EGP ${heruFees.toLocaleString()}`, icon: DollarSign, color: 'text-orange-400' },
            { label: 'Pending Payout', value: pending, icon: Clock, color: 'text-yellow-400' },
          ].map(card => (
            <div key={card.label} className="p-5 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-zinc-500 text-xs">{card.label}</p>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Sponsorship Transactions</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
          ) : sponsorships.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No sponsorship income yet — create packages to attract sponsors</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800">
                  <tr className="text-zinc-500 text-xs uppercase">
                    <th className="text-left p-4">Package</th>
                    <th className="text-left p-4 hidden md:table-cell">Sponsor</th>
                    <th className="text-right p-4">Gross</th>
                    <th className="text-right p-4 hidden md:table-cell">HERU 15%</th>
                    <th className="text-right p-4">Net (85%)</th>
                    <th className="text-center p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsorships.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="p-4 text-white font-medium">{s.package_name || '—'}</td>
                      <td className="p-4 text-zinc-400 hidden md:table-cell">{s.sponsor_brand || '—'}</td>
                      <td className="p-4 text-white text-right">EGP {Number(s.amount || 0).toLocaleString()}</td>
                      <td className="p-4 text-orange-400 text-right hidden md:table-cell">EGP {Number(s.platform_fee || 0).toLocaleString()}</td>
                      <td className="p-4 text-green-400 font-semibold text-right">EGP {Number(s.net_to_organizer || 0).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[s.status] || statusStyle.pending}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  )
}
