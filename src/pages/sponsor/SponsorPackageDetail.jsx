import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Eye, TrendingUp, Users, Megaphone, MapPin, CheckCircle, DollarSign, AlertCircle, Loader2 } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

export default function SponsorPackageDetail() {
  const { tournament_id, package_id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/sponsorship-packages/${package_id}`)
      .then(r=>r.json()).then(d=>setPkg(d.package||null)).catch(()=>setError('Failed to load package')).finally(()=>setLoading(false));
  }, [package_id]);

  const handlePurchase = async () => {
    setPurchasing(true); setError('');
    try {
      const res = await fetch('/api/sponsorships', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${getAuthToken()}`}, body:JSON.stringify({package_id}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Purchase failed');
      setSuccess(true);
    } catch(err) { setError(err.message); } finally { setPurchasing(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>;
  if (!pkg) return <div className="text-center py-16 text-gray-500"><AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>Package not found</p></div>;

  const tournament = pkg.tournaments;

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={()=>navigate('/sponsor/radar')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors"><ArrowLeft className="w-4 h-4" />Back to Radar</button>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 flex items-start gap-4">
        {tournament?.tournament_image&&<img src={tournament.tournament_image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
        <div><p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Tournament</p><h2 className="text-xl font-bold text-white">{tournament?.name}</h2><div className="flex items-center gap-3 mt-1 text-sm text-gray-400"><span className="bg-white/10 px-2 py-0.5 rounded text-xs">{tournament?.game}</span>{tournament?.schedule&&<span>{new Date(tournament.schedule).toLocaleDateString('en-EG',{day:'numeric',month:'short',year:'numeric'})}</span>}</div></div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6"><div className="flex items-center gap-3 mb-2"><Package className="w-5 h-5 text-blue-400" /><h1 className="text-xl font-bold text-white">{pkg.title}</h1></div>{pkg.description&&<p className="text-gray-400 text-sm leading-relaxed">{pkg.description}</p>}</div>
          <div className="grid sm:grid-cols-3 gap-3">
            {pkg.expected_reach&&<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"><Eye className="w-5 h-5 text-blue-400 mx-auto mb-2" /><p className="text-white font-bold text-lg">{Number(pkg.expected_reach).toLocaleString()}</p><p className="text-gray-500 text-xs">Expected Reach</p></div>}
            {pkg.expected_impressions&&<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"><TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" /><p className="text-white font-bold text-lg">{Number(pkg.expected_impressions).toLocaleString()}</p><p className="text-gray-500 text-xs">Impressions</p></div>}
            {pkg.expected_views&&<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"><Users className="w-5 h-5 text-green-400 mx-auto mb-2" /><p className="text-white font-bold text-lg">{Number(pkg.expected_views).toLocaleString()}</p><p className="text-gray-500 text-xs">Expected Views</p></div>}
          </div>
          {pkg.deliverables?.length>0&&<div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-white font-semibold mb-4">What You Get</h3><ul className="space-y-2">{pkg.deliverables.map((d,i)=>(<li key={i} className="flex items-start gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />{typeof d==='string'?d:d.label||JSON.stringify(d)}</li>))}</ul></div>}
          {pkg.marketing_channels?.length>0&&<div className="bg-white/5 border border-white/10 rounded-xl p-6"><h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Megaphone className="w-4 h-4 text-blue-400" />Marketing Channels</h3><div className="flex flex-wrap gap-2">{pkg.marketing_channels.map((ch,i)=>(<span key={i} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs">{typeof ch==='string'?ch:ch.name||JSON.stringify(ch)}</span>))}</div></div>}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
            <h3 className="text-white font-semibold mb-2">Additional Details</h3>
            {pkg.social_posts_count>0&&<div className="flex items-center justify-between text-sm"><span className="text-gray-400">Social Posts</span><span className="text-white font-medium">{pkg.social_posts_count} posts</span></div>}
            {pkg.logo_placement&&<div className="flex items-center justify-between text-sm"><span className="text-gray-400">Logo Placement</span><span className="text-white font-medium">{pkg.logo_placement}</span></div>}
            <div className="flex items-center justify-between text-sm"><span className="text-gray-400">On-site Presence</span><span className={`font-medium ${pkg.on_site_presence?'text-green-400':'text-gray-500'}`}>{pkg.on_site_presence?'Included':'Not included'}</span></div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-sm">Package Price</span></div>
            <p className="text-3xl font-bold text-white mb-1">EGP {Number(pkg.price).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mb-6">+15% platform fee applied at checkout</p>
            {error&&<div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-4"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-xs">{error}</p></div>}
            {success ? (
              <div className="text-center py-4"><CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" /><p className="text-white font-semibold mb-1">Sponsorship committed!</p><p className="text-gray-400 text-xs mb-4">Check your sponsorships dashboard for payment details.</p><button onClick={()=>navigate('/sponsor/sponsorships')} className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">View My Sponsorships</button></div>
            ) : (
              <button onClick={handlePurchase} disabled={purchasing} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{purchasing?<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>:'Purchase Sponsorship Package'}</button>
            )}
            <p className="text-xs text-gray-600 text-center mt-3">Secure payment via Paymob · EGP only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
