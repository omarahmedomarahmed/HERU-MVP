import React from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Trophy, Users, Star, Swords, Target, Award, Gamepad2, MessageSquare, UserPlus,
  ChevronRight, ArrowRight, Zap, CheckCircle2, Shield, Globe, TrendingUp, Play
} from 'lucide-react'

// ─── Images ───────────────────────────────────
const HERO_IMG    = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'
const IMG_TOURNEY = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=80'
const IMG_TEAM    = 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=900&q=80'
const IMG_COACH   = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&q=80'
const IMG_LADDER  = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80'
const IMG_MOBILE  = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=900&q=80'

const FEATURES = [
  {
    Icon: Trophy,
    title: 'Join Live Tournaments',
    desc: 'Enter open brackets with real prize pools in EGP. Filter by game, skill level, format, and region.',
    img: IMG_TOURNEY,
    badge: 'Live Brackets',
  },
  {
    Icon: Users,
    title: 'Build Your Team',
    desc: 'Create or join a team. Recruit players, set roles, manage invites, and compete together.',
    img: IMG_TEAM,
    badge: 'Team Manager',
  },
  {
    Icon: Award,
    title: 'Book a Coach',
    desc: '1:1 coaching from ranked, verified coaches. Pick your game, session length, and budget.',
    img: IMG_COACH,
    badge: 'Coaching',
  },
  {
    Icon: TrendingUp,
    title: 'Climb the Leaderboard',
    desc: 'Every win earns HERU points. Compete for top spots on the global and country-level rankings.',
    img: IMG_LADDER,
    badge: 'Rankings',
  },
]

const STEPS = [
  { num: '01', title: 'Create Your Profile', desc: 'Choose your games, link your Riot / gaming accounts, and set your rank.' },
  { num: '02', title: 'Join or Build', desc: 'Compete in open tournaments or create your own private brackets in seconds.' },
  { num: '03', title: 'Climb & Earn', desc: 'Win matches, rack up HERU points, and rise to the top of MENA leaderboards.' },
]

const STATS = [
  { label: '100% Free',  value: 'Always', color: 'text-red-400',  bg: 'bg-red-500/10' },
  { label: 'Tournaments', value: '500+',   color: 'text-white',   bg: 'bg-white/8' },
  { label: 'Gamers',      value: '25K+',   color: 'text-white',   bg: 'bg-white/8' },
  { label: 'Live Now',   value: '✓',       color: 'text-green-400', bg: 'bg-green-500/10' },
]

const FREE_FEATURES = [
  'Join unlimited tournaments',
  'Create & manage teams',
  'Book coaching sessions',
  'Community bracket builder',
  'Friends & direct messages',
  'View full leaderboards',
  'Riot / Valorant account linking',
  'Achievement badges',
]

const GAMES = [
  { name: 'Valorant',         emoji: '🎯' },
  { name: 'League of Legends', emoji: '⚔️' },
  { name: 'PUBG Mobile',      emoji: '🔫' },
  { name: 'FIFA / FC',        emoji: '⚽' },
  { name: 'Fortnite',         emoji: '🏗️' },
  { name: 'CS2',              emoji: '💣' },
]

