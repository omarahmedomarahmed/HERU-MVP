import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Building2, Trophy, Users, DollarSign, Briefcase, BarChart3,
  CheckCircle2, ArrowRight, Shield, Star, Zap, ChevronDown,
  Target, Globe, Settings, Layers, FileText, TrendingUp
} from 'lucide-react'

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=80'
const WORKFLOW_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
const PRICING_BG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&q=80'
const FINAL_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'

const CAPABILITIES = [
  {
    Icon: Trophy,
    title: 'Tournament Builder',
    desc: 'Professional-grade tournament creation for online and offline events. Five-step builder walks you from game selection to live publication.',
    detail: ['Online and offline tournament support', '5-step setup wizard', 'Multiple bracket formats', 'Custom prize pool configuration', 'Private and public events'],
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
  },
  {
    Icon: Settings,
    title: 'Operations',
    desc: 'Full operational control from a single dashboard. Manage brackets, teams, match results, and communications in real time.',
    detail: ['Real-time bracket management', 'Team and player management', 'Match result entry', 'Dispute resolution tools', 'Live event control panel'],
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  {
    Icon: Layers,
    title: 'Brackets',
    desc: 'Advanced bracket engine supporting single elimination, double elimination, round robin, and Swiss formats with auto-seeding.',
    detail: ['Single and double elimination', 'Round robin and Swiss formats', 'Auto-seeding by rank', 'Real-time result propagation', 'Public bracket view for spectators'],
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
  },
  {
    Icon: Briefcase,
    title: 'Service Provider Marketplace',
    desc: 'Book verified production companies, venues, marketing agencies, casters, and talent directly through HERU Gigs.',
    detail: ['9 service categories', 'Vetted provider profiles', 'Escrow payment protection', 'Direct chat with providers', 'File sharing and delivery tracking'],
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    Icon: DollarSign,
    title: 'Sponsorship Creation',
    desc: 'Build and publish structured sponsorship packages for your events. Set deliverables, pricing, and reach metrics for brands to discover.',
    detail: ['Package builder wizard', 'Custom deliverable lists', 'Reach and audience data', 'Real-time buyer notifications', 'Escrow-protected income'],
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    Icon: BarChart3,
    title: 'HERU Consultants',
    desc: 'Access dedicated HERU consultants for complex event planning, managed productions, and corporate tournament requests.',
    detail: ['Dedicated project management', 'White-label event options', 'Corporate client handling', 'Full production management', 'Post-event reporting'],
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
]

const WORKFLOW = [
  { step: '01', title: 'Create Your Tournament', desc: 'Use the 5-step builder to configure game, format, prize pool, teams cap, and registration settings.', color: 'text-purple-400', dot: 'bg-purple-500' },
  { step: '02', title: 'Book Service Providers', desc: 'Browse the HERU Gigs marketplace and book production, venue, casters, and marketing through secure escrow.', color: 'text-blue-400', dot: 'bg-blue-500' },
  { step: '03', title: 'Enable Sponsorships', desc: 'Build sponsorship packages with deliverables and pricing. Verified organizers get listed on HERU Radar automatically.', color: 'text-yellow-400', dot: 'bg-yellow-500' },
  { step: '04', title: 'Run the Event', desc: 'Manage brackets, results, and communications from your tournament CRM. Everything in one operational dashboard.', color: 'text-cyan-400', dot: 'bg-cyan-500' },
]

const PLANS = [
  {
    name: 'Platform Access',
    price: 'Free',
    note: 'No monthly fee',
    highlight: false,
    features: [
      'Unlimited tournament creation',
      'Full bracket engine access',
      'Service provider marketplace',
      'Team and player management',
      'Tournament CRM dashboard',
      'Public organizer profile',
    ],
    cta: 'Start Building',
    ctaHref: '/auth/organizer/register',
    ctaStyle: 'bg-white/8 hover:bg-white/12 text-white border border-white/15',
  },
  {
    name: 'Radar Verified',
    price: 'Verification Required',
    note: 'Sponsor discovery activated',
    highlight: true,
    features: [
      'Everything in Platform Access',
      'Listed on HERU Radar',
      'Sponsorship package publishing',
      'Sponsor buyer notifications',
      'Escrow-protected income',
      'Organizer verification badge',
    ],
    cta: 'Apply for Verification',
    ctaHref: '/auth/organizer/register',
    ctaStyle: 'bg-purple-700 hover:bg-purple-600 text-white shadow-lg shadow-purple-700/25',
  },
]

const STATS = [
  { value: '500+', label: 'Events Built', color: 'text-purple-400' },
  { value: 'EGP 2M+', label: 'Sponsorships Facilitated', color: 'text-yellow-400' },
  { value: '6', label: 'MENA Countries', color: 'text-white' },
  { value: '15%', label: 'Platform Fee Only', color: 'text-green-400' },
]

export default function ForOrganizers() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [activeCapability, setActiveCapability] = useState(0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── VIDEO HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay loop muted playsInline
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-25' : 'opacity-0'}`}
            poster={HERO_FALLBACK}
          >
            <source src="https://www.pexels.com/video/8728384/download/?fps=25&h=1080&w=1920" type="video/mp4" />
          </video>
          {!videoLoaded && (
            <img src={HERO_FALLBACK} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-zinc-950/60" />
        </div>

        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[150px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-purple-500/8 border border-purple-500/20 text-purple-400 mb-7">
              <Building2 className="h-3.5 w-3.5" />
              HERU Builder
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] mb-6 max-w-4xl"
          >
            Build tournaments.<br />
            Manage operations.<br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Monetize events.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10"
          >
            Professional-grade tournament infrastructure for every scale. From small community events to fully sponsored arena productions — built, managed, and monetized on HERU Builder.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Link to="/auth/organizer/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-purple-700 hover:bg-purple-600 text-white transition-all shadow-lg shadow-purple-700/30 text-[15px] hover:-translate-y-0.5">
              Build an Event
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white transition-all border border-white/10 hover:border-white/20 text-[15px]">
              View Pricing
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-8">
            {STATS.map(s => (
              <div key={s.label}>
                <p className={`text-3xl font-black ${s.color} mb-0.5`}>{s.value}</p>
                <p className="text-xs text-zinc-600 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <ChevronDown className="h-4 w-4 text-zinc-600 animate-bounce" />
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              Platform Capabilities
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Everything an organizer needs.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Six integrated modules for the complete tournament lifecycle — from event creation to post-event reporting.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              {CAPABILITIES.map((cap, i) => (
                <button
                  key={cap.title}
                  onClick={() => setActiveCapability(i)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    activeCapability === i
                      ? `${cap.bg} ${cap.border}`
                      : 'bg-white/[0.02] border-white/8 hover:bg-white/4 hover:border-white/12'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cap.bg} ${cap.color}`}>
                      <cap.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`font-bold text-[15px] ${activeCapability === i ? 'text-white' : 'text-zinc-300'}`}>{cap.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{cap.desc.slice(0, 60)}...</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className={`sticky top-24 p-8 rounded-2xl border ${CAPABILITIES[activeCapability].border} ${CAPABILITIES[activeCapability].bg} transition-all duration-300`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${CAPABILITIES[activeCapability].bg}`}>
                {(() => { const Cap = CAPABILITIES[activeCapability].Icon; return <Cap className={`h-7 w-7 ${CAPABILITIES[activeCapability].color}`} /> })()}
              </div>
              <h3 className={`text-2xl font-black mb-4 ${CAPABILITIES[activeCapability].color}`}>
                {CAPABILITIES[activeCapability].title}
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-7">
                {CAPABILITIES[activeCapability].desc}
              </p>
              <ul className="space-y-3">
                {CAPABILITIES[activeCapability].detail.map(d => (
                  <li key={d} className="flex items-center gap-3 text-sm text-zinc-400">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${CAPABILITIES[activeCapability].color}`} />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth/organizer/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-purple-700 hover:bg-purple-600 text-white transition-all">
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0">
          <img src={WORKFLOW_BG} alt="" className="w-full h-full object-cover opacity-7" />
          <div className="absolute inset-0 bg-zinc-950/93" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How it works.</h2>
            <p className="text-zinc-400 text-lg">From concept to execution — the full event workflow in four stages.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKFLOW.map((w) => (
              <div key={w.step} className="p-6 rounded-2xl bg-zinc-900/80 border border-white/8 hover:border-white/18 transition-all card-hover">
                <p className={`text-5xl font-black opacity-10 mb-3 ${w.color}`}>{w.step}</p>
                <div className={`h-2 w-2 rounded-full ${w.dot} mb-4`} />
                <h3 className="font-black text-white mb-2 text-[15px]">{w.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={PRICING_BG} alt="" className="w-full h-full object-cover opacity-6" />
          <div className="absolute inset-0 bg-zinc-950/93" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Transparent pricing.</h2>
            <p className="text-zinc-400 text-lg">Platform access is free. HERU earns a 15% fee on service bookings and sponsorship income only.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border transition-all ${
                  plan.highlight
                    ? 'bg-purple-500/8 border-purple-500/30'
                    : 'bg-white/[0.02] border-white/8'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 mb-4">
                    Recommended
                  </span>
                )}
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-2xl font-black text-white mb-0.5">{plan.price}</p>
                <p className="text-xs text-zinc-500 mb-6">{plan.note}</p>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-400">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-purple-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.ctaHref}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${plan.ctaStyle}`}>
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-yellow-500/4 border border-yellow-500/10 text-center">
            <p className="text-yellow-400 font-bold mb-2 text-[15px]">How does HERU earn?</p>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl mx-auto">
              HERU charges a 15% platform fee on all service provider bookings and on all sponsorship package income. Platform access, tournament creation, and team management are always free.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={FINAL_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/85 to-zinc-950" />
          <div className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Your next event, fully equipped.</h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join hundreds of MENA organizers who build, fund, and run professional esports events on HERU Builder.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth/organizer/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-purple-700 hover:bg-purple-600 text-white text-base transition-all shadow-xl shadow-purple-700/25">
              Start Building
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10">
              View Full Pricing
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
