import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import BracketVisual from '@/components/tournament/BracketVisual.jsx';
import RegisterTeamModal from '@/components/tournament/RegisterTeamModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { GamerProfile, MarketplaceItem, Order, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/components/ui/use-toast'

import {
  Trophy, Users, Calendar, MapPin, Gamepad2, Play, Star,
  ArrowLeft, Clock, Award, ExternalLink, MessageSquare, Send,
  Share2, Copy, Check, Radio, Swords, User
} from 'lucide-react';

export default function TournamentDetails() {
  const [user, setUser] = useState(null);
  const [joinModal, setJoinModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { id: tournamentId } = useParams();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {}
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => Tournament.get(tournamentId),
    enabled: !!tournamentId,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['tournament-teams', tournament?.teams],
    queryFn: async () => {
      if (!tournament?.teams?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament?.teams?.length,
  });

  const { data: myTeams = [] } = useQuery({
    queryKey: ['my-teams', profile?.team_ids],
    queryFn: async () => {
      if (!profile?.team_ids?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => profile.team_ids.includes(t.id));
    },
    enabled: !!profile?.team_ids?.length,
  });

  const { data: talents = [] } = useQuery({
    queryKey: ['tournament-talents', tournament?.talents],
    queryFn: async () => {
      if (!tournament?.talents?.length) return [];
      const talentIds = tournament.talents.map(t => t.user_id);
      const profiles = await GamerProfile.list();
      return profiles.filter(p => talentIds.includes(p.user_id));
    },
    enabled: !!tournament?.talents?.length,
  });

  const { data: prizepoolItems = [] } = useQuery({
    queryKey: ['prizepool-items', tournament?.prizepool_items],
    queryFn: async () => {
      if (!tournament?.prizepool_items?.length) return [];
      const items = await MarketplaceItem.list();
      return items.filter(i => tournament.prizepool_items.includes(i.id));
    },
    enabled: !!tournament?.prizepool_items?.length,
  });



  const { toast } = useToast();

  const joinAsPlayerMutation = useMutation({
    mutationFn: async () => {
      const userId = user?.user?.id || user?.id;
      const matchingGame = (profile?.games || []).find(g =>
        g.game_name?.toLowerCase() === tournament?.game?.toLowerCase()
      );
      return Tournament.joinAsPlayer(tournamentId, {
        game_id: matchingGame?.game_id || '',
        rank: matchingGame?.rank || '',
      });
    },
    onSuccess: () => {
      toast({ title: 'Joined!', description: 'You have joined the tournament as a player.' });
      queryClient.invalidateQueries(['tournament', tournamentId]);
    },
    onError: (err) => {
      toast({ title: 'Failed to join', description: err.message, variant: 'destructive' });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      const msgObj = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        sender_type: 'gamer',
        message,
        timestamp: new Date().toISOString()
      };
      const updatedChat = [...(tournament.general_chat || []), msgObj];
      await Tournament.update(tournament.id, { general_chat: updatedChat });
      
      // Sync to DM thread for tournament chat
      const allDms = await Order.list();
      const tournamentDm = allDms.find(dm => dm.chat_type === 'tournament' && dm.reference_id === tournament.id);
      
      // Get all team member IDs in this tournament
      const allParticipants = new Set();
      teams.forEach(team => {
        team.members?.forEach(m => allParticipants.add(m));
      });
      
      if (tournamentDm) {
        const messages = tournamentDm.messages || [];
        messages.push({
          sender_id: user.id,
          sender_name: profile?.username || user.full_name,
          content: message,
          timestamp: new Date().toISOString()
        });
        await Order.update(tournamentDm.id, {
          messages,
          last_message_at: new Date().toISOString(),
          participants: Array.from(allParticipants)
        });
      } else {
        await Order.create({
          chat_type: 'tournament',
          chat_name: `${tournament.name} Chat`,
          reference_id: tournament.id,
          participants: Array.from(allParticipants),
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
      queryClient.invalidateQueries(['tournament', tournamentId]);
      queryClient.invalidateQueries(['my-conversations', user?.id]);
      setNewMessage('');
    }
  });

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

  if (!tournament) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">Tournament Not Found</h3>
          <Link to={'/tournaments'}>
            <GlowButton className="mt-4">
              <ArrowLeft className="w-4 h-4" /> Back to Tournaments
            </GlowButton>
          </Link>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  const is1v1 = tournament.participant_type === 'player';
  const teamsJoined = is1v1 ? (tournament.player_participants?.length || 0) : (tournament.teams?.length || 0);
  const slotsLeft = tournament.max_teams ? tournament.max_teams - teamsJoined : null;
  const myTeamInTournament = myTeams.some(t => tournament.teams?.includes(t.id));
  const myTeamPendingRequest = myTeams.some(t =>
    (tournament.join_requests || []).some(r => r.team_id === t.id && r.status === 'pending')
  );
  const myTeamIds = new Set(myTeams.map(t => t.id));
  const myPlayerJoined = is1v1 && (tournament.player_participants || []).some(p => p.user_id === user?.user?.id || p.user_id === user?.id);

  const shareUrl = window.location.href;
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <Link to={'/tournaments'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tournaments</span>
      </Link>

      {/* Header */}
      <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-6">
        {tournament.tournament_image ? (
          <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover opacity-60" />
        ) : tournament.organizer_brand?.logo ? (
          <img src={tournament.organizer_brand.logo} alt="" className="w-full h-full object-cover opacity-40" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        
        <div className="absolute inset-0 flex items-end p-6 md:p-8">
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3">
              <HexBadge className={
                tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' : ''
              }>
                {tournament.status === 'live' && '🔴 LIVE'}
                {tournament.status === 'published' && 'OPEN'}
                {tournament.status === 'completed' && 'ENDED'}
              </HexBadge>
              <HexBadge>
                <Gamepad2 className="w-3 h-3 mr-1" /> {tournament.game}
              </HexBadge>
              {tournament.prizepool_total > 0 && (
                <HexBadge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  💰 EGP {tournament.prizepool_total?.toLocaleString()}
                </HexBadge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{tournament.name}</h1>
            {tournament.organizer_brand?.name && (
              <Link
                to={`/organizer/${tournament.organizer_id}`}
                className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2 mt-1"
                onClick={e => e.stopPropagation()}
              >
                {tournament.organizer_brand?.logo && (
                  <img src={tournament.organizer_brand.logo} alt="" className="w-5 h-5 rounded object-cover" />
                )}
                by {tournament.organizer_brand.name}
              </Link>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Share */}
            <GlowButton variant="ghost" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </GlowButton>

            {tournament.stream_link && (
              <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="secondary" size="lg">
                  <Radio className="w-5 h-5" />
                  Watch Stream
                </GlowButton>
              </a>
            )}
            {/* Team tournament join */}
            {tournament.status === 'published' && !is1v1 && !myTeamInTournament && !myTeamPendingRequest && user && (
              <GlowButton size="lg" onClick={() => setJoinModal(true)}>
                <Users className="w-5 h-5" />
                Register Your Team
              </GlowButton>
            )}
            {/* 1v1 tournament join */}
            {tournament.status === 'published' && is1v1 && !myPlayerJoined && user && (
              <GlowButton size="lg" onClick={() => setJoinModal(true)}>
                <Swords className="w-5 h-5" /> Join as Player
              </GlowButton>
            )}
            {myTeamPendingRequest && (
              <HexBadge className="bg-amber-500/20 text-amber-400 border-amber-500/50">Request Pending</HexBadge>
            )}
            {(myTeamInTournament || myPlayerJoined) && (
              <HexBadge className="bg-green-500/20 text-green-400 border-green-500/50">Joined</HexBadge>
            )}
          </div>
        </div>
      </div>

      {/* Stream Embed */}
      {tournament.status === 'live' && tournament.stream_embed_url ? (
        <FloatingPanel className="mb-6 overflow-hidden" glowBorder>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-600/10 border-b border-red-500/20">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-sm font-bold uppercase tracking-wider">Live Stream</span>
          </div>
          <div className="aspect-video">
            <iframe
              src={tournament.stream_embed_url}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Tournament Stream"
            />
          </div>
        </FloatingPanel>
      ) : tournament.status === 'live' && tournament.stream_link ? (
        <FloatingPanel className="p-6 mb-6 text-center" glowBorder>
          <Radio className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-white font-bold mb-2">This tournament is live!</p>
          <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer">
            <GlowButton>
              <ExternalLink className="w-4 h-4" /> Watch on Stream
            </GlowButton>
          </a>
        </FloatingPanel>
      ) : tournament.status !== 'live' && (
        <FloatingPanel className="p-4 mb-6 text-center bg-zinc-900/50">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Radio className="w-4 h-4" />
            Stream will appear here when the tournament goes live
          </p>
        </FloatingPanel>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
          <TabsTrigger value="brackets" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Brackets</TabsTrigger>
          <TabsTrigger value="prizes" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Prizes</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Chat</TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Tournament Details</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-gray-500 text-xs">Format</p>
                      <p className="text-white font-medium">{tournament.format || 'TBD'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                    <Users className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-gray-500 text-xs">Teams</p>
                      <p className="text-white font-medium">
                        {teamsJoined} / {tournament.max_teams || '∞'}
                        {slotsLeft !== null && slotsLeft > 0 && (
                          <span className="text-green-400 ml-2">({slotsLeft} slots left)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {tournament.schedule && (
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Date</p>
                        <p className="text-white font-medium">{new Date(tournament.schedule).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {tournament.is_offline && tournament.venue && (
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Venue</p>
                        <p className="text-white font-medium">{tournament.venue}</p>
                      </div>
                    </div>
                  )}
                </div>

                {tournament.description && (
                  <div className="mt-6">
                    <h3 className="text-white font-bold mb-2">Description</h3>
                    <p className="text-gray-400">{tournament.description}</p>
                  </div>
                )}
              </FloatingPanel>

              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {is1v1 ? <Swords className="w-5 h-5 text-red-500" /> : <Users className="w-5 h-5 text-red-500" />}
                  {is1v1 ? `Players (${teamsJoined})` : `Participating Teams (${teamsJoined})`}
                </h2>

                {/* 1v1 Players */}
                {is1v1 && (tournament.player_participants || []).length > 0 && (
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {(tournament.player_participants || []).map((p, idx) => {
                      const isMe = p.user_id === (user?.user?.id || user?.id);
                      return (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${isMe ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-800/50'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMe ? 'bg-red-500/20' : 'bg-zinc-700'}`}>
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{p.username || 'Player'}{isMe && <span className="text-red-400 text-xs ml-2">(You)</span>}</p>
                            {p.rank && <p className="text-gray-500 text-xs">{p.rank}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Team participants */}
                {!is1v1 && teams.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {teams.map((team) => {
                      const isMyTeam = myTeamIds.has(team.id);
                      return (
                        <Link key={team.id} to={`/gamer/teams/${team.id}`}>
                          <GameCard className={`p-4 transition-colors ${isMyTeam ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${isMyTeam ? 'bg-red-500/20 ring-2 ring-red-500/30' : 'bg-zinc-800'}`}>
                                {team.logo ? (
                                  <img src={team.logo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-6 h-6 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-medium truncate">{team.name}</p>
                                  {isMyTeam && (
                                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">YOU</span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                              </div>
                            </div>
                          </GameCard>
                        </Link>
                      );
                    })}
                  </div>
                ) : !is1v1 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                    <p className="text-gray-500">No teams have joined yet</p>
                  </div>
                )}
                {is1v1 && (tournament.player_participants || []).length === 0 && (
                  <div className="text-center py-8">
                    <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                    <p className="text-gray-500">No players have joined yet</p>
                  </div>
                )}
              </FloatingPanel>
            </div>

            <div className="space-y-6">
              {talents.length > 0 && (
                <FloatingPanel className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Featured Talent
                  </h2>
                  <div className="space-y-3">
                    {talents.map((talent) => (
                      <Link key={talent.id} to={`/gamer/${talent.user_id}`}>
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
                            {talent.avatar ? (
                              <img src={talent.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Star className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{talent.username}</p>
                            <p className="text-gray-500 text-xs">{talent.talent_type}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </FloatingPanel>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="brackets">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Tournament Brackets
            </h2>
            
            {tournament.brackets?.length > 0 ? (
              <BracketVisual
                brackets={tournament.brackets}
                teams={teams}
                onInviteClick={() => {}}
                onSelectWinner={() => {}}
              />
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-gray-400">Brackets will be revealed soon</p>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="prizes">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              Prize Pool
            </h2>
            
            {tournament.prizepool_total > 0 && (
              <div className="text-center mb-8 p-6 bg-gradient-to-br from-yellow-500/20 to-zinc-900 rounded-xl">
                <p className="text-gray-400 text-sm mb-1">Total Prize Pool</p>
                <p className="text-4xl font-black text-yellow-400">EGP {tournament.prizepool_total?.toLocaleString()}</p>
              </div>
            )}

            {prizepoolItems.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {prizepoolItems.map((item) => (
                  <GameCard key={item.id} className="p-4">
                    <div className="aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award className="w-12 h-12 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-white font-bold">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.description}</p>
                  </GameCard>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Prize details coming soon</p>
            )}
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="chat">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" />
              Tournament Chat
            </h2>
            
            <div className="h-80 overflow-y-auto mb-4 space-y-3 p-4 bg-zinc-950 rounded-lg">
              {tournament.general_chat?.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_id === user?.id ? 'bg-red-600' : 'bg-zinc-800'}`}>
                    <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
              {(!tournament.general_chat || tournament.general_chat.length === 0) && (
                <p className="text-gray-500 text-center py-8">No messages yet. Be the first to chat!</p>
              )}
            </div>

            {user ? (
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessageMutation.mutate(newMessage);
                    }
                  }}
                />
                <GlowButton onClick={() => newMessage.trim() && sendMessageMutation.mutate(newMessage)}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            ) : (
              <p className="text-gray-500 text-center">Sign in to join the chat</p>
            )}
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="log">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tournament Updates</h2>
            <div className="space-y-4">
              {tournament.tournament_log?.slice().reverse().map((log, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                  <div>
                    <p className="text-white font-medium">{log.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(!tournament.tournament_log || tournament.tournament_log.length === 0) && (
                <p className="text-gray-500 text-center py-8">No updates yet</p>
              )}
            </div>
          </FloatingPanel>
        </TabsContent>
      </Tabs>

      {/* Register Team Modal */}
      <RegisterTeamModal
        open={joinModal}
        onClose={() => setJoinModal(false)}
        tournament={tournament}
        myTeams={myTeams}
        user={user}
      />
    </GamerLayout>
  );
}