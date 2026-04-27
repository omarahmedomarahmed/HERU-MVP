import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  DollarSign, TrendingUp, Briefcase, Star, CreditCard,
  Zap, Download, Calendar,
} from 'lucide-react'
import { Staff, apiCall } from '@/api/heruClient'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtEGP = (n) => `EGP ${(n || 0).toLocaleString('en-EG')}`
const timeAgo = (d) => {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  return m < 60 ? `${m}m` : m < 1440 ? `${Math.floor(m / 60)}h` : `${Math.floor(m / 1440)}d`
}

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

function getRangeDates(days) {
  const to = new Date()
  const from = new Date(Date.now() - days * 86400000)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

// Start of current month
function getMTDDates() {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const to = now.toISOString().slice(0, 10)
  return { from, to }
}

// ─── Stream badge ─────────────────────────────────────────────────────────────
const STREAM_COLORS = {
  service_booking: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  sponsorship:     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  subscription:    'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  coaching:        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
}

function StreamBadge({ stream }) {
  const label = (stream || 'other').replace('_', ' ')
  const cls = STREAM_COLORS[stream] || 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {label}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconCls = 'text-red-400 bg-red-500/20' }) {
  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-zinc-100">{value}</p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        <div className={`rounded-lg p-2.5 ${iconCls}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
function exportCSV(rows) {
  if (!rows || rows.length === 0) return
  const cols = ['id', 'created_at', 'stream', 'source_type', 'description', 'gross_amount', 'fee_amount', 'net_amount', 'currency']
  const header = cols.join(',')
  const body = rows.map(r =>
    cols.map(c => {
      const v = r[c] ?? ''
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    }).join(',')
  ).join('\n')
  const csv = `${header}\n${body}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `heru-revenue-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StaffRevenue() {
  const [rangeIdx, setRangeIdx] = useState(1) // default 30d
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  const { from, to } = getRangeDates(RANGES[rangeIdx].days)
  const { from: mtdFrom, to: mtdTo } = getMTDDates()

  // Revenue ledger from /revenue/ledger
  const { data: ledgerResp, isLoading } = useQuery({
    queryKey: ['staff-revenue-ledger', from, to],
    queryFn: () => apiCall(`/revenue/ledger`),
    staleTime: 60_000,
  })

  // Staff-level summary from /staff/revenue
  const { data: summary } = useQuery({
    queryKey: ['staff-revenue-summary'],
    queryFn: () => Staff.revenue(),
    staleTime: 60_000,
  })

  const allRows = useMemo(() => {
    const raw = ledgerResp?.entries || ledgerResp?.data || (Array.isArray(ledgerResp) ? ledgerResp : [])
    return raw.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [ledgerResp])

  // Filter by selected range
  const rangeRows = useMemo(() => {
    const fromTs = new Date(from).getTime()
    const toTs = new Date(to).getTime() + 86399999
    return allRows.filter(r => {
      const ts = new Date(r.created_at).getTime()
      return ts >= fromTs && ts <= toTs
    })
  }, [allRows, from, to])

  // MTD totals
  const mtdRows = useMemo(() => {
    const fromTs = new Date(mtdFrom).getTime()
    const toTs = new Date(mtdTo).getTime() + 86399999
    return allRows.filter(r => {
      const ts = new Date(r.created_at).getTime()
      return ts >= fromTs && ts <= toTs
    })
  }, [allRows, mtdFrom, mtdTo])

  const mtdTotal = mtdRows.reduce((s, r) => s + (r.fee_amount || r.gross_amount || 0), 0)

  const streamTotals = useMemo(() => {
    const t = { service_booking: 0, sponsorship: 0, subscription: 0 }
    allRows.forEach(r => {
      const key = r.stream || r.source_type || ''
      if (key in t) t[key] += r.fee_amount || r.gross_amount || 0
    })
    return t
  }, [allRows])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(rangeRows.length / PAGE_SIZE))
  const pageRows = rangeRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-6 bg-[#080808] min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">
            Platform <span className="text-red-500">Revenue</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">HERU 15% fee ledger — all streams</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range buttons */}
          <div className="flex items-center gap-1 bg-[#111111] border border-[#1e1e1e] rounded-lg p-1">
            {RANGES.map((r, i) => (
              <button
                key={r.label}
                onClick={() => { setRangeIdx(i); setPage(1) }}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  rangeIdx === i
                    ? 'bg-red-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1a1a]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* Export */}
          <button
            onClick={() => exportCSV(rangeRows)}
            className="flex items-center gap-2 px-3 py-2 border border-[#2a2a2a] hover:bg-[#1a1a1a] text-zinc-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue MTD"
          value={fmtEGP(mtdTotal)}
          sub="Month to date"
          iconCls="text-red-400 bg-red-500/20"
        />
        <StatCard
          icon={Briefcase}
          label="Service Booking Fees"
          value={fmtEGP(streamTotals.service_booking)}
          sub="15% of booking value"
          iconCls="text-cyan-400 bg-cyan-500/20"
        />
        <StatCard
          icon={Star}
          label="Sponsorship Fees"
          value={fmtEGP(streamTotals.sponsorship)}
          sub="15% of package value"
          iconCls="text-amber-400 bg-amber-500/20"
        />
        <StatCard
          icon={CreditCard}
          label="Subscription MRR"
          value={fmtEGP(streamTotals.subscription)}
          sub="Free / Community / Premium"
          iconCls="text-purple-400 bg-purple-500/20"
        />
      </div>

      {/* Revenue ledger table */}
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Revenue Ledger</h2>
            <span className="text-xs text-zinc-500">({rangeRows.length} entries in {RANGES[rangeIdx].label})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Calendar className="w-3.5 h-3.5" />
            {from} → {to}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-zinc-500 animate-pulse">Loading ledger...</div>
        ) : rangeRows.length === 0 ? (
          <div className="py-16 text-center text-sm text-zinc-500">No revenue entries in this period.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#111111] border-b border-[#1e1e1e]">
                  {['Date', 'Stream', 'Description', 'Gross', 'HERU Fee', 'Net to Party', 'Currency'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, i) => (
                  <tr
                    key={row.id || i}
                    className="border-b border-[#1e1e1e] hover:bg-[#161616] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString('en-GB')
                        : '-'}
                      <span className="ml-1.5 text-zinc-600">
                        {row.created_at ? timeAgo(row.created_at) : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StreamBadge stream={row.stream || row.source_type} />
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300 max-w-[260px] truncate">
                      {row.description || row.entity_name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-zinc-200">
                      {fmtEGP(row.gross_amount || row.amount || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-red-400">
                      {fmtEGP(row.fee_amount || row.platform_fee || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-emerald-400">
                      {fmtEGP(row.net_amount || (row.gross_amount - (row.fee_amount || 0)) || 0)}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {row.currency || 'EGP'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#1e1e1e]">
            <p className="text-xs text-zinc-500">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rangeRows.length)} of {rangeRows.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded border border-[#2a2a2a] text-xs text-zinc-400 hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors"
              >
                Prev
              </button>
              <span className="px-3 text-xs text-zinc-400">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded border border-[#2a2a2a] text-xs text-zinc-400 hover:bg-[#1a1a1a] disabled:opacity-30 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
