import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import GamerLayout from '@/components/layouts/GamerLayout'
import { DollarSign, CheckCircle2, Clock, Info, Star, Loader2 } from 'lucide-react'

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString()
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const statusStyle = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-zinc-500/20 text-zinc-400',
}

function StarRating({ rating }) {
  if (!rating) return <span className="text-zinc-600 text-xs">Not rated</span>
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-700'}`}
        />
      ))}
    </span>
  )
}

export default function GamerBilling() {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['gamer-coaching-sessions'],
    queryFn: () => apiCall('/coaching/my-sessions').then(d => d?.sessions || d || []),
    staleTime: 60_000,
  })

  const totalSpent = sessions.reduce((s, sess) => s + Number(sess.price || 0), 0)
  const completed = sessions.filter(s => s.status === 'completed').length
  const upcoming = sessions.filter(s => s.status === 'confirmed' || s.status === 'pending').length

  return (
    <GamerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-zinc-400 mt-1 text-sm">Your coaching session history and payments</p>
        </div>

        {/* Info header */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">
            HERU ARENA is free. Coaching sessions are the only paid feature.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Spent', value: fmtEGP(totalSpent), icon: DollarSign, color: 'text-red-400' },
            { label: 'Sessions Completed', value: completed, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Upcoming', value: upcoming, icon: Clock, color: 'text-yellow-400' },
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

        {/* Sessions table */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-white font-semibold">Coaching Sessions</h2>
          </div>
          {isLoading ? (
            <div className="space-y-2 p-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />)}</div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center text-zinc-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No coaching sessions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-800">
                  <tr className="text-zinc-500 text-xs uppercase">
                    <th className="text-left p-4">Coach</th>
                    <th className="text-left p-4 hidden md:table-cell">Date</th>
                    <th className="text-left p-4 hidden lg:table-cell">Duration</th>
                    <th className="text-right p-4">Price</th>
                    <th className="text-center p-4">Status</th>
                    <th className="text-center p-4 hidden md:table-cell">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(s => {
                    const durationHrs = s.duration_minutes
                      ? `${(s.duration_minutes / 60).toFixed(1)}h`
                      : (s.duration_hours ? `${s.duration_hours}h` : '—')
                    return (
                      <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-white font-medium">{s.coach_name || s.provider_name || '—'}</td>
                        <td className="p-4 text-zinc-400 hidden md:table-cell">{fmtDate(s.scheduled_at || s.created_at)}</td>
                        <td className="p-4 text-zinc-400 hidden lg:table-cell">{durationHrs}</td>
                        <td className="p-4 text-white font-semibold text-right">{fmtEGP(s.price || s.amount)}</td>
                        <td className="p-4 text-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[s.status] || statusStyle.pending}`}>
                            {s.status || 'pending'}
                          </span>
                        </td>
                        <td className="p-4 text-center hidden md:table-cell">
                          <StarRating rating={s.gamer_rating || s.rating} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </GamerLayout>
  )
}
