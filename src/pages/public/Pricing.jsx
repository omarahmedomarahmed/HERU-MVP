import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  CheckCircle2, ArrowRight, Zap, Gamepad2, Building2, Radar, Briefcase,
  Shield, DollarSign, Package, Star
} from 'lucide-react'

// ─── Images ────────────────────────────────────
const HERO_BG     = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1920&q=80'
const IMG_ARENA   = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'
const IMG_BUILDER = 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=800&q=80'
const IMG_RADAR   = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80'
const IMG_GIGS    = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80'

const PRODUCTS = [
  { key: 'Gamers',     icon: Gamepad2,  label: 'HERU ARENA',   color: 'text-red-400',    border: 'border-red-500',    bg: 'bg-red-500' },
  { key: 'Organizers', icon: Building2, label: 'HERU BUILDER', color: 'text-purple-400', border: 'border-purple-500', bg: 'bg-purple-500' },
  { key: 'Sponsors',   icon: Radar,     label: 'HERU RADAR',   color: 'text-yellow-400', border: 'border-yellow-500', bg: 'bg-yellow-500' },
  { key: 'Providers',  icon: Briefcase, label: 'HERU GIGs',    color: 'text-cyan-400',   border: 'border-cyan-500',   bg: 'bg-cyan-500' },
]

// ─── Gamer Pricing ─────────────────────────────
function GamerPricing() {
  return (
    <div className="space-y-12">
      {/* Hero card */}
      <div className="relative rounded-3xl overflow-hidden border border-red-500/20">
        <img src={IMG_ARENA} alt="HERU ARENA" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 to-zinc-950/70" />
        <div className="relative grid md:grid-cols-2 gap-0">
          <div className="p-12">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
              <Gamepad2 className="w-3.5 h-3.5" /> HERU ARENA
            </div>
            <h2 className="text-5xl font-black text-white mb-3">
              <span className="text-red-400">EGP 0</span>
            </h2>
            <p className="text-zinc-400 mb-2 text-lg">per month — forever</p>
            <p className="text-zinc-500 text-sm mb-8">HERU ARENA is completely free. Every single feature.</p>
            <Link to="/auth/gamer/register"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-red-600/25">
              Join Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-12 flex items-center">
            <div className="w-full">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Everything included:</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Join unlimited tournaments',
                  'Create & manage teams',
                  'Book coaching sessions',
                  'Community bracket builder',
                  'Friends & direct messages',
                  'View full leaderboards',
                  'Riot & Valorant account linking',
                  'Achievement badges & rank',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Free */}
      <div className="text-center p-10 rounded-2xl bg-red-500/5 border border-red-500/15">
        <h3 className="text-2xl font-black text-white mb-3">Why is it free?</h3>
        <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Gamers are the heartbeat of HERU. More players means more tournaments, which means more sponsorship, which funds bigger prize pools.
          The flywheel runs on free gamers. That's why we'll never charge you.
        </p>
      </div>
    </div>
  )
}

