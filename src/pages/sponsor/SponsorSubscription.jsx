import React, { useEffect, useState } from 'react';
import { CheckCircle, Zap, Building2, AlertCircle, Loader2 } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const PLANS = {
  pro: { name:'Pro', icon:Zap, color:'blue', monthly:299, annual:2990, features:['Full Sponsorship Radar access','Analytics dashboard','Priority radar listing','Brand badge on packages','Email support'] },
  enterprise: { name:'Enterprise', icon:Building2, color:'purple', monthly:799, annual:7990, features:['Everything in Pro','Internal Tournament Builder','HERU Consultant booking','Managed Services access','Dedicated account manager','Custom reporting'] },
};

export default function SponsorSubscription() {
  const [billing, setBilling] = useState('monthly');
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/subscriptions/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r => r.json()).then(d => setCurrent(d.subscription||null)).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    setPurchasing(plan); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/subscriptions', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${getAuthToken()}`}, body:JSON.stringify({plan,billing_cycle:billing}) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Subscription failed');
      setCurrent(data.subscription); setSuccess(`Successfully subscribed to ${PLANS[plan].name}!`);
    } catch(err) { setError(err.message); } finally { setPurchasing(''); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription?')) return;
    setCancelling(true); setError('');
    try {
      const res = await fetch('/api/subscriptions/cancel', { method:'PUT', headers:{'Authorization':`Bearer ${getAuthToken()}`} });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Cancellation failed');
      setCurrent(null); setSuccess('Subscription cancelled.');
    } catch(err) { setError(err.message); } finally { setCancelling(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">Subscription</h1><p className="text-gray-400 mt-1">Unlock advanced sponsorship tools and platform features</p></div>
      {!loading && current && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /><div><p className="text-white font-medium">Active: {PLANS[current.plan]?.name||current.plan} ({current.billing_cycle})</p>{current.renewal_date&&<p className="text-gray-400 text-xs mt-0.5">Renews {new Date(current.renewal_date).toLocaleDateString('en-EG',{day:'numeric',month:'long',year:'numeric'})}</p>}</div></div>
          <button onClick={handleCancel} disabled={cancelling} className="text-xs text-red-400 hover:text-red-300 transition-colors">{cancelling?'Cancelling...':'Cancel plan'}</button>
        </div>
      )}
      {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>}
      {success && <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-5"><CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><p className="text-green-400 text-sm">{success}</p></div>}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm ${billing==='monthly'?'text-white':'text-gray-500'}`}>Monthly</span>
        <button onClick={()=>setBilling(b=>b==='monthly'?'annual':'monthly')} className={`relative w-12 h-6 rounded-full transition-colors ${billing==='annual'?'bg-blue-600':'bg-white/20'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billing==='annual'?'left-7':'left-1'}`} /></button>
        <span className={`text-sm ${billing==='annual'?'text-white':'text-gray-500'}`}>Annual <span className="text-green-400 text-xs ml-1">Save ~17%</span></span>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {Object.entries(PLANS).map(([key,plan]) => {
          const Icon = plan.icon;
          const price = billing==='annual'?plan.annual:plan.monthly;
          const isActive = current?.plan===key&&current?.status==='active';
          const colorMap = {blue:'border-blue-500/40 bg-blue-500/10',purple:'border-purple-500/40 bg-purple-500/10'};
          const btnMap = {blue:'bg-blue-600 hover:bg-blue-700',purple:'bg-purple-600 hover:bg-purple-700'};
          const iconMap = {blue:'text-blue-400 bg-blue-500/20',purple:'text-purple-400 bg-purple-500/20'};
          return (
            <div key={key} className={`border rounded-xl p-6 ${isActive?colorMap[plan.color]:'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconMap[plan.color]}`}><Icon className="w-5 h-5" /></div><div><h3 className="text-white font-bold">{plan.name}</h3>{isActive&&<span className="text-xs text-green-400">Current plan</span>}</div></div>
              <div className="mb-5"><span className="text-3xl font-bold text-white">EGP {price.toLocaleString()}</span><span className="text-gray-400 text-sm ml-2">/{billing==='annual'?'year':'month'}</span>{billing==='annual'&&<p className="text-xs text-gray-500 mt-1">≈ EGP {Math.round(price/12).toLocaleString()} /month</p>}</div>
              <ul className="space-y-2 mb-6">{plan.features.map((f,i)=>(<li key={i} className="flex items-center gap-2 text-sm text-gray-300"><CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />{f}</li>))}</ul>
              <button onClick={()=>handleSubscribe(key)} disabled={!!purchasing||isActive} className={`w-full py-2.5 rounded-lg text-white font-medium transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2 ${btnMap[plan.color]}`}>
                {purchasing===key?<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>:isActive?'Current Plan':`Subscribe to ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl text-center"><p className="text-gray-400 text-sm"><span className="text-white font-medium">Free plan</span> — Browse radar and commit to packages at no cost. Upgrade for analytics and premium features.</p></div>
    </div>
  );
}
