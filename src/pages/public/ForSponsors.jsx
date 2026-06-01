import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Radar, BarChart3, Users, Building2, Star, Eye, Megaphone, TrendingUp,
  CheckCircle2, Crown, Zap, ArrowRight, DollarSign, Globe, Shield, Target
} from 'lucide-react'

// ─── Images ───────────────────────────────────
const HERO_IMG    = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=80'
const IMG_RADAR   = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80'
const IMG_ROI     = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=900&q=80'
const IMG_INFLU   = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&q=80'
const IMG_EVENTS  = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=900&q=80'

const FEATURES = [
  {
    Icon: Radar,
    title: 'Sponsorship Radar',
    desc: 'Browse hundreds of live sponsorship packages from verified MENA organizers. Filter by game, budget, region, and reach.',
    img: IMG_RADAR,
    badge: 'Browse Packages',
    points: ['Filter by game, region, & budget', 'See full deliverables per package', 'View organizer history & verification', 'One-click purchase flow'],
  },
  {
    Icon: BarChart3,
    title: 'Real-Time ROI Tracking',
    desc: 'After each event, organizers fill in actual reach, views, engagement rate, and social impressions — all visible in your dashboard.',
    img: IMG_ROI,
    badge: 'ROI Analytics',
    points: ['Actual vs estimated reach', 'Sponsor score per event', 'Campaign-level analytics', 'Downloadable reports'],
  },
  {
    Icon: Users,
    title: 'Influencer Marketplace',
    desc: 'Browse verified MENA esports personalities. Book them for brand activations, product launches, and stream sponsorships.',
    img: IMG_INFLU,
    badge: 'Influencer Hub',
    points: ['Verified esports creators', 'Game & region filtering', 'Direct booking system', 'Engagement rate metrics'],
  },
  {
    Icon: Building2,
    title: 'Corporate Event Builder',
    desc: 'Build private branded esports events for internal use, product launches, or client entertainment — fully managed.',
    img: IMG_EVENTS,
    badge: 'Managed Campaigns',
    points: ['Custom event briefs', 'Dedicated HERU consultant', 'Full production management', 'White-label event options'],
  },
]

const STATS = [
  { label: 'Packages Available', value: '500+',  color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { label: 'Gamers Reached',     value: '25K+',  color: 'text-white',      bg: 'bg-white/8' },
  { label: 'ROI Tracking',       value: 'Full',  color: 'text-green-400',  bg: 'bg-green-500/10' },
  { label: 'Subscription Tiers', value: '3',     color: 'text-white',      bg: 'bg-white/8' },
]

const TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    accent: 'text-zinc-300',
    bg: 'bg-zinc-900',
    border: 'border-zinc-700',
    badge: null,
    features: ['Browse HERU Radar', 'One-off package purchases', 'Basic dashboard', 'Post-event reports'],
    cta: 'Start Free',
    ctaLink: '/auth/sponsor/register',
    ctaClass: 'border border-zinc-600 hover:border-zinc-300 text-zinc-300 hover:text-white',
  },
  {
    name: 'Community',
    monthlyPrice: 150000,
    annualPrice: 1500000,
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-500/40',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      '2 Online sponsorships/month',
      'ROI tracking & analytics',
      'Influencer marketplace',
      'Priority listing',
      'Dedicated account support',
    ],
    cta: 'Get Community',
    ctaLink: '/auth/sponsor/register',
    ctaClass: 'bg-yellow-600 hover:bg-yellow-500 text-black font-black',
  },
  {
    name: 'Premium',
    monthlyPrice: 300000,
    annualPrice: 3000000,
    accent: 'text-yellow-300',
    bg: 'bg-zinc-900',
    border: 'border-yellow-500/20',
    badge: null,
    features: [
      'Everything in Community',
      '2 Online + 1 Offline/month',
      'Full influencer marketplace',
      'Managed campaign access',
      'Custom integrations',
      'Dedicated account manager',
      'Custom reporting suite',
    ],
    cta: 'Get Premium',
    ctaLink: '/auth/sponsor/register',
    ctaClass: 'border border-yellow-500/50 hover:border-yellow-400 text-yellow-400 hover:text-white hover:bg-yellow-500/10',
  },
]

function formatEGP(amount) {
  if (amount === 0) return 'EGP 0'
  return 'EGP ' + amount.toLocaleString()
}

