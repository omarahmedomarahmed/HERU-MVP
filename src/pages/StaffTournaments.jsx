import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BracketVisual from '@/components/tournament/BracketVisual';
import { Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Trophy, Search, Eye, Edit, Users, Calendar, Play, Check, X,
  MessageSquare, Send, ExternalLink
} from 'lucide-react';

export default function StaffTournaments() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
      return;
    }
    loadUser();
  }, [navigate]);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/admin');
    }
  };

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['all-tournaments'],
    queryFn: () => Tournament.list('-created_date'),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => Team.list(),
  });

  const updateTournamentMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await Tournament.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-tournaments']);
      setEditMode(false);
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ tournamentId, message, chatType }) => {
      const tournament = tournaments.find(t => t.id === tournamentId);
      const chatField = chatType === 'support' ? 'support_chat' : 'general_chat';
      const chat = tournament[chatField] || [];
      chat.push({
        sender_id: user.id,
        sender_name: user.full_name,
        sender_role: 'staff',
        message,
        timestamp: new Date().toISOString()
      });
      await Tournament.update(tournamentId, { [chatField]: chat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-tournaments']);
      setNewMessage('');
    }
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ tournamentId, roundIdx, matchIdx, updates }) => {
      const tournament = tournaments.find(t => t.id === tournamentId);
      const updatedBrackets = [...(tournament.brackets || [])];
      const match = updatedBrackets[roundIdx].matches[matchIdx];
      updatedBrackets[roundIdx].matches[matchIdx] = { ...match, ...updates };

      // Auto-advance winner
      if (updates.winner && roundIdx < updatedBrackets.length - 1) {
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const position = matchIdx % 2 === 0 ? 'team1' : 'team2';
        if (updatedBrackets[roundIdx + 1]?.matches[nextMatchIdx]) {
          updatedBrackets[roundIdx + 1].matches[nextMatchIdx][position] = updates.winner;
        }
      }

      const log = [...(tournament.tournament_log || []), {
        action: 'match_update',
        description: `Staff updated match result`,
        timestamp: new Date().toISOString()
      }];

      await Tournament.update(tournamentId, { brackets: updatedBrackets, tournament_log: log });
    },
    onSuccess: () => queryClient.invalidateQueries(['all-tournaments'])
  });

  const filteredTournaments = tournaments.filter(t =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.game?.toLowerCase().includes(search.toLowerCase())
  );

  const draftTournaments = filteredTournaments.filter(t => t.status === 'draft');
  const publishedTournaments = filteredTournaments.filter(t => t.status === 'published');
  const liveTournaments = filteredTournaments.filter(t => t.status === 'live');
  const completedTournaments = filteredTournaments.filter(t => t.status === 'completed');

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'TBD';
  };

  const TournamentCard = ({ tournament }) => (
    <GameCard className="p-4 cursor-pointer" onClick={() => navigate(`/staff/tournaments/${tournament.id}`)}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
          {tournament.tournament_image ? <img src={tournament.tournament_image} className="w-full h-full object-cover" /> : <Trophy className="w-8 h-8 text-red-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold truncate">{tournament.name}</h3>
            <HexBadge className={
              tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
              tournament.status === 'published' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
              tournament.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
              'bg-gray-500/20 text-gray-400 border-gray-500/50'
            }>{tournament.status === 'live' ? '🔴 LIVE' : tournament.status.toUpperCase()}</HexBadge>
          </div>
          <p className="text-gray-500 text-sm">{tournament.game}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{tournament.teams?.length || 0}/{tournament.max_teams || '∞'}</span>
            {tournament.schedule && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(tournament.schedule).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </GameCard>
  );

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">MANAGE <span className="text-red-500">TOURNAMENTS</span></h1>
          <p className="text-gray-400">{tournaments.length} total tournaments</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tournaments..." className="pl-10 bg-zinc-800 border-zinc-700 text-white" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
          <TabsTrigger value="all">All ({filteredTournaments.length})</TabsTrigger>
          <TabsTrigger value="live">Live ({liveTournaments.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedTournaments.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>
        <TabsContent value="live">
          <div className="grid md:grid-cols-2 gap-4">
            {liveTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>
        <TabsContent value="published">
          <div className="grid md:grid-cols-2 gap-4">
            {publishedTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>
        <TabsContent value="draft">
          <div className="grid md:grid-cols-2 gap-4">
            {draftTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid md:grid-cols-2 gap-4">
            {completedTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Tournament Detail Modal */}
      <Dialog open={!!selectedTournament} onOpenChange={() => { setSelectedTournament(null); setEditMode(false); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedTournament?.name}</span>
              {selectedTournament?.status !== 'completed' && (
                <GlowButton variant="secondary" size="sm" onClick={() => setEditMode(!editMode)}>
                  <Edit className="w-4 h-4" /> {editMode ? 'Cancel' : 'Edit'}
                </GlowButton>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedTournament && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-zinc-800 mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="brackets">Brackets</TabsTrigger>
                <TabsTrigger value="chat">Chats</TabsTrigger>
                <TabsTrigger value="log">Log</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Name</label>
                        <Input value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Status</label>
                        <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
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
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Game</label>
                        <Input value={editData.game || ''} onChange={(e) => setEditData({ ...editData, game: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Format</label>
                        <Input value={editData.format || ''} onChange={(e) => setEditData({ ...editData, format: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Max Teams</label>
                        <Input type="number" value={editData.max_teams || ''} onChange={(e) => setEditData({ ...editData, max_teams: parseInt(e.target.value) })} className="bg-zinc-800 border-zinc-700 text-white" />
                      </div>
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">Prize Pool ($)</label>
                        <Input type="number" value={editData.prizepool_total || ''} onChange={(e) => setEditData({ ...editData, prizepool_total: parseFloat(e.target.value) })} className="bg-zinc-800 border-zinc-700 text-white" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Stream Link</label>
                      <Input value={editData.stream_link || ''} onChange={(e) => setEditData({ ...editData, stream_link: e.target.value })} placeholder="https://twitch.tv/..." className="bg-zinc-800 border-zinc-700 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Description</label>
                      <Textarea value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" rows={3} />
                    </div>
                    <GlowButton onClick={() => updateTournamentMutation.mutate({ id: selectedTournament.id, data: editData })}>
                      <Check className="w-4 h-4" /> Save Changes
                    </GlowButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-400">Game:</span> <span className="text-white ml-2">{selectedTournament.game}</span></div>
                      <div><span className="text-gray-400">Format:</span> <span className="text-white ml-2">{selectedTournament.format}</span></div>
                      <div><span className="text-gray-400">Teams:</span> <span className="text-white ml-2">{selectedTournament.teams?.length || 0}/{selectedTournament.max_teams}</span></div>
                      <div><span className="text-gray-400">Prize Pool:</span> <span className="text-yellow-400 ml-2">${selectedTournament.prizepool_total || 0}</span></div>
                    </div>
                    {selectedTournament.stream_link && (
                      <a href={selectedTournament.stream_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-400 hover:underline">
                        <ExternalLink className="w-4 h-4" /> Watch Stream
                      </a>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="brackets">
                {selectedTournament.brackets?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Bracket Management</h4>
                      <GlowButton 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          await Tournament.update(selectedTournament.id, { brackets: [] });
                          queryClient.invalidateQueries(['all-tournaments']);
                        }}
                      >
                        <X className="w-4 h-4" /> Clear Brackets
                      </GlowButton>
                    </div>
                    <BracketVisual
                      brackets={selectedTournament.brackets}
                      teams={teams.filter(t => selectedTournament.teams?.includes(t.id))}
                      onSelectWinner={(roundIdx, matchIdx, winnerId) => {
                        updateMatchMutation.mutate({
                          tournamentId: selectedTournament.id,
                          roundIdx,
                          matchIdx,
                          updates: { winner: winnerId }
                        });
                      }}
                      onInviteClick={() => {}}
                    />
                    {/* Manual Score Entry */}
                    <div className="p-4 bg-zinc-800/50 rounded-lg">
                      <h5 className="text-white text-sm mb-3">Update Match Scores</h5>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTournament.brackets.map((round, rIdx) => 
                          round.matches.map((match, mIdx) => (
                            <div key={`${rIdx}-${mIdx}`} className="p-3 bg-zinc-900 rounded-lg">
                              <p className="text-gray-400 text-xs mb-2">Round {round.round} - Match {mIdx + 1}</p>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Score 1"
                                  defaultValue={match.score1 || ''}
                                  className="w-20 bg-zinc-800 border-zinc-700 text-white text-sm"
                                  onChange={(e) => {
                                    updateMatchMutation.mutate({
                                      tournamentId: selectedTournament.id,
                                      roundIdx: rIdx,
                                      matchIdx: mIdx,
                                      updates: { score1: parseInt(e.target.value) || 0 }
                                    });
                                  }}
                                />
                                <span className="text-gray-500">vs</span>
                                <Input
                                  type="number"
                                  placeholder="Score 2"
                                  defaultValue={match.score2 || ''}
                                  className="w-20 bg-zinc-800 border-zinc-700 text-white text-sm"
                                  onChange={(e) => {
                                    updateMatchMutation.mutate({
                                      tournamentId: selectedTournament.id,
                                      roundIdx: rIdx,
                                      matchIdx: mIdx,
                                      updates: { score2: parseInt(e.target.value) || 0 }
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No brackets generated yet</p>
                    <GlowButton onClick={async () => {
                      const numTeams = selectedTournament.max_teams || 8;
                      const rounds = Math.ceil(Math.log2(numTeams));
                      const brackets = [];
                      let matchesInRound = Math.ceil(numTeams / 2);
                      
                      for (let r = 1; r <= rounds; r++) {
                        const roundMatches = [];
                        for (let m = 0; m < matchesInRound; m++) {
                          roundMatches.push({
                            match_id: `r${r}-m${m}`,
                            team1: null,
                            team2: null,
                            winner: null,
                            score1: null,
                            score2: null
                          });
                        }
                        brackets.push({ round: r, matches: roundMatches });
                        matchesInRound = Math.ceil(matchesInRound / 2);
                      }
                      
                      await Tournament.update(selectedTournament.id, { brackets });
                      queryClient.invalidateQueries(['all-tournaments']);
                    }}>
                      Generate Brackets
                    </GlowButton>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="chat">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">Organizer Chat (Internal)</h4>
                    <div className="h-48 overflow-y-auto bg-zinc-950 rounded-lg p-3 space-y-2 mb-3">
                      {selectedTournament.support_chat?.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.sender_role === 'staff' ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                            <p className="text-xs opacity-70">{msg.sender_name} ({msg.sender_role})</p>
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message organizer..." className="bg-zinc-800 border-zinc-700 text-white" />
                      <GlowButton onClick={() => newMessage && sendMessageMutation.mutate({ tournamentId: selectedTournament.id, message: newMessage, chatType: 'support' })}>
                        <Send className="w-4 h-4" />
                      </GlowButton>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium mb-3">General Chat (Public)</h4>
                    <div className="h-48 overflow-y-auto bg-zinc-950 rounded-lg p-3 space-y-2">
                      {selectedTournament.general_chat?.map((msg, i) => (
                        <div key={i} className="p-2 bg-zinc-800 rounded-lg text-sm">
                          <p className="text-xs text-gray-500">{msg.sender_name} ({msg.sender_type})</p>
                          <p className="text-white">{msg.message}</p>
                        </div>
                      ))}
                      {(!selectedTournament.general_chat || selectedTournament.general_chat.length === 0) && (
                        <p className="text-gray-500 text-center">No messages</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="log">
                <div className="space-y-2">
                  {selectedTournament.tournament_log?.slice().reverse().map((log, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-zinc-800/50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                      <div>
                        <p className="text-white text-sm">{log.description}</p>
                        <p className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  {(!selectedTournament.tournament_log || selectedTournament.tournament_log.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No activity logged</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}