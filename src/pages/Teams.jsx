import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Users, Search, Target, Plus, Gamepad2, Crown, ArrowRight
} from 'lucide-react';

export default function Teams() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {}
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

  const { data: allTeams = [], isLoading } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => Team.list('-created_date'),
  });

  const myTeams = allTeams.filter(t => profile?.team_ids?.includes(t.id));
  const otherTeams = allTeams.filter(t => !profile?.team_ids?.includes(t.id));

  const filteredOtherTeams = otherTeams.filter(team => 
    team.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.games?.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <HexBadge className="mb-3">
            <Users className="w-3 h-3 mr-1" /> SQUADS
          </HexBadge>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            TEAMS
          </h1>
          <p className="text-gray-400 mt-2">Find your squad or create your own</p>
        </div>
        <Link to={'/create-team'}>
          <GlowButton>
            <Plus className="w-4 h-4" /> Create Team
          </GlowButton>
        </Link>
      </div>

      {/* My Teams */}
      {myTeams.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            My Teams
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`}>
                <GameCard className="p-5 h-full border-red-500/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold truncate">{team.name}</h3>
                        {team.leader_id === user?.id && (
                          <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {team.games?.map((game, gi) => (
                      <span key={gi} className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded">
                        {game}
                      </span>
                    ))}
                  </div>
                  <GlowButton variant="secondary" size="sm" className="w-full">
                    View Team <ArrowRight className="w-3 h-3" />
                  </GlowButton>
                </GameCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search */}
      <FloatingPanel className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams by name or game..."
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </FloatingPanel>

      {/* All Teams */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          {myTeams.length > 0 ? 'Other Teams' : 'All Teams'}
        </h2>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-zinc-900/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredOtherTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOtherTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`}>
                <GameCard className="p-5 h-full">
                  <div className="flex items-center gap-4 mb-4">
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
                    </div>
                  </div>

                  {team.description && (
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{team.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1 mb-4">
                    {team.games?.map((game, gi) => (
                      <span key={gi} className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded">
                        {game}
                      </span>
                    ))}
                  </div>

                  {team.is_recruiting ? (
                    <GlowButton size="sm" className="w-full">
                      <Target className="w-3 h-3" />
                      Request to Join
                    </GlowButton>
                  ) : (
                    <GlowButton variant="ghost" size="sm" className="w-full">
                      View Team
                    </GlowButton>
                  )}
                </GameCard>
              </Link>
            ))}
          </div>
        ) : (
          <FloatingPanel className="p-12 text-center">
            <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl text-white font-bold mb-2">No Teams Found</h3>
            <p className="text-gray-400">Try adjusting your search or create your own team</p>
          </FloatingPanel>
        )}
      </section>
    </GamerLayout>
  );
}