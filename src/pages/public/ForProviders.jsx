import React from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import HeruLogo from '@/components/shared/HeruLogo'
import { MapPin, Award, Mic, Camera, Megaphone, Users, Cpu, Package, Settings, Star, DollarSign, Shield, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  { Icon: MapPin, name: 'Venue', desc: 'Specialized gaming venues & offline event spaces' },
  { Icon: Award, name: 'Coaching', desc: '1:1 coaching sessions with ranked gamers (shown to gamers)' },
  { Icon: Mic, name: 'Talent & Influencer', desc: 'Hosts, casters, analysts, streamers (shown to organizers & sponsors)' },
  { Icon: Camera, name: 'Media Production', desc: 'Live streaming setup, video editing, broadcast production' },
  { Icon: Megaphone, name: 'Marketing', desc: 'Social media campaigns, Discord growth, influencer outreach' },
  { Icon: Users, name: 'Gaming Community', desc: 'Discord servers, Facebook groups, IG & TikTok gaming pages' },
  { Icon: Cpu, name: 'Gaming Hardware', desc: 'Gaming chair, PC, peripheral rentals & setup' },
  { Icon: Package, name: 'Event Vendors', desc: 'Catering, decoration, logistics for offline events' },
  { Icon: Settings, name: 'Tournament Management', desc: 'Full-service tournament management & consulting' },
]

const STEPS = [
  {
    Icon: Star,
    title: 'Create Your Profile',
    desc: 'Register, pick your category, write your description and set your pricing.',
  },
  {
    Icon: Shield,
    title: 'Staff Review & Approval',
    desc: 'HERU team reviews your listing. Approved providers appear in the Tournament Builder.',
  },
  {
    Icon: TrendingUp,
    title: 'Get Discovered',
    desc: 'Organizers browse your profile while building tournaments. You appear in the relevant category.',
  },
  {
    Icon: DollarSign,
    title: 'Receive a Booking',
    desc: 'Organizer books you. HERU holds payment in escrow. You get notified immediately.',
  },
  {
    Icon: Users,
    title: 'Deliver & Communicate',
    desc: 'Access the Tournament CRM: chat with organizer, upload files, manage tasks, mark deliverables done.',
  },
  {
    Icon: Award,
    title: 'Get Paid',
    desc: 'Organizer confirms delivery. 85% of the booking amount releases to you instantly.',
  },
]

const STAT_NUMBERS = [
  { value: '85%', label: 'Payout' },
  { value: 'Escrow', label: 'Protection' },
  { value: '9', label: 'Categories' },
  { value: 'Instant', label: 'Notifications' },
]

const PRICING_FEATURES = [
  'No subscription required',
  'Only pay when you earn',
  'Escrow-protected payouts',
  'Full CRM access included',
]

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

export default function ForProviders() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* HERO */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.10] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <DollarSign className="w-3 h-3" />
            HERU GIGs — For Service Providers
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Get{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Paid</span>{' '}
            to Power Esports.
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            List your services once. Get discovered by every organizer building a tournament across MENA. Escrow-protected payouts every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/provider/register"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              List Your Services <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              See Categories <TrendingUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 9 SERVICE CATEGORIES */}
      <section id="categories-section" className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">9 Service Categories</h2>
            <p className="text-zinc-400 text-lg">Every type of esports service provider belongs on HERU GIGs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
                  <cat.Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-white font-bold mb-2">{cat.name}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - VISUAL TIMELINE */}
      <section className="relative py-20 px-4 overflow-hidden bg-zinc-900/20">
        <img
          src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-zinc-400 text-lg">From signup to first payout in 6 steps.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent hidden md:block" />

            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="hidden md:flex absolute left-1/2 top-2 -translate-x-1/2 w-10 h-10 rounded-full bg-cyan-600 border-2 border-cyan-500 items-center justify-center text-white font-black text-sm z-10">
                  {i + 1}
                </div>
                <div className={`w-full md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                        <step.Icon className="w-4 h-4 text-cyan-400" />
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

      {/* STATS */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STAT_NUMBERS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black text-cyan-400 mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Pricing</h2>
          <p className="text-zinc-400 mb-10">No monthly fees. No upfront costs. Just results.</p>

          <div className="p-10 rounded-2xl bg-zinc-900 border border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
            <div className="text-lg font-bold text-cyan-400 mb-4">Simple. Fair. No monthly fee.</div>

            <div className="mb-2">
              <span className="text-8xl font-black text-white">85%</span>
            </div>
            <div className="text-zinc-300 font-bold text-xl mb-1">You Keep</div>
            <div className="text-zinc-500 text-sm mb-8">15% HERU fee per completed booking</div>

            <ul className="space-y-3 mb-10 text-left max-w-xs mx-auto">
              {PRICING_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/auth/provider/register"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg"
            >
              List Your Services <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
