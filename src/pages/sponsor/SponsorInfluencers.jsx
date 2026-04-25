import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import SponsorLayout from '@/components/layouts/SponsorLayout';
import { Search, Users, Play, Loader2, Star } from 'lucide-react';

function InfluencerCard({ influencer }) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-yellow-500/30 transition-all">
      <div className="h-20 bg-gradient-to-br from-yellow-900/30 to-zinc-900 flex items-end p-4">
        <div className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
          {influencer.avatar ? (
            <img src={influencer.avatar} alt={influencer.display_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-yellow-600 text-white font-black text-xl">
              {(influencer.display_name || 'I')[0].toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-white font-bold">{influencer.display_name || 'Influencer'}</h3>
            {influencer.rating && (
              <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">{influencer.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

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
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                {p}
              </span>
            ))}
          </div>
        )}

        <a
          href={`mailto:heru@heru.gg?subject=Influencer Campaign Inquiry — ${influencer.display_name}`}
          className="w-full block text-center py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold transition-colors"
        >
          Inquire to Book
        </a>
      </div>
    </div>
  );
}

export default function SponsorInfluencers() {
  const [search, setSearch] = useState('');

  const { data: rawInfluencers = [], isLoading } = useQuery({
    queryKey: ['sponsor-influencers'],
    queryFn: () => apiCall('/providers?provider_type=influencer'),
    staleTime: 60_000,
  });

  const influencers = Array.isArray(rawInfluencers) ? rawInfluencers : rawInfluencers.data || [];

  const filtered = influencers.filter((i) =>
    !search || (i.display_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SponsorLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Influencer Marketplace</h1>
          <p className="text-sm text-gray-400 mt-1">Browse and book MENA gaming influencers for your esports campaigns.</p>
        </div>

        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search influencers..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-1">No influencers listed yet</p>
            <p className="text-gray-400 text-sm">MENA gaming influencers coming soon. Check back later.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((inf) => (
              <InfluencerCard key={inf.id || inf.user_id} influencer={inf} />
            ))}
          </div>
        )}
      </div>
    </SponsorLayout>
  );
}
