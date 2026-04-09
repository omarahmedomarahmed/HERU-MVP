import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tournament, Team, GamerProfile, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import { uploadFile } from '@/lib/uploadFile';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Swords, Trophy, Shield, Users, MessageSquare, Camera,
  Upload, AlertTriangle, ChevronRight, ChevronDown, Clock,
  CheckCircle, Play, Send, X, Eye, Zap, Target, Image as ImageIcon,
  Flag, Loader2
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Status badge component
// ---------------------------------------------------------------------------
function StatusBadge({ status }) {
  const config = {
    live: { bg: 'bg-red-600', text: 'LIVE', pulse: true },
    published: { bg: 'bg-yellow-600', text: 'UPCOMING', pulse: false },
    completed: { bg: 'bg-green-600', text: 'COMPLETED', pulse: false },
  };
  const c = config[status] || { bg: 'bg-zinc-600', text: status?.toUpperCase(), pulse: false };
  return (
    <span className={`inline-flex items-center gap-1.5 ${c.bg} text-white text-xs font-bold px-3 py-1 rounded-full`}>
      {c.pulse && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
      {c.text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Bracket visual component
// ---------------------------------------------------------------------------
function BracketVisual({ brackets = [], userTeamIds = [], userId }) {
  if (!brackets.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="w-10 h-10 mx-auto mb-2 opacity-40" />
        <p>Brackets not yet generated</p>
      </div>
    );
  }

  // Group matches by round
  const rounds = {};
  brackets.forEach((match) => {
    const round = match.round || 1;
    if (!rounds[round]) rounds[round] = [];
    rounds[round].push(match);
  });

  const roundKeys = Object.keys(rounds).sort((a, b) => Number(a) - Number(b));

  const isUserTeam = (teamId) =>
    userTeamIds.includes(teamId) || teamId === userId;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {roundKeys.map((roundKey) => (
          <div key={roundKey} className="flex flex-col gap-4 min-w-[220px]">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-2">
              {roundKeys.length === Number(roundKey) ? 'FINAL' : `Round ${roundKey}`}
            </h4>
            {rounds[roundKey].map((match, mi) => {
              const aHighlight = isUserTeam(match.team_a_id);
              const bHighlight = isUserTeam(match.team_b_id);
              return (
                <div
                  key={match.id || mi}
                  className={`rounded-lg border overflow-hidden ${
                    aHighlight || bHighlight
                      ? 'border-red-500/50 shadow-[0_0_12px_rgba(255,26,26,0.15)]'
                      : 'border-zinc-700/50'
                  }`}
                >
                  {/* Team A */}
                  <div
                    className={`flex items-center justify-between px-3 py-2 text-sm ${
                      aHighlight ? 'bg-red-900/30' : 'bg-zinc-800/60'
                    }`}
                  >
                    <span className={`truncate ${aHighlight ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                      {match.team_a_name || 'TBD'}
                    </span>
                    <span className="text-white font-mono font-bold ml-2">
                      {match.team_a_score ?? '-'}
                    </span>
                  </div>
                  <div className="border-t border-zinc-700/30" />
                  {/* Team B */}
                  <div
                    className={`flex items-center justify-between px-3 py-2 text-sm ${
                      bHighlight ? 'bg-red-900/30' : 'bg-zinc-800/60'
                    }`}
                  >
                    <span className={`truncate ${bHighlight ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                      {match.team_b_name || 'TBD'}
                    </span>
                    <span className="text-white font-mono font-bold ml-2">
                      {match.team_b_score ?? '-'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match chat component
// ---------------------------------------------------------------------------
function MatchChat({ tournamentId, chatMessages = [], userId, userName, onSendMessage, isSending }) {
  const [msg, setMsg] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = () => {
    const text = msg.trim();
    if (!text) return;
    onSendMessage(text);
    setMsg('');
  };

  return (
    <div className="flex flex-col h-[300px]">
      <div className="flex-1 overflow-y-auto space-y-2 p-3 bg-zinc-950/50 rounded-lg">
        {chatMessages.length === 0 && (
          <p className="text-center text-gray-600 text-sm py-8">No messages yet. Say hello!</p>
        )}
        {chatMessages.map((m, i) => {
          const isMe = m.sender_id === userId;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  isMe
                    ? 'bg-red-600/80 text-white'
                    : 'bg-zinc-800 text-gray-300'
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-bold text-red-400 mb-0.5">{m.sender_name || 'Unknown'}</p>
                )}
                <p>{m.message}</p>
                {m.timestamp && (
                  <p className="text-[10px] opacity-50 mt-1">
                    {format(new Date(m.timestamp), 'HH:mm')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <Input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="bg-zinc-800 border-zinc-700 text-white flex-1"
        />
        <GlowButton size="sm" onClick={handleSend} disabled={!msg.trim() || isSending}>
          <Send className="w-4 h-4" />
        </GlowButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Match submission panel
// ---------------------------------------------------------------------------
function MatchSubmission({ match, tournamentId, userId, userName }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [teamAScore, setTeamAScore] = useState(match?.team_a_score ?? '');
  const [teamBScore, setTeamBScore] = useState(match?.team_b_score ?? '');
  const [screenshots, setScreenshots] = useState([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [abuseReason, setAbuseReason] = useState('');
  const [showAbuseForm, setShowAbuseForm] = useState(false);

  const submitScoreMutation = useMutation({
    mutationFn: () =>
      Tournament.updateMatchScore(tournamentId, match.id, {
        team_a_score: Number(teamAScore),
        team_b_score: Number(teamBScore),
        submissions: { screenshots, notes },
        reporter_id: userId,
      }),
    onSuccess: () => {
      toast({ title: 'Score submitted', description: 'Your match results have been reported.' });
      queryClient.invalidateQueries({ queryKey: ['arena-tournaments'] });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const reportAbuseMutation = useMutation({
    mutationFn: () =>
      Tournament.updateMatchScore(tournamentId, match.id, {
        abuse_report: {
          reporter_id: userId,
          reporter_name: userName,
          reason: abuseReason,
          screenshots,
          reported_at: new Date().toISOString(),
        },
      }),
    onSuccess: () => {
      toast({ title: 'Report submitted', description: 'Staff will review your report.' });
      setShowAbuseForm(false);
      setAbuseReason('');
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const result = await uploadFile(file);
        urls.push(result.file_url);
      }
      setScreenshots((prev) => [...prev, ...urls]);
      toast({ title: 'Uploaded', description: `${urls.length} screenshot(s) uploaded.` });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const matchComplete = match?.status === 'completed';

  return (
    <div className="space-y-4">
      {matchComplete ? (
        <div className="flex items-center gap-2 text-green-400 bg-green-900/20 rounded-lg p-3">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Match completed</span>
        </div>
      ) : (
        <>
          {/* Score entry */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Report Score</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">{match?.team_a_name || 'Team A'}</label>
                <Input
                  type="number"
                  min="0"
                  value={teamAScore}
                  onChange={(e) => setTeamAScore(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">{match?.team_b_name || 'Team B'}</label>
                <Input
                  type="number"
                  min="0"
                  value={teamBScore}
                  onChange={(e) => setTeamBScore(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Screenshots</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {screenshots.map((url, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-700 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setScreenshots((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-gray-500 block mb-1">Notes (optional)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Any match notes..."
            />
          </div>

          {/* Submit */}
          <GlowButton
            className="w-full"
            onClick={() => submitScoreMutation.mutate()}
            disabled={teamAScore === '' || teamBScore === '' || submitScoreMutation.isPending}
          >
            {submitScoreMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            SUBMIT RESULTS
          </GlowButton>
        </>
      )}

      {/* Report abuse */}
      <div className="pt-2 border-t border-zinc-800">
        {showAbuseForm ? (
          <div className="space-y-2">
            <Input
              value={abuseReason}
              onChange={(e) => setAbuseReason(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
              placeholder="Describe the issue..."
            />
            <p className="text-xs text-gray-500">Attach screenshots above as proof before submitting.</p>
            <div className="flex gap-2">
              <GlowButton
                variant="secondary"
                size="sm"
                onClick={() => reportAbuseMutation.mutate()}
                disabled={!abuseReason.trim() || reportAbuseMutation.isPending}
              >
                {reportAbuseMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Flag className="w-3 h-3" />
                )}
                SUBMIT REPORT
              </GlowButton>
              <GlowButton variant="ghost" size="sm" onClick={() => setShowAbuseForm(false)}>
                Cancel
              </GlowButton>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAbuseForm(true)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
          >
            <AlertTriangle className="w-3 h-3" />
            Report abuse
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expanded tournament detail panel
// ---------------------------------------------------------------------------
function TournamentDetail({ tournament, userTeamIds, userId, userName, profile }) {
  const [activeTab, setActiveTab] = useState('brackets');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const brackets = tournament.brackets || [];

  // Find the user's current/next match
  const userMatch = useMemo(() => {
    return brackets.find((m) => {
      const isTeamA = userTeamIds.includes(m.team_a_id) || m.team_a_id === userId;
      const isTeamB = userTeamIds.includes(m.team_b_id) || m.team_b_id === userId;
      return (isTeamA || isTeamB) && m.status !== 'completed';
    });
  }, [brackets, userTeamIds, userId]);

  // Find user's seeding
  const userSeed = useMemo(() => {
    const teamsArr = tournament.teams || [];
    for (let i = 0; i < teamsArr.length; i++) {
      if (userTeamIds.includes(teamsArr[i]) || teamsArr[i] === userId) {
        return i + 1;
      }
    }
    return null;
  }, [tournament.teams, userTeamIds, userId]);

  // Chat mutation
  const sendChatMutation = useMutation({
    mutationFn: (message) =>
      Tournament.sendGeneralChat(tournament.id, {
        message,
        sender_id: userId,
        sender_name: userName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arena-tournaments'] });
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const tabs = [
    { id: 'brackets', label: 'Brackets', icon: Target },
    { id: 'match', label: 'My Match', icon: Swords },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
  ];

  const opponentName = userMatch
    ? userTeamIds.includes(userMatch.team_a_id) || userMatch.team_a_id === userId
      ? userMatch.team_b_name
      : userMatch.team_a_name
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="pt-4 border-t border-zinc-800">
        {/* Match overview */}
        {userMatch && (
          <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-900/20 to-zinc-900/50 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                {userMatch.status === 'in_progress' ? 'Match In Progress' : 'Next Match'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-white font-bold">
                  {userTeamIds.includes(userMatch.team_a_id) || userMatch.team_a_id === userId
                    ? userMatch.team_a_name
                    : userMatch.team_b_name}
                </p>
                <p className="text-xs text-gray-500">YOU</p>
              </div>
              <div className="px-4">
                <span className="text-2xl font-black text-red-500">VS</span>
              </div>
              <div className="text-center flex-1">
                <p className="text-white font-bold">{opponentName || 'TBD'}</p>
                <p className="text-xs text-gray-500">OPPONENT</p>
              </div>
            </div>
            {userSeed && (
              <p className="text-center text-xs text-gray-500 mt-2">Your Seed: #{userSeed}</p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-zinc-900 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'brackets' && (
          <BracketVisual
            brackets={brackets}
            userTeamIds={userTeamIds}
            userId={userId}
          />
        )}

        {activeTab === 'match' && (
          <div>
            {userMatch ? (
              <MatchSubmission
                match={userMatch}
                tournamentId={tournament.id}
                userId={userId}
                userName={userName}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No active match right now</p>
                <p className="text-xs mt-1">Check back when your next match is scheduled</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <MatchChat
            tournamentId={tournament.id}
            chatMessages={tournament.general_chat || []}
            userId={userId}
            userName={userName}
            onSendMessage={(text) => sendChatMutation.mutate(text)}
            isSending={sendChatMutation.isPending}
          />
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tournament card
// ---------------------------------------------------------------------------
function ArenaTournamentCard({ tournament, userTeamIds, userId, userName, profile }) {
  const [expanded, setExpanded] = useState(false);

  const brackets = tournament.brackets || [];

  // Determine user's seeding
  const userSeed = useMemo(() => {
    const teamsArr = tournament.teams || [];
    for (let i = 0; i < teamsArr.length; i++) {
      if (userTeamIds.includes(teamsArr[i]) || teamsArr[i] === userId) {
        return i + 1;
      }
    }
    return null;
  }, [tournament.teams, userTeamIds, userId]);

  // Find next match opponent
  const nextMatch = useMemo(() => {
    return brackets.find((m) => {
      const isTeamA = userTeamIds.includes(m.team_a_id) || m.team_a_id === userId;
      const isTeamB = userTeamIds.includes(m.team_b_id) || m.team_b_id === userId;
      return (isTeamA || isTeamB) && m.status !== 'completed';
    });
  }, [brackets, userTeamIds, userId]);

  const opponentName = nextMatch
    ? userTeamIds.includes(nextMatch.team_a_id) || nextMatch.team_a_id === userId
      ? nextMatch.team_b_name
      : nextMatch.team_a_name
    : null;

  return (
    <FloatingPanel className="overflow-hidden transition-all duration-300">
      {/* Card header - clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start gap-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Tournament image */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br from-red-900/30 to-zinc-800 flex-shrink-0 overflow-hidden">
          {tournament.tournament_image ? (
            <img
              src={tournament.tournament_image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-zinc-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={tournament.status} />
            <span className="text-xs bg-zinc-800 text-gray-400 px-2 py-0.5 rounded">
              {tournament.game || 'TBD'}
            </span>
          </div>
          <h3 className="text-white font-bold text-lg truncate">{tournament.name}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
            {userSeed && (
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                Seed #{userSeed}
              </span>
            )}
            {opponentName ? (
              <span className="flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-yellow-400" />
                vs {opponentName}
              </span>
            ) : tournament.status !== 'completed' ? (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Waiting for match
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {tournament.teams?.length || 0}/{tournament.max_teams || '?'}
            </span>
          </div>
          {tournament.schedule && (
            <p className="text-xs text-gray-600 mt-1">
              {format(new Date(tournament.schedule), 'MMM d, yyyy - h:mm a')}
            </p>
          )}
        </div>

        {/* Expand arrow */}
        <div className="flex-shrink-0 pt-2">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </motion.div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <div className="px-4 pb-4">
            <TournamentDetail
              tournament={tournament}
              userTeamIds={userTeamIds}
              userId={userId}
              userName={userName}
              profile={profile}
            />
          </div>
        )}
      </AnimatePresence>
    </FloatingPanel>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function GamerArena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Load gamer profile
  const { data: profile } = useQuery({
    queryKey: ['gamer-profile-me'],
    queryFn: () => GamerProfile.me(),
    enabled: !!user?.id,
  });

  // Load user's teams
  const { data: myTeams = [] } = useQuery({
    queryKey: ['my-teams', user?.id],
    queryFn: () => Team.list({ member_id: user.id }),
    enabled: !!user?.id,
  });

  const userTeamIds = useMemo(() => myTeams.map((t) => t.id), [myTeams]);

  // Fetch live tournaments
  const { data: liveTournaments = [], isLoading: loadingLive } = useQuery({
    queryKey: ['arena-tournaments', 'live'],
    queryFn: () => Tournament.list({ status: 'live' }),
    enabled: !!user?.id,
  });

  // Fetch published (upcoming) tournaments
  const { data: publishedTournaments = [], isLoading: loadingPublished } = useQuery({
    queryKey: ['arena-tournaments', 'published'],
    queryFn: () => Tournament.list({ status: 'published' }),
    enabled: !!user?.id,
  });

  // Filter to only tournaments the user is participating in
  const myTournaments = useMemo(() => {
    const all = [...liveTournaments, ...publishedTournaments];
    return all.filter((t) => {
      const teams = t.teams || [];
      const participants = t.player_participants || [];
      // Check if any of user's teams are in the tournament
      const teamMatch = teams.some((teamId) => userTeamIds.includes(teamId));
      // Check if user is a direct participant (1v1)
      const directMatch = teams.includes(user?.id) || participants.includes(user?.id);
      return teamMatch || directMatch;
    });
  }, [liveTournaments, publishedTournaments, userTeamIds, user?.id]);

  const liveTourneyCount = myTournaments.filter((t) => t.status === 'live').length;
  const isLoading = loadingLive || loadingPublished;

  const userName = profile?.username || user?.full_name || 'Gamer';
  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');
  const unreadNotifications = profile?.notifications?.filter((n) => !n.read)?.length || 0;

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length} notificationCount={unreadNotifications}>
      {/* Header */}
      <section className="mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-red-950/50 via-zinc-950/80 to-zinc-950 p-6 md:p-8">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                    <Swords className="w-6 h-6 text-red-500" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    AR<span className="text-red-500">ENA</span>
                  </h1>
                </div>
                <p className="text-gray-400">
                  Your active tournaments, matches, and brackets
                </p>
              </div>

              <div className="flex items-center gap-3">
                {liveTourneyCount > 0 && (
                  <div className="flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-lg px-4 py-2">
                    <Zap className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-bold text-sm">
                      {liveTourneyCount} LIVE
                    </span>
                  </div>
                )}
                <div className="bg-zinc-800/80 rounded-lg px-4 py-2">
                  <span className="text-gray-400 text-sm font-medium">
                    {myTournaments.length} Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tournament list */}
      <section>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <FloatingPanel key={i} className="p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-zinc-800" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-zinc-800 rounded w-24" />
                    <div className="h-5 bg-zinc-800 rounded w-48" />
                    <div className="h-3 bg-zinc-800 rounded w-36" />
                  </div>
                </div>
              </FloatingPanel>
            ))}
          </div>
        ) : myTournaments.length === 0 ? (
          <FloatingPanel className="p-12 text-center">
            <Swords className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl text-white font-bold mb-2">No Active Tournaments</h3>
            <p className="text-gray-400 mb-6">
              Join a tournament or create a team to start competing
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/gamer/tournaments">
                <GlowButton>
                  <Trophy className="w-4 h-4" />
                  BROWSE TOURNAMENTS
                </GlowButton>
              </Link>
              <Link to="/gamer/teams/create">
                <GlowButton variant="secondary">
                  <Users className="w-4 h-4" />
                  CREATE TEAM
                </GlowButton>
              </Link>
            </div>
          </FloatingPanel>
        ) : (
          <div className="space-y-4">
            {/* Live tournaments first */}
            {myTournaments
              .sort((a, b) => {
                const order = { live: 0, published: 1, completed: 2 };
                return (order[a.status] ?? 9) - (order[b.status] ?? 9);
              })
              .map((tournament) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArenaTournamentCard
                    tournament={tournament}
                    userTeamIds={userTeamIds}
                    userId={user?.id}
                    userName={userName}
                    profile={profile}
                  />
                </motion.div>
              ))}
          </div>
        )}
      </section>
    </GamerLayout>
  );
}
