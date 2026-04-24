import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Menu, X, Trophy, Users, Star, Briefcase,
  ArrowRight, Zap, Target, Shield, TrendingUp, Award, Globe
} from 'lucide-react';
import HeruLogo from '@/components/shared/HeruLogo';
import { Tournament } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const stakeholders = [
  {
    key: 'gamers',
    label: 'Gamers',
    icon: Users,
    color: 'red',
    tagline: 'Compete. Connect. Level Up.',
    desc: 'Find MENA tournaments, build a team, rank up, book coaching.',
    cta: 'Start Competing',
    link: '/auth/gamer/register',
    forLink: '/for-gamers',
  },
  {
    key: 'organizers',
    label: 'Organizers',
    icon: Trophy,
    color: 'purple',
    tagline: 'Build Events That Sponsors Fund.',
    desc: 'Use the Builder to hire service providers, create sponsorship packages, and get paid.',
    cta: 'Build an Event',
    link: '/auth/organizer/register',
    forLink: '/for-organizers',
  },
  {
    key: 'sponsors',
    label: 'Sponsors',
    icon: Star,
    color: 'yellow',
    tagline: 'Put Your Brand Where Gamers Are.',
    desc: 'Browse the radar, purchase sponsorship packages, get impressions, get reports.',
    cta: 'Explore Radar',
    link: '/auth/sponsor/register',
    forLink: '/for-sponsors',
  },
  {
    key: 'providers',
    label: 'Service Providers',
    icon: Briefcase,
    color: 'cyan',
    tagline: 'Get Paid to Power Esports Events.',
    desc: 'List your services — casting, design, venues, marketing. Get booked by organizers.',
    cta: 'List Your Services',
    link: '/auth/provider/register',
    forLink: '/for-providers',
  },
];

const colorStyle = {
  red:    'bg-red-600 hover:bg-red-700 shadow-red-600/30',
  purple: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30',
  yellow: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30 text-black',
  cyan:   'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30',
};

const iconColor = {
  red: 'text-red-400', purple: 'text-purple-400', yellow: 'text-yellow-400', cyan: 'text-cyan-400',
};

