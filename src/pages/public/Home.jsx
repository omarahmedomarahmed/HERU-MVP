import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import PublicNav from '@/components/public/PublicNav'
import {
  Gamepad2, Building2, Radar, Briefcase,
  Trophy, Star, Zap, ChevronRight,
  ArrowRight, CheckCircle2, Globe, Users,
  TrendingUp, Shield, DollarSign, BarChart3,
  Play, ChevronDown, Sparkles, Award, Target
} from 'lucide-react'

// ─────────────────────────────────────────────
// Images
// ─────────────────────────────────────────────
const HERO_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'
const PRODUCT_IMGS = {
  arena:   'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  builder: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80',
  radar:   'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80',
  gigs:    'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80',
}
const SECTION_BG1 = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1920&q=70'
const SECTION_BG2 = 'https://images.unsplash.com/photo-1627163439134-7a8c47e08208?w=1920&q=70'
const SECTION_BG3 = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1920&q=70'
const TESTIMONIAL_BG = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=70'

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const PRODUCTS = [
  {
    name: 'HERU ARENA',
    label: 'For Gamers',
    tagline: 'Compete. Climb. Connect.',
    desc: 'Join tournaments, build teams, climb leaderboards, and book coaching sessions — all in one place.',
    features: ['Live bracket tournaments', 'Team creation & management', 'Coaching marketplace', 'HERU rank leaderboard'],
    href: '/for-gamers',
    cta: 'Start Competing',
    ctaHref: '/auth/gamer/register',
    color: 'red',
    accent: '#ef4444',
    img: PRODUCT_IMGS.arena,
    bg: 'from-red-900/40 to-red-950/20',
    border: 'border-red-500/20 hover:border-red-500/60',
    glow: 'shadow-red-500/20',
    Icon: Gamepad2,
    stat: '25,000+ Gamers',
  },
  {
    name: 'HERU BUILDER',
    label: 'For Organizers',
    tagline: 'Build events that get funded.',
    desc: 'Create online and offline tournaments, book service providers, build sponsorship packages, and manage everything from one CRM.',
    features: ['Tournament builder (online/offline)', 'Service provider marketplace', 'Sponsorship package creator', 'Tournament CRM'],
    href: '/for-organizers',
    cta: 'Build an Event',
    ctaHref: '/auth/organizer/register',
    color: 'purple',
    accent: '#7c3aed',
    img: PRODUCT_IMGS.builder,
    bg: 'from-purple-900/40 to-purple-950/20',
    border: 'border-purple-500/20 hover:border-purple-500/60',
    glow: 'shadow-purple-500/20',
    Icon: Building2,
    stat: '500+ Events Built',
  },
  {
    name: 'HERU RADAR',
    label: 'For Sponsors',
    tagline: 'Sponsor esports. Measure everything.',
    desc: 'Browse live sponsorship opportunities, track your ROI, hire influencers, and build corporate activations at scale.',
    features: ['Sponsorship radar', 'ROI & performance tracking', 'Influencer hiring', 'Corporate event builder'],
    href: '/for-sponsors',
    cta: 'Explore Radar',
    ctaHref: '/auth/sponsor/register',
    color: 'yellow',
    accent: '#eab308',
    img: PRODUCT_IMGS.radar,
    bg: 'from-yellow-900/30 to-yellow-950/10',
    border: 'border-yellow-500/20 hover:border-yellow-500/60',
    glow: 'shadow-yellow-500/20',
    Icon: Radar,
    stat: 'EGP 2M+ In Deals',
  },
  {
    name: 'HERU GIGs',
    label: 'For Service Providers',
    tagline: 'Get paid to power esports.',
    desc: 'List your services — venue, production, coaching, talent, marketing — and get booked by organizers and sponsors across MENA.',
    features: ['9 service categories', 'Escrow-protected payouts', 'Public portfolio', 'Rating & reviews'],
    href: '/for-providers',
    cta: 'List Your Services',
    ctaHref: '/auth/provider/register',
    color: 'cyan',
    accent: '#06b6d4',
    img: PRODUCT_IMGS.gigs,
    bg: 'from-cyan-900/30 to-cyan-950/10',
    border: 'border-cyan-500/20 hover:border-cyan-500/60',
    glow: 'shadow-cyan-500/20',
    Icon: Briefcase,
    stat: '85% Payout Rate',
  },
]

