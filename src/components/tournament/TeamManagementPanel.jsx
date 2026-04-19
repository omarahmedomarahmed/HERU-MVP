import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Users, CheckCircle, XCircle, UserMinus, Search, Clock, ChevronDown, ChevronRight, Crown, Shield, User, Swords } from 'lucide-react';
import { Team, Tournament, TeamMember, GamerProfile } from '@/api/heruClient'


function TeamMembersRow({ teamId }) {
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members-panel', teamId],
    queryFn: () => TeamMember.list(teamId),
    staleTime: 30_000,
  });

  if (isLoading) return <div className="px-4 pb-3 text-xs text-gray-500">Loading members...</div>;
  if (!members.length) return <div className="px-4 pb-3 text-xs text-gray-500">No members found</div>;

  return (
    <div className="px-4 pb-3 pt-1 grid grid-cols-2 md:grid-cols-3 gap-2">
      {members.map(m => (
        <div key={m.user_id} className="flex items-center gap-2 bg-zinc-900/60 rounded-lg p-2">
          <div className="w-7 h-7 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
            {m.avatar
              ? <img src={m.avatar} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">{(m.username || '?')[0].toUpperCase()}</div>
            }
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              {m.is_leader && <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
              {m.role === 'sub' && <Shield className="w-3 h-3 text-blue-400 flex-shrink-0" />}
              <span className="text-white text-xs font-medium truncate">{m.username || 'Player'}</span>
            </div>
            <span className="text-gray-500 text-xs truncate block">{m.role || 'player'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const is1v1Tournament = (t) => t.participant_type === 'player' || t.participant_type === '1v1';

export default function TeamManagementPanel({ tournament, canEdit }) {
  const [search, setSearch] = useState('');
  const [expandedTeam, setExpandedTeam] = useState(null);
  const queryClient = useQueryClient();
  const tournamentId = tournament.id;
  const is1v1 = is1v1Tournament(tournament);

  const { data: confirmedTeams = [] } = useQuery({
    queryKey: ['confirmed-teams', tournament.teams],
    queryFn: async () => {
      if (!tournament.teams?.length) return [];
      const all = await Team.list();
      return all.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament.teams?.length,
  });

  const { data: allTeams = [] } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => Team.list(),
  });

  // Join requests embedded in the Tournament entity
  const joinRequests = tournament.join_requests || [];

  const pendingRequests = joinRequests.filter(r => r.status === 'pending');
  const invitedTeams = (tournament.invited_teams || []).map(id => allTeams.find(t => t.id === id)).filter(Boolean);

  const capacity = tournament.max_teams || 0;
  const filled = confirmedTeams.length;
  const pct = capacity > 0 ? Math.min(100, Math.round((filled / capacity) * 100)) : 0;

  const approveRequest = useMutation({
    mutationFn: async (req) => {
      const updatedRequests = joinRequests.map(r =>
        r.team_id === req.team_id ? { ...r, status: 'approved' } : r
      );
      const updatedTeams = [...(tournament.teams || []), req.team_id];
      await Tournament.update(tournamentId, {
        join_requests: updatedRequests,
        teams: updatedTeams,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const rejectRequest = useMutation({
    mutationFn: async (req) => {
      const updatedRequests = joinRequests.map(r =>
        r.team_id === req.team_id ? { ...r, status: 'rejected' } : r
      );
      await Tournament.update(tournamentId, { join_requests: updatedRequests });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const removeTeam = useMutation({
    mutationFn: async (teamId) => {
      const updatedTeams = (tournament.teams || []).filter(id => id !== teamId);
      await Tournament.update(tournamentId, { teams: updatedTeams });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const inviteTeam = useMutation({
    mutationFn: async (teamId) => {
      const team = allTeams.find(t => t.id === teamId);
      const updatedInvites = [...(team.tournament_invites || []), {
        tournament_id: tournamentId,
        status: 'pending',
        invited_by: tournament.organizer_id,
      }];
      await Team.update(teamId, { tournament_invites: updatedInvites });
      const updatedTournamentInvites = [...(tournament.invited_teams || []), teamId];
      await Tournament.update(tournamentId, { invited_teams: updatedTournamentInvites });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const searchResults = search.length > 1
    ? allTeams.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase()) &&
        !tournament.teams?.includes(t.id) &&
        !tournament.invited_teams?.includes(t.id)
      )
    : [];

  const playerParticipants = tournament.player_participants || [];

  return (
    <div className="space-y-6">
      {/* 1v1 Player Participants Section */}
      {is1v1 && (
        <FloatingPanel className="p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Swords className="w-4 h-4 text-red-400" /> Registered Players ({playerParticipants.length} / {tournament.max_teams || '∞'})
          </h3>
          {playerParticipants.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No players registered yet</p>
          ) : (
            <div className="space-y-2">
              {playerParticipants.map((p, i) => (
                <div key={p.user_id || i} className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-lg">
                  <span className="text-gray-500 text-xs w-5 font-bold">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.username || p.user_id?.slice(0, 8) || 'Player'}</p>
                    {(p.game_id || p.rank) && (
                      <p className="text-gray-500 text-xs">
                        {p.game_id && <span>ID: {p.game_id}</span>}
                        {p.rank && <span className="ml-2">Rank: {p.rank}</span>}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Registered</span>
                </div>
              ))}
            </div>
          )}
        </FloatingPanel>
      )}

      {/* Capacity Bar */}
      {capacity > 0 && !is1v1 && (
        <FloatingPanel className="p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Team Capacity</span>
            <span className="text-white font-bold">{filled} / {capacity}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{capacity - filled} slots remaining</p>
        </FloatingPanel>
      )}

      {/* Pending Join Requests (team tournaments only) */}
      {!is1v1 && pendingRequests.length > 0 && (
        <FloatingPanel className="p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Pending Join Requests ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((req, idx) => {
              const team = allTeams.find(t => t.id === req.team_id);
              return (
                <div key={idx} className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center">
                    {team?.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{team?.name || req.team_id}</p>
                    <p className="text-gray-500 text-xs">{team?.members?.length || 0} members · {req.game} · {req.rank}</p>
                    <p className="text-gray-600 text-xs">In-game ID: {req.game_id || '—'}</p>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest.mutate(req)}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectRequest.mutate(req)}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FloatingPanel>
      )}

      {/* Confirmed Teams (team tournaments only) */}
      {!is1v1 && <FloatingPanel className="p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" /> Confirmed Teams ({confirmedTeams.length})
        </h3>
        {confirmedTeams.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No teams confirmed yet</p>
        ) : (
          <div className="space-y-2">
            {confirmedTeams.map((team, idx) => team && (
              <div key={team.id} className="bg-zinc-800/40 rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-zinc-800/60 transition-colors"
                  onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
                >
                  <span className="text-gray-500 text-xs w-5 text-center font-bold">#{idx + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{team.name}</p>
                    <p className="text-gray-500 text-xs">{team.members?.length || 0} members · {team.games?.[0] || '—'}</p>
                  </div>
                  {expandedTeam === team.id
                    ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  }
                  {canEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeTeam.mutate(team.id); }}
                      className="p-1.5 rounded-lg bg-zinc-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remove team"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {expandedTeam === team.id && <TeamMembersRow teamId={team.id} />}
              </div>
            ))}
          </div>
        )}
      </FloatingPanel>}

      {/* Invited Teams (team tournaments only) */}
      {!is1v1 && invitedTeams.length > 0 && (
        <FloatingPanel className="p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-400" /> Invited (Pending Response) ({invitedTeams.length})
          </h3>
          <div className="space-y-2">
            {invitedTeams.map(team => team && (
              <div key={team.id} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center">
                  {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{team.name}</p>
                  <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                </div>
                <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Invited</span>
              </div>
            ))}
          </div>
        </FloatingPanel>
      )}

      {/* Invite by Search (team tournaments only) */}
      {canEdit && !is1v1 && (
        <FloatingPanel className="p-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" /> Invite a Team
          </h3>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams by name..."
            className="bg-zinc-800 border-zinc-700 text-white mb-3"
          />
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.slice(0, 8).map(team => (
                <div key={team.id} className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden flex items-center justify-center">
                    {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{team.name}</p>
                    <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                  </div>
                  <GlowButton size="sm" onClick={() => { inviteTeam.mutate(team.id); setSearch(''); }}>
                    Invite
                  </GlowButton>
                </div>
              ))}
            </div>
          )}
        </FloatingPanel>
      )}
    </div>
  );
}