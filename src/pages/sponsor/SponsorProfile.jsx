import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Building2, Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const INDUSTRIES = ['Technology','Gaming & Esports','Telecommunications','Food & Beverage','Automotive','Finance & Banking','Retail & E-commerce','Entertainment & Media','Sports & Fitness','Education','Healthcare','Other'];

export default function SponsorProfile() {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({ brand_name:'',brand_logo:'',industry:'',description:'',website:'',location:'',social_links:{twitter:'',instagram:'',linkedin:'',youtube:''} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/sponsors/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r=>r.json()).then(d => { if (d.sponsor) setForm({ brand_name:d.sponsor.brand_name||'',brand_logo:d.sponsor.brand_logo||'',industry:d.sponsor.industry||'',description:d.sponsor.description||'',website:d.sponsor.website||'',location:d.sponsor.location||'',social_links:{twitter:d.sponsor.social_links?.twitter||'',instagram:d.sponsor.social_links?.instagram||'',linkedin:d.sponsor.social_links?.linkedin||'',youtube:d.sponsor.social_links?.youtube||''} }); }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const set = (k) => (e) => setForm(f=>({...f,[k]:e.target.value}));
  const setSocial = (k) => (e) => setForm(f=>({...f,social_links:{...f.social_links,[k]:e.target.value}}));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/sponsors/me', { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${getAuthToken()}`}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||'Save failed');
      setSuccess('Profile updated successfully');
    } catch(err) { setError(err.message); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">Brand Profile</h1><p className="text-gray-400 mt-1">How your brand appears to organizers and on sponsorship packages</p></div>
      {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>}
      {success && <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-5"><CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><p className="text-green-400 text-sm">{success}</p></div>}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-400" />Brand Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="text-sm text-gray-400 mb-1.5 block">Brand Name *</label><Input value={form.brand_name} onChange={set('brand_name')} placeholder="Your brand name" required className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div><div><label className="text-sm text-gray-400 mb-1.5 block">Industry</label><select value={form.industry} onChange={set('industry')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"><option value="">Select industry</option>{INDUSTRIES.map(i=><option key={i} value={i} className="bg-gray-900">{i}</option>)}</select></div></div>
          <div><label className="text-sm text-gray-400 mb-1.5 block">Brand Logo URL</label><div className="flex gap-2"><Input value={form.brand_logo} onChange={set('brand_logo')} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1" />{form.brand_logo&&<img src={form.brand_logo} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" onError={e=>e.target.style.display='none'} />}</div></div>
          <div><label className="text-sm text-gray-400 mb-1.5 block">Brand Description</label><textarea value={form.description} onChange={set('description')} rows={3} placeholder="Tell organizers about your brand..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 resize-none" /></div>
          <div className="grid sm:grid-cols-2 gap-4"><div><label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-1"><Globe className="w-3.5 h-3.5" />Website</label><Input value={form.website} onChange={set('website')} placeholder="https://yourbrand.com" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div><div><label className="text-sm text-gray-400 mb-1.5 block">Location</label><Input value={form.location} onChange={set('location')} placeholder="Cairo, Egypt" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div></div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">{[{key:'twitter',label:'X / Twitter',placeholder:'@handle'},{key:'instagram',label:'Instagram',placeholder:'@handle'},{key:'linkedin',label:'LinkedIn',placeholder:'Company URL'},{key:'youtube',label:'YouTube',placeholder:'Channel URL'}].map(({key,label,placeholder})=>(<div key={key}><label className="text-sm text-gray-400 mb-1.5 block">{label}</label><Input value={form.social_links[key]} onChange={setSocial(key)} placeholder={placeholder} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div>))}</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6"><h2 className="text-white font-semibold mb-3">Account</h2><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{userProfile?.email||'—'}</span></div><div className="flex justify-between"><span className="text-gray-400">Role</span><span className="text-blue-400">Sponsor</span></div></div></div>
        <button type="submit" disabled={saving} className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">{saving?<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>:'Save Profile'}</button>
      </form>
    </div>
  );
}