const STATS = [
  { label: 'Tournaments Run',  value: '500+',    Icon: Trophy,     color: 'text-red-400' },
  { label: 'Active Gamers',    value: '25,000+', Icon: Gamepad2,   color: 'text-purple-400' },
  { label: 'EGP in Prizes',    value: '2M+',     Icon: Star,       color: 'text-yellow-400' },
  { label: 'MENA Countries',   value: '6',       Icon: Globe,      color: 'text-cyan-400' },
]

const HOW_IT_WORKS = [
  {
    step: '01', role: 'Organizer', color: 'text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    desc: 'Creates a tournament in HERU BUILDER. Books service providers, sets prize pool, enables sponsorship radar.',
    icon: Building2,
  },
  {
    step: '02', role: 'Sponsor', color: 'text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    desc: 'Discovers the event on HERU RADAR, buys a sponsorship package, and tracks ROI in real time.',
    icon: Radar,
  },
  {
    step: '03', role: 'Service Provider', color: 'text-cyan-400', dot: 'bg-cyan-500', border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    desc: 'Gets booked via HERU GIGs for production, branding, venue, or talent. Delivers and gets paid via escrow.',
    icon: Briefcase,
  },
  {
    step: '04', role: 'Gamer', color: 'text-red-400', dot: 'bg-red-500', border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    desc: 'Registers on HERU ARENA, joins the tournament, competes, and climbs the global leaderboard.',
    icon: Gamepad2,
  },
]

const TIER_PREVIEW = [
  { name: 'Free',      price: 'EGP 0',        period: '/month', highlight: false, desc: 'One-off access to all packages' },
  { name: 'Community', price: 'EGP 150,000',  period: '/month', highlight: true,  desc: '2 Online sponsorships / month' },
  { name: 'Premium',   price: 'EGP 300,000',  period: '/month', highlight: false, desc: '2 Online + 1 Offline / month' },
]

