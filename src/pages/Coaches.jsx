import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import HeruLogo from '@/components/shared/HeruLogo';
import { Search, Star, Filter, Gamepad2, Loader2 } from 'lucide-react';

const GAMES = ['All', 'Valorant', 'CS2', 'League of Legends', 'PUBG', 'FIFA', 'Fortnite'];

function CoachCard({ coach }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group">
      <div className="h-24 bg-gradient-to-br from-red-900/40 to-zinc-900 relative">
        {coach.avatar && (
          <img src={coach.avatar} alt={coach.display_name} className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-full flex items-end p-4">
          <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex-shrink-0">
            {coach.avatar ? (
              <img src={coach.avatar} alt={coach.display_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-red-600 text-white font-black text-xl">
                {(coach.display_name || 'C')[0].toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-white font-bold">{coach.display_name || 'Coach'}</p>
            {coach.coach_rank && (
              <p className="text-xs text-red-400 font-medium">{coach.coach_rank}</p>
            )}
          </div>
          {coach.rating && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-bold">{coach.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {coach.bio && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{coach.bio}</p>
        )}

        {coach.coach_games?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {coach.coach_games.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-400 border border-zinc-700">
                {g}
              </span>
            ))}
          </div>
        )}

        <Link
          to={`/coaches/${coach.user_id}`}
          className="w-full block text-center py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
        >
          View Profile & Book
        </Link>
      </div>
    </div>
  );
}

export default function Coaches() {
  const [game, setGame] = useState('All');
  const [search, setSearch] = useState('');

  const { data: rawCoaches = [], isLoading } = useQuery({
    queryKey: ['coaches', game],
    queryFn: () => apiCall(`/coaching${game !== 'All' ? `?game=${encodeURIComponent(game)}` : ''}`),
    staleTime: 60_000,
  });

  const coaches = Array.isArray(rawCoaches) ? rawCoaches : rawCoaches.data || [];

  const filtered = coaches.filter((c) =>
    !search || (c.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <Link to="/auth/gamer/login" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors">
            Book a Coach
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">Coaching Marketplace</h1>
          <p className="text-gray-400">Book verified coaches for 1:1 VOD reviews, strategy sessions, and live coaching.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coaches..."
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {GAMES.map((g) => (
              <button
                key={g}
                onClick={() => setGame(g)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  game === g ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Gamepad2 className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold text-lg">No coaches found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different game or check back soon</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((coach) => (
              <CoachCard key={coach.id || coach.user_id} coach={coach} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
