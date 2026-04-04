import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GlowButton from '@/components/ui/GlowButton';
import { Users, Trophy } from 'lucide-react';
import { Tournament } from '@/api/heruClient'


export default function RegisterTeamModal({ open, onClose, tournament, myTeams, user }) {
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [gameId, setGameId] = useState('');
  const [rank, setRank] = useState('');
  const queryClient = useQueryClient();

  const alreadyRegistered = (teamId) => {
    const reqs = tournament.join_requests || [];
    return reqs.some(r => r.team_id === teamId && r.status !== 'rejected');
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      const team = myTeams.find(t => t.id === selectedTeamId);
      const newReq = {
        team_id: selectedTeamId,
        team_name: team?.name || '',
        user_id: user.id,
        game: tournament.game,
        game_id: gameId,
        rank,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      };

      const updatedRequests = [...(tournament.join_requests || []), newReq];

      // Also add organizer notification
      const log = [
        ...(tournament.tournament_log || []),
        {
          action: 'join_request',
          description: `${team?.name || 'A team'} submitted a join request`,
          timestamp: new Date().toISOString(),
        },
      ];

      await Tournament.update(tournament.id, {
        join_requests: updatedRequests,
        tournament_log: log,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournament.id]);
      onClose();
    },
  });

  const eligibleTeams = myTeams.filter(t => {
    const isLeader = t.leader_id === user?.id;
    const alreadyIn = tournament.teams?.includes(t.id);
    return isLeader && !alreadyIn;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-red-500" /> Register Your Team
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Tournament summary */}
          <div className="p-3 bg-zinc-800/50 rounded-lg text-sm space-y-1">
            <p className="text-gray-400">Tournament: <span className="text-white">{tournament.name}</span></p>
            <p className="text-gray-400">Game: <span className="text-white">{tournament.game}</span></p>
            <p className="text-gray-400">Slots: <span className="text-white">{tournament.teams?.length || 0}/{tournament.max_teams || '∞'}</span></p>
          </div>

          {eligibleTeams.length === 0 ? (
            <div className="text-center py-6">
              <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No eligible teams. You must be the leader of a team to register.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Select Your Team</label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Choose a team..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {eligibleTeams.map(team => (
                      <SelectItem key={team.id} value={team.id} disabled={alreadyRegistered(team.id)}>
                        <span className="flex items-center gap-2">
                          {team.name}
                          {alreadyRegistered(team.id) && <span className="text-xs text-amber-400">(pending)</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-gray-400 text-xs mb-1 block">In-Game ID</label>
                <Input
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="Your in-game username or ID..."
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

              <GlowButton
                className="w-full"
                disabled={!selectedTeamId || !gameId || !rank || submitMutation.isPending}
                onClick={() => submitMutation.mutate()}
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit Registration'}
              </GlowButton>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}