import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrganizerLayout from '@/components/layouts/OrganizerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Trophy, Users, Calendar, Edit, MessageSquare, Send, 
  Plus, Trash2, Award, ExternalLink, Upload, Image as ImageIcon, Lock, Shield, ChevronRight
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TournamentTypeBadge from '@/components/tournament/TournamentTypeBadge';
import OrganizerChat, { OrganizerChatLocked } from '@/components/tournament/OrganizerChat';
import TeamManagementPanel from '@/components/tournament/TeamManagementPanel';
import SeedingPanel from '@/components/tournament/SeedingPanel';
import BracketMatchPanel from '@/components/tournament/BracketMatchPanel';
import { OrganizerProfile, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'


export default function OrganizerTournamentView() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tournamentId, setTournamentId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStaffChatModal, setShowStaffChatModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [streamLink, setStreamLink] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bracketStep, setBracketStep] = useState('teams'); // 'teams' | 'seeding' | 'brackets'
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const params = useParams();

  // Access role helpers (computed after tournament loads — used below)
  const getAccessRole = (t, p) => {
    if (!t || !p) return 'public';
    if (t.main_organizer_id === p.id || t.organizer_id === p.id) return 'main';
    const coEntry = t.co_organizers?.find(co => co.organizer_id === p.id);
    if (coEntry) return coEntry.access_granted ? 'co_paid' : 'co_pending';
    return 'public';
  };

  useEffect(() => {
    loadUser();
    // Support both /tournament/:id/manage (path param) and ?id= (query param)
    const routeId = params.id;
    const queryId = new URLSearchParams(window.location.search).get('id');
    setTournamentId(routeId || queryId);
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
      
      const profiles = await OrganizerProfile.list({ user_id: userData.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (e) {
      navigate('/auth/organizer/login');
    }
  };

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => Tournament.list({ id: tournamentId }).then(t => t[0]),
    enabled: !!tournamentId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['tournament-teams', tournament?.id],
    queryFn: async () => {
      if (!tournament?.teams) return [];
      const teamPromises = tournament.teams.map(id => 
        Team.list({ id }).then(t => t[0])
      );
      return Promise.all(teamPromises);
    },
    enabled: !!tournament?.teams,
  });

  const updateTournamentMutation = useMutation({
    mutationFn: async (updates) => {
      await Tournament.update(tournamentId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
      setShowEditModal(false);
    }
  });

  const sendStaffMessageMutation = useMutation({
    mutationFn: async (message) => {
      const updatedChat = [
        ...(tournament.support_chat || []),
        {
          sender_id: user.id,
          sender_name: user.full_name,
          sender_role: 'organizer',
          message,
          timestamp: new Date().toISOString()
        }
      ];
      await Tournament.update(tournamentId, { support_chat: updatedChat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
      setNewMessage('');
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      setUploadingImage(true);
      const { file_url } = await uploadFile(file);
      await Tournament.update(tournamentId, { 
        tournament_image: file_url 
      });
      return file_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
      setUploadingImage(false);
    },
    onError: () => {
      setUploadingImage(false);
    }
  });

  const accessRole = getAccessRole(tournament, profile);
  const isMainOrg = accessRole === 'main';
  const isCoOrgPaid = accessRole === 'co_paid';
  const isCoOrgPending = accessRole === 'co_pending';
  const canEdit = isMainOrg;
  const canViewOrgChat = isMainOrg || isCoOrgPaid;
  const isShared = tournament?.tournament_type === 'shared';

  const sendOrgChatMutation = useMutation({
    mutationFn: async (message) => {
      const updated = [
        ...(tournament.organizer_chat || []),
        {
          sender_id: profile?.id || user?.id,
          sender_name: profile?.brand_name || user?.full_name,
          sender_brand: profile?.brand_name || '',
          sender_role: isMainOrg ? 'main_organizer' : 'co_organizer',
          message,
          timestamp: new Date().toISOString(),
        },
      ];
      await Tournament.update(tournamentId, { organizer_chat: updated });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  if (isLoading || !tournament) {
    return (
      <OrganizerLayout user={user} profile={profile}>
        <div className="flex items-center justify-center h-96">
          <Trophy className="w-12 h-12 text-gray-600 animate-pulse" />
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout user={user} profile={profile}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-black text-white">{tournament.name}</h1>
              <HexBadge className={
                tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                tournament.status === 'published' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
              }>
                {tournament.status === 'live' ? '🔴 LIVE' : tournament.status.toUpperCase()}
              </HexBadge>
            </div>
            <div className="mb-1">
              <TournamentTypeBadge tournament={tournament} />
            </div>
            <p className="text-gray-400 text-sm mt-1">{tournament.game}</p>
            {isCoOrgPending && (
              <div className="mt-2 flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                <Lock className="w-3 h-3" /> Your payment is pending — full access locked until confirmed.
              </div>
            )}
            {tournament.organizer_brand?.name && (
              <Link to={`/organizer/${tournament.main_organizer_id || tournament.organizer_id}`} className="mt-2 inline-flex items-center gap-2 text-gray-500 hover:text-white text-xs transition-colors">
                {tournament.organizer_brand?.logo && (
                  <img src={tournament.organizer_brand.logo} alt="" className="w-5 h-5 rounded object-cover" />
                )}
                by {tournament.organizer_brand.name}
              </Link>
            )}
          </div>
          <div className="flex gap-3">
            {canEdit && (
              <Link to={`/organizer/tournaments/new/${tournamentId}`}>
                <GlowButton variant="secondary" size="sm">
                  <Edit className="w-4 h-4" /> Edit in Builder
                </GlowButton>
              </Link>
            )}
            <GlowButton variant="ghost" size="sm" onClick={() => setShowStaffChatModal(true)}>
              <MessageSquare className="w-4 h-4" /> Staff Chat
            </GlowButton>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-zinc-900 border-zinc-800 mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Brackets & Teams</TabsTrigger>
            <TabsTrigger value="log">Timeline</TabsTrigger>
            {isShared && (
              <TabsTrigger value="org-chat" className="relative">
                Organizer Chat
                {canViewOrgChat && (tournament.organizer_chat?.length || 0) > 0 && (
                  <span className="ml-1.5 text-[10px] bg-blue-500 text-white rounded-full px-1.5 py-0.5">
                    {tournament.organizer_chat.length}
                  </span>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <FloatingPanel className="p-6">
                <div className="mb-6">
                  {tournament.tournament_image ? (
                    <div className="relative group">
                      <img 
                        src={tournament.tournament_image} 
                        className="w-full h-48 object-cover rounded-lg" 
                        alt={tournament.name} 
                      />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-8 h-8 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) uploadImageMutation.mutate(file);
                          }}
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-red-500/50 transition-colors">
                      <ImageIcon className="w-12 h-12 text-gray-600 mb-2" />
                      <span className="text-gray-400 text-sm">Upload Tournament Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) uploadImageMutation.mutate(file);
                        }}
                      />
                    </label>
                  )}
                </div>
                <h3 className="text-white font-bold mb-4">Tournament Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Format:</span>
                    <span className="text-white">{tournament.format || 'Single Elimination'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Teams:</span>
                    <span className="text-white">{tournament.max_teams || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Schedule:</span>
                    <span className="text-white">
                      {tournament.schedule ? new Date(tournament.schedule).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prize Pool:</span>
                    <span className="text-yellow-400 font-bold">
                      EGP {tournament.prizepool_total?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Venue:</span>
                    <span className="text-white">
                      {tournament.is_offline ? tournament.venue || 'TBD' : 'Online'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm text-gray-400 mb-2">Stream Link</label>
                  <div className="flex gap-2">
                    <Input
                      value={streamLink || tournament.stream_link || ''}
                      onChange={(e) => setStreamLink(e.target.value)}
                      placeholder="https://twitch.tv/..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <GlowButton
                      size="sm"
                      onClick={() => {
                        updateTournamentMutation.mutate({ stream_link: streamLink });
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </GlowButton>
                  </div>
                </div>
              </FloatingPanel>

              <FloatingPanel className="p-6">
                <h3 className="text-white font-bold mb-4">Description</h3>
                <p className="text-gray-400 text-sm">{tournament.description || 'No description provided'}</p>

                {isShared && tournament.co_organizers?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-bold mb-3">Co-Organizers</h3>
                    <div className="space-y-2">
                      {tournament.co_organizers.map((co, i) => (
                        <Link key={i} to={`/organizer/${co.organizer_id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {co.brand_logo
                              ? <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                              : <Shield className="w-4 h-4 text-zinc-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{co.brand_name}</p>
                            <p className="text-gray-500 text-xs">{co.commitment_percent}% committed</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded border ${co.access_granted ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                            {co.access_granted ? '✓ Paid' : 'Pending'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </FloatingPanel>
            </div>
          </TabsContent>

          {/* Brackets & Teams Tab — 3-step panel */}
          <TabsContent value="teams">
            {/* Step Navigator */}
            <div className="flex items-center gap-2 mb-6">
              {[
                { key: 'teams', label: '1. Team Management' },
                { key: 'seeding', label: '2. Seeding' },
                { key: 'brackets', label: '3. Brackets & Scores' },
              ].map((step, idx, arr) => (
                <React.Fragment key={step.key}>
                  <button
                    onClick={() => setBracketStep(step.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      bracketStep === step.key
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {step.label}
                  </button>
                  {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />}
                </React.Fragment>
              ))}
            </div>

            {bracketStep === 'teams' && (
              <TeamManagementPanel tournament={tournament} canEdit={canEdit} />
            )}
            {bracketStep === 'seeding' && (
              canEdit ? (
                <SeedingPanel
                  tournament={tournament}
                  confirmedTeams={teams}
                  onBracketsGenerated={() => setBracketStep('brackets')}
                />
              ) : (
                <FloatingPanel className="p-12 text-center">
                  <Lock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Seeding is managed by the main organizer.</p>
                </FloatingPanel>
              )
            )}
            {bracketStep === 'brackets' && (
              <BracketMatchPanel tournament={tournament} teams={teams} canEdit={canEdit} />
            )}
          </TabsContent>

          {/* Organizer Chat Tab — shared tournaments only */}
          {isShared && (
            <TabsContent value="org-chat">
              {canViewOrgChat ? (
                <OrganizerChat
                  tournament={tournament}
                  currentUser={profile || user}
                  senderBrand={profile?.brand_name}
                  onSendMessage={(msg) => sendOrgChatMutation.mutate(msg)}
                  isLoading={sendOrgChatMutation.isPending}
                />
              ) : (
                <OrganizerChatLocked />
              )}
            </TabsContent>
          )}

          {/* Timeline Tab */}
          <TabsContent value="log">
            <FloatingPanel className="p-6">
              <h3 className="text-white font-bold mb-4">Tournament Timeline</h3>
              <div className="space-y-4">
                {tournament.tournament_log && tournament.tournament_log.length > 0 ? (
                  tournament.tournament_log.map((log, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{log.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No activity yet</p>
                )}
              </div>
            </FloatingPanel>
          </TabsContent>
        </Tabs>

        {/* Staff Chat Modal */}
        <Dialog open={showStaffChatModal} onOpenChange={setShowStaffChatModal}>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Staff Support Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-96 overflow-y-auto p-4 bg-zinc-950 rounded-lg space-y-3">
                {tournament.support_chat && tournament.support_chat.length > 0 ? (
                  tournament.support_chat.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender_role === 'organizer' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_role === 'organizer'
                            ? 'bg-red-600 text-white'
                            : 'bg-zinc-800 text-gray-200'
                        }`}
                      >
                        <p className="text-xs opacity-70 mb-1">{msg.sender_name} • {msg.sender_role}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendStaffMessageMutation.mutate(newMessage);
                    }
                  }}
                />
                <GlowButton
                  onClick={() => newMessage.trim() && sendStaffMessageMutation.mutate(newMessage)}
                  disabled={!newMessage.trim()}
                >
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>


      </div>
    </OrganizerLayout>
  );
}