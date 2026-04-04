import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GamerProfile, GigRequest, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Star, MessageSquare, Send, Check, X, Clock, Trophy
} from 'lucide-react';

export default function GigRequests() {
  const [user, setUser] = useState(null);
  const [chatModal, setChatModal] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    apiCall('/auth/me').then(setUser);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: gigRequests = [], isLoading } = useQuery({
    queryKey: ['my-gig-requests', user?.id],
    queryFn: () => GigRequest.list({ talent_user_id: user.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ gigId, status }) => {
      return GigRequest.update(gigId, { status });
    },
    onSuccess: () => queryClient.invalidateQueries(['my-gig-requests', user?.id])
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ gigId, message, gig }) => {
      const msg = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        sender_role: 'talent',
        message,
        timestamp: new Date().toISOString()
      };
      const chat = [...(gig.chat || []), msg];
      return GigRequest.update(gigId, { chat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-gig-requests', user?.id]);
      setNewMessage('');
    }
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  const statusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    accepted: 'bg-green-500/20 text-green-400 border-green-500/50',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    accepted: <Check className="w-4 h-4" />,
    rejected: <X className="w-4 h-4" />,
    completed: <Star className="w-4 h-4" />,
  };

  if (!profile?.is_talent) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <FloatingPanel className="p-16 text-center">
          <Star className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Talent Only</h2>
          <p className="text-gray-400">Only gamers with a Talent badge can receive gig requests.</p>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">
          GIG <span className="text-red-500">REQUESTS</span>
        </h1>
        <p className="text-gray-400">Tournament organizers want to book you as talent</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse" />)}
        </div>
      ) : gigRequests.length === 0 ? (
        <FloatingPanel className="p-16 text-center">
          <Star className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-gray-400">No gig requests yet. Keep building your talent profile!</p>
        </FloatingPanel>
      ) : (
        <div className="space-y-4">
          {gigRequests.map((gig) => (
            <GameCard key={gig.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="text-white font-bold">{gig.tournament_name}</h3>
                      <p className="text-gray-400 text-sm">{gig.organizer_brand}</p>
                    </div>
                    <HexBadge className={statusColors[gig.status]}>
                      {statusIcons[gig.status]} {gig.status?.toUpperCase()}
                    </HexBadge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      {gig.talent_type}
                    </span>
                    <span className="flex items-center gap-1 text-green-400">
                      EGP {gig.price?.toLocaleString()}/event
                    </span>
                    {gig.notes && <span className="text-gray-500">{gig.notes}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <GlowButton variant="ghost" size="sm" onClick={() => setChatModal(gig)}>
                    <MessageSquare className="w-4 h-4" />
                    Chat ({gig.chat?.length || 0})
                  </GlowButton>

                  {gig.status === 'pending' && (
                    <>
                      <GlowButton 
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ gigId: gig.id, status: 'accepted' })}
                      >
                        <Check className="w-4 h-4" /> Accept
                      </GlowButton>
                      <GlowButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => updateStatusMutation.mutate({ gigId: gig.id, status: 'rejected' })}
                      >
                        <X className="w-4 h-4" /> Decline
                      </GlowButton>
                    </>
                  )}
                  {gig.status === 'accepted' && (
                    <GlowButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => updateStatusMutation.mutate({ gigId: gig.id, status: 'completed' })}
                    >
                      Mark Complete
                    </GlowButton>
                  )}
                </div>
              </div>
            </GameCard>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      <Dialog open={!!chatModal} onOpenChange={() => { setChatModal(null); setNewMessage(''); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{chatModal?.tournament_name} — Gig Chat</DialogTitle>
          </DialogHeader>
          {chatModal && (
            <div className="space-y-4 py-4">
              <div className="h-64 overflow-y-auto bg-zinc-950 rounded-lg p-3 space-y-2">
                {chatModal.chat?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-2 rounded-lg text-sm ${
                      msg.sender_id === user?.id ? 'bg-red-600' : 'bg-zinc-800'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name} ({msg.sender_role})</p>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
                {(!chatModal.chat || chatModal.chat.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Reply to organizer..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessageMutation.mutate({ gigId: chatModal.id, message: newMessage, gig: chatModal });
                    }
                  }}
                />
                <GlowButton size="sm" onClick={() => newMessage.trim() && sendMessageMutation.mutate({ gigId: chatModal.id, message: newMessage, gig: chatModal })}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}