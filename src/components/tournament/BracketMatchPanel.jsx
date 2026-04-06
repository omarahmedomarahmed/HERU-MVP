import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Trophy, RotateCcw, CheckCircle, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tournament } from '@/api/heruClient'


function getTeamById(id, teams) {
  return teams.find(t => t?.id === id);
}

function MatchCard({ match, roundIdx, matchIdx, teams, canEdit, onUpdate, onReset }) {
  const [s1, setS1] = useState(match.score1 ?? '');
  const [s2, setS2] = useState(match.score2 ?? '');

  const team1 = getTeamById(match.team1, teams);
  const team2 = getTeamById(match.team2, teams);
  const hasWinner = !!match.winner;
  const canSetWinner = !!match.team1 && !!match.team2;

  const status = hasWinner ? 'completed' : (match.team1 && match.team2) ? 'upcoming' : 'pending';

  const statusBadge = {
    completed: { label: 'Completed', color: 'text-green-400', Icon: CheckCircle },
    upcoming: { label: 'Upcoming', color: 'text-red-400', Icon: Clock },
    pending: { label: 'Pending', color: 'text-gray-500', Icon: Circle },
  }[status];

  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3",
      status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
      status === 'upcoming' ? 'bg-red-500/5 border-red-500/20' :
      'bg-zinc-800/40 border-zinc-700/50'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs font-bold">Match {matchIdx + 1}</span>
        <div className={cn("flex items-center gap-1 text-xs", statusBadge.color)}>
          <statusBadge.Icon className="w-3 h-3" />
          {statusBadge.label}
        </div>
      </div>

      {/* Team 1 row */}
      <TeamRow
        team={team1}
        score={s1}
        onScore={setS1}
        isWinner={match.winner === match.team1}
        canEdit={canEdit && canSetWinner && !hasWinner}
        onSetWinner={() => onUpdate({ winner: match.team1, score1: Number(s1), score2: Number(s2) })}
        placeholder="Team 1"
      />

      <div className="text-center text-xs text-gray-600 font-bold">VS</div>

      {/* Team 2 row */}
      <TeamRow
        team={team2}
        score={s2}
        onScore={setS2}
        isWinner={match.winner === match.team2}
        canEdit={canEdit && canSetWinner && !hasWinner}
        onSetWinner={() => onUpdate({ winner: match.team2, score1: Number(s1), score2: Number(s2) })}
        placeholder="Team 2"
      />

      {/* Save scores + Reset */}
      {canEdit && canSetWinner && (
        <div className="flex gap-2 pt-1">
          {!hasWinner && (
            <GlowButton
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => onUpdate({ score1: Number(s1), score2: Number(s2) })}
            >
              Save Scores
            </GlowButton>
          )}
          {hasWinner && (
            <GlowButton
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={onReset}
            >
              <RotateCcw className="w-3 h-3" /> Reset Match
            </GlowButton>
          )}
        </div>
      )}
    </div>
  );
}

function TeamRow({ team, score, onScore, isWinner, canEdit, onSetWinner, placeholder }) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-2.5 rounded-lg",
      isWinner ? 'bg-green-500/15 border border-green-500/30' : 'bg-zinc-800/60'
    )}>
      <div className="w-8 h-8 rounded-lg bg-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
        {team?.logo
          ? <img src={team.logo} alt="" className="w-full h-full object-cover" />
          : <span className="text-gray-500 text-xs">?</span>
        }
      </div>
      <span className={cn("flex-1 text-sm font-medium truncate", team ? 'text-white' : 'text-gray-500 italic')}>
        {team?.name || placeholder}
      </span>
      {isWinner && <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
      {canEdit && (
        <Input
          value={score}
          onChange={(e) => onScore(e.target.value)}
          type="number"
          min="0"
          className="w-14 h-7 bg-zinc-900 border-zinc-700 text-white text-center text-xs p-1"
        />
      )}
      {canEdit && team && (
        <GlowButton size="sm" onClick={onSetWinner}>
          Win
        </GlowButton>
      )}
    </div>
  );
}

export default function BracketMatchPanel({ tournament, teams, canEdit }) {
  const queryClient = useQueryClient();
  const tournamentId = tournament.id;
  const brackets = tournament.brackets || [];

  const updateMatch = useMutation({
    mutationFn: async ({ roundIdx, matchIdx, updates }) => {
      const updatedBrackets = brackets.map((r, ri) => ({
        ...r,
        matches: r.matches.map((m, mi) => {
          if (ri !== roundIdx || mi !== matchIdx) return m;
          return { ...m, ...updates };
        }),
      }));

      // Auto-advance winner to next round
      if (updates.winner && roundIdx < updatedBrackets.length - 1) {
        const nextRoundIdx = roundIdx + 1;
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const position = matchIdx % 2 === 0 ? 'team1' : 'team2';
        if (updatedBrackets[nextRoundIdx]?.matches[nextMatchIdx]) {
          updatedBrackets[nextRoundIdx].matches[nextMatchIdx][position] = updates.winner;
        }
      }

      const log = [
        ...(tournament.tournament_log || []),
        {
          action: 'match_update',
          description: updates.winner
            ? `${teams.find(t => t?.id === updates.winner)?.name || 'TBD'} wins Match ${matchIdx + 1} (Round ${roundIdx + 1})`
            : `Scores updated for Match ${matchIdx + 1} (Round ${roundIdx + 1})`,
          timestamp: new Date().toISOString(),
        },
      ];

      await Tournament.update(tournamentId, { brackets: updatedBrackets, tournament_log: log });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const resetMatch = useMutation({
    mutationFn: async ({ roundIdx, matchIdx }) => {
      const updatedBrackets = brackets.map((r, ri) => ({
        ...r,
        matches: r.matches.map((m, mi) =>
          ri === roundIdx && mi === matchIdx ? { ...m, winner: null, score1: null, score2: null } : m
        ),
      }));
      await Tournament.update(tournamentId, { brackets: updatedBrackets });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  if (!brackets.length) {
    return (
      <FloatingPanel className="p-12 text-center">
        <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No brackets generated yet. Complete seeding first.</p>
      </FloatingPanel>
    );
  }

  return (
    <div className="space-y-8 overflow-x-auto pb-6">
      <div className="flex gap-6 min-w-max">
        {brackets.map((round, roundIdx) => (
          <div key={roundIdx} className="w-72 space-y-4">
            <h4 className="text-center text-white font-black text-sm">
              {round.round === brackets.length ? '🏆 FINALS' :
               round.round === brackets.length - 1 ? 'SEMI-FINALS' :
               round.round === 1 ? 'ROUND 1' : `ROUND ${round.round}`}
            </h4>
            <div className="space-y-4">
              {round.matches.map((match, matchIdx) => (
                <MatchCard
                  key={matchIdx}
                  match={match}
                  roundIdx={roundIdx}
                  matchIdx={matchIdx}
                  teams={teams}
                  canEdit={canEdit}
                  onUpdate={(updates) => updateMatch.mutate({ roundIdx, matchIdx, updates })}
                  onReset={() => resetMatch.mutate({ roundIdx, matchIdx })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}