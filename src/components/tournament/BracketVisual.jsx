import React from 'react';
import { Trophy, Plus, X, RotateCcw } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BracketVisual({ brackets, teams, onInviteClick, onSelectWinner, onClearSlot, allTeams = [] }) {
  if (!brackets || brackets.length === 0) {
    return null;
  }

  const getTeamName = (teamId) => {
    if (!teamId) return 'TBD';
    // First check registered teams
    let team = teams.find(t => t.id === teamId);
    // Then check all teams if provided
    if (!team && allTeams.length > 0) {
      team = allTeams.find(t => t.id === teamId);
    }
    return team?.name || 'TBD';
  };

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex gap-8 min-w-max">
        {brackets.map((round, roundIdx) => (
          <div key={roundIdx} className="flex flex-col gap-4">
            <h4 className="text-white font-bold text-center mb-4">
              {round.round === brackets.length ? 'FINALS' :
               round.round === brackets.length - 1 ? 'SEMI-FINALS' :
               round.round === 1 ? 'ROUND 1' :
               `ROUND ${round.round}`}
            </h4>
            <div className="flex flex-col gap-8">
              {round.matches.map((match, matchIdx) => (
                <div key={matchIdx} className="relative">
                  {/* Match Container */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 w-64 space-y-2">
                    {/* Team 1 */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded transition-colors cursor-pointer group",
                        match.team1 ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-800/50 border border-dashed border-zinc-700",
                        match.winner === match.team1 && "bg-green-900/30 border-green-500"
                      )}
                      onClick={() => {
                        if (!match.team1) {
                          onInviteClick(roundIdx, matchIdx, 'team1');
                        } else if (match.team2 && !match.winner) {
                          onSelectWinner(roundIdx, matchIdx, match.team1);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {!match.team1 && <Plus className="w-4 h-4 text-gray-500" />}
                        <span className={cn(
                          "font-medium truncate",
                          match.team1 ? "text-white" : "text-gray-500"
                        )}>
                          {getTeamName(match.team1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.winner === match.team1 && (
                          <Trophy className="w-4 h-4 text-yellow-400" />
                        )}
                        {match.team1 && onClearSlot && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearSlot(roundIdx, matchIdx, 'team1');
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                        <span className={cn(
                          "text-sm font-bold w-6 text-center",
                          match.winner === match.team1 ? "text-green-400" : "text-gray-400"
                        )}>
                          {match.score1 ?? '-'}
                        </span>
                      </div>
                    </div>

                    {/* VS Divider */}
                    <div className="text-center">
                      <span className="text-xs text-gray-600 font-bold">VS</span>
                    </div>

                    {/* Team 2 */}
                    <div
                      className={cn(
                        "flex items-center justify-between p-2 rounded transition-colors cursor-pointer group",
                        match.team2 ? "bg-zinc-800 hover:bg-zinc-700" : "bg-zinc-800/50 border border-dashed border-zinc-700",
                        match.winner === match.team2 && "bg-green-900/30 border-green-500"
                      )}
                      onClick={() => {
                        if (!match.team2) {
                          onInviteClick(roundIdx, matchIdx, 'team2');
                        } else if (match.team1 && !match.winner) {
                          onSelectWinner(roundIdx, matchIdx, match.team2);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {!match.team2 && <Plus className="w-4 h-4 text-gray-500" />}
                        <span className={cn(
                          "font-medium truncate",
                          match.team2 ? "text-white" : "text-gray-500"
                        )}>
                          {getTeamName(match.team2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {match.winner === match.team2 && (
                          <Trophy className="w-4 h-4 text-yellow-400" />
                        )}
                        {match.team2 && onClearSlot && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearSlot(roundIdx, matchIdx, 'team2');
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-opacity"
                          >
                            <X className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                        <span className={cn(
                          "text-sm font-bold w-6 text-center",
                          match.winner === match.team2 ? "text-green-400" : "text-gray-400"
                        )}>
                          {match.score2 ?? '-'}
                        </span>
                      </div>
                    </div>

                    {/* Reset Winner Button */}
                    {match.winner && onClearSlot && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearSlot(roundIdx, matchIdx, 'winner');
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 rounded-full transition-colors"
                        title="Reset match"
                      >
                        <RotateCcw className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* Connector Lines to Next Round */}
                  {roundIdx < brackets.length - 1 && (
                    <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-zinc-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}