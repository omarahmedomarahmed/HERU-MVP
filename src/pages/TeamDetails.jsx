import React, { useState, useEffect } from 'react'; // useEffect kept for settings form
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import {
  Users, Trophy, MessageSquare, Send, UserPlus, Check, X, Crown,
  Shield, Settings, ArrowLeft, Gamepad2, Edit2, Save, Trash2, Upload, Loader2
} from 'lucide-react';

import { GamerProfile, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'
import { useToast } from '@/components/ui/use-toast'

import { useGames } from '@/hooks/useGames';
const RANKS = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Radiant', 'Global Elite'];
const TEAM_ROLES = ['Player', 'Coach', 'Manager', 'Analyst', 'Sub', 'Content Creator'];

export default function TeamDetails() {
  const GAMES = useGames();
  const { user } = useAuth();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteFriendsModal, setShowInviteFriendsModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(null); // member object
  const [joinRequest, setJoinRequest] = useState({ game: '', game_id: '', rank: '' });
  const [newMessage, setNewMessage] = useState('');
  const [editingSettings, setEditingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({});
  const [uploadingField, setUploadingField] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { id: teamId } = useParams();

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
    queryFn: () => Team.get(teamId),
    enabled: !!teamId,
  });

  const { data: memberDetails = [] } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      try {
        const res = await apiCall(`/teams/${teamId}/members`);
        return res || [];
      } catch {
        // Fallback: fetch all profiles and filter
        if (!team?.members?.length) return [];
        const profiles = await GamerProfile.list();
        return profiles.filter(p => team.members.includes(p.user_id)).map(p => ({
          ...p,
          role: 'Player',
        }));
      }
    },
    enabled: !!teamId && !!team,
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

  const { data: tournaments = [] } = useQuery({
    queryKey: ['tournaments-for-invites', team?.tournament_invites],
    queryFn: async () => {
      if (!team?.tournament_invites?.length) return [];
      const allTournaments = await Tournament.list();
      return allTournaments;
    },
    enabled: !!team?.tournament_invites?.length,
  });

  // Initialize settings form when team loads
  useEffect(() => {
    if (team) {
      setSettingsForm({
        description: team.description || '',
        is_recruiting: team.is_recruiting ?? true,
        contact_number: team.contact_number || '',
      });
    }
  }, [team]);

  const joinRequestMutation = useMutation({
    mutationFn: async () => {
      await Team.joinRequest(teamId, {
        username: profile?.username || user.full_name,
        message: joinRequest.game ? `Game: ${joinRequest.game}, Rank: ${joinRequest.rank || 'N/A'}` : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      setShowJoinModal(false);
      setJoinRequest({ game: '', game_id: '', rank: '' });
      toast({ title: 'Request sent', description: 'Your join request has been sent to the team leader.' });
    },
    onError: (err) => {
      toast({ title: 'Join failed', description: err.message || 'Could not send join request.', variant: 'destructive' });
    }
  });

  const approveRequestMutation = useMutation({
    mutationFn: async (requestIndex) => {
      const request = team.join_requests[requestIndex];
      await Team.handleJoinRequest(teamId, request.id, { status: 'approved' });

      // Update joiner's profile
      try {
        const joinerProfiles = await GamerProfile.list({ user_id: request.user_id });
        if (joinerProfiles.length > 0) {
          const joinerProfile = joinerProfiles[0];
          const teamIds = [...(joinerProfile.team_ids || [])];
          if (!teamIds.includes(teamId)) {
            teamIds.push(teamId);
            await GamerProfile.update(joinerProfile.id, { team_ids: teamIds });
          }
        }
      } catch (e) { console.warn('Could not update joiner profile:', e); }

      // coin reward pending server-side implementation
    },
    onSuccess: () => queryClient.invalidateQueries(['team', teamId])
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async (requestIndex) => {
      const request = team.join_requests[requestIndex];
      await Team.handleJoinRequest(teamId, request.id, { status: 'rejected' });
    },
    onSuccess: () => queryClient.invalidateQueries(['team', teamId])
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      await apiCall(`/teams/${teamId}/members/${userId}/role`, {
        method: 'PUT',
        body: { role },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members', teamId]);
      setShowRoleModal(null);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId) => {
      const updatedMembers = (team.members || []).filter(m => m !== userId);
      await Team.update(teamId, { members: updatedMembers });

      // Remove team from member's profile
      const memberProfiles = await GamerProfile.list({ user_id: userId });
      if (memberProfiles.length > 0) {
        const mp = memberProfiles[0];
        const teamIds = (mp.team_ids || []).filter(tid => tid !== teamId);
        await GamerProfile.update(mp.id, { team_ids: teamIds });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      queryClient.invalidateQueries(['team-members', teamId]);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const msgObj = {
        sender_id: user.id,
        sender_name: profile?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member',
        message,
        timestamp: new Date().toISOString()
      };
      await apiCall(`/teams/${teamId}/chat`, { method: 'POST', body: msgObj });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      setNewMessage('');
    }
  });

  const inviteFriendMutation = useMutation({
    mutationFn: async (friendId) => {
      const newMembers = [...(team.members || [])];
      if (!newMembers.includes(friendId)) {
        newMembers.push(friendId);
        await Team.update(teamId, { members: newMembers });

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
    onSuccess: () => queryClient.invalidateQueries(['team', teamId])
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => Team.update(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      setEditingSettings(false);
      toast({ title: 'Settings saved!' });
    }
  });

  const handleTeamImageUpload = async (file, field) => {
    if (!file) return;
    setUploadingField(field);
    try {
      const { file_url } = await uploadFile(file);
      if (field === 'logo') {
        await Team.update(teamId, { logo: file_url });
      } else if (field === 'banner') {
        const images = [file_url, ...(team.images || []).slice(1)];
        await Team.update(teamId, { images });
      }
      queryClient.invalidateQueries(['team', teamId]);
      toast({ title: `${field === 'logo' ? 'Logo' : 'Banner'} updated!` });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingField(null);
    }
  };

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  if (isLoading || !team) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      </GamerLayout>
    );
  }

  const isMember = team.members?.includes(user?.id);
  const isLeader = team.leader_id === user?.id;
  const hasPendingRequest = team.join_requests?.some(r => r.user_id === user?.id && r.status === 'pending');
  const pendingRequests = team.join_requests?.filter(r => r.status === 'pending') || [];
  const pendingInvites = team.tournament_invites?.filter(i => i.status === 'pending') || [];

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Back nav */}
      <button
        onClick={() => navigate('/gamer/teams')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> My Teams
      </button>

      {/* Header */}
      <FloatingPanel className="p-6 mb-6" glowBorder>
        {/* Banner */}
        {team.images?.[0] && (
          <div className="h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
            <img src={team.images[0]} alt="" className="w-full h-full object-cover opacity-60" />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {team.logo ? <img src={team.logo} className="w-full h-full object-cover" alt="" /> : <Users className="w-10 h-10 text-red-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black text-white">{team.name}</h1>
              {team.is_recruiting && (
                <HexBadge className="bg-green-500/20 text-green-400 border-green-500/50">Recruiting</HexBadge>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">{team.description || 'No description'}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {team.games?.map((game, i) => (
                <span key={i} className="text-xs bg-zinc-800 text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
                  <Gamepad2 className="w-3 h-3" /> {game}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {team.members?.length || 0} members</span>
              <span className="flex items-center gap-1"><Trophy className="w-4 h-4" /> {team.tournament_history?.length || 0} tournaments</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            {user && !isMember && !hasPendingRequest && team.is_recruiting && (
              <GlowButton onClick={() => setShowJoinModal(true)}>
                <UserPlus className="w-4 h-4" /> Request to Join
              </GlowButton>
            )}
            {!user && team.is_recruiting && (
              <GlowButton onClick={() => navigate('/auth/gamer/login')}>
                <UserPlus className="w-4 h-4" /> Log in to Join
              </GlowButton>
            )}
            {hasPendingRequest && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Check className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">Request Sent</span>
              </div>
            )}
            {isLeader && (
              <>
                <GlowButton variant="secondary" onClick={() => setEditingSettings(true)}>
                  <Edit2 className="w-4 h-4" /> Edit Team
                </GlowButton>
                <GlowButton variant="secondary" onClick={() => setShowInviteFriendsModal(true)}>
                  <UserPlus className="w-4 h-4" /> Invite
                </GlowButton>
              </>
            )}
          </div>
        </div>
      </FloatingPanel>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap p-1">
          <TabsTrigger value="members" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Users className="w-4 h-4 mr-1" /> Members
          </TabsTrigger>
          {isMember && (
            <TabsTrigger value="chat" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              <MessageSquare className="w-4 h-4 mr-1" /> Chat
            </TabsTrigger>
          )}
          {isLeader && (
            <TabsTrigger value="requests" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              Requests {(pendingRequests.length + pendingInvites.length) > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {pendingRequests.length + pendingInvites.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Trophy className="w-4 h-4 mr-1" /> History
          </TabsTrigger>
          {isLeader && (
            <TabsTrigger value="settings" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              <Settings className="w-4 h-4 mr-1" /> Settings
            </TabsTrigger>
          )}
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {memberDetails.map((member, i) => (
              <motion.div
                key={member.id || member.user_id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GameCard className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-7 h-7 text-red-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold truncate">{member.username || 'Member'}</p>
                        {member.user_id === team.leader_id && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500">
                        <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-gray-400">
                          {member.role || 'Player'}
                        </span>
                      </p>
                      {member.games?.length > 0 && (
                        <p className="text-gray-600 text-xs mt-1 truncate">
                          {member.games[0]?.game_name} {member.games[0]?.rank && `· ${member.games[0].rank}`}
                        </p>
                      )}
                    </div>
                    {isLeader && member.user_id !== user?.id && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setShowRoleModal(member)}
                          className="p-1.5 text-gray-500 hover:text-white transition-colors rounded"
                          title="Change role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.username} from team?`)) {
                              removeMemberMutation.mutate(member.user_id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                          title="Remove member"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </GameCard>
              </motion.div>
            ))}
          </div>
          {memberDetails.length === 0 && (
            <FloatingPanel className="p-12 text-center">
              <Users className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400">No members found</p>
            </FloatingPanel>
          )}
        </TabsContent>

        {/* Chat Tab */}
        {isMember && (
          <TabsContent value="chat">
            <FloatingPanel className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-500" /> Team Chat
              </h3>
              <div className="h-80 overflow-y-auto bg-zinc-950 rounded-lg p-4 mb-4 space-y-3">
                {team.chat_messages?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-red-600' : 'bg-zinc-800'}`}>
                      <p className="text-xs text-gray-400 mb-1">{msg.sender_name}</p>
                      <p className="text-white text-sm">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {(!team.chat_messages || team.chat_messages.length === 0) && (
                  <p className="text-gray-500 text-center py-12">No messages yet. Start the conversation!</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && newMessage.trim() && sendMessageMutation.mutate(newMessage)}
                />
                <GlowButton onClick={() => newMessage.trim() && sendMessageMutation.mutate(newMessage)}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </FloatingPanel>
          </TabsContent>
        )}

        {/* Requests Tab */}
        {isLeader && (
          <TabsContent value="requests">
            <div className="space-y-6">
              {/* Tournament Invites */}
              {pendingInvites.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" /> Tournament Invites
                  </h3>
                  <div className="space-y-3">
                    {pendingInvites.map((invite, i) => {
                      const tournament = tournaments.find(t => t.id === invite.tournament_id);
                      return (
                        <FloatingPanel key={i} className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-white font-medium">{tournament?.name || 'Tournament Invite'}</p>
                              <p className="text-gray-400 text-sm">{tournament?.game || 'Unknown Game'}</p>
                              {tournament?.schedule && (
                                <p className="text-gray-500 text-xs mt-1">
                                  {new Date(tournament.schedule).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <GlowButton size="sm" onClick={async () => {
                                const invites = team.tournament_invites.map(inv =>
                                  inv.tournament_id === invite.tournament_id ? { ...inv, status: 'accepted' } : inv
                                );
                                await Team.update(teamId, { tournament_invites: invites });
                                if (tournament) {
                                  const tournamentTeams = [...(tournament.teams || []), teamId];
                                  await Tournament.update(invite.tournament_id, { teams: tournamentTeams });
                                }
                                queryClient.invalidateQueries(['team', teamId]);
                              }}>
                                <Check className="w-4 h-4" />
                              </GlowButton>
                              <GlowButton variant="ghost" size="sm" onClick={async () => {
                                const invites = team.tournament_invites.map(inv =>
                                  inv.tournament_id === invite.tournament_id ? { ...inv, status: 'rejected' } : inv
                                );
                                await Team.update(teamId, { tournament_invites: invites });
                                queryClient.invalidateQueries(['team', teamId]);
                              }}>
                                <X className="w-4 h-4" />
                              </GlowButton>
                            </div>
                          </div>
                        </FloatingPanel>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Member Join Requests */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-500" /> Member Requests
                </h3>
                {pendingRequests.length > 0 ? (
                  <div className="space-y-3">
                    {pendingRequests.map((request, i) => {
                      const reqIdx = team.join_requests.indexOf(request);
                      return (
                        <FloatingPanel key={i} className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-white font-medium">{request.username || 'Unknown'}</p>
                              <p className="text-gray-500 text-sm">
                                {request.game} · ID: {request.game_id} · {request.rank}
                              </p>
                              {request.requested_at && (
                                <p className="text-gray-600 text-xs mt-0.5">
                                  {new Date(request.requested_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <GlowButton size="sm" onClick={() => approveRequestMutation.mutate(reqIdx)}>
                                <Check className="w-4 h-4" /> Approve
                              </GlowButton>
                              <GlowButton variant="ghost" size="sm" onClick={() => rejectRequestMutation.mutate(reqIdx)}>
                                <X className="w-4 h-4" />
                              </GlowButton>
                            </div>
                          </div>
                        </FloatingPanel>
                      );
                    })}
                  </div>
                ) : (
                  <FloatingPanel className="p-8 text-center">
                    <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                    <p className="text-gray-500">No pending requests</p>
                  </FloatingPanel>
                )}
              </div>
            </div>
          </TabsContent>
        )}

        {/* Tournament History Tab */}
        <TabsContent value="history">
          {team.tournament_history?.length > 0 ? (
            <div className="space-y-3">
              {team.tournament_history.map((t, i) => (
                <Link key={i} to={`/tournaments/${t.tournament_id}`}>
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
                        t.placement === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                        t.placement === 2 ? 'bg-gray-300/20 text-gray-300' :
                        t.placement === 3 ? 'bg-orange-500/20 text-orange-400' : ''
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
              <Link to="/tournaments" className="inline-block mt-3">
                <GlowButton variant="secondary" size="sm">Browse Tournaments</GlowButton>
              </Link>
            </FloatingPanel>
          )}

          {/* Team Stats */}
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <FloatingPanel className="p-5 text-center">
              <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">
                {team.tournament_history?.filter(t => t.placement === 1).length || 0}
              </p>
              <p className="text-gray-500 text-sm">1st Place</p>
            </FloatingPanel>
            <FloatingPanel className="p-5 text-center">
              <Trophy className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">
                {team.tournament_history?.filter(t => t.placement <= 3).length || 0}
              </p>
              <p className="text-gray-500 text-sm">Top 3</p>
            </FloatingPanel>
            <FloatingPanel className="p-5 text-center">
              <Gamepad2 className="w-10 h-10 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">
                {team.tournament_history?.length || 0}
              </p>
              <p className="text-gray-500 text-sm">Played</p>
            </FloatingPanel>
          </div>
        </TabsContent>

        {/* Settings Tab (Leader only) */}
        {isLeader && (
          <TabsContent value="settings">
            <FloatingPanel className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> Team Settings
              </h3>
              <div className="space-y-4">
                {/* Logo & Banner Upload */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Team Logo</label>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center">
                        {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-8 h-8 text-zinc-600" />}
                      </div>
                      <label className="cursor-pointer">
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs rounded-lg transition-colors">
                          {uploadingField === 'logo' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {uploadingField === 'logo' ? 'Uploading...' : 'Upload'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleTeamImageUpload(e.target.files[0], 'logo')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Banner Image</label>
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-full h-16 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center">
                        {team.images?.[0] ? <img src={team.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="text-zinc-600 text-xs">No banner</span>}
                      </div>
                      <label className="cursor-pointer">
                        <span className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-xs rounded-lg transition-colors">
                          {uploadingField === 'banner' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {uploadingField === 'banner' ? 'Uploading...' : 'Upload'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleTeamImageUpload(e.target.files[0], 'banner')} />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-1">Description</label>
                  <Input
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Contact Number</label>
                  <Input
                    value={settingsForm.contact_number}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contact_number: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    placeholder="e.g. +20 123 456 7890"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settingsForm.is_recruiting}
                    onCheckedChange={(v) => setSettingsForm({ ...settingsForm, is_recruiting: v })}
                  />
                  <label className="text-white">Open for recruiting</label>
                </div>
                <GlowButton onClick={() => updateSettingsMutation.mutate(settingsForm)}>
                  <Save className="w-4 h-4" /> Save Settings
                </GlowButton>
              </div>
            </FloatingPanel>
          </TabsContent>
        )}
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
            <GlowButton
              className="w-full"
              onClick={() => joinRequestMutation.mutate()}
              disabled={!joinRequest.game || !joinRequest.game_id || joinRequestMutation.isPending}
            >
              {joinRequestMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </span>
              ) : (
                <><Send className="w-4 h-4" /> Submit Request</>
              )}
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Modal */}
      <Dialog open={!!showRoleModal} onOpenChange={() => setShowRoleModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Assign Role — {showRoleModal?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-gray-400 text-sm mb-3">Select a role for this team member:</p>
            <div className="grid grid-cols-2 gap-2">
              {TEAM_ROLES.map(role => (
                <button
                  key={role}
                  onClick={() => updateRoleMutation.mutate({ userId: showRoleModal?.user_id, role })}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors border
                    ${showRoleModal?.role === role
                      ? 'border-red-500 bg-red-500/20 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500 block mb-1">Custom Label</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. IGL, Flex"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      updateRoleMutation.mutate({ userId: showRoleModal?.user_id, role: e.target.value.trim() });
                    }
                  }}
                />
              </div>
            </div>
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
                    {friend.avatar ? (
                      <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  <span className="text-white">{friend.username}</span>
                </div>
                <GlowButton size="sm" onClick={() => inviteFriendMutation.mutate(friend.user_id)}>
                  <UserPlus className="w-4 h-4" />
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