const TESTIMONIALS = [
  {
    quote: "HERU BUILDER let me run my first funded tournament in 3 days. The sponsorship system is unlike anything else in MENA.",
    name: "Ahmed K.",
    role: "Tournament Organizer",
    avatar: "AK",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    quote: "I booked 4 tournaments in my first month on HERU GIGs. Escrow protection gave me full confidence.",
    name: "Sara M.",
    role: "Media Production",
    avatar: "SM",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    quote: "HERU RADAR gave us real ROI metrics on our sponsorship for the first time. We renewed 3 months in a row.",
    name: "Omar R.",
    role: "Brand Manager",
    avatar: "OR",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
]

const FEATURES_GRID = [
  { Icon: Shield,     title: 'Escrow Protection',      desc: 'All payments held securely until delivery is confirmed.',       color: 'text-green-400', bg: 'bg-green-500/10' },
  { Icon: BarChart3,  title: 'Real-Time Analytics',    desc: 'Track ROI, views, reach, and sponsor performance live.',        color: 'text-blue-400',  bg: 'bg-blue-500/10' },
  { Icon: Users,      title: 'MENA Community',         desc: '25,000+ gamers across Egypt, Saudi Arabia, UAE & beyond.',     color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { Icon: Target,     title: 'Multi-Sided Marketplace', desc: 'Gamers, organizers, sponsors and providers — all connected.',  color: 'text-red-400',   bg: 'bg-red-500/10' },
  { Icon: Trophy,     title: 'Live Brackets',          desc: 'Real-time tournament brackets with auto-advance and seeding.',  color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { Icon: DollarSign, title: '85% Payout to Providers', desc: 'Only 15% platform fee. You keep the majority every time.',   color: 'text-cyan-400',  bg: 'bg-cyan-500/10' },
]

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const colorMap = {
  red:    { badge: 'bg-red-500/15 text-red-400 border-red-500/30',    icon: 'text-red-400',    cta: 'bg-red-600 hover:bg-red-500',       check: 'text-red-400',    stat: 'text-red-300' },
  purple: { badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: 'text-purple-400', cta: 'bg-purple-700 hover:bg-purple-600', check: 'text-purple-400', stat: 'text-purple-300' },
  yellow: { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: 'text-yellow-400', cta: 'bg-yellow-600 hover:bg-yellow-500', check: 'text-yellow-400', stat: 'text-yellow-300' },
  cyan:   { badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: 'text-cyan-400',    cta: 'bg-cyan-600 hover:bg-cyan-500',     check: 'text-cyan-400',   stat: 'text-cyan-300' },
}

function ProductCard({ p }) {
  const c = colorMap[p.color]
  return (
    <div className={`group flex flex-col rounded-2xl border bg-gradient-to-br ${p.bg} ${p.border}
                     overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:${p.glow}`}>
      {/* Product Image */}
      <div className="relative h-44 overflow-hidden">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105 transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span className={`text-xs font-bold uppercase tracking-widest ${c.stat}`}>{p.stat}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>{p.label}</span>
        </div>
        <div className={`absolute top-3 left-3 p-2 rounded-xl bg-black/40 backdrop-blur-sm ${c.icon}`}>
          <p.Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex flex-col flex-1 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{p.name}</p>
        <h3 className="text-xl font-black text-white mb-2 leading-tight">{p.tagline}</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{p.desc}</p>
        <ul className="space-y-1.5 mb-6">
          {p.features.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${c.check}`} />{f}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex gap-2">
          <Link to={p.ctaHref}
            className={`flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${c.cta}`}>
            {p.cta}
          </Link>
          <Link to={p.href}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
            Learn more
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Home() {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['home-leaderboard'],
    queryFn: () => apiCall('/leaderboards?limit=5').then(d => d?.entries || d?.data || (Array.isArray(d) ? d : [])),
    staleTime: 5 * 60_000,
  })

  const { data: liveTournaments = [] } = useQuery({
    queryKey: ['home-tournaments'],
    queryFn: () => apiCall('/tournaments?status=live&limit=3').then(d => Array.isArray(d) ? d : d?.tournaments || []),
    staleTime: 60_000,
  })

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 pb-0 px-4 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/80" />
        </div>
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-red-600/8 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-600/6 blur-[140px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full py-20">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-8 uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            Now Live Across MENA — Egypt · Saudi Arabia · UAE
          </div>

          {/* Main headline */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[1.0] tracking-tight mb-8 max-w-5xl">
            The Esports{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Operating System
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 opacity-60" />
            </span>
            <br />
            <span className="text-gray-300">for MENA.</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl leading-relaxed mb-12">
            Four products. One platform. Gamers <span className="text-red-400 font-semibold">compete</span>. Organizers <span className="text-purple-400 font-semibold">build</span>.
            Sponsors <span className="text-yellow-400 font-semibold">invest</span>. Service providers <span className="text-cyan-400 font-semibold">get paid</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-20">
            <Link to="/auth"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold
                         bg-red-600 hover:bg-red-500 text-white transition-all text-base shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5">
              <Zap className="h-5 w-5" />Get Started Free
            </Link>
            <Link to="/tournaments"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold
                         bg-white/8 hover:bg-white/12 text-white transition-all text-base border border-white/10 hover:border-white/20">
              Browse Tournaments <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
              View pricing <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mini product pills */}
          <div className="flex flex-wrap gap-3">
            {PRODUCTS.map(p => (
              <Link key={p.name} to={p.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all hover:-translate-y-0.5 ${colorMap[p.color].badge}`}>
                <p.Icon className="h-3.5 w-3.5" />
                {p.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-5 w-5 text-gray-500 animate-bounce" />
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-16 px-4 border-y border-white/5 overflow-hidden">
        <img src={SECTION_BG1} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.05]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ label, value, Icon, color }) => (
              <div key={label} className="text-center group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 mb-4 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-sm text-gray-500 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <img src={SECTION_BG2} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-white/10" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Four Products
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Everything esports needs.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              One platform connecting every stakeholder in the MENA esports ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PRODUCTS.map(p => <ProductCard key={p.name} p={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/pricing" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl">
              Compare all pricing plans <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img src={SECTION_BG3} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              The Flywheel
            </div>
            <h2 className="text-5xl font-black text-white mb-4">How it works</h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Each stakeholder fuels the next. One action creates value for all four.
            </p>
          </div>

          {/* Flywheel diagram (desktop) */}
          <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
            {HOW_IT_WORKS.map(({ step, role, color, dot, desc, icon: Icon, bg, border }, i) => (
              <div key={step} className={`relative p-6 rounded-2xl ${bg} border ${border} overflow-hidden group hover:-translate-y-1 transition-all duration-300`}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className={`h-5 w-5 ${color} opacity-40`} />
                  </div>
                )}
                <div className={`text-6xl font-black mb-4 ${color} opacity-15`}>{step}</div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <p className={`text-sm font-black ${color}`}>{role}</p>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile version */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_IT_WORKS.map(({ step, role, color, dot, desc, icon: Icon, bg, border }) => (
              <div key={step} className={`p-6 rounded-2xl ${bg} border ${border}`}>
                <div className={`text-5xl font-black mb-3 ${color} opacity-15`}>{step}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <p className={`text-sm font-bold ${color}`}>{role}</p>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="relative py-28 px-4 overflow-hidden bg-gradient-to-b from-white/2 to-transparent">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">Built for scale.</h2>
            <p className="text-gray-400 text-lg">Every feature you need to run a professional esports business.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES_GRID.map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="group flex gap-4 p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE TOURNAMENTS ── */}
      {liveTournaments.length > 0 && (
        <section className="relative py-24 px-4 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-zinc-950" />
          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-widest text-green-400">Live Now</p>
                </div>
                <h2 className="text-3xl font-black text-white">Active Tournaments</h2>
              </div>
              <Link to="/tournaments"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {liveTournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-white/4 border border-white/8
                             hover:border-red-500/40 hover:bg-red-500/5 transition-all duration-300">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-red-700/40 to-red-900/40
                                  flex items-center justify-center shrink-0 overflow-hidden">
                    {t.tournament_image
                      ? <img src={t.tournament_image} alt="" className="h-full w-full object-cover" />
                      : <Trophy className="h-6 w-6 text-red-400/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{t.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{t.game} · {t.max_teams || '?'} teams</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
                    </span>
                    <span className="text-sm font-semibold text-yellow-400">EGP {Number(t.prizepool_total || 0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img src={TESTIMONIAL_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Award className="h-3.5 w-3.5" /> Trusted Across MENA
            </div>
            <h2 className="text-5xl font-black text-white mb-4">What our users say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-8 rounded-2xl bg-white/4 border border-white/8 hover:border-white/15 transition-all duration-300 flex flex-col">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">"{t.quote}"</blockquote>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.bg} flex items-center justify-center text-sm font-black ${t.color}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className={`text-xs ${t.color}`}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      {leaderboard.length > 0 && (
        <section className="py-24 px-4">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-1">HERU Rank</p>
                <h2 className="text-3xl font-black text-white">Top Players</h2>
              </div>
              <Link to="/leaderboards"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl">
                Full leaderboard <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((e, i) => (
                <div key={e.id || i}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/4 border border-white/8 hover:border-yellow-500/20 transition-all">
                  <span className="w-8 text-center text-sm font-bold">
                    {i < 3 ? <span className="text-lg">{['🥇','🥈','🥉'][i]}</span> : <span className="text-gray-500">#{i + 1}</span>}
                  </span>
                  <span className="flex-1 font-semibold text-white truncate">
                    {e.username || e.full_name || 'Player'}
                  </span>
                  <span className="text-sm font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full">
                    {(e.score || 0).toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── RADAR CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-yellow-900/25 to-yellow-950/10
                          border border-yellow-500/20 p-12 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=70" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/80 to-zinc-950/90" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 mb-6">
                <Radar className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4 ml-4">
                HERU RADAR
              </div>
              <h2 className="text-4xl font-black text-white mb-3">Ready to sponsor esports?</h2>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto text-lg">
                Browse live sponsorship packages, track ROI, hire influencers, and build branded
                esports activations across MENA.
              </p>
              {/* Tier pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-10">
                {TIER_PREVIEW.map(t => (
                  <div key={t.name}
                    className={`px-6 py-4 rounded-2xl border text-center min-w-[150px]
                      ${t.highlight ? 'bg-yellow-500/15 border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'bg-white/5 border-white/10'}`}>
                    <p className={`text-sm font-black mb-1 ${t.highlight ? 'text-yellow-400' : 'text-white'}`}>{t.name}</p>
                    <p className={`text-xs font-bold ${t.highlight ? 'text-yellow-300' : 'text-gray-300'}`}>
                      {t.price}<span className="text-gray-500 font-normal">{t.period}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth/sponsor/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold
                             bg-yellow-500 hover:bg-yellow-400 text-black transition-all text-base shadow-lg shadow-yellow-500/30">
                  Start Sponsoring <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/for-sponsors"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold
                             bg-white/8 hover:bg-white/12 text-white transition-all text-base border border-white/15">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BAND ── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-4">Join MENA's #1 esports platform.</h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Whether you compete, organize, sponsor, or provide — HERU.gg has a product built for you.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {PRODUCTS.map(p => (
              <Link key={p.name} to={p.ctaHref}
                className={`py-4 px-4 rounded-2xl border text-center transition-all hover:-translate-y-1 ${colorMap[p.color].badge}`}>
                <p.Icon className="h-6 w-6 mx-auto mb-2" />
                <p className="text-xs font-black">{p.label.split(' ')[1]}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-16">
            <div className="col-span-2">
              <p className="text-2xl font-black text-white mb-2">HERU<span className="text-red-500">.</span>gg</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-xs">
                The esports operating system for MENA. Connecting gamers, organizers, sponsors and service providers.
              </p>
              <div className="flex gap-3">
                {PRODUCTS.map(p => (
                  <Link key={p.name} to={p.href}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[p.color].badge} transition-all hover:scale-110`}>
                    <p.Icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
            {[
              ['Products', PRODUCTS.map(p => [p.name, p.href])],
              ['Platform', [['Tournaments','/tournaments'],['Teams','/teams'],['Coaches','/coaches'],['Leaderboards','/leaderboards'],['Influencers','/influencers']]],
              ['Get Started', [['Compete as Gamer','/auth/gamer/register'],['Build a Tournament','/auth/organizer/register'],['Sponsor Events','/auth/sponsor/register'],['List Services','/auth/provider/register']]],
              ['Sign In', [['Gamer Login','/auth/gamer/login'],['Organizer Login','/auth/organizer/login'],['Sponsor Login','/auth/sponsor/login'],['Provider Login','/auth/provider/login'],['Pricing','/pricing']]],
            ].map(([heading, links]) => (
              <div key={heading}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{heading}</p>
                <ul className="space-y-2.5">
                  {links.map(([label, href]) => (
                    <li key={href}><Link to={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 HERU.gg — All rights reserved. Built for MENA esports.</p>
            <p className="text-xs text-gray-600">15% platform fee on all transactions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