// ─── Organizer Pricing ─────────────────────────
function OrganizerPricing() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-purple-500/20">
        <img src={IMG_BUILDER} alt="HERU BUILDER" className="absolute inset-0 w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 to-zinc-950/70" />
        <div className="relative p-12 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Building2 className="w-3.5 h-3.5" /> HERU BUILDER
          </div>
          <h2 className="text-5xl font-black text-white mb-3">Free to Create.</h2>
          <p className="text-zinc-400 text-lg mb-2">We only earn when you do.</p>
          <p className="text-zinc-500 text-sm mb-8">15% platform fee on transactions. Zero upfront.</p>
          <Link to="/auth/organizer/register"
            className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-purple-700/25">
            Start Building Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Two fee cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-10 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-all">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-black text-white">Service Bookings</h3>
          </div>
          <div className="space-y-4 mb-6">
            {[
              { label: 'Organizer pays provider', value: 'EGP amount' },
              { label: 'HERU platform fee', value: '15%', color: 'text-purple-400 text-xl' },
              { label: 'Provider receives', value: '85%', color: 'text-green-400 text-xl' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-400 text-sm">{row.label}</span>
                <span className={`font-bold ${row.color || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs">Escrow-protected. Released on confirmed delivery.</p>
        </div>

        <div className="p-10 rounded-3xl bg-zinc-900 border border-purple-500/25 shadow-lg shadow-purple-500/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-black text-white">Sponsorship Income</h3>
          </div>
          <div className="space-y-4 mb-6">
            {[
              { label: 'Sponsor pays package', value: 'EGP amount' },
              { label: 'HERU platform fee', value: '15%', color: 'text-purple-400 text-xl' },
              { label: 'You receive', value: '85%', color: 'text-green-400 text-3xl' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-400 text-sm">{row.label}</span>
                <span className={`font-bold ${row.color || 'text-white'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs">You keep the majority on every sponsorship deal.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Sponsor Pricing ───────────────────────────
const SPONSOR_TIERS = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    accent: 'text-zinc-300',
    bg: 'bg-zinc-900',
    border: 'border-zinc-700',
    badge: null,
    features: ['Browse radar', 'One-off purchases', 'Basic dashboard', 'Post-event reports'],
    cta: 'Start Free',
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
      'Account support',
    ],
    cta: 'Get Community',
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
      'Managed campaigns',
      'Custom integrations',
      'Dedicated account manager',
      'Custom reporting',
    ],
    cta: 'Get Premium',
    ctaClass: 'border border-yellow-500/40 hover:border-yellow-400 text-yellow-400 hover:text-white hover:bg-yellow-500/10',
  },
]

function SponsorPricing() {
  const [billing, setBilling] = useState('monthly')

  return (
    <div className="space-y-8">
      {/* Header image */}
      <div className="relative h-48 rounded-3xl overflow-hidden border border-yellow-500/20">
        <img src={IMG_RADAR} alt="HERU RADAR" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-zinc-950/90" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold px-4 py-2 rounded-full mb-3 tracking-widest uppercase">
            <Radar className="w-3.5 h-3.5" /> HERU RADAR — Sponsors
          </div>
          <h2 className="text-3xl font-black text-white">Start free. Scale when you're ready.</h2>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-xl p-1">
          <button onClick={() => setBilling('monthly')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              billing === 'monthly' ? 'bg-yellow-600 text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}>Monthly</button>
          <button onClick={() => setBilling('annual')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              billing === 'annual' ? 'bg-yellow-600 text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}>
            Annual
            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">2 months free</span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {SPONSOR_TIERS.map((tier) => {
          const price = billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice
          const period = billing === 'monthly' ? '/month' : '/year'
          return (
            <div key={tier.name}
              className={`relative flex flex-col rounded-3xl ${tier.bg} border ${tier.border} p-10 transition-all hover:-translate-y-1 duration-300`}>
              {tier.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-yellow-600 text-black text-xs font-black px-5 py-1.5 rounded-full shadow-lg">{tier.badge}</span>
                </div>
              )}
              <div className="mb-8">
                <h3 className={`text-lg font-black mb-1 ${tier.accent}`}>{tier.name}</h3>
                <div className="text-5xl font-black text-white leading-none mb-1">
                  {price === 0 ? 'EGP 0' : 'EGP ' + price.toLocaleString()}
                </div>
                <div className="text-zinc-500 text-sm">{period}</div>
              </div>
              <ul className="space-y-3 mb-10 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/auth/sponsor/register"
                className={`w-full text-center font-bold py-3.5 px-6 rounded-xl transition-all ${tier.ctaClass}`}>
                {tier.cta}
              </Link>
            </div>
          )
        })}
      </div>
      <p className="text-center text-zinc-500 text-sm">15% platform fee on all sponsorship purchases. Subscription covers bundled monthly activations.</p>
    </div>
  )
}

