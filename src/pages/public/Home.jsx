import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, ChevronDown, Trophy, Users, Globe, TrendingUp,
  CheckCircle2, Star, Shield, BarChart3, Zap, Play,
  Building2, Radar, Briefcase, Gamepad2, Target, DollarSign,
  ChevronRight
} from 'lucide-react'

// ─── Video Sources (Pexels esports footage) ─────────────────────────────────
const HERO_VIDEO = 'https://www.pexels.com/video/8728384/download/?fps=25&h=1080&w=1920'
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'
const PRODUCTS_BG = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80'
const FLYWHEEL_BG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&q=80'
const INFRA_BG = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80'
const ENTERPRISE_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
const CTA_BG = 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=1920&q=80'

// ─── Data ────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'HERU Arena',
    label: 'For Gamers',
    tagline: 'Compete. Improve. Build your esports identity.',
    desc: 'The competitive home for every MENA gamer. Join tournaments, build teams, climb leaderboards, and book coaching — all in one place.',
    features: ['Live bracket tournaments', 'Team creation and management', 'Coaching marketplace', 'HERU rank leaderboard', 'Achievement system'],
    href: '/for-gamers',
    ctaHref: '/auth/gamer/register',
    cta: 'Start Competing',
    color: 'red',
    accent: '#ef4444',
    gradFrom: 'from-red-950/60',
    gradTo: 'to-red-900/20',
    border: 'border-red-500/20',
    hoverBorder: 'hover:border-red-500/50',
    pill: 'bg-red-500/10 border-red-500/20 text-red-400',
    ctaBg: 'bg-red-600 hover:bg-red-500 shadow-red-600/25',
    check: 'text-red-400',
    Icon: Gamepad2,
    stat: '25,000+ Gamers',
  },
  {
    name: 'HERU Builder',
    label: 'For Organizers',
    tagline: 'Build tournaments. Manage operations. Monetize events.',
    desc: 'Professional tournament infrastructure for MENA organizers. Create, fund, and run world-class esports events at any scale.',
    features: ['Full tournament builder', 'Service provider marketplace', 'Sponsorship package creator', 'Tournament CRM & operations', 'Multi-bracket formats'],
    href: '/for-organizers',
    ctaHref: '/auth/organizer/register',
    cta: 'Build an Event',
    color: 'purple',
    accent: '#7c3aed',
    gradFrom: 'from-purple-950/60',
    gradTo: 'to-purple-900/20',
    border: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    pill: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    ctaBg: 'bg-purple-700 hover:bg-purple-600 shadow-purple-700/25',
    check: 'text-purple-400',
    Icon: Building2,
    stat: '500+ Events Built',
  },
  {
    name: 'HERU Radar',
    label: 'For Sponsors & Brands',
    tagline: 'Discover opportunities. Activate campaigns. Reach gaming audiences.',
    desc: 'The intelligence layer for brands entering esports. Browse packages, track ROI, hire influencers, and run managed activations.',
    features: ['Sponsorship radar & discovery', 'Real-time ROI tracking', 'Influencer marketplace', 'Managed campaign activations', 'Corporate event builder'],
    href: '/for-sponsors',
    ctaHref: '/auth/sponsor/register',
    cta: 'Explore Radar',
    color: 'yellow',
    accent: '#eab308',
    gradFrom: 'from-yellow-950/50',
    gradTo: 'to-yellow-900/10',
    border: 'border-yellow-500/20',
    hoverBorder: 'hover:border-yellow-500/50',
    pill: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    ctaBg: 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/25',
    check: 'text-yellow-400',
    Icon: Radar,
    stat: 'EGP 2M+ In Deals',
  },
  {
    name: 'HERU Gigs',
    label: 'For Service Providers',
    tagline: 'Showcase services. Get discovered. Get booked.',
    desc: 'The professional services marketplace for the esports industry. List your expertise and get hired by organizers across MENA.',
    features: ['9 service categories', 'Escrow-protected payments', 'Public portfolio & reviews', 'Organic discovery', 'Direct booking system'],
    href: '/for-providers',
    ctaHref: '/auth/provider/register',
    cta: 'List Your Services',
    color: 'cyan',
    accent: '#06b6d4',
    gradFrom: 'from-cyan-950/50',
    gradTo: 'to-cyan-900/10',
    border: 'border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/50',
    pill: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    ctaBg: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/25',
    check: 'text-cyan-400',
    Icon: Briefcase,
    stat: '85% Payout Rate',
  },
]

