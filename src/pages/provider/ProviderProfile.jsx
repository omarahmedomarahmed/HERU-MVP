import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2, ExternalLink, Copy } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const PROVIDER_TYPES = ['general','coach','influencer'];
const CATEGORIES = ['Branding','Production','Talent','Venue','Marketing','Coaching','Influencer'];

export default function ProviderProfile() {
  const { userProfile } = useAuth();
  const [provider, setProvider] = useState(null);
  const [form, setForm] = useState({
    display_name: '', avatar: '', bio: '', slug: '',
    provider_type: 'general', categories: [],
    social_links: { twitter: '', instagram: '', youtube: '', twitch: '' },
    coach_games: [], coach_rank: '', coach_availability: '', hourly_rate: '',
    influencer_platforms: [], audience_size: '', avg_views_per_post: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/providers/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r => r.json())
      .then(d => {
        if (d.provider) {
          const p = d.provider;
          setProvider(p);
          setForm({
            display_name: p.display_name || '',
            avatar: p.avatar || '',
            bio: p.bio || '',
            slug: p.slug || '',
            provider_type: p.provider_type || 'general',
            categories: p.categories || [],
            social_links: {
              twitter: p.social_links?.twitter || '',
              instagram: p.social_links?.instagram || '',
              youtube: p.social_links?.youtube || '',
              twitch: p.social_links?.twitch || '',
            },
            coach_games: p.coach_games || [],
            coach_rank: p.coach_rank || '',
            coach_availability: p.coach_availability || '',
            hourly_rate: p.hourly_rate || '',
            influencer_platforms: p.influencer_platforms || [],
            audience_size: p.audience_size || '',
            avg_views_per_post: p.avg_views_per_post || '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setSocial = (k) => (e) => setForm(f => ({ ...f, social_links: { ...f.social_links, [k]: e.target.value } }));
  const toggleCategory = (cat) => setForm(f => ({
    ...f, categories: f.categories.includes(cat)
      ? f.categories.filter(c => c !== cat)
      : [...f.categories, cat]
  }));

  const publicUrl = form.slug ? `${window.location.origin}/providers/${form.slug}` : (provider?.id ? `${window.location.origin}/providers/${provider.id}` : '');

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {
        display_name: form.display_name,
        avatar: form.avatar,
        bio: form.bio,
        slug: form.slug,
        provider_type: form.provider_type,
        categories: form.categories,
        social_links: form.social_links,
      };
      if (form.provider_type === 'coach') {
        payload.coach_games = form.coach_games;
        payload.coach_rank = form.coach_rank;
        payload.coach_availability = form.coach_availability;
        payload.hourly_rate = form.hourly_rate ? Number(form.hourly_rate) : null;
      }
      if (form.provider_type === 'influencer') {
        payload.influencer_platforms = form.influencer_platforms;
        payload.audience_size = form.audience_size ? Number(form.audience_size) : null;
        payload.avg_views_per_post = form.avg_views_per_post ? Number(form.avg_views_per_post) : null;
      }
      const res = await fetch('/api/providers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      if (data.provider) setProvider(data.provider);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">How you appear to organizers browsing for services</p>
      </div>

      {/* Public profile link */}
      {publicUrl && (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
          <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-0.5">Your public profile link</p>
            <p className="text-cyan-300 text-sm font-mono truncate">{publicUrl}</p>
          </div>
          <button type="button" onClick={copyPublicUrl} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors flex-shrink-0">
            <Copy className="w-3 h-3" />{copied ? 'Copied!' : 'Copy'}
          </button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors flex-shrink-0">View</a>
        </div>
      )}

      {error && <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5"><AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>}
      {success && <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-5"><CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" /><p className="text-green-400 text-sm">{success}</p></div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identity */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Display Name *</label>
              <Input value={form.display_name} onChange={set('display_name')} placeholder="Studio or brand name" required className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Public URL Slug</label>
              <div className="flex items-center gap-1">
                <span className="text-gray-500 text-sm">/providers/</span>
                <Input value={form.slug} onChange={set('slug')} placeholder="your-name" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Avatar URL</label>
            <div className="flex gap-2">
              <Input value={form.avatar} onChange={set('avatar')} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1" />
              {form.avatar && <img src={form.avatar} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" onError={e => e.target.style.display='none'} />}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Bio</label>
            <textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Tell organizers about your experience..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Provider Type</label>
            <div className="flex gap-2">
              {PROVIDER_TYPES.map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, provider_type: t }))}
                  className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${form.provider_type === t ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/15'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Categories (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${form.categories.includes(cat) ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/15'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Coach-specific */}
        {form.provider_type === 'coach' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Coach Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Rank / Level</label>
                <Input value={form.coach_rank} onChange={set('coach_rank')} placeholder="Diamond / Pro" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Hourly Rate (EGP)</label>
                <Input type="number" value={form.hourly_rate} onChange={set('hourly_rate')} placeholder="500" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Availability</label>
              <Input value={form.coach_availability} onChange={set('coach_availability')} placeholder="Weekdays 6pm-10pm, Weekends anytime" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
          </div>
        )}

        {/* Influencer-specific */}
        {form.provider_type === 'influencer' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            <h2 className="text-white font-semibold">Influencer Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Total Audience Size</label>
                <Input type="number" value={form.audience_size} onChange={set('audience_size')} placeholder="50000" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Avg Views / Post</label>
                <Input type="number" value={form.avg_views_per_post} onChange={set('avg_views_per_post')} placeholder="5000" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
            </div>
          </div>
        )}

        {/* Social links */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['twitter','X / Twitter','@handle'],['instagram','Instagram','@handle'],['youtube','YouTube','Channel URL'],['twitch','Twitch','Channel URL']].map(([key, label, ph]) => (
              <div key={key}>
                <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
                <Input value={form.social_links[key]} onChange={setSocial(key)} placeholder={ph} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Account info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-3">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{userProfile?.email || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Role</span><span className="text-cyan-400">Service Provider</span></div>
            <div className="flex justify-between">
              <span className="text-gray-400">Approval Status</span>
              <span className={provider?.approval_status === 'approved' ? 'text-green-400' : provider?.approval_status === 'rejected' ? 'text-red-400' : 'text-yellow-400'}>
                {provider?.approval_status || 'pending'}
              </span>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
