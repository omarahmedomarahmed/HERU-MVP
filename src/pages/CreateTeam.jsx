import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Users, Plus, Check, ArrowLeft, UserPlus, Palette, Image, Upload, Loader2
} from 'lucide-react';
import { GamerProfile, Team } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { uploadFile } from '@/lib/uploadFile'


const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Apex Legends', 'Fortnite', 'Call of Duty'];

const COLOR_PRESETS = [
  { name: 'Red', primary: '#ff1a1a', secondary: '#0a0a0a' },
  { name: 'Blue', primary: '#2563eb', secondary: '#0a0a2e' },
  { name: 'Purple', primary: '#7c3aed', secondary: '#1a0a2e' },
  { name: 'Green', primary: '#16a34a', secondary: '#0a1a0a' },
  { name: 'Orange', primary: '#ea580c', secondary: '#1a0e0a' },
  { name: 'Cyan', primary: '#06b6d4', secondary: '#0a1a1e' },
  { name: 'Pink', primary: '#ec4899', secondary: '#1e0a1a' },
  { name: 'Gold', primary: '#eab308', secondary: '#1a1a0a' },
];

export default function CreateTeam() {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: basics, 2: branding, 3: invite
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    story: '',
    logo: '',
    banner: '',
    primary_color: '#ff1a1a',
    secondary_color: '#0a0a0a',
    games: [],
    is_recruiting: true,
    social_links: { twitter: '', instagram: '', discord: '' },
    contact_number: '',
  });
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [uploading, setUploading] = useState(null); // 'logo' | 'banner' | null
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ['my-friends', profile?.friends],
    queryFn: async () => {
      if (!profile?.friends?.length) return [];
      const profiles = await GamerProfile.list();
      return profiles.filter(p => profile.friends.includes(p.user_id));
    },
    enabled: !!profile?.friends?.length,
  });

  const toggleGame = (game) => {
    setTeamData(prev => ({
      ...prev,
      games: prev.games.includes(game)
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game]
    }));
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleImageUpload = async (file, field) => {
    if (!file) return;
    setUploading(field);
    try {
      const { file_url } = await uploadFile(file);
      setTeamData(prev => ({ ...prev, [field]: file_url }));
      toast({ title: 'Image uploaded!' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  };

  const createTeamMutation = useMutation({
    mutationFn: async () => {
      const team = await Team.create({
        name: teamData.name,
        description: teamData.description,
        story: teamData.story,
        logo: teamData.logo,
        leader_id: user.id,
        members: [user.id, ...selectedFriends],
        games: teamData.games,
        is_recruiting: teamData.is_recruiting,
        social_links: teamData.social_links,
        contact_number: teamData.contact_number,
        images: teamData.banner ? [teamData.banner] : [],
        join_requests: [],
        tournament_invites: [],
        tournament_history: []
      });

      // Update creator's profile (safely handle missing profile)
      try {
        const existingTeamIds = profile?.team_ids || [];
        await GamerProfile.updateMe({ team_ids: [...existingTeamIds, team.id] });
      } catch (e) {
        console.warn('Could not update profile team_ids:', e);
      }

      // Update invited friends' profiles
      for (const friendId of selectedFriends) {
        try {
          const friendProfiles = await GamerProfile.list({ user_id: friendId });
          if (friendProfiles.length > 0) {
            const friendProfile = friendProfiles[0];
            const friendTeamIds = [...(friendProfile.team_ids || []), team.id];
            await GamerProfile.update(friendProfile.id, { team_ids: friendTeamIds });
          }
        } catch (e) {
          console.warn('Could not update friend profile:', e);
        }
      }

      return team;
    },
    onSuccess: (team) => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      toast({ title: 'Team created!', description: `${team.name} is ready. You are the team leader.` });
      navigate(`/gamer/teams/${team.id}`);
    },
    onError: (err) => {
      toast({ title: 'Failed to create team', description: err.message || 'Please try again.', variant: 'destructive' });
    },
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  const canProceedStep1 = teamData.name && teamData.games.length > 0;

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/gamer/teams')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Teams
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${step >= s ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-500'}`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-red-600' : 'bg-zinc-800'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-6 text-xs text-gray-500">
          <span>Basics</span>
          <span>Branding</span>
          <span>Invite</span>
        </div>

        {/* Step 1: Basics */}
        {step === 1 && (
          <FloatingPanel className="p-6" glowBorder>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center">
                <Users className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">CREATE TEAM</h1>
                <p className="text-gray-400 text-sm">Step 1: Team basics</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Team Name *</label>
                <Input
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  placeholder="Enter team name"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Description</label>
                <Textarea
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                  placeholder="Describe your team in a sentence..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Team Story</label>
                <Textarea
                  value={teamData.story}
                  onChange={(e) => setTeamData({ ...teamData, story: e.target.value })}
                  placeholder="Tell your team's story, history, goals..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Games *</label>
                <div className="flex flex-wrap gap-2">
                  {GAMES.map(game => (
                    <button
                      key={game}
                      onClick={() => toggleGame(game)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        teamData.games.includes(game)
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                      }`}
                    >
                      {teamData.games.includes(game) && <Check className="w-4 h-4 inline mr-1" />}
                      {game}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={teamData.is_recruiting}
                  onCheckedChange={(v) => setTeamData({ ...teamData, is_recruiting: v })}
                />
                <label className="text-white">Open for recruiting</label>
              </div>

              <GlowButton
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
              >
                Next: Team Branding <ArrowLeft className="w-4 h-4 rotate-180" />
              </GlowButton>
            </div>
          </FloatingPanel>
        )}

        {/* Step 2: Branding */}
        {step === 2 && (
          <FloatingPanel className="p-6" glowBorder>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center">
                <Palette className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">TEAM BRANDING</h1>
                <p className="text-gray-400 text-sm">Step 2: Customize your look</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Preview */}
              <div
                className="rounded-xl overflow-hidden border border-zinc-700/30"
                style={{ backgroundColor: teamData.secondary_color }}
              >
                {teamData.banner && (
                  <div className="h-24 overflow-hidden">
                    <img src={teamData.banner} alt="" className="w-full h-full object-cover opacity-60" />
                  </div>
                )}
                <div className="p-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: teamData.primary_color + '33' }}
                  >
                    {teamData.logo ? (
                      <img src={teamData.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-6 h-6" style={{ color: teamData.primary_color }} />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white">{teamData.name || 'Team Name'}</p>
                    <p className="text-xs" style={{ color: teamData.primary_color }}>Preview</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Team Logo</label>
                <div className="flex items-center gap-3">
                  {teamData.logo && (
                    <img src={teamData.logo} alt="Logo" className="w-14 h-14 rounded-lg object-cover border border-zinc-700" />
                  )}
                  <label className="cursor-pointer">
                    <GlowButton variant="secondary" size="sm" asChild disabled={uploading === 'logo'}>
                      <span>
                        {uploading === 'logo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading === 'logo' ? 'Uploading...' : 'Upload Logo'}
                      </span>
                    </GlowButton>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'logo')} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  <Image className="w-4 h-4 inline mr-1" /> Banner Image
                </label>
                <div className="flex items-center gap-3">
                  {teamData.banner && (
                    <img src={teamData.banner} alt="Banner" className="h-14 w-28 rounded-lg object-cover border border-zinc-700" />
                  )}
                  <label className="cursor-pointer">
                    <GlowButton variant="secondary" size="sm" asChild disabled={uploading === 'banner'}>
                      <span>
                        {uploading === 'banner' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading === 'banner' ? 'Uploading...' : 'Upload Banner'}
                      </span>
                    </GlowButton>
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'banner')} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  <Palette className="w-4 h-4 inline mr-1" /> Team Colors
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setTeamData({ ...teamData, primary_color: preset.primary, secondary_color: preset.secondary })}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        teamData.primary_color === preset.primary
                          ? 'border-white/40 bg-zinc-800'
                          : 'border-zinc-700/30 bg-zinc-900 hover:bg-zinc-800'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <span className="text-gray-300">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Primary</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={teamData.primary_color}
                        onChange={(e) => setTeamData({ ...teamData, primary_color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                      />
                      <Input
                        value={teamData.primary_color}
                        onChange={(e) => setTeamData({ ...teamData, primary_color: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Background</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={teamData.secondary_color}
                        onChange={(e) => setTeamData({ ...teamData, secondary_color: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent"
                      />
                      <Input
                        value={teamData.secondary_color}
                        onChange={(e) => setTeamData({ ...teamData, secondary_color: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <label className="text-sm text-gray-400 block mb-2">Social Links</label>
                <div className="space-y-2">
                  <Input
                    value={teamData.social_links.twitter}
                    onChange={(e) => setTeamData({ ...teamData, social_links: { ...teamData.social_links, twitter: e.target.value } })}
                    placeholder="Twitter/X handle"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Input
                    value={teamData.social_links.instagram}
                    onChange={(e) => setTeamData({ ...teamData, social_links: { ...teamData.social_links, instagram: e.target.value } })}
                    placeholder="Instagram handle"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Input
                    value={teamData.social_links.discord}
                    onChange={(e) => setTeamData({ ...teamData, social_links: { ...teamData.social_links, discord: e.target.value } })}
                    placeholder="Discord invite link"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <GlowButton variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </GlowButton>
                <GlowButton className="flex-1" onClick={() => setStep(3)}>
                  Next: Invite <ArrowLeft className="w-4 h-4 rotate-180" />
                </GlowButton>
              </div>
            </div>
          </FloatingPanel>
        )}

        {/* Step 3: Invite */}
        {step === 3 && (
          <FloatingPanel className="p-6" glowBorder>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">INVITE MEMBERS</h1>
                <p className="text-gray-400 text-sm">Step 3: Invite friends (optional)</p>
              </div>
            </div>

            <div className="space-y-5">
              {friends.length > 0 ? (
                <div>
                  <label className="text-sm text-gray-400 block mb-3">
                    Select friends to invite ({selectedFriends.length} selected)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {friends.map((friend) => (
                      <GameCard
                        key={friend.id}
                        className={`p-3 cursor-pointer transition-colors ${selectedFriends.includes(friend.user_id) ? 'border-red-500' : ''}`}
                        onClick={() => toggleFriend(friend.user_id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden">
                            {friend.avatar ? (
                              <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Users className="w-5 h-5 text-red-500 m-auto mt-2" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{friend.username}</p>
                          </div>
                          {selectedFriends.includes(friend.user_id) && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </GameCard>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserPlus className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                  <p className="text-gray-400">No friends to invite yet</p>
                  <p className="text-gray-600 text-sm">You can invite members after creating the team</p>
                </div>
              )}

              <div className="flex gap-3">
                <GlowButton variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </GlowButton>
                <GlowButton
                  className="flex-1"
                  onClick={() => createTeamMutation.mutate()}
                  disabled={createTeamMutation.isPending}
                >
                  {createTeamMutation.isPending ? 'Creating...' : (
                    <><Plus className="w-4 h-4" /> Create Team</>
                  )}
                </GlowButton>
              </div>
            </div>
          </FloatingPanel>
        )}
      </div>
    </GamerLayout>
  );
}
