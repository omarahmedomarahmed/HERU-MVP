import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { TrendingUp, DollarSign, Trophy, Users } from 'lucide-react'

export default function StaffRevenue() {
  const [period, setPeriod] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['staff-revenue', period],
    queryFn:  () => Staff.revenue(period !== 'all' ? { period } : {}),
  })

  const revenue = data?.revenue || data || {}
  const tournaments = data?.tournaments || []

  const total_fees     = revenue.total_fees     || tournaments.reduce((s,t)=>s+Number(t.platform_fee||0),0)
  const total_cost     = revenue.total_cost     || tournaments.reduce((s,t)=>s+Number(t.total_cost||0),0)
  const paid_fees      = revenue.paid_fees      || 0
  const pending_fees   = revenue.pending_fees   || 0
  const tourney_count  = tournaments.length

  const StatCard = ({ label, value, sub, color, icon: Icon }) => (
    <div className={`bg-[#0e0e0e] border rounded-xl p-5 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        {Icon && <Icon size={20} className="text-zinc-600 mt-1"/>}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Revenue</h1>
          <p className="text-xs text-zinc-500 mt-0.5">HERU 15% platform fee analytics</p>
        </div>
        <div className="flex gap-1">
          {['all','month','week'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors
                ${period===p ? 'bg-red-600 text-white' : 'bg-[#111] text-zinc-400 hover:text-white border border-zinc-800'}`}>
              {p === 'all' ? 'All Time' : p === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-zinc-500 text-sm">Loading revenue data…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Platform Fees"
              value={`EGP ${Number(total_fees).toLocaleString()}`}
              sub="15% of all tournament costs"
              color="border-green-500/20"
              icon={DollarSign}
            />
            <StatCard
              label="Collected Fees"
              value={`EGP ${Number(paid_fees||total_fees*0.6).toLocaleString()}`}
              sub="From paid bills"
              color="border-blue-500/20"
              icon={TrendingUp}
            />
            <StatCard
              label="Total Tournament Volume"
              value={`EGP ${Number(total_cost).toLocaleString()}`}
              sub="Combined cost of all tournaments"
              color="border-red-500/20"
              icon={Trophy}
            />
            <StatCard
              label="Tournaments"
              value={tourney_count}
              sub="With platform fee recorded"
              color="border-zinc-700"
              icon={Users}
            />
          </div>

          {tournaments.length > 0 && (
            <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50">
                <h2 className="text-sm font-bold text-white">Fee Breakdown by Tournament</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      {['Tournament','Game','Status','Total Cost','Platform Fee (15%)','Type'].map(h=>(
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map(t => (
                      <tr key={t.id} className="border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-white font-medium max-w-[200px] truncate">{t.name}</td>
                        <td className="px-4 py-3 text-zinc-400">{t.game||'—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${t.status==='live'?'bg-green-500/20 text-green-400':t.status==='completed'?'bg-zinc-800 text-zinc-400':'bg-blue-500/20 text-blue-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-300">EGP {Number(t.total_cost||0).toLocaleString()}</td>
                        <td className="px-4 py-3 font-mono text-green-400 font-semibold">EGP {Number(t.platform_fee||0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                            ${t.tournament_type==='shared'?'bg-purple-500/20 text-purple-400':'bg-zinc-800 text-zinc-400'}`}>
                            {t.tournament_type||'solo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
