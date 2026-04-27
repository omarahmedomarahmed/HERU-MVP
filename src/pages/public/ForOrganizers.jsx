import React from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import HeruLogo from '@/components/shared/HeruLogo'
import { Trophy, Users, Package, DollarSign, Settings, FileText, BarChart3, Layers, ChevronRight, ArrowRight } from 'lucide-react'

const STEPS = [
  {
    Icon: Users,
    title: 'Create Your Organizer Account',
    desc: 'Register, complete your profile, add your branding and banking details.',
  },
  {
    Icon: Trophy,
    title: 'Use the Tournament Builder',
    desc: '5-step wizard: game setup, details, prize pool, services, publish. Online or offline support.',
  },
  {
    Icon: Package,
    title: 'Select Service Providers',
    desc: 'Browse HERU GIGs providers: venue, production, branding, talent, marketing and more.',
  },
  {
    Icon: DollarSign,
    title: 'Create Sponsorship Packages',
    desc: 'Design tiered packages (Title/Gold/Silver/Bronze). Sponsors see packages on the RADAR — never your internal costs.',
  },
  {
    Icon: Settings,
    title: 'Manage with the Tournament CRM',
    desc: 'Full management: teams, brackets, seeding, sponsor chat, files, tasks, ROI tracking.',
  },
  {
    Icon: BarChart3,
    title: 'Brackets & Seeding',
    desc: 'Visual bracket generator. Seed teams, set match scores, advance winners automatically.',
  },
  {
    Icon: FileText,
    title: 'Public & Private Registration',
    desc: 'Toggle public (open) or private (invite-only). Share your registration link.',
  },
  {
    Icon: Layers,
    title: 'Get Paid',
    desc: '85% of all sponsorship income goes to you. Platform fee is only 15%.',
  },
]

const STATS = [
  { label: 'Free to Build', value: '100%' },
  { label: 'Platform Fee', value: '15%' },
  { label: 'Event Types', value: '2' },
  { label: 'Full CRM', value: '✓' },
]

const HOW_STEPS = [
  { num: '01', title: 'Build', desc: 'Create your tournament in minutes with the 5-step wizard.' },
  { num: '02', title: 'Add Services', desc: 'Hire venue, production, talent — all from one marketplace.' },
  { num: '03', title: 'Create Packages', desc: 'Design sponsorship tiers and list them on the RADAR.' },
  { num: '04', title: 'Get Funded', desc: 'Sponsors buy in. You keep 85% of every deal.' },
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

export default function ForOrganizers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* HERO */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.10] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Trophy className="w-3 h-3" />
            HERU BUILDER — For Organizers
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            Build Events That Get{' '}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Funded.</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create professional online and offline tournaments, hire service providers, attach sponsorship packages, and manage everything from one CRM.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/organizer/register"
              className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Start Building Free <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              See Features <ChevronRight className="w-5 h-5" />
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
      <section id="features" className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Everything you need to run pro events</h2>
            <p className="text-zinc-400 text-lg">From idea to funded tournament in days, not months.</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/40 to-transparent hidden md:block" />

            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className="hidden md:flex absolute left-1/2 top-2 -translate-x-1/2 w-10 h-10 rounded-full bg-purple-700 border-2 border-purple-500 items-center justify-center text-white font-black text-sm z-10">
                  {i + 1}
                </div>
                <div className={`w-full md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0">
                        <step.Icon className="w-4 h-4 text-purple-400" />
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

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
            <p className="text-zinc-400">Four steps from concept to funded event.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-colors">
                {i < HOW_STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-purple-500/30 z-10" />
                )}
                <div className="text-5xl font-black text-purple-500/20 mb-3 leading-none">{s.num}</div>
                <h3 className="text-lg font-black text-white mb-2">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Pricing</h2>
            <p className="text-zinc-400 text-lg">Free to create. We only earn when you do.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {/* Service Bookings */}
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white font-black text-xl">Service Bookings</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">Organizer pays provider</span>
                  <span className="text-white font-bold">EGP amount</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">HERU platform fee</span>
                  <span className="text-purple-400 font-bold">15%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-zinc-400 text-sm">Provider receives</span>
                  <span className="text-green-400 font-bold">85%</span>
                </div>
              </div>
              <p className="text-zinc-500 text-xs">You manage the budget. HERU holds escrow until delivery is confirmed.</p>
            </div>

            {/* Sponsorship Income */}
            <div className="p-8 rounded-2xl bg-zinc-900 border border-purple-500/20 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-white font-black text-xl">Sponsorship Income</h3>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">Sponsor pays package</span>
                  <span className="text-white font-bold">EGP amount</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400 text-sm">HERU platform fee</span>
                  <span className="text-purple-400 font-bold">15%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-zinc-400 text-sm">You receive</span>
                  <span className="text-green-400 font-bold text-2xl">85%</span>
                </div>
              </div>
              <p className="text-zinc-500 text-xs">You keep the majority. Every sponsorship deal goes directly to your account.</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/auth/organizer/register"
              className="inline-flex items-center gap-2 bg-purple-700 hover:bg-purple-600 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg"
            >
              Free to create tournaments <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
