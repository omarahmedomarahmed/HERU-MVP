import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import {
  Trophy, Users, Calendar, Star, MessageSquare, Send, Folder, Download, Upload,
  Clock, CheckCircle, AlertCircle, Lock, Radio, ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { GamerProfile, GigRequest, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'


const STATUS_COLORS = {
  pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted:  'bg-green-500/20 text-green-400 border-green-500/30',
  rejected:  'bg-red-500/20 text-red-400 border-red-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const FILE_FOLDERS = ['Tournament Branding', 'Organizer Branding', 'Co-Organizer Branding', 'Social Media'];

export default function GigDetailPage() {
  const { gig_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [chatMsg, setChatMsg] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Tournament Branding');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiCall('/auth/me')
      .then(u => {
        setUser(u);
        GamerProfile.list({ user_id: u.id }).then(p => setProfile(p[0] || null));
      })
      .catch(() => navigate('/auth/gamer/login'));
  }, []);

  const { data: gig, isLoading: gigLoading } = useQuery({
    queryKey: ['gig-detail', gig_id],
    queryFn: () => GigRequest.list().then(all => all.find(g => g.id === gig_id) || null),
    enabled: !!gig_id,
    refetchInterval: 10000,
  });

  const { data: tournament } = useQuery({
    queryKey: ['gig-tournament', gig?.tournament_id],
    queryFn: () => Tournament.list().then(all => all.find(t => t.id === gig.tournament_id) || null),
    enabled: !!gig?.tournament_id,
    refetchInterval: 10000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['gig-teams', tournament?.teams],
    queryFn: async () => {
      if (!tournament?.teams?.length) return [];
      const all = await Team.list();
      return all.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament?.teams?.length,
  });

  const sendMsgMutation = useMutation({
    mutationFn: async (message) => {
      const msg = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        sender_role: 'talent',
        message,
        timestamp: new Date().toISOString(),
      };
      await GigRequest.update(gig_id, { chat: [...(gig.chat || []), msg] });
    },
    onSuccess: () => { queryClient.invalidateQueries(['gig-detail', gig_id]); setChatMsg(''); },
  });

  const storageKey = `gig_files_${gig_id}_${selectedFolder}`;

  const [files, setFiles] = useState([]);
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    setFiles(saved ? JSON.parse(saved) : []);
  }, [selectedFolder, gig_id]);

  const uploadFile = async (file) => {
    setUploading(true);
    const { file_url } = await uploadFile(file);
    const newFile = {
      name: file.name,
      url: file_url,
      uploaded_by: profile?.username || user?.full_name || 'Talent',
      uploaded_at: new Date().toISOString(),
      folder: selectedFolder,
    };
    const updated = [...files, newFile];
    setFiles(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setUploading(false);
  };

  if (gigLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <AnimatedBackground />
        <div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <AnimatedBackground />
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-white font-bold">Gig not found</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-gray-400 hover:text-white text-sm flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </FloatingPanel>
      </div>
    );
  }

  if (user && gig.talent_user_id !== user.id) {
    return (
      <GamerLayout user={user} profile={profile}>
        <FloatingPanel className="p-16 text-center max-w-lg mx-auto mt-16">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">This gig request is not assigned to your account.</p>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  const brackets = tournament?.brackets || [];

  return (
    <GamerLayout user={user} profile={profile}>
      <div className="max-w-5xl mx-auto">
        {/* ── Banner ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-52">
          {tournament?.tournament_image ? (
            <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
              <Trophy className="w-16 h-16 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-black text-white">{gig.tournament_name}</h1>
                <p className="text-gray-300 text-sm">{gig.organizer_brand}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_COLORS[gig.status] || STATUS_COLORS.pending}`}>
                  {gig.status?.toUpperCase()}
                </span>
                <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" /> {gig.talent_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Meta Row ── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <FloatingPanel className="p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Gig Fee</p>
            <p className="text-green-400 font-black text-xl">EGP {gig.price?.toLocaleString()}</p>
          </FloatingPanel>
          <FloatingPanel className="p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Role</p>
            <p className="text-white font-bold capitalize">{gig.talent_type}</p>
          </FloatingPanel>
          <FloatingPanel className="p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">Tournament Date</p>
            <p className="text-white font-bold text-sm">
              {tournament?.schedule ? format(new Date(tournament.schedule), 'MMM d, yyyy') : 'TBD'}
            </p>
          </FloatingPanel>
        </div>

        <Tabs defaultValue="brackets" className="w-full">
          <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="brackets">Live Brackets</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="files">File Library</TabsTrigger>
          </TabsList>

          {/* LIVE BRACKETS */}
          <TabsContent value="brackets">
            <div className="mb-4 flex items-center gap-2">
              {tournament?.status === 'live' && (
                <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Live — updating in real time
                </span>
              )}
            </div>
            {brackets.length === 0 ? (
              <FloatingPanel className="p-12 text-center">
                <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400">Brackets haven't been generated yet. Check back soon!</p>
              </FloatingPanel>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                  {brackets.map((round, ri) => (
                    <div key={ri} className="w-64 space-y-4">
                      <h4 className="text-center text-white font-black text-sm">
                        {round.round === brackets.length ? '🏆 FINALS' :
                         round.round === brackets.length - 1 ? 'SEMI-FINALS' :
                         round.round === 1 ? 'ROUND 1' : `ROUND ${round.round}`}
                      </h4>
                      <div className="space-y-4">
                        {round.matches.map((match, mi) => {
                          const t1 = teams.find(t => t.id === match.team1);
                          const t2 = teams.find(t => t.id === match.team2);
                          const hasWinner = !!match.winner;
                          return (
                            <FloatingPanel key={mi} className={`p-3 ${hasWinner ? 'border-green-500/20' : 'border-zinc-700/50'}`}>
                              <div className="space-y-2">
                                {[{ team: t1, id: match.team1, score: match.score1, winner: match.winner },
                                  { team: t2, id: match.team2, score: match.score2, winner: match.winner }].map((slot, si) => (
                                  <div key={si} className={`flex items-center gap-2 p-2 rounded-lg ${slot.winner === slot.id ? 'bg-green-500/15 border border-green-500/30' : 'bg-zinc-800/60'}`}>
                                    <div className="w-7 h-7 rounded bg-zinc-700 overflow-hidden flex-shrink-0">
                                      {slot.team?.logo ? <img src={slot.team.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 text-[10px] flex items-center justify-center h-full">?</span>}
                                    </div>
                                    <span className={`flex-1 text-sm font-medium truncate ${slot.team ? 'text-white' : 'text-gray-500 italic'}`}>
                                      {slot.team?.name || 'TBD'}
                                    </span>
                                    {slot.winner === slot.id && <Trophy className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                                    {slot.score != null && <span className="text-gray-400 text-sm font-bold">{slot.score}</span>}
                                  </div>
                                ))}
                              </div>
                            </FloatingPanel>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TEAMS */}
          <TabsContent value="teams">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {teams.length === 0 ? (
                <FloatingPanel className="col-span-full p-12 text-center">
                  <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-gray-400">No teams confirmed yet</p>
                </FloatingPanel>
              ) : (
                teams.map((team, i) => (
                  <Link key={team.id} to={`/gamer/teams/${team.id}`}>
                    <FloatingPanel className="p-4 hover:border-red-500/30 transition-all">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600 text-xs font-bold w-5">#{i+1}</span>
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                          {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-zinc-500 m-auto mt-2" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm truncate">{team.name}</p>
                          <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                        </div>
                      </div>
                    </FloatingPanel>
                  </Link>
                ))
              )}
            </div>
          </TabsContent>

          {/* CHAT */}
          <TabsContent value="chat">
            <FloatingPanel className="p-6 max-w-2xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green-400" /> Gig Chat
              </h3>
              <div className="space-y-3 max-h-[420px] overflow-y-auto mb-4 pr-1">
                {(gig.chat || []).length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No messages yet. Say hello to your organizer!</p>
                ) : (
                  gig.chat.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                          {(msg.sender_name || '?')[0]}
                        </div>
                        <div className={`flex-1 min-w-0 ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            {!isMe && <span className="text-white text-xs font-bold">{msg.sender_name}</span>}
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              msg.sender_role === 'talent' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {msg.sender_role === 'talent' ? 'Talent' : 'Organizer'}
                            </span>
                            <span className="text-gray-600 text-xs">{msg.timestamp ? format(new Date(msg.timestamp), 'MMM d, HH:mm') : ''}</span>
                          </div>
                          <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-200'}`}>
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatMsg}
                  onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && chatMsg.trim() && sendMsgMutation.mutate(chatMsg.trim())}
                  placeholder="Type your message..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <GlowButton size="sm" onClick={() => chatMsg.trim() && sendMsgMutation.mutate(chatMsg.trim())} disabled={!chatMsg.trim() || sendMsgMutation.isPending}>
                  <Send className="w-4 h-4" />
                </GlowButton>
              </div>
            </FloatingPanel>
          </TabsContent>

          {/* FILE LIBRARY */}
          <TabsContent value="files">
            <FloatingPanel className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Folder className="w-4 h-4 text-amber-400" /> Shared File Library
              </h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {FILE_FOLDERS.map(f => (
                  <button key={f} onClick={() => setSelectedFolder(f)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedFolder === f ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white bg-zinc-800'
                    }`}>
                    {f}
                  </button>
                ))}
              </div>

              {files.length === 0 ? (
                <div className="text-center py-10 bg-zinc-800/30 rounded-xl mb-4">
                  <Folder className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">{selectedFolder} — No files uploaded yet</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {files.map((f, i) => (
                    <div key={i} className="bg-zinc-800/50 rounded-xl p-4 flex items-start gap-3">
                      <Folder className="w-8 h-8 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{f.name}</p>
                        <p className="text-gray-500 text-xs">{f.uploaded_by}</p>
                        <p className="text-gray-600 text-xs">{f.uploaded_at ? format(new Date(f.uploaded_at), 'MMM d, yyyy') : ''}</p>
                      </div>
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}

              <label className="cursor-pointer">
                <GlowButton variant="ghost" size="sm" disabled={uploading}>
                  <Upload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload File'}
                </GlowButton>
                <input type="file" className="hidden" onChange={e => e.target.files[0] && uploadFile(e.target.files[0])} />
              </label>
            </FloatingPanel>
          </TabsContent>
        </Tabs>
      </div>
    </GamerLayout>
  );
}