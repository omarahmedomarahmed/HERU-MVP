import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import GamerLayout from '@/components/layouts/GamerLayout';
import { Calendar, Star, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';

function formatEGP(n) { return `EGP ${(n || 0).toLocaleString()}`; }

const STATUS_STYLE = {
  pending:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

export default function GamerBookings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: rawSessions = [], isLoading } = useQuery({
    queryKey: ['my-coaching-sessions', user?.id],
    queryFn: () => apiCall('/coaching/sessions/mine'),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const sessions = Array.isArray(rawSessions) ? rawSessions : rawSessions.data || [];

  const completeMutation = useMutation({
    mutationFn: ({ id, rating, review }) =>
      apiCall(`/coaching/sessions/${id}/complete`, { method: 'PUT', body: { rating, review } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-coaching-sessions'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20">
        <Calendar className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
        <p className="text-white font-bold text-lg mb-1">No coaching sessions yet</p>
        <p className="text-gray-400 text-sm mb-6">Book a session with a verified coach to improve your game.</p>
        <Link to="/coaches" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors">
          Browse Coaches
        </Link>
      </div>
    );
  }

  return (
    <GamerLayout>
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-white">My Coaching Sessions</h2>
        <Link to="/coaches" className="text-sm text-red-400 hover:text-red-300 font-medium">
          Book a Session →
        </Link>
      </div>

      {sessions.map((session) => (
        <div key={session.id} className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${STATUS_STYLE[session.status] || STATUS_STYLE.pending}`}>
                  {session.status}
                </span>
                <span className="text-xs text-gray-500 capitalize">{session.session_type?.replace('_', ' ')}</span>
              </div>
              <p className="text-white font-bold">{session.game || 'Coaching Session'}</p>
              {session.scheduled_at && (
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.scheduled_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {session.notes && <p className="text-xs text-gray-400 mt-1">{session.notes}</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white font-black">{formatEGP(session.price)}</p>
              <p className="text-xs text-gray-500">{session.duration_minutes} min</p>
            </div>
          </div>

          {session.status === 'confirmed' && !session.gamer_rating && (
            <button
              onClick={() => completeMutation.mutate({ id: session.id, rating: 5, review: '' })}
              disabled={completeMutation.isPending}
              className="mt-3 w-full py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark as Completed & Rate
            </button>
          )}

          {session.gamer_rating && (
            <div className="mt-3 flex items-center gap-1">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= session.gamer_rating ? 'text-amber-400 fill-current' : 'text-zinc-700'}`} />
              ))}
              {session.gamer_review && <span className="text-xs text-gray-400 ml-2">{session.gamer_review}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
    </GamerLayout>
  );
}
