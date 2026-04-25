import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Menu, X, Trophy, Users, Star, Briefcase,
  ArrowRight, Zap, Target, Shield, TrendingUp, Award, Globe,
  CheckCircle2, DollarSign, BarChart3, Package, Play,
  Gamepad2, Building2, Sparkles, ChevronRight, Medal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import HeruLogo from '@/components/shared/HeruLogo';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';

// ─── Stakeholder data ───
const PRODUCT_IMAGES = {
  gamers: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
  organizers: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&q=80',
  sponsors: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
  providers: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80',
};

const products = [
  {
    key: 'gamers', label: 'HERU ARENA', tagShort: 'For Gamers',
    icon: Gamepad2, color: 'red', accentHex: '#ff1a1a',
    tagline: 'Compete. Connect. Level Up.',
    desc: 'Register for MENA tournaments, build your team, rank on leaderboards, book pro coaching sessions, and grow your gamer profile.',
    features: ['Live tournament brackets', 'Team management', 'Ranked leaderboards', 'Coach booking', 'Gamer profile & stats'],
    cta: 'Start Competing', link: '/auth/gamer/register', loginLink: '/auth/gamer/login',
    forLink: '/for-gamers', pricingNote: 'Free to compete',
    exampleBill: null,
  },
  {
    key: 'organizers', label: 'HERU BUILDER', tagShort: 'For Organizers',
    icon: Trophy, color: 'purple', accentHex: '#7c3aed',
    tagline: 'Build Events That Sponsors Fund.',
    desc: 'Use the Tournament Builder to hire service providers, define deliverables, create sponsorship packages — and publish your event to the sponsorship radar.',
    features: ['Tournament Builder', 'Service provider booking', 'Sponsorship packages', 'Income & billing dashboard', 'Verification badge'],
    cta: 'Build an Event', link: '/auth/organizer/register', loginLink: '/auth/organizer/login',
    forLink: '/for-organizers', pricingNote: '15% platform fee on sponsorships',
    exampleBill: { label: 'Example', items: [{ name: 'Sponsorship Package Sold', val: 'EGP 10,000' }, { name: 'HERU Platform Fee (15%)', val: '– EGP 1,500' }, { name: 'Organizer Receives', val: 'EGP 8,500', bold: true }] },
  },
  {
    key: 'sponsors', label: 'HERU RADAR', tagShort: 'For Brands',
    icon: Star, color: 'yellow', accentHex: '#eab308',
    tagline: 'Put Your Brand Where Gamers Are.',
    desc: 'Browse curated sponsorship packages, run influencer campaigns, and book managed esports campaigns across the MENA region — all tracked with ROI dashboards.',
    features: ['Sponsorship Radar', 'Influencer marketplace', 'Managed campaigns', 'Corporate gaming events', 'Campaign ROI reports'],
    cta: 'Explore Packages', link: '/auth/sponsor/register', loginLink: '/auth/sponsor/login',
    forLink: '/for-sponsors', pricingNote: 'Free • Starter • Growth • Premium',
    exampleBill: { label: 'Plans from', items: [{ name: 'Starter', val: 'EGP 150K/mo' }, { name: 'Growth', val: 'EGP 250K/mo' }, { name: 'Premium', val: 'EGP 500K/mo', bold: true }] },
  },
  {
    key: 'providers', label: 'HERU GIGS', tagShort: 'For Providers',
    icon: Briefcase, color: 'cyan', accentHex: '#06b6d4',
    tagline: 'Get Paid to Power Esports Events.',
    desc: 'List your services — casting, design, venues, marketing, production, coaching, influencer reach. Get discovered by organizers and sponsors across MENA.',
    features: ['Service listings', 'Custom category fields', 'Booking + escrow', 'Income dashboard', 'Public portfolio'],
    cta: 'List Your Services', link: '/auth/provider/register', loginLink: '/auth/provider/login',
    forLink: '/for-providers', pricingNote: '15% platform fee on bookings',
    exampleBill: { label: 'Example', items: [{ name: 'Service Booking: Venue', val: 'EGP 5,000' }, { name: 'HERU Platform Fee (15%)', val: '– EGP 750' }, { name: 'You receive', val: 'EGP 4,250', bold: true }] },
  },
];

