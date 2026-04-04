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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GamerProfile as GamerProfileAPI, Order, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  User, Edit2, Save, X, Gamepad2, Users, Star,
  Package, Plus, Trash2, LogOut, Briefcase
} from 'lucide-react';

export default function GamerProfile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [addGameModal, setAddGameModal] = useState(false);
  const [orderChatModal, setOrderChatModal] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGame, setNewGame] = useState({ game_name: '', game_id: '', rank: '' });
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
          username: user.full_name,
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

  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => GamerProfileAPI.update(profile.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setEditing(false);
    }
  });

  const addGameMutation = useMutation({
    mutationFn: async (game) => {
      const games = [...(profile.games || []), game];
      return GamerProfileAPI.update(profile.id, { games });
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
      return GamerProfileAPI.update(profile.id, { games });
    },
    onSuccess: () => queryClient.invalidateQueries(['gamer-profile', user?.id])
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
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-red-500" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
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
                <Input
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                  placeholder="Avatar URL"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
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
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-white mb-1">
                      {profile?.username || user?.full_name}
                    </h1>
                    <p className="text-gray-400">{user?.email}</p>
                  </div>
                  <GlowButton variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Edit2 className="w-4 h-4" /> Edit
                  </GlowButton>
                </div>
                {profile?.bio && (
                  <p className="text-gray-300 mt-4">{profile.bio}</p>
                )}

                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{teams.length}</p>
                    <p className="text-gray-500 text-sm">Teams</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">{profile?.games?.length || 0}</p>
                    <p className="text-gray-500 text-sm">Games</p>
                  </div>
                </div>

                {/* Talent Gig Requests */}
                {profile?.is_talent && (
                  <div className="mt-4">
                    <Link to={'/gig-requests'}>
                      <GlowButton variant="secondary" size="sm">
                        <Briefcase className="w-4 h-4" /> My Gig Requests
                      </GlowButton>
                    </Link>
                  </div>
                )}

                {/* Logout Button */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </FloatingPanel>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Games */}
        <FloatingPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-red-500" />
              My Games
            </h2>
            <GlowButton variant="secondary" size="sm" onClick={() => setAddGameModal(true)}>
              <Plus className="w-4 h-4" /> Add
            </GlowButton>
          </div>

          <div className="space-y-3">
            {profile?.games?.map((game, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">{game.game_name}</p>
                  <p className="text-gray-500 text-sm">ID: {game.game_id} • {game.rank}</p>
                </div>
                <button
                  onClick={() => removeGameMutation.mutate(i)}
                  className="p-2 text-gray-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {(!profile?.games || profile.games.length === 0) && (
              <div className="text-center py-8">
                <Gamepad2 className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                <p className="text-gray-500">No games added yet</p>
              </div>
            )}
          </div>
        </FloatingPanel>

        {/* Teams */}
        <FloatingPanel className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              My Teams
            </h2>
          </div>

          <div className="space-y-3">
            {teams.map((team) => (
              <Link key={team.id} to={`/teams/$\{team.id}`}>
                <GameCard className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {team.logo ? (
                        <img src={team.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{team.name}</p>
                      <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </GameCard>
              </Link>
            ))}
            {teams.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                <p className="text-gray-500">Not part of any team yet</p>
              </div>
            )}
          </div>
        </FloatingPanel>

        {/* My Orders */}
        <FloatingPanel className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-red-500" />
              My Orders
            </h2>
            <Link to={'/my-orders'}>
              <GlowButton variant="ghost" size="sm">View All</GlowButton>
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800"
                onClick={() => setOrderChatModal(order)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                  <HexBadge className={
                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }>
                    {order.status}
                  </HexBadge>
                </div>
                <p className="text-gray-500 text-sm">${order.total?.toFixed(2)} • {order.items?.length || 0} items</p>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </FloatingPanel>
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
                  <span className="text-white font-bold">${orderChatModal.total?.toFixed(2)}</span>
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
    </GamerLayout>
  );
}