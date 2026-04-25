import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GamerProfile, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Trophy, Users, Search, Filter, Calendar, Play, Gamepad2, MapPin
} from 'lucide-react';

export default function Tournaments() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      // Allow viewing as guest
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

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: () => Tournament.list('-created_date'),
  });

  // Filter out drafts for gamers - only show published, live, completed
  const visibleTournaments = tournaments.filter(t => 
    t.status === 'published' || t.status === 'live' || t.status === 'completed'
  );

  const filteredTournaments = visibleTournaments.filter(tournament => {
    const matchesSearch = tournament.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tournament.game?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = gameFilter === 'all' || tournament.game === gameFilter;
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesGame && matchesStatus;
  });

  const games = [...new Set(visibleTournaments.map(t => t.game).filter(Boolean))];

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Header */}
      <div className="mb-8">
        <HexBadge className="mb-3">
          <Trophy className="w-3 h-3 mr-1" /> COMPETE
        </HexBadge>
        <h1 className="text-3xl md:text-4xl font-black text-white">
          TOURNAMENTS
        </h1>
        <p className="text-gray-400 mt-2">Find and join competitions</p>
      </div>

      {/* Filters */}
      <FloatingPanel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-full md:w-48 bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Games</SelectItem>
              {games.map(game => (
                <SelectItem key={game} value={game}>{game}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48 bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Open</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </FloatingPanel>

      {/* Tournaments Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-80 bg-zinc-900/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredTournaments.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <Link key={tournament.id} to={`/tournaments/${tournament.id}`}>
              <GameCard className="h-full group">
                <div className="h-44 bg-gradient-to-br from-red-900/30 to-zinc-900 relative overflow-hidden">
                  {tournament.tournament_image ? (
                    <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" />
                  ) : tournament.organizer_brand?.logo && (
                    <img src={tournament.organizer_brand.logo} alt="" className="w-full h-full object-cover opacity-40" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {tournament.status === 'live' ? (
                      <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <HexBadge className={
                        tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' : ''
                      }>
                        {tournament.status === 'published' && 'OPEN'}
                        {tournament.status === 'completed' && 'ENDED'}
                      </HexBadge>
                    )}
                  </div>

                  {/* Game */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-gray-300">{tournament.game}</span>
                  </div>

                  {/* Prizepool / Organizer */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                    {tournament.prizepool_total > 0 && (
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                        EGP {tournament.prizepool_total?.toLocaleString()}
                      </span>
                    )}
                    {tournament.organizer_brand?.name && (
                      <span className="text-xs text-gray-400 bg-black/50 px-2 py-0.5 rounded">
                        {tournament.organizer_brand.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-white font-bold text-lg mb-3 line-clamp-1">
                    {tournament.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">
                        {tournament.teams?.length || 0} / {tournament.max_teams || '∞'} teams
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-400">{tournament.format || 'TBD'}</span>
                    </div>
                    {tournament.schedule && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">
                          {new Date(tournament.schedule).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {tournament.is_offline && tournament.venue && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{tournament.venue}</span>
                      </div>
                    )}
                  </div>

                  {/* Organizer logos */}
                  {(tournament.organizer_brand || (tournament.co_organizers || []).length > 0) && (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {tournament.organizer_brand?.logo || tournament.organizer_brand?.brand_logo ? (
                        <img
                          src={tournament.organizer_brand.logo || tournament.organizer_brand.brand_logo}
                          alt={tournament.organizer_brand.name || tournament.organizer_brand.brand_name}
                          title={tournament.organizer_brand.name || tournament.organizer_brand.brand_name}
                          className="w-7 h-7 rounded object-cover border border-white/10"
                        />
                      ) : null}
                      {(tournament.co_organizers || []).filter(co => co.brand_logo).map((co, i) => (
                        <img key={i}
                          src={co.brand_logo}
                          alt={co.brand_name}
                          title={co.brand_name}
                          className="w-7 h-7 rounded object-cover border border-white/10"
                        />
                      ))}
                    </div>
                  )}

                  {tournament.status === 'published' && (
                    <GlowButton size="sm" className="w-full">
                      <Play className="w-3 h-3" />
                      Join Tournament
                    </GlowButton>
                  )}
                  {tournament.status === 'live' && (
                    <GlowButton size="sm" className="w-full" variant="secondary">
                      <Play className="w-3 h-3" />
                      Watch Live
                    </GlowButton>
                  )}
                  {tournament.status === 'completed' && (
                    <GlowButton size="sm" className="w-full" variant="ghost">
                      View Results
                    </GlowButton>
                  )}
                </div>
              </GameCard>
            </Link>
          ))}
        </div>
      ) : (
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">No Tournaments Found</h3>
          <p className="text-gray-400">Try adjusting your filters or check back later</p>
        </FloatingPanel>
      )}
    </GamerLayout>
  );
}