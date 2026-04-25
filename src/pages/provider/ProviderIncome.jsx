import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import { TrendingUp, DollarSign, CheckCircle2, Clock, Loader2, BarChart3, Package } from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const PLATFORM_FEE = 0.15

export default function ProviderIncome() {
  const { user } = useAuth()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['provider-bookings-income', user?.id],
    queryFn: () => apiCall('/service-bookings'),
    enabled: !!user?.id,
  })

  const income = useMemo(() => {
    const completed = bookings.filter(b => b.status === 'completed' || b.status === 'delivered')
    const pending   = bookings.filter(b => b.status !== 'completed' && b.status !== 'delivered' && b.status !== 'cancelled')
    const gross = completed.reduce((s, b) => s + (b.total_amount || 0), 0)
    const fee   = gross * PLATFORM_FEE
    const net   = gross - fee
    const pendingAmt = pending.reduce((s, b) => s + (b.total_amount || 0), 0)
    return { gross, fee, net, pendingAmt, completed, pending }
  }, [bookings])

  // Group by service category
  const byCategory = useMemo(() => {
    const map = {}
    bookings.forEach(b => {
      const cat = b.service_category || 'Uncategorized'
      if (!map[cat]) map[cat] = { count: 0, gross: 0, net: 0 }
      map[cat].count++
      map[cat].gross += b.total_amount || 0
      map[cat].net   += (b.total_amount || 0) * (1 - PLATFORM_FEE)
    })
    return Object.entries(map).sort((a, b) => b[1].gross - a[1].gross)
  }, [bookings])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Income Breakdown</h1>
        <p className="text-gray-400 mt-1 text-sm">Your earnings from service bookings after HERU's 15% platform fee</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Earnings', value: fmtEGP(income.gross), icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'HERU Fee (15%)',  value: fmtEGP(income.fee),   icon: DollarSign, color: 'text-red-400',  bg: 'bg-red-500/10' },
          { label: 'Net Received',    value: fmtEGP(income.net),   icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Pending Payout',  value: fmtEGP(income.pendingAmt), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4.5 h-4.5 ${kpi.color}`} />
            </div>
            <div className={`text-xl font-black ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Net earnings banner */}
      <div className="bg-gradient-to-r from-cyan-900/20 to-zinc-900 border border-cyan-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Total Net Income</div>
          <div className="text-4xl font-black text-white">{fmtEGP(income.net)}</div>
          <div className="text-sm text-gray-400 mt-1">After HERU's 15% platform fee on completed bookings</div>
        </div>
        <BarChart3 className="w-12 h-12 text-cyan-400/30" />
      </div>

      {/* By category */}
      {byCategory.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Income by Service Category</h2>
          <div className="space-y-3">
            {byCategory.map(([cat, data]) => (
              <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white text-sm">{cat}</div>
                  <div className="text-xs text-gray-500">{data.count} booking{data.count !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-400 text-sm">{fmtEGP(data.net)} net</div>
                  <div className="text-xs text-gray-500">{fmtEGP(data.gross)} gross</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking history */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Booking History</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
        ) : bookings.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <Package className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No bookings yet. Make sure your services are approved and visible to organizers.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const gross = b.total_amount || 0
              const net = gross * (1 - PLATFORM_FEE)
              const isDone = b.status === 'completed' || b.status === 'delivered'
              return (
                <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{b.service_name || 'Service Booking'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{b.organizer_name || 'Organizer'} · {fmtDate(b.created_at)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-cyan-400">{fmtEGP(net)} net</div>
                    <div className="text-xs text-gray-500">{fmtEGP(gross)} gross</div>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${isDone ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {b.status || 'booked'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
