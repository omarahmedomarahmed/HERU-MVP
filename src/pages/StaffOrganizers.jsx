import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Search, Trophy, CheckCircle, MapPin, Globe, Twitter, Instagram, Eye, Star, Radar, Package } from 'lucide-react';
import { OrganizerProfile, SponsorshipRadar, Tournament, TournamentOrder, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


export default function StaffOrganizers() {
  const [user, setUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => navigate('/admin'));
  }, []);

  const { data: organizers = [], isLoading } = useQuery({
    queryKey: ['all-organizer-profiles-staff'],
    queryFn: () => OrganizerProfile.list('-created_date'),
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['all-tournaments-staff'],
    queryFn: () => Tournament.list('-created_date'),
  });

  const { data: radarListings = [] } = useQuery({
    queryKey: ['all-radar-staff'],
    queryFn: () => SponsorshipRadar.list('-created_date'),
  });

  const { data: tournamentOrders = [] } = useQuery({
    queryKey: ['all-tournament-orders-staff'],
    queryFn: () => TournamentOrder.list('-created_date'),
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, is_verified }) => OrganizerProfile.update(id, { is_verified }),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-organizer-profiles-staff']);
      if (selected) setSelected(s => ({ ...s, is_verified: !s.is_verified }));
    }
  });

  const filtered = organizers.filter(o => {
    const matchSearch = !searchQuery ||
      o.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.organizer_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchVerified = verifiedFilter === 'all' || (verifiedFilter === 'verified' ? o.is_verified : !o.is_verified);
    return matchSearch && matchVerified;
  });

  const getOrgTournaments = (org) => tournaments.filter(t => t.organizer_id === org.user_id || t.main_organizer_id === org.user_id);
  const getCoOrgTournaments = (org) => tournaments.filter(t => t.co_organizers?.some(co => co.organizer_id === org.user_id));
  const getOrgRadar = (org) => radarListings.filter(r => r.main_organizer_id === org.user_id);
  const getOrgOrders = (org) => tournamentOrders.filter(o => o.main_organizer_id === org.user_id);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">ALL <span className="text-red-500">ORGANIZERS</span></h1>
        <p className="text-gray-400">{organizers.length} total organizers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <FloatingPanel className="p-4">
          <p className="text-2xl font-bold text-white">{organizers.length}</p>
          <p className="text-gray-500 text-xs">Total Organizers</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <p className="text-2xl font-bold text-green-400">{organizers.filter(o => o.is_verified).length}</p>
          <p className="text-gray-500 text-xs">Verified</p>
        </FloatingPanel>
        <FloatingPanel className="p-4">
          <p className="text-2xl font-bold text-amber-400">{organizers.filter(o => !o.is_verified).length}</p>
          <p className="text-gray-500 text-xs">Unverified</p>
        </FloatingPanel>
      </div>

      {/* Filters */}
      <FloatingPanel className="p-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by brand name or email..." className="pl-10 bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <div className="flex gap-2">
            {['all','verified','unverified'].map(v => (
              <button key={v} onClick={() => setVerifiedFilter(v)} className={`px-3 py-1.5 rounded text-xs capitalize transition-colors ${verifiedFilter === v ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </FloatingPanel>

      {/* Table */}
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-gray-500 font-medium p-4">Brand</th>
                <th className="text-left text-gray-500 font-medium p-4">Email</th>
                <th className="text-center text-gray-500 font-medium p-4">Tournaments</th>
                <th className="text-left text-gray-500 font-medium p-4">Location</th>
                <th className="text-center text-gray-500 font-medium p-4">Verified</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No organizers found</td></tr>
              ) : filtered.map(org => (
                <tr key={org.id} className="border-b border-zinc-800/50 hover:bg-white/5 cursor-pointer" onClick={() => setSelected(org)}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {org.brand_logo ? <img src={org.brand_logo} className="w-full h-full object-cover" alt="" /> : <Shield className="w-5 h-5 text-zinc-500" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{org.brand_name || 'Unnamed'}</p>
                        {org.featured_games?.length > 0 && <p className="text-gray-500 text-xs">{org.featured_games.slice(0,2).join(', ')}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-xs">{org.organizer_email || '—'}</td>
                  <td className="p-4 text-center text-gray-300">{getOrgTournaments(org).length}</td>
                  <td className="p-4 text-gray-400 text-xs">{org.location || '—'}</td>
                  <td className="p-4 text-center">
                    {org.is_verified
                      ? <span className="text-xs text-green-400 flex items-center justify-center gap-1"><CheckCircle className="w-4 h-4" /> Verified</span>
                      : <span className="text-xs text-gray-500">—</span>}
                  </td>
                  <td className="p-4"><GlowButton variant="ghost" size="sm">View</GlowButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {selected?.brand_logo ? <img src={selected.brand_logo} className="w-full h-full object-cover" alt="" /> : <Shield className="w-5 h-5 text-zinc-500" />}
              </div>
              <div>
                <span>{selected?.brand_name}</span>
                {selected?.is_verified && <span className="ml-2 text-xs text-green-400 border border-green-500/30 bg-green-500/10 px-2 py-0.5 rounded">✓ Verified</span>}
              </div>
            </DialogTitle>
          </DialogHeader>
          {selected && (() => {
            const orgTournaments = getOrgTournaments(selected);
            const coOrgTournaments = getCoOrgTournaments(selected);
            const orgRadar = getOrgRadar(selected);
            const orgOrders = getOrgOrders(selected);
            return (
              <div className="space-y-4 py-2">
                {/* Quick actions */}
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-400">Verification Status</p>
                    <p className="text-white font-medium">{selected.is_verified ? '✓ Verified' : 'Not Verified'}</p>
                  </div>
                  <GlowButton
                    size="sm"
                    variant={selected.is_verified ? 'ghost' : 'secondary'}
                    onClick={() => toggleVerifiedMutation.mutate({ id: selected.id, is_verified: !selected.is_verified })}
                    disabled={toggleVerifiedMutation.isPending}
                  >
                    {selected.is_verified ? 'Remove Verification' : '✓ Verify Organizer'}
                  </GlowButton>
                </div>

                {/* Profile info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-white text-sm">{selected.organizer_email || '—'}</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</p>
                    <p className="text-white text-sm">{selected.location || '—'}</p>
                  </div>
                </div>

                {selected.bio && (
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-300 text-sm">{selected.bio}</p>
                  </div>
                )}

                {/* Social links */}
                {(selected.social_links?.twitter || selected.social_links?.instagram || selected.social_links?.website) && (
                  <div className="flex gap-3 flex-wrap">
                    {selected.social_links?.twitter && <a href={selected.social_links.twitter} target="_blank" className="flex items-center gap-1 text-xs text-blue-400 hover:underline"><Twitter className="w-3 h-3" />Twitter</a>}
                    {selected.social_links?.instagram && <a href={selected.social_links.instagram} target="_blank" className="flex items-center gap-1 text-xs text-pink-400 hover:underline"><Instagram className="w-3 h-3" />Instagram</a>}
                    {selected.social_links?.website && <a href={selected.social_links.website} target="_blank" className="flex items-center gap-1 text-xs text-green-400 hover:underline"><Globe className="w-3 h-3" />Website</a>}
                  </div>
                )}

                <Tabs defaultValue="tournaments">
                  <TabsList className="bg-zinc-800">
                    <TabsTrigger value="tournaments" className="data-[state=active]:bg-red-600">Tournaments ({orgTournaments.length + coOrgTournaments.length})</TabsTrigger>
                    <TabsTrigger value="radar" className="data-[state=active]:bg-red-600">Radar ({orgRadar.length})</TabsTrigger>
                    <TabsTrigger value="orders" className="data-[state=active]:bg-red-600">Orders ({orgOrders.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tournaments" className="mt-3 space-y-2">
                    {orgTournaments.length > 0 && (
                      <>
                        <p className="text-xs text-gray-500 font-bold uppercase">Solo & Main Organizer</p>
                        {orgTournaments.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                            <div>
                              <p className="text-white text-sm">{t.name}</p>
                              <p className="text-gray-500 text-xs">{t.game} · {t.status}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded border ${t.tournament_type === 'shared' ? 'text-purple-400 border-purple-500/30' : 'text-blue-400 border-blue-500/30'}`}>{t.tournament_type}</span>
                          </div>
                        ))}
                      </>
                    )}
                    {coOrgTournaments.length > 0 && (
                      <>
                        <p className="text-xs text-gray-500 font-bold uppercase mt-3">Co-Organized</p>
                        {coOrgTournaments.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                            <div>
                              <p className="text-white text-sm">{t.name}</p>
                              <p className="text-gray-500 text-xs">{t.game}</p>
                            </div>
                            <span className="text-xs text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">co-org</span>
                          </div>
                        ))}
                      </>
                    )}
                    {orgTournaments.length === 0 && coOrgTournaments.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No tournaments yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="radar" className="mt-3 space-y-2">
                    {orgRadar.length > 0 ? orgRadar.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{r.tournament_name}</p>
                          <p className="text-gray-500 text-xs">EGP {(r.total_cost || 0).toLocaleString()} · {r.funding_percent || 0}% funded</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border ${r.status === 'open' ? 'text-green-400 border-green-500/30' : 'text-gray-400 border-zinc-600'}`}>{r.status}</span>
                      </div>
                    )) : <p className="text-gray-500 text-sm text-center py-4">No radar listings</p>}
                  </TabsContent>

                  <TabsContent value="orders" className="mt-3 space-y-2">
                    {orgOrders.length > 0 ? orgOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded-lg">
                        <div>
                          <p className="text-white text-sm">{o.tournament_name}</p>
                          <p className="text-gray-500 text-xs">{o.items?.length || 0} items</p>
                        </div>
                        <span className="text-green-400 font-bold text-sm">EGP {(o.grand_total || 0).toLocaleString()}</span>
                      </div>
                    )) : <p className="text-gray-500 text-sm text-center py-4">No orders yet</p>}
                  </TabsContent>
                </Tabs>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}