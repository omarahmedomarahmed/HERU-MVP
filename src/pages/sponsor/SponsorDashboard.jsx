import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Star, DollarSign, Eye, ArrowRight, AlertCircle } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

export default function SponsorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sponsors/me/dashboard', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const sponsorships = data?.sponsorships || [];
  const totalSpend = data?.total_spend || 0;
  const activeCount = data?.active_count || 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Sponsor Dashboard</h1>
        <p className="text-gray-400 mt-1">Track your sponsorships and brand performance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center"><Star className="w-4 h-4 text-blue-400" /></div><span className="text-gray-400 text-sm">Active Sponsorships</span></div>
          <p className="text-3xl font-bold text-white">{activeCount}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center"><DollarSign className="w-4 h-4 text-green-400" /></div><span className="text-gray-400 text-sm">Total Spend</span></div>
          <p className="text-3xl font-bold text-white">EGP {totalSpend.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3"><div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center"><Eye className="w-4 h-4 text-purple-400" /></div><span className="text-gray-400 text-sm">All Sponsorships</span></div>
          <p className="text-3xl font-bold text-white">{sponsorships.length}</p>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-8 flex items-center justify-between">
        <div><h2 className="text-lg font-bold text-white mb-1">Browse Sponsorship Opportunities</h2><p className="text-gray-400 text-sm">Discover tournaments seeking sponsors across MENA</p></div>
        <Link to="/sponsor/radar" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex-shrink-0">Explore Radar <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold text-white">My Sponsorships</h2><Link to="/sponsor/sponsorships" className="text-blue-400 hover:text-blue-300 text-sm">View all →</Link></div>
        {loading ? (<div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>)
        : sponsorships.length === 0 ? (<div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center"><AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-400 mb-4">No sponsorships yet</p><Link to="/sponsor/radar" className="text-blue-400 hover:text-blue-300 text-sm">Browse opportunities →</Link></div>)
        : (<div className="space-y-3">{sponsorships.slice(0,5).map(s => (<div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"><div><p className="text-white font-medium text-sm">{s.sponsorship_packages?.title || 'Package'}</p><p className="text-gray-500 text-xs mt-0.5">EGP {Number(s.amount).toLocaleString()}</p></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.status==='active'||s.status==='paid'?'bg-green-500/20 text-green-400':s.status==='pending'?'bg-yellow-500/20 text-yellow-400':'bg-gray-500/20 text-gray-400'}`}>{s.status}</span></div>))}</div>)}
      </div>
    </div>
  );
}
