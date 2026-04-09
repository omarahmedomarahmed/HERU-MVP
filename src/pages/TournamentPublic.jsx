import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HeruLogo from '@/components/shared/HeruLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { OrganizerProfile, Team, Tournament, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Trophy, Users, Calendar, MapPin, Twitch, Share2, Check,
  Zap, ChevronRight, Award, Flame, ArrowLeft, Swords, User,
  Gamepad2, Lock, LogIn, UserPlus, Clock, CheckCircle2
} from 'lucide-react';

const statusBadgeStyle = (status) => {
  const map = {
    draft: 'bg-zinc-700 text-gray-300',
    published: 'bg-red-500/20 text-red-400',
    live: 'bg-green-500/20 text-green-400 animate-pulse',
    completed: 'bg-gray-600/20 text-gray-400'
  };
  return map[status] || 'bg-zinc-700 text-gray-400';
};

const GAME_PLACEHOLDERS = {
  'Valorant': 'e.g. PlayerName#EUW',
  'CS2': 'e.g. steam_username',
  'League of Legends': 'e.g. SummonerName#EUW',
  'PUBG': 'e.g. Player#1234',
  'Fortnite': 'e.g. EpicGamesUsername',
  'Apex Legends': 'e.g. EA_Username',
};

export default function TournamentPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Auth — use the hook directly (gives correct user.id) ──────────────────
  const { user, isGamer, isAuthenticated } = useAuth();

  // Local modal state
  const [registerModal, setRegisterModal] = useState(false);
  const [show1v1Modal, setShow1v1Modal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [inGameId, setInGameId] = useState('');
  const [rank, setRank] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament-public', id],
    queryFn: () => Tournament.get(id),
    enabled: !!id,
  });

  const { data: allTeams = [] } = useQuery({
    queryKey: ['teams-for-tournament', id],
    queryFn: () => Team.list(),
    enabled: !!tournament,
  });

  const { data: mainOrgProfile } = useQuery({
    queryKey: ['main-org-profile', tournament?.main_organizer_id],
    queryFn: async () => {
      const allP = await OrganizerProfile.list();
      return allP.find(p => p.user_id === tournament?.main_organizer_id) || null;
    },
    enabled: !!tournament?.main_organizer_id,
  });

  // My teams (only loaded when user is logged in)
  const { data: userTeams = [] } = useQuery({
    queryKey: ['user-leader-teams', user?.id],
    queryFn: async () => {
      const allT = await Team.list();
      return allT.filter(t => t.leader_id === user.id);
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  // My gamer profile (for pre-filling in-game ID)
  const { data: gamerProfile } = useQuery({
    queryKey: ['gamer-profile-for-join', user?.id],
    queryFn: () => apiCall(`/gamers/by-user/${user.id}`),
    enabled: !!user?.id,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const teamRegisterMutation = useMutation({
    mutationFn: async () => {
      const team = userTeams.find(t => t.id === selectedTeam);
      return Tournament.joinRequest(id, {
        team_id: selectedTeam,
        team_name: team?.name || '',
        game: tournament?.game,
        game_id: inGameId,
        rank,
      });
    },
    onSuccess: () => {
      toast({ title: 'Request submitted!', description: 'The organizer will review your registration.' });
      queryClient.invalidateQueries(['tournament-public', id]);
      setRegisterModal(false);
      setSelectedTeam('');
      setInGameId('');
      setRank('');
    },
    onError: (err) => {
      toast({ title: 'Failed to submit', description: err.message, variant: 'destructive' });
    },
  });

  const join1v1Mutation = useMutation({
    mutationFn: ({ gameId, playerRank }) =>
      apiCall(`/tournaments/${id}/join-player`, {
        method: 'POST',
        body: { game_id: gameId, rank: playerRank },
      }),
    onSuccess: () => {
      toast({ title: 'You\'re in!', description: 'Redirecting to your Arena...' });
      queryClient.invalidateQueries(['tournament-public', id]);
      setShow1v1Modal(false);
      setTimeout(() => navigate(`/gamer/arena/${id}`), 800);
    },
    onError: (err) => {
      toast({ title: 'Failed to join', description: err.message, variant: 'destructive' });
    },
  });

  // ── Derived state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <FloatingPanel className="p-8 text-center max-w-md">
          <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-400">Tournament not found</p>
          <Link to="/">
            <GlowButton className="mt-4" variant="secondary">Back to Home</GlowButton>
          </Link>
        </FloatingPanel>
      </div>
    );
  }

  const teamsInTournament = allTeams.filter(t => tournament.teams?.includes(t.id));
  const is1v1 = tournament.participant_type === 'player' || tournament.participant_type === '1v1';
  const isOpen = tournament.status === 'published';
  const isLive = tournament.status === 'live';
  const isDone = tournament.status === 'completed';

  // Check gamer's current state in this tournament
  const myTeamInTournament = userTeams.some(t => tournament.teams?.includes(t.id));
  const myPendingRequest = tournament.join_requests?.some(
    r => userTeams.some(t => t.id === r.team_id) && r.status === 'pending'
  );
  const my1v1Joined = is1v1 && (tournament.player_participants || []).some(p => p.user_id === user?.id);
  const alreadyIn = myTeamInTournament || my1v1Joined;
  const hasPending = myPendingRequest && !myTeamInTournament;

  // Leader teams eligible to register
  const eligibleTeams = userTeams.filter(t => !tournament.teams?.includes(t.id));
  const slotsLeft = tournament.max_teams
    ? tournament.max_teams - (is1v1 ? (tournament.player_participants?.length || 0) : (tournament.teams?.length || 0))
    : null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <AnimatedBackground />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <HeruLogo className="h-7" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/tournaments" className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </Link>
            {tournament.stream_link && (
              <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="secondary" size="sm">
                  <Twitch className="w-4 h-4" /> Watch Live
                </GlowButton>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12">
        {/* Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {tournament.tournament_image ? (
            <img src={tournament.tournament_image} alt={tournament.name} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl w-full mx-auto px-6 py-8">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusBadgeStyle(tournament.status)}`}>
                      {isLive ? '🔴 LIVE' : tournament.status?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5" /> {tournament.game}
                    </span>
                    {slotsLeft !== null && slotsLeft > 0 && isOpen && (
                      <span className="text-xs text-green-400 font-medium">{slotsLeft} slots left</span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{tournament.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm">
                    {tournament.schedule && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {new Date(tournament.schedule).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    {tournament.is_offline && tournament.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {tournament.venue}
                      </span>
                    )}
                    {tournament.format && (
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" /> {tournament.format}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* ── JOIN CTA SECTION ─────────────────────────────────────────── */}
          {!isDone && (
            <div className="mb-8">
              {/* Already in — Go to Arena */}
              {alreadyIn && (
                <div className="rounded-2xl bg-green-500/10 border border-green-500/30 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
                    <div>
                      <p className="text-green-300 font-bold">You're competing in this tournament</p>
                      <p className="text-gray-400 text-sm">
                        {isOpen ? 'Tournament hasn\'t started yet. You\'ll be seeded when it goes live.' : 'Check your Arena for match updates.'}
                      </p>
                    </div>
                  </div>
                  <GlowButton
                    onClick={() => navigate(`/gamer/arena/${id}`)}
                    className="bg-gradient-to-r from-green-700 to-green-800 border-green-600 whitespace-nowrap shrink-0"
                  >
                    <Zap className="w-4 h-4" /> Go to My Arena
                  </GlowButton>
                </div>
              )}

              {/* Pending request */}
              {hasPending && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-amber-300 font-bold">Registration Pending</p>
                    <p className="text-gray-400 text-sm">The organizer will review and approve your team's request.</p>
                  </div>
                </div>
              )}

              {/* Open & not registered */}
              {isOpen && !alreadyIn && !hasPending && (
                <div className="rounded-2xl bg-gradient-to-r from-red-900/20 to-zinc-900/60 border border-red-500/30 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div>
                      <p className="text-white font-black text-xl mb-1">
                        {is1v1 ? '⚔️ Enter as Solo Player' : '🏆 Register Your Team'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {is1v1
                          ? 'This is a solo (1v1) tournament. Enter with your in-game ID.'
                          : 'Team tournament. You must be the leader of a team to register.'}
                      </p>
                      {tournament.prizepool_total > 0 && (
                        <p className="text-yellow-400 text-sm font-bold mt-1">
                          💰 EGP {tournament.prizepool_total.toLocaleString()} Prize Pool
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto">
                      {/* NOT LOGGED IN */}
                      {!isAuthenticated && (
                        <div className="space-y-2">
                          <GlowButton
                            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 border-red-500"
                            onClick={() => navigate('/auth/gamer/login')}
                          >
                            <LogIn className="w-4 h-4" />
                            Sign In to Join
                          </GlowButton>
                          <p className="text-center text-gray-500 text-xs">
                            No account?{' '}
                            <button onClick={() => navigate('/auth/gamer/register')}
                              className="text-red-400 hover:text-red-300 underline">
                              Register free
                            </button>
                          </p>
                        </div>
                      )}

                      {/* LOGGED IN — 1v1 */}
                      {isAuthenticated && isGamer && is1v1 && (
                        <GlowButton
                          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 border-red-500 shadow-lg shadow-red-900/30"
                          onClick={() => setShow1v1Modal(true)}
                        >
                          <Swords className="w-5 h-5" /> Enter the Arena
                        </GlowButton>
                      )}

                      {/* LOGGED IN — team, has eligible teams */}
                      {isAuthenticated && isGamer && !is1v1 && eligibleTeams.length > 0 && (
                        <GlowButton
                          className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 border-red-500"
                          onClick={() => setRegisterModal(true)}
                        >
                          <Users className="w-5 h-5" /> Register Your Team
                        </GlowButton>
                      )}

                      {/* LOGGED IN — team, no teams at all */}
                      {isAuthenticated && isGamer && !is1v1 && userTeams.length === 0 && (
                        <div className="text-right space-y-1">
                          <GlowButton
                            variant="secondary"
                            onClick={() => navigate('/gamer/teams/create')}
                          >
                            <UserPlus className="w-4 h-4" /> Create a Team First
                          </GlowButton>
                          <p className="text-gray-500 text-xs text-center">You need to lead a team to enter</p>
                        </div>
                      )}

                      {/* LOGGED IN — not a gamer role */}
                      {isAuthenticated && !isGamer && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border border-zinc-700 rounded-lg text-sm text-gray-400">
                          <Lock className="w-4 h-4" /> Gamer account required
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Live but not registered */}
              {isLive && !alreadyIn && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center gap-3">
                  <Flame className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <p className="text-white font-bold">Registration is closed — Tournament is Live</p>
                    <p className="text-gray-400 text-sm">Follow the stream and live brackets below.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">Prize Pool</p>
              <p className="text-yellow-400 font-bold text-lg">EGP {tournament.prizepool_total?.toLocaleString() || '0'}</p>
            </FloatingPanel>
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">{is1v1 ? 'Players' : 'Teams'}</p>
              <p className="text-white font-bold text-lg">
                {is1v1 ? (tournament.player_participants?.length || 0) : (tournament.teams?.length || 0)}
                <span className="text-gray-500 text-sm">/{tournament.max_teams || '∞'}</span>
              </p>
            </FloatingPanel>
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">Format</p>
              <p className="text-white font-bold text-lg">{tournament.format || 'TBD'}</p>
            </FloatingPanel>
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">Type</p>
              <p className="text-white font-bold text-lg">{is1v1 ? 'Solo 1v1' : 'Team vs Team'}</p>
            </FloatingPanel>
          </div>

          {/* Description */}
          {tournament.description && (
            <FloatingPanel className="p-6 mb-8">
              <p className="text-gray-300 leading-relaxed">{tournament.description}</p>
            </FloatingPanel>
          )}

          {/* Organized By */}
          {(mainOrgProfile || tournament.co_organizers?.length > 0) && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Organized By</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mainOrgProfile && (
                  <Link to={`/organizer/${mainOrgProfile.id}`}>
                    <GameCard className="p-5 hover:border-red-500/50 text-center">
                      <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center mx-auto mb-3">
                        {mainOrgProfile.brand_logo ? (
                          <img src={mainOrgProfile.brand_logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="w-7 h-7 text-red-500" />
                        )}
                      </div>
                      <p className="text-white font-bold text-sm">{mainOrgProfile.brand_name}</p>
                    </GameCard>
                  </Link>
                )}
                {tournament.co_organizers?.map((co, i) => (
                  <Link key={i} to={`/organizer/${co.organizer_id}`}>
                    <GameCard className="p-5 hover:border-red-500/50 text-center">
                      <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center mx-auto mb-3">
                        {co.brand_logo ? (
                          <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-7 h-7 text-red-500" />
                        )}
                      </div>
                      <p className="text-white font-bold text-sm">{co.brand_name}</p>
                    </GameCard>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Talents */}
          {tournament.talents?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Featured Talent</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tournament.talents.map((talent, i) => (
                  <FloatingPanel key={i} className="p-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                      <Flame className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-white font-bold text-sm">{talent.talent_type || `Talent ${i + 1}`}</p>
                  </FloatingPanel>
                ))}
              </div>
            </div>
          )}

          {/* Teams & Brackets Tab */}
          <Tabs defaultValue="teams" className="space-y-6">
            <TabsList className="bg-zinc-800/50 border border-zinc-700">
              <TabsTrigger value="teams">
                {is1v1 ? `Players (${tournament.player_participants?.length || 0})` : `Teams (${teamsInTournament.length})`}
              </TabsTrigger>
              {tournament.brackets?.length > 0 && <TabsTrigger value="brackets">Live Brackets</TabsTrigger>}
            </TabsList>

            <TabsContent value="teams">
              {/* 1v1 Players */}
              {is1v1 && (tournament.player_participants || []).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tournament.player_participants.map((p, i) => {
                    const isMe = p.user_id === user?.id;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-800/50'}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isMe ? 'bg-red-500/20 text-red-400' : 'bg-zinc-700 text-gray-400'}`}>
                          {(p.username || p.game_id || '?')[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm truncate">{p.username || 'Player'}{isMe && <span className="text-red-400 text-xs ml-1">(you)</span>}</p>
                          {p.rank && <p className="text-gray-500 text-xs truncate">{p.rank}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : is1v1 ? (
                <FloatingPanel className="p-8 text-center">
                  <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-gray-400">No players registered yet</p>
                </FloatingPanel>
              ) : null}

              {/* Team tournament */}
              {!is1v1 && teamsInTournament.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamsInTournament.map((team) => (
                    <Link key={team.id} to={`/teams/${team.id}`}>
                      <GameCard className="p-5 hover:border-red-500/50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                            {team.logo ? (
                              <img src={team.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold truncate">{team.name}</p>
                            <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">View Team</span>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                      </GameCard>
                    </Link>
                  ))}
                </div>
              ) : !is1v1 ? (
                <FloatingPanel className="p-8 text-center">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-gray-400">No teams registered yet</p>
                </FloatingPanel>
              ) : null}
            </TabsContent>

            {tournament.brackets?.length > 0 && (
              <TabsContent value="brackets">
                <FloatingPanel className="p-6">
                  <div className="space-y-4">
                    {tournament.brackets.map((round, i) => (
                      <div key={i}>
                        <p className="text-white font-bold mb-3">Round {round.round}</p>
                        <div className="space-y-2">
                          {round.matches?.map((match, j) => (
                            <div key={j} className="bg-zinc-800/50 rounded-lg p-4 flex items-center justify-between">
                              <p className="text-white font-bold text-sm">{match.team1 || 'TBD'} vs {match.team2 || 'TBD'}</p>
                              {match.winner && <p className="text-green-400 text-xs">Winner: {match.winner}</p>}
                              {match.score1 !== undefined && (
                                <p className="text-white font-bold ml-4">{match.score1} – {match.score2}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </FloatingPanel>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      {/* ── Team Register Modal ───────────────────────────────────────────────── */}
      <Dialog open={registerModal} onOpenChange={setRegisterModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" /> Register Your Team
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-zinc-800/50 rounded-lg text-sm space-y-1">
              <p className="text-gray-400">Tournament: <span className="text-white">{tournament.name}</span></p>
              <p className="text-gray-400">Game: <span className="text-white">{tournament.game}</span></p>
              <p className="text-gray-400">Slots: <span className="text-white">{tournament.teams?.length || 0}/{tournament.max_teams || '∞'}</span></p>
            </div>

            {eligibleTeams.length === 0 ? (
              <div className="text-center py-4">
                <Users className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">All your teams are already registered.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Select Your Team</label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="">Choose a team...</option>
                    {eligibleTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">In-Game ID / Username</label>
                  <Input
                    value={inGameId}
                    onChange={(e) => setInGameId(e.target.value)}
                    placeholder={GAME_PLACEHOLDERS[tournament.game] || 'Your in-game username'}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">Current Rank</label>
                  <Input
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    placeholder="e.g. Diamond, Platinum, Global Elite..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <GlowButton
                  className="w-full"
                  onClick={() => teamRegisterMutation.mutate()}
                  disabled={!selectedTeam || !inGameId || teamRegisterMutation.isPending}
                >
                  {teamRegisterMutation.isPending ? 'Submitting…' : 'Submit Registration'}
                </GlowButton>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 1v1 Join Modal ──────────────────────────────────────────────────── */}
      <Join1v1Modal
        open={show1v1Modal}
        onClose={() => setShow1v1Modal(false)}
        tournament={tournament}
        gamerProfile={gamerProfile}
        isPending={join1v1Mutation.isPending}
        onSubmit={({ gameId, playerRank }) => join1v1Mutation.mutate({ gameId, playerRank })}
      />
    </div>
  );
}

// ── 1v1 Join Modal ─────────────────────────────────────────────────────────────
function Join1v1Modal({ open, onClose, tournament, gamerProfile, isPending, onSubmit }) {
  const [gameId, setGameId] = useState('');
  const [rank, setRank] = useState('');

  useEffect(() => {
    if (!open) return;
    const match = (gamerProfile?.games || []).find(
      g => g.game_name?.toLowerCase() === tournament?.game?.toLowerCase()
    );
    if (match) {
      setGameId(match.game_id || '');
      setRank(match.rank || '');
    }
  }, [open, gamerProfile, tournament]);

  const placeholder = GAME_PLACEHOLDERS[tournament?.game] || `Your ${tournament?.game || 'game'} ID`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black">
            <Swords className="w-5 h-5 text-red-500" /> Enter the Arena
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          {/* Summary */}
          <div className="rounded-xl bg-zinc-800/60 border border-zinc-700 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Tournament</span>
              <span className="text-white font-semibold text-sm">{tournament?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Game</span>
              <span className="text-white text-sm flex items-center gap-1">
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
                <span className="text-yellow-400 font-bold text-sm">EGP {tournament.prizepool_total.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-gray-300 text-sm font-semibold block mb-1.5">
              Your In-Game ID <span className="text-red-400">*</span>
            </label>
            <Input
              value={gameId}
              onChange={e => setGameId(e.target.value)}
              placeholder={placeholder}
              className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500"
            />
            <p className="text-gray-500 text-xs mt-1">This is your public username in {tournament?.game}. Cannot be changed after joining.</p>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-semibold block mb-1.5">Current Rank</label>
            <Input
              value={rank}
              onChange={e => setRank(e.target.value)}
              placeholder="e.g. Diamond 2, Platinum, Global Elite…"
              className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500"
            />
          </div>

          <GlowButton
            className="w-full bg-gradient-to-r from-red-600 to-red-700 border-red-500 py-3"
            disabled={!gameId.trim() || isPending}
            onClick={() => onSubmit({ gameId: gameId.trim(), playerRank: rank.trim() })}
          >
            {isPending ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Joining…</span>
            ) : (
              <span className="flex items-center gap-2"><Swords className="w-4 h-4" /> Join Tournament</span>
            )}
          </GlowButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
