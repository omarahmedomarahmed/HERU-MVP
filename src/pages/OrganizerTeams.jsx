import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Users, Search, Eye, Trophy, Gamepad2 } from 'lucide-react';
import { OrganizerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


export default function OrganizerTeams() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/organizer/dashboard');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await OrganizerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['all-teams-for-organizer'],
    queryFn: () => Team.list('-created_date'),
  });

  const allGames = [...new Set(teams.flatMap(t => t.games || []))];

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = gameFilter === 'all' || team.games?.includes(gameFilter);
    return matchesSearch && matchesGame;
  });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          BROWSE <span className="text-red-500">TEAMS</span>
        </h1>
        <p className="text-gray-400">Find teams to invite to your tournaments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <FloatingPanel className="p-4">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-white">{teams.length}</p>
          <p className="text-gray-500 text-xs">Total Teams</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <Users className="w-8 h-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-white">{teams.filter(t => t.is_recruiting).length}</p>
          <p className="text-gray-500 text-xs">Recruiting</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <Gamepad2 className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-2xl font-bold text-white">{allGames.length}</p>
          <p className="text-gray-500 text-xs">Games Covered</p>
        </FloatingPanel>
      </div>

      {/* Search & Filters */}
      <FloatingPanel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGameFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm ${gameFilter === 'all' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-gray-400'}`}
            >
              All Games
            </button>
            {allGames.slice(0, 5).map(game => (
              <button
                key={game}
                onClick={() => setGameFilter(game)}
                className={`px-3 py-2 rounded-lg text-sm ${gameFilter === game ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-gray-400'}`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>
      </FloatingPanel>

      {/* Teams List */}
      {isLoading ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto animate-pulse" />
          <p className="text-gray-400 mt-3">Loading teams...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <FloatingPanel className="p-12 text-center">
          <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">No Teams Found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </FloatingPanel>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <GameCard key={team.id} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{team.name}</h3>
                  <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {team.games?.map((game, i) => (
                  <HexBadge key={i} className="text-xs">{game}</HexBadge>
                ))}
              </div>

              {team.is_recruiting && (
                <div className="mb-4">
                  <HexBadge className="bg-green-500/20 text-green-400 border-green-500/50">
                    Recruiting
                  </HexBadge>
                </div>
              )}

              {team.tournament_history?.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  {team.tournament_history.length} tournaments played
                </div>
              )}

              <Link to={`/teams/${team.id}`}>
                <GlowButton variant="secondary" size="sm" className="w-full">
                  <Eye className="w-4 h-4" /> View Team
                </GlowButton>
              </Link>
            </GameCard>
          ))}
        </div>
      )}
    </>
  );
}