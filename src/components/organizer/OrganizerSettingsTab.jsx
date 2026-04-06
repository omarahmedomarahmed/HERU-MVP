import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Settings, Upload, Check, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppSettings, OrganizerProfile } from '@/api/heruClient'
import { uploadFile } from '@/lib/uploadFile'


export default function OrganizerSettingsTab({ session, profile }) {
  const [showPassword, setShowPassword] = useState(false);
  const [brandData, setBrandData] = useState({
    brand_name: profile?.brand_name || '',
    brand_logo: profile?.brand_logo || '',
    primary_color: profile?.primary_color || '#ff1a1a',
    secondary_color: profile?.secondary_color || '#1a1a1a',
    bio: profile?.bio || '',
    location: profile?.location || '',
  });
  const [email, setEmail] = useState('');
  const [savedBrand, setSavedBrand] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [savedAuth, setSavedAuth] = useState(false);
  const [savingAuth, setSavingAuth] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const queryClient = useQueryClient();

  const { data: loginKey } = useQuery({
    queryKey: ['organizer-login-key', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      const keys = await AppSettings.list({ organizer_email: session?.email });
      return keys?.[0] || null;
    },
    enabled: !!profile?.id && !!session?.email,
  });

  React.useEffect(() => {
    if (loginKey?.organizer_email) {
      setEmail(loginKey.organizer_email);
    }
  }, [loginKey]);

  const saveBrandSettings = async () => {
    setSavingBrand(true);
    try {
      await OrganizerProfile.update(profile.id, brandData);
      setSavedBrand(true);
      queryClient.invalidateQueries(['organizer-profile-layout']);
      setTimeout(() => setSavedBrand(false), 3000);
    } finally {
      setSavingBrand(false);
    }
  };

  const saveAuthSettings = async () => {
    if (!email || !newKey) return;
    setSavingAuth(true);
    try {
      if (loginKey) {
        await AppSettings.update(loginKey.id, {
          organizer_email: email,
          login_key: newKey,
        });
      }
      setSavedAuth(true);
      queryClient.invalidateQueries(['organizer-login-key']);
      setNewKey('');
      setTimeout(() => setSavedAuth(false), 3000);
    } finally {
      setSavingAuth(false);
    }
  };

  const uploadLogo = async (file) => {
    const { file_url } = await uploadFile(file);
    setBrandData({ ...brandData, brand_logo: file_url });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-3xl font-black text-white">SETTINGS</h1>

      {/* Brand Branding */}
      <FloatingPanel className="p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-red-500" /> Brand Settings
        </h2>
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Brand Name</label>
            <Input
              value={brandData.brand_name}
              onChange={e => setBrandData({ ...brandData, brand_name: e.target.value })}
              placeholder="Your brand name"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Brand Logo</label>
            <div className="flex items-end gap-4">
              {brandData.brand_logo && (
                <img src={brandData.brand_logo} alt="" className="w-16 h-16 rounded-lg object-cover" />
              )}
              <label className="flex-1">
                <GlowButton variant="ghost" size="sm" as="span">
                  <Upload className="w-4 h-4" /> Upload Logo
                </GlowButton>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files[0] && uploadLogo(e.target.files[0])}
                />
              </label>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={brandData.primary_color}
                  onChange={e => setBrandData({ ...brandData, primary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={brandData.primary_color}
                  onChange={e => setBrandData({ ...brandData, primary_color: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white flex-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Secondary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={brandData.secondary_color}
                  onChange={e => setBrandData({ ...brandData, secondary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={brandData.secondary_color}
                  onChange={e => setBrandData({ ...brandData, secondary_color: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white flex-1"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Bio</label>
            <Textarea
              value={brandData.bio}
              onChange={e => setBrandData({ ...brandData, bio: e.target.value })}
              placeholder="Tell organizers about your brand..."
              className="bg-zinc-800 border-zinc-700 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Location</label>
            <Input
              value={brandData.location}
              onChange={e => setBrandData({ ...brandData, location: e.target.value })}
              placeholder="City, Country"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {savedBrand && (
            <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-3 text-green-400 flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" /> Brand settings saved successfully
            </div>
          )}

          <GlowButton onClick={saveBrandSettings} disabled={savingBrand} className="w-full">
            {savingBrand ? 'Saving...' : 'Save Brand Settings'}
          </GlowButton>
        </div>
      </FloatingPanel>

      {/* Authentication Settings */}
      <FloatingPanel className="p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-500" /> Authentication Settings
        </h2>
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Email (for login)</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="organizer@example.com"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-gray-500 mt-2">This email will be used for future login attempts</p>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-2">Login Key</label>
            <div className="relative">
              <Input
                type={showNewKey ? "text" : "password"}
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="Enter new login key..."
                className="bg-zinc-800 border-zinc-700 text-white pr-10"
              />
              <button
                onClick={() => setShowNewKey(!showNewKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Update your secure login key. Share this only with trusted individuals.</p>
          </div>

          {savedAuth && (
            <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-3 text-green-400 flex items-center gap-2 text-sm">
              <Check className="w-4 h-4" /> Auth settings updated successfully
            </div>
          )}

          <GlowButton 
            onClick={saveAuthSettings} 
            disabled={savingAuth || !email || !newKey}
            className="w-full"
          >
            {savingAuth ? 'Saving...' : 'Update Auth Settings'}
          </GlowButton>
        </div>
      </FloatingPanel>

      {/* Danger Zone */}
      <FloatingPanel className="p-6 border-red-500/20">
        <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
            <p className="text-white font-medium">Logout</p>
            <p className="text-gray-400 text-sm mb-3">Sign out from your organizer account</p>
            <GlowButton variant="secondary" size="sm">
              Logout
            </GlowButton>
          </div>
        </div>
      </FloatingPanel>
    </div>
  );
}