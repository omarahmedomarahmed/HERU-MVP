import React from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import HeruLogo from '@/components/shared/HeruLogo'
import { Trophy, Users, Star, Swords, Target, Award, Gamepad2, MessageSquare, UserPlus, ChevronRight, ArrowRight, Zap } from 'lucide-react'

const STEPS = [
  {
    Icon: Gamepad2,
    title: 'Create Your Gamer Profile',
    desc: 'Choose your games, link accounts, set your rank and showcase your talent.',
  },
  {
    Icon: Target,
    title: 'Link Your Game Accounts',
    desc: 'Connect Riot, Valorant, PUBG IDs. Auto-sync stats and rank badges to your profile.',
  },
  {
    Icon: Trophy,
    title: 'Browse & Join Tournaments',
    desc: 'Enter open brackets with real prize pools in EGP. Filter by game, skill level, and format.',
  },
  {
    Icon: Swords,
    title: 'Build Your Own Community Bracket',
    badge: 'NEW',
    desc: 'Create private scrims, 1v1s, or invite-only brackets instantly — no organizer needed.',
  },
  {
    Icon: Users,
    title: 'Create & Join Teams',
    desc: 'Form or join a team. Apply to open recruiting teams or invite players to yours.',
  },
  {
    Icon: UserPlus,
    title: 'Find Team Mates',
    desc: 'Browse players looking for teams. Filter by game, rank, and availability.',
  },
  {
    Icon: Award,
    title: 'Book a Coaching Session',
    desc: '1:1 coaching from ranked coaches. Pick your game, session length, and budget.',
  },
  {
    Icon: Star,
    title: 'Climb the HERU Leaderboard',
    desc: 'Every win earns you points. Compete for top spots on the global and Egypt leaderboards.',
  },
]

const STATS = [
  { label: 'Free to Use', value: '100%' },
  { label: 'Tournaments', value: '500+' },
  { label: 'Gamers', value: '25K+' },
  { label: 'Live Brackets', value: '✓' },
]

const HOW_STEPS = [
  { num: '01', title: 'Register', desc: 'Create your free gamer account in under 2 minutes.' },
  { num: '02', title: 'Compete', desc: 'Join tournaments, build brackets, or book a coach.' },
  { num: '03', title: 'Climb', desc: 'Rack up wins and rise on the MENA leaderboard.' },
]

const FREE_FEATURES = [
  'Join tournaments',
  'Create teams',
  'Book coaches',
  'Community builder',
  'Add friends & message',
  'View leaderboards',
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

export default function ForGamers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* HERO */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-transparent to-zinc-950 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase">
            <Zap className="w-3 h-3" />
            HERU ARENA — For Gamers
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">Compete.</span>{' '}
            Climb. Connect.
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join tournaments, build teams, book coaches, and climb the MENA leaderboard — all for free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/gamer/register"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Browse Tournaments <ChevronRight className="w-5 h-5" />
            </Link>
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
            <h2 className="text-4xl font-black text-white mb-4">Everything you need to compete</h2>
            <p className="text-zinc-400 text-lg">One platform. Every tool a gamer needs to grow.</p>
          </div>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-500/40 to-transparent hidden md:block" />

            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Number circle on center line */}
                <div className="hidden md:flex absolute left-1/2 top-2 -translate-x-1/2 w-10 h-10 rounded-full bg-red-600 border-2 border-red-500 items-center justify-center text-white font-black text-sm z-10">
                  {i + 1}
                </div>
                {/* Content card */}
                <div className={`w-full md:w-[calc(50%-2.5rem)] ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
                        <step.Icon className="w-4 h-4 text-red-400" />
                      </div>
                      <h3 className="text-white font-bold">{step.title}</h3>
                      {step.badge && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
                          {step.badge}
                        </span>
                      )}
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
            <p className="text-zinc-400">Three steps to your first win.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_STEPS.map((s) => (
              <div key={s.num} className="text-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500/30 transition-colors">
                <div className="text-6xl font-black text-red-500/20 mb-4 leading-none">{s.num}</div>
                <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4">Pricing</h2>
          <p className="text-zinc-400 mb-10">No hidden costs. No subscriptions. No BS.</p>

          <div className="p-10 rounded-2xl bg-zinc-900 border border-red-500/20 shadow-2xl shadow-red-500/5">
            <div className="text-lg font-bold text-red-400 mb-2">Free. Always.</div>
            <div className="text-7xl font-black text-white mb-2">EGP 0</div>
            <div className="text-zinc-500 mb-8">per month</div>

            <ul className="space-y-3 mb-10 text-left max-w-xs mx-auto">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-3 h-3 text-red-400" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              to="/auth/gamer/register"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-xl transition-colors text-lg"
            >
              Join Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
