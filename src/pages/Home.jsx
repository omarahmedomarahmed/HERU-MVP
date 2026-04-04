import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Menu, X, Star, Trophy, Users, Zap, Flame, Target, Crown, Activity } from 'lucide-react';
import HeruLogo from '@/components/shared/HeruLogo';
import { GamerProfile, Team, Tournament } from '@/api/heruClient'


export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const navigate = useNavigate();

  // Fetch data
  const { data: tournaments = [] } = useQuery({
    queryKey: ['home-tournaments'],
    queryFn: () => Tournament.list('-created_date'),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['home-teams'],
    queryFn: () => Team.list('-created_date'),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ['home-talents'],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ is_talent: true }, '-created_date', 20);
      return profiles;
    },
  });

  // Get live/published tournaments
  const liveTournaments = tournaments.filter(t => ['live', 'published'].includes(t.status)).slice(0, 9);
  const featuredTournament = liveTournaments.find(t => t.name?.includes('HERU Egypt Open')) || liveTournaments[0];
  const otherTournaments = liveTournaments.filter(t => t.id !== featuredTournament?.id);

  // Get teams from featured tournament
  const featuredTeams = teams.filter(t => featuredTournament?.teams?.includes(t.id)).slice(0, 8);

  // Calculate stats
  const totalPrizepool = tournaments.reduce((sum, t) => sum + (t.prizepool_total || 0), 0);
  const organizers = [...new Set(tournaments.map(t => t.organizer_id))].length;

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <HeruLogo className="h-8" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/tournaments" className="text-sm text-gray-300 hover:text-white transition">Tournaments</Link>
            <Link to="/teams" className="text-sm text-gray-300 hover:text-white transition">Teams</Link>
            <Link to="/talents" className="text-sm text-gray-300 hover:text-white transition">Talents</Link>
            <button onClick={() => scrollToSection('for-organizers')} className="text-sm text-gray-300 hover:text-white transition">For Organizers</button>
            <button onClick={() => scrollToSection('for-sponsors')} className="text-sm text-gray-300 hover:text-white transition">For Sponsors</button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Login Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLoginDropdown(!loginDropdown)}
                className="text-sm text-gray-300 hover:text-white flex items-center gap-1 transition"
              >
                Login <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {loginDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden min-w-48"
                  >
                    <Link to="/auth/gamer/login" className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition">
                      Login as Gamer
                    </Link>
                    <Link to="/auth/organizer/login" className="block px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition">
                      Login as Organizer
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Get Started Button */}
            <button
              onClick={() => scrollToSection('cta-section')}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition hidden md:block"
            >
              Get Started
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white"
            >
              {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
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
                <Link to="/teams" className="block text-sm text-gray-300 hover:text-white">Teams</Link>
                <Link to="/talents" className="block text-sm text-gray-300 hover:text-white">Talents</Link>
                <button onClick={() => { scrollToSection('for-organizers'); setNavOpen(false); }} className="block text-sm text-gray-300 hover:text-white">For Organizers</button>
                <button onClick={() => { scrollToSection('for-sponsors'); setNavOpen(false); }} className="block text-sm text-gray-300 hover:text-white">For Sponsors</button>
                <Link to="/auth/gamer/login" className="block text-sm text-gray-300 hover:text-white">Login as Gamer</Link>
                <Link to="/auth/organizer/login" className="block text-sm text-gray-300 hover:text-white">Login as Organizer</Link>
                <button onClick={() => { scrollToSection('cta-section'); setNavOpen(false); }} className="block w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold">
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SECTION 1: Hero */}
      <section className="relative h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://variety.com/wp-content/uploads/2020/08/league-of-legends-world-championship.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-sm font-bold text-red-500 mb-4 tracking-widest uppercase">EGYPT'S #1 ESPORTS PLATFORM</p>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Compete. Organize.<br className="hidden md:block" /> Dominate.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join Egypt's fastest-growing esports ecosystem. Compete in tournaments, build your team, book talent, or run world-class events.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col md:flex-row gap-4 justify-center mb-12">
            <Link to="/auth/gamer/register" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition shadow-lg shadow-red-600/50">
              Play Tournaments
            </Link>
            <Link to="/auth/organizer/register" className="border-2 border-red-500 hover:bg-red-600/10 text-red-400 px-8 py-4 rounded-lg font-bold text-lg transition">
              Run Events
            </Link>
            <Link to="/radar" className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg transition border border-white/30">
              Sponsor a Tournament
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-sm text-gray-400 mb-16">
            8+ Teams · 10+ Tournaments · <span className="text-amber-400 font-bold">EGP 130K+</span> in Prizes
          </motion.div>

          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex justify-center">
            <ChevronDown className="w-8 h-8 text-red-500" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Live Stats (Numbers) */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/80 to-zinc-950" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-5 gap-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-zinc-900/90 backdrop-blur border border-red-500/30 rounded-xl p-8 text-center">
              <Flame className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <div className="text-4xl font-black text-white mb-2">8+</div>
              <p className="text-gray-300">Active Teams</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-zinc-900/90 backdrop-blur border border-red-500/30 rounded-xl p-8 text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <div className="text-4xl font-black text-white mb-2">10+</div>
              <p className="text-gray-300">Tournaments</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-zinc-900/90 backdrop-blur border border-red-500/30 rounded-xl p-8 text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-black text-amber-400 mb-2">130<span className="text-lg">K</span>+</div>
              <p className="text-gray-300"><span className="text-xs">EGP</span> Prize Pool</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="bg-zinc-900/90 backdrop-blur border border-red-500/30 rounded-xl p-8 text-center">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <div className="text-4xl font-black text-white mb-2">500+</div>
              <p className="text-gray-300">Gamers</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-zinc-900/90 backdrop-blur border border-red-500/30 rounded-xl p-8 text-center">
              <Crown className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <div className="text-4xl font-black text-white mb-2">5+</div>
              <p className="text-gray-300">Talents</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: For Gamers */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1400&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-1" />

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-red-500 font-bold text-sm tracking-widest mb-4">FOR GAMERS</p>
            <h2 className="text-5xl font-black mb-6">Compete. Grind. Dominate.</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join Egypt's most competitive esports ecosystem. Register your team, apply to tournaments, track your wins, and get discovered by top organizers as a talent.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Create and manage your team profile',
                'Apply to open tournaments with one click',
                'Get invited by organizers directly',
                'Earn gig income as a caster, coach, or host',
                'Track tournament history and placements',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-red-500 font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link to="/auth/gamer/register" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold transition inline-block">
              Create Gamer Account
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
              <div>
                <h3 className="font-bold">ShadowBlade</h3>
                <p className="text-xs text-gray-400">Valorant Radiant</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Team</span>
                <span className="font-bold">Shadow Wolves</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Role</span>
                <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">IGL / Coach</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Rating</span>
                <span className="text-amber-400 font-bold">4.9 ⭐</span>
              </div>
              <div className="pt-3 border-t border-zinc-700">
                <p className="text-xs text-gray-400 mb-2">Available for:</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Tournament Coach</span>
                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded">Team Manager</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: For Organizers */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/70 to-transparent z-1" />

        <div className="max-w-7xl mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center" id="for-organizers">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-2 md:order-1">
            <div className="bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-lg p-8">
              <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">Sponsorship Radar Progress</p>
                <div className="text-3xl font-bold mb-2">65% Funded</div>
                <div className="bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 h-full w-2/3" />
                </div>
                <p className="text-sm text-gray-400 mt-2">EGP 80,000 of EGP 123,000</p>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Main Organizer</span>
                  <span>EGP 40,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Co-Organizer 1</span>
                  <span>EGP 25,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Co-Organizer 2</span>
                  <span>EGP 15,000</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="order-1 md:order-2">
            <p className="text-red-500 font-bold text-sm tracking-widest mb-4">FOR ORGANIZERS</p>
            <h2 className="text-5xl font-black mb-6">Run World-Class Tournaments Without the Chaos</h2>
            <p className="text-gray-300 mb-8 text-lg">
              HERU.gg gives Egyptian esports organizers a complete platform to build, manage, and grow tournaments. From bracket generation to talent booking to sponsorship matching — everything in one place.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                'Full tournament builder with bracket engine',
                'Invite teams and manage registrations',
                'Book hosts, casters, and coaches from our talent pool',
                'Split costs with co-organizers via Sponsorship Radar',
                'Manage billing and fulfillment in one dashboard',
                'Build your organizer brand and profile',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <span className="text-red-500 font-bold">✓</span> {item}
                </li>
              ))}
            </ul>
            <Link to="/auth/organizer/register" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold transition inline-block">
              Create Organizer Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5: For Sponsors */}
      <section className="py-24 px-6 relative overflow-hidden" id="for-sponsors">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-purple-950/20 z-0" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-red-500 font-bold text-sm tracking-widest mb-4">FOR SPONSORS</p>
            <h2 className="text-5xl font-black mb-4">Co-Organize. Get Your Brand in the Arena.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Don't just sponsor a banner — become a co-organizer. HERU's Sponsorship Radar connects brands with tournament organizers who need funding partners. Commit your share, get your branding in the tournament, and track every EGP spent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { title: 'Browse Open Tournaments', desc: 'See tournaments actively seeking co-organizers with funding targets' },
              { title: 'Commit Your Share', desc: 'Choose your percentage contribution, minimum 30% by lead organizer' },
              { title: 'Get Full Visibility', desc: 'Your brand appears on tournament pages, streams, and social posts' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center hover:border-red-500/50 transition">
                <div className="text-4xl font-black text-red-500 mb-4">{i + 1}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link to="/auth/organizer/register" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold transition">
              Explore Sponsorship Radar
            </Link>
            <p className="text-gray-400 text-sm">Already registered? <Link to="/radar" className="text-red-500 hover:text-red-400 font-bold">Browse the Radar →</Link></p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Live Tournaments */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Live & Upcoming <span className="text-red-500">Tournaments</span></h2>
            <p className="text-gray-400 text-lg">Watch the competition unfold in real time</p>
          </motion.div>

          {/* Featured Tournament */}
          {featuredTournament && (
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 rounded-xl overflow-hidden border border-zinc-800">
              <div
                className="h-96 relative flex items-end p-8 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${featuredTournament.tournament_image || 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=1200&q=80'})`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                <div className="relative z-10 w-full">
                  {featuredTournament.status === 'live' && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                      <span className="text-red-500 font-bold text-sm">LIVE NOW</span>
                    </div>
                  )}
                  <h3 className="text-4xl font-black mb-2">{featuredTournament.name}</h3>
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <span className="bg-white/10 px-3 py-1 rounded">{featuredTournament.game}</span>
                    <span className="font-bold text-amber-400 text-lg">EGP {(featuredTournament.prizepool_total || 0).toLocaleString()}</span>
                    <span className="bg-white/10 px-3 py-1 rounded">{featuredTournament.tournament_type === 'shared' ? 'Co-Organized' : 'Solo'}</span>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-900 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {featuredTournament.organizer_brand?.logo && (
                    <img src={featuredTournament.organizer_brand.logo} alt="Organizer" className="h-10 w-10 rounded-full" />
                  )}
                  <div className="text-sm text-gray-300">{featuredTournament.organizer_brand?.name || 'Organizer'}</div>
                </div>
                <Link to={`/tournaments/${featuredTournament.id}`} className="text-red-500 hover:text-red-400 font-bold text-sm">
                  View Tournament <ChevronRight className="w-4 h-4 inline" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Other Tournaments Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {otherTournaments.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50 hover:border-red-500/50 transition">
                <div
                  className="h-48 relative bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${t.tournament_image || 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&q=80'})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                  {t.status === 'live' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 px-2 py-1 rounded text-xs font-bold">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200"></span>
                      </span>
                      LIVE
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-2">{t.name}</h3>
                  <div className="text-xs text-gray-400 mb-3 space-y-1">
                    <div className="flex gap-2">
                      <span className="bg-white/10 px-2 py-1 rounded">{t.game}</span>
                      <span className="bg-white/10 px-2 py-1 rounded">{t.tournament_type === 'shared' ? 'Shared' : 'Solo'}</span>
                    </div>
                    <div className="text-amber-400 font-bold">EGP {(t.prizepool_total || 0).toLocaleString()}</div>
                  </div>
                  <Link to={`/tournaments/${t.id}`} className="text-red-500 hover:text-red-400 text-xs font-bold">
                    View Tournament →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Teams */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Meet the <span className="text-red-500">Teams</span></h2>
            <p className="text-gray-400 text-lg">Egypt's top esports squads competing for glory</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {featuredTeams.map((team, i) => (
              <motion.div key={team.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-6 text-center hover:border-red-500/50 transition">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
                    {team.logo ? <img src={team.logo} alt={team.name} className="h-full w-full object-cover" /> : team.name?.charAt(0)}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                <div className="text-xs text-gray-400 mb-3 space-y-1">
                  {team.games?.length > 0 && <div className="bg-white/10 inline-block px-2 py-1 rounded">{team.games.join(', ')}</div>}
                  {team.tournament_history?.length > 0 ? (
                    <div className="flex justify-center gap-1 flex-wrap">
                      {team.tournament_history.slice(0, 2).map((h, idx) => (
                        <span key={idx} className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs">
                          {h.placement === 1 ? '🥇' : h.placement === 2 ? '🥈' : '🥉'} {h.tournament_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">Rising Squad</span>
                  )}
                  <div className="text-gray-400 text-xs">{team.members?.length || 0} Members</div>
                </div>
                {team.is_recruiting && <div className="text-xs bg-green-500/20 text-green-400 inline-block px-2 py-1 rounded mb-3">Recruiting</div>}
                <Link to={`/teams/${team.id}`} className="text-red-500 hover:text-red-400 text-xs font-bold">
                  View Team →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: Talents */}
      <section className="py-24 px-6 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Our <span className="text-red-500">Talent Roster</span></h2>
            <p className="text-gray-400 text-lg">The hosts, casters, and coaches powering Egypt's esports scene</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {talents.slice(0, 6).map((talent, i) => (
              <motion.div key={talent.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center hover:border-red-500/50 transition">
                <div className="mb-4 flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-yellow-600 flex items-center justify-center text-xl font-bold">
                    {talent.avatar ? <img src={talent.avatar} alt={talent.username} className="h-full w-full object-cover rounded-full" /> : talent.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{talent.username}</h3>
                <p className="text-xs text-red-500 font-bold mb-2">★ Caster</p>
                <div className="text-sm text-gray-400 mb-4">
                  <span className="text-amber-400 font-bold">4.8⭐</span>
                </div>
                <p className="text-sm text-gray-300 mb-4">From EGP 2,500</p>
                <Link to={`/gamer/${talent.user_id}`} className="text-red-500 hover:text-red-400 text-xs font-bold">
                  View Profile →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: CTA */}
      <section id="cta-section" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl font-black mb-6">Ready to Make Your Mark?</h2>
            <p className="text-gray-400 text-lg mb-12">Join thousands of gamers, teams, and organizers building Egypt's esports future.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/auth/gamer/register" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-bold transition">
                Get Started as Gamer
              </Link>
              <Link to="/auth/organizer/register" className="border-2 border-red-600 hover:bg-red-600/10 text-red-600 px-8 py-4 rounded-lg font-bold transition">
                Get Started as Organizer
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 10: FOOTER */}
      <footer className="bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <HeruLogo className="h-8" />
              </Link>
              <p className="text-gray-400 text-sm mb-4">Egypt's premier esports tournament platform</p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white text-sm">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Instagram</a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-bold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/tournaments" className="text-gray-400 hover:text-white">Tournaments</Link></li>
                <li><Link to="/teams" className="text-gray-400 hover:text-white">Teams</Link></li>
                <li><Link to="/talents" className="text-gray-400 hover:text-white">Talents</Link></li>
                <li><Link to="/radar" className="text-gray-400 hover:text-white">Sponsorship Radar</Link></li>
              </ul>
            </div>

            {/* Join */}
            <div>
              <h3 className="font-bold mb-4">Get Started</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/auth/gamer/register" className="text-gray-400 hover:text-white">Join as Gamer</Link></li>
                <li><Link to="/auth/organizer/register" className="text-gray-400 hover:text-white">Become Organizer</Link></li>
                <li><Link to="/auth/gamer/login" className="text-gray-400 hover:text-white">Login Gamer</Link></li>
                <li><Link to="/auth/organizer/login" className="text-gray-400 hover:text-white">Login Organizer</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 text-center text-sm text-gray-500">
            <p>© 2026 HERU.gg — All rights reserved · All prices in EGP</p>
          </div>
        </div>
      </footer>
    </div>
  );
}