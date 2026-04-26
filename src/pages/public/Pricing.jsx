import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import HeruLogo from '@/components/shared/HeruLogo'
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react'

const TABS = ['Gamers', 'Organizers', 'Sponsors', 'Providers']

function GamerPricing() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
        HERU ARENA — Gamers
      </div>
      <div className="p-10 rounded-2xl bg-zinc-900 border border-red-500/20">
        <div className="text-lg font-bold text-red-400 mb-2">Free. Always.</div>
        <div className="text-7xl font-black text-white mb-2">EGP 0</div>
        <div className="text-zinc-500 mb-8">per month</div>
        <ul className="space-y-3 mb-10 text-left max-w-xs mx-auto">
          {[
            'Join tournaments',
            'Create teams',
            'Book coaches',
            'Community bracket builder',
            'Add friends & message',
            'View leaderboards',
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-red-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          to="/auth/gamer/register"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          Join Free <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

function OrganizerPricing() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
          HERU BUILDER — Organizers
        </div>
        <p className="text-zinc-400">Free to create. We only earn when you do.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h3 className="text-white font-black text-xl mb-6">Service Bookings</h3>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Organizer pays provider', value: 'EGP amount' },
              { label: 'HERU platform fee', value: '15%', color: 'text-purple-400' },
              { label: 'Provider receives', value: '85%', color: 'text-green-400' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-400 text-sm">{row.label}</span>
                <span className={`font-bold ${row.color || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs">Escrow-protected. Released on confirmed delivery.</p>
        </div>
        <div className="p-8 rounded-2xl bg-zinc-900 border border-purple-500/20">
          <h3 className="text-white font-black text-xl mb-6">Sponsorship Income</h3>
          <div className="space-y-3 mb-6">
            {[
              { label: 'Sponsor pays package', value: 'EGP amount' },
              { label: 'HERU platform fee', value: '15%', color: 'text-purple-400' },
              { label: 'You receive', value: '85%', color: 'text-green-400 text-2xl' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-400 text-sm">{row.label}</span>
                <span className={`font-bold ${row.color || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs">You keep the majority on every sponsorship deal.</p>
        </div>
      </div>
      <div className="text-center mt-8">
        <Link
          to="/auth/organizer/register"
          className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          Start Building Free <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

const SPONSOR_TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    accent: 'text-zinc-400',
    border: 'border-zinc-700',
    badge: null,
    features: ['Browse radar', 'One-off purchases', 'Basic dashboard', 'Post-event reports'],
    cta: 'Start Free',
    ctaClass: 'border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white',
  },
  {
    name: 'Community',
    monthlyPrice: 150000,
    annualPrice: 1500000,
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
    ctaClass: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  },
  {
    name: 'Premium',
    monthlyPrice: 300000,
    annualPrice: 3000000,
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
    ctaClass: 'border border-yellow-500/40 hover:border-yellow-500 text-yellow-400 hover:text-white',
  },
]

function SponsorPricing() {
  const [billing, setBilling] = useState('monthly')

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-4 tracking-widest uppercase">
          HERU RADAR — Sponsors
        </div>
        <p className="text-zinc-400 mb-6">Start free. Scale when you're ready.</p>
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

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {SPONSOR_TIERS.map((tier) => {
          const price = billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice
          const period = billing === 'monthly' ? '/month' : '/year'

          return (
            <div key={tier.name} className={`relative p-8 rounded-2xl bg-zinc-900 border ${tier.border} flex flex-col`}>
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
                  {price === 0 ? 'EGP 0' : 'EGP ' + price.toLocaleString()}
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
                to="/auth/sponsor/register"
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
  )
}

function ProviderPricing() {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
        HERU GIGs — Service Providers
      </div>
      <div className="p-10 rounded-2xl bg-zinc-900 border border-cyan-500/20">
        <div className="text-lg font-bold text-cyan-400 mb-4">Simple. Fair. No monthly fee.</div>
        <div className="text-8xl font-black text-white mb-2">85%</div>
        <div className="text-zinc-300 font-bold text-xl mb-1">You Keep</div>
        <div className="text-zinc-500 text-sm mb-8">15% HERU fee per completed booking</div>
        <ul className="space-y-3 mb-10 text-left max-w-xs mx-auto">
          {[
            'No subscription required',
            'Only pay when you earn',
            'Escrow-protected payouts',
            'Full CRM access included',
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          to="/auth/provider/register"
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-4 rounded-xl transition-colors"
        >
          List Your Services <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
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

const TAB_ACCENT = {
  Gamers: 'border-red-500 text-red-400',
  Organizers: 'border-purple-500 text-purple-400',
  Sponsors: 'border-yellow-500 text-yellow-400',
  Providers: 'border-cyan-500 text-cyan-400',
}

const TAB_INACTIVE = 'border-transparent text-zinc-500 hover:text-zinc-300'

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('Gamers')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* HERO */}
      <section className="py-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-zinc-700 text-zinc-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
          <Zap className="w-3 h-3" />
          Pricing
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-zinc-400 max-w-xl mx-auto">
          No surprises. Every stakeholder has a clear, fair pricing model.
        </p>
      </section>

      {/* TABS */}
      <div className="border-b border-zinc-800 px-4">
        <div className="max-w-4xl mx-auto flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === tab ? TAB_ACCENT[tab] : TAB_INACTIVE
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <section className="py-16 px-4 flex-1">
        {activeTab === 'Gamers' && <GamerPricing />}
        {activeTab === 'Organizers' && <OrganizerPricing />}
        {activeTab === 'Sponsors' && <SponsorPricing />}
        {activeTab === 'Providers' && <ProviderPricing />}
      </section>

      <Footer />
    </div>
  )
}
