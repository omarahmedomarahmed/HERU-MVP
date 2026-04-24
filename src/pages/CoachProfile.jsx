import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import { ArrowLeft, Star, Clock, DollarSign, Gamepad2, Loader2, CheckCircle } from 'lucide-react';

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
      ))}
    </div>
  );
}

export default function CoachProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [booked, setBooked] = useState(false);
  const [form, setForm] = useState({ scheduled_at: '', duration_hours: 1, notes: '' });

  const { data: coach, isLoading } = useQuery({
    queryKey: ['coach', id],
    queryFn: () => apiCall(`/coaching/${id}`),
    enabled: !!id,
    staleTime: 60_000,
  });

  const bookMutation = useMutation({
    mutationFn: (data) => apiCall('/coaching/sessions', { method: 'POST', body: data }),
    onSuccess: () => setBooked(true),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!coach) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-bold text-lg mb-2">Coach not found</p>
          <Link to="/coaches" className="text-yellow-400 text-sm hover:underline">Back to Coaches</Link>
        </div>
      </div>
    );
  }

  const hourlyRate = coach.hourly_rate || coach.services?.[0]?.price || 0;

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/coaches" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Coaches
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-yellow-900/40 to-zinc-900" />
              <div className="px-5 pb-5 -mt-10">
                <div className="w-20 h-20 rounded-full bg-zinc-800 border-4 border-zinc-900 overflow-hidden mb-3">
                  {coach.avatar ? (
                    <img src={coach.avatar} alt={coach.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-600 text-white font-black text-2xl">
                      {(coach.display_name || 'C')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h1 className="text-white font-black text-xl">{coach.display_name}</h1>
                {coach.coach_rank && (
                  <p className="text-yellow-400 text-sm font-bold">{coach.coach_rank}</p>
                )}
                {coach.rating > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={coach.rating} />
                    <span className="text-gray-400 text-xs">({coach.review_count || 0} reviews)</span>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {hourlyRate > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <DollarSign className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>EGP {hourlyRate.toLocaleString()} / hour</span>
                    </div>
                  )}
                  {coach.coach_availability && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span className="capitalize">{coach.coach_availability}</span>
                    </div>
                  )}
                  {coach.coach_games?.length > 0 && (
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <Gamepad2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {coach.coach_games.map((g) => (
                          <span key={g} className="text-[11px] px-2 py-0.5 bg-zinc-800 rounded-full text-gray-300">{g}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {coach.bio && (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                <h2 className="text-white font-bold mb-2">About</h2>
                <p className="text-gray-400 text-sm leading-relaxed">{coach.bio}</p>
              </div>
            )}

            {/* Booking Form */}
            {booked ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-bold text-lg mb-1">Session Requested!</p>
                <p className="text-gray-400 text-sm mb-4">The coach will confirm your session shortly. Check your bookings for updates.</p>
                <Link
                  to="/gamer/bookings"
                  className="inline-block px-6 py-2 rounded-xl bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors"
                >
                  View My Bookings
                </Link>
              </div>
            ) : user ? (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                <h2 className="text-white font-bold mb-4">Book a Session</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Preferred Date & Time</label>
                    <input
                      type="datetime-local"
                      value={form.scheduled_at}
                      onChange={(e) => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Duration (hours)</label>
                    <select
                      value={form.duration_hours}
                      onChange={(e) => setForm(p => ({ ...p, duration_hours: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
                    >
                      {[1, 1.5, 2, 2.5, 3].map((h) => (
                        <option key={h} value={h}>{h} {h === 1 ? 'hour' : 'hours'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="What do you want to work on? Rank, map, agent, etc."
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                    />
                  </div>

                  {hourlyRate > 0 && (
                    <div className="rounded-xl bg-zinc-800/50 p-3 flex items-center justify-between">
                      <span className="text-sm text-gray-400">Total ({form.duration_hours}h × EGP {hourlyRate.toLocaleString()})</span>
                      <span className="text-white font-black">EGP {(hourlyRate * form.duration_hours).toLocaleString()}</span>
                    </div>
                  )}

                  <button
                    onClick={() => bookMutation.mutate({ coach_id: id, ...form })}
                    disabled={!form.scheduled_at || bookMutation.isPending}
                    className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {bookMutation.isPending ? 'Booking...' : 'Book Session'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 text-center">
                <p className="text-gray-400 text-sm mb-4">Sign in to book a coaching session.</p>
                <Link
                  to="/auth/gamer/login"
                  className="inline-block px-6 py-2 rounded-xl bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