const STATS = [
  { label: 'Tournaments Run',   value: '500+',    Icon: Trophy,     color: 'text-red-400',    bg: 'bg-red-500/8' },
  { label: 'Active Gamers',     value: '25,000+', Icon: Gamepad2,   color: 'text-purple-400', bg: 'bg-purple-500/8' },
  { label: 'EGP in Prize Pools', value: '2M+',   Icon: Trophy,     color: 'text-yellow-400', bg: 'bg-yellow-500/8' },
  { label: 'MENA Countries',    value: '6',       Icon: Globe,      color: 'text-cyan-400',   bg: 'bg-cyan-500/8' },
]

const FLYWHEEL = [
  {
    step: '01', role: 'Organizer',
    action: 'Creates a tournament using HERU Builder, books service providers, and opens sponsorship packages.',
    color: 'text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5',
    Icon: Building2,
  },
  {
    step: '02', role: 'Gamers',
    action: 'Register on HERU Arena, join the event, compete in live brackets, and climb MENA leaderboards.',
    color: 'text-red-400', dot: 'bg-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5',
    Icon: Gamepad2,
  },
  {
    step: '03', role: 'Sponsors',
    action: 'Discover the event on HERU Radar, activate a sponsorship package, and track live ROI.',
    color: 'text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5',
    Icon: Radar,
  },
  {
    step: '04', role: 'Service Providers',
    action: 'Execute production, venue, marketing, and talent through HERU Gigs — secured via escrow.',
    color: 'text-cyan-400', dot: 'bg-cyan-500', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5',
    Icon: Briefcase,
  },
]

const INFRASTRUCTURE = [
  { Icon: Shield,     title: 'Escrow Protection',      desc: 'All service payments held securely until delivery confirmation.',   color: 'text-green-400', bg: 'bg-green-500/8' },
  { Icon: BarChart3,  title: 'Real-Time Analytics',    desc: 'Live ROI tracking, reach metrics, and sponsor performance data.',   color: 'text-blue-400',  bg: 'bg-blue-500/8' },
  { Icon: Users,      title: 'MENA Community',         desc: '25,000+ gamers across Egypt, Saudi Arabia, UAE and beyond.',       color: 'text-purple-400', bg: 'bg-purple-500/8' },
  { Icon: Target,     title: 'Four-Sided Marketplace', desc: 'Gamers, organizers, sponsors, and providers — fully connected.',   color: 'text-red-400',   bg: 'bg-red-500/8' },
  { Icon: Trophy,     title: 'Live Bracket Engine',    desc: 'Real-time tournament brackets with auto-advance and seeding.',     color: 'text-yellow-400', bg: 'bg-yellow-500/8' },
  { Icon: DollarSign, title: '85% Payout to Providers', desc: '15% platform fee only. Service providers keep the majority.',    color: 'text-cyan-400',  bg: 'bg-cyan-500/8' },
]

const ENTERPRISE_USE_CASES = [
  { label: 'Brands', desc: 'Activate esports marketing at scale with managed campaigns and full reporting.' },
  { label: 'Publishers', desc: 'Run official title-sanctioned tournaments with structured brackets and leaderboards.' },
  { label: 'Communities', desc: 'Build private leagues, scrims, and ranked brackets for your player base.' },
  { label: 'Tournament Operators', desc: 'Manage complex multi-stage events with full operational infrastructure.' },
  { label: 'Gaming Centers', desc: 'Host local events and expand reach through regional tournament networks.' },
  { label: 'Agencies', desc: 'Deliver end-to-end esports productions through the HERU Gigs marketplace.' },
]

