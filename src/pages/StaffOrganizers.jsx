import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, Shield, CheckCircle, XCircle, MapPin, Star, Eye, Trophy, Users, Save,
} from 'lucide-react';
import { OrganizerProfile, Tournament } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

export default function StaffOrganizers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: organizers = [], isLoading } = useQuery({
    queryKey: ['staff-organizers'],
    queryFn: () => OrganizerProfile.list(),
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['staff-organizer-tournaments'],
    queryFn: () => Tournament.list(),
  });

  const toggleVerifiedMutation = useMutation({
    mutationFn: ({ id, is_verified }) => OrganizerProfile.update(id, { is_verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-organizers'] });
      if (selected) setSelected(s => ({ ...s, is_verified: !s.is_verified }));
    },
  });

  const filtered = useMemo(() => {
    return organizers.filter(o => {
      const matchSearch = !search ||
        o.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
        o.organizer_email?.toLowerCase().includes(search.toLowerCase());
      const matchVerified = verifiedFilter === 'all' ||
        (verifiedFilter === 'verified' ? o.is_verified : !o.is_verified);
      return matchSearch && matchVerified;
    });
  }, [organizers, search, verifiedFilter]);

  const getOrgTournamentCount = (org) =>
    tournaments.filter(t => t.organizer_id === org.user_id || t.main_organizer_id === org.user_id).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            All <span className="text-red-400">Organizers</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">{organizers.length} total organizers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Total</span>
          </div>
          <p className="text-xl font-bold text-white">{organizers.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Verified</span>
          </div>
          <p className="text-xl font-bold text-green-400">{organizers.filter(o => o.is_verified).length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-gray-400">Unverified</span>
          </div>
          <p className="text-xl font-bold text-amber-400">{organizers.filter(o => !o.is_verified).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by brand name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'verified', 'unverified'].map(v => (
              <button
                key={v}
                onClick={() => setVerifiedFilter(v)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  verifiedFilter === v ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-gray-400 font-medium px-5 py-3">Logo</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Brand Name</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Email</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Location</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Verified</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Tournaments</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Rating</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-500">No organizers found</td></tr>
              ) : filtered.map(org => (
                <tr key={org.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {org.brand_logo
                        ? <img src={org.brand_logo} className="w-full h-full object-cover" alt="" />
                        : <Shield className="w-5 h-5 text-zinc-600" />
                      }
                    </div>
                  </td>
                  <td className="px-5 py-3 text-white font-medium">{org.brand_name || 'Unnamed'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{org.organizer_email || '--'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {org.location ? (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{org.location}</span>
                    ) : '--'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {org.is_verified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">--</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center text-gray-300">{org.total_tournaments_organized || getOrgTournamentCount(org)}</td>
                  <td className="px-5 py-3 text-center">
                    {org.rating ? (
                      <span className="flex items-center justify-center gap-1 text-yellow-400 text-xs">
                        <Star className="w-3 h-3 fill-yellow-400" />{org.rating}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">--</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelected(org)}
                        className="text-red-400 hover:text-red-300"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleVerifiedMutation.mutate({ id: org.id, is_verified: !org.is_verified })}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          org.is_verified
                            ? 'text-red-400 hover:bg-red-500/20'
                            : 'text-green-400 hover:bg-green-500/20'
                        }`}
                        title={org.is_verified ? 'Remove verification' : 'Verify organizer'}
                      >
                        {org.is_verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <OrganizerDetailModal
          organizer={selected}
          onClose={() => setSelected(null)}
          getOrgTournamentCount={getOrgTournamentCount}
          toggleVerifiedMutation={toggleVerifiedMutation}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Organizer Detail Modal with editable fields
// ---------------------------------------------------------------------------

function OrganizerDetailModal({ organizer, onClose, getOrgTournamentCount, toggleVerifiedMutation, queryClient }) {
  const [form, setForm] = useState({
    brand_name: organizer.brand_name || '',
    description: organizer.description || '',
    bio: organizer.bio || '',
    location: organizer.location || '',
    primary_color: organizer.primary_color || '#ff1a1a',
    secondary_color: organizer.secondary_color || '#0a0a0a',
    featured_games: (organizer.featured_games || []).join(', '),
    social_links: JSON.stringify(organizer.social_links || {}, null, 2),
  });
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

  const updateMutation = useMutation({
    mutationFn: (data) => OrganizerProfile.update(organizer.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-organizers'] });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    },
    onError: () => {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    },
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    let socialLinks = {};
    try {
      socialLinks = JSON.parse(form.social_links);
    } catch {
      socialLinks = organizer.social_links || {};
    }

    const payload = {
      brand_name: form.brand_name,
      description: form.description,
      bio: form.bio,
      location: form.location,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      featured_games: form.featured_games.split(',').map(g => g.trim()).filter(Boolean),
      social_links: socialLinks,
    };

    updateMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
              {organizer.brand_logo
                ? <img src={organizer.brand_logo} className="w-full h-full object-cover" alt="" />
                : <Shield className="w-6 h-6 text-zinc-600" />
              }
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{organizer.brand_name}</h2>
              {organizer.is_verified && (
                <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded">Verified</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>

        {/* Read-only info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Email</p>
            <p className="text-white">{organizer.organizer_email || '--'}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Rating</p>
            <p className="text-white">{organizer.rating || '--'}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-gray-500 text-xs">Tournaments</p>
            <p className="text-white">{organizer.total_tournaments_organized || getOrgTournamentCount(organizer)}</p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="border-t border-zinc-800 pt-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Edit Profile</h3>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Brand Name</label>
            <input
              value={form.brand_name}
              onChange={e => handleChange('brand_name', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => handleChange('bio', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Location</label>
            <input
              value={form.location}
              onChange={e => handleChange('location', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primary_color}
                  onChange={e => handleChange('primary_color', e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                />
                <input
                  value={form.primary_color}
                  onChange={e => handleChange('primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondary_color}
                  onChange={e => handleChange('secondary_color', e.target.value)}
                  className="w-8 h-8 rounded border border-zinc-700 bg-zinc-800 cursor-pointer"
                />
                <input
                  value={form.secondary_color}
                  onChange={e => handleChange('secondary_color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Featured Games (comma-separated)</label>
            <input
              value={form.featured_games}
              onChange={e => handleChange('featured_games', e.target.value)}
              placeholder="Valorant, League of Legends, CS2"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Social Links (JSON)</label>
            <textarea
              value={form.social_links}
              onChange={e => handleChange('social_links', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Save button + status */}
          <div className="flex items-center justify-between pt-2">
            {saveStatus === 'success' && (
              <p className="text-xs text-green-400">Profile saved successfully.</p>
            )}
            {saveStatus === 'error' && (
              <p className="text-xs text-red-400">Failed to save profile.</p>
            )}
            {!saveStatus && <span />}
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Verification toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          <p className="text-gray-400 text-sm">Verification</p>
          <button
            onClick={() => toggleVerifiedMutation.mutate({ id: organizer.id, is_verified: !organizer.is_verified })}
            disabled={toggleVerifiedMutation.isPending}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              organizer.is_verified
                ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {organizer.is_verified ? 'Remove Verification' : 'Verify Organizer'}
          </button>
        </div>
      </div>
    </div>
  );
}
