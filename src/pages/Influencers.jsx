import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import HeruLogo from '@/components/shared/HeruLogo';
import { Search, Users, TrendingUp, Star, Loader2, Play } from 'lucide-react';

function InfluencerCard({ influencer }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all">
      <div className="h-20 bg-gradient-to-br from-purple-900/40 to-zinc-900 flex items-end p-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
          {influencer.avatar ? (
            <img src={influencer.avatar} alt={influencer.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-black text-xl">
              {(influencer.display_name || 'I')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-white font-bold mb-1">{influencer.display_name || 'Influencer'}</h3>
        {influencer.bio && (
          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{influencer.bio}</p>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          {influencer.audience_size > 0 && (
            <div className="text-center p-2 rounded-lg bg-zinc-800">
              <p className="text-white font-black text-sm">{(influencer.audience_size / 1000).toFixed(0)}K</p>
              <p className="text-gray-500 text-[10px]">Audience</p>
            </div>
          )}
          {influencer.avg_views_per_post > 0 && (
            <div className="text-center p-2 rounded-lg bg-zinc-800">
              <p className="text-white font-black text-sm">{(influencer.avg_views_per_post / 1000).toFixed(0)}K</p>
              <p className="text-gray-500 text-[10px]">Avg Views</p>
            </div>
          )}
        </div>

        {influencer.influencer_platforms?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {influencer.influencer_platforms.map((p) => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                {p}
              </span>
            ))}
          </div>
        )}

        <Link
          to="/auth/sponsor/login"
          className="w-full block text-center py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
        >
          Book Campaign
        </Link>
      </div>
    </div>
  );
}

export default function Influencers() {
  const [search, setSearch] = useState('');

  const { data: rawInfluencers = [], isLoading } = useQuery({
    queryKey: ['influencers'],
    queryFn: () => apiCall('/providers?provider_type=influencer'),
    staleTime: 60_000,
  });

  const influencers = Array.isArray(rawInfluencers) ? rawInfluencers : rawInfluencers.data || [];

  const filtered = influencers.filter((i) =>
    !search || (i.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/sponsor/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sponsor Login</Link>
            <Link to="/auth/provider/register" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors">
              List as Influencer
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">MENA Gaming Influencers</h1>
          <p className="text-gray-400">Browse and book content creators and gaming influencers for esports campaigns.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search influencers..."
            className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-gray-400 font-semibold text-lg">No influencers listed yet</p>
            <p className="text-gray-600 text-sm mt-1 mb-6">Are you a MENA gaming influencer? List your services.</p>
            <Link to="/auth/provider/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors">
              Register as Influencer
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((influencer) => (
              <InfluencerCard key={influencer.id || influencer.user_id} influencer={influencer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
