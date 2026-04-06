import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizerSession } from '@/lib/auth-guards';
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
  const [session, setSession] = useState(null);
  const [commitAmount, setCommitAmount] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Organizer Branding');

  useEffect(() => {
    const s = getOrganizerSession();
    setSession(s);
  }, []);

  const myOrganizerId = session?.profileId;

  const { data: radar, isLoading } = useQuery({
    queryKey: ['radar-detail', radar_id],
    queryFn: async () => {
      const all = await SponsorshipRadar.list();
      return all.find(r => r.id === radar_id) || null;
    },
    enabled: !!radar_id,
  });

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile-detail', session?.profileId],
    queryFn: async () => {
      const profiles = await OrganizerProfile.list();
      return profiles.find(p => p.id === session.profileId) || null;
    },
    enabled: !!session?.profileId,
  });

  const { data: tournament } = useQuery({
    queryKey: ['radar-tournament', radar?.tournament_id],
    queryFn: async () => {
      const all = await Tournament.list();
      return all.find(t => t.id === radar.tournament_id) || null;
    },
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
    queryFn: async () => {
      const all = await OrganizerProfile.list();
      return all.find(p => p.id === radar.main_organizer_id) || null;
    },
    enabled: !!radar?.main_organizer_id,
  });

  const commitMutation = useMutation({
    mutationFn: async (amount) => {
      const totalCost = radar.total_cost || 0;
      const cappedAmount = Math.min(amount, radar.amount_still_needed || amount);
      const cappedPercent = totalCost > 0 ? Math.round((cappedAmount / totalCost) * 100) : 0;
      const existingCo = radar.co_organizers || [];
      const newCo = {
        organizer_id: myOrganizerId,
        brand_name: profile?.brand_name || '',
        brand_logo: profile?.brand_logo || '',
        committed_amount: cappedAmount,
        committed_percent: cappedPercent,
        payment_status: 'pending',
        access_granted: false,
      };
      const updatedCoOrgs = [...existingCo, newCo];
      const mainContrib = radar.main_organizer_contribution || 0;
      const totalCommitted = updatedCoOrgs.reduce((s, c) => s + (c.committed_amount || 0), 0);
      const newFundingPercent = Math.min(100, Math.round(((mainContrib + totalCommitted) / totalCost) * 100));
      const newAmountNeeded = Math.max(0, totalCost - mainContrib - totalCommitted);
      await SponsorshipRadar.update(radar.id, {
        co_organizers: updatedCoOrgs,
        funding_percent: newFundingPercent,
        amount_still_needed: newAmountNeeded,
        status: newFundingPercent >= 100 ? 'fully_funded' : updatedCoOrgs.length > 0 ? 'in_progress' : 'open',
      });
      if (tournament) {
        const tCoOrgs = tournament.co_organizers || [];
        await Tournament.update(tournament.id, {
          co_organizers: [...tCoOrgs, {
            organizer_id: myOrganizerId,
            brand_name: profile?.brand_name || '',
            brand_logo: profile?.brand_logo || '',
            commitment_amount: cappedAmount,
            commitment_percent: cappedPercent,
            payment_status: 'pending',
            access_granted: false,
            joined_at: new Date().toISOString(),
          }],
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['radar-detail', radar_id]);
      setCommitAmount('');
      navigate('/dashboard/organizer');
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (message) => {
      const existing = tournament.organizer_chat || [];
      const newMsg = {
        sender_id: myOrganizerId || session?.userId,
        sender_name: profile?.brand_name || session?.email || 'Organizer',
        sender_role: myOrganizerId === radar?.main_organizer_id ? 'main_organizer' : 'co_organizer',
        message,
        timestamp: new Date().toISOString(),
      };
      await Tournament.update(tournament.id, {
        organizer_chat: [...existing, newMsg],
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

  const isMainOrg = myOrganizerId === radar.main_organizer_id;
  const myCoEntry = radar.co_organizers?.find(co => co.organizer_id === myOrganizerId);
  const hasAccess = myCoEntry?.access_granted;
  const isStaff = session?.isStaff;
  const canChat = isMainOrg || hasAccess || isStaff;
  const canCommit = !isMainOrg && !myCoEntry && session && radar.status !== 'fully_funded' && radar.status !== 'closed';

  const commitAmt = parseFloat(commitAmount) || 0;
  const totalCost = radar.total_cost || 0;
  const myPercent = totalCost > 0 ? Math.round((commitAmt / totalCost) * 100) : 0;

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
                          <p className="text-gray-400 text-xs">{co.committed_percent}% — EGP {co.committed_amount?.toLocaleString()}</p>
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

            {/* Commit Section */}
            {canCommit && (
              <FloatingPanel className="p-5" glowBorder>
                <h2 className="text-lg font-bold text-white mb-1">Commit as Co-Organizer</h2>
                <p className="text-gray-400 text-xs mb-4">Your brand will be featured on this tournament page</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Your Commitment Amount (EGP)</label>
                    <Input
                      type="number"
                      value={commitAmount}
                      onChange={e => setCommitAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="bg-zinc-800 border-zinc-700 text-white text-lg"
                      min={1}
                    />
                    <div className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                      <TrendingUp className="w-3 h-3" />
                      Recommended: 30%+ of total (EGP {Math.round(totalCost * 0.3).toLocaleString()})
                    </div>
                  </div>
                  {commitAmt > 0 && (
                    <div className="bg-zinc-800/50 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your share</span>
                        <span className="text-yellow-400 font-bold">{myPercent}% — EGP {commitAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">New funding</span>
                        <span className="text-white font-bold">{Math.min(100, (radar.funding_percent || 0) + myPercent)}%</span>
                      </div>
                    </div>
                  )}
                  <GlowButton
                    className="w-full"
                    disabled={!commitAmt || commitAmt <= 0 || commitMutation.isPending}
                    onClick={() => commitMutation.mutate(commitAmt)}
                  >
                    {commitMutation.isPending ? 'Processing...' : 'Commit & Proceed to Billing'}
                    <ChevronRight className="w-4 h-4" />
                  </GlowButton>
                  <p className="text-gray-600 text-xs text-center">Payment can be confirmed later in your Billing tab</p>
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
                    <span className="text-gray-400">Amount</span>
                    <span className="text-yellow-400 font-bold">EGP {myCoEntry.committed_amount?.toLocaleString()} ({myCoEntry.committed_percent}%)</span>
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
                    <Link to="/dashboard/organizer" className="block mt-3">
                      <GlowButton className="w-full" size="sm">Go to Billing to Pay</GlowButton>
                    </Link>
                  )}
                </div>
              </FloatingPanel>
            )}

            {/* Not logged in */}
            {!session && (
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