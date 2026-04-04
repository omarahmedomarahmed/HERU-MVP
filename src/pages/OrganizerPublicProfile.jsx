import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GameCard from '@/components/ui/GameCard';
import GlowButton from '@/components/ui/GlowButton';
import { OrganizerProfile, SponsorshipRadar, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Trophy, MapPin, Globe, Twitter, Instagram, CheckCircle,
  Gamepad2, Calendar, Users, Radar, ArrowLeft, Star
} from 'lucide-react';

export default function OrganizerPublicProfile() {
  const [user, setUser] = useState(null);
  const { organizer_id } = useParams();

  useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => {});
  }, []);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['organizer-profile-public', organizer_id],
    queryFn: async () => {
      const profiles = await OrganizerProfile.list();
      return profiles.find(p => p.id === organizer_id) || null;
    },
    enabled: !!organizer_id,
  });

  const { data: tournaments = [] } = useQuery({
    queryKey: ['organizer-tournaments-public', organizer_id],
    queryFn: async () => {
      const allT = await Tournament.list('-created_date');
      return allT.filter(t => profile.tournaments?.includes(t.id) && t.status !== 'draft');
    },
    enabled: !!profile?.tournaments?.length,
  });

  const { data: coOrgTournaments = [] } = useQuery({
    queryKey: ['organizer-coorg-tournaments-public', organizer_id],
    queryFn: async () => {
      if (!profile?.co_organized_tournaments?.length) return [];
      const allT = await Tournament.list('-created_date');
      return allT.filter(t => profile.co_organized_tournaments.includes(t.id));
    },
    enabled: !!profile?.co_organized_tournaments?.length,
  });

  const { data: radarListings = [] } = useQuery({
    queryKey: ['organizer-radar-public', organizer_id],
    queryFn: async () => {
      const all = await SponsorshipRadar.list();
      return all.filter(r => r.main_organizer_id === organizer_id && r.status === 'open');
    },
    enabled: !!organizer_id,
  });

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  if (profileLoading) {
    return (
      <GamerLayout user={user} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      </GamerLayout>
    );
  }

  if (!profile) {
    return (
      <GamerLayout user={user} cartCount={cart.length}>
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">Organizer Not Found</h3>
        </FloatingPanel>
      </GamerLayout>
    );
  }

  const upcomingTournaments = tournaments.filter(t => t.status === 'published' || t.status === 'live');
  const pastTournaments = tournaments.filter(t => t.status === 'completed');

  return (
    <GamerLayout user={user} cartCount={cart.length}>
      <Link to={'/tournaments'} className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Hero Card */}
      <FloatingPanel className="p-8 mb-6" glowBorder>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-28 h-28 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-700">
            {profile.brand_logo ? (
              <img src={profile.brand_logo} alt={profile.brand_name} className="w-full h-full object-cover" />
            ) : (
              <Trophy className="w-12 h-12 text-red-500" />
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
              <h1 className="text-3xl font-black text-white">{profile.brand_name}</h1>
              {profile.is_verified && (
                <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            {profile.location && (
              <p className="text-gray-400 text-sm flex items-center justify-center sm:justify-start gap-1 mb-2">
                <MapPin className="w-4 h-4" /> {profile.location}
              </p>
            )}

            {(profile.bio || profile.description) && (
              <p className="text-gray-300 text-sm leading-relaxed max-w-2xl mb-3">{profile.bio || profile.description}</p>
            )}

            {/* Featured Games */}
            {profile.featured_games?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
                {profile.featured_games.map((g, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-zinc-800 text-gray-300 border border-zinc-700 rounded-full">
                    <Gamepad2 className="w-3 h-3 text-red-400" /> {g}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {profile.social_links?.twitter && (
                <a href={`https://twitter.com/${profile.social_links.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <GlowButton variant="ghost" size="sm"><Twitter className="w-4 h-4" /> Twitter</GlowButton>
                </a>
              )}
              {profile.social_links?.instagram && (
                <a href={`https://instagram.com/${profile.social_links.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <GlowButton variant="ghost" size="sm"><Instagram className="w-4 h-4" /> Instagram</GlowButton>
                </a>
              )}
              {profile.social_links?.website && (
                <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer">
                  <GlowButton variant="ghost" size="sm"><Globe className="w-4 h-4" /> Website</GlowButton>
                </a>
              )}
              {radarListings.length > 0 && (
                <Link to="/radar">
                  <GlowButton variant="secondary" size="sm"><Radar className="w-4 h-4" /> View on Sponsorship Radar</GlowButton>
                </Link>
              )}
            </div>
          </div>
        </div>
      </FloatingPanel>

      {/* Stats Row */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <FloatingPanel className="p-5 text-center">
          <p className="text-4xl font-black text-red-500">{profile.total_tournaments_organized || tournaments.length}</p>
          <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4" /> Tournaments Organized
          </p>
        </FloatingPanel>
        <FloatingPanel className="p-5 text-center">
          <p className="text-4xl font-black text-blue-400">{(profile.co_organized_tournaments || []).length}</p>
          <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-1">
            <Users className="w-4 h-4" /> Co-Organized
          </p>
        </FloatingPanel>
        <FloatingPanel className="p-5 text-center">
          {profile.rating ? (
            <>
              <p className="text-4xl font-black text-yellow-400">{profile.rating.toFixed(1)}</p>
              <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-yellow-400" /> Rating
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-black text-gray-600">—</p>
              <p className="text-gray-500 text-sm mt-1">No Rating Yet</p>
            </>
          )}
        </FloatingPanel>
      </div>

      {/* Upcoming / Active Tournaments */}
      {upcomingTournaments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" /> Upcoming Tournaments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </div>
      )}

      {/* Past Tournaments */}
      {pastTournaments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Past Tournaments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </div>
      )}

      {/* Co-Organized Tournaments */}
      {coOrgTournaments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-400" /> Co-Organized Tournaments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coOrgTournaments.map(t => <TournamentCard key={t.id} tournament={t} badge="Co-Organizer" />)}
          </div>
        </div>
      )}

      {tournaments.length === 0 && coOrgTournaments.length === 0 && (
        <FloatingPanel className="p-12 text-center">
          <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-500">No public tournaments yet</p>
        </FloatingPanel>
      )}
    </GamerLayout>
  );
}

function TournamentCard({ tournament, badge }) {
  return (
    <Link to={`/tournaments/$\{tournament.id}`}>
      <GameCard className="p-4 h-full">
        <div className="aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden relative">
          {tournament.tournament_image ? (
            <img src={tournament.tournament_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-zinc-600" />
            </div>
          )}
          {badge && (
            <span className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">{badge}</span>
          )}
        </div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-white font-bold text-sm leading-tight">{tournament.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${
            tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            tournament.status === 'published' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
            'bg-zinc-700/50 text-zinc-400 border-zinc-700'
          }`}>
            {tournament.status === 'live' ? '🔴 LIVE' : tournament.status === 'published' ? 'OPEN' : 'ENDED'}
          </span>
        </div>
        <p className="text-gray-500 text-xs flex items-center gap-1">
          <Gamepad2 className="w-3 h-3" /> {tournament.game}
        </p>
        {tournament.schedule && (
          <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(tournament.schedule).toLocaleDateString()}
          </p>
        )}
        {tournament.prizepool_total > 0 && (
          <p className="text-yellow-400 text-xs font-bold mt-1">💰 EGP {tournament.prizepool_total.toLocaleString()}</p>
        )}
      </GameCard>
    </Link>
  );
}