import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { Bill } from '@/api/heruClient'
import {
  Receipt, Loader2, ChevronRight, Calendar,
  AlertCircle, CheckCircle2, Clock, DollarSign,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatEGP = (n) => 'EGP ' + (n || 0).toLocaleString()

const paymentStatusConfig = {
  unpaid:  { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30',    icon: AlertCircle,  label: 'Unpaid' },
  partial: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock,        label: 'Partial' },
  paid:    { bg: 'bg-green-500/20',  text: 'text-green-400',  border: 'border-green-500/30',  icon: CheckCircle2, label: 'Paid' },
  overdue: { bg: 'bg-red-600/20',    text: 'text-red-500',    border: 'border-red-600/30',    icon: AlertCircle,  label: 'Overdue' },
}

function PaymentBadge({ status }) {
  const c = paymentStatusConfig[status] || paymentStatusConfig.unpaid
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab filter
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'all',    label: 'All' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'paid',   label: 'Paid' },
]

// ---------------------------------------------------------------------------
// Bill Card
// ---------------------------------------------------------------------------

function BillCard({ bill, onClick }) {
  const dueDate = bill.due_date
    ? new Date(bill.due_date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : null

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border border-white/10 bg-[#1a1a2e] p-4 hover:border-violet-500/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Bill number */}
          <p className="text-xs font-mono text-gray-500">{bill.bill_number}</p>
          {/* Tournament name */}
          <h3 className="text-white font-semibold text-sm mt-1 truncate group-hover:text-violet-300 transition-colors">
            {bill.tournament_name || 'Marketplace Order'}
          </h3>
          {/* Meta */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {bill.bill_type && (
              <span className="capitalize px-2 py-0.5 rounded bg-white/5 text-gray-400">
                {bill.bill_type.replace('_', ' ')}
              </span>
            )}
            {dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due {dueDate}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <PaymentBadge status={bill.payment_status} />
          <span className="text-white font-bold text-sm">{formatEGP(bill.grand_total)}</span>
        </div>
      </div>

      {/* Paid amount progress (for partial) */}
      {bill.payment_status === 'partial' && bill.paid_amount > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Paid: {formatEGP(bill.paid_amount)}</span>
            <span>Remaining: {formatEGP(bill.grand_total - bill.paid_amount)}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
              style={{ width: `${Math.min((bill.paid_amount / bill.grand_total) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OrganizerBilling() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all')

  // Fetch bills for this organizer
  const {
    data: billsData,
    isLoading,
  } = useQuery({
    queryKey: ['organizer-bills', user?.id],
    queryFn: () => Bill.list({ payer_id: user?.id }),
    enabled: !!user?.id,
    staleTime: 30_000,
  })

  // Normalize
  const allBills = useMemo(() => {
    const raw = Array.isArray(billsData) ? billsData : billsData?.data || []
    // Sort: unpaid/overdue first, then partial, then paid; within group by date descending
    return [...raw].sort((a, b) => {
      const order = { overdue: 0, unpaid: 1, partial: 2, paid: 3 }
      const diff = (order[a.payment_status] ?? 9) - (order[b.payment_status] ?? 9)
      if (diff !== 0) return diff
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })
  }, [billsData])

  // Filtered bills
  const filteredBills = useMemo(() => {
    if (activeTab === 'all') return allBills
    if (activeTab === 'unpaid') return allBills.filter((b) => b.payment_status === 'unpaid' || b.payment_status === 'overdue' || b.payment_status === 'partial')
    if (activeTab === 'paid') return allBills.filter((b) => b.payment_status === 'paid')
    return allBills
  }, [allBills, activeTab])

  // Group into three sections
  const soloBills = filteredBills.filter(b => b.bill_type === 'organizer' && !b.shared_tournament)
  const sharedMainBills = filteredBills.filter(b => b.bill_type === 'organizer' && b.shared_tournament)
  const coOrgBills = filteredBills.filter(b => b.bill_type === 'co_organizer')

  // Summary stats
  const totalOwed = allBills
    .filter((b) => b.payment_status !== 'paid')
    .reduce((sum, b) => sum + (b.grand_total || 0) - (b.paid_amount || 0), 0)
  const totalPaid = allBills
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.grand_total || 0), 0)

  return (
    <div className="min-h-screen bg-[#0f0f1a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ----------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ----------------------------------------------------------------- */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Receipt className="w-7 h-7 text-violet-400" />
            Billing
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage your tournament invoices and payments.
          </p>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Summary Cards                                                     */}
        {/* ----------------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-[#1a1a2e] p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Bills</p>
            <p className="text-xl font-bold text-white mt-1">{allBills.length}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs text-red-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Outstanding
            </p>
            <p className="text-xl font-bold text-red-400 mt-1">{formatEGP(totalOwed)}</p>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs text-green-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Total Paid
            </p>
            <p className="text-xl font-bold text-green-400 mt-1">{formatEGP(totalPaid)}</p>
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Tabs                                                              */}
        {/* ----------------------------------------------------------------- */}
        <div className="flex gap-1 border-b border-white/10 pb-px">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count = tab.id === 'all'
              ? allBills.length
              : tab.id === 'unpaid'
                ? allBills.filter((b) => b.payment_status !== 'paid').length
                : allBills.filter((b) => b.payment_status === 'paid').length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? 'border-violet-500 text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${isActive ? 'text-violet-400' : 'text-gray-600'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Unpaid Bills Banner                                               */}
        {/* ----------------------------------------------------------------- */}
        {totalOwed > 0 && activeTab === 'all' && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-bold text-sm">You have unpaid bills</p>
                <p className="text-red-300/70 text-xs">Total outstanding: {formatEGP(totalOwed)}</p>
              </div>
            </div>
            <button onClick={() => setActiveTab('unpaid')} className="text-xs text-red-400 hover:text-red-300 font-medium">
              View Unpaid →
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Bills List — Three Sections                                       */}
        {/* ----------------------------------------------------------------- */}
        {isLoading ? (
          <SectionLoader />
        ) : filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Receipt className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">
              {activeTab === 'all' ? 'No bills yet' : `No ${activeTab} bills`}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Bills are generated when you create or join a tournament.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Solo Bills */}
            {soloBills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-violet-400" />
                  Solo Tournaments
                  <span className="text-xs text-gray-600 font-normal">({soloBills.length})</span>
                </h2>
                <div className="space-y-3">
                  {soloBills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} onClick={() => navigate(`/organizer/billing/${bill.bill_number}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Shared Bills — Main Organizer */}
            {sharedMainBills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-red-400" />
                  Shared Tournaments (My Share)
                  <span className="text-xs text-gray-600 font-normal">({sharedMainBills.length})</span>
                </h2>
                <div className="space-y-3">
                  {sharedMainBills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} onClick={() => navigate(`/organizer/billing/${bill.bill_number}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Co-Organized Bills */}
            {coOrgBills.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-red-400" />
                  Co-Organized (Partner Share)
                  <span className="text-xs text-gray-600 font-normal">({coOrgBills.length})</span>
                </h2>
                <div className="space-y-3">
                  {coOrgBills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} onClick={() => navigate(`/organizer/billing/${bill.bill_number}`)} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
