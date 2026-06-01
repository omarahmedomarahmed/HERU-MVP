import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Radar, BarChart3, Users, Building2, Star, Eye, Megaphone, TrendingUp,
  CheckCircle2, Crown, Zap, ArrowRight, DollarSign, Globe, Shield, Target,
  ChevronDown, ChevronRight
} from 'lucide-react'

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=80'

const CAPABILITIES = [
  {
    Icon: Radar,
    title: 'Sponsorship Discovery',
    desc: 'Browse hundreds of live sponsorship packages from verified MENA tournament organizers. Full transparency on deliverables, audience size, and pricing.',
    detail: ['Live package browser', 'Filter by game, region, budget', 'Full deliverable breakdown', 'Organizer verification status', 'One-click purchase flow'],
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    Icon: DollarSign,
    title: 'Sponsorship Packages',
    desc: 'Structured, data-backed sponsorship packages built by verified organizers. Every package includes clear deliverables and expected reach metrics.',
    detail: ['Structured deliverables', 'Audience reach estimates', 'Brand placement specs', 'Event timeline visibility', 'Escrow-protected transactions'],
    color: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
  },
  {
    Icon: Users,
    title: 'Influencer Access',
    desc: 'Browse and book verified MENA esports personalities for brand activations, product launches, and streaming sponsorships.',
    detail: ['Verified esports creators', 'Game and region filtering', 'Engagement rate metrics', 'Direct booking system', 'Performance reporting'],
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  {
    Icon: Megaphone,
    title: 'Managed Activations',
    desc: 'Fully managed esports marketing campaigns executed by the HERU team. Brief to delivery — we handle everything on your behalf.',
    detail: ['Dedicated HERU consultant', 'Campaign strategy and planning', 'Full production coordination', 'End-to-end execution', 'Comprehensive post-event reports'],
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
  },
  {
    Icon: BarChart3,
    title: 'Brand Reporting',
    desc: 'Real-time and post-event ROI analytics. View actual reach, impressions, engagement, and sponsor score for every activation.',
    detail: ['Live ROI dashboard', 'Actual vs estimated reach', 'Engagement rate analytics', 'Social impressions data', 'Downloadable brand reports'],
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    Icon: Building2,
    title: 'Corporate Tournaments',
    desc: 'Build private branded esports events for employee engagement, product launches, or client entertainment — fully managed by HERU.',
    detail: ['Custom event brief system', 'Dedicated HERU project manager', 'White-label event options', 'Corporate venue coordination', 'Internal leaderboard and awards'],
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
]

const TIERS = [
  {
    name: 'Free',
    price: 'EGP 0',
    period: '/month',
    highlight: false,
    desc: 'Explore the platform and access all discovery tools without a subscription.',
    features: [
      'Browse all sponsorship packages',
      'Book influencers directly',
      'Book HERU consultants',
      'Access the Radar dashboard',
      'Analytics and filtering',
      'One-off package purchases',
    ],
    cta: 'Get Started Free',
    ctaHref: '/auth/sponsor/register',
    ctaStyle: 'bg-white/8 hover:bg-white/12 text-white border border-white/15',
  },
  {
    name: 'Starter',
    price: 'EGP 150,000',
    period: '/month',
    highlight: false,
    desc: 'Ideal for brands beginning their esports marketing journey with consistent monthly activations.',
    features: [
      'Everything in Free',
      '4 online activations per month',
      'Fully managed by HERU team',
      'Dedicated account consultant',
      'Monthly performance report',
      'Priority Radar placement',
    ],
    cta: 'Start with Starter',
    ctaHref: '/auth/sponsor/register',
    ctaStyle: 'bg-yellow-600 hover:bg-yellow-500 text-white',
    badge: null,
  },
  {
    name: 'Growth',
    price: 'EGP 250,000',
    period: '/month',
    highlight: true,
    desc: 'For brands scaling their presence with both online and offline esports activations, including full PR coverage.',
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
    ctaStyle: 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/30',
    badge: 'Most Popular',
  },
  {
    name: 'Premium',
    price: 'EGP 500,000',
    period: '/month',
    highlight: false,
    desc: 'Full-scale esports market presence. Maximum online and offline activations with complete managed services.',
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
    cta: 'Go Premium',
    ctaHref: '/auth/sponsor/register',
    ctaStyle: 'bg-white/8 hover:bg-white/12 text-white border border-white/15',
  },
]

const STATS = [
  { value: '500+', label: 'Packages Available', color: 'text-yellow-400' },
  { value: '25K+', label: 'Gamers Reachable', color: 'text-white' },
  { value: '6', label: 'MENA Countries', color: 'text-white' },
  { value: 'Full', label: 'ROI Transparency', color: 'text-green-400' },
]

export default function ForSponsors() {
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

        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-yellow-600/6 blur-[150px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-yellow-500/8 border border-yellow-500/20 text-yellow-400 mb-7">
              <Radar className="h-3.5 w-3.5" />
              HERU Radar
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] mb-6 max-w-4xl"
          >
            Discover opportunities.<br />
            Activate campaigns.<br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Reach gaming audiences.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10"
          >
            The intelligence and activation layer for brands entering the MENA gaming ecosystem. Discover sponsorships, activate with precision, and measure real ROI — all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Link to="/auth/sponsor/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black transition-all shadow-lg shadow-yellow-500/30 text-[15px] hover:-translate-y-0.5">
              Explore Radar
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white transition-all border border-white/10 hover:border-white/20 text-[15px]">
              View Plans
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
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Everything a brand needs in esports.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Six integrated capabilities covering discovery, activation, measurement, and managed execution.
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
                <Link to="/auth/sponsor/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-yellow-500 hover:bg-yellow-400 text-black transition-all">
                  Explore Radar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section className="py-32 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              HERU Radar Plans
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Choose your activation tier.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Start free and discover the market. Scale up with monthly managed activations as your esports presence grows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {TIERS.map(tier => (
              <div
                key={tier.name}
                className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-300 ${
                  tier.highlight
                    ? 'bg-yellow-500/8 border-yellow-500/35 shadow-xl shadow-yellow-500/10'
                    : 'bg-white/[0.02] border-white/8 hover:border-white/15 hover:bg-white/4'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-yellow-500 text-black">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-black mb-3 ${tier.highlight ? 'text-yellow-400' : 'text-white'}`}>{tier.name}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-black text-white">{tier.price}</span>
                    <span className="text-zinc-500 text-sm ml-1">{tier.period}</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{tier.desc}</p>
                </div>

                <ul className="space-y-2.5 mb-7 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-400">
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

          <div className="mt-8 text-center p-6 rounded-2xl bg-white/[0.02] border border-white/8">
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
              All subscription tiers are billed monthly. Custom enterprise pricing available for large brands, agencies, and publishers.
              <Link to="/auth/sponsor/register" className="text-yellow-400 hover:text-yellow-300 ml-1">Contact sales.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-yellow-600/6 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Enter the MENA gaming market with confidence.</h2>
          <p className="text-zinc-400 text-lg mb-8">
            25,000+ gamers. 500+ events. Real ROI data. Start exploring for free or launch your first managed activation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth/sponsor/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black text-base transition-all shadow-xl shadow-yellow-500/25">
              Explore Radar Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10">
              Compare Plans
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
