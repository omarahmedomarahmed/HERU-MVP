import React from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  MapPin, Award, Mic, Camera, Megaphone, Users, Cpu, Package, Settings,
  Star, DollarSign, Shield, TrendingUp, ArrowRight, CheckCircle2, Briefcase, Zap
} from 'lucide-react'

// ─── Images ───────────────────────────────────
const HERO_IMG   = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80'
const IMG_GIGS   = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&q=80'
const IMG_ESCROW = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=900&q=80'
const IMG_CRM    = 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=900&q=80'
const IMG_PROFILE = 'https://images.unsplash.com/photo-1627163439134-7a8c47e08208?w=900&q=80'

const CATEGORIES = [
  { Icon: MapPin,    name: 'Specialized Venue',       desc: 'Gaming venues & offline event spaces' },
  { Icon: Award,     name: 'Coaching',                desc: '1:1 coaching for ranked gamers' },
  { Icon: Mic,       name: 'Talent & Influencer',     desc: 'Hosts, casters, streamers & analysts' },
  { Icon: Camera,    name: 'Media Production',        desc: 'Live streaming, video editing, broadcast' },
  { Icon: Megaphone, name: 'Marketing',               desc: 'Social campaigns, Discord growth' },
  { Icon: Users,     name: 'Gaming Community',        desc: 'Discord, Facebook, IG & TikTok pages' },
  { Icon: Cpu,       name: 'Gaming Hardware',         desc: 'PC, peripheral & setup rentals' },
  { Icon: Package,   name: 'Event Vendors',           desc: 'Catering, decoration, logistics' },
  { Icon: Settings,  name: 'Tournament Management',   desc: 'Full-service tournament consulting' },
]

const FEATURES = [
  {
    Icon: Briefcase,
    title: 'List Your Services',
    desc: 'Create your provider profile and list your services across any of 9 esports categories. Each listing has custom fields per category.',
    img: IMG_GIGS,
    badge: 'Service Listings',
    points: ['9 specialized categories', 'Custom fields per service', 'Portfolio & past projects', 'Reviews & ratings system'],
  },
  {
    Icon: Shield,
    title: 'Escrow-Protected Payouts',
    desc: 'Payment is held in escrow when an organizer books you. Released the moment they confirm your delivery.',
    img: IMG_ESCROW,
    badge: 'Escrow Protection',
    points: ['Zero upfront risk', 'Delivery confirmation model', 'Automatic payout on confirm', 'Full payout history'],
  },
  {
    Icon: Settings,
    title: 'Tournament CRM Access',
    desc: 'When booked, you get access to the tournament CRM: chat with organizer, upload files, track tasks, and manage deliverables.',
    img: IMG_CRM,
    badge: 'CRM Access',
    points: ['Direct organizer messaging', 'File upload & sharing', 'Task board (kanban)', 'Delivery status tracking'],
  },
  {
    Icon: Star,
    title: 'Public Portfolio Page',
    desc: 'Every provider gets a public profile showcasing services, portfolio items, past clients, and verified reviews.',
    img: IMG_PROFILE,
    badge: 'Public Profile',
    points: ['Portfolio showcase', 'Client testimonials', 'Star ratings & reviews', 'Verified organizer badges'],
  },
]

const HOW_STEPS = [
  { num: '01', title: 'Create Profile',    desc: 'Register, choose your category, write your bio and set your pricing.' },
  { num: '02', title: 'Staff Approval',    desc: 'HERU reviews your listing. Approved providers appear in the Tournament Builder.' },
  { num: '03', title: 'Get Discovered',    desc: 'Organizers browse by category while building tournaments and book you.' },
  { num: '04', title: 'Deliver & Get Paid', desc: 'Complete the booking. Organizer confirms. 85% releases to you instantly.' },
]

const STAT_NUMBERS = [
  { value: '85%',     label: 'Payout',       color: 'text-cyan-400',  bg: 'bg-cyan-500/10' },
  { value: 'Escrow',  label: 'Protection',   color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: '9',       label: 'Categories',   color: 'text-white',     bg: 'bg-white/8' },
  { value: 'Instant', label: 'Notification', color: 'text-white',     bg: 'bg-white/8' },
]

