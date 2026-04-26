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
    desc: 'Create private scrims, 1v1s, or invite-only brackets instantly — no organizer needed.',
    badge: 'NEW',
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

      {/* Hero */}
      <section className="relative py-28 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 text-sm font-semibold tracking-wide">HERU ARENA — For Gamers</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">Compete.</span>{' '}
            Climb. Connect.
          </h1>
          <p className="text-zinc-400 text-xl md:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed">
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
              className="inline-flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Browse Tournaments <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-zinc-800 bg-zinc-900/50 py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Free to Use', value: '100%' },
            { label: 'Tournaments', value: '500+' },
            { label: 'Gamers', value: '25K+' },
            { label: 'Live Brackets', value: 'Real-time' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-black text-red-400">{s.value}</div>
              <div className="text-zinc-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Timeline */}
      <section className="relative py-20 px-4 overflow-hidden" id="features">
        <img
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Everything you need to compete</h2>
            <p className="text-zinc-400 text-lg">One platform for every part of your esports journey.</p>
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
                <div className={`md:w-[calc(50%-2.5rem)] w-full ${i % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'}`}>
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

      {/* How It Works */}
      <section className="py-20 px-4 bg-zinc-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-zinc-400 text-lg">Get into the game in minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '01', title: 'Register', desc: 'Create your free gamer account in under 2 minutes — no credit card required.' },
              { number: '02', title: 'Compete', desc: 'Browse tournaments, join brackets, and go head-to-head against MENA\'s best.' },
              { number: '03', title: 'Climb', desc: 'Earn points with every win. Climb the leaderboard and build your reputation.' },
            ].map((step) => (
              <div key={step.number} className="text-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500/30 transition-colors">
                <div className="text-6xl font-black text-red-500/20 mb-4">{step.number}</div>
                <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-20 px-4 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Simple Pricing</h2>
          <p className="text-zinc-400 text-lg mb-12">No surprises. No subscriptions.</p>

          <div className="max-w-md mx-auto bg-zinc-900 border border-red-500/30 rounded-2xl p-10">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-red-400 text-sm font-bold">Free. Always.</span>
            </div>
            <div className="text-7xl font-black text-white mb-2">EGP 0</div>
            <div className="text-zinc-400 text-lg mb-10">/ month</div>
            <ul className="text-left space-y-4 mb-10">
              {[
                'Join tournaments',
                'Create teams',
                'Book coaches',
                'Community builder',
                'Add friends & message',
                'View leaderboards',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300">
                  <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-3 h-3 text-red-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to="/auth/gamer/register"
              className="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-colors text-lg"
            >
              Join Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
