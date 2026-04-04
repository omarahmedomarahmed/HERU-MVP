import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Plus, Check, ArrowLeft, UserPlus
} from 'lucide-react';
import { awardCoins, COIN_REWARDS } from '@/components/utils/coinRewards';
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Apex Legends', 'Fortnite', 'Call of Duty'];

export default function CreateTeam() {
  const [user, setUser] = useState(null);
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    logo: '',
    games: [],
    is_recruiting: true
  });
  const [selectedFriends, setSelectedFriends] = useState([]);
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
      navigate('/gamer/home');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['my-friends', profile?.friends],
    queryFn: async () => {
      if (!profile?.friends?.length) return [];
      const profiles = await GamerProfile.list();
      return profiles.filter(p => profile.friends.includes(p.user_id));
    },
    enabled: !!profile?.friends?.length,
  });

  const toggleGame = (game) => {
    setTeamData(prev => ({
      ...prev,
      games: prev.games.includes(game) 
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game]
    }));
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const createTeamMutation = useMutation({
    mutationFn: async () => {
      // Create team with user as leader
      const members = [user.id, ...selectedFriends];
      
      const team = await Team.create({
        ...teamData,
        leader_id: user.id,
        members,
        join_requests: [],
        tournament_invites: [],
        chat_messages: [],
        tournament_history: []
      });
      
      // Update creator's profile
      const teamIds = [...(profile.team_ids || []), team.id];
      await GamerProfile.update(profile.id, { team_ids: teamIds });
      
      // Update invited friends' profiles
      for (const friendId of selectedFriends) {
        const friendProfiles = await GamerProfile.list({ user_id: friendId });
        if (friendProfiles.length > 0) {
          const friendProfile = friendProfiles[0];
          const friendTeamIds = [...(friendProfile.team_ids || []), team.id];
          await GamerProfile.update(friendProfile.id, { team_ids: friendTeamIds });
        }
      }
      
      // Award coins for creating team
      awardCoins(user.id, COIN_REWARDS.CREATE_TEAM, 'Created a team');
      
      // Award coins for inviting friends
      if (selectedFriends.length >= 5) {
        awardCoins(user.id, COIN_REWARDS.INVITE_5_TO_TEAM, 'Invited 5 friends to team');
      }
      
      return team;
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      navigate(`/teams/$\{team.id}`);
    }
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </button>

        <FloatingPanel className="p-6" glowBorder>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">CREATE TEAM</h1>
              <p className="text-gray-400">Build your competitive squad</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Team Name *</label>
              <Input
                value={teamData.name}
                onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                placeholder="Enter team name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Description</label>
              <Textarea
                value={teamData.description}
                onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                placeholder="Describe your team..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Logo URL</label>
              <Input
                value={teamData.logo}
                onChange={(e) => setTeamData({ ...teamData, logo: e.target.value })}
                placeholder="https://..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Games *</label>
              <div className="flex flex-wrap gap-2">
                {GAMES.map(game => (
                  <button
                    key={game}
                    onClick={() => toggleGame(game)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      teamData.games.includes(game)
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    }`}
                  >
                    {teamData.games.includes(game) && <Check className="w-4 h-4 inline mr-1" />}
                    {game}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={teamData.is_recruiting}
                onCheckedChange={(v) => setTeamData({ ...teamData, is_recruiting: v })}
              />
              <label className="text-white">Open for recruiting</label>
            </div>

            {friends.length > 0 && (
              <div>
                <label className="text-sm text-gray-400 block mb-3">
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Invite Friends ({selectedFriends.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {friends.map((friend) => (
                    <GameCard
                      key={friend.id}
                      className={`p-3 cursor-pointer ${selectedFriends.includes(friend.user_id) ? 'border-red-500' : ''}`}
                      onClick={() => toggleFriend(friend.user_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                          {friend.avatar ? (
                            <img src={friend.avatar} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-5 h-5 text-red-500 m-auto mt-2" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{friend.username}</p>
                        </div>
                        {selectedFriends.includes(friend.user_id) && (
                          <Check className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </GameCard>
                  ))}
                </div>
              </div>
            )}

            <GlowButton
              className="w-full"
              onClick={() => createTeamMutation.mutate()}
              disabled={!teamData.name || teamData.games.length === 0}
            >
              <Plus className="w-4 h-4" /> Create Team
            </GlowButton>
          </div>
        </FloatingPanel>
      </div>
    </GamerLayout>
  );
}