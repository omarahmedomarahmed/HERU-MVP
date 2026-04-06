import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getOrganizerSession } from '@/lib/auth-guards';
import { OrganizerProfile, SponsorshipRadar, Tournament } from '@/api/heruClient'

import {
  MessageSquare, Send, Trophy, Users, Shield, Lock,
  ChevronRight, Mic, Video, Headphones
} from 'lucide-react';

function ChatWindow({ messages, currentUserId, onSend, senderRole = 'organizer', senderName = 'Organizer', placeholder = 'Type a message...' }) {
  const [msg, setMsg] = useState('');
  const endRef = React.useRef(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!msg.trim()) return;
    onSend(msg);
    setMsg('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50 rounded-lg min-h-[300px] max-h-[420px]">
        {messages?.length > 0 ? messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender_id === currentUserId || m.sender_role === senderRole ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
              m.sender_id === currentUserId || m.sender_role === senderRole
                ? 'bg-red-600 text-white' 
                : 'bg-zinc-800 text-gray-200'
            }`}>
              <p className="text-xs opacity-60 mb-1">{m.sender_name || m.sender_brand || 'Unknown'}</p>
              <p>{m.message || m.content}</p>
              <p className="text-xs opacity-40 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )) : (
          <div className="text-center py-12">
            <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 mt-3">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder={placeholder}
          className="bg-zinc-800 border-zinc-700 text-white"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <GlowButton size="sm" onClick={handleSend}>
          <Send className="w-4 h-4" />
        </GlowButton>
      </div>
    </div>
  );
}

export default function OrganizerMessages() {
  const [session, setSession] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = getOrganizerSession();
    if (!s) { navigate('/auth/organizer/login'); return; }
    setSession(s);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile', session?.profileId],
    queryFn: async () => {
      const profiles = await OrganizerProfile.list();
      return profiles.find(p => p.id === session.profileId) || null;
    },
    enabled: !!session?.profileId,
  });

  // My own tournaments + co-organized tournaments
  const { data: myTournaments = [] } = useQuery({
    queryKey: ['org-messages-tournaments', session?.userId],
    queryFn: async () => {
      const all = await Tournament.list('-created_date');
      return all.filter(t => t.organizer_id === session.userId);
    },
    enabled: !!session?.userId,
  });

  const { data: coOrgTournaments = [] } = useQuery({
    queryKey: ['co-org-radar', session?.userId],
    queryFn: async () => {
      const radar = await SponsorshipRadar.list({ co_organizer_id: session.userId });
      if (!radar.length) return [];
      const ids = radar.map(r => r.tournament_id);
      const all = await Tournament.list('-created_date');
      return all.filter(t => ids.includes(t.id));
    },
    enabled: !!session?.userId,
  });

  const allTournaments = [...myTournaments, ...coOrgTournaments.filter(t => !myTournaments.find(m => m.id === t.id))];

  const user = session ? { id: session.userId, email: session.email } : null;

  // Send internal chat message
  const sendInternalMutation = useMutation({
    mutationFn: async (message) => {
      const updatedChat = [...(selectedTournament.general_chat || []), {
        sender_id: session.userId,
        sender_name: session.brandName || profile?.brand_name || 'Organizer',
        sender_type: 'organizer',
        message,
        timestamp: new Date().toISOString()
      }];
      await Tournament.update(selectedTournament.id, { general_chat: updatedChat });
    },
    onSuccess: () => queryClient.invalidateQueries(['org-messages-tournaments'])
  });

  // Send support chat (to staff)
  const sendSupportMutation = useMutation({
    mutationFn: async (message) => {
      const updatedChat = [...(selectedTournament.support_chat || []), {
        sender_id: session.userId,
        sender_name: session.brandName || profile?.brand_name || 'Organizer',
        sender_role: 'organizer',
        message,
        timestamp: new Date().toISOString()
      }];
      await Tournament.update(selectedTournament.id, { support_chat: updatedChat });
    },
    onSuccess: () => queryClient.invalidateQueries(['org-messages-tournaments'])
  });

  // Refresh selected tournament after mutation
  useEffect(() => {
    if (selectedTournament) {
      const updated = allTournaments.find(t => t.id === selectedTournament.id);
      if (updated) setSelectedTournament(updated);
    }
  }, [allTournaments]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">
          TOURNAMENT <span className="text-red-500">MESSAGES</span>
        </h1>
        <p className="text-gray-400 text-sm">Internal, general, and support chats for your tournaments</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tournament List */}
        <div className="space-y-3">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">Your Tournaments</p>
          {allTournaments.length === 0 ? (
            <FloatingPanel className="p-8 text-center">
              <Trophy className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No tournaments yet</p>
            </FloatingPanel>
          ) : allTournaments.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTournament(t)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${
                selectedTournament?.id === t.id 
                  ? 'border-red-500/50 bg-red-500/10' 
                  : 'border-zinc-800/60 bg-zinc-900/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.game}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <HexBadge className={t.status === 'live' ? 'bg-green-500/20 text-green-400' : 'text-xs'}>
                    {t.status === 'live' ? '🔴' : t.status.charAt(0).toUpperCase()}
                  </HexBadge>
                  {((t.general_chat?.length || 0) + (t.support_chat?.length || 0)) > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {!selectedTournament ? (
            <FloatingPanel className="p-16 text-center">
              <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Select a tournament to view chats</p>
            </FloatingPanel>
          ) : (
            <FloatingPanel className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-5 h-5 text-red-500" />
                <h2 className="text-white font-bold">{selectedTournament.name}</h2>
                <HexBadge className={selectedTournament.status === 'live' ? 'bg-green-500/20 text-green-400' : ''}>{selectedTournament.status}</HexBadge>
              </div>

              <Tabs defaultValue="general">
                <TabsList className="bg-zinc-900 border-zinc-800 mb-4">
                  <TabsTrigger value="general">
                    <Users className="w-4 h-4 mr-2" />
                    General Chat
                  </TabsTrigger>
                  <TabsTrigger value="internal">
                    <Lock className="w-4 h-4 mr-2" />
                    Internal Chat
                  </TabsTrigger>
                  <TabsTrigger value="support">
                    <Shield className="w-4 h-4 mr-2" />
                    Staff Support
                  </TabsTrigger>
                </TabsList>

                {/* General Chat — public with gamers */}
                <TabsContent value="general">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-3">Public chat — visible to all gamers in this tournament</p>
                    <ChatWindow
                      messages={selectedTournament.general_chat}
                      currentUserId={session?.userId}
                      onSend={(msg) => sendInternalMutation.mutate(msg)}
                      senderRole="organizer"
                      senderName={session?.brandName || 'Organizer'}
                      placeholder="Message gamers..."
                    />
                  </div>
                </TabsContent>

                {/* Internal Chat — with talents & co-organizers */}
                <TabsContent value="internal">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-3">Private — visible to talents, co-organizers, and staff only</p>
                    {selectedTournament.talents?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs text-gray-500">Talents:</span>
                        {selectedTournament.talents.map((t, i) => (
                          <span key={i} className="text-xs bg-zinc-800 text-gray-400 px-2 py-0.5 rounded flex items-center gap-1">
                            {t.talent_type === 'commentator' ? <Mic className="w-3 h-3" /> : t.talent_type === 'streamer' ? <Video className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
                            {t.talent_type}
                          </span>
                        ))}
                      </div>
                    )}
                    <ChatWindow
                      messages={selectedTournament.support_chat?.filter(m => m.sender_role !== 'staff')}
                      currentUserId={session?.userId}
                      onSend={(msg) => sendInternalMutation.mutate(msg)}
                      senderRole="organizer"
                      senderName={session?.brandName || 'Organizer'}
                      placeholder="Message talents & co-organizers..."
                    />
                  </div>
                </TabsContent>

                {/* Support Chat — with staff */}
                <TabsContent value="support">
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-3">Direct line to HERU staff for tournament support</p>
                    <ChatWindow
                      messages={selectedTournament.support_chat}
                      currentUserId={session?.userId}
                      onSend={(msg) => sendSupportMutation.mutate(msg)}
                      senderRole="organizer"
                      senderName={session?.brandName || 'Organizer'}
                      placeholder="Contact HERU staff..."
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </FloatingPanel>
          )}
        </div>
      </div>
    </>
  );
}