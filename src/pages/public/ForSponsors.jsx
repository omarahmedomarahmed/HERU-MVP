import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import HeruLogo from '@/components/shared/HeruLogo'
import { Radar, BarChart3, Users, Building2, Star, Eye, Megaphone, TrendingUp, CheckCircle2, Crown, Zap, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    Icon: Star,
    title: 'Create Brand Account',
    desc: 'Set up your brand profile: logo, description, website, industry.',
  },
  {
    Icon: Radar,
    title: 'Browse the Sponsorship Radar',
    desc: 'Filter packages by game, budget, reach, event type (online/offline), and region.',
  },
  {
    Icon: Eye,
    title: 'View Package Deliverables',
    desc: 'Each package shows: price, reach, estimated views, placements (banner, jersey, social), and organizer history.',
  },
  {
    Icon: Users,
    title: 'Hire Talent & Influencers',
    desc: 'Browse verified esports personalities. Book them for brand activations directly.',
  },
  {
    Icon: BarChart3,
    title: 'Track ROI in Real Time',
    desc: 'After each event: view actual reach, views, engagement rate, and sponsor score from the organizer.',
  },
  {
    Icon: Building2,
    title: 'Corporate Activations Builder',
    desc: 'Build private branded esports events for internal corporate use, product launches, or client entertainment.',
  },
  {
    Icon: Megaphone,
    title: 'Chat with Organizers',
    desc: 'Direct communication channel in every active sponsorship. Coordinate deliverables and approvals.',
  },
  {
    Icon: TrendingUp,
    title: 'Billing & Invoices',
    desc: 'Full invoice history, subscription management, and payment receipts in one dashboard.',
  },
]

const STATS = [
  { label: 'Packages Available', value: '500+' },
  { label: 'Gamers Reached', value: '25K+' },
  { label: 'ROI Tracking', value: 'Full' },
  { label: 'Subscription Tiers', value: '3' },
]

const TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    color: 'zinc',
    accent: 'text-zinc-400',
    border: 'border-zinc-700',
    badge: null,
    features: [
      'Browse radar',
      'One-off purchases',
      'Basic dashboard',
      'Post-event reports',
    ],
    cta: 'Start Free',
    ctaLink: '/auth/sponsor/register',
    ctaClass: 'border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white',
  },
  {
    name: 'Community',
    monthlyPrice: 150000,
    annualPrice: 1500000,
    color: 'yellow',
    accent: 'text-yellow-400',
    border: 'border-yellow-500/30',
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      '2 Online sponsorships/month',
      'ROI tracking & analytics',
      'Influencer marketplace',
      'Priority listing',
      'Account support',
    ],
    cta: 'Get Community',
    ctaLink: '/auth/sponsor/register',
    ctaClass: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  },
  {
    name: 'Premium',
    monthlyPrice: 300000,
    annualPrice: 3000000,
    color: 'yellow',
    accent: 'text-yellow-400',
    border: 'border-yellow-500/20',
    badge: null,
    features: [
      'Everything in Community',
      '2 Online + 1 Offline/month',
      'Full influencer marketplace',
      'Managed campaigns',
      'Custom integrations',
      'Dedicated account manager',
      'Custom reporting',
    ],
    cta: 'Get Premium',
    ctaLink: '/auth/sponsor/register',
    ctaClass: 'border border-yellow-500/40 hover:border-yellow-500 text-yellow-400 hover:text-white',
  },
]

function formatEGP(amount) {
  if (amount === 0) return 'EGP 0'
  return 'EGP ' + amount.toLocaleString()
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12 px-4 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HeruLogo className="h-6" />
          <span className="text-zinc-500 text-sm">The Esports OS for MENA</span>
        </div>
        <div className="flex gap-6 text-sm text-zinc-500">
          <Link to="/for-gamers" className="hover:text-white transition-colors">ARENA</Link>
          <Link to="/for-organizers" className="hover:text-white transition-colors">BUILDER</Link>
          <Link to="/for-sponsors" className="hover:text-white transition-colors">RADAR</Link>
          <Link to="/for-providers" className="hover:text-white transition-colors">GIGs</Link>
        </div>
        <p className="text-zinc-600 text-xs">© 2026 HERU.gg — All rights reserved.</p>
      </div>
    </footer>
  )
}

export default function ForSponsors() {
  const [billing, setBilling] = useState('monthly')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* HERO */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.10] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Zap className="w-3 h-3" />
            HERU RADAR — For Sponsors
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Sponsor Esports.{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Measure Everything.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Browse live sponsorship packages from MENA's best esports organizers. Track ROI. Hire influencers. Build your brand in gaming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/sponsor/register"
              className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Explore Radar <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              View Pricing <Crown className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 py-6 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES TIMELINE */}
      <section className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Everything a sponsor needs</h2>
            <p className="text-zinc-400 text-lg">From discovery to ROI proof — all in one platform.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500/40 to-transparent hidden md:block" />

            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="hidden md:flex absolute left-1/2 top-2 -translate-x-1/2 w-10 h-10 rounded-full bg-yellow-600 border-2 border-yellow-500 items-center justify-center text-white font-black text-sm z-10">
                  {i + 1}
                </div>
                <div className={`w-full md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-yellow-500/40 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                        <step.Icon className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h3 className="text-white font-bold">{step.title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white mb-4">Sponsorship Plans</h2>
            <p className="text-zinc-400 text-lg mb-8">Start free. Scale when you're ready.</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
              <button
                onClick={() => setBilling('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                  billing === 'monthly' ? 'bg-yellow-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                  billing === 'annual' ? 'bg-yellow-600 text-white' : 'text-zinc-400 hover:text-white'
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
                <div
                  key={tier.name}
                  className={`relative p-8 rounded-2xl bg-zinc-900 border ${tier.border} flex flex-col`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-yellow-600 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className={`text-lg font-black mb-1 ${tier.accent}`}>{tier.name}</h3>
                    <div className="text-4xl font-black text-white leading-none">
                      {price === 0 ? 'EGP 0' : formatEGP(price)}
                    </div>
                    <div className="text-zinc-500 text-sm mt-1">{period}</div>
                  </div>

                  <ul className="space-y-2 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={tier.ctaLink}
                    className={`w-full text-center font-bold py-3 px-6 rounded-xl transition-colors ${tier.ctaClass}`}
                  >
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

      <Footer />
    </div>
  )
}
