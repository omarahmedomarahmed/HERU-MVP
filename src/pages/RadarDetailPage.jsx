import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import FundingBar from '@/components/radar/FundingBar';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Trophy, Calendar, Users, Gamepad2, MapPin, Radio,
  Shield, CheckCircle, Star, Lock, TrendingUp, MessageSquare,
  Send, AlertCircle, Check, Download, Upload, Folder, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { GamerProfile, OrganizerProfile, SponsorshipRadar, Team, Tournament } from '@/api/heruClient'
import { uploadFile } from '@/lib/uploadFile'


function StatusBadge({ status }) {
  const map = {
    open:         { label: 'Open',         cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    in_progress:  { label: 'In Progress',  cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
    fully_funded: { label: 'Fully Funded', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    closed:       { label: 'Closed',       cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const s = map[status] || map.open;
  return <span className={`text-sm font-bold px-3 py-1 rounded-full border ${s.cls}`}>{s.label}</span>;
}

export default function RadarDetailPage() {
  const { radar_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userProfile, isAuthenticated, isOrganizer } = useAuth();
  const [commitPercent, setCommitPercent] = useState(null); // null = no selection, 33/66/custom number
  const [customPercent, setCustomPercent] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Organizer Branding');
  const [commitSuccess, setCommitSuccess] = useState(null); // stores { bill_number, amount, label } after success

  const myUserId = user?.id;
  const orgProfile = userProfile?.organizer_profile;

  const { data: radar, isLoading } = useQuery({
    queryKey: ['radar-detail', radar_id],
    queryFn: () => SponsorshipRadar.get(radar_id),
    enabled: !!radar_id,
  });

  const { data: tournament } = useQuery({
    queryKey: ['radar-tournament', radar?.tournament_id],
    queryFn: () => Tournament.get(radar.tournament_id),
    enabled: !!radar?.tournament_id,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['radar-teams', radar?.tournament_id],
    queryFn: async () => {
      if (!tournament?.invited_teams?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => tournament.invited_teams.includes(t.id));
    },
    enabled: !!tournament,
  });

  const { data: talentProfiles = [] } = useQuery({
    queryKey: ['radar-talent-profiles', radar?.tournament_id],
    queryFn: async () => {
      const talentIds = tournament?.talents?.map(t => t.user_id).filter(Boolean) || [];
      if (!talentIds.length) return [];
      const all = await GamerProfile.list();
      return all.filter(p => talentIds.includes(p.user_id));
    },
    enabled: !!tournament?.talents?.length,
  });

  const { data: mainOrgProfile } = useQuery({
    queryKey: ['main-org-profile', radar?.main_organizer_id],
    queryFn: () => OrganizerProfile.get(radar.main_organizer_id).catch(() => null),
    enabled: !!radar?.main_organizer_id,
  });

  const commitMutation = useMutation({
    mutationFn: async (percent) => {
      return SponsorshipRadar.commit(radar.id, { percent });
    },
    onSuccess: (data) => {
      setCommitSuccess(data);
      queryClient.invalidateQueries(['radar-detail', radar_id]);
      setCommitPercent(null);
      setCustomPercent('');
    },
    onError: (err) => {
      alert(err.message || 'Failed to commit');
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      return Tournament.sendChat(tournament.id, {
        message,
        sender_id: myUserId,
        sender_name: orgProfile?.brand_name || user?.email || 'Organizer',
        sender_role: myUserId === radar?.main_organizer_id ? 'main_organizer' : 'co_organizer',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['radar-tournament', radar?.tournament_id]);
      setChatMsg('');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <AnimatedBackground />
        <div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!radar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <AnimatedBackground />
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold">Radar listing not found</h3>
          <button onClick={() => navigate(-1)} className="mt-4 text-gray-400 hover:text-white flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </FloatingPanel>
      </div>
    );
  }

  const isMainOrg = myUserId === radar.main_organizer_id;
  const myCoEntry = radar.co_organizers?.find(co => co.organizer_id === myUserId);
  const hasAccess = myCoEntry?.access_granted;
  const canChat = isMainOrg || hasAccess;
  const canCommit = isAuthenticated && isOrganizer && !isMainOrg && !myCoEntry && radar.status !== 'fully_funded' && radar.status !== 'closed';

  // Calculate available percent remaining
  const totalCost = radar.total_cost || 0;
  const mainPercent = radar.main_organizer_percent || 33;
  const usedPercent = mainPercent + (radar.co_organizers || []).reduce((s, co) => s + (co.percent || co.committed_percent || 0), 0);
  const availablePercent = Math.max(0, 100 - usedPercent);

  // Determine the actual percent to commit
  const activePercent = commitPercent === 'custom' ? (parseInt(customPercent) || 0) : (commitPercent || 0);

  const FOLDERS = ['Organizer Branding', 'Co-Organizer Branding', 'Tournament Branding', 'Social Media'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Radar
        </button>

        {/* ── BANNER ── */}
        <div className="relative rounded-2xl overflow-hidden mb-8 h-64 bg-zinc-900">
          {tournament?.tournament_image ? (
            <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-20 h-20 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded border bg-red-500/20 text-red-400 border-red-500/30">SHARED TOURNAMENT</span>
                  <StatusBadge status={radar.status} />
                </div>
                <h1 className="text-3xl font-black text-white mb-1">{radar.tournament_name}</h1>
                <div className="flex items-center gap-4 text-gray-300 text-sm flex-wrap">
                  <span className="flex items-center gap-1"><Gamepad2 className="w-4 h-4 text-red-400" />{radar.game}</span>
                  {radar.schedule && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(radar.schedule), 'MMM d, yyyy')}</span>}
                  {tournament?.format && <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />{tournament.format}</span>}
                </div>
              </div>
              {/* Main Organizer */}
              <Link to={`/organizer/${radar.main_organizer_id}`} className="flex items-center gap-3 bg-black/50 rounded-xl px-4 py-2 hover:bg-black/70 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                  {radar.main_organizer_brand?.logo
                    ? <img src={radar.main_organizer_brand.logo} alt="" className="w-full h-full object-cover" />
                    : <Shield className="w-5 h-5 text-zinc-400 m-auto mt-2" />}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Main Organizer</p>
                  <p className="text-white font-bold text-sm">{radar.main_organizer_brand?.name || mainOrgProfile?.brand_name || 'Unknown'}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* ── FUNDING PROGRESS ── */}
        <FloatingPanel className="p-6 mb-6" glowBorder>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-lg font-bold text-white">Funding Progress</h2>
            <span className="text-2xl font-black text-white">{radar.funding_percent || 0}% Funded</span>
          </div>
          <FundingBar percent={radar.funding_percent || 0} totalCost={radar.total_cost || 0} large />
          <div className="flex items-center justify-between mt-3 text-sm flex-wrap gap-2">
            <span className="text-gray-400">
              EGP {Math.round(totalCost * (radar.funding_percent || 0) / 100).toLocaleString()} committed of EGP {totalCost.toLocaleString()} total
            </span>
            <span className="text-red-400 font-bold">
              EGP {(radar.amount_still_needed || 0).toLocaleString()} still needed
            </span>
          </div>
        </FloatingPanel>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tournament Details */}
            <FloatingPanel className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-red-500" /> Tournament Details
              </h2>
              {radar.description && (
                <p className="text-gray-300 leading-relaxed mb-4">{radar.description}</p>
              )}
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {radar.prizepool_amount > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Prize Pool</p>
                    <p className="text-yellow-400 font-black text-xl">EGP {radar.prizepool_amount?.toLocaleString()}</p>
                  </div>
                )}
                {tournament?.max_teams && (
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Max Teams</p>
                    <p className="text-white font-bold text-xl">{tournament.max_teams}</p>
                  </div>
                )}
                {tournament?.format && (
                  <div className="bg-zinc-800/50 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Format</p>
                    <p className="text-white font-bold">{tournament.format}</p>
                  </div>
                )}
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Type</p>
                  <p className="text-white font-bold">{tournament?.is_offline ? '🏟️ Offline' : '🖥️ Online'}</p>
                </div>
                {tournament?.venue && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 sm:col-span-2">
                    <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Venue</p>
                    <p className="text-white font-bold">{tournament.venue}</p>
                  </div>
                )}
                {tournament?.stream_link && (
                  <div className="bg-zinc-800/50 rounded-xl p-4 sm:col-span-2">
                    <p className="text-gray-400 text-xs mb-1 flex items-center gap-1"><Radio className="w-3 h-3" /> Stream</p>
                    <a href={tournament.stream_link} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-sm">{tournament.stream_link}</a>
                  </div>
                )}
              </div>

              {/* Invited Teams */}
              {teams.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Invited Teams ({teams.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    {teams.map(team => (
                      <Link key={team.id} to={`/team/${team.id}`} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg px-3 py-2 transition-colors">
                        {team.logo && <img src={team.logo} alt="" className="w-5 h-5 rounded object-cover" />}
                        <span className="text-white text-sm font-medium">{team.name}</span>
                      </Link>
                    ))}
                  </div>
                  {tournament?.max_teams && (
                    <p className="text-gray-500 text-xs mt-2">Expected Reach: ~{teams.length * 5} players ({teams.length} teams × avg 5)</p>
                  )}
                </div>
              )}
            </FloatingPanel>

            {/* Talents */}
            {tournament?.talents?.length > 0 && (
              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Talent Roster
                </h2>
                <div className="space-y-3">
                  {tournament.talents.map((talent, i) => {
                    const tp = talentProfiles.find(p => p.user_id === talent.user_id);
                    return (
                      <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0">
                            {tp?.avatar ? <img src={tp.avatar} alt="" className="w-full h-full object-cover" /> : <Star className="w-5 h-5 text-zinc-400 m-auto mt-2" />}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{tp?.username || 'Talent'}</p>
                            <p className="text-gray-400 text-xs capitalize">{talent.talent_type}</p>
                          </div>
                        </div>
                        <span className="text-yellow-400 font-bold text-sm">EGP {talent.price?.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </FloatingPanel>
            )}

            {/* Branding & Production Items */}
            {radar.order_breakdown?.length > 0 && (
              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-400" /> Branding & Production Items
                </h2>
                <div className="space-y-2">
                  {radar.order_breakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/40 rounded-xl px-4 py-3">
                      <div>
                        <span className="text-white font-medium text-sm">{item.title}</span>
                        <span className="ml-2 text-xs text-gray-500 capitalize bg-zinc-700 px-2 py-0.5 rounded">{item.category}</span>
                      </div>
                      <span className="text-gray-300 text-sm font-bold">EGP {item.price?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-700 mt-2">
                    <span className="text-gray-300 font-bold">Total</span>
                    <span className="text-white font-black text-lg">EGP {radar.total_cost?.toLocaleString()}</span>
                  </div>
                </div>
              </FloatingPanel>
            )}

            {/* Branding File Library — co-organizers with access */}
            {hasAccess && (
              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-amber-400" /> Shared Branding Library
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {FOLDERS.map(f => (
                    <button key={f} onClick={() => setSelectedFolder(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedFolder === f ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white bg-zinc-800'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="bg-zinc-800/40 rounded-xl p-6 text-center text-gray-500">
                  <Folder className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
                  <p className="text-sm">{selectedFolder} — No files uploaded yet</p>
                  <label className="mt-3 inline-flex items-center gap-2 cursor-pointer">
                    <GlowButton size="sm" variant="ghost">
                      <Upload className="w-4 h-4" /> Upload File
                    </GlowButton>
                    <input type="file" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const { file_url } = await uploadFile(file);
                      alert(`File uploaded: ${file_url}`);
                    }} />
                  </label>
                </div>
              </FloatingPanel>
            )}

            {/* Organizer Chat */}
            {canChat && tournament && (
              <FloatingPanel className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" /> Organizer Chat
                </h2>
                <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
                  {(tournament.organizer_chat || []).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No messages yet. Start the conversation!</p>
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
                              msg.sender_role === 'main_organizer' ? 'bg-red-500/20 text-red-400' :
                              msg.sender_role === 'staff' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {msg.sender_role === 'main_organizer' ? 'Main Organizer' : msg.sender_role === 'staff' ? 'HERU Staff' : 'Co-Organizer'}
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
                    onKeyDown={e => { if (e.key === 'Enter' && chatMsg.trim()) chatMutation.mutate(chatMsg.trim()); }}
                    placeholder="Message the organizer team..."
                    className="bg-zinc-800 border-zinc-700 text-white flex-1"
                  />
                  <GlowButton size="sm" onClick={() => chatMsg.trim() && chatMutation.mutate(chatMsg.trim())} disabled={!chatMsg.trim()}>
                    <Send className="w-4 h-4" />
                  </GlowButton>
                </div>
              </FloatingPanel>
            )}
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* Co-Organizers */}
            <FloatingPanel className="p-5">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" /> Co-Organizers
              </h2>
              {!radar.co_organizers?.length ? (
                <p className="text-gray-500 text-sm text-center py-4">No co-organizers yet. Be the first!</p>
              ) : (
                <div className="space-y-3">
                  {radar.co_organizers.map((co, i) => (
                    <Link key={i} to={`/organizer/${co.organizer_id}`} className="flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 rounded-xl p-3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                          {co.brand_logo
                            ? <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                            : <span className="text-xs font-bold text-white flex items-center justify-center h-full">{(co.brand_name || '?')[0]}</span>}
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">{co.brand_name}</p>
                          <p className="text-gray-400 text-xs">{co.percent || co.committed_percent}% — EGP {(co.amount || co.committed_amount)?.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${co.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {co.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {(radar.amount_still_needed || 0) > 0 && (
                <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                  <p className="text-red-400 text-xs font-bold">EGP {radar.amount_still_needed?.toLocaleString()} still needed</p>
                </div>
              )}
            </FloatingPanel>

            {/* Main organizer cannot co-organize their own tournament */}
            {isMainOrg && (
              <FloatingPanel className="p-5">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">You are the main organizer</p>
                    <p className="text-gray-400 text-xs mt-0.5">You cannot co-organize your own tournament.</p>
                  </div>
                </div>
              </FloatingPanel>
            )}

            {/* Commit Section */}
            {canCommit && !commitSuccess && (
              <FloatingPanel className="p-5" glowBorder>
                <h2 className="text-lg font-bold text-white mb-1">Commit as {availablePercent >= 66 ? 'Co-Organizer or Sponsor' : 'Co-Organizer'}</h2>
                <p className="text-gray-400 text-xs mb-4">Your brand will be featured on this tournament page. 33% = Co-Organizer, 66% = Sponsor.</p>
                <div className="space-y-4">
                  {/* Preset percentage buttons */}
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Choose your commitment</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {availablePercent >= 33 && (
                        <button
                          onClick={() => { setCommitPercent(33); setCustomPercent(''); }}
                          className={`rounded-xl p-3 text-center border transition-all ${commitPercent === 33 ? 'border-red-500 bg-red-500/20 text-white' : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-500'}`}
                        >
                          <p className="text-lg font-black">33%</p>
                          <p className="text-xs">Co-Organizer</p>
                          <p className="text-xs text-yellow-400 font-bold mt-1">EGP {Math.round(totalCost * 0.33).toLocaleString()}</p>
                        </button>
                      )}
                      {availablePercent >= 66 && (
                        <button
                          onClick={() => { setCommitPercent(66); setCustomPercent(''); }}
                          className={`rounded-xl p-3 text-center border transition-all ${commitPercent === 66 ? 'border-red-500 bg-red-500/20 text-white' : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-500'}`}
                        >
                          <p className="text-lg font-black">66%</p>
                          <p className="text-xs">Sponsor</p>
                          <p className="text-xs text-yellow-400 font-bold mt-1">EGP {Math.round(totalCost * 0.66).toLocaleString()}</p>
                        </button>
                      )}
                    </div>
                    {/* Custom percentage */}
                    <button
                      onClick={() => setCommitPercent('custom')}
                      className={`w-full rounded-xl p-3 text-center border transition-all ${commitPercent === 'custom' ? 'border-red-500 bg-red-500/20 text-white' : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-500'}`}
                    >
                      <p className="text-sm font-bold">Custom Percentage</p>
                    </button>
                    {commitPercent === 'custom' && (
                      <div className="mt-2">
                        <Input
                          type="number"
                          value={customPercent}
                          onChange={e => setCustomPercent(e.target.value)}
                          placeholder={`33 – ${availablePercent}`}
                          className="bg-zinc-800 border-zinc-700 text-white"
                          min={33}
                          max={availablePercent}
                        />
                        <p className="text-xs text-gray-500 mt-1">Min 33% · Max {availablePercent}% available</p>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {activePercent >= 33 && (
                    <div className="bg-zinc-800/50 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your share</span>
                        <span className="text-yellow-400 font-bold">{activePercent}% — EGP {Math.round(totalCost * activePercent / 100).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Role</span>
                        <span className="text-white font-bold">{activePercent >= 66 ? 'Sponsor' : 'Co-Organizer'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">New funding</span>
                        <span className="text-white font-bold">{Math.min(100, (radar.funding_percent || 0) + activePercent)}%</span>
                      </div>
                    </div>
                  )}

                  <GlowButton
                    className="w-full"
                    disabled={activePercent < 33 || activePercent > availablePercent || commitMutation.isPending}
                    onClick={() => commitMutation.mutate(activePercent)}
                  >
                    {commitMutation.isPending ? 'Processing...' : 'Commit & Proceed to Billing'}
                    <ChevronRight className="w-4 h-4" />
                  </GlowButton>
                  <p className="text-gray-600 text-xs text-center">
                    <AlertCircle className="w-3 h-3 inline mr-1" />
                    Minimum commitment is 33% of total tournament cost
                  </p>
                </div>
              </FloatingPanel>
            )}

            {/* Commit Success */}
            {commitSuccess && (
              <FloatingPanel className="p-5" glowBorder>
                <div className="text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
                  <h2 className="text-lg font-bold text-white">Commitment Confirmed!</h2>
                  <p className="text-gray-400 text-sm">You've committed as <span className="text-white font-bold">{commitSuccess.label}</span></p>
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount Due</span>
                      <span className="text-yellow-400 font-bold">EGP {commitSuccess.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bill #</span>
                      <span className="text-white font-mono">{commitSuccess.bill_number}</span>
                    </div>
                  </div>
                  <Link to="/organizer/billing">
                    <GlowButton className="w-full mt-2">Go to Billing to Pay</GlowButton>
                  </Link>
                </div>
              </FloatingPanel>
            )}

            {/* Already committed */}
            {myCoEntry && (
              <FloatingPanel className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h2 className="text-lg font-bold text-white">Your Commitment</h2>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Role</span>
                    <span className={`font-bold ${(myCoEntry.percent || myCoEntry.committed_percent || 0) >= 66 ? 'text-purple-400' : 'text-red-400'}`}>
                      {(myCoEntry.percent || myCoEntry.committed_percent || 0) >= 66 ? 'Sponsor' : 'Co-Organizer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-yellow-400 font-bold">EGP {(myCoEntry.amount || myCoEntry.committed_amount)?.toLocaleString()} ({myCoEntry.percent || myCoEntry.committed_percent}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment</span>
                    <span className={myCoEntry.payment_status === 'paid' ? 'text-green-400 font-bold' : 'text-amber-400'}>
                      {myCoEntry.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Access</span>
                    <span className={myCoEntry.access_granted ? 'text-green-400 font-bold' : 'text-gray-500'}>
                      {myCoEntry.access_granted ? '✓ Granted' : 'Pending Payment'}
                    </span>
                  </div>
                  {!myCoEntry.access_granted && (
                    <Link to="/organizer/billing" className="block mt-3">
                      <GlowButton className="w-full" size="sm">Go to Billing to Pay</GlowButton>
                    </Link>
                  )}
                </div>
              </FloatingPanel>
            )}

            {/* Not logged in */}
            {!isAuthenticated && (
              <FloatingPanel className="p-5" glowBorder>
                <Lock className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-white font-bold text-center mb-1">Sign in as Organizer</p>
                <p className="text-gray-400 text-xs text-center mb-4">to commit as a co-organizer</p>
                <Link to="/auth/organizer/login">
                  <GlowButton className="w-full">Login as Organizer</GlowButton>
                </Link>
              </FloatingPanel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}