const TESTIMONIALS = [
  {
    quote: "HERU Builder let me run my first fully funded tournament in under 72 hours. The sponsorship infrastructure is unlike anything else in the MENA market.",
    name: "Ahmed K.",
    role: "Tournament Organizer — Egypt",
    avatar: "AK",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    quote: "Within 30 days of joining HERU Gigs I had secured four bookings. The escrow system gave me complete confidence in every transaction.",
    name: "Sara M.",
    role: "Media Production — Cairo",
    avatar: "SM",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    quote: "HERU Radar delivered measurable ROI data on our sponsorship for the first time. We renewed three consecutive months based entirely on the analytics.",
    name: "Omar R.",
    role: "Brand Manager — Saudi Arabia",
    avatar: "OR",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
]

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedStat({ value, label, Icon, color, bg }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <div ref={ref} className="text-center group">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${bg} mb-5 ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-6 w-6" />
      </div>
      <motion.p
        className="text-5xl font-black text-white mb-2 tabular-nums"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-zinc-500 uppercase tracking-wide font-medium">{label}</p>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ p, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br ${p.gradFrom} ${p.gradTo}
                   ${p.border} ${p.hoverBorder} overflow-hidden transition-all duration-500
                   hover:-translate-y-2 hover:shadow-2xl cursor-pointer`}
    >
      {/* Entire card is a link */}
      <Link to={p.href} className="absolute inset-0 z-0" aria-label={p.name} />
      <div className="p-7 flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border ${p.pill} mb-3`}>
              {p.label}
            </span>
            <h3 className="text-xl font-black text-white leading-tight">{p.name}</h3>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${p.pill} group-hover:scale-110 transition-transform`}>
            <p.Icon className="h-5 w-5" />
          </div>
        </div>

        <p className="text-sm font-semibold text-zinc-300 mb-3 leading-snug">{p.tagline}</p>
        <p className="text-sm text-zinc-500 leading-relaxed mb-5">{p.desc}</p>

        <ul className="space-y-2 mb-6 flex-1">
          {p.features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
              <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${p.check}`} />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          <p className={`text-xs font-bold uppercase tracking-widest ${p.check} opacity-70`}>{p.stat}</p>
          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
            <Link to={p.ctaHref}
              className={`flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${p.ctaBg} relative z-20`}>
              {p.cta}
            </Link>
            <Link to={p.href}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 transition-all relative z-20">
              Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)

  const { data: liveTournaments = [] } = useQuery({
    queryKey: ['home-tournaments'],
    queryFn: () => apiCall('/tournaments?status=live&limit=3').then(d => Array.isArray(d) ? d : d?.tournaments || []),
    staleTime: 60_000,
  })

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['home-leaderboard'],
    queryFn: () => apiCall('/leaderboards?limit=5').then(d => d?.entries || d?.data || (Array.isArray(d) ? d : [])),
    staleTime: 5 * 60_000,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-25' : 'opacity-0'}`}
            poster={HERO_FALLBACK}
          >
            <source src="https://www.pexels.com/video/8728384/download/?fps=25&h=1080&w=1920" type="video/mp4" />
            <source src="https://www.pexels.com/video/7915440/download/?fps=25&h=1080&w=1920" type="video/mp4" />
          </video>
          {!videoLoaded && (
            <img src={HERO_FALLBACK} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-zinc-950/70" />
        </div>

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-[700px] h-[700px] rounded-full bg-red-600/6 blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/6 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[160px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24">
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-500/8 border border-red-500/20 text-red-400 text-xs font-bold mb-8 uppercase tracking-[0.15em]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Live Across MENA — Egypt · Saudi Arabia · UAE
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-7 max-w-5xl"
          >
            The Operating System{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">
                for Esports.
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-red-500 to-orange-400 opacity-50" />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-400 max-w-3xl leading-relaxed mb-10"
          >
            Four integrated products powering every stakeholder in the esports industry.
            Gamers <span className="text-red-400 font-semibold">compete</span>.
            Organizers <span className="text-purple-400 font-semibold">build</span>.
            Sponsors <span className="text-yellow-400 font-semibold">activate</span>.
            Service providers <span className="text-cyan-400 font-semibold">execute</span>.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4 mb-16"
          >
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold
                         bg-red-600 hover:bg-red-500 text-white transition-all text-[15px]
                         shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5">
              Get Started
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link to="/for-gamers"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold
                         bg-white/6 hover:bg-white/10 text-white transition-all text-[15px]
                         border border-white/10 hover:border-white/20">
              Explore Products
            </Link>
          </motion.div>

          {/* Product Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-2.5"
          >
            {PRODUCTS.map(p => (
              <Link key={p.name} to={p.href}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-lg ${p.pill}`}>
                <p.Icon className="h-3.5 w-3.5" />
                {p.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4 text-zinc-600 animate-bounce" />
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-6" />
          <div className="absolute inset-0 bg-zinc-950/92" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {STATS.map((s) => (
              <AnimatedStat key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ECOSYSTEM / PRODUCTS ─────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={PRODUCTS_BG} alt="" className="w-full h-full object-cover opacity-6" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/92 to-zinc-950" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-white/8" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              The HERU Ecosystem
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
              Four products. One platform.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Every stakeholder in the esports industry has a dedicated product — built to work together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {PRODUCTS.map((p, i) => <ProductCard key={p.name} p={p} index={i} />)}
          </div>

          <div className="text-center mt-10">
            <Link to="/pricing"
              className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors border border-white/8 hover:border-white/15 px-6 py-3 rounded-xl">
              Compare all pricing plans
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PROBLEM SECTION ──────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/5 to-transparent" />
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1613490900234-4b484862e5d4?w=1920&q=5" alt="" className="w-full h-full object-cover opacity-5" />
          <div className="absolute inset-0 bg-zinc-950/5" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 mb-5">
                The Problem
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Esports is fragmented.<br />
                <span className="text-zinc-500">HERU connects it.</span>
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                Gamers, organizers, brands, and service providers all currently operate in disconnected systems — with no unified infrastructure, no visibility across stakeholders, and no reliable way to transact.
              </p>
              <p className="text-zinc-300 text-base leading-relaxed">
                HERU is the connective tissue of the esports economy. Every product in our ecosystem is designed to serve one stakeholder — while feeding value to all the others.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Gamers', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5', issue: 'No unified platform to compete, track progress, and build a public identity.' },
                { label: 'Organizers', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', issue: 'No infrastructure to fund, staff, and manage professional events efficiently.' },
                { label: 'Brands', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', issue: 'No transparent market to discover opportunities and measure real sponsorship ROI.' },
                { label: 'Service Providers', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', issue: 'No professional marketplace to showcase expertise and get paid reliably.' },
              ].map(item => (
                <div key={item.label} className={`p-5 rounded-2xl border ${item.border} ${item.bg}`}>
                  <p className={`text-sm font-black mb-2 ${item.color}`}>{item.label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.issue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW THE ECOSYSTEM WORKS (FLYWHEEL) ──────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={FLYWHEEL_BG} alt="" className="w-full h-full object-cover opacity-7" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/93 to-zinc-950" />
        </div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              The Marketplace Flywheel
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">How the ecosystem works</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              One action creates value for all four stakeholders. The cycle compounds.
            </p>
          </div>

          {/* Desktop flywheel */}
          <div className="hidden lg:grid grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8">
            {FLYWHEEL.map(({ step, role, action, color, dot, bg, border, Icon }, i) => (
              <div key={step} className={`relative p-7 ${bg} group hover:bg-white/3 transition-all duration-300`}>
                <div className="mb-5">
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1`}>{step}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`h-2 w-2 rounded-full ${dot}`} />
                    <p className={`text-base font-black ${color}`}>{role}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${border} ${bg} mb-5`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{action}</p>
                {i < FLYWHEEL.length - 1 && (
                  <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                    <div className={`w-7 h-7 rounded-full bg-zinc-900 border ${border} flex items-center justify-center`}>
                      <ArrowRight className={`h-3.5 w-3.5 ${color} opacity-60`} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile flywheel */}
          <div className="lg:hidden space-y-3">
            {FLYWHEEL.map(({ step, role, action, color, dot, bg, border, Icon }) => (
              <div key={step} className={`p-6 rounded-2xl ${bg} border ${border}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <p className={`text-sm font-black ${color}`}>{role}</p>
                  <span className="text-xs text-zinc-700 ml-auto">{step}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-zinc-600 mb-5">HERU powers the entire cycle — infrastructure, payments, analytics, operations.</p>
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/8 hover:bg-white/12 text-white text-sm transition-all border border-white/10 hover:border-white/20">
              Join the Ecosystem
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── INFRASTRUCTURE / FEATURES ────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={INFRA_BG} alt="" className="w-full h-full object-cover opacity-6" />
          <div className="absolute inset-0 bg-zinc-950/92" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
              Built for scale. Designed for professionals.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Every feature in the HERU ecosystem is production-grade infrastructure for the esports industry.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INFRASTRUCTURE.map(({ Icon, title, desc, color, bg }) => (
              <div key={title}
                className="group flex gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all duration-300 card-hover">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${color} group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1.5 text-[15px]">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE TOURNAMENTS ─────────────────────────────────────────── */}
      {liveTournaments.length > 0 && (
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent" />
          <div className="max-w-4xl mx-auto relative">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-green-400">Live Now</p>
                </div>
                <h2 className="text-3xl font-black text-white">Active Tournaments</h2>
              </div>
              <Link to="/tournaments"
                className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors border border-white/8 hover:border-white/15 px-4 py-2 rounded-xl">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {liveTournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`}
                  className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/8
                             hover:border-red-500/30 hover:bg-red-500/4 transition-all duration-300">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-700/40 to-red-900/40 flex items-center justify-center shrink-0 overflow-hidden">
                    {t.tournament_image
                      ? <img src={t.tournament_image} alt="" className="h-full w-full object-cover" />
                      : <Trophy className="h-5 w-5 text-red-400/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate text-[15px]">{t.name}</p>
                    <p className="text-sm text-zinc-500 mt-0.5">{t.game} · {t.max_teams || '?'} teams</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
                    </span>
                    <span className="text-sm font-bold text-yellow-400">EGP {Number(t.prizepool_total || 0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── TRACTION ─────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">
                Traction & Growth
              </span>
              <h2 className="text-4xl font-black text-white mb-6">
                The MENA esports industry runs on HERU.
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">
                From grassroots community tournaments to professionally produced events with corporate sponsorships — HERU is the backbone of competitive gaming infrastructure across MENA.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: '500+', label: 'Events built', color: 'text-red-400' },
                  { value: '25K+', label: 'Active gamers', color: 'text-purple-400' },
                  { value: 'EGP 2M+', label: 'In prize pools', color: 'text-yellow-400' },
                  { value: '6', label: 'MENA countries', color: 'text-cyan-400' },
                ].map(item => (
                  <div key={item.label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/8">
                    <p className={`text-3xl font-black ${item.color} mb-1`}>{item.value}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide">{item.label}</p>
                  </div>
                ))}
              </div>
              <Link to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20">
                Join the Platform
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`p-6 rounded-2xl border transition-all duration-500 ${
                    activeTestimonial === i
                      ? 'bg-white/6 border-white/15 opacity-100'
                      : 'bg-white/[0.02] border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-zinc-300 text-sm leading-relaxed mb-4">"{t.quote}"</blockquote>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.bg} flex items-center justify-center text-xs font-black ${t.color}`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className={`text-xs ${t.color}`}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 justify-center mt-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeTestimonial === i ? 'bg-white w-6' : 'bg-white/20 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ENTERPRISE ───────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={ENTERPRISE_BG} alt="" className="w-full h-full object-cover opacity-7" />
          <div className="absolute inset-0 bg-zinc-950/93" />
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              Enterprise & Institutional
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">
              Infrastructure for the entire industry.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              HERU is not just a platform — it is the operating infrastructure for the MENA esports economy.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Brands', desc: 'Activate esports marketing at scale with managed campaigns and full reporting.', href: '/for-sponsors' },
              { label: 'Publishers', desc: 'Run official title-sanctioned tournaments with structured brackets and leaderboards.', href: '/for-publishers' },
              { label: 'Communities', desc: 'Build private leagues, scrims, and ranked brackets for your player base.', href: '/for-organizers' },
              { label: 'Tournament Operators', desc: 'Manage complex multi-stage events with full operational infrastructure.', href: '/for-organizers' },
              { label: 'Gaming Centers', desc: 'Host local events and expand reach through regional tournament networks.', href: '/for-organizers' },
              { label: 'Agencies', desc: 'Deliver end-to-end esports productions through the HERU Gigs marketplace.', href: '/for-providers' },
            ].map(({ label, desc, href }) => (
              <Link key={label} to={href} className="group p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/20 hover:bg-white/6 transition-all duration-300 card-hover block">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white group-hover:text-red-300 transition-colors">{label}</h3>
                  <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-white transition-all group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/8 hover:bg-white/12 text-white text-[15px] transition-all border border-white/10 hover:border-white/20">
              Contact Our Team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── LEADERBOARD (conditional) ────────────────────────────────── */}
      {leaderboard.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400 mb-1">HERU Rank</p>
                <h2 className="text-2xl font-black text-white">Top Players</h2>
              </div>
              <Link to="/leaderboards"
                className="text-xs text-zinc-500 hover:text-white transition-colors border border-white/8 px-3 py-1.5 rounded-lg">
                Full board
              </Link>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((e, i) => (
                <div key={e.id || i}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-yellow-500/15 transition-all">
                  <span className="w-8 text-center text-sm font-bold shrink-0">
                    {i < 3
                      ? <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                      : <span className="text-zinc-600">#{i + 1}</span>}
                  </span>
                  <span className="flex-1 font-semibold text-white truncate text-[15px]">
                    {e.username || e.full_name || 'Player'}
                  </span>
                  <span className="text-sm font-bold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full tabular-nums shrink-0">
                    {(e.score || 0).toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={CTA_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/85 to-zinc-950" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/8 blur-[140px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/8 blur-[140px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            The esports industry deserves<br />
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              real infrastructure.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
            Whether you compete, organize, activate, or execute — HERU has a product built for you. Join MENA's esports operating system today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-base transition-all shadow-xl shadow-red-600/30 hover:-translate-y-0.5">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/for-gamers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10 hover:border-white/20">
              Explore Products
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {PRODUCTS.map(p => (
              <Link key={p.name} to={p.ctaHref}
                className={`px-5 py-2.5 rounded-xl border text-center transition-all hover:-translate-y-0.5 text-xs font-bold ${p.pill}`}>
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
