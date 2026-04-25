import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { apiCall } from '@/api/heruClient'
import {
  Receipt, Loader2, CheckCircle2, Clock, AlertCircle,
  Star, Users, FolderKanban, CreditCard, DollarSign,
} from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const typeConfig = {
  sponsorship: { label: 'Sponsorship Package', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  influencer:  { label: 'Influencer Booking',  icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  managed:     { label: 'Managed Project',      icon: FolderKanban, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  subscription:{ label: 'Subscription',         icon: CreditCard, color: 'text-green-400', bg: 'bg-green-500/10' },
}

const statusBadge = {
  paid:    'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  failed:  'bg-red-500/20 text-red-400',
}

export default function SponsorBilling() {
  const { user } = useAuth()

  const { data: sponsorships = [], isLoading: ls } = useQuery({
    queryKey: ['sponsor-sponsorships-billing', user?.id],
    queryFn: () => apiCall('/sponsorships').then(d => d?.sponsorships || d?.data || (Array.isArray(d) ? d : [])),
    enabled: !!user?.id,
  })

  const { data: subscription } = useQuery({
    queryKey: ['sponsor-subscription-billing', user?.id],
    queryFn: () => apiCall('/subscriptions/me').then(d => d?.subscription || d),
    enabled: !!user?.id,
  })

  const { data: managedProjects = [] } = useQuery({
    queryKey: ['sponsor-managed-billing', user?.id],
    queryFn: () => apiCall('/managed-services').then(d => d?.projects || d?.data || (Array.isArray(d) ? d : [])),
    enabled: !!user?.id,
  })

  const transactions = useMemo(() => {
    const items = []
    sponsorships.forEach(s => items.push({
      id: s.id, type: 'sponsorship', label: s.package_name || 'Sponsorship Package',
      sub: s.tournament_name || '', amount: s.amount || 0,
      date: s.created_at, status: s.payment_status || 'paid',
    }))
    if (subscription?.plan && subscription.plan !== 'free') items.push({
      id: 'sub', type: 'subscription', label: `${subscription.plan} Plan Subscription`,
      sub: subscription.billing_cycle || 'monthly', amount: subscription.amount || 0,
      date: subscription.current_period_start, status: subscription.status === 'active' ? 'paid' : 'pending',
    })
    managedProjects.forEach(m => items.push({
      id: m.id, type: 'managed', label: m.title || 'Managed Project',
      sub: m.status || '', amount: m.budget || 0,
      date: m.created_at, status: m.payment_status || 'pending',
    }))
    return items.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [sponsorships, subscription, managedProjects])

  const totalSpent = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0)
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white">Billing</h1>
        <p className="text-gray-400 mt-1 text-sm">All your sponsorship packages, subscriptions, and managed project payments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-xs text-gray-500">Total Paid</span></div>
          <div className="text-2xl font-black text-green-400">{fmtEGP(totalSpent)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-yellow-400" /><span className="text-xs text-gray-500">Pending</span></div>
          <div className="text-2xl font-black text-yellow-400">{fmtEGP(totalPending)}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-yellow-400" /><span className="text-xs text-gray-500">Total Committed</span></div>
          <div className="text-2xl font-black text-white">{fmtEGP(totalSpent + totalPending)}</div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Transaction History</h2>
        {ls ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>
        ) : transactions.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <Receipt className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No transactions yet. Purchase a sponsorship package to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => {
              const tc = typeConfig[tx.type] || typeConfig.sponsorship
              const Icon = tc.icon
              return (
                <div key={tx.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-lg ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${tc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{tx.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{tc.label} · {fmtDate(tx.date)}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-white text-sm">{fmtEGP(tx.amount)}</div>
                  </div>
                  <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[tx.status] || statusBadge.pending}`}>
                    {tx.status}
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
