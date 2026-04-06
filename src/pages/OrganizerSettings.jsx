import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizerProfile } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import { uploadFile } from '@/lib/uploadFile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Save,
  Upload,
  User,
  Palette,
  MapPin,
  Globe,
  Gamepad2,
  Check,
  Loader2,
  Image as ImageIcon,
  X,
} from 'lucide-react';

const AVAILABLE_GAMES = [
  'Valorant',
  'CS2',
  'League of Legends',
  'Dota 2',
  'Fortnite',
  'Rocket League',
  'Overwatch 2',
  'Apex Legends',
  'PUBG',
  'Call of Duty',
  'FIFA / EA FC',
  'Rainbow Six Siege',
  'Mobile Legends',
  'Free Fire',
  'Tekken 8',
  'Street Fighter 6',
];

export default function OrganizerSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState({
    brand_name: '',
    description: '',
    bio: '',
    brand_logo: '',
    primary_color: '#ff1a1a',
    secondary_color: '#0a0a0a',
    full_name: '',
    contact_number: '',
    location: '',
    website: '',
    social_links: {
      facebook: '',
      instagram: '',
      twitter: '',
      discord: '',
    },
    featured_games: [],
  });

  // ---- Load profile ----
  const { data: profile, isLoading } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => OrganizerProfile.me(),
  });

  useEffect(() => {
    if (profile) {
      setForm({
        brand_name: profile.brand_name || '',
        description: profile.description || '',
        bio: profile.bio || '',
        brand_logo: profile.brand_logo || '',
        primary_color: profile.primary_color || '#ff1a1a',
        secondary_color: profile.secondary_color || '#0a0a0a',
        full_name: profile.full_name || '',
        contact_number: profile.contact_number || '',
        location: profile.location || '',
        website: profile.website || '',
        social_links: {
          facebook: profile.social_links?.facebook || '',
          instagram: profile.social_links?.instagram || '',
          twitter: profile.social_links?.twitter || '',
          discord: profile.social_links?.discord || '',
        },
        featured_games: profile.featured_games || [],
      });
    }
  }, [profile]);

  // ---- Save mutation ----
  const saveMutation = useMutation({
    mutationFn: (data) => OrganizerProfile.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-profile-me'] });
      queryClient.invalidateQueries({ queryKey: ['organizer-profile-layout'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // ---- Helpers ----
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setSocial = (key, value) =>
    setForm((prev) => ({
      ...prev,
      social_links: { ...prev.social_links, [key]: value },
    }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      set('brand_logo', file_url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const toggleGame = (game) => {
    setForm((prev) => {
      const current = prev.featured_games;
      const next = current.includes(game)
        ? current.filter((g) => g !== game)
        : [...current, game];
      return { ...prev, featured_games: next };
    });
  };

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-gray-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">My Profile</h1>
          <p className="text-gray-400 mt-1">Manage your organizer brand and contact info</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Success toast */}
      {saveSuccess && (
        <div className="mb-6 bg-green-500/20 border border-green-500/40 rounded-xl p-3 text-green-400 flex items-center gap-2 text-sm">
          <Check className="w-4 h-4" /> Profile updated successfully
        </div>
      )}

      {/* Error toast */}
      {saveMutation.isError && (
        <div className="mb-6 bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-red-400 flex items-center gap-2 text-sm">
          <X className="w-4 h-4" /> {saveMutation.error?.message || 'Failed to save'}
        </div>
      )}

      <div className="space-y-6">
        {/* ───────────── Brand Info ───────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-red-500" />
            Brand Info
          </h2>
          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Brand Name</label>
              <Input
                value={form.brand_name}
                onChange={(e) => set('brand_name', e.target.value)}
                placeholder="Your organization name"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe your organization..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Short bio shown on your public profile..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* ───────────── Brand Logo ───────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-500" />
            Brand Logo
          </h2>
          <div className="flex items-center gap-5">
            {form.brand_logo ? (
              <img
                src={form.brand_logo}
                alt="Brand logo"
                className="w-20 h-20 rounded-xl object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-zinc-600" />
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </section>

        {/* ───────────── Brand Colors ───────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Palette className="w-5 h-5 text-red-500" />
            Brand Colors
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={(e) => set('primary_color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <Input
                  value={form.primary_color}
                  onChange={(e) => set('primary_color', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white flex-1 font-mono"
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={(e) => set('secondary_color', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
                <Input
                  value={form.secondary_color}
                  onChange={(e) => set('secondary_color', e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white flex-1 font-mono"
                  maxLength={7}
                />
              </div>
            </div>
          </div>
          {/* Color preview */}
          <div className="mt-4 flex gap-3">
            <div
              className="w-16 h-8 rounded border border-zinc-700"
              style={{ backgroundColor: form.primary_color }}
            />
            <div
              className="w-16 h-8 rounded border border-zinc-700"
              style={{ backgroundColor: form.secondary_color }}
            />
          </div>
        </section>

        {/* ───────────── Contact Info ───────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            Contact Info
          </h2>
          <div className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Full Name</label>
                <Input
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  placeholder="Your full name"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Email</label>
                <Input
                  value={user?.email || ''}
                  readOnly
                  className="bg-zinc-800/50 border-zinc-700 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Contact Number</label>
                <Input
                  value={form.contact_number}
                  onChange={(e) => set('contact_number', e.target.value)}
                  placeholder="+20 1xx xxx xxxx"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="City, Country"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Website</label>
              <Input
                value={form.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://yoursite.com"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </section>

        {/* ───────────── Social Links ───────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Globe className="w-5 h-5 text-red-500" />
            Social Links
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Facebook</label>
              <Input
                value={form.social_links.facebook}
                onChange={(e) => setSocial('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Instagram</label>
              <Input
                value={form.social_links.instagram}
                onChange={(e) => setSocial('instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Twitter / X</label>
              <Input
                value={form.social_links.twitter}
                onChange={(e) => setSocial('twitter', e.target.value)}
                placeholder="https://x.com/yourhandle"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Discord</label>
              <Input
                value={form.social_links.discord}
                onChange={(e) => setSocial('discord', e.target.value)}
                placeholder="https://discord.gg/yourserver"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
        </section>

        {/* ───────────── Featured Games ───────────── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-red-500" />
            Featured Games
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Select the games your organization focuses on
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GAMES.map((game) => {
              const selected = form.featured_games.includes(game);
              return (
                <button
                  key={game}
                  type="button"
                  onClick={() => toggleGame(game)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-red-600/20 border-red-500 text-red-400'
                      : 'bg-zinc-800 border-zinc-700 text-gray-400 hover:border-zinc-600 hover:text-gray-300'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {game}
                </button>
              );
            })}
          </div>
        </section>

        {/* Bottom save button */}
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>
    </div>
  );
}
