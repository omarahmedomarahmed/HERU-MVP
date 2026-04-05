import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { GamerProfile, MarketplaceItem, Team, Tournament, Achievement, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Trophy, Users, ShoppingBag, Star, Swords, TrendingUp,
  Target, Award, Play, ArrowRight, ShoppingCart,
  Gamepad2, Shield, Crown, Medal, Clock, ChevronRight
} from 'lucide-react';

export default function GamerHome() {
  const [user, setUser] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [gameTag, setGameTag] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  // Fetch gamer stats
  const { data: stats } = useQuery({
    queryKey: ['gamer-stats', user?.id],
    queryFn: () => GamerProfile.stats(user.id),
    enabled: !!user?.id,
  });

  // Fetch earned achievements
  const { data: earnedAchievements = [] } = useQuery({
    queryKey: ['gamer-achievements', user?.id],
    queryFn: () => GamerProfile.achievements(user.id),
    enabled: !!user?.id,
  });

  // Fetch all achievement definitions
  const { data: allAchievements = [] } = useQuery({
    queryKey: ['achievements-all'],
    queryFn: () => Achievement.list(),
  });

  // Live + published tournaments
  const { data: liveTournaments = [] } = useQuery({
    queryKey: ['tournaments-live'],
    queryFn: () => Tournament.list({ status: 'live' }, '-created_date', 6),
  });

  const { data: upcomingTournaments = [] } = useQuery({
    queryKey: ['tournaments-upcoming'],
    queryFn: () => Tournament.list({ status: 'published' }, '-created_date', 6),
  });

  const allTournaments = [...liveTournaments, ...upcomingTournaments].slice(0, 6);

  const { data: marketplaceItems = [] } = useQuery({
    queryKey: ['marketplace-prizepool'],
    queryFn: () => MarketplaceItem.list({ category: 'prizepool', is_active: true }, '-created_date', 8),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-recruiting'],
    queryFn: () => Team.list({ is_recruiting: true }, '-created_date', 6),
  });

  const { data: cart = [] } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: () => {
      const savedCart = localStorage.getItem(`cart_${user?.id}`);
      return savedCart ? JSON.parse(savedCart) : [];
    },
    enabled: !!user?.id,
  });

  const addToCart = (item, tag = '') => {
    const newCart = [...cart, { ...item, cartId: Date.now(), gameTag: tag }];
    localStorage.setItem(`cart_${user?.id}`, JSON.stringify(newCart));
    queryClient.invalidateQueries(['cart', user?.id]);
    setSelectedItem(null);
    setGameTag('');
  };

  const unreadNotifications = profile?.notifications?.filter(n => !n.read)?.length || 0;

  // Achievement icon mapping
  const achievementIcons = {
    wins: Trophy,
    tournaments_played: Swords,
    tournaments_won: Crown,
    teams_created: Shield,
    teams_joined: Users,
  };

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length} notificationCount={unreadNotifications}>
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center mb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-zinc-950/90 to-zinc-950 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="relative z-10 w-full px-2 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Welcome + Quick Actions */}
              <div className="flex-1">
                <p className="text-red-500 text-sm font-bold tracking-widest mb-2">WELCOME BACK</p>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                  {profile?.username || user?.full_name || 'Gamer'}
                </h1>
                <p className="text-gray-400 text-lg mb-6">Ready to compete?</p>

                <div className="flex flex-wrap gap-3">
                  <Link to="/gamer/teams/create">
                    <GlowButton size="lg">
                      <Users className="w-5 h-5" />
                      CREATE TEAM
                    </GlowButton>
                  </Link>
                  <Link to="/tournaments">
                    <GlowButton variant="secondary" size="lg">
                      <Trophy className="w-5 h-5" />
                      FIND TOURNAMENTS
                    </GlowButton>
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[320px]">
                <FloatingPanel className="p-4 text-center">
                  <Swords className="w-5 h-5 text-red-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{stats?.total_matches || 0}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Matches</p>
                </FloatingPanel>
                <FloatingPanel className="p-4 text-center">
                  <Trophy className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{stats?.total_wins || 0}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Wins</p>
                </FloatingPanel>
                <FloatingPanel className="p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{stats?.win_rate || 0}%</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Win Rate</p>
                </FloatingPanel>
                <FloatingPanel className="p-4 text-center">
                  <Medal className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <p className="text-2xl font-black text-white">{earnedAchievements.length}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Badges</p>
                </FloatingPanel>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievement Showcase */}
      {earnedAchievements.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-white">Recent Achievements</h2>
            </div>
            <Link to="/gamer/profile">
              <GlowButton variant="ghost" size="sm">
                View All <ChevronRight className="w-3 h-3" />
              </GlowButton>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {earnedAchievements.slice(0, 5).map((ea, i) => {
              const ach = ea.achievements || ea;
              const IconComp = achievementIcons[ach.criteria?.type] || Award;
              return (
                <motion.div
                  key={ea.id || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <FloatingPanel className="p-4 min-w-[140px] text-center" glowBorder>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-red-500/20 flex items-center justify-center mx-auto mb-2">
                      <IconComp className="w-6 h-6 text-yellow-400" />
                    </div>
                    <p className="text-white text-sm font-bold truncate">{ach.name || ach.title}</p>
                    <p className="text-gray-500 text-xs mt-1 truncate">{ach.description}</p>
                  </FloatingPanel>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tournaments Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <HexBadge className="mb-2">
              <Trophy className="w-3 h-3 mr-1" /> COMPETE
            </HexBadge>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              ACTIVE <span className="text-red-500">TOURNAMENTS</span>
            </h2>
          </div>
          <Link to="/tournaments">
            <GlowButton variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4" />
            </GlowButton>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {allTournaments.map((tournament, i) => {
            const isLive = tournament.status === 'live';
            return (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/tournaments/${tournament.id}`}>
                  <GameCard className="h-full group">
                    <div className="h-40 bg-gradient-to-br from-red-900/30 to-zinc-900 relative overflow-hidden">
                      {tournament.tournament_image ? (
                        <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" />
                      ) : tournament.organizer_brand?.logo && (
                        <img src={tournament.organizer_brand.logo} alt="" className="w-full h-full object-cover opacity-50" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        {isLive ? (
                          <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            LIVE
                          </span>
                        ) : (
                          <HexBadge className="bg-zinc-900/80">
                            <Clock className="w-3 h-3 mr-1" /> {tournament.status}
                          </HexBadge>
                        )}
                      </div>

                      {/* Prizepool */}
                      {tournament.prizepool_total > 0 && (
                        <div className="absolute top-3 right-3">
                          <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                            EGP {tournament.prizepool_total?.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Game */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-xs bg-zinc-900/70 text-gray-300 px-2 py-0.5 rounded">
                          {tournament.game || 'TBD'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-lg mb-2 truncate">{tournament.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {tournament.teams?.length || 0}/{tournament.max_teams || '∞'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gamepad2 className="w-4 h-4 text-red-400" />
                          {tournament.format || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </GameCard>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {allTournaments.length === 0 && (
          <FloatingPanel className="p-12 text-center">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl text-white font-bold mb-2">No Active Tournaments</h3>
            <p className="text-gray-400">Check back soon for upcoming competitions</p>
          </FloatingPanel>
        )}
      </section>

      {/* Teams Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <HexBadge className="mb-2">
              <Users className="w-3 h-3 mr-1" /> RECRUIT
            </HexBadge>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              TEAMS <span className="text-red-500">RECRUITING</span>
            </h2>
          </div>
          <Link to="/teams">
            <GlowButton variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4" />
            </GlowButton>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {teams.map((team, i) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/gamer/teams/${team.id}`}>
                <GameCard className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 flex items-center justify-center overflow-hidden">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{team.name}</h3>
                      <p className="text-gray-400 text-sm">{team.members?.length || 0} members</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {team.games?.slice(0, 2).map((game, gi) => (
                          <span key={gi} className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded">
                            {game}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {team.is_recruiting && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <GlowButton size="sm" className="w-full">
                        <Target className="w-3 h-3" />
                        Request to Join
                      </GlowButton>
                    </div>
                  )}
                </GameCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Prizepool Shop Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <HexBadge className="mb-2">
              <ShoppingBag className="w-3 h-3 mr-1" /> SHOP
            </HexBadge>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              PRIZE<span className="text-red-500">POOL</span> STORE
            </h2>
          </div>
          <Link to="/gamer/marketplace">
            <GlowButton variant="ghost" size="sm">
              View All <ArrowRight className="w-4 h-4" />
            </GlowButton>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {marketplaceItems.slice(0, 8).map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GameCard className="h-full cursor-pointer group" onClick={() => setSelectedItem(item)}>
                <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900/20 to-zinc-900">
                      <Award className="w-12 h-12 text-zinc-600" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      EGP {item.price}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                  <p className="text-gray-500 text-xs mt-1 truncate">{item.description}</p>
                </div>
              </GameCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Become Talent CTA */}
      <section className="mb-10">
        <FloatingPanel className="p-8 text-center" glowBorder>
          <Star className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            BECOME A <span className="text-red-500">TALENT</span>
          </h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Are you a caster, host, analyst, or observer? Apply to join our talent roster.
          </p>
          <Link to="/gamer/profile">
            <GlowButton size="lg">
              <Star className="w-5 h-5" />
              APPLY NOW
            </GlowButton>
          </Link>
        </FloatingPanel>
      </section>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedItem?.title}</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4">
              <div className="aspect-video bg-zinc-800 rounded-lg mb-4 overflow-hidden">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Award className="w-16 h-16 text-zinc-600" />
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4">{selectedItem.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-bold text-red-400">EGP {selectedItem.price}</span>
                {selectedItem.stock !== undefined && (
                  <span className="text-gray-500 text-sm">{selectedItem.stock} in stock</span>
                )}
              </div>

              {selectedItem.type === 'gaming_currency' && (
                <div className="mb-4">
                  <label className="text-sm text-gray-400 block mb-2">Your Game Tag/Username *</label>
                  <Input
                    value={gameTag}
                    onChange={(e) => setGameTag(e.target.value)}
                    placeholder="Enter your in-game username"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              )}

              <GlowButton
                className="w-full"
                onClick={() => addToCart(selectedItem, gameTag)}
                disabled={selectedItem.type === 'gaming_currency' && !gameTag}
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </GlowButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}
