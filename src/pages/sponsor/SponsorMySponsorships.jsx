import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, DollarSign, AlertCircle } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const STATUS_STYLES = { pending:'bg-yellow-500/20 text-yellow-400', paid:'bg-blue-500/20 text-blue-400', active:'bg-green-500/20 text-green-400', completed:'bg-gray-500/20 text-gray-400', cancelled:'bg-red-500/20 text-red-400' };

export default function SponsorMySponsorships() {
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/sponsorships', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r => r.json()).then(d => setSponsorships(d.sponsorships || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? sponsorships : sponsorships.filter(s => s.status === filter);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">My Sponsorships</h1><p className="text-gray-400 mt-1">Track all your brand sponsorship commitments</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {['all','active','pending','completed'].map(s => {
          const count = s==='all'?sponsorships.length:sponsorships.filter(x=>x.status===s).length;
          return (<button key={s} onClick={()=>setFilter(s)} className={`p-3 rounded-xl border text-sm font-medium transition-all ${filter===s?'bg-blue-500/20 border-blue-500/40 text-blue-300':'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}><span className="block text-xl font-bold text-white">{count}</span><span className="capitalize">{s}</span></button>);
        })}
      </div>
      {loading ? (<div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>)
      : filtered.length===0 ? (<div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center"><Star className="w-10 h-10 text-gray-600 mx-auto mb-3" /><p className="text-gray-400 mb-4">{filter==='all'?'No sponsorships yet':`No ${filter} sponsorships`}</p><Link to="/sponsor/radar" className="text-blue-400 hover:text-blue-300 text-sm">Browse opportunities →</Link></div>)
      : (<div className="space-y-3">{filtered.map(s=>(<div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-5"><div className="flex items-start justify-between gap-4"><div className="flex-1 min-w-0"><p className="text-white font-semibold">{s.sponsorship_packages?.title||'Sponsorship Package'}</p><p className="text-gray-400 text-sm mt-0.5">{s.tournaments?.name||'Tournament'}{s.tournaments?.game&&<span className="ml-2 bg-white/10 px-1.5 py-0.5 rounded text-xs">{s.tournaments.game}</span>}</p><div className="flex items-center gap-4 mt-2 text-xs text-gray-500"><span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />EGP {Number(s.amount).toLocaleString()}</span>{s.created_at&&<span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(s.created_at).toLocaleDateString('en-EG',{day:'numeric',month:'short',year:'numeric'})}</span>}</div></div><span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[s.status]||'bg-gray-500/20 text-gray-400'}`}>{s.status}</span></div>{s.status==='pending'&&<div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-yellow-400"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />Payment pending — complete payment to activate your sponsorship</div>}</div>))}</div>)}
    </div>
  );
}
