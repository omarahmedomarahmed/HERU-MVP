import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { GripVertical, Users, Award } from 'lucide-react';
import { Tournament, Connect } from '@/api/heruClient'

const TIER_ORDER = ['IRON','BRONZE','SILVER','GOLD','PLATINUM','EMERALD','DIAMOND','MASTER','GRANDMASTER','CHALLENGER']
const TIER_COLOR = {
  IRON:'text-zinc-400', BRONZE:'text-amber-700', SILVER:'text-slate-300',
  GOLD:'text-yellow-400', PLATINUM:'text-teal-300', EMERALD:'text-emerald-400',
  DIAMOND:'text-blue-300', MASTER:'text-purple-400', GRANDMASTER:'text-red-400', CHALLENGER:'text-cyan-300',
}
function topRank(riotList) {
  if (!riotList?.length) return null
  return riotList.reduce((best, acc) => {
    const bIdx = TIER_ORDER.indexOf((best?.rank_tier || '').toUpperCase())
    const aIdx = TIER_ORDER.indexOf((acc.rank_tier || '').toUpperCase())
    return aIdx > bIdx ? acc : best
  }, riotList[0])
}


export default function SeedingPanel({ tournament, confirmedTeams, onBracketsGenerated }) {
  const [seeds, setSeeds] = useState([]);
  const queryClient = useQueryClient();
  const tournamentId = tournament.id;

  useEffect(() => {
    // Initialize seeds from current tournament.teams order
    const ordered = (tournament.teams || [])
      .map(id => confirmedTeams.find(t => t?.id === id))
      .filter(Boolean);
    setSeeds(ordered);
  }, [confirmedTeams, tournament.teams]);

  const saveSeedsMutation = useMutation({
    mutationFn: async (orderedTeams) => {
      const teamIds = orderedTeams.map(t => t.id);
      await Tournament.update(tournamentId, { teams: teamIds });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const generateBracketsMutation = useMutation({
    mutationFn: async () => {
      const numTeams = seeds.length || tournament.max_teams || 8;
      const rounds = Math.ceil(Math.log2(numTeams));
      const brackets = [];

      const firstRoundMatches = Math.ceil(numTeams / 2);
      const firstRound = [];
      for (let m = 0; m < firstRoundMatches; m++) {
        firstRound.push({
          match_id: `r1-m${m}`,
          team1: seeds[m * 2]?.id || null,
          team2: seeds[m * 2 + 1]?.id || null,
          winner: null,
          score1: null,
          score2: null,
        });
      }
      brackets.push({ round: 1, matches: firstRound });

      for (let r = 2; r <= rounds; r++) {
        const prevMatches = brackets[r - 2].matches.length;
        const matchCount = Math.ceil(prevMatches / 2);
        const roundMatches = [];
        for (let m = 0; m < matchCount; m++) {
          roundMatches.push({
            match_id: `r${r}-m${m}`,
            team1: null,
            team2: null,
            winner: null,
            score1: null,
            score2: null,
          });
        }
        brackets.push({ round: r, matches: roundMatches });
      }

      const log = [
        ...(tournament.tournament_log || []),
        {
          action: 'brackets_generated',
          description: `Tournament brackets generated for ${numTeams} seeded teams`,
          timestamp: new Date().toISOString(),
        },
      ];

      await Tournament.update(tournamentId, { brackets, tournament_log: log });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tournament', tournamentId]);
      if (onBracketsGenerated) onBracketsGenerated();
    },
  });

  const allMemberIds = seeds.flatMap(t => t.members || [])
  const { data: seedingRiot = [] } = useQuery({
    queryKey: ['seeding-riot-batch', allMemberIds.join(',')],
    queryFn: () => Connect.publicRiotBatch(allMemberIds),
    enabled: allMemberIds.length > 0,
    staleTime: 120_000,
  })
  const riotByUser = seedingRiot.reduce((acc, r) => {
    if (!acc[r.user_id]) acc[r.user_id] = []
    acc[r.user_id].push(r)
    return acc
  }, {})

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(seeds);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSeeds(reordered);
  };

  // Allow generating brackets even with fewer teams (empty slots will be TBD)
  const allSlotsFilled = seeds.length > 0 || tournament.max_teams > 0;

  return (
    <div className="space-y-6">
      <FloatingPanel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Drag to Set Seeds</h3>
          <div className="flex gap-2">
            <GlowButton variant="ghost" size="sm" onClick={() => saveSeedsMutation.mutate(seeds)} disabled={saveSeedsMutation.isPending}>
              {saveSeedsMutation.isPending ? 'Saving…' : 'Save Order'}
            </GlowButton>
            <GlowButton
              size="sm"
              onClick={() => generateBracketsMutation.mutate()}
              disabled={!allSlotsFilled || generateBracketsMutation.isPending}
            >
              <Award className="w-4 h-4" />
              {generateBracketsMutation.isPending ? 'Generating…' : 'Generate Brackets'}
            </GlowButton>
          </div>
        </div>

        {!allSlotsFilled && tournament.max_teams && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
            Need {tournament.max_teams - seeds.length} more confirmed team(s) before generating brackets.
          </div>
        )}

        {seeds.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
            <p className="text-gray-500">No confirmed teams yet. Approve requests in Team Management first.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="seeds">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                  {seeds.map((team, idx) => (
                    <Draggable key={team.id} draggableId={team.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            snapshot.isDragging
                              ? 'bg-red-500/10 border-red-500/40'
                              : 'bg-zinc-800/50 border-zinc-700/50'
                          }`}
                        >
                          <div {...provided.dragHandleProps} className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <span className="text-red-500 font-black text-sm w-6 text-center">#{idx + 1}</span>
                          <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center">
                            {team.logo
                              ? <img src={team.logo} alt="" className="w-full h-full object-cover" />
                              : <Users className="w-4 h-4 text-gray-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{team.name}</p>
                            <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                          </div>
                          {(() => {
                            const memberRiots = (team.members || []).flatMap(uid => riotByUser[uid] || [])
                            const best = topRank(memberRiots)
                            if (!best?.rank_tier) return null
                            const color = TIER_COLOR[best.rank_tier.toUpperCase()] || 'text-gray-400'
                            return (
                              <span className={`text-[10px] font-bold shrink-0 ${color}`} title={`Top rank: ${best.game_name}#${best.tag_line}`}>
                                {best.rank_tier}
                              </span>
                            )
                          })()}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </FloatingPanel>
    </div>
  );
}