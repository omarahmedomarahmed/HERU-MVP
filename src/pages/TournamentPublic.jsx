import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HeruLogo from '@/components/shared/HeruLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { OrganizerProfile, SponsorshipRadar, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import {
  Trophy, Users, Calendar, MapPin, Twitch, Share2, Lock, Check,
  Play, Zap, Eye, ChevronRight, ArrowRight, Activity, Target, Award, Flame, X as XIcon, ArrowLeft
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

export default function TournamentPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [registerModal, setRegisterModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [inGameId, setInGameId] = useState('');
  const [rank, setRank] = useState('');

  useEffect(() => {
    apiCall('/auth/me').then(u => setUser(u)).catch(() => setUser(null));
  }, []);

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament-public', id],
    queryFn: async () => {
      const allT = await Tournament.list();
      return allT.find(t => t.id === id) || null;
    },
  });

  const { data: allTeams = [] } = useQuery({
    queryKey: ['teams-for-tournament', id],
    queryFn: () => Team.list(),
  });

  const { data: radar } = useQuery({
    queryKey: ['radar-for-tournament', id],
    queryFn: async () => {
      const allR = await SponsorshipRadar.list();
      return allR.find(r => r.tournament_id === id) || null;
    },
  });

  const { data: mainOrgProfile } = useQuery({
    queryKey: ['main-org-profile', tournament?.main_organizer_id],
    queryFn: async () => {
      const allP = await OrganizerProfile.list();
      return allP.find(p => p.user_id === tournament?.main_organizer_id) || null;
    },
    enabled: !!tournament?.main_organizer_id,
  });

  const { data: userTeams = [] } = useQuery({
    queryKey: ['user-teams', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const allT = await Team.list();
      return allT.filter(t => t.leader_id === user.id);
    },
    enabled: !!user?.id,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const updated = await Tournament.update(id, {
        join_requests: [
          ...(tournament?.join_requests || []),
          {
            team_id: selectedTeam,
            team_name: userTeams.find(t => t.id === selectedTeam)?.name,
            user_id: user.id,
            game: tournament?.game,
            game_id: inGameId,
            rank,
            status: 'pending',
            submitted_at: new Date().toISOString()
          }
        ]
      });
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament-public', id]);
      setRegisterModal(false);
      setSelectedTeam(null);
      setInGameId('');
      setRank('');
    }
  });

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
  const isLeader = user?.id && userTeams.some(t => t.leader_id === user.id);
  const canRegister = tournament.status === 'published' && isLeader && !tournament.join_requests?.some(r => r.user_id === user?.id);

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
            <Link to="/tournaments" className="flex items-center gap-2 text-gray-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tournaments</span>
            </Link>
            {tournament.stream_link && (
              <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer">
                <GlowButton variant="secondary" size="sm">
                  <Twitch className="w-4 h-4" /> Watch Live
                </GlowButton>
              </a>
            )}
            <GlowButton variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </GlowButton>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12">
        {/* Banner */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          {tournament.tournament_image && (
            <img src={tournament.tournament_image} alt={tournament.name} className="w-full h-full object-cover opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl w-full mx-auto px-6 py-8">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl md:text-5xl font-black text-white">{tournament.name}</h1>
                    <span className={`text-sm px-3 py-1 rounded font-bold ${statusBadgeStyle(tournament.status)}`}>
                      {tournament.status === 'live' ? '🔴 LIVE' : tournament.status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-gray-300 text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" /> {tournament.game}
                    </span>
                    {tournament.schedule && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> {new Date(tournament.schedule).toLocaleDateString()}
                      </span>
                    )}
                    {tournament.is_offline && tournament.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {tournament.venue}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      {tournament.is_offline ? 'Offline' : 'Online'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">Prize Pool</p>
              <p className="text-white font-bold text-lg">EGP {tournament.prizepool_total?.toLocaleString() || '0'}</p>
            </FloatingPanel>
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">Teams</p>
              <p className="text-white font-bold text-lg">{tournament.teams?.length || 0}/{tournament.max_teams || '∞'}</p>
            </FloatingPanel>
            <FloatingPanel className="p-4">
              <p className="text-gray-500 text-xs mb-1">Format</p>
              <p className="text-white font-bold text-lg">{tournament.format || 'TBD'}</p>
            </FloatingPanel>
          </div>

          {/* Description */}
          {tournament.description && (
            <FloatingPanel className="p-6 mb-8">
              <p className="text-gray-300 leading-relaxed">{tournament.description}</p>
            </FloatingPanel>
          )}

          {/* Organized By */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">ORGANIZED BY</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mainOrgProfile && (
                <Link to={`/organizer/${mainOrgProfile.id}`}>
                  <GameCard className="p-5 hover:border-red-500/50 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center mx-auto mb-3">
                      {mainOrgProfile.brand_logo ? (
                        <img src={mainOrgProfile.brand_logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Trophy className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <p className="text-white font-bold text-sm">{mainOrgProfile.brand_name}</p>
                    <ChevronRight className="w-4 h-4 text-gray-500 mx-auto mt-2" />
                  </GameCard>
                </Link>
              )}
              {tournament.co_organizers?.length > 0 && tournament.co_organizers.map((co, i) => (
                <Link key={i} to={`/organizer/${co.organizer_id}`}>
                  <GameCard className="p-5 hover:border-red-500/50 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center mx-auto mb-3">
                      {co.brand_logo ? (
                        <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <p className="text-white font-bold text-sm">{co.brand_name}</p>
                    <ChevronRight className="w-4 h-4 text-gray-500 mx-auto mt-2" />
                  </GameCard>
                </Link>
              ))}
            </div>
          </div>

          {/* Talents */}
          {tournament.talents?.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">TALENT</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tournament.talents.map((talent, i) => (
                  <FloatingPanel key={i} className="p-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center mb-2">
                      <Flame className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-white font-bold text-sm mb-0.5">Talent {i + 1}</p>
                    <p className="text-gray-500 text-xs">{talent.talent_type}</p>
                  </FloatingPanel>
                ))}
              </div>
            </div>
          )}



          {/* Teams & Brackets Tab */}
          <Tabs defaultValue="teams" className="space-y-6">
            <TabsList className="bg-zinc-800/50 border border-zinc-700">
              <TabsTrigger value="teams">Teams ({teamsInTournament.length})</TabsTrigger>
              {tournament.brackets?.length > 0 && <TabsTrigger value="brackets">Live Brackets</TabsTrigger>}
            </TabsList>

            <TabsContent value="teams">
              {teamsInTournament.length > 0 ? (
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
              ) : (
                <FloatingPanel className="p-8 text-center">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-gray-400">No teams registered yet</p>
                </FloatingPanel>
              )}
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
                              <div className="flex-1">
                                <p className="text-white font-bold text-sm">{match.team1 || 'TBD'} vs {match.team2 || 'TBD'}</p>
                                {match.winner && (
                                  <p className="text-green-400 text-xs mt-1">✓ Winner: {match.winner}</p>
                                )}
                              </div>
                              {match.score1 !== undefined && match.score2 !== undefined && (
                                <div className="text-right ml-4">
                                  <p className="text-white font-bold">{match.score1} - {match.score2}</p>
                                </div>
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

          {/* Register Button */}
          {canRegister && (
            <div className="mt-8 flex justify-center">
              <Dialog open={registerModal} onOpenChange={setRegisterModal}>
                <DialogTrigger asChild>
                  <GlowButton className="text-lg px-8">
                    <Check className="w-5 h-5" /> Register Your Team
                  </GlowButton>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Register Team for {tournament.name}</DialogTitle>
                    <DialogDescription className="text-gray-400">Submit your team to compete in this tournament</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Select Your Team</label>
                      <select
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Choose a team...</option>
                        {userTeams.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">In-Game ID</label>
                      <Input
                        value={inGameId}
                        onChange={(e) => setInGameId(e.target.value)}
                        placeholder="e.g. ShadowWolves#123"
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Rank</label>
                      <Input
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        placeholder="e.g. Gold 2"
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <GlowButton
                      className="w-full"
                      onClick={() => registerMutation.mutate()}
                      disabled={!selectedTeam || registerMutation.isPending}
                    >
                      {registerMutation.isPending ? 'Submitting...' : 'Submit Registration'}
                    </GlowButton>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}