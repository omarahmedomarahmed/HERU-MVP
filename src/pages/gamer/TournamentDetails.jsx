import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import BracketVisual from '@/components/tournament/BracketVisual.jsx';
import RegisterTeamModal from '@/components/tournament/RegisterTeamModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { GamerProfile, Team, Tournament, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

import {
  Trophy, Users, Calendar, MapPin, Gamepad2, Play, Star,
  ArrowLeft, Award, ExternalLink, MessageSquare, Send,
  Share2, Check, Radio, Swords, User, Zap, LogIn, PlusCircle,
} from 'lucide-react';

export default function TournamentDetails() {
  // ── Auth: use AuthContext directly so user.id is always the UUID ──────────
  const { user } = useAuth();

  const [joinModal, setJoinModal] = useState(false);
  const [show1v1Modal, setShow1v1Modal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { id: tournamentId } = useParams();

  // ── Gamer profile ──────────────────────────────────────────────────────────
  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0] ?? null;
    },
    enabled: !!user?.id,
  });

  // ── Tournament ─────────────────────────────────────────────────────────────
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => Tournament.get(tournamentId),
    enabled: !!tournamentId,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  // ── Teams already in tournament ────────────────────────────────────────────
  const { data: teams = [] } = useQuery({
    queryKey: ['tournament-teams', tournament?.teams],
    queryFn: async () => {
      if (!tournament?.teams?.length) return [];
      const all = await Team.list();
      return all.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament?.teams?.length,
  });

  // ── My teams ───────────────────────────────────────────────────────────────
  const { data: myTeams = [] } = useQuery({
    queryKey: ['my-teams', profile?.team_ids],
    queryFn: async () => {
      if (!profile?.team_ids?.length) return [];
      const all = await Team.list();
      return all.filter(t => profile.team_ids.includes(t.id));
    },
    enabled: !!profile?.team_ids?.length,
  });

  // ── Talents ────────────────────────────────────────────────────────────────
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

  const prizepoolItems = [];

  // ── 1v1 join mutation ──────────────────────────────────────────────────────
  const joinAsPlayerMutation = useMutation({
    mutationFn: ({ gameId, rank }) =>
      Tournament.joinAsPlayer(tournamentId, { game_id: gameId, rank }),
    onSuccess: (data) => {
      toast({ title: data?.already_joined ? 'Already registered!' : 'Joined!', description: 'Taking you to the Arena…' });
      queryClient.invalidateQueries(['tournament', tournamentId]);
      setShow1v1Modal(false);
      setTimeout(() => navigate(`/gamer/arena/${tournamentId}`), 700);
    },
    onError: (err) => toast({ title: 'Failed to join', description: err.message, variant: 'destructive' }),
  });

  // ── General chat ───────────────────────────────────────────────────────────
  const sendMessageMutation = useMutation({
    mutationFn: async (message) => {
      await Tournament.sendGeneralChat(tournament.id, {
        user_id: user.id,
        sender_id: user.id,
        sender_name: profile?.username || user?.email?.split('@')[0] || 'Gamer',
        sender_type: 'gamer',
        message,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
      setNewMessage('');
    },
    onError: (err) => toast({ title: 'Message failed', description: err.message, variant: 'destructive' }),
  });

  // ── Derived state ──────────────────────────────────────────────────────────
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
          <Link to="/tournaments">
            <GlowButton className="mt-4">
              <ArrowLeft className="w-4 h-4" /> Back to Tournaments
            </GlowButton>
          </Link>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  const is1v1 = tournament.participant_type === 'player' || tournament.participant_type === '1v1';
  const teamsJoined = is1v1
    ? (tournament.player_participants?.length || 0)
    : (tournament.teams?.length || 0);
  const slotsLeft = tournament.max_teams ? tournament.max_teams - teamsJoined : null;

  // Team tournament participation state
  const myTeamInTournament = myTeams.some(t => tournament.teams?.includes(t.id));
  const myTeamPendingRequest = myTeams.some(t =>
    (tournament.join_requests || []).some(r => r.team_id === t.id && r.status === 'pending')
  );
  const myLeaderTeams = myTeams.filter(t => t.leader_id === user?.id);

  // 1v1 participation state
  const myPlayerJoined = is1v1 &&
    (tournament.player_participants || []).some(p => p.user_id === user?.id);

  // Can this gamer join?
  const isOpen = tournament.status === 'published';
  const isFull = slotsLeft !== null && slotsLeft <= 0;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Join CTA block (rendered once clearly below header) ───────────────────
  const JoinCTA = () => {
    if (!isOpen || isFull) return null;

    // Already in — go to arena
    if (myPlayerJoined || myTeamInTournament) {
      return (
        <FloatingPanel className="p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">
              {is1v1 ? "You're registered as a solo player" : `Your team is registered`}
            </span>
          </div>
          <GlowButton onClick={() => navigate(`/gamer/arena/${tournamentId}`)}
            className="bg-gradient-to-r from-red-600 to-red-700 border-red-500 shrink-0">
            <Zap className="w-4 h-4" /> Go to Arena
          </GlowButton>
        </FloatingPanel>
      );
    }

    // Request pending
    if (myTeamPendingRequest) {
      return (
        <FloatingPanel className="p-4 mb-6">
          <div className="flex items-center gap-2 text-amber-400">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">Join request pending — waiting for organizer approval</span>
          </div>
        </FloatingPanel>
      );
    }

    // Not logged in
    if (!user) {
      return (
        <FloatingPanel className="p-6 mb-6 text-center">
          <p className="text-gray-300 font-semibold mb-3">
            {is1v1 ? 'Sign in to enter this tournament as a solo player' : 'Sign in to register your team'}
          </p>
          <Link to="/auth/gamer/login">
            <GlowButton className="bg-gradient-to-r from-red-600 to-red-700 border-red-500">
              <LogIn className="w-4 h-4" /> Sign In to Join
            </GlowButton>
          </Link>
        </FloatingPanel>
      );
    }

    // 1v1 — show enter button
    if (is1v1) {
      return (
        <FloatingPanel className="p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">Enter as Solo Player</p>
            <p className="text-gray-400 text-sm mt-0.5">
              {teamsJoined} / {tournament.max_teams || '∞'} players registered
              {slotsLeft !== null && slotsLeft > 0 && (
                <span className="text-green-400 ml-2">· {slotsLeft} slots left</span>
              )}
            </p>
          </div>
          <GlowButton size="lg" onClick={() => setShow1v1Modal(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 border-red-500 shadow-lg shadow-red-900/30 shrink-0">
            <Swords className="w-5 h-5" /> Enter the Arena
          </GlowButton>
        </FloatingPanel>
      );
    }

    // Team tournament — has eligible leader teams
    if (myLeaderTeams.length > 0) {
      return (
        <FloatingPanel className="p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-lg">Register Your Team</p>
            <p className="text-gray-400 text-sm mt-0.5">
              {teamsJoined} / {tournament.max_teams || '∞'} teams registered
              {slotsLeft !== null && slotsLeft > 0 && (
                <span className="text-green-400 ml-2">· {slotsLeft} slots left</span>
              )}
            </p>
          </div>
          <GlowButton size="lg" onClick={() => setJoinModal(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 border-red-500 shadow-lg shadow-red-900/30 shrink-0">
            <Users className="w-5 h-5" /> Register Your Team
          </GlowButton>
        </FloatingPanel>
      );
    }

    // In a team but not leader
    if (myTeams.length > 0 && myLeaderTeams.length === 0) {
      return (
        <FloatingPanel className="p-5 mb-6 flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-500 shrink-0" />
          <p className="text-gray-400 text-sm">
            You're in a team but only the team leader can register. Ask your leader to join this tournament.
          </p>
        </FloatingPanel>
      );
    }

    // No teams at all — prompt to create one
    return (
      <FloatingPanel className="p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-white font-bold">You need a team to join</p>
          <p className="text-gray-400 text-sm mt-0.5">Create a team first, then come back to register.</p>
        </div>
        <Link to="/gamer/teams/create" className="shrink-0">
          <GlowButton>
            <PlusCircle className="w-4 h-4" /> Create a Team
          </GlowButton>
        </Link>
      </FloatingPanel>
    );
  };

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <Link to="/tournaments" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tournaments</span>
      </Link>

      {/* ── Header banner ─────────────────────────────────────────────────── */}
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
          <div className="flex-1 min-w-0 mr-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <HexBadge className={
                tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-400 border-gray-500/50' : ''
              }>
                {tournament.status === 'live' && '🔴 LIVE'}
                {tournament.status === 'published' && 'OPEN'}
                {tournament.status === 'completed' && 'ENDED'}
                {tournament.status === 'draft' && 'DRAFT'}
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
            {/* Organizer + Co-organizer logos */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {tournament.organizer_brand && (
                <Link to={`/organizer/${tournament.organizer_id}`} className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
                  {(tournament.organizer_brand.logo || tournament.organizer_brand.brand_logo) && (
                    <img src={tournament.organizer_brand.logo || tournament.organizer_brand.brand_logo} alt="" className="w-6 h-6 rounded object-cover border border-white/10" />
                  )}
                  <span className="text-sm">{tournament.organizer_brand.name || tournament.organizer_brand.brand_name}</span>
                </Link>
              )}
              {(tournament.co_organizers || []).filter(co => co.brand_name || co.brand_logo).map((co, i) => (
                <span key={i} className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <span className="text-gray-600">·</span>
                  {co.brand_logo && <img src={co.brand_logo} alt="" className="w-6 h-6 rounded object-cover border border-white/10" />}
                  {co.brand_name}
                </span>
              ))}
            </div>
          </div>

          {/* Header action buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <GlowButton variant="ghost" size="sm" onClick={handleCopyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share'}
            </GlowButton>
            {tournament.stream_link && (
              <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="secondary" size="lg">
                  <Radio className="w-5 h-5" /> Watch Stream
                </GlowButton>
              </a>
            )}
            {/* Quick "Go to Arena" in header for already-registered */}
            {(myPlayerJoined || myTeamInTournament) && tournament.status !== 'completed' && (
              <GlowButton size="lg" onClick={() => navigate(`/gamer/arena/${tournamentId}`)}
                className="bg-gradient-to-r from-red-600 to-red-700 border-red-500">
                <Zap className="w-5 h-5" /> Arena
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

      {/* ── JOIN CTA (prominent, below header) ────────────────────────────── */}
      <JoinCTA />

      {/* ── Stream block ──────────────────────────────────────────────────── */}
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
      ) : null}

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Overview</TabsTrigger>
          <TabsTrigger value="brackets" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Brackets</TabsTrigger>
          <TabsTrigger value="prizes" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Prizes</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Chat</TabsTrigger>
          <TabsTrigger value="log" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">Updates</TabsTrigger>
        </TabsList>

        {/* ── Overview ──────────────────────────────────────────────────── */}
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
                      <p className="text-gray-500 text-xs">{is1v1 ? 'Players' : 'Teams'}</p>
                      <p className="text-white font-medium">
                        {teamsJoined} / {tournament.max_teams || '∞'}
                        {slotsLeft !== null && slotsLeft > 0 && (
                          <span className="text-green-400 ml-2">({slotsLeft} left)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {tournament.schedule && (
                    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-gray-500 text-xs">Date</p>
                        <p className="text-white font-medium">
                          {new Date(tournament.schedule).toLocaleDateString()}
                        </p>
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

              {/* Participants panel */}
              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  {is1v1
                    ? <><Swords className="w-5 h-5 text-red-500" /> Players ({teamsJoined})</>
                    : <><Users className="w-5 h-5 text-red-500" /> Teams ({teamsJoined})</>
                  }
                </h2>

                {/* 1v1 players */}
                {is1v1 && (tournament.player_participants || []).length > 0 && (
                  <div className="grid md:grid-cols-2 gap-3 mb-4">
                    {tournament.player_participants.map((p, idx) => {
                      const isMe = p.user_id === user?.id;
                      return (
                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border ${isMe ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-800/50'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMe ? 'bg-red-500/20' : 'bg-zinc-700'}`}>
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {p.username || 'Player'}
                              {isMe && <span className="text-red-400 text-xs ml-2">(You)</span>}
                            </p>
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
                      const isMyTeam = myTeams.some(t => t.id === team.id);
                      return (
                        <Link key={team.id} to={`/gamer/teams/${team.id}`}>
                          <GameCard className={`p-4 transition-colors ${isMyTeam ? 'border-red-500/50 bg-red-500/5' : ''}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden ${isMyTeam ? 'bg-red-500/20 ring-2 ring-red-500/30' : 'bg-zinc-800'}`}>
                                {team.logo
                                  ? <img src={team.logo} alt="" className="w-full h-full object-cover" />
                                  : <Users className="w-6 h-6 text-red-500" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-white font-medium truncate">{team.name}</p>
                                  {isMyTeam && <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">YOU</span>}
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
                    <p className="text-gray-500">No players have joined yet — be the first!</p>
                  </div>
                )}
              </FloatingPanel>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {talents.length > 0 && (
                <FloatingPanel className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" /> Featured Talent
                  </h2>
                  <div className="space-y-3">
                    {talents.map((talent) => (
                      <Link key={talent.id} to={`/gamer/${talent.user_id}`}>
                        <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
                            {talent.avatar
                              ? <img src={talent.avatar} alt="" className="w-full h-full object-cover" />
                              : <Star className="w-5 h-5 text-yellow-500" />
                            }
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

        {/* ── Brackets ────────────────────────────────────────────────────── */}
        <TabsContent value="brackets">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" /> Tournament Brackets
              {tournament.status === 'live' && (
                <span className="ml-2 flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
                </span>
              )}
            </h2>
            {tournament.brackets?.length > 0 ? (
              <>
                <BracketVisual
                  brackets={tournament.brackets}
                  teams={teams}
                  allTeams={teams}
                  onInviteClick={() => {}}
                  onSelectWinner={() => {}}
                  readOnly
                />
                {/* Match stream links */}
                {tournament.brackets.some(round =>
                  (Array.isArray(round?.matches) ? round.matches : (Array.isArray(round) ? round : [])).some(m => m.stream_link)
                ) && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Radio className="w-4 h-4 text-red-400" /> Live Match Streams
                    </h3>
                    {tournament.brackets.map((round, rIdx) => {
                      const matches = Array.isArray(round?.matches) ? round.matches : (Array.isArray(round) ? round : [])
                      return matches.filter(m => m.stream_link).map((m, mIdx) => {
                        const t1 = teams.find(t => t.id === m.team1)
                        const t2 = teams.find(t => t.id === m.team2)
                        return (
                          <a
                            key={`${rIdx}-${mIdx}`}
                            href={m.stream_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                              <div>
                                <p className="text-white text-sm font-bold">
                                  {t1?.name || 'TBD'} vs {t2?.name || 'TBD'}
                                </p>
                                <p className="text-gray-500 text-xs">Round {rIdx + 1} · Match {mIdx + 1}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-red-400 group-hover:text-red-300">
                              <Play className="w-4 h-4" />
                              <span className="text-xs font-bold">Watch Live</span>
                            </div>
                          </a>
                        )
                      })
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-gray-400">Brackets will be revealed soon</p>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* ── Prizes ──────────────────────────────────────────────────────── */}
        <TabsContent value="prizes">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" /> Prize Pool
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
                      {item.image
                        ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center"><Award className="w-12 h-12 text-zinc-600" /></div>
                      }
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

        {/* ── Chat ────────────────────────────────────────────────────────── */}
        <TabsContent value="chat">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-500" /> Tournament Chat
            </h2>
            <div className="h-80 overflow-y-auto mb-4 space-y-3 p-4 bg-zinc-950 rounded-lg">
              {(tournament.general_chat || []).map((msg, idx) => (
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
                    if (e.key === 'Enter' && newMessage.trim()) sendMessageMutation.mutate(newMessage);
                  }}
                />
                <GlowButton
                  onClick={() => newMessage.trim() && sendMessageMutation.mutate(newMessage)}
                  disabled={sendMessageMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            ) : (
              <Link to="/auth/gamer/login">
                <GlowButton className="w-full">
                  <LogIn className="w-4 h-4" /> Sign in to chat
                </GlowButton>
              </Link>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* ── Updates ─────────────────────────────────────────────────────── */}
        <TabsContent value="log">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Tournament Updates</h2>
            <div className="space-y-4">
              {[...(tournament.tournament_log || [])].reverse().map((log, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-zinc-800 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
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

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <RegisterTeamModal
        open={joinModal}
        onClose={() => setJoinModal(false)}
        onArenaRedirect={() => navigate(`/gamer/arena/${tournamentId}`)}
        tournament={tournament}
        myTeams={myTeams}
        user={user}
      />

      <JoinAs1v1Modal
        open={show1v1Modal}
        onClose={() => setShow1v1Modal(false)}
        tournament={tournament}
        profile={profile}
        isLoading={joinAsPlayerMutation.isPending}
        onSubmit={({ gameId, rank }) => joinAsPlayerMutation.mutate({ gameId, rank })}
      />
    </GamerLayout>
  );
}

// ── 1v1 Join Modal ─────────────────────────────────────────────────────────────
function JoinAs1v1Modal({ open, onClose, tournament, profile, isLoading, onSubmit }) {
  const [gameId, setGameId] = useState('');
  const [rank, setRank] = useState('');

  // Pre-fill from profile if game matches
  React.useEffect(() => {
    if (!open) return;
    const match = (profile?.games || []).find(
      g => g.game_name?.toLowerCase() === tournament?.game?.toLowerCase()
    );
    if (match) {
      setGameId(match.game_id || '');
      setRank(match.rank || '');
    }
  }, [open, profile, tournament]);

  const gamePlaceholders = {
    'Valorant':          'e.g. PlayerName#EUW',
    'CS2':               'e.g. steam_username',
    'League of Legends': 'e.g. SummonerName#EUW',
    'PUBG':              'e.g. Player#1234',
    'Fortnite':          'e.g. EpicGamesUsername',
    'Apex Legends':      'e.g. EA_Username',
  };
  const placeholder = gamePlaceholders[tournament?.game] || `Your ${tournament?.game || 'game'} ID`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Swords className="w-5 h-5 text-red-500" /> Enter the Arena
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Tournament summary */}
          <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Tournament</span>
              <span className="text-white font-semibold text-sm">{tournament?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Game</span>
              <span className="text-white font-semibold text-sm flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-red-400" /> {tournament?.game}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Players</span>
              <span className="text-white text-sm">
                {tournament?.player_participants?.length || 0} / {tournament?.max_teams || '∞'}
              </span>
            </div>
            {tournament?.prizepool_total > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Prize Pool</span>
                <span className="text-yellow-400 font-bold text-sm">
                  EGP {tournament.prizepool_total.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* In-game ID */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block font-medium">
              Your In-Game ID <span className="text-red-400">*</span>
            </label>
            <Input
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              placeholder={placeholder}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-gray-600 text-xs mt-1">
              This is the ID the organizer will use to identify you. Make sure it's correct — it cannot be changed after joining.
            </p>
          </div>

          {/* Rank */}
          <div>
            <label className="text-gray-400 text-xs mb-1.5 block font-medium">Current Rank</label>
            <Input
              value={rank}
              onChange={e => setRank(e.target.value)}
              placeholder="e.g. Diamond, Platinum, Global Elite…"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <GlowButton
            className="w-full bg-gradient-to-r from-red-600 to-red-700 border-red-500"
            disabled={!gameId.trim() || isLoading}
            onClick={() => onSubmit({ gameId, rank })}
          >
            {isLoading ? (
              <span className="flex items-center gap-2"><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Joining…</span>
            ) : (
              <span className="flex items-center gap-2"><Swords className="w-4 h-4" /> Confirm & Enter Arena</span>
            )}
          </GlowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
