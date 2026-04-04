import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  User, ArrowLeft, Gamepad2, Users
} from 'lucide-react';

export default function GamerProfileView() {
  const [user, setUser] = useState(null);
  const [profileUserId, setProfileUserId] = useState(null);

  useEffect(() => {
    loadUser();
    const params = new URLSearchParams(window.location.search);
    setProfileUserId(params.get('id'));
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {}
  };

  const { data: myProfile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: viewedProfile, isLoading } = useQuery({
    queryKey: ['viewed-profile', profileUserId],
    queryFn: async () => {
      if (!profileUserId) return null;
      const profiles = await GamerProfile.list({ user_id: profileUserId });
      return profiles[0];
    },
    enabled: !!profileUserId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['profile-teams', viewedProfile?.team_ids],
    queryFn: async () => {
      if (!viewedProfile?.team_ids?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => viewedProfile.team_ids.includes(t.id));
    },
    enabled: !!viewedProfile?.team_ids?.length,
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  if (isLoading) {
    return (
      <GamerLayout user={user} profile={myProfile} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      </GamerLayout>
    );
  }

  if (!viewedProfile) {
    return (
      <GamerLayout user={user} profile={myProfile} cartCount={cart.length}>
        <FloatingPanel className="p-12 text-center">
          <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">Profile Not Found</h3>
          <Link to={'/gamer/home'}>
            <GlowButton className="mt-4">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </GlowButton>
          </Link>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  return (
    <GamerLayout user={user} profile={myProfile} cartCount={cart.length}>
      <Link to={'/gamer/home'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Link>

      {/* Profile Header */}
      <FloatingPanel className="p-8 mb-6 text-center" glowBorder>
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden mb-4">
          {viewedProfile?.avatar ? (
            <img src={viewedProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-16 h-16 text-red-500" />
          )}
        </div>

        <h1 className="text-3xl font-black text-white mb-2">{viewedProfile?.username}</h1>

        {viewedProfile?.bio && (
          <p className="text-gray-400 mb-4 max-w-md mx-auto">{viewedProfile.bio}</p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{teams.length}</p>
            <p className="text-gray-500 text-sm">Teams</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{viewedProfile?.games?.length || 0}</p>
            <p className="text-gray-500 text-sm">Games</p>
          </div>
        </div>
      </FloatingPanel>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Games */}
        <FloatingPanel className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Gamepad2 className="w-5 h-5 text-red-500" />
            Games & Ranks
          </h2>
          <div className="space-y-3">
            {viewedProfile?.games?.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{game.game_name}</p>
                  <p className="text-gray-500 text-sm">ID: {game.game_id}</p>
                </div>
                <HexBadge>{game.rank}</HexBadge>
              </div>
            ))}
            {(!viewedProfile?.games || viewedProfile.games.length === 0) && (
              <p className="text-gray-500 text-center py-4">No games added</p>
            )}
          </div>
        </FloatingPanel>

        {/* Teams */}
        <FloatingPanel className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-red-500" />
            Teams
          </h2>
          <div className="space-y-3">
            {teams.map((team) => (
              <Link key={team.id} to={`/teams/$\{team.id}`}>
                <GameCard className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {team.logo ? (
                        <img src={team.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{team.name}</p>
                      <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </GameCard>
              </Link>
            ))}
            {teams.length === 0 && (
              <p className="text-gray-500 text-center py-4">Not in any teams</p>
            )}
          </div>
        </FloatingPanel>
      </div>
    </GamerLayout>
  );
}