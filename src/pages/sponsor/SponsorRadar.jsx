import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Radar, Eye, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SponsorRadar() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ game: '', max_price: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.game) params.set('game', filters.game);
    if (filters.max_price) params.set('max_price', filters.max_price);
    fetch(`/api/sponsorship-packages/radar?${params}`)
      .then(r => r.json()).then(d => setPackages(d.packages || [])).catch(() => {}).finally(() => setLoading(false));
  }, [filters]);

  const filtered = search ? packages.filter(p => p.tournaments?.name?.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase()) || p.tournaments?.game?.toLowerCase().includes(search.toLowerCase())) : packages;
  const byTournament = filtered.reduce((acc, pkg) => { const tid = pkg.tournament_id; if (!acc[tid]) acc[tid] = { tournament: pkg.tournaments, packages: [] }; acc[tid].packages.push(pkg); return acc; }, {});

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8"><div className="flex items-center gap-3 mb-2"><Radar className="w-6 h-6 text-blue-400" /><h1 className="text-2xl font-bold text-white">Sponsorship Radar</h1></div><p className="text-gray-400">Browse tournaments seeking brand sponsorships across MENA</p></div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tournaments or packages..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div>
        <select value={filters.game} onChange={e => setFilters(f => ({...f,game:e.target.value}))} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"><option value="">All games</option>{['Valorant','FIFA','Fortnite','PUBG Mobile','Call of Duty','League of Legends'].map(g=><option key={g} value={g} className="bg-gray-900">{g}</option>)}</select>
        <select value={filters.max_price} onChange={e => setFilters(f => ({...f,max_price:e.target.value}))} className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"><option value="">Any budget</option><option value="5000">Up to EGP 5,000</option><option value="15000">Up to EGP 15,000</option><option value="50000">Up to EGP 50,000</option></select>
      </div>
      {loading ? (<div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />)}</div>)
      : Object.keys(byTournament).length===0 ? (<div className="text-center py-16 text-gray-500"><Radar className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No sponsorship opportunities found</p></div>)
      : (<div className="space-y-6">{Object.values(byTournament).map(({tournament,packages:pkgs})=>(
        <div key={tournament?.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-start gap-4">
            {tournament?.tournament_image && <img src={tournament.tournament_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0"><h2 className="text-lg font-bold text-white">{tournament?.name}</h2><div className="flex items-center gap-4 mt-1 text-sm text-gray-400"><span className="bg-white/10 px-2 py-0.5 rounded text-xs">{tournament?.game}</span>{tournament?.schedule&&<span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(tournament.schedule).toLocaleDateString('en-EG',{day:'numeric',month:'short',year:'numeric'})}</span>}</div></div>
          </div>
          <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pkgs.map(pkg=>(<div key={pkg.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col"><h3 className="text-white font-semibold text-sm mb-1">{pkg.title}</h3>{pkg.description&&<p className="text-gray-400 text-xs mb-3 line-clamp-2">{pkg.description}</p>}<div className="flex items-center gap-3 mb-3 text-xs text-gray-400">{pkg.expected_reach&&<span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{Number(pkg.expected_reach).toLocaleString()} reach</span>}</div><div className="mt-auto flex items-center justify-between"><span className="text-white font-bold">EGP {Number(pkg.price).toLocaleString()}</span><Link to={`/sponsor/radar/${tournament?.id}/package/${pkg.id}`} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">View Details</Link></div></div>))}
          </div>
        </div>
      ))}</div>)}
    </div>
  );
}
