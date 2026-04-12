import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import {
  Trophy, MapPin, Globe, CheckCircle, Calendar, Users,
  ArrowLeft, Star, ExternalLink, Shield, BarChart3
} from 'lucide-react';

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const statusColors = {
  live: 'bg-green-500/20 text-green-400 border-green-500/30',
  published: 'bg-red-500/20 text-red-400 border-red-500/30',
  completed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function OrganizerPublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['organizer-portfolio', id],
    queryFn: () => apiCall(`/organizers/${id}/portfolio`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!portfolio?.profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-4">Organizer not found</p>
          <button onClick={() => window.history.back()} className="text-red-400 hover:underline">← Back</button>
        </div>
      </div>
    );
  }

  const { profile, tournaments = [], reports = [] } = portfolio;
  const liveTournaments = tournaments.filter(t => t.status === 'live' || t.status === 'published');
  const pastTournaments = tournaments.filter(t => t.status === 'completed');
  const isVerified = profile.verification_status === 'verified' || profile.is_verified;
  const totalPrizepool = tournaments.reduce((s, t) => s + (t.prizepool_total || 0), 0);
  const totalTeams = tournaments.reduce((s, t) => s + (t.teams?.length || 0), 0);

  const socialLinks = profile.social_links || {};

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Profile Hero */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-[#1a1a2e] rounded-2xl p-6 md:p-8 border border-gray-800">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-600 to-red-600 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
              {profile.brand_logo ? (
                <img src={profile.brand_logo} alt="" className="w-full h-full rounded-xl object-cover" />
              ) : (
                profile.brand_name?.[0] || 'O'
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.brand_name || 'Organizer'}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                    <Shield className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              {profile.location && (
                <p className="text-gray-400 flex items-center gap-1 mb-2">
                  <MapPin className="w-4 h-4" /> {profile.location}
                </p>
              )}
              {profile.bio && <p className="text-gray-300 text-sm max-w-2xl mb-4">{profile.bio}</p>}

              {/* Social Links */}
              {Object.keys(socialLinks).length > 0 && (
                <div className="flex items-center gap-3">
                  {Object.entries(socialLinks).map(([platform, url]) => (
                    url && (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                        className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center gap-1">
                        <Globe className="w-4 h-4" /> {platform}
                      </a>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{tournaments.length}</p>
              <p className="text-gray-400 text-sm">Tournaments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{totalTeams}</p>
              <p className="text-gray-400 text-sm">Teams Hosted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-400">{fmtEGP(totalPrizepool)}</p>
              <p className="text-gray-400 text-sm">Prize Pool</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {profile.rating ? `${profile.rating}/5` : 'N/A'}
              </p>
              <p className="text-gray-400 text-sm">Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Tournaments */}
      {liveTournaments.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-400" /> Ongoing Tournaments
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {liveTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`}
                className="bg-[#1a1a2e] rounded-xl p-5 border border-gray-800 hover:border-red-500/50 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold group-hover:text-red-400 transition-colors">{t.name}</h3>
                    <p className="text-gray-400 text-sm">{t.game}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusColors[t.status] || ''}`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.teams?.length || 0}/{t.max_teams}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fmtDate(t.schedule)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Tournaments (Portfolio) */}
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-red-400" /> Tournament Portfolio
        </h2>
        {pastTournaments.length === 0 ? (
          <p className="text-gray-500 text-sm">No completed tournaments yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastTournaments.map(t => {
              const report = reports.find(r => r.tournament_id === t.id);
              return (
                <div key={t.id} className="bg-[#1a1a2e] rounded-xl border border-gray-800 overflow-hidden">
                  {t.tournament_image ? (
                    <img src={t.tournament_image} alt="" className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-red-900/50 to-red-900/50 flex items-center justify-center">
                      <Trophy className="w-10 h-10 text-red-400/50" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{t.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{t.game} • {fmtDate(t.schedule)}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                      <span><Users className="w-3.5 h-3.5 inline mr-1" />{t.teams?.length || 0} teams</span>
                      <span>{fmtEGP(t.prizepool_total)}</span>
                    </div>
                    {report ? (
                      <Link to={`/tournaments/${t.id}/report`}
                        className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300">
                        <BarChart3 className="w-3.5 h-3.5" /> View Report <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-gray-600 text-sm">No report</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Games */}
      {profile.featured_games?.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-lg font-bold mb-3">Featured Games</h2>
          <div className="flex flex-wrap gap-2">
            {profile.featured_games.map(g => (
              <span key={g} className="px-3 py-1.5 bg-[#1a1a2e] rounded-lg text-sm text-gray-300 border border-gray-800">{g}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
