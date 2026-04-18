import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import {
  Trophy, MapPin, Globe, CheckCircle, Calendar, Users,
  ArrowLeft, Star, ExternalLink, Shield, BarChart3, Gamepad2,
  Twitter, Youtube, MessageCircle, Instagram, Zap,
} from 'lucide-react';

const fmtEGP = (n) => 'EGP ' + (n || 0).toLocaleString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const statusColors = {
  live: 'bg-green-500/20 text-green-400 border-green-500/30',
  published: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  completed: 'bg-zinc-700/50 text-zinc-400 border-zinc-600/30',
};

const SOCIAL_ICONS = {
  discord: MessageCircle,
  twitter: Twitter,
  youtube: Youtube,
  instagram: Instagram,
};

function StatCard({ value, label, color = 'text-purple-400' }) {
  return (
    <div className="flex flex-col items-center py-4 px-3 rounded-xl bg-white/3 border border-white/5">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-zinc-500 text-xs mt-0.5 text-center">{label}</span>
    </div>
  );
}

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
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!portfolio?.profile) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-4 text-white">Organizer not found</p>
          <button onClick={() => window.history.back()} className="text-purple-400 hover:underline">← Back</button>
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
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      {/* Sticky nav */}
      <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Link to="/" className="ml-1">
              <span className="text-white font-black text-lg tracking-tight">HERU<span className="text-red-500">.</span>gg</span>
            </Link>
          </div>
          <Link
            to="/tournaments"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/20 hover:bg-purple-600/30 transition-colors"
          >
            Browse Tournaments
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Hero Card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600/30 to-blue-600/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {profile.brand_logo ? (
                  <img src={profile.brand_logo} alt={profile.brand_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-purple-400">{profile.brand_name?.[0] || 'O'}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black">{profile.brand_name || 'Organizer'}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full text-xs font-bold border border-green-500/25">
                      <Shield className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {profile.location && (
                  <p className="text-zinc-400 flex items-center gap-1.5 text-sm mb-2">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" /> {profile.location}
                  </p>
                )}
                {(profile.bio || profile.description) && (
                  <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl mb-4">{profile.bio || profile.description}</p>
                )}

                {/* Social links */}
                {Object.entries(socialLinks).some(([, v]) => !!v) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {Object.entries(socialLinks).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = SOCIAL_ICONS[platform.toLowerCase()] || Globe;
                      return (
                        <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-purple-400 hover:border-purple-500/30 transition-colors text-xs">
                          <Icon className="w-3.5 h-3.5" />
                          {platform}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/5">
              <StatCard value={tournaments.length} label="Tournaments" color="text-purple-400" />
              <StatCard value={totalTeams} label="Teams Hosted" color="text-blue-400" />
              <StatCard value={fmtEGP(totalPrizepool)} label="Prize Pool" color="text-yellow-400" />
              <StatCard value={profile.rating ? `${profile.rating}/5` : '—'} label="Rating" color="text-green-400" />
            </div>
          </div>
        </div>

        {/* Featured Games */}
        {profile.featured_games?.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Featured Games</h2>
            <div className="flex flex-wrap gap-2">
              {profile.featured_games.map(g => (
                <span key={g} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-sm">
                  <Gamepad2 className="w-3.5 h-3.5 text-purple-400" /> {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Active Tournaments */}
        {liveTournaments.length > 0 && (
          <div>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" /> Active Tournaments
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {liveTournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`}
                  className="group block rounded-xl overflow-hidden border border-white/5 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] hover:border-purple-500/30 transition-all">
                  <div className="h-28 bg-gradient-to-br from-purple-900/30 to-zinc-900 relative overflow-hidden">
                    {t.tournament_image && (
                      <img src={t.tournament_image} alt="" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${statusColors[t.status] || ''}`}>
                        {t.status === 'live' ? '● LIVE' : t.status === 'published' ? 'OPEN' : t.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold group-hover:text-purple-400 transition-colors truncate">{t.name}</h3>
                    <p className="text-zinc-400 text-sm mb-3">{t.game}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {t.teams?.length || 0}/{t.max_teams || '∞'}</span>
                      {t.schedule && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {fmtDate(t.schedule)}</span>}
                      {t.prizepool_total > 0 && <span className="text-yellow-500 font-semibold">{fmtEGP(t.prizepool_total)}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Past Tournaments */}
        <div>
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-400" /> Tournament Portfolio
          </h2>
          {pastTournaments.length === 0 ? (
            <p className="text-zinc-600 text-sm py-6 text-center border border-white/5 rounded-xl">No completed tournaments yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastTournaments.map(t => {
                const report = reports.find(r => r.tournament_id === t.id);
                return (
                  <div key={t.id} className="rounded-xl border border-white/5 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-900 relative overflow-hidden">
                      {t.tournament_image ? (
                        <img src={t.tournament_image} alt="" className="w-full h-full object-cover opacity-60" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Trophy className="w-8 h-8 text-zinc-700" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-1 truncate">{t.name}</h3>
                      <p className="text-zinc-500 text-xs mb-3">{t.game} · {fmtDate(t.schedule)}</p>
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {t.teams?.length || 0} teams</span>
                        {t.prizepool_total > 0 && <span className="text-yellow-500">{fmtEGP(t.prizepool_total)}</span>}
                      </div>
                      {report && (
                        <Link to={`/tournaments/${t.id}/report`}
                          className="mt-3 inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                          <BarChart3 className="w-3 h-3" /> View Report <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-purple-500/15 p-8 text-center">
          <h3 className="text-xl font-black mb-2">Want to co-organize?</h3>
          <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">Browse open tournaments on the Sponsorship Radar and commit to co-organizer or sponsor slots.</p>
          <Link
            to="/radar"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-colors"
          >
            <Zap className="w-4 h-4" /> Explore Radar
          </Link>
        </div>

      </div>
    </div>
  );
}
