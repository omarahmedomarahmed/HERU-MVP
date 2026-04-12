import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Tournament, Staff } from '@/api/heruClient'
import { Search, Plus, Edit2, Trash2, Eye, ChevronDown, Trophy } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

const STATUS = ['all','draft','published','live','completed']
const STATUS_COLORS = {
  live:'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  published:'bg-blue-500/15 text-blue-400 border-blue-500/20',
  completed:'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  draft:'bg-amber-500/15 text-amber-400 border-amber-500/20',
}
const fmtEGP = (n) => `EGP ${(n||0).toLocaleString()}`

export default function StaffTournaments() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [delId, setDelId]   = useState(null)

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['staff-tournaments-full'],
    queryFn: () => Tournament.list({}),
    staleTime: 15000,
  })

  const deleteMut = useMutation({
    mutationFn: (id) => Staff.deleteTournament(id),
    onSuccess: () => { qc.invalidateQueries(['staff-tournaments-full']); setDelId(null); toast({ title: 'Tournament deleted', duration: 4000 }) },
    onError: (e) => toast({ title: 'Delete failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => Staff.updateTournamentStatus(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['staff-tournaments-full']); toast({ title: 'Status updated', duration: 3000 }) },
    onError: (e) => toast({ title: 'Update failed', description: e.message, variant: 'destructive', duration: 5000 }),
  })

  const filtered = tournaments.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.game?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Tournaments <span className="text-red-500">({tournaments.length})</span></h1>
          <p className="text-zinc-600 text-xs mt-0.5">Full edit & delete access to every tournament</p>
        </div>
        <Link to="/staff/tournament-builder" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors">
          <Plus size={14} /> Build Tournament
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tournaments..."
            className="w-full pl-8 pr-3 py-2 bg-[#111] border border-white/[0.08] rounded-lg text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-red-500/50" />
        </div>
        <div className="flex gap-1">
          {STATUS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${filter===s ? 'bg-red-500 text-white' : 'bg-[#111] text-zinc-500 hover:text-zinc-300 border border-white/[0.06]'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0e0e0e] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-600">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-600">No tournaments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  {['Tournament','Game','Status','Type','Teams','Cost','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {t.tournament_image
                          ? <img src={t.tournament_image} className="w-7 h-7 rounded object-cover shrink-0" />
                          : <div className="w-7 h-7 rounded bg-red-500/10 flex items-center justify-center shrink-0"><Trophy size={12} className="text-red-400" /></div>
                        }
                        <Link to={`/staff/tournaments/${t.id}`} className="text-zinc-200 hover:text-red-400 font-medium truncate max-w-[180px]">{t.name}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{t.game || '—'}</td>
                    <td className="px-4 py-3">
                      <select value={t.status}
                        onChange={e => statusMut.mutate({ id: t.id, status: e.target.value })}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border cursor-pointer bg-transparent ${STATUS_COLORS[t.status]||STATUS_COLORS.draft}`}>
                        {['draft','published','live','completed'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase ${t.tournament_type==='shared'?'text-violet-400':'text-zinc-600'}`}>{t.tournament_type||'solo'}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{(t.teams||[]).length}/{t.max_teams||'?'}</td>
                    <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{fmtEGP(t.total_cost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/staff/tournaments/${t.id}`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors" title="Edit">
                          <Edit2 size={13} />
                        </Link>
                        <Link to={`/organizer/tournaments/${t.id}/manage`} target="_blank"
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors" title="View Manage">
                          <Eye size={13} />
                        </Link>
                        <button onClick={() => setDelId(t.id)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {delId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-black text-lg mb-2">Delete Tournament?</h3>
            <p className="text-zinc-400 text-sm mb-5">This action cannot be undone. All associated data will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 text-zinc-300 hover:bg-white/10 text-sm font-medium">Cancel</button>
              <button onClick={() => deleteMut.mutate(delId)} disabled={deleteMut.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-50">
                {deleteMut.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
