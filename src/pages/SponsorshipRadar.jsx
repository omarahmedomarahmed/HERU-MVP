import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizerSession } from '@/lib/auth-guards';

import FloatingPanel from '@/components/ui/FloatingPanel';
import FundingBar from '@/components/radar/FundingBar';
import RadarTournamentCard from '@/components/radar/RadarTournamentCard';
import CommitModal from '@/components/radar/CommitModal';
import { Radar, Search, Filter, Trophy, Users, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { OrganizerProfile, SponsorshipRadar, Tournament } from '@/api/heruClient'


const TABS = [
  { id: 'browse', label: 'Browse Open Tournaments' },
  { id: 'activity', label: 'My Radar Activity' },
];

export default function SponsorshipRadarPage() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [commitTarget, setCommitTarget] = useState(null); // radar record to commit to
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = getOrganizerSession();
    if (!s) { navigate('/auth/organizer/login'); return; }
    setSession(s);
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile', session?.profileId],
    queryFn: async () => {
      if (!session?.profileId) return null;
      const profiles = await OrganizerProfile.list();
      return profiles.find(p => p.id === session.profileId) || null;
    },
    enabled: !!session?.profileId,
  });

  const { data: radarRecords = [], isLoading } = useQuery({
    queryKey: ['sponsorship-radar'],
    queryFn: () => SponsorshipRadar.list('-created_date'),
    enabled: !!session,
  });

  const user = session ? { id: session.userId, email: session.email } : null;
  const myOrganizerId = profile?.id || session?.profileId;

  // Browse: open or in_progress, not mine
  const browseRecords = radarRecords.filter(r =>
    (r.status === 'open' || r.status === 'in_progress') &&
    r.main_organizer_id !== myOrganizerId &&
    !r.co_organizers?.some(co => co.organizer_id === myOrganizerId) &&
    (search === '' ||
      r.tournament_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.game?.toLowerCase().includes(search.toLowerCase()) ||
      r.main_organizer_brand?.name?.toLowerCase().includes(search.toLowerCase()))
  );

  // My Activity: I am main organizer OR co-organizer
  const myListedRadar = radarRecords.filter(r => r.main_organizer_id === myOrganizerId);
  const coOrgRadar = radarRecords.filter(r =>
    r.main_organizer_id !== myOrganizerId &&
    r.co_organizers?.some(co => co.organizer_id === myOrganizerId)
  );

  const commitMutation = useMutation({
    mutationFn: async ({ radar, amount, paymentConfirmed }) => {
      const totalCost = radar.total_cost || 0;
      const myPercent = totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0;

      // Clamp to remaining
      const cappedAmount = Math.min(amount, radar.amount_still_needed || amount);
      const cappedPercent = totalCost > 0 ? Math.round((cappedAmount / totalCost) * 100) : myPercent;

      const existingCo = radar.co_organizers || [];
      const newCo = {
        organizer_id: myOrganizerId,
        brand_name: profile?.brand_name || '',
        brand_logo: profile?.brand_logo || '',
        committed_amount: cappedAmount,
        committed_percent: cappedPercent,
        payment_status: paymentConfirmed ? 'paid' : 'pending',
        access_granted: paymentConfirmed,
      };

      const updatedCoOrgs = [...existingCo, newCo];
      const totalCommitted = updatedCoOrgs.reduce((s, c) => s + (c.committed_amount || 0), 0);
      const mainContrib = radar.main_organizer_contribution || 0;
      const newFundingPercent = Math.min(100, Math.round(((mainContrib + totalCommitted) / totalCost) * 100));
      const newAmountNeeded = Math.max(0, totalCost - mainContrib - totalCommitted);
      const isFullyFunded = newFundingPercent >= 100;

      // Update SponsorshipRadar
      await SponsorshipRadar.update(radar.id, {
        co_organizers: updatedCoOrgs,
        funding_percent: newFundingPercent,
        amount_still_needed: newAmountNeeded,
        status: isFullyFunded ? 'fully_funded' : updatedCoOrgs.length > 0 ? 'in_progress' : 'open',
      });

      // Update Tournament co_organizers + radar status
      const tournament = await Tournament.list({ sponsorship_radar_id: radar.id });
      if (tournament[0]) {
        const tCoOrgs = tournament[0].co_organizers || [];
        const newTCoOrg = {
          organizer_id: myOrganizerId,
          brand_name: profile?.brand_name || '',
          brand_logo: profile?.brand_logo || '',
          commitment_amount: cappedAmount,
          commitment_percent: cappedPercent,
          payment_status: paymentConfirmed ? 'paid' : 'pending',
          access_granted: paymentConfirmed,
          joined_at: new Date().toISOString(),
        };
        await Tournament.update(tournament[0].id, {
          co_organizers: [...tCoOrgs, newTCoOrg],
          radar_funding_percent: newFundingPercent,
          on_radar: !isFullyFunded,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sponsorship-radar']);
      setCommitTarget(null);
    },
  });

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Radar className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">Sponsorship Radar</h1>
          <p className="text-gray-400 text-sm">Find tournaments to co-organize, or track your own listings</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <FloatingPanel className="p-4 text-center">
          <p className="text-2xl font-black text-white">{browseRecords.length}</p>
          <p className="text-gray-400 text-xs mt-1">Open Tournaments</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <p className="text-2xl font-black text-white">{myListedRadar.length}</p>
          <p className="text-gray-400 text-xs mt-1">My Listings</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <p className="text-2xl font-black text-white">{coOrgRadar.length}</p>
          <p className="text-gray-400 text-xs mt-1">Co-Organizing</p>
        </FloatingPanel>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6 border border-zinc-800">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(255,26,26,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by tournament name, game, or organizer..."
              className="bg-zinc-900 border-zinc-700 text-white pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-16 text-gray-500">Loading radar...</div>
          ) : browseRecords.length === 0 ? (
            <FloatingPanel className="p-12 text-center">
              <Radar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">No open tournaments on the radar</p>
              <p className="text-gray-600 text-sm mt-1">Check back later or create a shared tournament of your own</p>
            </FloatingPanel>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {browseRecords.map(radar => (
                <RadarTournamentCard
                  key={radar.id}
                  radar={radar}
                  onCommit={() => setCommitTarget(radar)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Radar Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-8">
          {/* My Listed Tournaments */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h2 className="text-white font-bold">My Listed Tournaments</h2>
              <span className="text-xs text-gray-500 bg-zinc-800 px-2 py-0.5 rounded-full">{myListedRadar.length}</span>
            </div>
            {myListedRadar.length === 0 ? (
              <FloatingPanel className="p-8 text-center">
                <p className="text-gray-500 text-sm">You haven't listed any tournaments on the radar yet.</p>
                <p className="text-gray-600 text-xs mt-1">Create a shared tournament to get started.</p>
              </FloatingPanel>
            ) : (
              <div className="grid lg:grid-cols-2 gap-5">
                {myListedRadar.map(radar => (
                  <RadarTournamentCard
                    key={radar.id}
                    radar={radar}
                    isSelf
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tournaments I'm Co-Organizing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-blue-400" />
              <h2 className="text-white font-bold">Tournaments I'm Co-Organizing</h2>
              <span className="text-xs text-gray-500 bg-zinc-800 px-2 py-0.5 rounded-full">{coOrgRadar.length}</span>
            </div>
            {coOrgRadar.length === 0 ? (
              <FloatingPanel className="p-8 text-center">
                <p className="text-gray-500 text-sm">You haven't committed to any tournaments yet.</p>
                <p className="text-gray-600 text-xs mt-1">Browse open tournaments and commit as a co-organizer.</p>
              </FloatingPanel>
            ) : (
              <div className="grid lg:grid-cols-2 gap-5">
                {coOrgRadar.map(radar => {
                  const myEntry = radar.co_organizers?.find(co => co.organizer_id === myOrganizerId);
                  return (
                    <div key={radar.id} className="space-y-2">
                      <RadarTournamentCard radar={radar} />
                      {myEntry && (
                        <FloatingPanel className="px-4 py-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">My Commitment</span>
                            <span className="text-yellow-400 font-bold">
                              EGP {myEntry.committed_amount?.toLocaleString()} ({myEntry.committed_percent}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-400">Payment</span>
                            <span className={`font-bold ${myEntry.payment_status === 'paid' ? 'text-green-400' : 'text-amber-400'}`}>
                              {myEntry.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-400">Access</span>
                            <span className={`font-bold ${myEntry.access_granted ? 'text-green-400' : 'text-gray-500'}`}>
                              {myEntry.access_granted ? '✓ Granted' : 'Pending Payment'}
                            </span>
                          </div>
                        </FloatingPanel>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commit Modal */}
      {commitTarget && (
        <CommitModal
          radar={commitTarget}
          profile={profile}
          onClose={() => setCommitTarget(null)}
          isLoading={commitMutation.isPending}
          onConfirm={({ amount, paymentConfirmed }) =>
            commitMutation.mutate({ radar: commitTarget, amount, paymentConfirmed })
          }
        />
      )}
    </>
  );
}