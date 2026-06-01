import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import { motion } from 'framer-motion'
import {
  CheckCircle2, ArrowRight, Gamepad2, Building2, Radar, Briefcase,
  Shield, DollarSign, Package, Star, TrendingUp, Globe
} from 'lucide-react'

// ─── Tab Data ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'arena',   label: 'HERU Arena',   icon: Gamepad2,  color: 'text-red-400',    activeBg: 'bg-red-500/10 border-red-500/30', dot: 'bg-red-500' },
  { key: 'builder', label: 'HERU Builder', icon: Building2, color: 'text-purple-400', activeBg: 'bg-purple-500/10 border-purple-500/30', dot: 'bg-purple-500' },
  { key: 'radar',   label: 'HERU Radar',   icon: Radar,     color: 'text-yellow-400', activeBg: 'bg-yellow-500/10 border-yellow-500/30', dot: 'bg-yellow-500' },
  { key: 'gigs',    label: 'HERU Gigs',    icon: Briefcase, color: 'text-cyan-400',   activeBg: 'bg-cyan-500/10 border-cyan-500/30', dot: 'bg-cyan-500' },
]

// ─── Arena Tab ────────────────────────────────────────────────────────────────

function ArenaTab() {
  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden border border-red-500/15 p-10 lg:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-zinc-950/80" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
              <Gamepad2 className="h-3 w-3" /> HERU Arena
            </span>
            <p className="text-6xl font-black text-white mb-2">EGP 0</p>
            <p className="text-zinc-400 text-xl mb-2">per month — forever</p>
            <p className="text-zinc-500 text-base mb-8 leading-relaxed">
              HERU Arena is completely free. Every feature. Every tournament. Every capability. No subscription required. No paywall. Ever.
            </p>
            <Link to="/auth/gamer/register"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/25">
              Join Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-zinc-600 mt-3">No credit card required.</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-5">Everything included</p>
            <div className="space-y-2.5">
              {[
                'Join unlimited tournaments',
                'Create and manage teams',
                'Book coaching sessions',
                'Community bracket builder',
                'Friend requests and direct messages',
                'Full leaderboard access and rankings',
                'Riot and Valorant account linking',
                'Achievement badges and rank display',
                'Public gamer profile and portfolio',
                'Tournament history and match records',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-red-500/4 border border-red-500/10 text-center">
        <h3 className="text-xl font-black text-white mb-3">Why is HERU Arena free?</h3>
        <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed text-sm">
          Gamers are the foundation of the entire HERU ecosystem. More players means more tournaments, which attracts more sponsorship, which funds larger prize pools for gamers. The ecosystem flywheel runs on free, empowered players.
        </p>
      </div>
    </div>
  )
}

// ─── Builder Tab ──────────────────────────────────────────────────────────────

function BuilderTab() {
  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/15 p-10 lg:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/30 to-zinc-950/80" />
        <div className="relative text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
            <Building2 className="h-3 w-3" /> HERU Builder
          </span>
          <h2 className="text-4xl font-black text-white mb-3">Free to build.</h2>
          <p className="text-zinc-400 text-xl mb-2">We only earn when you earn.</p>
          <p className="text-zinc-500 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
            Platform access is completely free. HERU charges a 15% fee on completed service bookings and sponsorship package sales only.
          </p>
          <Link to="/auth/organizer/register"
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-purple-700/25">
            Start Building Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="p-8 rounded-2xl bg-white/[0.03] border border-purple-500/15">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white">Service Booking Fee</h3>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { label: 'Organizer pays to provider', value: 'EGP amount' },
              { label: 'HERU platform fee', value: '15%', highlight: 'text-purple-400' },
              { label: 'Provider receives', value: '85%', highlight: 'text-green-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <span className="text-zinc-500 text-sm">{row.label}</span>
                <span className={`font-black text-lg ${row.highlight || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 text-xs">Payment held in escrow and released on confirmed delivery.</p>
        </div>

        <div className="p-8 rounded-2xl bg-purple-500/5 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-black text-white">Sponsorship Income Fee</h3>
          </div>
          <div className="space-y-3 mb-5">
            {[
              { label: 'Sponsor pays for package', value: 'EGP amount' },
              { label: 'HERU platform fee', value: '15%', highlight: 'text-purple-400' },
              { label: 'Organizer receives', value: '85%', highlight: 'text-green-400' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-purple-500/10 last:border-0">
                <span className="text-zinc-500 text-sm">{row.label}</span>
                <span className={`font-black text-lg ${row.highlight || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 text-xs">Organizer keeps 85% of every sponsorship package sold.</p>
        </div>
      </div>

      <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/8">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Free platform features</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            'Unlimited tournament creation',
            'Full bracket engine (all formats)',
            'Service provider marketplace browsing',
            'Team and player management',
            'Tournament CRM dashboard',
            'Public organizer profile',
            'Sponsorship package builder',
            'Multi-tournament management',
          ].map(f => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Radar Tab ────────────────────────────────────────────────────────────────

const RADAR_TIERS = [
  {
    name: 'Free',
    price: 'EGP 0',
    period: '/month',
    highlight: false,
    desc: 'Explore the market and access all discovery tools at no cost.',
    features: [
      'Explore all sponsorship packages',
      'Book influencers directly',
      'Book HERU consultants',
      'Access the Radar dashboard',
      'Analytics and filtering tools',
      'One-off package purchases',
    ],
    cta: 'Start Free',
    ctaHref: '/auth/sponsor/register',
    style: 'bg-white/[0.02] border-white/8',
    ctaStyle: 'bg-white/8 hover:bg-white/12 text-white border border-white/15',
  },
  {
    name: 'Starter',
    price: 'EGP 150,000',
    period: '/month',
    highlight: false,
    desc: 'Consistent monthly esports activations for brands entering the market.',
    features: [
      'Everything in Free',
      '4 online activations per month',
      'Fully managed by HERU team',
      'Dedicated account consultant',
      'Monthly performance report',
      'Priority Radar placement',
    ],
    cta: 'Choose Starter',
    ctaHref: '/auth/sponsor/register',
    style: 'bg-white/[0.02] border-white/8',
    ctaStyle: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  },
  {
    name: 'Growth',
    price: 'EGP 250,000',
    period: '/month',
    highlight: true,
    badge: 'Most Popular',
    desc: 'Scaled presence with online and offline activations plus full PR coverage.',
    features: [
      'Everything in Starter',
      '4 online activations per month',
      '1 offline activation per month',
      'Fully managed by HERU',
      'PR coverage included',
      'Brand content planning',
    ],
    cta: 'Choose Growth',
    ctaHref: '/auth/sponsor/register',
    style: 'bg-yellow-500/8 border-yellow-500/35 shadow-xl shadow-yellow-500/10',
    ctaStyle: 'bg-yellow-500 hover:bg-yellow-400 text-black font-black shadow-lg shadow-yellow-500/25',
  },
  {
    name: 'Premium',
    price: 'EGP 500,000',
    period: '/month',
    highlight: false,
    desc: 'Maximum presence with full managed services, content, and coverage.',
    features: [
      'Everything in Growth',
      '4 online activations per month',
      '4 offline activations per month',
      'PR and media coverage',
      'Content production included',
      'Full event coverage',
      'Corporate Builder access',
      'Dedicated HERU consultant',
    ],
    cta: 'Choose Premium',
    ctaHref: '/auth/sponsor/register',
    style: 'bg-white/[0.02] border-white/8',
    ctaStyle: 'bg-white/8 hover:bg-white/12 text-white border border-white/15',
  },
]

function RadarTab() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white mb-3">Choose your activation tier.</h2>
        <p className="text-zinc-400 text-base max-w-xl mx-auto">Start free and explore the market. Scale up with monthly managed activations as your esports presence grows.</p>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {RADAR_TIERS.map(tier => (
          <div
            key={tier.name}
            className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-300 ${tier.style}`}
          >
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-yellow-500 text-black">
                  {tier.badge}
                </span>
              </div>
            )}
            <div className="mb-6">
              <h3 className={`text-lg font-black mb-3 ${tier.highlight ? 'text-yellow-400' : 'text-white'}`}>{tier.name}</h3>
              <div className="mb-1">
                <span className="text-2xl font-black text-white">{tier.price}</span>
                <span className="text-zinc-500 text-sm ml-1">{tier.period}</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">{tier.desc}</p>
            </div>
            <ul className="space-y-2 mb-7 flex-1">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                  <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${tier.highlight ? 'text-yellow-400' : 'text-zinc-500'}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to={tier.ctaHref}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tier.ctaStyle}`}>
              {tier.cta}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 text-center">
        <p className="text-zinc-500 text-sm">
          All plans billed monthly. Custom enterprise pricing available for large brands and agencies.{' '}
          <Link to="/auth/sponsor/register" className="text-yellow-400 hover:text-yellow-300">Contact sales.</Link>
        </p>
      </div>
    </div>
  )
}

// ─── Gigs Tab ─────────────────────────────────────────────────────────────────

function GigsTab() {
  return (
    <div className="space-y-8">
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/15 p-10 lg:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 to-zinc-950/80" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
              <Briefcase className="h-3 w-3" /> HERU Gigs
            </span>
            <p className="text-5xl font-black text-white mb-2">Free to List</p>
            <p className="text-zinc-400 text-xl mb-2">15% fee on bookings only</p>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              No monthly subscription. No listing fees. HERU earns only when you earn — a 15% platform fee on completed bookings.
            </p>
            <div className="p-5 rounded-xl bg-cyan-500/8 border border-cyan-500/15 mb-8">
              <p className="text-cyan-400 font-bold text-base mb-1">85% goes directly to you</p>
              <p className="text-zinc-500 text-sm">For every EGP 1,000 booking, you receive EGP 850 after the platform fee is applied.</p>
            </div>
            <Link to="/auth/provider/register"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-600/25">
              Join Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-5">Everything included</p>
            <div className="space-y-2.5">
              {[
                'Professional service listing page',
                'Public portfolio and gallery',
                'Verified rating and review system',
                'Marketplace discovery placement',
                'Tournament Builder integration',
                'Direct organizer messaging',
                'File sharing and delivery tracking',
                'Escrow payment protection',
                'Income tracking dashboard',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Briefcase, title: '9 Categories', desc: 'Coaches, Influencers, Designers, Production, Casters, Analysts, Venues, Marketing, Gaming Centers.', color: 'text-cyan-400', bg: 'bg-cyan-500/8' },
          { icon: Shield,    title: 'Escrow Protected', desc: 'All payments held until the organizer confirms delivery. Zero risk of non-payment.', color: 'text-green-400', bg: 'bg-green-500/8' },
          { icon: Star,      title: 'Review System', desc: 'Build a verified rating and review history with every completed booking.', color: 'text-yellow-400', bg: 'bg-yellow-500/8' },
        ].map(item => (
          <div key={item.title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${item.bg} ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="font-black text-white mb-2">{item.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('arena')

  const tabContent = { arena: ArenaTab, builder: BuilderTab, radar: RadarTab, gigs: GigsTab }
  const ActiveContent = tabContent[activeTab]

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PublicNav />

      {/* ─── Header ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-transparent" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-6">
              Pricing
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 leading-tight">
              Transparent pricing.<br />
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Built for every stakeholder.
              </span>
            </h1>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Four products. Four pricing models. Designed to align HERU's success with yours — we only earn when you do.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Tab Navigation ──────────────────────────────────────────── */}
      <section className="sticky top-16 z-30 px-4 py-4 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl border text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive ? tab.activeBg : 'bg-white/[0.02] border-white/8 text-zinc-500 hover:text-zinc-300 hover:bg-white/4'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${tab.dot} ${isActive ? 'opacity-100' : 'opacity-40'}`} />
                  <tab.icon className={`h-4 w-4 ${isActive ? tab.color : 'text-zinc-500'}`} />
                  <span className={isActive ? tab.color : 'text-zinc-400'}>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Tab Content ─────────────────────────────────────────────── */}
      <section className="px-4 py-16 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <ActiveContent />
          </motion.div>
        </div>
      </section>

      {/* ─── Compare Summary ─────────────────────────────────────────── */}
      <section className="px-4 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-3">All four products at a glance.</h2>
            <p className="text-zinc-500">The complete pricing overview across the HERU ecosystem.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'HERU Arena',   note: 'Free — forever',          sub: 'All features included. No subscription.', color: 'text-red-400', border: 'border-red-500/15', bg: 'bg-red-500/5', href: '/auth/gamer/register', cta: 'Join Free' },
              { label: 'HERU Builder', note: 'Free + 15% fee',          sub: 'Platform access free. Fee on transactions only.', color: 'text-purple-400', border: 'border-purple-500/15', bg: 'bg-purple-500/5', href: '/auth/organizer/register', cta: 'Start Building' },
              { label: 'HERU Radar',   note: 'Free to EGP 500K/mo',    sub: 'Four tiers: Free, Starter, Growth, Premium.', color: 'text-yellow-400', border: 'border-yellow-500/15', bg: 'bg-yellow-500/5', href: '/auth/sponsor/register', cta: 'Explore Radar' },
              { label: 'HERU Gigs',    note: 'Free + 15% fee',          sub: 'Free to list. 85% payout on bookings.', color: 'text-cyan-400', border: 'border-cyan-500/15', bg: 'bg-cyan-500/5', href: '/auth/provider/register', cta: 'List Services' },
            ].map(item => (
              <div key={item.label} className={`p-6 rounded-2xl border ${item.border} ${item.bg} flex flex-col`}>
                <h3 className={`font-black text-base mb-1.5 ${item.color}`}>{item.label}</h3>
                <p className="text-white font-bold text-lg mb-1">{item.note}</p>
                <p className="text-zinc-500 text-xs leading-relaxed mb-6 flex-1">{item.sub}</p>
                <Link to={item.href}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${item.border} ${item.color} hover:bg-white/5`}>
                  {item.cta}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-red-600/6 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-600/6 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Ready to get started?</h2>
          <p className="text-zinc-400 text-lg mb-10">
            Choose your role in the HERU ecosystem and begin building your presence in MENA esports today.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'I am a Gamer',     href: '/auth/gamer/register',    color: 'text-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/5', cta: 'Play Free' },
              { label: 'I am an Organizer',href: '/auth/organizer/register', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', cta: 'Build' },
              { label: 'I am a Sponsor',   href: '/auth/sponsor/register',   color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', cta: 'Activate' },
              { label: 'I am a Provider',  href: '/auth/provider/register',  color: 'text-cyan-400',   border: 'border-cyan-500/20',   bg: 'bg-cyan-500/5', cta: 'Get Booked' },
            ].map(item => (
              <Link key={item.label} to={item.href}
                className={`flex flex-col items-center p-5 rounded-2xl border ${item.border} ${item.bg} hover:bg-white/5 hover:border-white/15 transition-all duration-300 group`}>
                <p className="text-xs text-zinc-500 mb-2">{item.label}</p>
                <p className={`font-black text-lg ${item.color}`}>{item.cta}</p>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-white mt-2 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
