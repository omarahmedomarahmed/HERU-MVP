import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Staff, Tournament, Bill, ApprovalRequest, SponsorshipRadar } from '@/api/heruClient'
import {
  Trophy, Users, CreditCard, TrendingUp, AlertCircle, CheckCircle,
  Clock, Zap, Shield, Building2, Gamepad2, UsersRound, ShoppingBag,
  Radar, Receipt, Hammer, ArrowRight,
} from 'lucide-react'

const fmt    = (n) => n?.toLocaleString() ?? '0'
const fmtEGP = (n) => `EGP ${(n || 0).toLocaleString()}`
const STATUS_COLORS = {
  live:'bg-emerald-500/15 text-emerald-400', published:'bg-blue-500/15 text-blue-400',
  completed:'bg-zinc-500/15 text-zinc-400',  draft:'bg-amber-500/15 text-amber-400',
}

function StatCard({ icon: Icon, label, value, sub, color='red', link }) {
  const c = { red:'border-red-500/20 text-red-400', amber:'border-amber-500/20 text-amber-400',
    emerald:'border-emerald-500/20 text-emerald-400', blue:'border-blue-500/20 text-blue-400',
    violet:'border-violet-500/20 text-violet-400' }[color] || 'border-red-500/20 text-red-400'
  const inner = (
    <div className={`bg-[#111] border ${c} rounded-xl p-4 h-full hover:bg-[#161616] transition-colors`}>
      <Icon size={18} className={c.split(' ')[1]+' mb-3'} />
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-zinc-700 mt-1">{sub}</div>}
    </div>
  )
  return link ? <Link to={link}>{inner}</Link> : <div>{inner}</div>
}

function QLink({ icon: Icon, label, desc, to }) {
  return (
    <Link to={to} className="flex items-center gap-3 p-3 rounded-lg bg-[#111] border border-white/[0.05] hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-red-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-zinc-300 group-hover:text-white truncate">{label}</div>
        <div className="text-[11px] text-zinc-600 truncate">{desc}</div>
      </div>
      <ArrowRight size={13} className="text-zinc-700 group-hover:text-red-500 shrink-0" />
    </Link>
  )
}

