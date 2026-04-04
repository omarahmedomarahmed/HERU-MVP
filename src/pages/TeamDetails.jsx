import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, Trophy, MessageSquare, Send, UserPlus, Check, X, Crown, Shield
} from 'lucide-react';
import { awardCoins, COIN_REWARDS } from '@/components/utils/coinRewards';
import { GamerProfile, Order, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Apex Legends'];
const RANKS = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Radiant', 'Global Elite'];

export default function TeamDetails() {
  const [user, setUser] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [joinRequest, setJoinRequest] = useState({ game: '', game_id: '', rank: '' });
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      // public page, guest allowed
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

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await Team.list({ id: teamId });
      return teams[0];
    },
    enabled: !!teamId,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', team?.members],
    queryFn: async () => {
      if (!team?.members?.length) return [];
      const profiles = await GamerProfile.list();
      return profiles.filter(p => team.members.includes(p.user_id));
    },
    enabled: !!team?.members?.length,
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

  // Fetch tournaments for invite details
  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments-for-invites', team?.tournament_invites],
    queryFn: async () => {
      if (!team?.tournament_invites?.length) return [];
      const allTournaments = await Tournament.list();
      return allTournaments;
    },
    enabled: !!team?.tournament_invites?.length,
  });

  // Fetch profiles for invite display
  const { data: allProfiles = [] } = useQuery({
    queryKey: ['all-profiles-for-invites'],
    queryFn: () => GamerProfile.list(),
  });

  const joinRequestMutation = useMutation({
    mutationFn: async () => {
      const requests = [...(team.join_requests || []), {
        user_id: user.id,
        ...joinRequest,
        status: 'pending'
      }];
      await Team.update(teamId, { join_requests: requests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      setShowJoinModal(false);
      setJoinRequest({ game: '', game_id: '', rank: '' });
    }
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestIndex) => {
      const request = team.join_requests[requestIndex];
      const updatedRequests = [...team.join_requests];
      updatedRequests[requestIndex] = { ...request, status: 'approved' };
      
      const members = [...(team.members || [])];
      if (!members.includes(request.user_id)) {
        members.push(request.user_id);
      }
      
      await Team.update(teamId, { join_requests: updatedRequests, members });
      
      // Update joiner's profile
      const joinerProfiles = await GamerProfile.list({ user_id: request.user_id });
      if (joinerProfiles.length > 0) {
        const joinerProfile = joinerProfiles[0];
        const teamIds = [...(joinerProfile.team_ids || [])];
        if (!teamIds.includes(teamId)) {
          teamIds.push(teamId);
          await GamerProfile.update(joinerProfile.id, { team_ids: teamIds });
        }
      }
      
      awardCoins(request.user_id, COIN_REWARDS.JOIN_TEAM, 'Joined a team');
    },
    onSuccess: () => queryClient.invalidateQueries(['team', teamId])
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestIndex) => {
      const updatedRequests = [...team.join_requests];
      updatedRequests[requestIndex] = { ...updatedRequests[requestIndex], status: 'rejected' };
      await Team.update(teamId, { join_requests: updatedRequests });
    },
    onSuccess: () => queryClient.invalidateQueries(['team', teamId])
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const msgObj = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        message,
        timestamp: new Date().toISOString()
      };
      const chat = [...(team.chat_messages || []), msgObj];
      await Team.update(teamId, { chat_messages: chat });
      
      // Also update/create the DM thread for this team
      const allDms = await Order.list();
      const teamDm = allDms.find(dm => dm.chat_type === 'team' && dm.reference_id === teamId);
      
      if (teamDm) {
        const messages = teamDm.messages || [];
        messages.push({
          sender_id: user.id,
          sender_name: profile?.username || user.full_name,
          content: message,
          timestamp: new Date().toISOString()
        });
        await Order.update(teamDm.id, {
          messages,
          last_message_at: new Date().toISOString(),
          participants: team.members || []
        });
      } else {
        await Order.create({
          chat_type: 'team',
          chat_name: `${team.name} Chat`,
          reference_id: teamId,
          participants: team.members || [],
          messages: [{
            sender_id: user.id,
            sender_name: profile?.username || user.full_name,
            content: message,
            timestamp: new Date().toISOString()
          }],
          last_message_at: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      queryClient.invalidateQueries(['my-conversations', user?.id]);
      setNewMessage('');
    }
  });

  const inviteFriendMutation = useMutation({
    mutationFn: async (friendId) => {
      // Add friend to team directly (as team leader)
      const newMembers = [...(team.members || [])];
      if (!newMembers.includes(friendId)) {
        newMembers.push(friendId);
        await Team.update(teamId, { members: newMembers });
        
        // Update friend's profile
        const friendProfiles = await GamerProfile.list({ user_id: friendId });
        if (friendProfiles.length > 0) {
          const friendProfile = friendProfiles[0];
          const teamIds = [...(friendProfile.team_ids || [])];
          if (!teamIds.includes(teamId)) {
            teamIds.push(teamId);
            await GamerProfile.update(friendProfile.id, { team_ids: teamIds });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
    }
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  if (isLoading || !team) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Users className="w-12 h-12 text-gray-600 animate-pulse" />
        </div>
      </GamerLayout>
    );
  }

  const isMember = team.members?.includes(user?.id);
  const isLeader = team.leader_id === user?.id;
  const hasPendingRequest = team.join_requests?.some(r => r.user_id === user?.id && r.status === 'pending');
  const pendingRequests = team.join_requests?.filter(r => r.status === 'pending') || [];

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Header */}
      <FloatingPanel className="p-6 mb-6" glowBorder>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
            {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : <Users className="w-12 h-12 text-red-500" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{team.name}</h1>
              {team.is_recruiting && <HexBadge className="bg-green-500/20 text-green-400 border-green-500/50">Recruiting</HexBadge>}
            </div>
            <p className="text-gray-400 mb-4">{team.description || 'No description'}</p>
            <div className="flex flex-wrap gap-2">
              {team.games?.map((game, i) => (
                <span key={i} className="text-xs bg-zinc-800 text-gray-300 px-3 py-1 rounded-full">{game}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {!isMember && !hasPendingRequest && team.is_recruiting && (
              <GlowButton onClick={() => setShowJoinModal(true)}>
                <UserPlus className="w-4 h-4" /> Request to Join
              </GlowButton>
            )}
            {hasPendingRequest && (
              <HexBadge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">Request Pending</HexBadge>
            )}
            {isLeader && (
              <GlowButton variant="secondary" onClick={() => setShowInviteFriendsModal(true)}>
                <UserPlus className="w-4 h-4" /> Invite Friends
              </GlowButton>
            )}
          </div>
        </div>
      </FloatingPanel>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 mb-6 flex-wrap">
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          {isMember && <TabsTrigger value="chat">Team Chat</TabsTrigger>}
          {isLeader && (
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length + (team.tournament_invites?.filter(i => i.status === 'pending')?.length || 0)})
            </TabsTrigger>
          )}
          <TabsTrigger value="history">Tournament History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Link key={member.id} to={`/gamer/$\{member.user_id}`}>
                <GameCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden">
                      {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <Users className="w-7 h-7 text-red-500 m-auto mt-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold truncate">{member.username}</p>
                        {member.user_id === team.leader_id && <Crown className="w-4 h-4 text-yellow-500" />}
                      </div>
                      {member.games?.length > 0 && (
                        <p className="text-gray-500 text-sm truncate">{member.games[0]?.game_name} • {member.games[0]?.rank}</p>
                      )}
                    </div>
                  </div>
                </GameCard>
              </Link>
            ))}
          </div>
        </TabsContent>

        {isMember && (
          <TabsContent value="chat">
            <FloatingPanel className="p-6">
              <h3 className="text-white font-bold mb-4">Team Chat</h3>
              <div className="h-64 overflow-y-auto bg-zinc-950 rounded-lg p-4 mb-4 space-y-3">
                {team.chat_messages?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-red-600' : 'bg-zinc-800'}`}>
                      <p className="text-xs text-gray-400 mb-1">{msg.sender_name}</p>
                      <p className="text-white">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {(!team.chat_messages || team.chat_messages.length === 0) && (
                  <p className="text-gray-500 text-center">No messages yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && newMessage && sendMessageMutation.mutate(newMessage)}
                />
                <GlowButton onClick={() => newMessage && sendMessageMutation.mutate(newMessage)}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </FloatingPanel>
          </TabsContent>
        )}

        {isLeader && (
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Tournament Invites Section */}
              {team.tournament_invites?.filter(i => i.status === 'pending').length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" /> Tournament Invites
                  </h3>
                  <div className="space-y-3">
                    {team.tournament_invites?.filter(i => i.status === 'pending').map((invite, i) => {
                      const tournament = tournaments.find(t => t.id === invite.tournament_id);
                      const inviter = allProfiles.find(p => p.user_id === invite.invited_by);
                      const isOrganizerInvite = tournament?.organizer_id === invite.invited_by;
                      
                      return (
                        <FloatingPanel key={i} className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium">{tournament?.name || 'Tournament Invite'}</p>
                              <p className="text-gray-400 text-sm">{tournament?.game || 'Unknown Game'}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {isOrganizerInvite ? (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                    Invited by Organizer
                                  </span>
                                ) : (
                                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                    Invited by {inviter?.username || 'Team Member'}
                                  </span>
                                )}
                              </div>
                              {tournament?.schedule && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Scheduled: {new Date(tournament.schedule).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <GlowButton size="sm" onClick={async () => {
                                const invites = team.tournament_invites.map(inv => 
                                  inv.tournament_id === invite.tournament_id ? { ...inv, status: 'accepted' } : inv
                                );
                                await Team.update(teamId, { tournament_invites: invites });
                                // Add team to tournament
                                if (tournament) {
                                  const tournamentTeams = [...(tournament.teams || []), teamId];
                                  await Tournament.update(invite.tournament_id, { teams: tournamentTeams });
                                }
                                queryClient.invalidateQueries(['team', teamId]);
                              }}>
                                <Check className="w-4 h-4" /> Accept
                              </GlowButton>
                              <GlowButton variant="ghost" size="sm" onClick={async () => {
                                const invites = team.tournament_invites.map(inv => 
                                  inv.tournament_id === invite.tournament_id ? { ...inv, status: 'rejected' } : inv
                                );
                                await Team.update(teamId, { tournament_invites: invites });
                                queryClient.invalidateQueries(['team', teamId]);
                              }}>
                                <X className="w-4 h-4" /> Reject
                              </GlowButton>
                            </div>
                          </div>
                        </FloatingPanel>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Member Join Requests Section */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" /> Member Join Requests
                </h3>
                {pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request, i) => (
                      <FloatingPanel key={i} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">New Member Request</p>
                            <p className="text-gray-500 text-sm">Game: {request.game} • ID: {request.game_id} • Rank: {request.rank}</p>
                          </div>
                          <div className="flex gap-2">
                            <GlowButton size="sm" onClick={() => approveRequestMutation.mutate(team.join_requests.indexOf(request))}>
                              <Check className="w-4 h-4" /> Approve
                            </GlowButton>
                            <GlowButton variant="ghost" size="sm" onClick={() => rejectRequestMutation.mutate(team.join_requests.indexOf(request))}>
                              <X className="w-4 h-4" /> Reject
                            </GlowButton>
                          </div>
                        </div>
                      </FloatingPanel>
                    ))}
                  </div>
                ) : (
                  <FloatingPanel className="p-8 text-center">
                    <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                    <p className="text-gray-500">No pending member requests</p>
                  </FloatingPanel>
                )}
              </div>
            </div>
          </TabsContent>
        )}

        <TabsContent value="history">
          {team.tournament_history?.length > 0 ? (
            <div className="space-y-3">
              {team.tournament_history.map((t, i) => (
                <Link key={i} to={`/tournaments/$\{t.tournament_id}`}>
                  <FloatingPanel className="p-4 hover:border-red-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trophy className={`w-6 h-6 ${t.placement === 1 ? 'text-yellow-500' : t.placement === 2 ? 'text-gray-300' : t.placement === 3 ? 'text-orange-500' : 'text-gray-500'}`} />
                        <div>
                          <p className="text-white font-bold">{t.tournament_name}</p>
                          <p className="text-gray-500 text-xs">{t.completed_at ? new Date(t.completed_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                      <HexBadge className={
                        t.placement === 1 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                        t.placement === 2 ? 'bg-gray-300/20 text-gray-300 border-gray-300/50' :
                        t.placement === 3 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : ''
                      }>#{t.placement}</HexBadge>
                    </div>
                  </FloatingPanel>
                </Link>
              ))}
            </div>
          ) : (
            <FloatingPanel className="p-12 text-center">
              <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-400">No tournament history yet</p>
            </FloatingPanel>
          )}
        </TabsContent>

        <TabsContent value="achievements">
          <div className="grid md:grid-cols-3 gap-4">
            <FloatingPanel className="p-6 text-center">
              <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">
                {team.tournament_history?.filter(t => t.placement === 1).length || 0}
              </p>
              <p className="text-gray-400 text-sm">1st Place Wins</p>
            </FloatingPanel>
            <FloatingPanel className="p-6 text-center">
              <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">
                {team.tournament_history?.filter(t => t.placement <= 3).length || 0}
              </p>
              <p className="text-gray-400 text-sm">Top 3 Finishes</p>
            </FloatingPanel>
            <FloatingPanel className="p-6 text-center">
              <Trophy className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">
                {team.tournament_history?.length || 0}
              </p>
              <p className="text-gray-400 text-sm">Tournaments Played</p>
            </FloatingPanel>
          </div>
        </TabsContent>
      </Tabs>

      {/* Join Request Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Request to Join {team.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game</label>
              <Select value={joinRequest.game} onValueChange={(v) => setJoinRequest({ ...joinRequest, game: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game ID / Username</label>
              <Input value={joinRequest.game_id} onChange={(e) => setJoinRequest({ ...joinRequest, game_id: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Rank</label>
              <Select value={joinRequest.rank} onValueChange={(v) => setJoinRequest({ ...joinRequest, rank: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select rank" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <GlowButton className="w-full" onClick={() => joinRequestMutation.mutate()} disabled={!joinRequest.game || !joinRequest.game_id}>
              <Send className="w-4 h-4" /> Submit Request
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Friends Modal */}
      <Dialog open={showInviteFriendsModal} onOpenChange={setShowInviteFriendsModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Invite Friends to Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {friends.filter(f => !team.members?.includes(f.user_id)).map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                    {friend.avatar ? <img src={friend.avatar} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-red-500 m-auto mt-2" />}
                  </div>
                  <span className="text-white">{friend.username}</span>
                </div>
                <GlowButton size="sm" onClick={() => inviteFriendMutation.mutate(friend.user_id)}>
                  <UserPlus className="w-4 h-4" /> Invite
                </GlowButton>
              </div>
            ))}
            {friends.filter(f => !team.members?.includes(f.user_id)).length === 0 && (
              <p className="text-gray-500 text-center py-8">No friends available to invite</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}