function ProductFooter() {
  return (
    <footer className="border-t border-zinc-800/60 py-14 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        <div>
          <p className="text-xl font-black text-white mb-1">HERU<span className="text-red-500">.</span>gg</p>
          <p className="text-sm text-zinc-500">The Esports OS for MENA</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
          {[
            ['Products', [['ARENA (Gamers)', '/for-gamers'], ['BUILDER (Organizers)', '/for-organizers'], ['RADAR (Sponsors)', '/for-sponsors'], ['GIGs (Providers)', '/for-providers']]],
            ['Sponsors', [['Register', '/auth/sponsor/register'], ['Login', '/auth/sponsor/login'], ['Browse Radar', '/radar'], ['Pricing', '/pricing']]],
            ['Platform', [['Tournaments', '/tournaments'], ['Influencers', '/influencers'], ['Teams', '/teams'], ['Coaches', '/coaches']]],
          ].map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">{heading}</p>
              <ul className="space-y-2">
                {links.map(([label, href]) => (
                  <li key={href}><Link to={href} className="text-sm text-zinc-500 hover:text-white transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-zinc-800/60">
        <p className="text-xs text-zinc-600">© 2026 HERU.gg — All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function ForSponsors() {
  const [billing, setBilling] = useState('monthly')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/90" />
        </div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-yellow-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-600/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full py-24">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <Radar className="w-3.5 h-3.5" />
            HERU RADAR — For Sponsors
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.0] tracking-tight max-w-4xl">
            Sponsor Esports.{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Measure Everything.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
            Browse live sponsorship packages from MENA's best organizers. Track ROI. Hire influencers. Build your brand in gaming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              to="/auth/sponsor/register"
              className="inline-flex items-center gap-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-black px-10 py-4 rounded-xl transition-all text-lg shadow-lg shadow-yellow-600/25 hover:-translate-y-0.5"
            >
              <Radar className="w-5 h-5" /> Explore Radar
            </Link>
            <a href="#pricing"
              className="inline-flex items-center gap-2.5 border border-zinc-700 hover:border-yellow-500/50 text-zinc-300 hover:text-white font-bold px-10 py-4 rounded-xl transition-all text-lg">
              View Pricing <Crown className="w-5 h-5" />
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4">
            {[
              { icon: Shield, text: 'Brand-safe verified events' },
              { icon: Globe,  text: 'Egypt · KSA · UAE & beyond' },
              { icon: TrendingUp, text: 'Real ROI data after every event' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/8 border border-yellow-500/15 text-sm text-yellow-300">
                <Icon className="w-3.5 h-3.5" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/30 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className={`text-center p-6 rounded-2xl ${s.bg}`}>
              <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
              Features
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Everything a sponsor needs</h2>
            <p className="text-zinc-400 text-lg">From discovery to ROI proof — all in one platform.</p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`group flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-yellow-500/30 transition-all duration-500`}>
                <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-bold text-yellow-400 bg-yellow-500/15 border border-yellow-500/30 px-3 py-1 rounded-full">{f.badge}</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-10 bg-zinc-900/60 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-5">
                    <f.Icon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-base mb-6">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.points.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70" alt="" className="w-full h-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              Pricing
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Sponsorship Plans</h2>
            <p className="text-zinc-400 text-lg mb-8">Start free. Scale when you're ready.</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  billing === 'monthly' ? 'bg-yellow-600 text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  billing === 'annual' ? 'bg-yellow-600 text-black shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Annual
                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">2 months free</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {TIERS.map((tier) => {
              const price = billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice
              const period = billing === 'monthly' ? '/month' : '/year'

              return (
                <div key={tier.name}
                  className={`relative flex flex-col rounded-3xl ${tier.bg} border ${tier.border} p-10 transition-all hover:-translate-y-1 duration-300 ${tier.badge ? 'shadow-xl shadow-yellow-500/10' : ''}`}>
                  {tier.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-600 text-black text-xs font-black px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className={`text-lg font-black mb-1 ${tier.accent}`}>{tier.name}</h3>
                    <div className="text-5xl font-black text-white leading-none mb-1">
                      {price === 0 ? 'EGP 0' : formatEGP(price)}
                    </div>
                    <div className="text-zinc-500 text-sm">{period}</div>
                  </div>
                  <ul className="space-y-3 mb-10 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.ctaLink}
                    className={`w-full text-center font-bold py-3.5 px-6 rounded-xl transition-all ${tier.ctaClass}`}>
                    {tier.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="text-center text-zinc-500 text-sm">
            15% platform fee on all sponsorship purchases. Your subscription covers bundled monthly activations.
          </p>
        </div>
      </section>

      <ProductFooter />
    </div>
  )
}
