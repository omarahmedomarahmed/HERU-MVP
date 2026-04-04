import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrganizerLayout from '@/components/layouts/OrganizerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, User, Palette, Upload, Key, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { getOrganizerSession } from '@/lib/auth-guards';
import { AppSettings, OrganizerProfile } from '@/api/heruClient'


export default function OrganizerSettings() {
  const [session, setSession] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [keySuccess, setKeySuccess] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const s = getOrganizerSession();
    if (!s) { navigate('/auth/organizer/login'); return; }
    setSession(s);
  }, []);

  const user = session ? { id: session.userId, email: session.email } : null;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['organizer-profile', session?.profileId],
    queryFn: async () => {
      if (!session?.profileId) return null;
      const profiles = await OrganizerProfile.list();
      return profiles.find(p => p.id === session.profileId) || null;
    },
    enabled: !!session?.profileId,
  });

  const { data: loginKey } = useQuery({
    queryKey: ['organizer-login-key', session?.keyId],
    queryFn: async () => {
      if (!session?.keyId) return null;
      const keys = await AppSettings.list();
      return keys.find(k => k.id === session.keyId) || null;
    },
    enabled: !!session?.keyId,
  });

  const [form, setForm] = useState({
    brand_name: '',
    brand_logo: '',
    description: '',
    primary_color: '#ff1a1a',
    secondary_color: '#0a0a0a'
  });

  useEffect(() => {
    if (profile) {
      setForm({
        brand_name: profile.brand_name || '',
        brand_logo: profile.brand_logo || '',
        description: profile.description || '',
        primary_color: profile.primary_color || '#ff1a1a',
        secondary_color: profile.secondary_color || '#0a0a0a'
      });
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      return OrganizerProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['organizer-profile', session?.profileId]);
    }
  });

  const updateKeyMutation = useMutation({
    mutationFn: async (key) => {
      if (!loginKey?.id) throw new Error('No login key found');
      return AppSettings.update(loginKey.id, { login_key: key });
    },
    onSuccess: () => {
      setKeySuccess('Login key updated successfully!');
      setNewKey('');
      queryClient.invalidateQueries(['organizer-login-key', session?.keyId]);
      setTimeout(() => setKeySuccess(''), 3000);
    }
  });

  if (isLoading) {
    return (
      <OrganizerLayout user={user} profile={profile}>
        <div className="flex items-center justify-center h-96">
          <Settings className="w-12 h-12 text-gray-600 animate-spin" />
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout user={user} profile={profile}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            <span className="text-red-500">SETTINGS</span>
          </h1>
          <p className="text-gray-400">Manage your organizer profile and brand</p>
        </div>

        <FloatingPanel className="p-6 mb-6" glowBorder>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            Brand Information
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Brand Name</label>
              <Input
                value={form.brand_name}
                onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                placeholder="Your organization name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Brand Logo URL</label>
              <div className="flex gap-4 items-start">
                {form.brand_logo && (
                  <img src={form.brand_logo} alt="Logo" className="w-20 h-20 rounded-xl object-cover" />
                )}
                <Input
                  value={form.brand_logo}
                  onChange={(e) => setForm({ ...form, brand_logo: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Tell us about your organization..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={4}
              />
            </div>
          </div>
        </FloatingPanel>

        <FloatingPanel className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Palette className="w-5 h-5 text-red-500" />
            Brand Colors
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <Input
                  value={form.primary_color}
                  onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer"
                />
                <Input
                  value={form.secondary_color}
                  onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </div>
        </FloatingPanel>

        <GlowButton 
          className="w-full"
          onClick={() => updateProfileMutation.mutate(form)}
        >
          <Save className="w-4 h-4" /> Save Changes
        </GlowButton>

        {/* Login Key Management */}
        <FloatingPanel className="p-6 mt-6" glowBorder>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-red-500" />
            Login Key Management
          </h2>
          <p className="text-gray-500 text-sm mb-4">Update your staff-issued login key. You'll need to use the new key on next login.</p>
          
          {loginKey && (
            <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Current login key:</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-mono text-sm flex-1">
                  {showKey ? loginKey.login_key : '•'.repeat(Math.min(loginKey.login_key?.length || 8, 24))}
                </p>
                <button onClick={() => setShowKey(!showKey)} className="text-gray-400 hover:text-white">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter new login key..."
              className="bg-zinc-800 border-zinc-700 text-white font-mono"
            />
            {keySuccess && <p className="text-green-400 text-sm">{keySuccess}</p>}
            <GlowButton
              variant="secondary"
              className="w-full"
              onClick={() => newKey.trim() && updateKeyMutation.mutate(newKey.trim())}
              disabled={!newKey.trim()}
            >
              <RefreshCw className="w-4 h-4" /> Update Login Key
            </GlowButton>
          </div>
        </FloatingPanel>
      </div>
    </OrganizerLayout>
  );
}