// ─── Provider Pricing ──────────────────────────
function ProviderPricing() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/20">
        <img src={IMG_GIGS} alt="HERU GIGs" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 to-zinc-950/70" />
        <div className="relative grid md:grid-cols-2 gap-0">
          <div className="p-12 flex items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
                <Briefcase className="w-3.5 h-3.5" /> HERU GIGs
              </div>
              <h2 className="text-6xl font-black text-white mb-2 leading-none">85%</h2>
              <p className="text-2xl font-bold text-white mb-2">You Keep</p>
              <p className="text-zinc-400 mb-8">15% HERU fee per completed booking only.</p>
              <Link to="/auth/provider/register"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-cyan-600/25">
                List Your Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-12 flex items-center">
            <div className="w-full">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">What's included:</p>
              <div className="space-y-3">
                {[
                  'No monthly subscription required',
                  'Only pay when you earn',
                  'Escrow-protected payouts',
                  'Full CRM access included',
                  'Public portfolio page',
                  'Rating & review system',
                  'Staff approval = quality signal',
                  '9 service category support',
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example earnings */}
      <div className="p-10 rounded-3xl bg-zinc-900 border border-zinc-800">
        <h3 className="text-xl font-black text-white mb-6 text-center">Example Earnings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { booking: 'EGP 5,000',  net: 'EGP 4,250',  label: 'Small Booking' },
            { booking: 'EGP 25,000', net: 'EGP 21,250', label: 'Mid Booking' },
            { booking: 'EGP 50,000', net: 'EGP 42,500', label: 'Large Booking' },
          ].map(({ booking, net, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">{label}</p>
              <p className="text-zinc-400 text-sm mb-1">Booking: <span className="text-white font-semibold">{booking}</span></p>
              <p className="text-2xl font-black text-cyan-400">{net}</p>
              <p className="text-xs text-zinc-500 mt-1">you receive (85%)</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────
const TAB_ACCENT = {
  Gamers:     'border-red-500 text-red-400',
  Organizers: 'border-purple-500 text-purple-400',
  Sponsors:   'border-yellow-500 text-yellow-400',
  Providers:  'border-cyan-500 text-cyan-400',
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 py-14 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xl font-black text-white mb-1">HERU<span className="text-red-500">.</span>gg</p>
          <p className="text-sm text-zinc-500">The Esports OS for MENA</p>
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

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('Gamers')

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950" />
        </div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-white/3 blur-[120px]" />
        <div className="relative max-w-4xl mx-auto text-center pt-16">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-zinc-700 text-zinc-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Zap className="w-3.5 h-3.5" /> Transparent Pricing
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 leading-[1.05]">
            Simple, Fair Pricing
          </h1>
          <p className="text-xl text-zinc-400 max-w-xl mx-auto mb-12">
            No surprises. Every stakeholder has a clear, transparent pricing model.
          </p>

          {/* 4 product mini-cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {PRODUCTS.map(p => (
              <button
                key={p.key}
                onClick={() => setActiveTab(p.key)}
                className={`p-5 rounded-2xl border transition-all duration-300 text-center group
                  ${activeTab === p.key
                    ? `${p.bg} bg-opacity-15 ${p.border} border-opacity-60 shadow-lg`
                    : 'bg-white/4 border-white/10 hover:border-white/20'
                  }`}
              >
                <p.icon className={`h-6 w-6 mx-auto mb-2 ${activeTab === p.key ? p.color : 'text-zinc-400'}`} />
                <p className={`text-xs font-black ${activeTab === p.key ? p.color : 'text-zinc-400'}`}>{p.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="sticky top-16 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-xl px-4">
        <div className="max-w-5xl mx-auto flex gap-0 overflow-x-auto scrollbar-hide">
          {PRODUCTS.map((p) => (
            <button
              key={p.key}
              onClick={() => setActiveTab(p.key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === p.key ? TAB_ACCENT[p.key] : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <p.icon className="w-4 h-4" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <section className="py-16 px-4 flex-1">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'Gamers'     && <GamerPricing />}
          {activeTab === 'Organizers' && <OrganizerPricing />}
          {activeTab === 'Sponsors'   && <SponsorPricing />}
          {activeTab === 'Providers'  && <ProviderPricing />}
        </div>
      </section>

      {/* ── ALL PLANS SUMMARY ── */}
      <section className="py-16 px-4 border-t border-zinc-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white mb-2">All products at a glance</h2>
            <p className="text-zinc-500">Choose your role. Get started today.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                Icon: Gamepad2, name: 'HERU ARENA', role: 'Gamers',
                price: 'EGP 0 / mo', tagline: 'Compete & Connect',
                color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/20',
                cta: 'Join Free', href: '/auth/gamer/register', ctaColor: 'bg-red-600 hover:bg-red-500',
              },
              {
                Icon: Building2, name: 'HERU BUILDER', role: 'Organizers',
                price: '15% fee only', tagline: 'Build & Get Funded',
                color: 'text-purple-400', bg: 'bg-purple-500/8', border: 'border-purple-500/20',
                cta: 'Build Free', href: '/auth/organizer/register', ctaColor: 'bg-purple-700 hover:bg-purple-600',
              },
              {
                Icon: Radar, name: 'HERU RADAR', role: 'Sponsors',
                price: 'From EGP 0', tagline: 'Sponsor & Measure',
                color: 'text-yellow-400', bg: 'bg-yellow-500/8', border: 'border-yellow-500/20',
                cta: 'Start Free', href: '/auth/sponsor/register', ctaColor: 'bg-yellow-600 hover:bg-yellow-500 text-black',
              },
              {
                Icon: Briefcase, name: 'HERU GIGs', role: 'Providers',
                price: '85% payout', tagline: 'Get Booked & Paid',
                color: 'text-cyan-400', bg: 'bg-cyan-500/8', border: 'border-cyan-500/20',
                cta: 'List Services', href: '/auth/provider/register', ctaColor: 'bg-cyan-600 hover:bg-cyan-500',
              },
            ].map(p => (
              <div key={p.name} className={`flex flex-col p-8 rounded-2xl ${p.bg} border ${p.border} hover:-translate-y-1 transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-4`}>
                  <p.Icon className={`h-6 w-6 ${p.color}`} />
                </div>
                <p className={`text-xs font-bold uppercase tracking-widest ${p.color} mb-1`}>{p.role}</p>
                <h3 className="text-lg font-black text-white mb-1">{p.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">{p.tagline}</p>
                <p className={`text-2xl font-black ${p.color} mb-6`}>{p.price}</p>
                <Link to={p.href}
                  className={`mt-auto text-center py-3 px-6 rounded-xl text-sm font-bold text-white transition-all ${p.ctaColor}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
