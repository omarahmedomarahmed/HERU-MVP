import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { GamerProfile as GamerProfileAPI, Order, Team, Achievement, ApprovalRequest, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'

import {
  User, Edit2, Save, X, Gamepad2, Users, Star,
  Package, Plus, Trash2, LogOut, Briefcase, Trophy,
  Swords, TrendingUp, Crown, Shield, Medal, Award,
  Target, Lock, ShoppingBag
} from 'lucide-react';

// Achievement icon mapping
const ACHIEVEMENT_ICONS = {
  wins: Trophy,
  tournaments_played: Swords,
  tournaments_won: Crown,
  teams_created: Shield,
  teams_joined: Users,
};

// Achievement rarity colors
const RARITY_COLORS = {
  common: 'from-zinc-500/20 to-zinc-700/20 border-zinc-600/30',
  uncommon: 'from-green-500/20 to-green-700/20 border-green-600/30',
  rare: 'from-blue-500/20 to-blue-700/20 border-blue-600/30',
  epic: 'from-purple-500/20 to-purple-700/20 border-purple-600/30',
  legendary: 'from-yellow-500/20 to-red-500/20 border-yellow-500/30',
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

export default function GamerProfile() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [addGameModal, setAddGameModal] = useState(false);
  const [talentModal, setTalentModal] = useState(false);
  const [orderChatModal, setOrderChatModal] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGame, setNewGame] = useState({ game_name: '', game_id: '', rank: '' });
  const [talentForm, setTalentForm] = useState({ talent_type: '', talent_price: '', talent_video_link: '' });
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState('');
  const [slugSuccess, setSlugSuccess] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [becomeOrgModal, setBecomeOrgModal] = useState(false);
  const [orgForm, setOrgForm] = useState({ brand_name: '', full_name: '', contact_number: '', website: '', facebook: '', instagram: '' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      // /auth/me returns { user: { id, email, ... }, gamer_profile: {...} }
      const u = userData?.user || userData;
      setUser({
        id: u.id,
        email: u.email,
        full_name: u.full_name || u.email?.split('@')[0] || '',
        role: u.role,
      });
    } catch (e) {
      navigate('/auth/gamer/login');
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfileAPI.list({ user_id: user.id });
      if (profiles.length === 0) {
        const newProfile = await GamerProfileAPI.create({
          user_id: user.id,
          username: user.full_name || user.email?.split('@')[0] || 'Gamer',
          games: [],
          team_ids: [],
          purchased_items: [],
          notifications: [],
        });
        return newProfile;
      }
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['gamer-stats', user?.id],
    queryFn: () => GamerProfileAPI.stats(user.id),
    enabled: !!user?.id,
  });

  // Fetch earned achievements
  const { data: earnedAchievements = [] } = useQuery({
    queryKey: ['gamer-achievements', user?.id],
    queryFn: () => GamerProfileAPI.achievements(user.id),
    enabled: !!user?.id,
  });

  // Fetch all achievement definitions (to show locked ones)
  const { data: allAchievements = [] } = useQuery({
    queryKey: ['achievements-all'],
    queryFn: () => Achievement.list(),
  });

  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
      });
      setSlugInput(profile.username_slug || '');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => GamerProfileAPI.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setEditing(false);
    }
  });

  const addGameMutation = useMutation({
    mutationFn: async (game) => {
      const games = [...(profile.games || []), game];
      return GamerProfileAPI.updateMe({ games });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setAddGameModal(false);
      setNewGame({ game_name: '', game_id: '', rank: '' });
    }
  });

  const removeGameMutation = useMutation({
    mutationFn: async (index) => {
      const games = [...(profile.games || [])];
      games.splice(index, 1);
      return GamerProfileAPI.updateMe({ games });
    },
    onSuccess: () => queryClient.invalidateQueries(['gamer-profile', user?.id])
  });

  const applyTalentMutation = useMutation({
    mutationFn: async (data) => GamerProfileAPI.applyTalent(data),
    onSuccess: () => {
      setTalentModal(false);
      setTalentForm({ talent_type: '', talent_price: '', talent_video_link: '' });
    }
  });

  const updateSlugMutation = useMutation({
    mutationFn: async (slug) => {
      const cleaned = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleaned.length < 3) throw new Error('Username must be at least 3 characters');
      // Check for duplicates via API
      const existing = await GamerProfileAPI.list({ username_slug: cleaned });
      if (existing.length > 0 && existing[0].user_id !== user?.id) {
        throw new Error('This username is already taken');
      }
      return GamerProfileAPI.updateMe({ username_slug: cleaned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setSlugError('');
      setSlugSuccess('Profile link updated!');
      setTimeout(() => setSlugSuccess(''), 3000);
    },
    onError: (err) => {
      setSlugError(err.message);
      setSlugSuccess('');
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      await GamerProfileAPI.updateMe({ avatar: file_url });
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const becomeOrganizerMutation = useMutation({
    mutationFn: async (data) => {
      return ApprovalRequest.create({
        approval_type: 'organizer_profile',
        requester_id: user.id,
        requester_name: profile?.username || user?.full_name,
        requester_email: user?.email,
        reference_id: user.id,
        reference_name: data.brand_name,
        details: data,
        status: 'pending',
      });
    },
    onSuccess: () => {
      setBecomeOrgModal(false);
      setOrgForm({ brand_name: '', full_name: '', contact_number: '', website: '', facebook: '', instagram: '' });
    }
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['my-teams', profile?.team_ids],
    queryFn: async () => {
      if (!profile?.team_ids?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => profile.team_ids.includes(t.id));
    },
    enabled: !!profile?.team_ids?.length,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return Order.list({ gamer_id: user.id }, '-created_date');
    },
    enabled: !!user?.id,
  });

  const sendOrderMessageMutation = useMutation({
    mutationFn: async ({ orderId, message }) => {
      const order = orders.find(o => o.id === orderId);
      const msgObj = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        sender_role: 'gamer',
        message,
        timestamp: new Date().toISOString()
      };
      const updatedChat = [...(order.support_chat || []), msgObj];
      await Order.update(orderId, { support_chat: updatedChat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-orders', user?.id]);
      setNewMessage('');
    }
  });

  const handleLogout = async () => {
    await logout();
  };

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  // Build achievement grid (earned + locked)
  const earnedIds = new Set(earnedAchievements.map(ea => ea.achievement_id || ea.achievements?.id));
  const achievementGrid = allAchievements.map(ach => ({
    ...ach,
    earned: earnedIds.has(ach.id),
    earnedData: earnedAchievements.find(ea => (ea.achievement_id || ea.achievements?.id) === ach.id),
  }));

  if (isLoading) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      </GamerLayout>
    );
  }

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Profile Header */}
      <FloatingPanel className="p-6 mb-6" glowBorder>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-red-500/20">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-red-500" />
              )}
            </div>
            <label className="absolute -bottom-2 -left-2 cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              {avatarUploading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
            </label>
            {profile?.is_talent && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" /> TALENT
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-4">
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Username"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Bio"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={3}
                />
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Avatar</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { file_url } = await uploadFile(file);
                          setEditForm({ ...editForm, avatar: file_url });
                        } catch (err) { console.error(err); }
                      }} />
                    </label>
                    <Input
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      placeholder="or paste URL"
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <GlowButton onClick={() => updateProfileMutation.mutate(editForm)}>
                    <Save className="w-4 h-4" /> Save
                  </GlowButton>
                  <GlowButton variant="ghost" onClick={() => setEditing(false)}>
                    <X className="w-4 h-4" /> Cancel
                  </GlowButton>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-black text-white truncate">
                        {profile?.username || user?.full_name}
                      </h1>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full uppercase">Gamer</span>
                    </div>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    {profile?.username_slug && (
                      <p className="text-gray-500 text-xs mt-1">
                        Profile: <span className="text-red-400">{window.location.origin}/gamer/profile/{profile.username_slug}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <GlowButton variant="secondary" size="sm" onClick={() => setEditing(true)}>
                      <Edit2 className="w-4 h-4" /> Edit
                    </GlowButton>
                    <GlowButton variant="ghost" size="sm" onClick={() => setBecomeOrgModal(true)}>
                      <Briefcase className="w-4 h-4" /> Become Organizer
                    </GlowButton>
                  </div>
                </div>
                {profile?.bio && (
                  <p className="text-gray-300 mt-3 line-clamp-3">{profile.bio}</p>
                )}

                {/* Username Slug / Profile Link Editor */}
                <div className="mt-4 p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Custom Profile Link</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">/gamer/profile/</span>
                    <input
                      value={slugInput}
                      onChange={(e) => { setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')); setSlugError(''); setSlugSuccess(''); }}
                      placeholder="yourname"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => updateSlugMutation.mutate(slugInput)}
                      disabled={updateSlugMutation.isPending || slugInput === profile?.username_slug}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded transition-colors"
                    >
                      {updateSlugMutation.isPending ? '...' : 'Save'}
                    </button>
                  </div>
                  {slugError && <p className="text-red-400 text-xs mt-1">{slugError}</p>}
                  {slugSuccess && <p className="text-green-400 text-xs mt-1">{slugSuccess}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        {!editing && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-zinc-800">
            <div className="text-center p-3 bg-zinc-800/40 rounded-lg">
              <Swords className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{stats?.total_matches || 0}</p>
              <p className="text-xs text-gray-500 uppercase">Matches</p>
            </div>
            <div className="text-center p-3 bg-zinc-800/40 rounded-lg">
              <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{stats?.total_wins || 0}</p>
              <p className="text-xs text-gray-500 uppercase">Wins</p>
            </div>
            <div className="text-center p-3 bg-zinc-800/40 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{stats?.win_rate || 0}%</p>
              <p className="text-xs text-gray-500 uppercase">Win Rate</p>
            </div>
            <div className="text-center p-3 bg-zinc-800/40 rounded-lg">
              <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{stats?.teams_count || teams.length}</p>
              <p className="text-xs text-gray-500 uppercase">Teams</p>
            </div>
            <div className="text-center p-3 bg-zinc-800/40 rounded-lg col-span-2 sm:col-span-1">
              <Medal className="w-4 h-4 text-purple-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{earnedAchievements.length}</p>
              <p className="text-xs text-gray-500 uppercase">Badges</p>
            </div>
          </div>
        )}
      </FloatingPanel>

      {/* Main Tabs */}
      <Tabs defaultValue="games" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="games" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Gamepad2 className="w-4 h-4 mr-1.5" /> Games
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Users className="w-4 h-4 mr-1.5" /> Teams
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Award className="w-4 h-4 mr-1.5" /> Badges
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Package className="w-4 h-4 mr-1.5" /> Orders
          </TabsTrigger>
          {profile?.is_talent && (
            <TabsTrigger value="talent" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              <Star className="w-4 h-4 mr-1.5" /> Talent
            </TabsTrigger>
          )}
        </TabsList>

        {/* Games Tab */}
        <TabsContent value="games">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-red-500" />
                My Games
              </h2>
              <GlowButton variant="secondary" size="sm" onClick={() => setAddGameModal(true)}>
                <Plus className="w-4 h-4" /> Add Game
              </GlowButton>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {profile?.games?.map((game, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30 hover:border-red-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600/20 to-zinc-700 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{game.game_name}</p>
                        <p className="text-gray-500 text-xs">
                          {game.game_id && `ID: ${game.game_id}`}
                          {game.game_id && game.rank && ' · '}
                          {game.rank && <span className="text-red-400">{game.rank}</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeGameMutation.mutate(i)}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            {(!profile?.games || profile.games.length === 0) && (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">No games added yet</p>
                <p className="text-gray-600 text-sm mb-4">Add your games so teams and organizers can find you</p>
                <GlowButton size="sm" onClick={() => setAddGameModal(true)}>
                  <Plus className="w-4 h-4" /> Add Your First Game
                </GlowButton>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                My Teams
              </h2>
              <Link to="/gamer/teams/create">
                <GlowButton variant="secondary" size="sm">
                  <Plus className="w-4 h-4" /> Create Team
                </GlowButton>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {teams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/gamer/teams/${team.id}`}>
                    <GameCard className="p-4 hover:border-red-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {team.logo ? (
                            <img src={team.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-7 h-7 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold truncate">{team.name}</p>
                          <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {team.games?.slice(0, 2).map((game, gi) => (
                              <span key={gi} className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded">
                                {game}
                              </span>
                            ))}
                          </div>
                        </div>
                        {team.leader_id === user?.id && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                            LEADER
                          </span>
                        )}
                      </div>
                    </GameCard>
                  </Link>
                </motion.div>
              ))}
            </div>
            {teams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">Not part of any team yet</p>
                <p className="text-gray-600 text-sm mb-4">Create or join a team to compete in tournaments</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/gamer/teams/create">
                    <GlowButton size="sm">
                      <Plus className="w-4 h-4" /> Create Team
                    </GlowButton>
                  </Link>
                  <Link to="/teams">
                    <GlowButton variant="secondary" size="sm">
                      <Target className="w-4 h-4" /> Browse Teams
                    </GlowButton>
                  </Link>
                </div>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </h2>
              <HexBadge className="bg-yellow-500/10 text-yellow-400">
                {earnedAchievements.length}/{allAchievements.length}
              </HexBadge>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${allAchievements.length > 0 ? (earnedAchievements.length / allAchievements.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {achievementGrid.map((ach, i) => {
                const IconComp = ACHIEVEMENT_ICONS[ach.criteria?.type] || Award;
                const rarity = ach.rarity || 'common';
                const colorClass = RARITY_COLORS[rarity] || RARITY_COLORS.common;
                const glowClass = RARITY_GLOW[rarity] || '';

                return (
                  <motion.div
                    key={ach.id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className={`relative p-4 rounded-xl border text-center transition-all
                      ${ach.earned
                        ? `bg-gradient-to-br ${colorClass} hover:scale-105`
                        : 'bg-zinc-900/50 border-zinc-800 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2
                        ${ach.earned ? 'bg-zinc-900/60' : 'bg-zinc-800/60'}`}
                      >
                        {ach.earned ? (
                          <IconComp className={`w-6 h-6 ${glowClass || 'text-white'}`} />
                        ) : (
                          <Lock className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <p className={`text-sm font-bold truncate ${ach.earned ? 'text-white' : 'text-zinc-600'}`}>
                        {ach.name || ach.title}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${ach.earned ? 'text-gray-400' : 'text-zinc-700'}`}>
                        {ach.description}
                      </p>
                      {ach.earned && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ach.earnedData?.earned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {allAchievements.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No achievements available yet</p>
                <p className="text-gray-600 text-sm">Achievements will appear as you play tournaments</p>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                My Orders
              </h2>
              <Link to="/gamer/orders">
                <GlowButton variant="ghost" size="sm">View All</GlowButton>
              </Link>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-zinc-800/50 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-700/20"
                  onClick={() => setOrderChatModal(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                    <HexBadge className={
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }>
                      {order.status}
                    </HexBadge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{order.items?.length || 0} items</span>
                    <span className="text-white font-bold">EGP {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/gamer/marketplace" className="inline-block mt-3">
                    <GlowButton size="sm" variant="secondary">
                      <ShoppingBag className="w-4 h-4" /> Browse Store
                    </GlowButton>
                  </Link>
                </div>
              )}
            </div>
          </FloatingPanel>
        </TabsContent>

        {/* Talent Tab */}
        {profile?.is_talent && (
          <TabsContent value="talent">
            <FloatingPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Talent Profile
                </h2>
                <Link to="/gamer/gigs">
                  <GlowButton variant="secondary" size="sm">
                    <Briefcase className="w-4 h-4" /> My Gig Requests
                  </GlowButton>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <p className="text-gray-500 text-xs uppercase mb-1">Type</p>
                  <p className="text-white font-bold capitalize">{profile.talent_type || 'N/A'}</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <p className="text-gray-500 text-xs uppercase mb-1">Rate</p>
                  <p className="text-white font-bold">EGP {profile.talent_price?.toLocaleString() || '0'}</p>
                </div>
                <div className="p-4 bg-zinc-800/50 rounded-xl text-center">
                  <p className="text-gray-500 text-xs uppercase mb-1">Rating</p>
                  <p className="text-white font-bold flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    {profile.talent_rating?.toFixed(1) || 'N/A'}
                  </p>
                </div>
              </div>

              {profile.talent_video_link && (
                <div className="p-4 bg-zinc-800/50 rounded-xl">
                  <p className="text-gray-500 text-xs uppercase mb-2">Showreel</p>
                  <a
                    href={profile.talent_video_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 text-sm break-all"
                  >
                    {profile.talent_video_link}
                  </a>
                </div>
              )}
            </FloatingPanel>
          </TabsContent>
        )}
      </Tabs>

      {/* Talent Application CTA (if not talent yet) */}
      {!profile?.is_talent && (
        <FloatingPanel className="p-6 mt-6 text-center" glowBorder>
          <Star className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Become a Talent</h3>
          <p className="text-gray-400 text-sm mb-4 max-w-md mx-auto">
            Are you a caster, host, analyst, or observer? Apply to join our talent roster and get booked for tournaments.
          </p>
          <GlowButton onClick={() => setTalentModal(true)}>
            <Star className="w-4 h-4" /> Apply Now
          </GlowButton>
        </FloatingPanel>
      )}

      {/* Logout */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Add Game Modal */}
      <Dialog open={addGameModal} onOpenChange={setAddGameModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Game</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game Name</label>
              <Input
                value={newGame.game_name}
                onChange={(e) => setNewGame({ ...newGame, game_name: e.target.value })}
                placeholder="e.g. Valorant, CS2, League of Legends"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game ID / Username</label>
              <Input
                value={newGame.game_id}
                onChange={(e) => setNewGame({ ...newGame, game_id: e.target.value })}
                placeholder="Your in-game ID"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Rank</label>
              <Input
                value={newGame.rank}
                onChange={(e) => setNewGame({ ...newGame, rank: e.target.value })}
                placeholder="e.g. Diamond, Global Elite"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <GlowButton
              className="w-full"
              onClick={() => addGameMutation.mutate(newGame)}
              disabled={!newGame.game_name || !newGame.game_id}
            >
              <Plus className="w-4 h-4" /> Add Game
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Talent Application Modal */}
      <Dialog open={talentModal} onOpenChange={setTalentModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> Apply as Talent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Talent Type</label>
              <Select
                value={talentForm.talent_type}
                onValueChange={(val) => setTalentForm({ ...talentForm, talent_type: val })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select your talent type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="caster">Caster</SelectItem>
                  <SelectItem value="host">Host</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="observer">Observer</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="streamer">Streamer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Rate per Event (EGP)</label>
              <Input
                type="number"
                value={talentForm.talent_price}
                onChange={(e) => setTalentForm({ ...talentForm, talent_price: e.target.value })}
                placeholder="e.g. 1500"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Showreel / Demo Link</label>
              <Input
                value={talentForm.talent_video_link}
                onChange={(e) => setTalentForm({ ...talentForm, talent_video_link: e.target.value })}
                placeholder="YouTube or Twitch link"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <GlowButton
              className="w-full"
              onClick={() => applyTalentMutation.mutate(talentForm)}
              disabled={!talentForm.talent_type || !talentForm.talent_price || applyTalentMutation.isPending}
            >
              {applyTalentMutation.isPending ? 'Submitting...' : (
                <><Star className="w-4 h-4" /> Submit Application</>
              )}
            </GlowButton>
            {applyTalentMutation.isSuccess && (
              <p className="text-green-400 text-sm text-center">Application submitted! Staff will review it.</p>
            )}
            {applyTalentMutation.isError && (
              <p className="text-red-400 text-sm text-center">Failed to submit. Please try again.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Chat Modal */}
      <Dialog open={!!orderChatModal} onOpenChange={() => setOrderChatModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{orderChatModal?.id?.slice(0, 8)} - Support Chat</DialogTitle>
          </DialogHeader>
          {orderChatModal && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Status:</span>
                  <HexBadge>{orderChatModal.status}</HexBadge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-bold">EGP {orderChatModal.total?.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-64 overflow-y-auto mb-4 space-y-2 p-2 bg-zinc-950 rounded-lg">
                {orderChatModal.support_chat?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_role === 'gamer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_role === 'gamer' ? 'bg-red-600' : 'bg-zinc-800'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {(!orderChatModal.support_chat || orderChatModal.support_chat.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message staff..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendOrderMessageMutation.mutate({ orderId: orderChatModal.id, message: newMessage });
                    }
                  }}
                />
                <GlowButton onClick={() => newMessage.trim() && sendOrderMessageMutation.mutate({ orderId: orderChatModal.id, message: newMessage })}>
                  Send
                </GlowButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Become Organizer Modal */}
      <Dialog open={becomeOrgModal} onOpenChange={setBecomeOrgModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Become an Organizer</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm mb-4">
            Fill in your organizer details. Your request will be reviewed by staff before approval.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Brand / Organization Name *</label>
              <Input value={orgForm.brand_name} onChange={(e) => setOrgForm({ ...orgForm, brand_name: e.target.value })} placeholder="Your brand name" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name *</label>
              <Input value={orgForm.full_name} onChange={(e) => setOrgForm({ ...orgForm, full_name: e.target.value })} placeholder="Your full name" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Contact Number</label>
              <Input value={orgForm.contact_number} onChange={(e) => setOrgForm({ ...orgForm, contact_number: e.target.value })} placeholder="+20 ..." className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Website</label>
              <Input value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Facebook</label>
                <Input value={orgForm.facebook} onChange={(e) => setOrgForm({ ...orgForm, facebook: e.target.value })} placeholder="facebook.com/..." className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Instagram</label>
                <Input value={orgForm.instagram} onChange={(e) => setOrgForm({ ...orgForm, instagram: e.target.value })} placeholder="@handle" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>
            <GlowButton
              className="w-full"
              onClick={() => becomeOrganizerMutation.mutate(orgForm)}
              disabled={!orgForm.brand_name || !orgForm.full_name || becomeOrganizerMutation.isPending}
            >
              {becomeOrganizerMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </GlowButton>
            {becomeOrganizerMutation.isSuccess && (
              <p className="text-green-400 text-xs text-center">Request submitted! Staff will review your application.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}
