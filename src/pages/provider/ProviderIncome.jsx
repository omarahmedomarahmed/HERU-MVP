import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import { TrendingUp, DollarSign, CheckCircle2, Clock, Loader2, Package, Info } from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const escrowStyle = {
  held:     'bg-yellow-500/20 text-yellow-400',
  released: 'bg-green-500/20 text-green-400',
  refunded: 'bg-zinc-500/20 text-zinc-400',
}

const statusStyle = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  accepted:  'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-zinc-500/20 text-zinc-400',
  disputed:  'bg-red-500/20 text-red-400',
  delivered: 'bg-cyan-500/20 text-cyan-400',
}

export default function ProviderIncome() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['provider-bookings-income'],
    queryFn: () => apiCall('/service-bookings?role=provider').then(d => d?.bookings || d || []),
    staleTime: 60_000,
  })

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const releasedBookings = bookings.filter(b => b.escrow_status === 'released' || b.status === 'completed')
  const heldBookings = bookings.filter(b => b.escrow_status === 'held' || (b.status !== 'completed' && b.status !== 'cancelled'))
  const thisMonthBookings = bookings.filter(b => b.created_at && new Date(b.created_at) >= thisMonthStart)
  const completedCount = bookings.filter(b => b.status === 'completed').length

  const totalEarned = releasedBookings.reduce((s, b) => s + Number(b.net_to_provider || (b.total_price || b.amount || 0) * 0.85), 0)
  const inEscrow = heldBookings.reduce((s, b) => s + Number(b.total_price || b.amount || 0), 0)
  const thisMonth = thisMonthBookings.reduce((s, b) => s + Number(b.total_price || b.amount || 0), 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Income</h1>
          <p className="text-zinc-400 mt-1 text-sm">Your earnings from service bookings</p>
        </div>

        {/* Info box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <p className="text-cyan-300 text-sm">
            Payments are held in escrow until the organizer confirms delivery. You receive 85% of every booking.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Earned', value: fmtEGP(totalEarned), icon: TrendingUp, color: 'text-cyan-400' },
            { label: 'In Escrow', value: fmtEGP(inEscrow), icon: Clock, color: 'text-yellow-400' },
            { label: 'This Month', value: fmtEGP(thisMonth), icon: DollarSign, color: 'text-purple-400' },
            { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-green-400' },
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
            <h2 className="text-white font-semibold">Booking History</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No bookings yet. Make sure your services are approved.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800">
                  <tr className="text-zinc-500 text-xs uppercase">
                    <th className="text-left p-4">Service</th>
                    <th className="text-left p-4 hidden md:table-cell">Organizer</th>
                    <th className="text-right p-4">Gross</th>
                    <th className="text-right p-4 hidden md:table-cell">HERU Fee (15%)</th>
                    <th className="text-right p-4">Net (85%)</th>
                    <th className="text-center p-4 hidden lg:table-cell">Escrow</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-right p-4 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => {
                    const gross = Number(b.total_price || b.amount || 0)
                    const fee = Number(b.platform_fee || gross * 0.15)
                    const net = Number(b.net_to_provider || gross * 0.85)
                    return (
                      <tr key={b.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-white font-medium">{b.service_name || '—'}</td>
                        <td className="p-4 text-zinc-400 hidden md:table-cell">{b.organizer_name || '—'}</td>
                        <td className="p-4 text-white text-right">{fmtEGP(gross)}</td>
                        <td className="p-4 text-orange-400 text-right hidden md:table-cell">{fmtEGP(fee)}</td>
                        <td className="p-4 text-cyan-400 font-semibold text-right">{fmtEGP(net)}</td>
                        <td className="p-4 text-center hidden lg:table-cell">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${escrowStyle[b.escrow_status] || escrowStyle.held}`}>
                            {b.escrow_status || 'held'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[b.status] || statusStyle.pending}`}>
                            {b.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500 text-right hidden md:table-cell">{fmtDate(b.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  )
}
