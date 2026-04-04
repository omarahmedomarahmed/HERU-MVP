import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Award, Coins, DollarSign, Package, Check } from 'lucide-react';
import { AppSettings, Tournament } from '@/api/heruClient'


const PLACEMENTS = [
  { place: 1, label: '1st Place 🥇', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500/40' },
  { place: 2, label: '2nd Place 🥈', color: 'text-gray-300', bg: 'bg-gray-500/20 border-gray-500/40' },
  { place: 3, label: '3rd Place 🥉', color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/40' },
  { place: 4, label: '4th Place', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/40' },
];

export default function RewardAssignment({ tournament, teams, queryClient, tournamentId }) {
  const [assignments, setAssignments] = useState(tournament?.reward_assignments || {});
  const [saved, setSaved] = useState(false);

  const saveRewardsMutation = useMutation({
    mutationFn: async () => {
      for (const [place, assignment] of Object.entries(assignments)) {
        if (assignment.team_id && assignment.coins) {
          const team = teams.find(t => t.id === assignment.team_id);
          if (team?.members) {
            for (const memberId of team.members) {
              const existingCoins = await AppSettings.list({ user_id: memberId });
              if (existingCoins[0]) {
                const newBalance = (existingCoins[0].balance || 0) + parseInt(assignment.coins);
                const txs = [...(existingCoins[0].transactions || []), {
                  type: 'earn',
                  amount: parseInt(assignment.coins),
                  reason: `Tournament prize — ${tournament.name} (${PLACEMENTS.find(p => p.place === parseInt(place))?.label})`,
                  timestamp: new Date().toISOString()
                }];
                await AppSettings.update(existingCoins[0].id, { balance: newBalance, transactions: txs });
              } else {
                await AppSettings.create({
                  user_id: memberId,
                  balance: parseInt(assignment.coins),
                  transactions: [{
                    type: 'earn',
                    amount: parseInt(assignment.coins),
                    reason: `Tournament prize — ${tournament.name}`,
                    timestamp: new Date().toISOString()
                  }]
                });
              }
            }
          }
        }
      }

      const log = [...(tournament.tournament_log || []), {
        action: 'rewards_assigned',
        description: 'Rewards assigned to top teams, tournament completed',
        timestamp: new Date().toISOString()
      }];

      await Tournament.update(tournamentId, {
        reward_assignments: assignments,
        status: 'completed',
        tournament_log: log
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  });

  return (
    <FloatingPanel className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-white">Assign Rewards</h3>
        <HexBadge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">FINAL STAGE</HexBadge>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        Assign prizes to the top 4 teams. HERU Coins will auto-distribute to all team members on save.
      </p>

      {/* Prize Pool Summary */}
      <div className="flex gap-3 mb-8 flex-wrap">
        {tournament.prizepool_total > 0 && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-green-400 font-bold">${tournament.prizepool_total?.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Cash Pool</p>
          </div>
        )}
        {tournament.prizepool_coins > 0 && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-yellow-400 font-bold">{tournament.prizepool_coins?.toLocaleString()}</p>
            <p className="text-gray-500 text-xs">Coins Pool</p>
          </div>
        )}
        {tournament.prizepool_items?.length > 0 && (
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
            <Package className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-purple-400 font-bold">{tournament.prizepool_items.length}</p>
            <p className="text-gray-500 text-xs">Prize Items</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {PLACEMENTS.map(({ place, label, color, bg }) => {
          const assignment = assignments[place] || { team_id: '', coins: '', cash: '', notes: '' };
          return (
            <div key={place} className={`p-4 rounded-xl border ${bg}`}>
              <p className={`font-bold ${color} mb-3`}>{label}</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Team</label>
                  <select
                    value={assignment.team_id || ''}
                    onChange={(e) => setAssignments({ ...assignments, [place]: { ...assignment, team_id: e.target.value } })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Select team...</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">HERU Coins Reward</label>
                  <Input
                    type="number"
                    value={assignment.coins || ''}
                    onChange={(e) => setAssignments({ ...assignments, [place]: { ...assignment, coins: e.target.value } })}
                    placeholder="e.g. 500"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                {tournament.prizepool_total > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Cash Prize ($)</label>
                    <Input
                      type="number"
                      value={assignment.cash || ''}
                      onChange={(e) => setAssignments({ ...assignments, [place]: { ...assignment, cash: e.target.value } })}
                      placeholder="e.g. 1000"
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Notes / Items</label>
                  <Input
                    value={assignment.notes || ''}
                    onChange={(e) => setAssignments({ ...assignments, [place]: { ...assignment, notes: e.target.value } })}
                    placeholder="e.g. Gaming chair, mouse..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <GlowButton
          className="flex-1"
          onClick={() => saveRewardsMutation.mutate()}
          disabled={saveRewardsMutation.isPending}
        >
          <Award className="w-4 h-4" />
          {saveRewardsMutation.isPending ? 'Saving & Distributing...' : 'Assign Rewards & Complete Tournament'}
        </GlowButton>
        {saved && (
          <div className="flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Rewards saved!</span>
          </div>
        )}
      </div>
      <p className="text-gray-600 text-xs mt-3">
        ⚠️ This will mark the tournament as Completed and distribute HERU Coins to all team members.
      </p>
    </FloatingPanel>
  );
}