const PRICING_FEATURES = [
  'No monthly subscription fee',
  'Only 15% taken on booking completion',
  'Full CRM access at no extra cost',
  'Escrow-protected on every booking',
  'Public portfolio profile included',
  'Rating & review system included',
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
            ['Providers', [['Register', '/auth/provider/register'], ['Login', '/auth/provider/login'], ['Coaches', '/coaches'], ['Influencers', '/influencers']]],
            ['Platform', [['Tournaments', '/tournaments'], ['Teams', '/teams'], ['Leaderboards', '/leaderboards'], ['Pricing', '/pricing']]],
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

export default function ForProviders() {
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
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-teal-600/8 blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full py-24">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <Briefcase className="w-3.5 h-3.5" />
            HERU GIGs — For Service Providers
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.0] tracking-tight max-w-4xl">
            Get{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">Paid</span>{' '}
            to Power Esports.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
            List your services once. Get discovered by every organizer building a tournament across MENA.{' '}
            <span className="text-white font-semibold">Escrow-protected payouts every time.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              to="/auth/provider/register"
              className="inline-flex items-center gap-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-10 py-4 rounded-xl transition-all text-lg shadow-lg shadow-cyan-600/25 hover:-translate-y-0.5"
            >
              <DollarSign className="w-5 h-5" /> List Your Services
            </Link>
            <button
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2.5 border border-zinc-700 hover:border-cyan-500/50 text-zinc-300 hover:text-white font-bold px-10 py-4 rounded-xl transition-all text-lg cursor-pointer"
            >
              See 9 Categories <TrendingUp className="w-5 h-5" />
            </button>
          </div>

          {/* Payout highlight */}
          <div className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl bg-cyan-500/8 border border-cyan-500/20">
            <div className="text-4xl font-black text-cyan-400">85%</div>
            <div>
              <p className="font-bold text-white text-sm">You Keep</p>
              <p className="text-zinc-400 text-xs">15% platform fee only on completed bookings</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-zinc-800/60 bg-zinc-900/30 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STAT_NUMBERS.map((s) => (
            <div key={s.label} className={`text-center p-6 rounded-2xl ${s.bg}`}>
              <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9 CATEGORIES ── */}
      <section id="categories-section" className="relative py-28 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70" alt="" className="w-full h-full object-cover opacity-[0.04]" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
              9 Categories
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Every esports service belongs here</h2>
            <p className="text-zinc-400 text-lg">From venue to production — HERU GIGs covers it all.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <div key={cat.name}
                className="group p-7 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all">
                  <cat.Icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-black mb-2 text-lg">{cat.name}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
              Features
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Everything you need to thrive</h2>
            <p className="text-zinc-400 text-lg">From listing to payout — HERU handles the infrastructure.</p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`group flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-cyan-500/30 transition-all duration-500`}>
                <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-3 py-1 rounded-full">{f.badge}</span>
                  </div>
                </div>
                <div className="md:w-1/2 p-10 bg-zinc-900/60 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5">
                    <f.Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-base mb-6">{f.desc}</p>
                  <ul className="space-y-2">
                    {f.points.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-zinc-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />{p}
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
            <p className="text-zinc-400 text-lg">Four steps from signup to first payout.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {HOW_STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 transition-all group">
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-2.5 z-10">
                    <ArrowRight className="w-5 h-5 text-cyan-500/30" />
                  </div>
                )}
                <div className="text-6xl font-black text-cyan-500/15 mb-3 leading-none group-hover:text-cyan-500/25 transition-colors">{s.num}</div>
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
          <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70" alt="" className="w-full h-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
            Pricing
          </div>
          <h2 className="text-5xl font-black text-white mb-4">No Monthly Fees.</h2>
          <p className="text-zinc-400 text-lg mb-12">Pay only when you earn. Simple, fair, transparent.</p>

          <div className="relative p-12 rounded-3xl bg-zinc-900 border border-cyan-500/20 shadow-2xl shadow-cyan-500/8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-[80px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-bold mb-6">
                HERU GIGs
              </div>
              <div className="flex items-baseline justify-center gap-3 mb-2">
                <div className="text-8xl font-black text-white leading-none">85%</div>
              </div>
              <div className="text-zinc-300 font-bold text-2xl mb-1">You Keep</div>
              <div className="text-zinc-500 mb-10">15% HERU fee per completed booking</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-left">
                {PRICING_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <Link
                to="/auth/provider/register"
                className="inline-flex items-center gap-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-12 py-4 rounded-xl transition-all text-lg shadow-lg shadow-cyan-600/30"
              >
                List Your Services <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductFooter />
    </div>
  )
}