const colorBorder = { red: 'border-red-500/40', purple: 'border-purple-500/40', yellow: 'border-yellow-500/40', cyan: 'border-cyan-500/40' };
const colorBg    = { red: 'bg-red-600', purple: 'bg-purple-600', yellow: 'bg-yellow-500', cyan: 'bg-cyan-500' };
const colorText  = { red: 'text-red-400', purple: 'text-purple-400', yellow: 'text-yellow-400', cyan: 'text-cyan-400' };
const colorBtn   = { red: 'bg-red-600 hover:bg-red-500 text-white', purple: 'bg-purple-600 hover:bg-purple-500 text-white', yellow: 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold', cyan: 'bg-cyan-500 hover:bg-cyan-400 text-white' };
const colorGlow  = { red: 'shadow-red-500/20', purple: 'shadow-purple-500/20', yellow: 'shadow-yellow-500/20', cyan: 'shadow-cyan-500/20' };

const stats = [
  { value: '500+', label: 'Registered Gamers', icon: Users },
  { value: '10+', label: 'Tournaments Hosted', icon: Trophy },
  { value: '20+', label: 'Service Providers', icon: Briefcase },
  { value: 'EGP 130K+', label: 'Prize Pool Distributed', icon: Award },
];

const pricingPlans = {
  gamers: [
    { name: 'Free', price: 'EGP 0', period: '/forever', features: ['Join tournaments', 'Manage 1 team', 'Basic leaderboard', 'Gamer profile'], cta: 'Start Free', highlight: false },
  ],
  organizers: [
    { name: 'Pay-as-you-go', price: '15%', period: ' platform fee', features: ['Unlimited tournaments', 'Builder tool', 'Sponsorship packages', 'Income reports', 'Verification badge'], cta: 'Start Building', highlight: true },
  ],
  sponsors: [
    { name: 'Free', price: 'EGP 0', period: '/mo', features: ['Browse radar', 'View packages', 'Basic analytics', '1 active sponsorship'], cta: 'Start Free', highlight: false },
    { name: 'Starter', price: 'EGP 150K', period: '/mo', features: ['5 active sponsorships', 'Influencer marketplace', 'ROI reports', 'Priority placement'], cta: 'Get Starter', highlight: false },
    { name: 'Growth', price: 'EGP 250K', period: '/mo', features: ['15 active sponsorships', 'Everything in Starter', 'Corporate gaming events', 'Dedicated support'], cta: 'Go Growth', highlight: true },
    { name: 'Premium', price: 'EGP 500K', period: '/mo', features: ['Unlimited sponsorships', 'Everything in Growth', 'Managed campaigns', 'Custom integrations'], cta: 'Go Premium', highlight: false },
  ],
  providers: [
    { name: 'Pay-as-you-go', price: '15%', period: ' platform fee', features: ['Unlimited services', 'Booking management', 'Escrow payments', 'Public portfolio', 'Income analytics'], cta: 'List Services', highlight: true },
  ],
};

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const [loginDropdown, setLoginDropdown] = useState(false);
  const [pricingTab, setPricingTab] = useState('sponsors');
  const navigate = useNavigate();
  const { isAuthenticated, getDashboardPath, loading } = useAuth();

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['public-leaderboard'],
    queryFn: async () => {
      try {
        const data = await apiCall('/leaderboards?limit=10');
        return Array.isArray(data) ? data : data?.entries || data?.data || [];
      } catch { return []; }
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!loading && isAuthenticated) navigate(getDashboardPath(), { replace: true });
  }, [loading, isAuthenticated]); // eslint-disable-line

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden min-h-screen font-['Inter',sans-serif]">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <HeruLogo className="h-8" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/tournaments" className="text-sm text-gray-400 hover:text-white transition">Tournaments</Link>
            <Link to="/for-gamers" className="text-sm text-gray-400 hover:text-white transition">Products</Link>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition">Pricing</a>
            <Link to="/teams" className="text-sm text-gray-400 hover:text-white transition">Teams</Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <button onClick={() => setLoginDropdown(v => !v)} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
                Login <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {loginDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden min-w-56 shadow-2xl">
                    {products.map(p => (
                      <Link key={p.key} to={p.loginLink} onClick={() => setLoginDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition">
                        <p.icon className={`w-4 h-4 ${colorText[p.color]}`} />
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-xs text-gray-500">{p.tagShort}</div>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/auth" className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition hidden md:block shadow-lg shadow-red-600/20">
              Get Started →
            </Link>
            <button onClick={() => setNavOpen(v => !v)} className="md:hidden p-2 text-gray-300 hover:text-white">
              {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {navOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-900/95 border-t border-zinc-800">
              <div className="px-6 py-5 space-y-4">
                <Link to="/tournaments" className="block text-sm text-gray-300 hover:text-white" onClick={() => setNavOpen(false)}>Tournaments</Link>
                <a href="#pricing" className="block text-sm text-gray-300 hover:text-white" onClick={() => setNavOpen(false)}>Pricing</a>
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  {products.map(p => (
                    <Link key={p.key} to={p.loginLink} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white" onClick={() => setNavOpen(false)}>
                      <p.icon className={`w-4 h-4 ${colorText[p.color]}`} /> Login as {p.tagShort.replace('For ', '')}
                    </Link>
                  ))}
                </div>
                <Link to="/auth" className="block w-full bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold text-center" onClick={() => setNavOpen(false)}>
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,26,26,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(220,38,38,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.06 }} />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs text-gray-400 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              The #1 Esports Platform for MENA
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
              The Esports{' '}
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
                Operating System
              </span>
              <br />for MENA
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Four products. One platform. HERU connects gamers, tournament organizers, sponsors, and service providers across Egypt, Saudi Arabia, and UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3.5 rounded-xl text-base font-bold transition shadow-xl shadow-red-600/25">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/tournaments" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3.5 rounded-xl text-base font-medium transition border border-zinc-700">
                <Play className="w-4 h-4" /> Watch Live Events
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 border-y border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center">
              <div className="text-3xl md:text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 4 PRODUCTS ── */}
      <section className="py-24 px-6" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Four Products</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">One Ecosystem. Every Role.</h2>
            <p className="text-gray-400 max-w-xl mx-auto">HERU is a multi-sided marketplace. Each stakeholder gets a dedicated product built specifically for their needs.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {products.map((p, i) => (
              <motion.div key={p.key} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative bg-zinc-900/50 border ${colorBorder[p.color]} rounded-2xl p-8 hover:bg-zinc-900/80 transition-all duration-300 group overflow-hidden`}
                style={{ boxShadow: `0 0 40px -10px ${p.accentHex}20` }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${PRODUCT_IMAGES[p.key]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.07 }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-zinc-900/60" />
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: p.accentHex, transform: 'translate(30%, -30%)' }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${colorBg[p.color]} flex items-center justify-center shadow-xl`} style={{ boxShadow: `0 8px 24px ${p.accentHex}40` }}>
                      <p.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className={`text-xs font-bold ${colorText[p.color]} uppercase tracking-widest bg-zinc-800 px-3 py-1 rounded-full`}>{p.tagShort}</span>
                  </div>
                  <div className="mb-1 text-lg font-black text-white">{p.label}</div>
                  <div className={`text-sm font-bold ${colorText[p.color]} mb-3`}>{p.tagline}</div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{p.desc}</p>
                  <ul className="space-y-2 mb-8">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <CheckCircle2 className={`w-4 h-4 ${colorText[p.color]} flex-shrink-0`} /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <Link to={p.link} className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition ${colorBtn[p.color]}`}>{p.cta}</Link>
                    <Link to={p.forLink} className="px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition">Learn more</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6 bg-zinc-900/30" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-3">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">Transparent. Simple. Fair.</h2>
            <p className="text-gray-400 max-w-xl mx-auto">HERU takes a flat 15% platform fee on transactions. No hidden charges. The platform only earns when you earn.</p>
          </div>

          {/* Pricing tab selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {products.map(p => (
              <button key={p.key} onClick={() => setPricingTab(p.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${pricingTab === p.key ? `${colorBg[p.color]} text-white shadow-lg` : 'bg-zinc-800 text-gray-400 hover:text-white hover:bg-zinc-700'}`}>
                <p.icon className="w-4 h-4" /> {p.tagShort}
              </button>
            ))}
          </div>

          {/* Plans for selected tab */}
          <AnimatePresence mode="wait">
            {products.filter(p => p.key === pricingTab).map(product => (
              <motion.div key={product.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className={`grid gap-6 ${pricingPlans[product.key].length === 1 ? 'max-w-sm mx-auto' : pricingPlans[product.key].length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : pricingPlans[product.key].length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto' : 'md:grid-cols-3 max-w-4xl mx-auto'}`}>
                  {pricingPlans[product.key].map(plan => (
                    <div key={plan.name} className={`relative bg-zinc-900 border rounded-2xl p-6 ${plan.highlight ? `${colorBorder[product.color]} ring-1` : 'border-zinc-800'}`}
                      style={plan.highlight ? { ringColor: product.accentHex } : {}}>
                      {plan.highlight && <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${colorBg[product.color]} text-white`}>Recommended</div>}
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 font-medium mb-1">{plan.name}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">{plan.price}</span>
                          <span className="text-sm text-gray-500">{plan.period}</span>
                        </div>
                      </div>
                      <ul className="space-y-2.5 mb-6">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${colorText[product.color]} flex-shrink-0`} /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link to={product.link} className={`block w-full text-center py-2.5 rounded-xl text-sm font-bold transition ${plan.highlight ? colorBtn[product.color] : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
                        {plan.cta}
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Example bill for this product */}
                {product.exampleBill && (
                  <div className="max-w-sm mx-auto mt-8 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <DollarSign className="w-3.5 h-3.5" /> {product.exampleBill.label} Bill
                    </div>
                    <div className="space-y-2">
                      {product.exampleBill.items.map(item => (
                        <div key={item.name} className={`flex justify-between text-sm ${item.bold ? 'font-bold text-white pt-2 border-t border-zinc-800' : 'text-gray-400'}`}>
                          <span>{item.name}</span>
                          <span className={item.bold ? colorText[product.color] : ''}>{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">How HERU Works</h2>
            <p className="text-gray-400">Three simple steps to launch an esports event ecosystem</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '01', icon: Building2, title: 'Organizer Builds Event', desc: 'Organizer uses the Tournament Builder to plan their event, hire service providers, and define sponsorship packages.', color: 'purple' },
              { num: '02', icon: Star, title: 'Sponsor Buys Package', desc: 'Sponsor browses the radar, selects a package, pays through HERU escrow. Organizer gets funded.', color: 'yellow' },
              { num: '03', icon: Trophy, title: 'Event Goes Live', desc: 'Service providers deliver, gamers compete, organizer confirms delivery, HERU releases payment.', color: 'red' },
            ].map(step => (
              <div key={step.num} className="text-center">
                <div className={`w-14 h-14 rounded-2xl ${colorBg[step.color]} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <div className={`text-xs font-bold ${colorText[step.color]} mb-2 uppercase tracking-widest`}>Step {step.num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section className="py-24 px-6 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-red-400 mb-3 block">HERU ARENA</span>
            <h2 className="text-4xl font-black mb-4">Top Gamers</h2>
            <p className="text-gray-400">The highest-ranked competitors on HERU across the MENA region</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            {leaderboard.length === 0 ? (
              <div className="py-16 text-center">
                <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Leaderboard data loading…</p>
              </div>
            ) : (
              <div>
                {leaderboard.slice(0, 10).map((entry, i) => (
                  <div
                    key={entry.id || i}
                    className={`flex items-center gap-4 px-6 py-4 border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/50 transition-colors ${i === 0 ? 'bg-yellow-500/5' : i === 1 ? 'bg-zinc-400/5' : i === 2 ? 'bg-amber-700/5' : ''}`}
                  >
                    <div className={`w-8 text-center font-black text-sm shrink-0 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-300' : i === 2 ? 'text-amber-600' : 'text-zinc-600'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">{(entry.username || entry.gamer_tag || '?').slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{entry.username || entry.gamer_tag || 'Unknown'}</p>
                      <p className="text-zinc-500 text-xs">{entry.game || 'All Games'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-black">{(entry.score || entry.elo_rating || 0).toLocaleString()}</p>
                      <p className="text-zinc-600 text-xs">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="text-center mt-6">
            <Link to="/leaderboards" className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors font-medium">
              View full leaderboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-b from-zinc-900/0 via-red-950/10 to-zinc-900/0">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to Join HERU?</h2>
          <p className="text-gray-400 text-lg mb-10">Choose your role and get started in under 2 minutes.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(p => (
              <Link key={p.key} to={p.link}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${colorBorder[p.color]} bg-zinc-900/50 hover:bg-zinc-900 transition group`}>
                <div className={`w-10 h-10 rounded-xl ${colorBg[p.color]} flex items-center justify-center`}>
                  <p.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-bold text-white">{p.tagShort.replace('For ', '')}</div>
                <div className={`text-xs ${colorText[p.color]}`}>{p.pricingNote}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div>
              <HeruLogo className="h-8 mb-3" />
              <p className="text-gray-500 text-sm max-w-xs">The esports operating system for the MENA region. Connecting gamers, organizers, sponsors, and service providers.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { title: 'Platform', links: [{ l: 'Tournaments', to: '/tournaments' }, { l: 'Teams', to: '/teams' }, { l: 'Leaderboards', to: '/leaderboards' }] },
                { title: 'Products', links: products.map(p => ({ l: p.tagShort, to: p.forLink })) },
                { title: 'Get Started', links: products.map(p => ({ l: `${p.tagShort.replace('For ', '')} Sign Up`, to: p.link })) },
                { title: 'Login', links: products.map(p => ({ l: `${p.tagShort.replace('For ', '')} Login`, to: p.loginLink })) },
              ].map(col => (
                <div key={col.title}>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{col.title}</div>
                  <ul className="space-y-2">
                    {col.links.map(lnk => (
                      <li key={lnk.l}><Link to={lnk.to} className="text-sm text-gray-400 hover:text-white transition">{lnk.l}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">© 2026 HERU.gg — All rights reserved</p>
            <p className="text-xs text-gray-600">Serving Egypt, Saudi Arabia & UAE 🌍</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
