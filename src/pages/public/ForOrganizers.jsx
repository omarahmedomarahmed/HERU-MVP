import React from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Trophy, Users, Package, DollarSign, Settings, FileText, BarChart3, Layers,
  ChevronRight, ArrowRight, Building2, Zap, CheckCircle2, Shield, TrendingUp, Star
} from 'lucide-react'

// ─── Images ───────────────────────────────────
const HERO_IMG     = 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=80'
const IMG_BUILDER  = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80'
const IMG_SPONSORS = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80'
const IMG_CRM      = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=900&q=80'
const IMG_BRACKET  = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&q=80'

const FEATURES = [
  {
    Icon: Trophy,
    title: '5-Step Tournament Builder',
    desc: 'Build online or offline tournaments with a guided wizard: game settings, details, prize pool, service providers, sponsorship packages.',
    img: IMG_BUILDER,
    badge: 'Tournament Builder',
    points: ['Online & offline formats', 'Custom prize structures', 'Public or private registration', 'Instant publish to HERU RADAR'],
  },
  {
    Icon: DollarSign,
    title: 'Sponsorship Package Creator',
    desc: 'Design tiered packages (Title / Gold / Silver / Bronze). Sponsors see packages on HERU RADAR — never your internal costs.',
    img: IMG_SPONSORS,
    badge: 'Sponsorship Tools',
    points: ['Custom tier naming', 'Deliverables & reach metrics', 'Minimum 1.5× service cost guidance', 'ROI tracking for sponsors'],
  },
  {
    Icon: Settings,
    title: 'Full Tournament CRM',
    desc: 'One dashboard to manage teams, brackets, sponsors, service providers, files, tasks, and ROI data.',
    img: IMG_CRM,
    badge: 'CRM',
    points: ['Team seeding & registration', 'Sponsor communication', 'Provider task board', 'File sharing portal'],
  },
  {
    Icon: BarChart3,
    title: 'Live Brackets & Seeding',
    desc: 'Visual bracket generator with auto-advance, manual seeding, and real-time match updates visible to the public.',
    img: IMG_BRACKET,
    badge: 'Brackets',
    points: ['Auto-advancing brackets', 'Manual or random seeding', 'Public spectator view', 'Match result entry'],
  },
]

const STEPS = [
  { num: '01', title: 'Build',         desc: 'Create your tournament in minutes with the 5-step wizard.' },
  { num: '02', title: 'Add Services',  desc: 'Hire venue, production, talent — all from HERU GIGs marketplace.' },
  { num: '03', title: 'Create Packages', desc: 'Design sponsorship tiers and list them on HERU RADAR.' },
  { num: '04', title: 'Get Funded',    desc: 'Sponsors buy in. You keep 85% of every deal.' },
]

const STATS = [
  { label: 'Free to Build',  value: '100%',  color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Platform Fee',   value: '15%',   color: 'text-white',      bg: 'bg-white/8' },
  { label: 'Event Types',    value: '2',     color: 'text-white',      bg: 'bg-white/8' },
  { label: 'Full CRM',       value: '✓',     color: 'text-green-400',  bg: 'bg-green-500/10' },
]

const SERVICE_CATEGORIES = [
  'Venue', 'Media Production', 'Talent & Influencer', 'Marketing',
  'Gaming Community', 'Gaming Hardware', 'Event Vendors', 'Tournament Management',
]

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
            ['Organizers', [['Register', '/auth/organizer/register'], ['Login', '/auth/organizer/login'], ['Tournaments', '/tournaments'], ['Pricing', '/pricing']]],
            ['Platform', [['Teams', '/teams'], ['Coaches', '/coaches'], ['Leaderboards', '/leaderboards'], ['Radar', '/radar']]],
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

export default function ForOrganizers() {
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
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-600/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full py-24">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <Building2 className="w-3.5 h-3.5" />
            HERU BUILDER — For Organizers
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.0] tracking-tight max-w-4xl">
            Build Events That{' '}
            <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-400 bg-clip-text text-transparent">Get Funded.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
            Create professional tournaments, book service providers, build sponsorship packages, and manage everything from{' '}
            <span className="text-white font-semibold">one powerful CRM</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              to="/auth/organizer/register"
              className="inline-flex items-center gap-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold px-10 py-4 rounded-xl transition-all text-lg shadow-lg shadow-purple-600/25 hover:-translate-y-0.5"
            >
              <Trophy className="w-5 h-5" /> Start Building Free
            </Link>
            <a href="#features"
              className="inline-flex items-center gap-2.5 border border-zinc-700 hover:border-purple-500/50 text-zinc-300 hover:text-white font-bold px-10 py-4 rounded-xl transition-all text-lg">
              See Features <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          {/* Service Provider Categories hint */}
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3 font-semibold">Book from 8 service categories</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map(cat => (
                <span key={cat} className="px-3 py-1.5 rounded-full bg-purple-500/8 border border-purple-500/15 text-xs text-purple-300 font-medium">
                  {cat}
                </span>
              ))}
            </div>
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
      <section id="features" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
              Features
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Everything you need to run pro events</h2>
            <p className="text-zinc-400 text-lg">From idea to funded tournament in days, not months.</p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`group flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-purple-500/30 transition-all duration-500`}>
                <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-full">{f.badge}</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-10 bg-zinc-900/60 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-5">
                    <f.Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-base mb-6">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.points.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">How It Works</h2>
            <p className="text-zinc-400 text-lg">Four steps from concept to funded event.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 transition-all group">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2.5 z-10">
                    <ArrowRight className="w-5 h-5 text-purple-500/30" />
                  </div>
                )}
                <div className="text-6xl font-black text-purple-500/15 mb-3 leading-none group-hover:text-purple-500/25 transition-colors">{s.num}</div>
                <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&q=70" alt="" className="w-full h-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              Pricing
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Free to Create.</h2>
            <p className="text-zinc-400 text-lg">We only earn when you do.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-10 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-black text-white">Service Bookings</h3>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  { label: 'Organizer pays provider', value: 'EGP amount' },
                  { label: 'HERU platform fee', value: '15%', color: 'text-purple-400' },
                  { label: 'Provider receives', value: '85%', color: 'text-green-400' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
                    <span className="text-zinc-400 text-sm">{row.label}</span>
                    <span className={`font-bold text-lg ${row.color || 'text-white'}`}>{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-zinc-500 text-xs">Escrow-protected. Payment released on confirmed delivery.</p>
            </div>

            <div className="p-10 rounded-3xl bg-zinc-900 border border-purple-500/25 hover:border-purple-500/50 transition-all shadow-lg shadow-purple-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-black text-white">Sponsorship Income</h3>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  { label: 'Sponsor pays package', value: 'EGP amount' },
                  { label: 'HERU platform fee', value: '15%', color: 'text-purple-400' },
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

          <div className="text-center">
            <Link
              to="/auth/organizer/register"
              className="inline-flex items-center gap-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold px-12 py-4 rounded-xl transition-all text-lg shadow-lg shadow-purple-700/25"
            >
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <ProductFooter />
    </div>
  )
}