export default function StaffDashboard() {
  const { data: stats }            = useQuery({ queryKey:['staff-dashboard'],   queryFn: Staff.dashboard, staleTime:30000 })
  const { data: tournaments = [] } = useQuery({ queryKey:['staff-tournaments'], queryFn: () => Tournament.list({}), staleTime:30000 })
  const { data: bills = [] }       = useQuery({ queryKey:['staff-bills'],       queryFn: () => Bill.list({}), staleTime:30000 })
  const { data: approvals = [] }   = useQuery({ queryKey:['staff-approvals'],   queryFn: () => ApprovalRequest.list({ status:'pending' }), staleTime:30000 })
  const { data: radar = [] }       = useQuery({ queryKey:['staff-radar'],       queryFn: () => SponsorshipRadar.list({ status:'open' }), staleTime:30000 })

  const pending = approvals.filter(a => a.status === 'pending')
  const unpaid  = bills.filter(b => ['unpaid','overdue'].includes(b.payment_status))
  const live    = tournaments.filter(t => t.status === 'live')
  const drafts  = tournaments.filter(t => t.status === 'draft')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Admin <span className="text-red-500">Control Panel</span></h1>
          <p className="text-zinc-600 text-sm mt-0.5">Full platform visibility · God mode active</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-bold">
          <Shield size={12} /> STAFF
        </span>
      </div>

      {(pending.length > 0 || unpaid.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {pending.length > 0 && (
            <Link to="/staff/approvals" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium hover:bg-amber-500/15">
              <AlertCircle size={13} /> {pending.length} pending approval{pending.length !== 1 && 's'}
            </Link>
          )}
          {unpaid.length > 0 && (
            <Link to="/staff/billing" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-medium hover:bg-red-500/15">
              <CreditCard size={13} /> {unpaid.length} unpaid bill{unpaid.length !== 1 && 's'}
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={TrendingUp} label="Platform Revenue"  value={fmtEGP(stats?.total_platform_revenue)} sub="from paid bills" color="emerald" link="/staff/revenue" />
        <StatCard icon={Trophy}     label="Tournaments"       value={fmt(stats?.total_tournaments)} sub={`${stats?.active_tournaments||0} active`} color="red" link="/staff/tournaments" />
        <StatCard icon={Users}      label="Total Users"       value={fmt(stats?.total_users)} sub="all roles" color="blue" link="/staff/users" />
        <StatCard icon={CreditCard} label="Paid Bills"        value={fmt(stats?.paid_bills)} sub="collected" color="violet" link="/staff/billing" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Zap}         label="Live Now"          value={live.length}    color="amber"  link="/staff/tournaments" />
        <StatCard icon={Clock}       label="Drafts"            value={drafts.length}  color="blue"   link="/staff/tournaments" />
        <StatCard icon={CheckCircle} label="Pending Approvals" value={pending.length} color="amber"  link="/staff/approvals" />
        <StatCard icon={Radar}       label="Open Radar"        value={radar.length}   color="violet" link="/staff/radar" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/50 mb-2">Platform</p>
          <QLink icon={Hammer}     to="/staff/tournament-builder" label="Build Tournament"   desc="Create on behalf of any organizer" />
          <QLink icon={Trophy}     to="/staff/tournaments"        label="All Tournaments"    desc="Edit, change status, brackets" />
          <QLink icon={Users}      to="/staff/users"              label="User Management"    desc="Roles, disable, delete" />
          <QLink icon={Gamepad2}   to="/staff/gamers"             label="Gamer Profiles"     desc="Edit gamer data, talent toggle" />
          <QLink icon={UsersRound} to="/staff/teams"              label="Teams"              desc="Edit or delete any team" />
          <QLink icon={Building2}  to="/staff/organizers"         label="Organizers"         desc="Verify, edit brand profiles" />
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/50 mb-2">Finance & System</p>
          <QLink icon={CreditCard}  to="/staff/billing"     label="Billing Master"    desc="All bills, mark paid, create" />
          <QLink icon={Receipt}     to="/staff/orders"      label="Orders"            desc="Marketplace & tournament orders" />
          <QLink icon={ShoppingBag} to="/staff/marketplace" label="Marketplace"       desc="Add, edit, delete items" />
          <QLink icon={Radar}       to="/staff/radar"       label="Sponsorship Radar" desc="Monitor funding, co-org status" />
          <QLink icon={CheckCircle} to="/staff/approvals"   label="Approvals"         desc="Approve / reject requests" />
          <QLink icon={ShoppingBag} to="/staff/settings"    label="Keys & Settings"   desc="Access keys, platform config" />
        </div>
      </div>

      {tournaments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/50">Recent Tournaments</p>
            <Link to="/staff/tournaments" className="text-xs text-red-400 hover:text-red-300">View all →</Link>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {['Tournament','Game','Status','Type','Cost'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tournaments.slice(0,7).map(t => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5"><Link to={`/staff/tournaments/${t.id}`} className="text-zinc-200 hover:text-red-400 font-medium">{t.name}</Link></td>
                    <td className="px-4 py-2.5 text-zinc-500">{t.game || '—'}</td>
                    <td className="px-4 py-2.5"><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_COLORS[t.status]||STATUS_COLORS.draft}`}>{t.status}</span></td>
                    <td className="px-4 py-2.5"><span className={`text-[10px] font-bold uppercase ${t.tournament_type==='shared'?'text-violet-400':'text-zinc-500'}`}>{t.tournament_type||'solo'}</span></td>
                    <td className="px-4 py-2.5 text-zinc-400 font-mono text-xs">{fmtEGP(t.total_cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
