import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Staff } from '@/api/heruClient'
import { Search, ScrollText } from 'lucide-react'

const METHOD_COLORS = {
  GET:    'bg-zinc-800 text-zinc-400',
  POST:   'bg-green-500/20 text-green-400',
  PUT:    'bg-blue-500/20 text-blue-400',
  PATCH:  'bg-yellow-500/20 text-yellow-400',
  DELETE: 'bg-red-500/20 text-red-400',
}

export default function StaffAuditTrail() {
  const [search, setSearch] = useState('')
  const [method, setMethod] = useState('all')
  const [page, setPage]     = useState(1)
  const PAGE_SIZE = 50

  const { data, isLoading } = useQuery({
    queryKey: ['staff-audit', method, page],
    queryFn: () => Staff.audit({
      ...(method !== 'all' ? { method } : {}),
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
  })
  const logs   = data?.logs || data || []
  const total  = data?.total || logs.length

  const filtered = logs.filter(l => {
    const q = search.toLowerCase()
    return !q || (l.endpoint||l.path||'').toLowerCase().includes(q) ||
      (l.user_email||'').toLowerCase().includes(q) ||
      (l.action||'').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Audit Trail</h1>
          <p className="text-xs text-zinc-500 mt-0.5">All platform actions &bull; {total.toLocaleString()} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['all','POST','PUT','DELETE'].map(m => (
              <button key={m} onClick={() => { setMethod(m); setPage(1) }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors
                  ${method===m ? 'bg-red-600 text-white' : 'bg-[#111] text-zinc-400 hover:text-white border border-zinc-800'}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-[#111] border border-zinc-800 rounded-lg px-3 py-1.5">
            <Search size={13} className="text-zinc-500"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Filter logs…" className="bg-transparent text-sm text-white placeholder-zinc-600 outline-none w-40"/>
          </div>
        </div>
      </div>

      <div className="bg-[#0e0e0e] border border-zinc-800/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 text-sm">Loading audit logs…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <ScrollText size={32} className="text-zinc-700 mx-auto mb-2"/>
            <p className="text-zinc-600 text-sm">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Time','Method','Endpoint','User','Status','Request ID'].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-zinc-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.id||i} className="border-b border-zinc-800/20 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-2.5 text-xs text-zinc-500 font-mono whitespace-nowrap">
                      {l.created_at ? new Date(l.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${METHOD_COLORS[l.method||l.http_method]||METHOD_COLORS.GET}`}>
                        {l.method||l.http_method||'—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-zinc-400 max-w-[220px] truncate">
                      {l.endpoint||l.path||l.action||'—'}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400">{l.user_email||l.staff_email||'—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono
                        ${l.status_code>=400?'text-red-400':l.status_code>=200?'text-green-400':'text-zinc-400'}`}>
                        {l.status_code||'—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-zinc-600">{l.request_id||l.id?.slice(0,8)||'—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-[#111] border border-zinc-800 rounded-lg disabled:opacity-40">
            Prev
          </button>
          <span className="text-xs text-zinc-500">Page {page} of {Math.ceil(total/PAGE_SIZE)}</span>
          <button onClick={() => setPage(p=>p+1)} disabled={page >= Math.ceil(total/PAGE_SIZE)}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-[#111] border border-zinc-800 rounded-lg disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  )
}
