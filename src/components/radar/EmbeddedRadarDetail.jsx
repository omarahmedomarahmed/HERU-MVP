import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import FundingBar from '@/components/radar/FundingBar';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft, Trophy, Calendar, Users, Gamepad2, MapPin, Radio,
  Shield, CheckCircle, Star, Lock, TrendingUp, MessageSquare,
  Send, AlertCircle, Check, Download, Upload, Folder
} from 'lucide-react';
import { format } from 'date-fns';
import { OrganizerProfile, SponsorshipRadar, Team, Tournament } from '@/api/heruClient'


function StatusBadge({ status }) {
  const map = {
    open:         { label: 'Open',         cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    in_progress:  { label: 'In Progress',  cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    fully_funded: { label: 'Fully Funded', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    closed:       { label: 'Closed',       cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const s = map[status] || map.open;
  return <span className={`text-sm font-bold px-3 py-1 rounded-full border ${s.cls}`}>{s.label}</span>;
}

export default function EmbeddedRadarDetail({ radarId, onBack, session, profile }) {
  const [commitAmount, setCommitAmount] = useState('');
  const [chatMsg, setChatMsg] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Organizer Branding');
  const queryClient = useQueryClient();

  const myOrganizerId = session?.profileId;

  const { data: radar, isLoading } = useQuery({
    queryKey: ['radar-detail-embedded', radarId],
    queryFn: async () => {
      const all = await SponsorshipRadar.list();
      return all.find(r => r.id === radarId) || null;
    },
    enabled: !!radarId,
  });

  const { data: tournament } = useQuery({
    queryKey: ['radar-tournament-embedded', radar?.tournament_id],
    queryFn: async () => {
      if (!radar?.tournament_id) return null;
      const all = await Tournament.list();
      return all.find(t => t.id === radar.tournament_id) || null;
    },
    enabled: !!radar?.tournament_id,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['radar-teams-embedded', radar?.tournament_id],
    queryFn: async () => {
      if (!tournament?.invited_teams?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => tournament.invited_teams.includes(t.id));
    },
    enabled: !!tournament,
  });

  const { data: mainOrgProfile } = useQuery({
    queryKey: ['main-org-profile-embedded', radar?.main_organizer_id],
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

      await SponsorshipRadar.update(radar.id, {
        co_organizers: updatedCoOrgs,
        funding_percent: newFundingPercent,
        amount_still_needed: Math.max(0, totalCost - mainContrib - totalCommitted),
        status: newFundingPercent >= 100 ? 'fully_funded' : updatedCoOrgs.length > 0 ? 'in_progress' : 'open',
      });
      if (tournament) {
        await Tournament.update(tournament.id, {
          co_organizers: [...(tournament.co_organizers || []), {
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
      queryClient.invalidateQueries(['radar-detail-embedded', radarId]);
      setCommitAmount('');
      alert('✅ Commitment submitted! You can now manage it in your Billing tab.');
      onBack();
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" /></div>;
  }

  if (!radar) {
    return (
      <FloatingPanel className="p-12 text-center">
        <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-xl text-white font-bold">Radar listing not found</h3>
        <button onClick={onBack} className="mt-4 text-gray-400 hover:text-white flex items-center gap-2 mx-auto">
          <ChevronLeft className="w-4 h-4" /> Go back
        </button>
      </FloatingPanel>
    );
  }

  const isMainOrg = myOrganizerId === radar.main_organizer_id;
  const myCoEntry = radar.co_organizers?.find(co => co.organizer_id === myOrganizerId);
  const canCommit = !isMainOrg && !myCoEntry && radar.status !== 'fully_funded' && radar.status !== 'closed';

  const commitAmt = parseFloat(commitAmount) || 0;
  const totalCost = radar.total_cost || 0;
  const myPercent = totalCost > 0 ? Math.round((commitAmt / totalCost) * 100) : 0;
  const FOLDERS = ['Organizer Branding', 'Co-Organizer Branding', 'Tournament Branding', 'Social Media'];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Sponsorships
      </button>

      {/* Banner */}
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
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded border bg-blue-500/20 text-blue-400 border-blue-500/30">SHARED TOURNAMENT</span>
            <StatusBadge status={radar.status} />
          </div>
          <h1 className="text-3xl font-black text-white mb-1">{radar.tournament_name}</h1>
          <div className="flex items-center gap-4 text-gray-300 text-sm flex-wrap">
            <span className="flex items-center gap-1"><Gamepad2 className="w-4 h-4 text-red-400" />{radar.game}</span>
            {radar.schedule && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(radar.schedule), 'MMM d, yyyy')}</span>}
          </div>
        </div>
      </div>

      {/* Funding Progress */}
      <FloatingPanel className="p-6 mb-6" glowBorder>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-lg font-bold text-white">Funding Progress</h2>
          <span className="text-2xl font-black text-white">{radar.funding_percent || 0}% Funded</span>
        </div>
        <FundingBar percent={radar.funding_percent || 0} totalCost={radar.total_cost || 0} large />
        <div className="flex items-center justify-between mt-3 text-sm flex-wrap gap-2">
          <span className="text-gray-400">
            EGP {Math.round(totalCost * (radar.funding_percent || 0) / 100).toLocaleString()} of EGP {totalCost.toLocaleString()}
          </span>
          <span className="text-red-400 font-bold">
            EGP {(radar.amount_still_needed || 0).toLocaleString()} needed
          </span>
        </div>
      </FloatingPanel>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tournament Details */}
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-red-500" /> Tournament Details
            </h2>
            {radar.description && <p className="text-gray-300 leading-relaxed mb-4">{radar.description}</p>}
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
              {teams.length > 0 && (
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Teams Invited</p>
                  <p className="text-white font-bold text-xl">{teams.length}</p>
                </div>
              )}
              {tournament?.format && (
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Format</p>
                  <p className="text-white font-bold">{tournament.format}</p>
                </div>
              )}
            </div>
          </FloatingPanel>

          {/* Branding Items */}
          {radar.order_breakdown?.length > 0 && (
            <FloatingPanel className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" /> Items Breakdown
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Co-Organizers */}
          <FloatingPanel className="p-5">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Co-Organizers ({radar.co_organizers?.length || 0})
            </h2>
            {!radar.co_organizers?.length ? (
              <p className="text-gray-500 text-sm text-center py-4">No co-organizers yet. Be the first!</p>
            ) : (
              <div className="space-y-3">
                {radar.co_organizers.map((co, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-3">
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
                      {co.payment_status === 'paid' ? '✓' : '⏳'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </FloatingPanel>

          {/* Commit */}
          {canCommit && (
            <FloatingPanel className="p-5" glowBorder>
              <h2 className="text-lg font-bold text-white mb-1">Commit as Co-Organizer</h2>
              <p className="text-gray-400 text-xs mb-4">Your brand will be featured</p>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1.5">Amount (EGP)</label>
                  <Input
                    type="number"
                    value={commitAmount}
                    onChange={e => setCommitAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="bg-zinc-800 border-zinc-700 text-white"
                    min={1}
                  />
                  <div className="mt-1.5 text-xs text-blue-400">
                    Recommended: 30%+ (EGP {Math.round(totalCost * 0.3).toLocaleString()})
                  </div>
                </div>
                {commitAmt > 0 && (
                  <div className="bg-zinc-800/50 rounded-xl p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Your share</span>
                      <span className="text-yellow-400 font-bold">{myPercent}%</span>
                    </div>
                  </div>
                )}
                <GlowButton
                  className="w-full"
                  disabled={!commitAmt || commitAmt <= 0}
                  onClick={() => commitMutation.mutate(commitAmt)}
                >
                  Commit & Proceed
                </GlowButton>
              </div>
            </FloatingPanel>
          )}

          {/* Already Committed */}
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
              </div>
            </FloatingPanel>
          )}
        </div>
      </div>
    </div>
  );
}