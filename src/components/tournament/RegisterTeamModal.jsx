import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlowButton from '@/components/ui/GlowButton';
import { Users, Trophy, Swords, AlertCircle } from 'lucide-react';
import { Tournament } from '@/api/heruClient';
import { useToast } from '@/components/ui/use-toast';


export default function RegisterTeamModal({ open, onClose, tournament, myTeams, user, profile }) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [gameId, setGameId] = useState('');
  const [rank, setRank] = useState('');
  const [discordName, setDiscordName] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const is1v1 = tournament?.participant_type === 'player';
  const userId = user?.user?.id || user?.id;

  const alreadyRegistered = (teamId) => {
    const reqs = tournament?.join_requests || [];
    return reqs.some(r => r.team_id === teamId && r.status !== 'rejected');
  };

  // Check if user is leader of the selected team
  const selectedTeam = myTeams?.find(t => t.id === selectedTeamId);
  const isLeaderOfSelected = selectedTeam?.leader_id === userId;

  // Team registration mutation - uses proper backend endpoint
  const submitMutation = useMutation({
    mutationFn: async () => {
      const team = myTeams.find(t => t.id === selectedTeamId);
      return Tournament.joinRequest(tournament.id, {
        team_id: selectedTeamId,
        team_name: team?.name || '',
        game: tournament.game,
        game_id: gameId,
        rank,
        discord_name: discordName,
        is_leader: isLeaderOfSelected,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournament?.id]);
      toast({
        title: isLeaderOfSelected ? 'Team registered!' : 'Request sent!',
        description: isLeaderOfSelected
          ? 'Your team has been registered. Check the Arena for updates.'
          : 'A request has been sent to your team leader for approval.',
      });
      onClose();
    },
    onError: (err) => {
      toast({
        title: 'Registration failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // 1v1 player join mutation
  const joinPlayerMutation = useMutation({
    mutationFn: async () => {
      return Tournament.joinAsPlayer(tournament.id, {
        game_id: gameId,
        rank,
        discord_name: discordName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournament?.id]);
      toast({ title: 'Joined!', description: 'You have joined the tournament. Check the Arena!' });
      onClose();
    },
    onError: (err) => {
      toast({
        title: 'Failed to join',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Filter eligible teams - user must be a member (leader or member)
  const eligibleTeams = (myTeams || []).filter(t => {
    const isMember = t.leader_id === userId || (t.members || []).includes(userId);
    const alreadyIn = tournament?.teams?.includes(t.id);
    return isMember && !alreadyIn;
  });

  const myPlayerJoined = is1v1 && (tournament?.player_participants || []).some(p => p.user_id === userId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {is1v1 ? <Swords className="w-5 h-5 text-red-500" /> : <Trophy className="w-5 h-5 text-red-500" />}
            {is1v1 ? 'Join as Player (1v1)' : 'Register Your Team'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tournament summary */}
          <div className="p-3 bg-zinc-800/50 rounded-lg text-sm space-y-1">
            <p className="text-gray-400">Tournament: <span className="text-white font-medium">{tournament?.name}</span></p>
            <p className="text-gray-400">Game: <span className="text-white">{tournament?.game}</span></p>
            <p className="text-gray-400">Type: <span className="text-white">{is1v1 ? '1v1 (Solo Players)' : 'Team vs Team'}</span></p>
            <p className="text-gray-400">Slots: <span className="text-white">
              {is1v1
                ? `${tournament?.player_participants?.length || 0}/${tournament?.max_teams || '∞'}`
                : `${tournament?.teams?.length || 0}/${tournament?.max_teams || '∞'}`
              }
            </span></p>
          </div>

          {/* 1v1 Join Flow */}
          {is1v1 && !myPlayerJoined && (
            <>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">In-Game Name / ID</label>
                <Input
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder={`Your ${tournament?.game || 'in-game'} username or ID...`}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Current Rank</label>
                <Input
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="e.g. Diamond, Platinum, Global Elite..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Discord Name</label>
                <Input
                  value={discordName}
                  onChange={(e) => setDiscordName(e.target.value)}
                  placeholder="e.g. username#1234 or username"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <GlowButton
                className="w-full"
                disabled={!gameId || !rank || joinPlayerMutation.isPending}
                onClick={() => joinPlayerMutation.mutate()}
              >
                {joinPlayerMutation.isPending ? 'Joining...' : <><Swords className="w-4 h-4" /> Join Tournament</>}
              </GlowButton>
            </>
          )}

          {is1v1 && myPlayerJoined && (
            <div className="text-center py-6">
              <Swords className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-400 font-bold">You're already registered!</p>
              <p className="text-gray-400 text-sm mt-1">Check the Arena for match updates.</p>
            </div>
          )}

          {/* Team Registration Flow */}
          {!is1v1 && eligibleTeams.length === 0 && (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No eligible teams found.</p>
              <p className="text-gray-500 text-xs mt-1">You need to be a member of a team to register.</p>
            </div>
          )}

          {!is1v1 && eligibleTeams.length > 0 && (
            <>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Select Your Team</label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Choose a team..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                    {eligibleTeams.map(team => {
                      const isLeader = team.leader_id === userId;
                      return (
                        <SelectItem key={team.id} value={team.id} disabled={alreadyRegistered(team.id)} className="text-white focus:bg-zinc-800 focus:text-white">
                          <span className="flex items-center gap-2">
                            {team.name}
                            {isLeader && <span className="text-xs text-red-400">(Leader)</span>}
                            {!isLeader && <span className="text-xs text-gray-500">(Member)</span>}
                            {alreadyRegistered(team.id) && <span className="text-xs text-amber-400">(pending)</span>}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Show notice if member (not leader) */}
              {selectedTeamId && !isLeaderOfSelected && (
                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-400 text-xs">
                    You're not the leader of this team. A registration request will be sent to your team leader for approval.
                  </p>
                </div>
              )}

              <div>
                <label className="text-gray-400 text-xs mb-1 block">In-Game Name / ID</label>
                <Input
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder={`Your ${tournament?.game || 'in-game'} username or ID...`}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Current Rank</label>
                <Input
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  placeholder="e.g. Diamond, Platinum, Global Elite..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">Discord Name</label>
                <Input
                  value={discordName}
                  onChange={(e) => setDiscordName(e.target.value)}
                  placeholder="e.g. username#1234 or username"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <GlowButton
                className="w-full"
                disabled={!selectedTeamId || !gameId || !rank || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? 'Submitting...' : isLeaderOfSelected ? 'Register Team' : 'Send Request to Leader'}
              </GlowButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
