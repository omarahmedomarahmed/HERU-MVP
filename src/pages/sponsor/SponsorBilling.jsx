import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { apiCall } from '@/api/heruClient'
import { DollarSign, Star, Clock, CreditCard, CheckCircle2, Receipt } from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const statusStyle = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  paid:      'bg-green-500/20 text-green-400',
  active:    'bg-blue-500/20 text-blue-400',
  completed: 'bg-purple-500/20 text-purple-400',
  refunded:  'bg-zinc-500/20 text-zinc-400',
  cancelled: 'bg-zinc-500/20 text-zinc-400',
}

const planBadge = {
  free:      'bg-zinc-500/20 text-zinc-400',
  community: 'bg-blue-500/20 text-blue-400',
  premium:   'bg-yellow-500/20 text-yellow-400',
  starter:   'bg-zinc-500/20 text-zinc-400',
  growth:    'bg-green-500/20 text-green-400',
}

export default function SponsorBilling() {
  const { data: subscription } = useQuery({
    queryKey: ['sponsor-subscription-me'],
    queryFn: () => apiCall('/subscriptions/me').then(d => d?.subscription || d),
    staleTime: 60_000,
  })

  const { data: sponsorships = [], isLoading } = useQuery({
    queryKey: ['sponsor-sponsorships-mine'],
    queryFn: () => apiCall('/sponsorships/mine').then(d => d?.sponsorships || d || []),
    staleTime: 60_000,
  })

  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalSpent = sponsorships.reduce((s, sp) => s + Number(sp.amount || 0), 0)
  const thisMonth = sponsorships
    .filter(sp => sp.created_at && new Date(sp.created_at) >= thisMonthStart)
    .reduce((s, sp) => s + Number(sp.amount || 0), 0)
  const activeSponsorships = sponsorships.filter(sp => sp.status === 'active' || sp.status === 'paid').length
  const subCost = subscription?.amount || 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-zinc-400 mt-1 text-sm">Your sponsorship purchases and subscription</p>
        </div>

        {/* Subscription card */}
        {subscription && (
          <div className="p-5 rounded-xl bg-zinc-900 border border-yellow-500/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-yellow-400" />
                  <h2 className="text-white font-semibold">HERU RADAR Subscription</h2>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${planBadge[subscription.plan] || planBadge.free}`}>
                    {subscription.plan} Plan
                  </span>
                  {subscription.status && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${subscription.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
                      {subscription.status}
                    </span>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  {subCost > 0 && (
                    <p className="text-zinc-300 text-sm">
                      <span className="text-yellow-400 font-bold">{fmtEGP(subCost)}</span>
                      <span className="text-zinc-500"> / month</span>
                    </p>
                  )}
                  {subscription.renewal_date && (
                    <p className="text-zinc-500 text-xs">Renews {fmtDate(subscription.renewal_date)}</p>
                  )}
                </div>
              </div>
              <Link
                to="/sponsor/subscription"
                className="flex-shrink-0 px-4 py-2 rounded-lg border border-yellow-500/30 text-yellow-400 text-sm font-medium hover:bg-yellow-500/10 transition-colors"
              >
                Manage Plan
              </Link>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Spent', value: fmtEGP(totalSpent), icon: DollarSign, color: 'text-yellow-400' },
            { label: 'This Month', value: fmtEGP(thisMonth), icon: Clock, color: 'text-blue-400' },
            { label: 'Active Sponsorships', value: activeSponsorships, icon: Star, color: 'text-purple-400' },
            { label: 'Subscription Cost', value: subCost > 0 ? fmtEGP(subCost) + '/mo' : 'Free', icon: CreditCard, color: 'text-cyan-400' },
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

        {/* Sponsorships table */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Sponsorship Purchases</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
          ) : sponsorships.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No sponsorship purchases yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800">
                  <tr className="text-zinc-500 text-xs uppercase">
                    <th className="text-left p-4">Package</th>
                    <th className="text-left p-4 hidden md:table-cell">Tournament</th>
                    <th className="text-right p-4">Amount</th>
                    <th className="text-right p-4 hidden md:table-cell">HERU Fee</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-right p-4 hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsorships.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 text-white font-medium">{s.package_name || '—'}</td>
                      <td className="p-4 text-zinc-400 hidden md:table-cell">{s.tournament_name || '—'}</td>
                      <td className="p-4 text-yellow-400 font-semibold text-right">{fmtEGP(s.amount)}</td>
                      <td className="p-4 text-orange-400 text-right hidden md:table-cell">{fmtEGP(s.platform_fee || Number(s.amount || 0) * 0.15)}</td>
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[s.status] || statusStyle.pending}`}>
                          {s.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-500 text-right hidden md:table-cell">{fmtDate(s.created_at)}</td>
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
