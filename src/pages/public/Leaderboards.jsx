import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import HeruLogo from '@/components/shared/HeruLogo';
import { Trophy, TrendingUp, Medal, Loader2, Crown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import GamerLayout from '@/components/layouts/GamerLayout';

const GAMES = ['Valorant', 'CS2', 'League of Legends', 'PUBG', 'FIFA', 'Fortnite'];

function RankBadge({ position }) {
  if (position === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
  if (position === 2) return <Medal className="w-5 h-5 text-gray-300" />;
  if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return <span className="text-sm font-black text-gray-500 w-5 text-center">{position}</span>;
}

function LeaderboardsContent() {
  const [game, setGame] = useState(GAMES[0]);

  const { data: rawEntries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', game],
    queryFn: () => apiCall(`/leaderboards?game=${encodeURIComponent(game)}&limit=50`),
    staleTime: 60_000,
  });

  const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries.data || [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <Link to="/auth/gamer/register" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors">
            Join & Compete
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Leaderboards</h1>
          <p className="text-gray-400">MENA cross-tournament rankings. Season 2026-S1.</p>
        </div>

        {/* Game selector */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {GAMES.map((g) => (
            <button
              key={g}
              onClick={() => setGame(g)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                game === g ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Leaderboard table */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-bold text-white">{game} Rankings</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-red-400 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400">No rankings yet for {game}</p>
              <p className="text-gray-600 text-sm mt-1">Compete in tournaments to earn your rank</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {entries.map((entry, index) => {
                const position = entry.rank_position || index + 1;
                const isTop3 = position <= 3;
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-6 py-4 ${isTop3 ? 'bg-yellow-500/5' : 'hover:bg-zinc-800/50'} transition-colors`}
                  >
                    <div className="w-6 flex-shrink-0 flex items-center justify-center">
                      <RankBadge position={position} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {entry.gamer?.username || entry.gamer_id?.slice(0, 8) || 'Player'}
                      </p>
                      <p className="text-xs text-gray-500">{entry.region}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-black">{(entry.score || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{entry.wins}W – {entry.losses}L</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Leaderboards() {
  const { userProfile } = useAuth()
  const isGamer = userProfile?.role === 'gamer'
  if (isGamer) {
    return <GamerLayout><LeaderboardsContent /></GamerLayout>
  }
  return <LeaderboardsContent />
}
