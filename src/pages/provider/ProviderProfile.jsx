import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

export default function ProviderProfile() {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({
    display_name: '', avatar: '', bio: '', portfolio_url: '',
    is_discord_server: false, discord_server_invite: '', discord_server_member_count: '',
    social_links: { twitter: '', instagram: '', youtube: '', twitch: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/providers/me', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.profile) {
          const p = d.profile;
          setForm({
            display_name: p.display_name || '',
            avatar: p.avatar || '',
            bio: p.bio || '',
            portfolio_url: p.portfolio_url || '',
            is_discord_server: p.is_discord_server || false,
            discord_server_invite: p.discord_server_invite || '',
            discord_server_member_count: p.discord_server_member_count || '',
            social_links: {
              twitter: p.social_links?.twitter || '',
              instagram: p.social_links?.instagram || '',
              youtube: p.social_links?.youtube || '',
              twitch: p.social_links?.twitch || '',
            }
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setSocial = (k) => (e) => setForm(f => ({ ...f, social_links: { ...f.social_links, [k]: e.target.value } }));
  const toggleDiscord = () => setForm(f => ({ ...f, is_discord_server: !f.is_discord_server }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.is_discord_server && Number(form.discord_server_member_count) < 1000) {
      setError('Discord server must have at least 1,000 members'); return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/providers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({
          ...form,
          discord_server_member_count: form.discord_server_member_count ? Number(form.discord_server_member_count) : null,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile & Portfolio</h1>
        <p className="text-gray-400 mt-1">How you appear to organizers browsing for services</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-5">
          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

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
              <label className="text-sm text-gray-400 mb-1.5 block">Avatar URL</label>
              <div className="flex gap-2">
                <Input value={form.avatar} onChange={set('avatar')} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1" />
                {form.avatar && <img src={form.avatar} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 flex-shrink-0" onError={e => e.target.style.display='none'} />}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={4}
              placeholder="Tell organizers about your experience, style, and what makes you stand out..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Portfolio / Website URL</label>
            <Input value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://behance.net/you or yourwebsite.com" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
          </div>
        </div>

        {/* Social links */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-white font-semibold">Social Links</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'twitter', label: 'X / Twitter', placeholder: '@handle' },
              { key: 'instagram', label: 'Instagram', placeholder: '@handle' },
              { key: 'youtube', label: 'YouTube', placeholder: 'Channel URL' },
              { key: 'twitch', label: 'Twitch', placeholder: 'Channel URL' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm text-gray-400 mb-1.5 block">{label}</label>
                <Input value={form.social_links[key]} onChange={setSocial(key)} placeholder={placeholder} className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Discord server toggle */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold">Discord Server Listing</h2>
              <p className="text-gray-500 text-xs mt-0.5">List your Discord server as a marketable marketing channel for tournaments</p>
            </div>
            <button
              type="button"
              onClick={toggleDiscord}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.is_discord_server ? 'bg-emerald-600' : 'bg-white/20'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_discord_server ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {form.is_discord_server && (
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Invite Link *</label>
                <Input value={form.discord_server_invite} onChange={set('discord_server_invite')} placeholder="discord.gg/yourserver" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Member Count * (min 1,000)</label>
                <Input type="number" value={form.discord_server_member_count} onChange={set('discord_server_member_count')} placeholder="1000" min="1000" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
              </div>
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-3">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{userProfile?.email || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Role</span>
              <span className="text-emerald-400">Service Provider</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
