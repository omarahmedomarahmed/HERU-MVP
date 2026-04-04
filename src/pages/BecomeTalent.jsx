import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GamerProfile, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import {
  Star, ArrowLeft, Mic, Video, Eye, Palette, Camera, Settings,
  Check, ExternalLink
} from 'lucide-react';

const TALENT_TYPES = [
  { id: 'host', label: 'Host', icon: Mic, description: 'Lead esports events and interviews' },
  { id: 'caster', label: 'Caster', icon: Mic, description: 'Provide live game commentary' },
  { id: 'analyst', label: 'Analyst', icon: Eye, description: 'Break down strategies and gameplay' },
  { id: 'observer', label: 'Observer', icon: Camera, description: 'Control in-game camera during broadcasts' },
  { id: 'designer', label: 'Designer', icon: Palette, description: 'Create graphics and visual content' },
  { id: 'producer', label: 'Producer', icon: Settings, description: 'Manage broadcast production' },
];

export default function BecomeTalent() {
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    talent_type: '',
    talent_video_link: '',
    bio: ''
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      setUser(null);
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data) => {
      // Update profile with talent application info
      await GamerProfile.update(profile.id, {
        talent_type: data.talent_type,
        talent_video_link: data.talent_video_link,
        bio: data.bio || profile.bio,
        // Note: is_talent remains false until staff approves
      });
      
      // Add notification
      const notifications = profile.notifications || [];
      notifications.unshift({
        id: Date.now().toString(),
        type: 'talent_application',
        message: 'Your talent application has been submitted for review!',
        read: false,
        created_at: new Date().toISOString()
      });
      await GamerProfile.update(profile.id, { notifications });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
    }
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  if (profile?.is_talent) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <Link to={'/gamer/home'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <FloatingPanel className="max-w-2xl mx-auto p-8 text-center" glowBorder>
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">You're Already a Talent!</h1>
          <p className="text-gray-400 mb-6">
            You're registered as a {profile.talent_type} in the HERU talent roster.
          </p>
          <HexBadge className="mx-auto bg-green-500/20 text-green-400 border-green-500/50">
            <Star className="w-3 h-3 mr-1" /> {profile.talent_type?.toUpperCase()} TALENT
          </HexBadge>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  if (submitted) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <Link to={'/gamer/home'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <FloatingPanel className="max-w-2xl mx-auto p-8 text-center" glowBorder>
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Application Submitted!</h1>
          <p className="text-gray-400 mb-6">
            Our staff will review your application and get back to you soon.
            You'll receive a notification when your application is approved.
          </p>
          <Link to={'/gamer/home'}>
            <GlowButton>
              Return to Home
            </GlowButton>
          </Link>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Header */}
      <Link to={'/gamer/home'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <HexBadge className="mb-4 mx-auto">
            <Star className="w-3 h-3 mr-1" /> TALENT PROGRAM
          </HexBadge>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
            BECOME A <span className="text-red-500">TALENT</span>
          </h1>
          <p className="text-gray-400">
            Join our roster of esports professionals and get hired for premium events
          </p>
        </div>

        <FloatingPanel className="p-6 mb-6" glowBorder>
          <h2 className="text-xl font-bold text-white mb-4">Select Your Talent Type</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {TALENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setForm({ ...form, talent_type: type.id })}
                className={`p-4 rounded-xl border transition-all text-left ${
                  form.talent_type === type.id
                    ? 'bg-red-500/20 border-red-500 text-white'
                    : 'bg-zinc-800/50 border-zinc-700 text-gray-400 hover:border-zinc-600'
                }`}
              >
                <type.icon className="w-6 h-6 mb-2" />
                <p className="font-bold text-sm">{type.label}</p>
                <p className="text-xs mt-1 opacity-70">{type.description}</p>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-2">
                Video Sample Link <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={form.talent_video_link}
                  onChange={(e) => setForm({ ...form, talent_video_link: e.target.value })}
                  placeholder="Google Drive, YouTube, or Vimeo link"
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Share a video showcasing your work (hosting, casting, analysis, etc.)
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">
                About You
              </label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Tell us about your experience and what makes you unique..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={4}
              />
            </div>

            <GlowButton 
              className="w-full"
              onClick={() => submitApplicationMutation.mutate(form)}
              disabled={!form.talent_type || !form.talent_video_link}
            >
              <Star className="w-4 h-4" />
              Submit Application
            </GlowButton>
          </div>
        </FloatingPanel>

        <FloatingPanel className="p-6">
          <h3 className="text-lg font-bold text-white mb-3">What happens next?</h3>
          <ol className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
              <span>Our staff reviews your application and video sample</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
              <span>If approved, you'll get a talent badge on your profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
              <span>You'll be added to the talent marketplace for organizers to hire</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
              <span>Get hired for tournaments and earn money doing what you love!</span>
            </li>
          </ol>
        </FloatingPanel>
      </div>
    </GamerLayout>
  );
}