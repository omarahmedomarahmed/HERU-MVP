import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BracketMatchPanel from '@/components/tournament/BracketMatchPanel';
import {
  Lock, Trophy, Users, Calendar, Radio, Star, MessageSquare,
  Send, Folder, Download, Upload, CheckCircle, Clock, AlertCircle, Shield, ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Team, Tournament, TournamentOrder } from '@/api/heruClient'
import { uploadFile as uploadFileUtil } from '@/lib/uploadFile'


const FOLDERS = ['Tournament Branding', 'Organizer Branding', 'Co-Organizer Branding', 'Social Media'];

const itemStatusConfig = {
  pending:     { label: 'Pending',     cls: 'bg-yellow-500/20 text-yellow-400', Icon: Clock },
  in_progress: { label: 'In Progress', cls: 'bg-red-500/20 text-red-400',    Icon: Clock },
  fulfilled:   { label: 'Fulfilled',   cls: 'bg-green-500/20 text-green-400',   Icon: CheckCircle },
  cancelled:   { label: 'Cancelled',   cls: 'bg-red-500/20 text-red-400',       Icon: AlertCircle },
};

export default function EmbeddedCoOrganizerView({ id, onBack, user, profile }) {
  const [chatMsg, setChatMsg] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Tournament Branding');
  const queryClient = useQueryClient();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament-co-embedded', id],
    queryFn: () => Tournament.list().then(all => all.find(t => t.id === id) || null),
    enabled: !!id,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['tournament-co-teams-embedded', tournament?.teams],
    queryFn: async () => {
      if (!tournament?.teams?.length) return [];
      const all = await Team.list();
      return all.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament?.teams?.length,
  });

  const { data: tournamentOrder } = useQuery({
    queryKey: ['tournament-order-co-embedded', id],
    queryFn: () => TournamentOrder.list().then(all => all.find(o => o.tournament_id === id) || null),
    enabled: !!id,
  });

  const sendChatMutation = useMutation({
    mutationFn: async (message) => {
      const updated = [
        ...(tournament.organizer_chat || []),
        {
          sender_id: profile?.id || user?.id,
          sender_name: profile?.brand_name || user?.full_name,
          sender_role: 'co_organizer',
          message,
          timestamp: new Date().toISOString(),
        },
      ];
      await Tournament.update(id, { organizer_chat: updated });
    },
    onSuccess: () => { queryClient.invalidateQueries(['tournament-co-embedded', id]); setChatMsg(''); },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" /></div>;
  }

  if (!tournament) {
    return (
      <FloatingPanel className="p-12 text-center max-w-lg mx-auto">
        <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <p className="text-white font-bold">Tournament not found</p>
      </FloatingPanel>
    );
  }

  const myCoEntry = tournament.co_organizers?.find(co => co.organizer_id === profile?.id);
  const hasAccess = myCoEntry?.access_granted;

  if (profile && !myCoEntry) {
    return (
      <FloatingPanel className="p-16 text-center max-w-lg mx-auto">
        <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">You are not a co-organizer of this tournament.</p>
        <GlowButton className="mt-6" onClick={onBack}>Back to Tournaments</GlowButton>
      </FloatingPanel>
    );
  }

  if (profile && !hasAccess) {
    return (
      <FloatingPanel className="p-16 text-center max-w-lg mx-auto" glowBorder>
        <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Complete Your Payment to Unlock Access</h2>
        <p className="text-gray-400 mb-2">
          You've committed <span className="text-yellow-400 font-bold">EGP {myCoEntry?.commitment_amount?.toLocaleString()}</span> ({myCoEntry?.commitment_percent}%) to this tournament.
        </p>
        <p className="text-gray-500 text-sm">Complete your payment in Billing to unlock co-organizer access.</p>
        <GlowButton className="mt-6" onClick={onBack}>Go to Billing</GlowButton>
      </FloatingPanel>
    );
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-black text-white">{tournament.name}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' :
              tournament.status === 'published' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
              'bg-zinc-500/20 text-zinc-400 border-zinc-500/30'
            }`}>
              {tournament.status === 'live' ? '🔴 LIVE' : tournament.status?.toUpperCase()}
            </span>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">CO-ORGANIZER VIEW</span>
          </div>
          <p className="text-gray-400">{tournament.game} • {tournament.format}</p>
          {tournament.schedule && (
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(tournament.schedule), 'EEEE, MMMM d, yyyy')}
            </p>
          )}
          {myCoEntry && (
            <div className="mt-2 text-xs bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Your commitment: EGP {myCoEntry.commitment_amount?.toLocaleString()} ({myCoEntry.commitment_percent}%) — Access Granted
            </div>
          )}
        </div>
        {tournament.stream_link && (
          <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer">
            <GlowButton variant="ghost" size="sm"><Radio className="w-4 h-4" /> Watch Stream</GlowButton>
          </a>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brackets">Live Brackets</TabsTrigger>
          <TabsTrigger value="orders">Order Items</TabsTrigger>
          <TabsTrigger value="chat">Organizer Chat</TabsTrigger>
          <TabsTrigger value="files">File Library</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-2 gap-6">
            <FloatingPanel className="p-6">
              {tournament.tournament_image && (
                <img src={tournament.tournament_image} className="w-full h-48 object-cover rounded-xl mb-5" alt="" />
              )}
              <h3 className="text-white font-bold mb-4">Tournament Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Game', value: tournament.game },
                  { label: 'Format', value: tournament.format || '—' },
                  { label: 'Max Teams', value: tournament.max_teams || 'Unlimited' },
                  { label: 'Prize Pool', value: `EGP ${(tournament.prizepool_total || 0).toLocaleString()}`, accent: 'text-yellow-400 font-bold' },
                  { label: 'Venue', value: tournament.is_offline ? (tournament.venue || 'TBD') : 'Online' },
                ].map(({ label, value, accent }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-400">{label}</span>
                    <span className={`text-white ${accent || ''}`}>{value}</span>
                  </div>
                ))}
                {tournament.stream_link && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stream</span>
                    <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-xs truncate max-w-[60%]">{tournament.stream_link}</a>
                  </div>
                )}
              </div>
              {tournament.description && (
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <p className="text-gray-400 text-sm leading-relaxed">{tournament.description}</p>
                </div>
              )}
            </FloatingPanel>

            <FloatingPanel className="p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-500" /> Confirmed Teams ({teams.length})
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {teams.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">No teams confirmed yet</p>
                ) : (
                  teams.map((team, i) => (
                    <div key={team.id} className="flex items-center gap-3 p-2.5 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors">
                      <span className="text-gray-500 text-xs w-5 text-center font-bold">#{i + 1}</span>
                      <div className="w-8 h-8 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                        {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-4 h-4 text-zinc-500 m-auto mt-2" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{team.name}</p>
                        <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </FloatingPanel>
          </div>
        </TabsContent>

        <TabsContent value="brackets">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live — updating in real time
            </span>
          </div>
          <BracketMatchPanel tournament={tournament} teams={teams} canEdit={false} />
        </TabsContent>

        <TabsContent value="orders">
          <FloatingPanel className="p-6">
            <h3 className="text-white font-bold mb-5 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-red-500" /> Tournament Order Items
            </h3>
            {!tournamentOrder ? (
              <p className="text-gray-500 text-center py-8">No order found for this tournament</p>
            ) : (
              <div className="space-y-3">
                {(tournamentOrder.items || []).map((item, i) => {
                  const cfg = itemStatusConfig[item.status] || itemStatusConfig.pending;
                  const StatusIcon = cfg.Icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs font-bold capitalize bg-zinc-700 px-2 py-0.5 rounded">{item.category}</span>
                        <div>
                          <p className="text-white font-medium text-sm">{item.title}</p>
                          {item.notes && <p className="text-gray-500 text-xs">{item.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-white font-bold text-sm">EGP {item.price?.toLocaleString()}</span>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${cfg.cls}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <span className="text-gray-300 font-bold">Grand Total</span>
                  <span className="text-white font-black text-xl">EGP {tournamentOrder.grand_total?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">My share ({myCoEntry?.commitment_percent}%)</span>
                  <span className="text-yellow-400 font-bold">EGP {myCoEntry?.commitment_amount?.toLocaleString()}</span>
                </div>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="chat">
          <FloatingPanel className="p-6 max-w-2xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-400" /> Organizer Chat
            </h3>
            <div className="space-y-3 max-h-[420px] overflow-y-auto mb-4 pr-1">
              {(tournament.organizer_chat || []).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No messages yet</p>
              ) : (
                tournament.organizer_chat.map((msg, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                      {(msg.sender_name || '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-white text-sm font-bold">{msg.sender_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          msg.sender_role === 'main_organizer' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {msg.sender_role === 'main_organizer' ? 'Main Organizer' : 'Co-Organizer'}
                        </span>
                        <span className="text-gray-600 text-xs">{msg.timestamp ? format(new Date(msg.timestamp), 'MMM d, HH:mm') : ''}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2">
              <Input
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && chatMsg.trim() && sendChatMutation.mutate(chatMsg.trim())}
                placeholder="Send a message..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <GlowButton size="sm" onClick={() => chatMsg.trim() && sendChatMutation.mutate(chatMsg.trim())} disabled={!chatMsg.trim()}>
                <Send className="w-4 h-4" />
              </GlowButton>
            </div>
          </FloatingPanel>
        </TabsContent>

        <TabsContent value="files">
          <FloatingPanel className="p-6">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" /> Shared File Library
            </h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {FOLDERS.map(f => (
                <button key={f} onClick={() => setSelectedFolder(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedFolder === f ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white bg-zinc-800'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <FileLibraryFolder folder={selectedFolder} tournamentId={id} profile={profile} />
          </FloatingPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FileLibraryFolder({ folder, tournamentId, profile }) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);

  const storageKey = `file_lib_${tournamentId}_${folder}`;

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) setFiles(JSON.parse(saved));
  }, [folder, tournamentId]);

  const uploadFile = async (file) => {
    setUploading(true);
    const { file_url } = await uploadFileUtil(file);
    const newFile = {
      name: file.name,
      url: file_url,
      uploaded_by: profile?.brand_name || 'Organizer',
      uploaded_at: new Date().toISOString(),
      folder,
    };
    const updated = [...files, newFile];
    setFiles(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setUploading(false);
  };

  return (
    <div>
      {files.length === 0 ? (
        <div className="text-center py-10 bg-zinc-800/30 rounded-xl">
          <Folder className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm mb-4">{folder} — No files uploaded yet</p>
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
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                </button>
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
    </div>
  );
}