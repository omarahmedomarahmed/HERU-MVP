import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Users, Trophy, Twitter, Instagram, MessageSquare, Crown, UserPlus, Phone, Send, ArrowLeft
} from 'lucide-react';

const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Apex Legends'];
const RANKS = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Radiant', 'Global Elite'];

export default function TeamProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRequest, setJoinRequest] = useState({ game: '', game_id: '', rank: '' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => Team.get(id),
    enabled: !!id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['team-members', team?.members],
    queryFn: async () => {
      if (!team?.members?.length) return [];
      const all = await GamerProfile.list();
      return all.filter(p => team.members.includes(p.user_id));
    },
    enabled: !!team?.members?.length,
  });

  const joinRequestMutation = useMutation({
    mutationFn: async () => {
      const requests = [...(team.join_requests || []), {
        user_id: user.id,
        ...joinRequest,
        status: 'pending'
      }];
      await Team.update(id, { join_requests: requests });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      setShowJoinModal(false);
      setJoinRequest({ game: '', game_id: '', rank: '' });
    }
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  if (isLoading) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GamerLayout>
    );
  }

  if (!team) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <FloatingPanel className="p-16 text-center">
          <Users className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Team Not Found</h2>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  const isLeader = user?.id === team.leader_id;
  const isMember = team.members?.includes(user?.id);
  const hasPendingRequest = team.join_requests?.some(r => r.user_id === user?.id && r.status === 'pending');
  const bannerImage = team.images?.[0];

  const placementColor = (p) => p === 1 ? 'text-yellow-500' : p === 2 ? 'text-gray-300' : p === 3 ? 'text-orange-500' : 'text-gray-500';
  const placementBg = (p) => p === 1 ? 'bg-yellow-500/20 text-yellow-400' : p === 2 ? 'bg-gray-400/20 text-gray-300' : p === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-700 text-gray-400';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AnimatedBackground />
      
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <HeruLogo className="h-7" />
          </Link>
          <Link to="/teams" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Teams</span>
          </Link>
        </div>
      </header>

      <main className="pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
      {/* Banner */}
      <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-zinc-800 to-zinc-950">
        {bannerImage && <img src={bannerImage} className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
      </div>

      {/* Team Header */}
      <FloatingPanel className="p-6 mb-6 -mt-16 relative z-10" glowBorder>
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700 shrink-0">
            {team.logo ? <img src={team.logo} className="w-full h-full object-cover" /> : <Users className="w-12 h-12 text-red-500" />}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-white">{team.name}</h1>
              {team.is_recruiting && (
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 rounded-full font-medium">Recruiting</span>
              )}
            </div>
            {team.description && <p className="text-gray-400 mb-3">{team.description}</p>}
            <div className="flex flex-wrap gap-2 mb-3">
              {team.games?.map((g, i) => (
                <span key={i} className="text-xs bg-zinc-800 text-gray-300 px-3 py-1 rounded-full">{g}</span>
              ))}
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {team.social_links?.twitter && (
                <a href={team.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {team.social_links?.instagram && (
                <a href={team.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {team.social_links?.discord && (
                <a href={team.social_links.discord} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-400 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </a>
              )}
              {team.is_recruiting && team.contact_number && (
                <span className="flex items-center gap-1 text-gray-400 text-sm">
                  <Phone className="w-4 h-4" /> {team.contact_number}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {isLeader && (
              <Link to={`/gamer/teams/${id}`}>
                <GlowButton variant="secondary" size="sm">Manage Team</GlowButton>
              </Link>
            )}
            {!isLeader && !isMember && !hasPendingRequest && team.is_recruiting && user && (
              <GlowButton onClick={() => setShowJoinModal(true)}>
                <UserPlus className="w-4 h-4" /> Send Join Request
              </GlowButton>
            )}
            {hasPendingRequest && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-2 rounded text-center">Request Pending</span>
            )}
          </div>
        </div>
      </FloatingPanel>

      {/* Story */}
      {team.story && (
        <FloatingPanel className="p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Our Story</h2>
          <p className="text-gray-400 leading-relaxed">{team.story}</p>
        </FloatingPanel>
      )}

      {/* Members */}
      <FloatingPanel className="p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" /> Members ({members.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {members.map(member => (
            <Link key={member.id} to={`/gamer/${member.user_id}`}>
              <GameCard className="p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden mx-auto mb-2">
                  {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : <Users className="w-7 h-7 text-red-500 mx-auto mt-3" />}
                </div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-white text-sm font-medium truncate">{member.username}</p>
                  {member.user_id === team.leader_id && <Crown className="w-3 h-3 text-yellow-500 shrink-0" />}
                </div>
                {member.games?.[0] && (
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{member.games[0].game_name}</p>
                )}
              </GameCard>
            </Link>
          ))}
        </div>
      </FloatingPanel>

      {/* Tournament History */}
      {team.tournament_history?.length > 0 && (
        <FloatingPanel className="p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Tournament History
          </h2>
          <div className="space-y-3">
            {team.tournament_history.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className={`w-5 h-5 ${placementColor(t.placement)}`} />
                  <div>
                    <p className="text-white font-medium">{t.tournament_name}</p>
                    {t.completed_at && <p className="text-gray-500 text-xs">{new Date(t.completed_at).toLocaleDateString()}</p>}
                  </div>
                </div>
                {t.placement && (
                  <span className={`text-sm font-bold px-2 py-1 rounded ${placementBg(t.placement)}`}>#{t.placement}</span>
                )}
              </div>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* Image Gallery */}
      {team.images?.length > 0 && (
        <FloatingPanel className="p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Gallery</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {team.images.map((url, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-zinc-800">
                <img src={url} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* Join Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Send Join Request — {team.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game</label>
              <Select value={joinRequest.game} onValueChange={v => setJoinRequest({ ...joinRequest, game: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select game" /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {GAMES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game ID / Username</label>
              <Input value={joinRequest.game_id} onChange={e => setJoinRequest({ ...joinRequest, game_id: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Rank</label>
              <Select value={joinRequest.rank} onValueChange={v => setJoinRequest({ ...joinRequest, rank: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Select rank" /></SelectTrigger>
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
      </div>
      </main>
    </div>
  );
}