import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import {
  TrendingUp, DollarSign, Package, CheckCircle2,
  Clock, AlertCircle, Loader2, BarChart3, ArrowRight, Trophy,
} from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()
const PLATFORM_FEE = 0.15

export default function OrganizerIncome() {
  const { user } = useAuth()

  const { data: sponsorships = [], isLoading: loadingS } = useQuery({
    queryKey: ['organizer-sponsorships', user?.id],
    queryFn: () => apiCall('/sponsorships?organizer=true'),
    enabled: !!user?.id,
  })

  const { data: bookings = [], isLoading: loadingB } = useQuery({
    queryKey: ['organizer-service-bookings', user?.id],
    queryFn: () => apiCall('/service-bookings?as_organizer=true'),
    enabled: !!user?.id,
  })

  const { data: tournaments = [] } = useQuery({
    queryKey: ['organizer-tournaments-income', user?.id],
    queryFn: () => apiCall('/tournaments?organizer=me'),
    enabled: !!user?.id,
  })

  const income = useMemo(() => {
    const grossSponsor = sponsorships.reduce((a, s) => a + (s.amount || 0), 0)
    const netSponsor = grossSponsor * (1 - PLATFORM_FEE)
    const feesSponsor = grossSponsor * PLATFORM_FEE
    const totalBookingCosts = bookings.reduce((a, b) => a + (b.total_amount || 0), 0)
    return { grossSponsor, netSponsor, feesSponsor, totalBookingCosts, net: netSponsor - totalBookingCosts }
  }, [sponsorships, bookings])

  const isLoading = loadingS || loadingB

  const sponsorsByStatus = useMemo(() => ({
    confirmed: sponsorships.filter(s => s.status === 'confirmed' || s.status === 'delivered'),
    pending: sponsorships.filter(s => s.status === 'pending' || s.status === 'agreed'),
  }), [sponsorships])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Income Overview</h1>
        <p className="text-gray-400 mt-1 text-sm">Sponsorship revenue and service costs across all your tournaments</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Gross Sponsorship', value: fmtEGP(income.grossSponsor), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'HERU Fees (15%)', value: fmtEGP(income.feesSponsor), icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Net from Sponsors', value: fmtEGP(income.netSponsor), icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Service Costs', value: fmtEGP(income.totalBookingCosts), icon: Package, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
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
      <div className="bg-gradient-to-r from-purple-900/20 to-zinc-900 border border-purple-500/20 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Net Earnings After Costs</div>
          <div className="text-4xl font-black text-white">{fmtEGP(income.net)}</div>
          <div className="text-sm text-gray-400 mt-1">After HERU 15% fee and service bookings paid</div>
        </div>
        <BarChart3 className="w-12 h-12 text-purple-400/30" />
      </div>

      {/* Sponsorships breakdown */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Sponsorship Packages Sold</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
        ) : sponsorships.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No sponsorships yet. Build a tournament and add sponsorship packages to attract sponsors.</p>
            <Link to="/organizer/tournaments/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-bold text-white transition">
              Build Tournament <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsorships.map(s => {
              const gross = s.amount || 0
              const fee = gross * PLATFORM_FEE
              const net = gross - fee
              const isPaid = s.status === 'confirmed' || s.status === 'delivered'
              return (
                <div key={s.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{s.package_name || 'Sponsorship Package'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{s.sponsor_brand || s.sponsor_id} · {s.tournament_name || 'Tournament'}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-green-400">{fmtEGP(net)} net</div>
                    <div className="text-xs text-gray-500">{fmtEGP(gross)} gross − {fmtEGP(fee)} fee</div>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Service bookings costs */}
      {bookings.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Service Provider Costs</h2>
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{b.service_name || 'Service Booking'}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{b.provider_name || 'Provider'}</div>
                </div>
                <div className="text-sm font-bold text-red-400">{fmtEGP(b.total_amount)}</div>
                <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${b.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-gray-400'}`}>
                  {b.status || 'booked'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
