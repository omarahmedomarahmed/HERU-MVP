import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TeamManagementPanel from '@/components/tournament/TeamManagementPanel';
import SeedingPanel from '@/components/tournament/SeedingPanel';
import BracketMatchPanel from '@/components/tournament/BracketMatchPanel';
import TournamentTypeBadge from '@/components/tournament/TournamentTypeBadge';
import {
  Trophy, ChevronRight, AlertTriangle, Sliders,
  Radio, Clock, Check, Upload, Image as ImageIcon, ExternalLink, Send,
  MessageSquare, ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Team, Tournament } from '@/api/heruClient'
import { uploadFile } from '@/lib/uploadFile'


function StatusBadge({ status }) {
  const map = {
    draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    published: 'bg-red-500/20 text-red-400 border-red-500/30',
    live: 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse',
    completed: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${map[status] || map.draft}`}>
      {status === 'live' ? '🔴 LIVE' : status?.toUpperCase()}
    </span>
  );
}

export default function EmbeddedTournamentManage({ id, onBack, user, profile }) {
  const [bracketStep, setBracketStep] = useState('teams');
  const [streamLink, setStreamLink] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const queryClient = useQueryClient();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['tournament-manage-embedded', id],
    queryFn: () => Tournament.list().then(all => all.find(t => t.id === id) || null),
    enabled: !!id,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['tournament-manage-teams-embedded', tournament?.teams],
    queryFn: async () => {
      if (!tournament?.teams?.length) return [];
      const all = await Team.list();
      return all.filter(t => tournament.teams.includes(t.id));
    },
    enabled: !!tournament?.teams?.length,
  });

  useEffect(() => {
    if (tournament && !settings) {
      setSettings({
        name: tournament.name || '',
        description: tournament.description || '',
        schedule: tournament.schedule ? tournament.schedule.slice(0, 16) : '',
        format: tournament.format || '',
        max_teams: tournament.max_teams || '',
        prizepool_total: tournament.prizepool_total || '',
        venue: tournament.venue || '',
        stream_link: tournament.stream_link || '',
      });
      setStreamLink(tournament.stream_link || '');
    }
  }, [tournament]);

  const updateMutation = useMutation({
    mutationFn: (updates) => Tournament.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries(['tournament-manage-embedded', id]),
  });

  const sendChatMutation = useMutation({
    mutationFn: async (message) => {
      const updated = [
        ...(tournament.organizer_chat || []),
        {
          sender_id: profile?.id || user?.id,
          sender_name: profile?.brand_name || user?.full_name,
          sender_role: 'main_organizer',
          message,
          timestamp: new Date().toISOString(),
        },
      ];
      await Tournament.update(id, { organizer_chat: updated });
    },
    onSuccess: () => { queryClient.invalidateQueries(['tournament-manage-embedded', id]); setChatMsg(''); },
  });

  const uploadImage = async (file) => {
    setUploadingImage(true);
    const { file_url } = await uploadFile(file);
    await updateMutation.mutateAsync({ tournament_image: file_url });
    setUploadingImage(false);
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    await Tournament.update(id, {
      name: settings.name,
      description: settings.description,
      schedule: settings.schedule,
      format: settings.format,
      max_teams: Number(settings.max_teams) || null,
      prizepool_total: Number(settings.prizepool_total) || 0,
      venue: settings.venue,
      stream_link: settings.stream_link,
    });
    queryClient.invalidateQueries(['tournament-manage-embedded', id]);
    setSavingSettings(false);
  };

  const cancelTournament = async () => {
    if (!window.confirm('Are you sure you want to cancel this tournament? This cannot be undone.')) return;
    await Tournament.update(id, { status: 'cancelled' });
    queryClient.invalidateQueries(['tournament-manage-embedded', id]);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" /></div>;
  }

  if (!tournament) {
    return (
      <FloatingPanel className="p-12 text-center">
        <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <p className="text-white font-bold">Tournament not found</p>
        <button onClick={onBack} className="mt-4 text-gray-400 hover:text-white text-sm">← Go back</button>
      </FloatingPanel>
    );
  }

  const isShared = tournament.tournament_type === 'shared';

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-3xl font-black text-white">{tournament.name}</h1>
            <StatusBadge status={tournament.status} />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <TournamentTypeBadge tournament={tournament} />
            <span className="text-gray-400 text-sm">{tournament.game}</span>
            {tournament.schedule && (
              <span className="text-gray-500 text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(tournament.schedule), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
        <GlowButton variant="ghost" size="sm" onClick={() => window.open(tournament.stream_link || '#', '_blank')} disabled={!tournament.stream_link}>
          <Radio className="w-4 h-4" /> Stream
        </GlowButton>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams & Brackets</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FloatingPanel className="p-6">
                {tournament.tournament_image ? (
                  <div className="relative group mb-6">
                    <img src={tournament.tournament_image} className="w-full h-52 object-cover rounded-xl" alt="" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                      <span className="text-white flex items-center gap-2"><Upload className="w-5 h-5" /> Change Image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:border-red-500/50 transition-colors mb-6">
                    {uploadingImage ? (
                      <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-12 h-12 text-gray-600 mb-2" />
                        <span className="text-gray-400 text-sm">Upload Tournament Banner</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
                  </label>
                )}

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Format', value: tournament.format || '—' },
                    { label: 'Max Teams', value: tournament.max_teams || 'Unlimited' },
                    { label: 'Confirmed Teams', value: `${tournament.teams?.length || 0}` },
                    { label: 'Prize Pool', value: `EGP ${(tournament.prizepool_total || 0).toLocaleString()}`, accent: 'text-yellow-400' },
                    { label: 'Venue', value: tournament.is_offline ? (tournament.venue || 'TBD') : 'Online' },
                    { label: 'Join Requests', value: `${tournament.join_requests?.filter(r => r.status === 'pending').length || 0} pending` },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="bg-zinc-800/50 rounded-xl p-3 flex justify-between items-center">
                      <span className="text-gray-400">{label}</span>
                      <span className={`font-bold text-white ${accent || ''}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <label className="text-sm text-gray-400 mb-2 block">Stream Link</label>
                  <div className="flex gap-2">
                    <Input
                      value={streamLink}
                      onChange={e => setStreamLink(e.target.value)}
                      placeholder="https://twitch.tv/..."
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <GlowButton size="sm" onClick={() => updateMutation.mutate({ stream_link: streamLink })}>
                      <Check className="w-4 h-4" />
                    </GlowButton>
                    {streamLink && (
                      <a href={streamLink} target="_blank" rel="noopener noreferrer">
                        <GlowButton size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></GlowButton>
                      </a>
                    )}
                  </div>
                </div>
              </FloatingPanel>

              <FloatingPanel className="p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> Tournament Log
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tournament.tournament_log?.length ? (
                    [...tournament.tournament_log].reverse().map((log, i) => (
                      <div key={i} className="flex gap-3 pb-3 border-b border-zinc-800 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm">{log.description}</p>
                          <p className="text-gray-600 text-xs mt-0.5">{log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm') : ''}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-6">No activity logged yet</p>
                  )}
                </div>
              </FloatingPanel>
            </div>

            <div>
              <FloatingPanel className="p-5 h-full">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  {isShared ? 'Organizer Chat' : 'Notes / Chat'}
                </h3>
                <div className="space-y-3 max-h-[340px] overflow-y-auto mb-4 pr-1">
                  {(tournament.organizer_chat || []).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-6">No messages yet</p>
                  ) : (
                    (tournament.organizer_chat).map((msg, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">
                          {(msg.sender_name || '?')[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-white text-xs font-bold">{msg.sender_name}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              msg.sender_role === 'main_organizer' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {msg.sender_role === 'main_organizer' ? 'Main' : 'Co-Org'}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{msg.message}</p>
                          <p className="text-gray-600 text-[10px] mt-0.5">
                            {msg.timestamp ? format(new Date(msg.timestamp), 'MMM d, HH:mm') : ''}
                          </p>
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
                    placeholder="Send message..."
                    className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  />
                  <GlowButton size="sm" onClick={() => chatMsg.trim() && sendChatMutation.mutate(chatMsg.trim())} disabled={!chatMsg.trim()}>
                    <Send className="w-4 h-4" />
                  </GlowButton>
                </div>
              </FloatingPanel>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams">
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {[
              { key: 'teams', label: '1. Team Management' },
              { key: 'seeding', label: '2. Seeding' },
              { key: 'brackets', label: '3. Brackets & Scores' },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => setBracketStep(step.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    bracketStep === step.key ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {step.label}
                </button>
                {idx < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          {bracketStep === 'teams' && <TeamManagementPanel tournament={tournament} canEdit={true} />}
          {bracketStep === 'seeding' && <SeedingPanel tournament={tournament} confirmedTeams={teams} onBracketsGenerated={() => setBracketStep('brackets')} />}
          {bracketStep === 'brackets' && <BracketMatchPanel tournament={tournament} teams={teams} canEdit={true} />}
        </TabsContent>

        <TabsContent value="settings">
          {settings && (
            <div className="space-y-6 max-w-3xl">
              <FloatingPanel className="p-6">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-red-500" /> Tournament Settings
                </h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Tournament Name</label>
                    <Input value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm text-gray-400 mb-1 block">Description</label>
                    <Textarea value={settings.description} onChange={e => setSettings({ ...settings, description: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" rows={3} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Schedule</label>
                    <Input type="datetime-local" value={settings.schedule} onChange={e => setSettings({ ...settings, schedule: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Format</label>
                    <Select value={settings.format} onValueChange={v => setSettings({ ...settings, format: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss'].map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Max Teams</label>
                    <Input type="number" value={settings.max_teams} onChange={e => setSettings({ ...settings, max_teams: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" min={2} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Prize Pool (EGP)</label>
                    <Input type="number" value={settings.prizepool_total} onChange={e => setSettings({ ...settings, prizepool_total: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" min={0} />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Venue</label>
                    <Input value={settings.venue} onChange={e => setSettings({ ...settings, venue: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="Online or physical venue" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Stream Link</label>
                    <Input value={settings.stream_link} onChange={e => setSettings({ ...settings, stream_link: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" placeholder="https://twitch.tv/..." />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <GlowButton onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings ? 'Saving...' : 'Save Settings'}
                  </GlowButton>
                </div>
              </FloatingPanel>

              <FloatingPanel className="p-6 border-red-500/20">
                <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <div className="flex items-center justify-between flex-wrap gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <div>
                    <p className="text-white font-medium">Cancel Tournament</p>
                    <p className="text-gray-400 text-sm">This will permanently cancel the tournament. Participants will be notified.</p>
                  </div>
                  <GlowButton
                    variant="secondary"
                    onClick={cancelTournament}
                    disabled={tournament.status === 'cancelled'}
                  >
                    {tournament.status === 'cancelled' ? 'Already Cancelled' : 'Cancel Tournament'}
                  </GlowButton>
                </div>
              </FloatingPanel>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}