const stats = [
  { value: '500+', label: 'Registered Gamers', icon: Users },
  { value: '10+', label: 'Tournaments Run', icon: Trophy },
  { value: '20+', label: 'Service Providers', icon: Briefcase },
  { value: 'EGP 130K+', label: 'Prize Pool Distributed', icon: Award },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, getDashboardPath, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [loading, isAuthenticated]); // eslint-disable-line

  const { data: tournaments = [] } = useQuery({
    queryKey: ['home-tournaments'],
    queryFn: () => Tournament.list({ status: 'live', limit: 6 }),
  });

  const liveTournaments = tournaments.filter(t => ['live', 'published'].includes(t.status)).slice(0, 6);

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden min-h-screen">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <HeruLogo className="h-8" />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link to="/tournaments" className="text-sm text-gray-300 hover:text-white transition">Tournaments</Link>
            <Link to="/radar" className="text-sm text-gray-300 hover:text-white transition">Sponsor Radar</Link>
            <Link to="/teams" className="text-sm text-gray-300 hover:text-white transition">Teams</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <button
                onClick={() => setLoginDropdown(!loginDropdown)}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition"
              >
                Login <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {loginDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden min-w-52 shadow-xl"
                  >
                    {stakeholders.map(s => (
                      <Link
                        key={s.key}
                        to={s.link.replace('/register', '/login')}
                        onClick={() => setLoginDropdown(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition"
                      >
                        <s.icon className={`w-4 h-4 ${iconColor[s.color]}`} />
                        {s.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/auth"
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition hidden md:block"
            >
              Get Started
            </Link>

            <button onClick={() => setNavOpen(!navOpen)} className="md:hidden p-2 text-gray-300 hover:text-white">
              {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-900 border-t border-zinc-800"
            >
              <div className="px-6 py-4 space-y-3">
                <Link to="/tournaments" className="block text-sm text-gray-300 hover:text-white">Tournaments</Link>
                <Link to="/radar" className="block text-sm text-gray-300 hover:text-white">Sponsor Radar</Link>
                <Link to="/teams" className="block text-sm text-gray-300 hover:text-white">Teams</Link>
                {stakeholders.map(s => (
                  <Link key={s.key} to={s.link.replace('/register', '/login')} className="block text-sm text-gray-300 hover:text-white">
                    Login as {s.label}
                  </Link>
                ))}
                <Link to="/auth" className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold text-center">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://variety.com/wp-content/uploads/2020/08/league-of-legends-world-championship.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/85 to-[#0a0a0a]" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs font-bold text-red-500 mb-4 tracking-widest uppercase"
          >
            The Operating System for Esports in MENA
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
          >
            Build. Compete.<br className="hidden md:block" /> Sponsor. Earn.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
          >
            The four-sided esports marketplace connecting Gamers, Organizers, Sponsors,
            and Service Providers across Egypt, Saudi Arabia, and the UAE.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-base transition shadow-lg shadow-red-600/40">
              Join HERU.gg
            </Link>
            <Link to="/radar" className="border border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-base transition">
              Explore Sponsor Radar
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-16"
          >
            <ChevronDown className="w-7 h-7 text-red-500 mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ── 4 STAKEHOLDER TILES ── */}
      <section className="py-20 px-6 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-3">One Platform. Four Roles.</h2>
            <p className="text-gray-400 text-lg">Pick your path and unlock the full HERU experience.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stakeholders.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col"
              >
                <s.icon className={`w-8 h-8 mb-4 ${iconColor[s.color]}`} />
                <h3 className="text-lg font-bold text-white mb-1">{s.label}</h3>
                <p className={`text-sm font-semibold mb-2 ${iconColor[s.color]}`}>{s.tagline}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">{s.desc}</p>
                <div className="flex gap-2">
                  <Link
                    to={s.link}
                    className={`flex-1 text-center text-xs font-bold py-2.5 rounded-lg text-white transition shadow ${colorStyle[s.color]}`}
                  >
                    {s.cta}
                  </Link>
                  <Link
                    to={s.forLink}
                    className="px-3 py-2.5 rounded-lg border border-white/10 hover:border-white/30 text-white/50 hover:text-white transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TOURNAMENTS ── */}
      {liveTournaments.length > 0 && (
        <section className="py-20 px-6 bg-zinc-950">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black mb-1">Live Tournaments</h2>
                <p className="text-gray-400">Competitions happening right now across MENA</p>
              </div>
              <Link to="/tournaments" className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-medium transition">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {liveTournaments.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link to={`/tournaments/${t.id}`} className="block rounded-xl overflow-hidden border border-white/10 bg-zinc-900 hover:border-red-500/40 transition group">
                    {t.tournament_image && (
                      <div className="h-36 overflow-hidden">
                        <img src={t.tournament_image} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-wide">{t.game}</span>
                        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-medium">
                          {t.status === 'live' ? 'LIVE' : 'Open'}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm mb-1 truncate">{t.name}</h3>
                      <p className="text-gray-500 text-xs">
                        {t.teams?.length || 0} / {t.max_teams || '?'} teams
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STATS BAR ── */}
      <section className="py-16 px-6 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <s.icon className="w-6 h-6 text-red-500 mx-auto mb-3" />
                <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                <p className="text-gray-500 text-sm">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">How It Works</h2>
            <p className="text-gray-400 text-lg">Each role has a clear, value-creating flow</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                role: 'Organizer',
                color: 'purple',
                steps: ['Build your tournament with the 5-step Builder', 'Hire service providers from the marketplace', 'Create sponsorship packages and publish to radar', 'Get fully funded and run your event'],
              },
              {
                role: 'Sponsor',
                color: 'yellow',
                steps: ['Browse the Sponsorship Radar', 'View packages with reach, impressions, deliverables', 'Purchase a package via Paymob', 'Track campaign performance and get post-event report'],
              },
              {
                role: 'Service Provider',
                color: 'cyan',
                steps: ['Register and list your services', 'Get approved by HERU staff', 'Appear in Tournament Builder for organizers', 'Accept bookings, deliver work, get paid (escrow)'],
              },
              {
                role: 'Gamer',
                color: 'red',
                steps: ['Create your profile and register your games', 'Find tournaments and form or join a team', 'Compete in live brackets', 'Rank up on the leaderboard and book coaching'],
              },
            ].map((flow, i) => (
              <motion.div
                key={flow.role}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h3 className={`text-lg font-bold mb-4 ${iconColor[flow.color]}`}>{flow.role}</h3>
                <ol className="space-y-3">
                  {flow.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white bg-${flow.color}-600 mt-0.5`}>
                        {j + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section id="cta-section" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black mb-5">
              Ready to join HERU?
            </h2>
            <p className="text-gray-400 text-lg mb-10">
              Whether you compete, organize, sponsor, or provide services —<br className="hidden md:block" />
              there's a place for you in the MENA esports ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-xl font-bold text-lg transition shadow-xl shadow-red-600/30">
                Get Started Free
              </Link>
              <Link to="/tournaments" className="border border-white/20 hover:bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg transition">
                Browse Tournaments
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <HeruLogo className="h-7" />
          <p className="text-gray-600 text-sm">© 2026 HERU.gg — All rights reserved</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/tournaments" className="hover:text-white transition">Tournaments</Link>
            <Link to="/radar" className="hover:text-white transition">Radar</Link>
            <Link to="/auth" className="hover:text-white transition">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
