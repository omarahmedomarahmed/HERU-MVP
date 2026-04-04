import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import GameCard from '@/components/ui/GameCard';
import GlowButton from '@/components/ui/GlowButton';
import { Zap, Trophy, Twitter, Instagram, MessageSquare, Mail, Globe, Star, ArrowLeft } from 'lucide-react';
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


export default function GamerDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiCall('/auth/me').then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  const { data: gamer } = useQuery({
    queryKey: ['gamer-detail', id],
    queryFn: () => GamerProfile.list({ user_id: id }),
    enabled: !!id,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['gamer-teams', id],
    queryFn: () => gamer?.[0]?.team_ids ? Team.list() : [],
    enabled: !!gamer?.[0]?.team_ids,
  });

  const gamerData = gamer?.[0];
  
  if (!gamerData) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <AnimatedBackground />
      <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
    </div>
  );

  const gamerTeams = teams.filter(t => gamerData.team_ids?.includes(t.id));

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AnimatedBackground />
      
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <HeruLogo className="h-7" />
          </Link>
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Profile Header */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-600/20 to-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-zinc-700">
                  {gamerData.avatar ? (
                    <img src={gamerData.avatar} alt={gamerData.username} className="w-full h-full object-cover" />
                  ) : (
                    <Star className="w-16 h-16 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-black">{gamerData.username}</h1>
                    {gamerData.is_talent && (
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> TALENT
                      </span>
                    )}
                  </div>
                  {gamerData.bio && (
                    <p className="text-gray-300 mb-4 text-lg">{gamerData.bio}</p>
                  )}
                  {gamerData.is_talent && gamerData.talent_price && (
                    <p className="text-yellow-400 font-bold mb-4">EGP {gamerData.talent_price}/event</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-4">
              {gamerData.is_talent && (
                <FloatingPanel className="p-4 text-center" glowBorder>
                  <p className="text-gray-400 text-sm mb-1">Rating</p>
                  <p className="text-white font-black text-2xl">{gamerData.talent_rating ? gamerData.talent_rating.toFixed(1) : 'New'} ⭐</p>
                </FloatingPanel>
              )}
              <FloatingPanel className="p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Games</p>
                <p className="text-white font-black text-xl">{gamerData.games?.length || 0}</p>
              </FloatingPanel>
              <FloatingPanel className="p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Teams</p>
                <p className="text-white font-black text-xl">{gamerTeams.length}</p>
              </FloatingPanel>
            </div>
          </div>

          {/* Social Links */}
          {(gamerData.social_links?.twitter || gamerData.social_links?.instagram || gamerData.social_links?.discord || gamerData.social_links?.website) && (
            <FloatingPanel className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Connect</h2>
              <div className="flex flex-wrap gap-3">
                {gamerData.social_links?.twitter && (
                  <a href={gamerData.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition">
                    <Twitter className="w-4 h-4" /> Twitter
                  </a>
                )}
                {gamerData.social_links?.instagram && (
                  <a href={gamerData.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-500/20 text-pink-400 px-4 py-2 rounded-lg hover:bg-pink-500/30 transition">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                )}
                {gamerData.social_links?.discord && (
                  <a href={gamerData.social_links.discord} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-500/30 transition">
                    <MessageSquare className="w-4 h-4" /> Discord
                  </a>
                )}
                {gamerData.social_links?.website && (
                  <a href={gamerData.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-500/20 text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-500/30 transition">
                    <Globe className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </FloatingPanel>
          )}

          {/* Games */}
          {gamerData.games?.length > 0 && (
            <FloatingPanel className="p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" /> Games ({gamerData.games.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {gamerData.games.map((game, i) => (
                  <GameCard key={i} className="p-4">
                    <p className="text-white font-bold">{game.game_name}</p>
                    <p className="text-gray-400 text-sm mt-1">Rank: {game.rank || 'Unranked'}</p>
                  </GameCard>
                ))}
              </div>
            </FloatingPanel>
          )}

          {/* Teams */}
          {gamerTeams.length > 0 && (
            <FloatingPanel className="p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Teams ({gamerTeams.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {gamerTeams.map(t => (
                  <Link key={t.id} to={`/teams/${t.id}`}>
                    <GameCard className="p-4 hover:border-red-500/50">
                      <p className="text-white font-bold">{t.name}</p>
                      <p className="text-gray-400 text-sm mt-1">{t.games?.join(', ') || 'Multi-game'}</p>
                    </GameCard>
                  </Link>
                ))}
              </div>
            </FloatingPanel>
          )}

          {/* Hire Talent CTA */}
          {gamerData.is_talent && (
            <FloatingPanel className="p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-500/30" glowBorder>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Hire {gamerData.username}</h3>
                  <p className="text-gray-400 text-sm">For your next tournament or event</p>
                </div>
                {user ? (
                  <GlowButton>Contact for Gig</GlowButton>
                ) : (
                  <Link to="/auth/gamer/login">
                    <GlowButton>Sign In to Hire</GlowButton>
                  </Link>
                )}
              </div>
            </FloatingPanel>
          )}
        </div>
      </main>
    </div>
  );
}