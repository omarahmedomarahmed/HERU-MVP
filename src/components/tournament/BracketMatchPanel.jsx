import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Trophy, RotateCcw, CheckCircle, Clock, Circle, X, MessageSquare, AlertTriangle, Image, Send, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tournament } from '@/api/heruClient'


function getTeamById(id, teams) {
  return teams.find(t => t?.id === id);
}

// ---------------------------------------------------------------------------
// Match Detail Modal — opened when clicking a match card
// ---------------------------------------------------------------------------

function MatchDetailModal({ match, roundIdx, matchIdx, teams, canEdit, onUpdate, onReset, onClose, tournament }) {
  const [s1, setS1] = useState(match.score1 ?? '');
  const [s2, setS2] = useState(match.score2 ?? '');
  const [chatMsg, setChatMsg] = useState('');
  const [activeSection, setActiveSection] = useState('scores');

  const team1 = getTeamById(match.team1, teams);
  const team2 = getTeamById(match.team2, teams);
  const hasWinner = !!match.winner;

  // Match-level submissions (screenshots, reported scores from teams)
  const submissions = match.submissions || [];
  const team1Submissions = submissions.filter(s => s.team_id === match.team1);
  const team2Submissions = submissions.filter(s => s.team_id === match.team2);

  // Match chat
  const matchChat = match.chat || [];

  // Abuse reports
  const abuseReports = match.abuse_reports || [];

  const sectionTabs = [
    { id: 'scores', label: 'Scores', icon: Trophy },
    { id: 'submissions', label: 'Submissions', icon: Image },
    { id: 'chat', label: 'Chat', icon: MessageSquare, count: matchChat.length },
    { id: 'reports', label: 'Reports', icon: AlertTriangle, count: abuseReports.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 shrink-0">
          <div>
            <h3 className="text-white font-bold text-lg">Match {matchIdx + 1} — Round {roundIdx + 1}</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              {hasWinner ? 'Completed' : (match.team1 && match.team2) ? 'Ready to play' : 'Waiting for teams'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teams Header */}
        <div className="flex items-center gap-4 p-5 border-b border-zinc-800 shrink-0">
          <div className={cn("flex-1 flex items-center gap-3 p-3 rounded-xl", match.winner === match.team1 ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-800/50')}>
            <div className="w-10 h-10 rounded-lg bg-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
              {team1?.logo ? <img src={team1.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-xs">?</span>}
            </div>
            <div className="min-w-0">
              <p className={cn("font-bold text-sm truncate", team1 ? 'text-white' : 'text-gray-500')}>{team1?.name || 'TBD'}</p>
              {match.score1 != null && <p className="text-2xl font-black text-white">{match.score1}</p>}
            </div>
            {match.winner === match.team1 && <Trophy className="w-5 h-5 text-yellow-400 ml-auto shrink-0" />}
          </div>

          <span className="text-gray-600 font-black text-sm">VS</span>

          <div className={cn("flex-1 flex items-center gap-3 p-3 rounded-xl", match.winner === match.team2 ? 'bg-green-500/10 border border-green-500/30' : 'bg-zinc-800/50')}>
            <div className="w-10 h-10 rounded-lg bg-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
              {team2?.logo ? <img src={team2.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-xs">?</span>}
            </div>
            <div className="min-w-0">
              <p className={cn("font-bold text-sm truncate", team2 ? 'text-white' : 'text-gray-500')}>{team2?.name || 'TBD'}</p>
              {match.score2 != null && <p className="text-2xl font-black text-white">{match.score2}</p>}
            </div>
            {match.winner === match.team2 && <Trophy className="w-5 h-5 text-yellow-400 ml-auto shrink-0" />}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 px-5 pt-3 border-b border-zinc-800 shrink-0">
          {sectionTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors",
                activeSection === tab.id ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Scores Section */}
          {activeSection === 'scores' && (
            <div className="space-y-4">
              {canEdit && match.team1 && match.team2 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">{team1?.name || 'Team 1'} Score</label>
                      <Input
                        value={s1}
                        onChange={(e) => setS1(e.target.value)}
                        type="number"
                        min="0"
                        className="bg-zinc-800 border-zinc-700 text-white text-center text-lg font-bold"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">{team2?.name || 'Team 2'} Score</label>
                      <Input
                        value={s2}
                        onChange={(e) => setS2(e.target.value)}
                        type="number"
                        min="0"
                        className="bg-zinc-800 border-zinc-700 text-white text-center text-lg font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <GlowButton
                      variant="ghost"
                      className="flex-1"
                      onClick={() => onUpdate({ score1: Number(s1), score2: Number(s2) })}
                    >
                      Save Scores
                    </GlowButton>
                  </div>

                  {!hasWinner && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Set Winner</p>
                      <div className="grid grid-cols-2 gap-2">
                        {team1 && (
                          <button
                            onClick={() => { onUpdate({ winner: match.team1, score1: Number(s1), score2: Number(s2) }); onClose(); }}
                            className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm hover:bg-green-500/20 transition-colors"
                          >
                            {team1.name} Wins
                          </button>
                        )}
                        {team2 && (
                          <button
                            onClick={() => { onUpdate({ winner: match.team2, score1: Number(s1), score2: Number(s2) }); onClose(); }}
                            className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-sm hover:bg-green-500/20 transition-colors"
                          >
                            {team2.name} Wins
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {hasWinner && (
                    <GlowButton
                      variant="ghost"
                      className="w-full"
                      onClick={() => { onReset(); }}
                    >
                      <RotateCcw className="w-4 h-4" /> Reset Match Result
                    </GlowButton>
                  )}
                </>
              )}

              {(!match.team1 || !match.team2) && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Waiting for teams to advance from previous rounds.</p>
                </div>
              )}

              {!canEdit && hasWinner && (
                <div className="text-center py-4">
                  <p className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {getTeamById(match.winner, teams)?.name || 'Winner'} won this match
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submissions Section */}
          {activeSection === 'submissions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{team1?.name || 'Team 1'}</h4>
                  {team1Submissions.length === 0 ? (
                    <div className="bg-zinc-800/40 rounded-lg p-4 text-center text-gray-600 text-xs">No submissions yet</div>
                  ) : (
                    <div className="space-y-2">
                      {team1Submissions.map((sub, i) => (
                        <div key={i} className="bg-zinc-800/40 rounded-lg p-3 text-sm">
                          {sub.screenshot && <img src={sub.screenshot} alt="Screenshot" className="w-full rounded mb-2" />}
                          {sub.reported_score != null && <p className="text-white font-bold">Reported Score: {sub.reported_score}</p>}
                          {sub.note && <p className="text-gray-400 text-xs mt-1">{sub.note}</p>}
                          <p className="text-gray-600 text-[10px] mt-1">{sub.timestamp ? new Date(sub.timestamp).toLocaleString() : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">{team2?.name || 'Team 2'}</h4>
                  {team2Submissions.length === 0 ? (
                    <div className="bg-zinc-800/40 rounded-lg p-4 text-center text-gray-600 text-xs">No submissions yet</div>
                  ) : (
                    <div className="space-y-2">
                      {team2Submissions.map((sub, i) => (
                        <div key={i} className="bg-zinc-800/40 rounded-lg p-3 text-sm">
                          {sub.screenshot && <img src={sub.screenshot} alt="Screenshot" className="w-full rounded mb-2" />}
                          {sub.reported_score != null && <p className="text-white font-bold">Reported Score: {sub.reported_score}</p>}
                          {sub.note && <p className="text-gray-400 text-xs mt-1">{sub.note}</p>}
                          <p className="text-gray-600 text-[10px] mt-1">{sub.timestamp ? new Date(sub.timestamp).toLocaleString() : ''}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          {activeSection === 'chat' && (
            <div className="space-y-3">
              {matchChat.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">No match chat messages yet.</div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {matchChat.map((msg, i) => (
                    <div key={i} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                        {(msg.sender_name || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-xs font-bold">{msg.sender_name}</span>
                          <span className="text-gray-600 text-[10px]">{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</span>
                        </div>
                        <p className="text-gray-300 text-xs">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t border-zinc-800">
                <Input
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="bg-zinc-800 border-zinc-700 text-white text-sm flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && chatMsg.trim()) {
                      // Chat is stored in match object — update via bracket update
                      onUpdate({
                        chat: [...matchChat, {
                          sender_name: 'Organizer',
                          sender_role: 'organizer',
                          message: chatMsg.trim(),
                          timestamp: new Date().toISOString(),
                        }]
                      });
                      setChatMsg('');
                    }
                  }}
                />
                <GlowButton
                  size="sm"
                  disabled={!chatMsg.trim()}
                  onClick={() => {
                    if (!chatMsg.trim()) return;
                    onUpdate({
                      chat: [...matchChat, {
                        sender_name: 'Organizer',
                        sender_role: 'organizer',
                        message: chatMsg.trim(),
                        timestamp: new Date().toISOString(),
                      }]
                    });
                    setChatMsg('');
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                </GlowButton>
              </div>
            </div>
          )}

          {/* Abuse Reports Section */}
          {activeSection === 'reports' && (
            <div className="space-y-3">
              {abuseReports.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">
                  <Flag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No abuse reports for this match.
                </div>
              ) : (
                abuseReports.map((report, i) => (
                  <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-red-400 text-xs font-bold">{report.reporter_name || 'Anonymous'}</span>
                      <span className="text-gray-600 text-[10px]">{report.timestamp ? new Date(report.timestamp).toLocaleString() : ''}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{report.reason || report.description || 'No details provided'}</p>
                    {report.evidence_url && (
                      <a href={report.evidence_url} target="_blank" rel="noopener noreferrer" className="text-red-400 text-xs hover:underline mt-1 inline-block">
                        View Evidence
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, roundIdx, matchIdx, teams, canEdit, onUpdate, onReset, onOpenDetail }) {
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
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 cursor-pointer hover:ring-1 hover:ring-red-500/30 transition-all",
        status === 'completed' ? 'bg-green-500/5 border-green-500/20' :
        status === 'upcoming' ? 'bg-red-500/5 border-red-500/20' :
        'bg-zinc-800/40 border-zinc-700/50'
      )}
      onClick={onOpenDetail}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs font-bold">Match {matchIdx + 1}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600">Click to manage</span>
          <div className={cn("flex items-center gap-1 text-xs", statusBadge.color)}>
            <statusBadge.Icon className="w-3 h-3" />
            {statusBadge.label}
          </div>
        </div>
      </div>

      {/* Team 1 row */}
      <TeamRow
        team={team1}
        score={s1}
        onScore={setS1}
        isWinner={match.winner === match.team1}
        canEdit={canEdit && canSetWinner && !hasWinner}
        onSetWinner={(e) => { e.stopPropagation(); onUpdate({ winner: match.team1, score1: Number(s1), score2: Number(s2) }); }}
        placeholder="Team 1"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="text-center text-xs text-gray-600 font-bold">VS</div>

      {/* Team 2 row */}
      <TeamRow
        team={team2}
        score={s2}
        onScore={setS2}
        isWinner={match.winner === match.team2}
        canEdit={canEdit && canSetWinner && !hasWinner}
        onSetWinner={(e) => { e.stopPropagation(); onUpdate({ winner: match.team2, score1: Number(s1), score2: Number(s2) }); }}
        placeholder="Team 2"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Save scores + Reset */}
      {canEdit && canSetWinner && (
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
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

function TeamRow({ team, score, onScore, isWinner, canEdit, onSetWinner, placeholder, onClick }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-lg",
        isWinner ? 'bg-green-500/15 border border-green-500/30' : 'bg-zinc-800/60'
      )}
      onClick={onClick}
    >
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
  const [selectedMatch, setSelectedMatch] = useState(null); // { roundIdx, matchIdx }

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

  // Generate empty brackets even with no teams
  const generateEmptyBrackets = useMutation({
    mutationFn: async (numTeams) => {
      const count = numTeams || tournament.max_teams || 8;
      const rounds = Math.ceil(Math.log2(count));
      const newBrackets = [];

      const firstRoundMatches = Math.ceil(count / 2);
      const firstRound = [];
      for (let m = 0; m < firstRoundMatches; m++) {
        firstRound.push({
          match_id: `r1-m${m}`,
          team1: null,
          team2: null,
          winner: null,
          score1: null,
          score2: null,
          chat: [],
          submissions: [],
          abuse_reports: [],
        });
      }
      newBrackets.push({ round: 1, matches: firstRound });

      for (let r = 2; r <= rounds; r++) {
        const prevMatches = newBrackets[r - 2].matches.length;
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
            chat: [],
            submissions: [],
            abuse_reports: [],
          });
        }
        newBrackets.push({ round: r, matches: roundMatches });
      }

      const log = [
        ...(tournament.tournament_log || []),
        {
          action: 'brackets_generated',
          description: `Empty bracket structure generated for ${count} team slots`,
          timestamp: new Date().toISOString(),
        },
      ];

      await Tournament.update(tournamentId, { brackets: newBrackets, tournament_log: log });
    },
    onSuccess: () => queryClient.invalidateQueries(['tournament', tournamentId]),
  });

  const selectedMatchData = selectedMatch
    ? brackets[selectedMatch.roundIdx]?.matches[selectedMatch.matchIdx]
    : null;

  if (!brackets.length) {
    return (
      <div className="space-y-4">
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">No brackets generated yet.</p>
          {canEdit && (
            <div className="space-y-3">
              <p className="text-gray-500 text-sm">Generate an empty bracket structure to set up matches.</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {[4, 8, 16, 32].map(n => (
                  <GlowButton
                    key={n}
                    variant="ghost"
                    size="sm"
                    onClick={() => generateEmptyBrackets.mutate(n)}
                    disabled={generateEmptyBrackets.isPending}
                  >
                    {n} Teams
                  </GlowButton>
                ))}
              </div>
              {tournament.max_teams && (
                <GlowButton
                  onClick={() => generateEmptyBrackets.mutate(tournament.max_teams)}
                  disabled={generateEmptyBrackets.isPending}
                >
                  Generate for {tournament.max_teams} Teams (Tournament Setting)
                </GlowButton>
              )}
            </div>
          )}
        </FloatingPanel>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bracket controls */}
      {canEdit && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">{tournament.format || 'Single Elimination'}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-sm">{brackets.length} rounds, {brackets.reduce((s, r) => s + r.matches.length, 0)} matches</span>
          </div>
          <div className="flex gap-2">
            <GlowButton
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('This will regenerate all brackets and reset all match data. Continue?')) {
                  generateEmptyBrackets.mutate(tournament.max_teams || teams.length || 8);
                }
              }}
              disabled={generateEmptyBrackets.isPending}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Regenerate Brackets
            </GlowButton>
          </div>
        </div>
      )}

      {/* Bracket visual */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-6 min-w-max">
          {brackets.map((round, roundIdx) => (
            <div key={roundIdx} className="w-72 space-y-4">
              <h4 className="text-center text-white font-black text-sm">
                {round.round === brackets.length ? 'FINALS' :
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
                    onOpenDetail={() => setSelectedMatch({ roundIdx, matchIdx })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && selectedMatchData && (
        <MatchDetailModal
          match={selectedMatchData}
          roundIdx={selectedMatch.roundIdx}
          matchIdx={selectedMatch.matchIdx}
          teams={teams}
          canEdit={canEdit}
          tournament={tournament}
          onUpdate={(updates) => {
            updateMatch.mutate({ roundIdx: selectedMatch.roundIdx, matchIdx: selectedMatch.matchIdx, updates });
          }}
          onReset={() => {
            resetMatch.mutate({ roundIdx: selectedMatch.roundIdx, matchIdx: selectedMatch.matchIdx });
          }}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}