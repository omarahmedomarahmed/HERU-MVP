import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { GamerProfile as GamerProfileAPI, Order, Team, Achievement, ApprovalRequest, Connect, Badge, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'
import PhoneInput from '@/components/ui/PhoneInput'
import UrlInput from '@/components/ui/UrlInput'
import { useToast } from '@/components/ui/use-toast'

import {
  User, Edit2, Save, X, Gamepad2, Users, Star,
  Package, Plus, Trash2, LogOut, Briefcase, Trophy,
  Swords, TrendingUp, Crown, Shield, Medal, Award,
  Target, Lock, ShoppingBag, DollarSign, CreditCard, Bell, ChevronRight,
  Link2, RefreshCw, Eye, EyeOff, CheckCircle2, AlertCircle, MessageSquare,
  Zap, BarChart2, Flame, Sparkles, ChevronDown, ChevronUp, ExternalLink
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
  rare: 'from-red-500/20 to-red-700/20 border-red-600/30',
  epic: 'from-red-500/20 to-red-700/20 border-red-600/30',
  legendary: 'from-yellow-500/20 to-red-500/20 border-yellow-500/30',
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'text-green-400',
  rare: 'text-red-400',
  epic: 'text-red-400',
  legendary: 'text-yellow-400',
};

export default function GamerProfile() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'games';
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [addGameModal, setAddGameModal] = useState(false);
  const [talentModal, setTalentModal] = useState(false);
  const [orderChatModal, setOrderChatModal] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGame, setNewGame] = useState({ game_name: '', game_id: '', rank: '' });
  const [talentForm, setTalentForm] = useState({ talent_type: '', talent_price: '', talent_video_link: '', contact_number: '' });
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

  // Fetch HERU badges awarded to this gamer
  const { data: heruBadges = [] } = useQuery({
    queryKey: ['heru-badges', user?.id],
    queryFn: () => Badge.userBadges(user.id),
    enabled: !!user?.id,
  });

  // Riot account link modal state (shared between Games tab and Connect tab)
  const [linkModal, setLinkModal] = useState(null); // null | 'lol' | 'valorant'
  const [linkForm, setLinkForm] = useState({ gameName: '', tagLine: '', region: 'euw1' });
  const [linkError, setLinkError] = useState('');
  const [syncing, setSyncing] = useState({});

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
    mutationFn: async (data) => GamerProfileAPI.applyTalent({ ...data, email: user?.email }),
    onSuccess: () => {
      setTalentModal(false);
      setTalentForm({ talent_type: '', talent_price: '', talent_video_link: '', contact_number: '' });
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
        requester_name: profile?.username || user?.full_name,
        requester_email: user?.email,
        reference_id: user.id,
        reference_name: data.brand_name,
        details: data,
      });
    },
    onSuccess: () => {
      // Keep modal open to show success message, then close after delay
      setOrgForm({ brand_name: '', full_name: '', contact_number: '', website: '', facebook: '', instagram: '' });
      setTimeout(() => setBecomeOrgModal(false), 2000);
    },
    onError: (err) => {
      toast({ title: 'Submission failed', description: err.message || 'Failed to submit. Please try again.', variant: 'destructive' });
    },
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

  const { data: talentApplications = [] } = useQuery({
    queryKey: ['talent-applications', user?.id],
    queryFn: () => ApprovalRequest.list({ requester_id: user?.id, approval_type: 'talent_application' }),
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

  // Connect status (Riot + Discord accounts)
  const { data: connectStatus, isLoading: connectStatusLoading, refetch: refetchConnect } = useQuery({
    queryKey: ['connect-status', user?.id],
    queryFn: () => Connect.status(),
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const linkRiotMutation = useMutation({
    mutationFn: (data) => Connect.linkRiot(data),
    onSuccess: () => {
      setLinkModal(null);
      setLinkForm({ gameName: '', tagLine: '', region: 'euw1' });
      setLinkError('');
      refetchConnect();
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      toast({ title: 'Riot account linked!', description: 'Your account has been linked successfully.' });
    },
    onError: (err) => setLinkError(err.message || 'Failed to link account'),
  });

  const removeRiotMutation = useMutation({
    mutationFn: (id) => Connect.removeRiot(id),
    onSuccess: () => { refetchConnect(); toast({ title: 'Account removed' }); },
  });

  const handleRiotSync = async (id) => {
    setSyncing(s => ({ ...s, [id]: true }));
    try {
      await Connect.syncRiot(id);
      refetchConnect();
      toast({ title: 'Stats synced!' });
    } catch (err) {
      toast({ title: 'Sync failed', description: err.message, variant: 'destructive' });
    } finally {
      setSyncing(s => ({ ...s, [id]: false }));
    }
  };

  const handleToggleRiotPublic = async (id, is_public) => {
    try {
      await Connect.updateRiot(id, { is_public: !is_public });
      refetchConnect();
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
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
              <Users className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{stats?.teams_count || teams.length}</p>
              <p className="text-xs text-gray-500 uppercase">Teams</p>
            </div>
            <div className="text-center p-3 bg-zinc-800/40 rounded-lg col-span-2 sm:col-span-1">
              <Medal className="w-4 h-4 text-red-500 mx-auto mb-1" />
              <p className="text-xl font-black text-white">{earnedAchievements.length}</p>
              <p className="text-xs text-gray-500 uppercase">Badges</p>
            </div>
          </div>
        )}
      </FloatingPanel>

      {/* Main Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
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
          <TabsTrigger value="invites" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Trophy className="w-4 h-4 mr-1.5" /> Invites
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Package className="w-4 h-4 mr-1.5" /> Orders
          </TabsTrigger>
          {profile?.is_talent && (
            <TabsTrigger value="talent" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
              <Star className="w-4 h-4 mr-1.5" /> Talent
            </TabsTrigger>
          )}
          <TabsTrigger value="tournaments" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Bell className="w-4 h-4 mr-1.5" /> Invites
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <DollarSign className="w-4 h-4 mr-1.5" /> Billing
          </TabsTrigger>
          <TabsTrigger value="connect" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Link2 className="w-4 h-4 mr-1.5" /> Connect
          </TabsTrigger>
        </TabsList>

        {/* Games & Accounts Tab */}
        <TabsContent value="games">
          <GamesAccountsTab
            profile={profile}
            userId={user?.id}
            riotAccounts={connectStatus?.riot || []}
            connectStatusLoading={connectStatusLoading}
            onLinkLol={() => { setLinkModal('lol'); setLinkError(''); setLinkForm({ gameName: '', tagLine: '', region: 'euw1' }); }}
            onLinkValorant={() => { setLinkModal('valorant'); setLinkError(''); setLinkForm({ gameName: '', tagLine: '', region: 'euw1' }); }}
            onSync={handleRiotSync}
            onRemove={(id) => removeRiotMutation.mutate(id)}
            onTogglePublic={handleToggleRiotPublic}
            syncing={syncing}
            onAddManualGame={() => setAddGameModal(true)}
            onRemoveManualGame={(i) => removeGameMutation.mutate(i)}
          />
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

          {/* HERU Badges awarded by staff / organizers */}
          {heruBadges.length > 0 && (
            <FloatingPanel className="p-6 mt-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-400" />
                HERU Badges
              </h2>
              <div className="flex flex-wrap gap-3">
                {heruBadges.map(gb => (
                  <div key={gb.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: `${gb.badge?.color || '#ff1a1a'}40`, backgroundColor: `${gb.badge?.color || '#ff1a1a'}10` }}>
                    <span className="text-xl">{gb.badge?.icon || '🏅'}</span>
                    <div>
                      <p className="text-white text-sm font-bold">{gb.badge?.name}</p>
                      {gb.badge?.description && <p className="text-zinc-500 text-xs">{gb.badge.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </FloatingPanel>
          )}
        </TabsContent>

        {/* Tournament Invites Tab */}
        <TabsContent value="invites">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-red-500" /> Tournament Requests
            </h2>
            <Tabs defaultValue="1v1" className="space-y-4">
              <TabsList className="bg-zinc-800 border border-zinc-700 p-0.5">
                <TabsTrigger value="1v1" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 text-xs">
                  <Swords className="w-3.5 h-3.5 mr-1" /> 1v1 Invites
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400 text-xs">
                  <Users className="w-3.5 h-3.5 mr-1" /> Team Invites
                </TabsTrigger>
              </TabsList>

              <TabsContent value="1v1">
                {(profile?.tournament_invites || []).filter(i => i.type === '1v1').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Swords className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                    <p className="text-sm">No 1v1 tournament invites yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(profile?.tournament_invites || []).filter(i => i.type === '1v1').map((invite, idx) => (
                      <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">{invite.tournament_name}</p>
                          <p className="text-gray-400 text-xs">{invite.game} - {invite.format || '1v1'}</p>
                          <p className="text-gray-500 text-xs mt-1">From: {invite.organizer_name || 'Organizer'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/gamer/tournaments/${invite.tournament_id}`}>
                            <GlowButton size="sm">View</GlowButton>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="team">
                {(() => {
                  const teamInvites = (profile?.tournament_invites || []).filter(i => i.type !== '1v1');
                  // Also check team tournament_invites from teams the user leads
                  return teamInvites.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
                      <p className="text-sm">No team tournament invites yet</p>
                      <p className="text-xs text-gray-600 mt-1">Team leaders receive invites for their teams</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamInvites.map((invite, idx) => (
                        <div key={idx} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-white font-bold text-sm">{invite.tournament_name}</p>
                            <p className="text-gray-400 text-xs">{invite.game} - Team vs Team</p>
                            <p className="text-gray-500 text-xs mt-1">Team: {invite.team_name || 'Your Team'}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link to={`/gamer/tournaments/${invite.tournament_id}`}>
                              <GlowButton size="sm">View</GlowButton>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </TabsContent>
            </Tabs>
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
                      order.status === 'processing' ? 'bg-red-500/20 text-red-400' :
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

        {/* Tournament Invites Tab */}
        <TabsContent value="tournaments">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-red-500" />
              Tournament Invites
            </h2>
            <TournamentInvitesTab userId={user?.id} profile={profile} />
          </FloatingPanel>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-red-500" />
              My Bills
            </h2>
            <BillingTab userId={user?.id} />
          </FloatingPanel>
        </TabsContent>

        {/* HERU Connect Tab */}
        <TabsContent value="connect">
          <ConnectTab
            userId={user?.id}
            profile={profile}
            connectStatus={connectStatus}
            onRefetch={refetchConnect}
            onLinkLol={() => { setLinkModal('lol'); setLinkError(''); setLinkForm({ gameName: '', tagLine: '', region: 'euw1' }); }}
            onLinkValorant={() => { setLinkModal('valorant'); setLinkError(''); setLinkForm({ gameName: '', tagLine: '', region: 'euw1' }); }}
            onSync={handleRiotSync}
            onRemove={(id) => removeRiotMutation.mutate(id)}
            onTogglePublic={handleToggleRiotPublic}
            syncing={syncing}
          />
        </TabsContent>
      </Tabs>

      {/* Talent Application CTA (if not talent yet) */}
      {!profile?.is_talent && (
        <div className="mt-6 relative overflow-hidden rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-zinc-900 to-red-500/10 p-8 text-center shadow-lg shadow-yellow-500/5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-500" />
          <Star className="w-14 h-14 text-yellow-400 mx-auto mb-4 drop-shadow-lg" />
          <h3 className="text-2xl font-black text-white mb-2">JOIN THE TALENT ROSTER</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Are you a caster, host, analyst, or observer? Apply to join our talent roster and get booked for tournaments. Earn EGP per event!
          </p>
          <GlowButton onClick={() => setTalentModal(true)} size="lg" className="bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-500 hover:to-red-500 text-white font-bold px-8">
            <Star className="w-5 h-5" /> Apply as Talent
          </GlowButton>
        </div>
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

      {/* Add Manual Game Modal */}
      <Dialog open={addGameModal} onOpenChange={setAddGameModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Other Game</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm pt-1 pb-2">For CS2, Dota 2, and other non-Riot games. League of Legends and Valorant can be connected with real stats below.</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game Name</label>
              <Input
                value={newGame.game_name}
                onChange={(e) => setNewGame({ ...newGame, game_name: e.target.value })}
                placeholder="e.g. CS2, Dota 2, Rocket League"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">In-Game ID / Username</label>
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
                placeholder="e.g. Global Elite, Divine"
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

      {/* Link Riot Account Modal (shared between Games tab and Connect tab) */}
      <Dialog open={!!linkModal} onOpenChange={() => { setLinkModal(null); setLinkError(''); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {linkModal === 'lol'
                ? <><Swords className="w-5 h-5 text-yellow-400" /> Link League of Legends Account</>
                : <><Target className="w-5 h-5 text-red-400" /> Link Valorant Account</>
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-gray-400 text-sm">
              Enter your Riot ID exactly as it appears in-game (e.g. <span className="text-white font-mono">PlayerName#EUW</span>).
            </p>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Game Name</label>
              <Input
                value={linkForm.gameName}
                onChange={(e) => setLinkForm({ ...linkForm, gameName: e.target.value })}
                placeholder="PlayerName"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Tag Line</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold">#</span>
                <Input
                  value={linkForm.tagLine}
                  onChange={(e) => setLinkForm({ ...linkForm, tagLine: e.target.value.replace('#', '') })}
                  placeholder="EUW"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Region</label>
              <select
                value={linkForm.region}
                onChange={(e) => setLinkForm({ ...linkForm, region: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                {[
                  { value: 'euw1', label: 'EUW (Europe West)' },
                  { value: 'eun1', label: 'EUNE (Europe Nordic)' },
                  { value: 'me1', label: 'ME (Middle East / MENA)' },
                  { value: 'na1', label: 'NA (North America)' },
                  { value: 'kr', label: 'KR (Korea)' },
                  { value: 'br1', label: 'BR (Brazil)' },
                  { value: 'tr1', label: 'TR (Turkey)' },
                ].map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {linkError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{linkError}</p>
              </div>
            )}
            <GlowButton
              className="w-full"
              onClick={() => linkRiotMutation.mutate({ ...linkForm, game: linkModal })}
              disabled={!linkForm.gameName || !linkForm.tagLine || linkRiotMutation.isPending}
            >
              {linkRiotMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Linking...</>
              ) : (
                <><Link2 className="w-4 h-4" /> Link Account</>
              )}
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
              <UrlInput
                value={talentForm.talent_video_link}
                onChange={(v) => setTalentForm({ ...talentForm, talent_video_link: v })}
                placeholder="https://youtube.com/... or https://twitch.tv/..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Contact Number</label>
              <PhoneInput
                value={talentForm.contact_number}
                onChange={(v) => setTalentForm({ ...talentForm, contact_number: v })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Email</label>
              <Input
                type="email"
                value={user?.email || ''}
                readOnly
                className="bg-zinc-800/60 border-zinc-700 text-gray-400 cursor-not-allowed"
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

            {/* Talent Application History */}
            {talentApplications.length > 0 && (
              <div className="mt-6 pt-4 border-t border-zinc-700">
                <p className="text-sm font-bold text-gray-300 mb-3">Application History</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {talentApplications.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium capitalize">{app.details?.talent_type || app.reference_name || 'Talent'}</p>
                        <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          app.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          app.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {app.status?.toUpperCase()}
                        </span>
                        {app.status === 'pending' && (
                          <button
                            onClick={() => {
                              setTalentForm({
                                talent_type: app.details?.talent_type || '',
                                talent_price: app.details?.talent_price || '',
                                talent_video_link: app.details?.talent_video_link || '',
                                contact_number: app.details?.contact_number || '',
                              });
                            }}
                            className="text-xs text-red-400 hover:text-red-300 font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
              <PhoneInput value={orgForm.contact_number} onChange={(v) => setOrgForm({ ...orgForm, contact_number: v })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Website</label>
              <UrlInput value={orgForm.website} onChange={(v) => setOrgForm({ ...orgForm, website: v })} placeholder="https://yoursite.com" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Facebook</label>
                <UrlInput value={orgForm.facebook} onChange={(v) => setOrgForm({ ...orgForm, facebook: v })} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Instagram</label>
                <UrlInput value={orgForm.instagram} onChange={(v) => setOrgForm({ ...orgForm, instagram: v })} placeholder="https://instagram.com/..." />
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

// ─── Tournament Invites Sub-Component ────────────────────────────────────────
function TournamentInvitesTab({ userId, profile }) {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['gamer-tournament-invites', userId],
    queryFn: async () => {
      if (!userId) return [];
      // Fetch tournaments where user is in invited_teams or gamer_invites
      const res = await fetch(`/api/tournaments?invited_gamer=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  // Also show team join invites from teams
  const { data: teamInvites = [] } = useQuery({
    queryKey: ['team-invites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/teams?invited_member=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="text-gray-400 py-8 text-center">Loading invites...</div>;

  const hasAny = tournaments.length > 0 || teamInvites.length > 0;

  return (
    <div className="space-y-6">
      {/* Tournament Invites */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Tournament Invites
        </h3>
        {tournaments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-zinc-800/30 rounded-xl">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm">No tournament invites</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.game} · {t.format}</p>
                  {t.schedule && (
                    <p className="text-gray-600 text-xs mt-0.5">{new Date(t.schedule).toLocaleDateString()}</p>
                  )}
                </div>
                <Link to={`/gamer/arena/${t.id}`}>
                  <GlowButton size="sm" variant="secondary">
                    <ChevronRight className="w-4 h-4" /> View
                  </GlowButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Invites */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Team Invites
        </h3>
        {teamInvites.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-zinc-800/30 rounded-xl">
            <Users className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm">No team invites</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teamInvites.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
                <div className="flex items-center gap-3">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold">{team.name}</p>
                    <p className="text-gray-500 text-xs">{team.games?.join(', ')}</p>
                  </div>
                </div>
                <Link to={`/gamer/teams/${team.id}`}>
                  <GlowButton size="sm" variant="secondary">
                    <ChevronRight className="w-4 h-4" /> View
                  </GlowButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasAny && (
        <p className="text-center text-gray-500 text-sm pt-4">
          Join teams or compete in tournaments to see invites here.
        </p>
      )}
    </div>
  );
}

// ─── RANK TIER COLORS ────────────────────────────────────────────────────────
const RANK_COLORS = {
  IRON: 'text-gray-400 bg-gray-500/20 border-gray-500/20',
  BRONZE: 'text-orange-600 bg-orange-900/20 border-orange-700/30',
  SILVER: 'text-gray-300 bg-gray-500/20 border-gray-400/20',
  GOLD: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  PLATINUM: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/30',
  EMERALD: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  DIAMOND: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  MASTER: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  GRANDMASTER: 'text-red-400 bg-red-500/20 border-red-500/30',
  CHALLENGER: 'text-yellow-300 bg-yellow-400/20 border-yellow-400/30',
};

const RANK_ICON_URL = (tier) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-shared-components/global/default/${tier?.toLowerCase() || 'unranked'}.png`;

// ─── Games & Accounts Tab ─────────────────────────────────────────────────────
function GamesAccountsTab({ profile, userId, riotAccounts = [], connectStatusLoading, onLinkLol, onLinkValorant, onSync, onRemove, onTogglePublic, syncing, onAddManualGame, onRemoveManualGame }) {
  const [expandedMatch, setExpandedMatch] = useState(null);
  const lolAccounts = riotAccounts.filter(a => a.game_key === 'lol');
  const valAccounts = riotAccounts.filter(a => a.game_key === 'valorant');

  return (
    <div className="space-y-6">
      {/* ── League of Legends ────────────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-yellow-400" /> League of Legends
          </h2>
          <button onClick={onLinkLol} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Connect Account
          </button>
        </div>

        {connectStatusLoading && <div className="text-gray-500 text-sm py-4 text-center">Loading accounts...</div>}

        {!connectStatusLoading && lolAccounts.length === 0 && (
          <div className="text-center py-10 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
            <Swords className="w-14 h-14 mx-auto mb-3 text-zinc-600" />
            <p className="text-gray-300 font-bold mb-1">Connect League of Legends</p>
            <p className="text-gray-500 text-sm mb-4">Get your rank, champion masteries, and match history displayed on your profile</p>
            <button onClick={onLinkLol} className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg text-sm font-bold hover:bg-yellow-500/30 transition-colors">
              <Link2 className="w-4 h-4 inline mr-1.5" /> Link Riot ID
            </button>
          </div>
        )}

        <div className="space-y-4">
          {lolAccounts.map(acc => (
            <LolAccountCard key={acc.id} acc={acc} onSync={onSync} onRemove={onRemove} onTogglePublic={onTogglePublic} syncing={syncing} expandedMatch={expandedMatch} setExpandedMatch={setExpandedMatch} />
          ))}
        </div>
      </FloatingPanel>

      {/* ── Valorant ─────────────────────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" /> Valorant
          </h2>
          <button onClick={onLinkValorant} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Connect Account
          </button>
        </div>

        {!connectStatusLoading && valAccounts.length === 0 && (
          <div className="text-center py-10 bg-zinc-800/30 rounded-xl border border-dashed border-zinc-700">
            <Target className="w-14 h-14 mx-auto mb-3 text-zinc-600" />
            <p className="text-gray-300 font-bold mb-1">Connect Valorant</p>
            <p className="text-gray-500 text-sm mb-4">Link your Riot ID to compete in HERU Valorant tournaments</p>
            <button onClick={onLinkValorant} className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm font-bold hover:bg-red-500/30 transition-colors">
              <Link2 className="w-4 h-4 inline mr-1.5" /> Link Riot ID
            </button>
          </div>
        )}

        <div className="space-y-4">
          {valAccounts.map(acc => (
            <ValAccountCard key={acc.id} acc={acc} onSync={onSync} onRemove={onRemove} onTogglePublic={onTogglePublic} syncing={syncing} />
          ))}
        </div>
      </FloatingPanel>

      {/* ── Other Games (manual) ─────────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-gray-400" /> Other Games
          </h2>
          <button onClick={onAddManualGame} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700/50 border border-zinc-600 text-gray-300 hover:bg-zinc-700 rounded-lg text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Game
          </button>
        </div>
        {(!profile?.games || profile.games.length === 0) ? (
          <p className="text-gray-600 text-sm text-center py-6">CS2, Dota 2, and other games you play — add them for organizers to find you.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {profile.games.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-700 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{game.game_name}</p>
                    <p className="text-gray-500 text-xs">
                      {game.game_id && `ID: ${game.game_id}`}
                      {game.game_id && game.rank && ' · '}
                      {game.rank && <span className="text-red-400">{game.rank}</span>}
                    </p>
                  </div>
                </div>
                <button onClick={() => onRemoveManualGame(i)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}

// ─── LoL Account Card ─────────────────────────────────────────────────────────
function LolAccountCard({ acc, onSync, onRemove, onTogglePublic, syncing, expandedMatch, setExpandedMatch }) {
  const rankColor = RANK_COLORS[acc.rank_tier] || 'text-gray-400 bg-gray-500/20 border-gray-500/20';
  const winRate = acc.wins + acc.losses > 0 ? Math.round((acc.wins / (acc.wins + acc.losses)) * 100) : 0;
  const matches = acc.match_history_cache || [];

  return (
    <div className="rounded-xl border border-zinc-700/40 overflow-hidden bg-zinc-800/30">
      {/* Account header */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Profile icon */}
          <div className="relative flex-shrink-0">
            {acc.profile_icon_id ? (
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${acc.profile_icon_id}.png`}
                alt=""
                className="w-14 h-14 rounded-xl border-2 border-yellow-500/30"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-yellow-900/30 border border-yellow-500/20 flex items-center justify-center">
                <Swords className="w-7 h-7 text-yellow-400" />
              </div>
            )}
            <span className="absolute -bottom-1.5 -right-1.5 text-[10px] font-black bg-zinc-900 border border-zinc-700 text-gray-300 px-1.5 py-0.5 rounded">
              {acc.summoner_level || '?'}
            </span>
          </div>

          {/* Name + rank */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-white font-black text-lg truncate">{acc.game_name}#{acc.tag_line}</p>
              {acc.is_primary && <span className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">Primary</span>}
            </div>
            <p className="text-gray-500 text-xs mb-2">{acc.region?.toUpperCase()} · Level {acc.summoner_level || '?'}</p>

            {/* Solo rank */}
            {acc.rank_tier ? (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-bold ${rankColor}`}>
                <Crown className="w-4 h-4" />
                {acc.rank_tier} {acc.rank_division}
                <span className="text-xs opacity-70">· {acc.rank_lp} LP</span>
                {acc.hot_streak && <Flame className="w-3.5 h-3.5 text-orange-400" title="Hot streak!" />}
              </div>
            ) : (
              <span className="text-gray-600 text-sm">Unranked</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => onTogglePublic(acc.id, acc.is_public)} title={acc.is_public ? 'Make private' : 'Make public'} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-zinc-700 transition-colors">
              {acc.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button onClick={() => onSync(acc.id)} disabled={syncing[acc.id]} title="Sync stats" className="p-2 text-gray-500 hover:text-blue-400 rounded-lg hover:bg-zinc-700 transition-colors">
              <RefreshCw className={`w-4 h-4 ${syncing[acc.id] ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            <button onClick={() => onRemove(acc.id)} title="Remove" className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-zinc-700 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center p-2 bg-zinc-900/60 rounded-lg">
            <p className="text-base font-black text-white">{acc.wins}</p>
            <p className="text-[10px] text-gray-500 uppercase">Wins</p>
          </div>
          <div className="text-center p-2 bg-zinc-900/60 rounded-lg">
            <p className="text-base font-black text-white">{acc.losses}</p>
            <p className="text-[10px] text-gray-500 uppercase">Losses</p>
          </div>
          <div className="text-center p-2 bg-zinc-900/60 rounded-lg">
            <p className={`text-base font-black ${winRate >= 55 ? 'text-green-400' : winRate < 45 ? 'text-red-400' : 'text-white'}`}>{winRate}%</p>
            <p className="text-[10px] text-gray-500 uppercase">Win Rate</p>
          </div>
          <div className="text-center p-2 bg-zinc-900/60 rounded-lg">
            <p className="text-base font-black text-purple-400">{(acc.total_mastery_score || 0).toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 uppercase">Mastery</p>
          </div>
        </div>

        {/* Flex rank if present */}
        {acc.flex_rank_tier && (
          <div className="mt-2 text-xs text-gray-500">
            Flex: <span className="text-gray-300 font-medium">{acc.flex_rank_tier} {acc.flex_rank_division} · {acc.flex_rank_lp} LP ({acc.flex_wins}W {acc.flex_losses}L)</span>
          </div>
        )}
      </div>

      {/* Champion masteries */}
      {acc.champion_masteries?.length > 0 && (
        <div className="px-4 pb-3 border-t border-zinc-700/30 pt-3">
          <p className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Top Champions</p>
          <div className="flex gap-2 flex-wrap">
            {acc.champion_masteries.slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/60 rounded-lg border border-zinc-700/30">
                <img
                  src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${m.championName || m.championId}.png`}
                  alt={m.championName || String(m.championId)}
                  className="w-6 h-6 rounded"
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div>
                  <p className="text-white text-xs font-bold leading-none">{m.championName || `#${m.championId}`}</p>
                  <p className="text-gray-500 text-[10px]">M{m.championLevel} · {(m.championPoints || 0).toLocaleString()}pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent match history */}
      {matches.length > 0 && (
        <div className="border-t border-zinc-700/30">
          <button
            onClick={() => setExpandedMatch(expandedMatch === acc.id ? null : acc.id)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-zinc-700/20 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-bold"><BarChart2 className="w-3.5 h-3.5" /> Recent Games ({matches.length})</span>
            {expandedMatch === acc.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expandedMatch === acc.id && (
            <div className="space-y-1 px-4 pb-3">
              {matches.map((m, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg text-xs ${m.win ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
                  <div className={`w-1.5 h-8 rounded-full flex-shrink-0 ${m.win ? 'bg-green-500' : 'bg-red-500'}`} />
                  {m.champion && (
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${m.champion}.png`}
                      alt={m.champion}
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-black ${m.win ? 'text-green-400' : 'text-red-400'}`}>{m.win ? 'WIN' : 'LOSS'}</span>
                      <span className="text-white font-bold">{m.kills}/{m.deaths}/{m.assists}</span>
                      <span className="text-gray-500">KDA: {m.kda}</span>
                    </div>
                    <div className="text-gray-600 mt-0.5">{m.champion} · {m.cs} CS · {m.played_at ? new Date(m.played_at).toLocaleDateString() : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {acc.last_synced_at && (
        <div className="px-4 pb-2 text-[10px] text-gray-600">
          Last synced: {new Date(acc.last_synced_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

// ─── Valorant Account Card ────────────────────────────────────────────────────
function ValAccountCard({ acc, onSync, onRemove, onTogglePublic, syncing }) {
  return (
    <div className="rounded-xl border border-zinc-700/40 overflow-hidden bg-zinc-800/30 p-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-red-900/30 border border-red-500/20 flex items-center justify-center flex-shrink-0">
          <Target className="w-7 h-7 text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-black text-lg truncate">{acc.game_name}#{acc.tag_line}</p>
            {acc.is_primary && <span className="text-[10px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded uppercase">Primary</span>}
          </div>
          <p className="text-gray-500 text-xs mb-2">{acc.region?.toUpperCase()}</p>
          {acc.val_rank_tier ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-bold">
              <Crown className="w-4 h-4" /> {acc.val_rank_tier}
              {acc.val_rank_rating ? ` · ${acc.val_rank_rating} RR` : ''}
            </span>
          ) : (
            <span className="text-gray-500 text-xs">Rank requires Production API key</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onTogglePublic(acc.id, acc.is_public)} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-zinc-700 transition-colors">
            {acc.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button onClick={() => onSync(acc.id)} disabled={syncing[acc.id]} className="p-2 text-gray-500 hover:text-blue-400 rounded-lg hover:bg-zinc-700 transition-colors">
            <RefreshCw className={`w-4 h-4 ${syncing[acc.id] ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button onClick={() => onRemove(acc.id)} className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-zinc-700 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {acc.last_synced_at && (
        <p className="text-[10px] text-gray-600 mt-3">Last synced: {new Date(acc.last_synced_at).toLocaleString()}</p>
      )}
    </div>
  );
}

// ─── HERU Connect Sub-Component ──────────────────────────────────────────────
function ConnectTab({ userId, profile, connectStatus, onRefetch, onLinkLol, onLinkValorant, onSync, onRemove, onTogglePublic, syncing }) {
  const [discordConnecting, setDiscordConnecting] = useState(false);
  const { toast } = useToast();

  const discordAccounts = connectStatus?.discord || [];
  const riotAccounts = connectStatus?.riot || [];
  const hasDiscord = discordAccounts.some(a => a.platform === 'discord' && a.is_active);

  const disconnectDiscordMutation = useMutation({
    mutationFn: () => Connect.disconnectDiscord(),
    onSuccess: () => { onRefetch(); toast({ title: 'Discord disconnected' }); },
  });

  const handleDiscordConnect = async () => {
    setDiscordConnecting(true);
    try {
      const url = await Connect.discordAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast({ title: 'Discord connect failed', description: err.message, variant: 'destructive' });
      setDiscordConnecting(false);
    }
  };

  const lolAccounts = riotAccounts.filter(a => a.game_key === 'lol');
  const valAccounts = riotAccounts.filter(a => a.game_key === 'valorant');

  return (
    <div className="space-y-6">
      {/* ── Discord Section ─────────────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Discord
          </h2>
          {hasDiscord ? (
            <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <AlertCircle className="w-4 h-4" /> Not connected
            </span>
          )}
        </div>

        {hasDiscord ? (
          <div className="space-y-3">
            {discordAccounts.filter(a => a.platform === 'discord' && a.is_active).map(acc => (
              <div key={acc.id} className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                {acc.platform_avatar ? (
                  <img src={acc.platform_avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{acc.platform_username}</p>
                  {acc.last_synced_at && (
                    <p className="text-gray-500 text-xs">
                      Synced {new Date(acc.last_synced_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => disconnectDiscordMutation.mutate()}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/10 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connect your Discord account to join tournament servers automatically and receive notifications.
            </p>
            <button
              onClick={handleDiscordConnect}
              disabled={discordConnecting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              {discordConnecting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting...</>
              ) : (
                <><MessageSquare className="w-4 h-4" /> Connect Discord</>
              )}
            </button>
          </div>
        )}
      </FloatingPanel>

      {/* ── Riot Accounts Summary ──────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-yellow-400" /> Riot Accounts
          </h2>
          <div className="flex gap-2">
            <button onClick={onLinkLol} className="flex items-center gap-1 px-2.5 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-3.5 h-3.5" /> LoL
            </button>
            <button onClick={onLinkValorant} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors">
              <Plus className="w-3.5 h-3.5" /> VAL
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-xs mb-4">Manage linked accounts here or in the <strong className="text-white">Games</strong> tab for full stats, champion masteries and match history.</p>

        {/* Riot accounts summary (link to Games tab) */}
        <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm font-bold flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-yellow-400" /> Riot Accounts
            </p>
            <span className="text-xs text-gray-500">{riotAccounts.length} linked</span>
          </div>
          {riotAccounts.length === 0 ? (
            <p className="text-gray-600 text-xs">No Riot accounts linked yet. Go to the <strong>Games</strong> tab to connect LoL or Valorant.</p>
          ) : (
            <div className="space-y-1.5">
              {riotAccounts.map(a => (
                <div key={a.id} className="flex items-center justify-between text-xs text-gray-400">
                  <span>{a.game_name}#{a.tag_line} <span className="text-gray-600">({a.game_key === 'lol' ? 'LoL' : 'Valorant'})</span></span>
                  <span className={`font-bold ${a.rank_tier ? 'text-yellow-400' : 'text-gray-600'}`}>{a.rank_tier || 'Unranked'}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onLinkLol}
            className="mt-3 w-full text-xs text-yellow-400 hover:text-yellow-300 py-1.5 border border-yellow-500/20 hover:border-yellow-500/40 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Connect another account
          </button>
        </div>
      </FloatingPanel>
    </div>
  );
}

// ─── Billing Sub-Component ────────────────────────────────────────────────────
function BillingTab({ userId }) {
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['gamer-bills', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/bills?payer_id=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="text-gray-400 py-8 text-center">Loading bills...</div>;

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
        <p className="font-medium">No bills yet</p>
        <p className="text-sm mt-1">Bills from marketplace orders will appear here.</p>
      </div>
    );
  }

  const statusColor = (s) => {
    if (s === 'paid') return 'text-green-400 bg-green-500/10';
    if (s === 'partial') return 'text-yellow-400 bg-yellow-500/10';
    if (s === 'overdue') return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-zinc-700/50';
  };

  return (
    <div className="space-y-3">
      {bills.map((bill) => (
        <div key={bill.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30 hover:border-red-500/20 transition-colors">
          <div>
            <p className="text-white font-bold font-mono text-sm">{bill.bill_number}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {bill.tournament_name || bill.bill_type} · {new Date(bill.created_at).toLocaleDateString()}
            </p>
            {bill.due_date && bill.payment_status !== 'paid' && (
              <p className="text-gray-600 text-xs">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-bold">EGP {bill.grand_total?.toLocaleString()}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(bill.payment_status)}`}>
                {bill.payment_status?.toUpperCase()}
              </span>
            </div>
            <Link to={`/bill/${bill.bill_number}`}>
              <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
