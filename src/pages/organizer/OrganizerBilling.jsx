import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import OrganizerLayout from '@/components/layouts/OrganizerLayout'
import { DollarSign, Package, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function OrganizerBilling() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['organizer-service-bookings'],
    queryFn: () => apiCall('/service-bookings?role=organizer').then(d => d?.bookings || d || []),
    staleTime: 60_000,
  })

  const total = bookings.reduce((s, b) => s + Number(b.amount || 0), 0)
  const fees = bookings.reduce((s, b) => s + Number(b.platform_fee || 0), 0)
  const active = bookings.filter(b => ['pending','accepted'].includes(b.status)).length
  const done = bookings.filter(b => b.status === 'completed').length

  const statusStyle = {
    pending:   'bg-yellow-500/20 text-yellow-400',
    accepted:  'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-zinc-500/20 text-zinc-400',
    disputed:  'bg-red-500/20 text-red-400',
  }

  return (
    <OrganizerLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing &amp; Costs</h1>
          <p className="text-zinc-400 mt-1 text-sm">Service provider bookings and platform fees</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Spent', value: `EGP ${total.toLocaleString()}`, icon: DollarSign, color: 'text-purple-400' },
            { label: 'Platform Fees', value: `EGP ${fees.toLocaleString()}`, icon: Package, color: 'text-orange-400' },
            { label: 'Active Bookings', value: active, icon: Clock, color: 'text-blue-400' },
            { label: 'Completed', value: done, icon: CheckCircle2, color: 'text-green-400' },
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

        {/* Table */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Service Bookings</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No service bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800">
                  <tr className="text-zinc-500 text-xs uppercase">
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4 hidden md:table-cell">Provider</th>
                    <th className="text-left p-4 hidden lg:table-cell">Tournament</th>
                    <th className="text-right p-4">Amount</th>
                    <th className="text-right p-4 hidden md:table-cell">HERU Fee</th>
                    <th className="text-center p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 text-white font-medium">{b.service_name || '—'}</td>
                      <td className="p-4 text-zinc-400 hidden md:table-cell">{b.provider_name || '—'}</td>
                      <td className="p-4 text-zinc-400 hidden lg:table-cell">{b.tournament_name || '—'}</td>
                      <td className="p-4 text-white font-semibold text-right">EGP {Number(b.amount || 0).toLocaleString()}</td>
                      <td className="p-4 text-orange-400 text-right hidden md:table-cell">EGP {Number(b.platform_fee || 0).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[b.status] || statusStyle.pending}`}>
                          {b.status}
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
    </OrganizerLayout>
  )
}
