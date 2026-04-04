import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrganizerLayout from '@/components/layouts/OrganizerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import BracketVisual from '@/components/tournament/BracketVisual.jsx';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizerProfile, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Trophy, Users, ArrowLeft, Edit2, Save, Settings, Play, Image, 
  ExternalLink, Award, MessageSquare, RefreshCw, Plus, X, Trash2
} from 'lucide-react';

export default function OrganizerTournamentManage() {
  const [user, setUser] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreMatch, setScoreMatch] = useState(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [showTeamSelectModal, setShowTeamSelectModal] = useState(false);
  const [bracketSlot, setBracketSlot] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const tournamentId = urlParams.get('id');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/organizer/dashboard');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await OrganizerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: async () => {
      const tournaments = await Tournament.list({ id: tournamentId });
      return tournaments[0];
    },
    enabled: !!tournamentId,
  });

  const { data: registeredTeams = [] } = useQuery({
    queryKey: ['tournament-teams', tournament?.teams],
    queryFn: async () => {
      if (!tournament?.teams?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament?.teams?.length,
  });

  const { data: allTeams = [] } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => Team.list(),
  });

  const updateTournamentMutation = useMutation({
    mutationFn: async (data) => {
      return Tournament.update(tournamentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
    }
  });

  const generateBrackets = () => {
    const teamCount = registeredTeams.length;
    if (teamCount < 2) return;

    const rounds = Math.ceil(Math.log2(teamCount));
    const brackets = [];
    
    // First round
    const firstRoundMatches = Math.ceil(teamCount / 2);
    const firstRound = {
      round: 1,
      matches: []
    };
    
    for (let i = 0; i < firstRoundMatches; i++) {
      firstRound.matches.push({
        match_id: `r1_m${i}`,
        team1: registeredTeams[i * 2]?.id || null,
        team2: registeredTeams[i * 2 + 1]?.id || null,
        winner: null,
        score1: null,
        score2: null
      });
    }
    brackets.push(firstRound);

    // Subsequent rounds
    for (let r = 2; r <= rounds; r++) {
      const prevMatches = brackets[r - 2].matches.length;
      const matchCount = Math.ceil(prevMatches / 2);
      const round = {
        round: r,
        matches: []
      };
      for (let i = 0; i < matchCount; i++) {
        round.matches.push({
          match_id: `r${r}_m${i}`,
          team1: null,
          team2: null,
          winner: null,
          score1: null,
          score2: null
        });
      }
      brackets.push(round);
    }

    updateTournamentMutation.mutate({ brackets });
  };

  const updateMatchScore = () => {
    if (!scoreMatch) return;

    const updatedBrackets = [...tournament.brackets];
    const match = updatedBrackets[scoreMatch.roundIdx].matches[scoreMatch.matchIdx];
    match.score1 = score1;
    match.score2 = score2;
    
    // Determine winner
    if (score1 > score2) {
      match.winner = match.team1;
    } else if (score2 > score1) {
      match.winner = match.team2;
    }

    // Advance winner to next round
    if (match.winner && scoreMatch.roundIdx < updatedBrackets.length - 1) {
      const nextRound = updatedBrackets[scoreMatch.roundIdx + 1];
      const nextMatchIdx = Math.floor(scoreMatch.matchIdx / 2);
      const position = scoreMatch.matchIdx % 2 === 0 ? 'team1' : 'team2';
      nextRound.matches[nextMatchIdx][position] = match.winner;
    }

    updateTournamentMutation.mutate({ brackets: updatedBrackets });
    setShowScoreModal(false);
    setScoreMatch(null);
  };

  const addTeamToBracket = (teamId) => {
    if (!bracketSlot) return;

    const updatedBrackets = [...tournament.brackets];
    updatedBrackets[bracketSlot.roundIdx].matches[bracketSlot.matchIdx][bracketSlot.position] = teamId;
    
    updateTournamentMutation.mutate({ brackets: updatedBrackets });
    setShowTeamSelectModal(false);
    setBracketSlot(null);
  };

  const removeTeamFromBracket = (roundIdx, matchIdx, position) => {
    const updatedBrackets = [...tournament.brackets];
    updatedBrackets[roundIdx].matches[matchIdx][position] = null;
    updatedBrackets[roundIdx].matches[matchIdx].winner = null;
    updatedBrackets[roundIdx].matches[matchIdx].score1 = null;
    updatedBrackets[roundIdx].matches[matchIdx].score2 = null;
    
    updateTournamentMutation.mutate({ brackets: updatedBrackets });
  };

  const resetMatch = (roundIdx, matchIdx) => {
    const updatedBrackets = [...tournament.brackets];
    const match = updatedBrackets[roundIdx].matches[matchIdx];
    match.winner = null;
    match.score1 = null;
    match.score2 = null;
    
    // Clear from next round
    if (roundIdx < updatedBrackets.length - 1) {
      const nextRound = updatedBrackets[roundIdx + 1];
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const position = matchIdx % 2 === 0 ? 'team1' : 'team2';
      nextRound.matches[nextMatchIdx][position] = null;
    }
    
    updateTournamentMutation.mutate({ brackets: updatedBrackets });
  };

  if (isLoading || !tournament) {
    return (
      <OrganizerLayout user={user} profile={profile}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Trophy className="w-12 h-12 text-gray-600 animate-pulse" />
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout user={user} profile={profile}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={'/organizer-tournaments'} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">{tournament.name}</h1>
            <p className="text-gray-400">Tournament Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/organizer/tournaments/new/$\{tournamentId}`}>
            <GlowButton variant="secondary" size="sm">
              <Edit2 className="w-4 h-4" /> Edit in Builder
            </GlowButton>
          </Link>
          <HexBadge className={
            tournament.status === 'live' ? 'bg-green-500/20 text-green-400' :
            tournament.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
            tournament.status === 'completed' ? 'bg-gray-500/20 text-gray-400' : ''
          }>
            {tournament.status}
          </HexBadge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <FloatingPanel className="p-4 text-center">
          <Users className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{registeredTeams.length}</p>
          <p className="text-gray-500 text-xs">Teams</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{tournament.brackets?.length || 0}</p>
          <p className="text-gray-500 text-xs">Rounds</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">EGP {tournament.prizepool_total || 0}</p>
          <p className="text-gray-500 text-xs">Prize Pool</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <MessageSquare className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{tournament.general_chat?.length || 0}</p>
          <p className="text-gray-500 text-xs">Messages</p>
        </FloatingPanel>
      </div>

      <Tabs defaultValue="brackets" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
          <TabsTrigger value="brackets">Brackets</TabsTrigger>
          <TabsTrigger value="teams">Teams ({registeredTeams.length})</TabsTrigger>
          <TabsTrigger value="settings">Quick Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="brackets">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Tournament Brackets</h2>
              <div className="flex gap-2">
                {(!tournament.brackets || tournament.brackets.length === 0) && registeredTeams.length >= 2 && (
                  <GlowButton onClick={generateBrackets}>
                    <RefreshCw className="w-4 h-4" /> Generate Brackets
                  </GlowButton>
                )}
                {tournament.brackets?.length > 0 && (
                  <GlowButton variant="ghost" size="sm" onClick={() => updateTournamentMutation.mutate({ brackets: [] })}>
                    <Trash2 className="w-4 h-4" /> Clear All
                  </GlowButton>
                )}
              </div>
            </div>

            {tournament.brackets?.length > 0 ? (
              <BracketVisual
                brackets={tournament.brackets}
                teams={registeredTeams}
                allTeams={allTeams}
                onInviteClick={(roundIdx, matchIdx, position) => {
                  setBracketSlot({ roundIdx, matchIdx, position });
                  setShowTeamSelectModal(true);
                }}
                onSelectWinner={(roundIdx, matchIdx, winnerId) => {
                  setScoreMatch({ roundIdx, matchIdx });
                  const match = tournament.brackets[roundIdx].matches[matchIdx];
                  setScore1(match.score1 || 0);
                  setScore2(match.score2 || 0);
                  setShowScoreModal(true);
                }}
                onClearSlot={(roundIdx, matchIdx, slot) => {
                  if (slot === 'winner') {
                    resetMatch(roundIdx, matchIdx);
                  } else {
                    removeTeamFromBracket(roundIdx, matchIdx, slot);
                  }
                }}
              />
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {registeredTeams.length < 2 
                    ? 'Need at least 2 teams to generate brackets' 
                    : 'Click "Generate Brackets" to create the tournament structure'}
                </p>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="teams">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Registered Teams</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredTeams.map((team) => (
                <GameCard key={team.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {team.logo ? (
                        <img src={team.logo} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Users className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-bold">{team.name}</p>
                      <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </GameCard>
              ))}
            </div>
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid md:grid-cols-2 gap-6">
            <FloatingPanel className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Tournament Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Stream Link</label>
                  <Input
                    value={tournament.stream_link || ''}
                    onChange={(e) => updateTournamentMutation.mutate({ stream_link: e.target.value })}
                    placeholder="https://twitch.tv/..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Tournament Image URL</label>
                  <Input
                    value={tournament.tournament_image || ''}
                    onChange={(e) => updateTournamentMutation.mutate({ tournament_image: e.target.value })}
                    placeholder="https://..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </FloatingPanel>

            <FloatingPanel className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Status</h2>
              <div className="space-y-4">
                <Select
                  value={tournament.status}
                  onValueChange={(v) => updateTournamentMutation.mutate({ status: v })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  {tournament.status === 'published' && (
                    <GlowButton className="flex-1" onClick={() => updateTournamentMutation.mutate({ status: 'live' })}>
                      <Play className="w-4 h-4" /> Go Live
                    </GlowButton>
                  )}
                  {tournament.status === 'live' && (
                    <GlowButton className="flex-1" variant="secondary" onClick={() => updateTournamentMutation.mutate({ status: 'completed' })}>
                      End Tournament
                    </GlowButton>
                  )}
                </div>
              </div>
            </FloatingPanel>
          </div>
        </TabsContent>
      </Tabs>

      {/* Score Modal */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Match Score</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <p className="text-white font-bold mb-2">
                  {registeredTeams.find(t => t.id === tournament.brackets?.[scoreMatch?.roundIdx]?.matches?.[scoreMatch?.matchIdx]?.team1)?.name || 'TBD'}
                </p>
                <Input
                  type="number"
                  value={score1}
                  onChange={(e) => setScore1(parseInt(e.target.value) || 0)}
                  className="bg-zinc-800 border-zinc-700 text-white text-center text-2xl"
                />
              </div>
              <div className="text-center text-gray-500 text-xl">VS</div>
              <div className="text-center">
                <p className="text-white font-bold mb-2">
                  {registeredTeams.find(t => t.id === tournament.brackets?.[scoreMatch?.roundIdx]?.matches?.[scoreMatch?.matchIdx]?.team2)?.name || 'TBD'}
                </p>
                <Input
                  type="number"
                  value={score2}
                  onChange={(e) => setScore2(parseInt(e.target.value) || 0)}
                  className="bg-zinc-800 border-zinc-700 text-white text-center text-2xl"
                />
              </div>
            </div>
            <GlowButton className="w-full" onClick={updateMatchScore}>
              <Save className="w-4 h-4" /> Save Score
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Select Modal */}
      <Dialog open={showTeamSelectModal} onOpenChange={setShowTeamSelectModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Select Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto py-4">
            {allTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => addTeamToBracket(team.id)}
                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center overflow-hidden">
                  {team.logo ? (
                    <img src={team.logo} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Users className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <span className="text-white">{team.name}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </OrganizerLayout>
  );
}