function ProductFooter() {
  return (
    <footer className="border-t border-zinc-800/60 py-14 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        <div>
          <p className="text-xl font-black text-white mb-1">HERU<span className="text-red-500">.</span>gg</p>
          <p className="text-sm text-zinc-500">The Esports OS for MENA</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
          {[
            ['Products', [['ARENA (Gamers)', '/for-gamers'], ['BUILDER (Organizers)', '/for-organizers'], ['RADAR (Sponsors)', '/for-sponsors'], ['GIGs (Providers)', '/for-providers']]],
            ['Get Started', [['Join as Gamer', '/auth/gamer/register'], ['Login', '/auth/gamer/login'], ['Browse Tournaments', '/tournaments'], ['Find Coaches', '/coaches']]],
            ['Platform', [['Teams', '/teams'], ['Leaderboards', '/leaderboards'], ['Influencers', '/influencers'], ['Pricing', '/pricing']]],
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

export default function ForGamers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <PublicNav />

      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/40 via-zinc-950/70 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/90" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-red-900/10 blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto w-full py-24">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
            <Zap className="w-3.5 h-3.5" />
            HERU ARENA — For Gamers
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.0] tracking-tight max-w-4xl">
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">Compete.</span>{' '}
            Climb.{' '}
            <span className="text-gray-300">Connect.</span>
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl leading-relaxed">
            Join tournaments, build teams, book coaches, and climb the MENA leaderboard — <span className="text-white font-semibold">all for free</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              to="/auth/gamer/register"
              className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-xl transition-all text-lg shadow-lg shadow-red-600/30 hover:-translate-y-0.5"
            >
              <Gamepad2 className="w-5 h-5" /> Get Started Free
            </Link>
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2.5 border border-zinc-700 hover:border-red-500/50 text-zinc-300 hover:text-white font-bold px-10 py-4 rounded-xl transition-all text-lg"
            >
              Browse Tournaments <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Supported Games */}
          <div>
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3 font-semibold">Supported Games</p>
            <div className="flex flex-wrap gap-3">
              {GAMES.map(g => (
                <span key={g.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-300 hover:border-red-500/30 transition-colors">
                  {g.emoji} {g.name}
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

      {/* ── CORE FEATURES with images ── */}
      <section className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-4">
              Features
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Everything you need to compete</h2>
            <p className="text-zinc-400 text-lg">One platform. Every tool a MENA gamer needs to grow.</p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((f, i) => (
              <div key={f.title}
                className={`group flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-0 rounded-2xl overflow-hidden border border-zinc-800/60 hover:border-red-500/30 transition-all duration-500`}>
                {/* Image */}
                <div className="relative md:w-1/2 h-64 md:h-80 overflow-hidden">
                  <img src={f.img} alt={f.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/50 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-bold text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full">{f.badge}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="md:w-1/2 p-10 bg-zinc-900/60 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-5">
                    <f.Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{f.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-base mb-6">{f.desc}</p>
                  <Link to="/auth/gamer/register"
                    className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold transition-colors text-sm">
                    Get started <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY BRACKET BUILDER SPOTLIGHT ── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={IMG_MOBILE} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Star className="w-3 h-3 fill-red-400" /> New Feature
          </div>
          <h2 className="text-5xl font-black text-white mb-6">Build Your Own Brackets</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create private scrims, 1v1 duels, or invite-only clan war brackets instantly — no organizer account needed. Just invite your friends and play.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 text-left">
            {[
              { icon: Swords, title: 'Private Scrims', desc: 'Invite-only brackets for practice and internal competition.' },
              { icon: Users,  title: 'Clan Wars',      desc: 'Face other teams in structured multi-match clan war formats.' },
              { icon: Target, title: '1v1 Duels',      desc: 'Quick head-to-head matches with leaderboard tracking.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl bg-red-500/5 border border-red-500/15">
                <Icon className="w-6 h-6 text-red-400 mb-3" />
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
          <Link to="/auth/gamer/register"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-10 py-4 rounded-xl transition-all text-base shadow-lg shadow-red-600/20">
            Start Building <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-4">How It Works</h2>
            <p className="text-zinc-400 text-lg">Three steps to your first win.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center p-10 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-red-500/40 transition-all group">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="w-5 h-5 text-red-500/30" />
                  </div>
                )}
                <div className="text-7xl font-black text-red-500/15 mb-4 leading-none group-hover:text-red-500/25 transition-colors">{s.num}</div>
                <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70" alt="" className="w-full h-full object-cover opacity-[0.07]" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950" />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
            Pricing
          </div>
          <h2 className="text-5xl font-black text-white mb-4">Free. Forever.</h2>
          <p className="text-zinc-400 text-lg mb-12">No hidden costs. No subscriptions. No gatekeeping.</p>

          <div className="relative p-12 rounded-3xl bg-zinc-900 border border-red-500/20 shadow-2xl shadow-red-500/8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-red-500/5 blur-[80px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold mb-6">
                HERU ARENA
              </div>
              <div className="text-8xl font-black text-white mb-2 leading-none">EGP 0</div>
              <div className="text-zinc-500 mb-10 text-base">per month — always</div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-left">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-red-400" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <Link
                to="/auth/gamer/register"
                className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white font-bold px-12 py-4 rounded-xl transition-all text-lg shadow-lg shadow-red-600/30"
              >
                Join Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ProductFooter />
    </div>
  )
}
