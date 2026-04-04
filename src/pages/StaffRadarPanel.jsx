import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, Search, Radar, DollarSign, Users, TrendingUp, X } from 'lucide-react';
import { SponsorshipRadar, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


const STATUS_COLORS = {
  open: 'bg-green-500/20 text-green-400 border-green-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fully_funded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  closed: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
};

function FundingBar({ percent }) {
  const pct = Math.min(100, percent || 0);
  const color = pct >= 100 ? 'bg-yellow-400' : pct >= 60 ? 'bg-green-400' : pct >= 30 ? 'bg-blue-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function StaffRadarPanel() {
  const [user, setUser] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [fundingMin, setFundingMin] = useState('');
  const [fundingMax, setFundingMax] = useState('');
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => navigate('/admin'));
  }, []);

  const { data: radarListings = [], isLoading } = useQuery({
    queryKey: ['all-radar-listings'],
    queryFn: () => SponsorshipRadar.list('-created_date'),
  });

  const allGames = [...new Set(radarListings.map(r => r.game).filter(Boolean))];

  const filtered = radarListings.filter(r => {
    const matchSearch = !searchQuery || r.tournament_name?.toLowerCase().includes(searchQuery.toLowerCase()) || r.main_organizer_brand?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchGame = gameFilter === 'all' || r.game === gameFilter;
    const pct = r.funding_percent || 0;
    const matchMin = !fundingMin || pct >= parseFloat(fundingMin);
    const matchMax = !fundingMax || pct <= parseFloat(fundingMax);
    return matchSearch && matchStatus && matchGame && matchMin && matchMax;
  });

  return (
    <StaffLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">SPONSORSHIP <span className="text-red-500">RADAR</span></h1>
        <p className="text-gray-400">{radarListings.length} total listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {['open','in_progress','fully_funded','closed'].map(s => (
          <FloatingPanel key={s} className="p-4">
            <p className="text-2xl font-bold text-white">{radarListings.filter(r => r.status === s).length}</p>
            <p className="text-gray-500 text-xs capitalize">{s.replace('_', ' ')}</p>
          </FloatingPanel>
        ))}
      </div>

      {/* Filters */}
      <FloatingPanel className="p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tournament or organizer..." className="pl-10 bg-zinc-800 border-zinc-700 text-white" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="fully_funded">Fully Funded</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={gameFilter} onValueChange={setGameFilter}>
            <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white"><SelectValue placeholder="Game" /></SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Games</SelectItem>
              {allGames.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input value={fundingMin} onChange={e => setFundingMin(e.target.value)} placeholder="Min %" className="w-20 bg-zinc-800 border-zinc-700 text-white text-sm" />
            <span className="text-gray-500 text-sm">–</span>
            <Input value={fundingMax} onChange={e => setFundingMax(e.target.value)} placeholder="Max %" className="w-20 bg-zinc-800 border-zinc-700 text-white text-sm" />
          </div>
        </div>
      </FloatingPanel>

      {/* Table */}
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-gray-500 font-medium p-4">Tournament</th>
                <th className="text-left text-gray-500 font-medium p-4">Game</th>
                <th className="text-left text-gray-500 font-medium p-4">Organizer</th>
                <th className="text-right text-gray-500 font-medium p-4">Total Cost</th>
                <th className="text-left text-gray-500 font-medium p-4 min-w-32">Funding</th>
                <th className="text-center text-gray-500 font-medium p-4">Co-Orgs</th>
                <th className="text-center text-gray-500 font-medium p-4">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No listings found</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelected(r)}>
                  <td className="p-4">
                    <p className="text-white font-medium truncate max-w-48">{r.tournament_name}</p>
                  </td>
                  <td className="p-4 text-gray-400">{r.game || '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {r.main_organizer_brand?.logo ? (
                        <img src={r.main_organizer_brand.logo} className="w-6 h-6 rounded object-cover" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center"><Shield className="w-3 h-3 text-zinc-500" /></div>
                      )}
                      <span className="text-gray-300 truncate max-w-32">{r.main_organizer_brand?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right text-green-400 font-bold">EGP {(r.total_cost || 0).toLocaleString()}</td>
                  <td className="p-4 min-w-32"><FundingBar percent={r.funding_percent} /></td>
                  <td className="p-4 text-center text-gray-300">{r.co_organizers?.length || 0}</td>
                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[r.status] || 'text-gray-400 border-zinc-600'}`}>
                      {r.status?.replace('_', ' ') || 'unknown'}
                    </span>
                  </td>
                  <td className="p-4">
                    <GlowButton variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setSelected(r); }}>View</GlowButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-red-500" />
              {selected?.tournament_name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 py-2">
              {/* Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Cost</p>
                  <p className="text-green-400 font-bold">EGP {(selected.total_cost || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Still Needed</p>
                  <p className="text-red-400 font-bold">EGP {(selected.amount_still_needed || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[selected.status] || ''}`}>
                    {selected.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Overall Funding</p>
                <FundingBar percent={selected.funding_percent} />
              </div>

              {/* Main Organizer */}
              <div>
                <h3 className="text-white font-bold mb-2 text-sm">Main Organizer</h3>
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  {selected.main_organizer_brand?.logo ? (
                    <img src={selected.main_organizer_brand.logo} className="w-10 h-10 rounded-lg object-cover" alt="" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-zinc-700 flex items-center justify-center"><Shield className="w-5 h-5 text-zinc-500" /></div>
                  )}
                  <div>
                    <p className="text-white font-medium">{selected.main_organizer_brand?.name}</p>
                    <p className="text-gray-500 text-xs">{selected.main_organizer_percent || 30}% committed • EGP {(selected.main_organizer_contribution || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Co-Organizers */}
              {selected.co_organizers?.length > 0 && (
                <div>
                  <h3 className="text-white font-bold mb-2 text-sm">Co-Organizers ({selected.co_organizers.length})</h3>
                  <div className="space-y-2">
                    {selected.co_organizers.map((co, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center overflow-hidden">
                            {co.brand_logo ? <img src={co.brand_logo} className="w-full h-full object-cover" alt="" /> : <Shield className="w-4 h-4 text-zinc-500" />}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{co.brand_name}</p>
                            <p className="text-gray-500 text-xs">{co.committed_percent}% • EGP {(co.committed_amount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${co.payment_status === 'paid' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                            {co.payment_status || 'pending'}
                          </span>
                          {co.access_granted && <span className="text-xs text-blue-400">✓ Access</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Game & Description */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Game</p>
                  <p className="text-white">{selected.game || '—'}</p>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Prize Pool</p>
                  <p className="text-yellow-400 font-bold">EGP {(selected.prizepool_amount || 0).toLocaleString()}</p>
                </div>
              </div>

              {selected.description && (
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-gray-300 text-sm">{selected.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </StaffLayout>
  );
}