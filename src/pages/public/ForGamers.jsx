import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Trophy, Users, Star, Target, Award, Gamepad2, TrendingUp,
  CheckCircle2, ArrowRight, Shield, Globe, Zap, Play,
  ChevronDown, MessageSquare, UserPlus, Crown, BarChart3
} from 'lucide-react'

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'

const CAPABILITIES = [
  {
    Icon: Trophy,
    title: 'Tournament Discovery',
    desc: 'Browse and join hundreds of active esports tournaments across MENA. Online and offline. Open brackets. Real prize pools in EGP.',
    detail: ['Live tournament browser', 'Filter by game, format, region', 'Join with a click', 'Real-time bracket tracking'],
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
  {
    Icon: Users,
    title: 'Teams',
    desc: 'Create a team, recruit players, set roles, and compete together. Your team has a public profile and tournament history.',
    detail: ['Team creation and management', 'Player recruitment', 'Role assignment', 'Team statistics and history'],
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
  },
  {
    Icon: TrendingUp,
    title: 'Progression',
    desc: 'Every match earns you HERU Points. Your competitive record, win rate, and rank are publicly visible on your profile.',
    detail: ['HERU rank points system', 'Match history and records', 'Win rate tracking', 'Cross-game progression'],
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    Icon: Award,
    title: 'Coaching',
    desc: 'Book 1-on-1 sessions with verified, ranked coaches across every major title. Private, professional, and affordable.',
    detail: ['Verified coach marketplace', 'Game-specific coaching', 'Flexible session lengths', 'Direct booking and payment'],
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
  },
  {
    Icon: Gamepad2,
    title: 'Competitive Identity',
    desc: 'Your HERU profile is your esports identity. Showcase your games, connect your Riot accounts, display your achievements.',
    detail: ['Public gamer profile', 'Riot and Valorant account linking', 'Tournament portfolio', 'Verified stats display'],
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    Icon: Crown,
    title: 'Rankings',
    desc: 'Compete for MENA-wide leaderboard positions. Country-level rankings. Game-specific rankings. All publicly displayed.',
    detail: ['MENA-wide leaderboards', 'Country-level rankings', 'Game-specific boards', 'Seasonal ranking resets'],
    color: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
  },
]

const GAMES = [
  'Valorant', 'League of Legends', 'PUBG Mobile', 'CS2', 'FIFA / FC', 'Fortnite',
  'Rocket League', 'Call of Duty', 'Dota 2', 'Street Fighter', 'Tekken', 'Apex Legends',
]

const JOURNEY = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Sign up free. Select your games. Link your Riot and gaming accounts. Your competitive identity is established immediately.',
    color: 'text-red-400', dot: 'bg-red-500',
  },
  {
    step: '02',
    title: 'Join or Build a Team',
    desc: 'Create a team or join one seeking players. Set your roster, assign roles, and begin your competitive journey as a unit.',
    color: 'text-purple-400', dot: 'bg-purple-500',
  },
  {
    step: '03',
    title: 'Enter Tournaments',
    desc: 'Browse live events. Register as a solo player or team. Compete in structured brackets with verified scoring and results.',
    color: 'text-yellow-400', dot: 'bg-yellow-500',
  },
  {
    step: '04',
    title: 'Climb the Leaderboard',
    desc: 'Every win earns HERU Points. Your rank rises. Your profile grows. Your identity in MENA esports is built, match by match.',
    color: 'text-cyan-400', dot: 'bg-cyan-500',
  },
]

const FREE_INCLUDES = [
  'Join unlimited tournaments',
  'Create and manage teams',
  'Book coaching sessions',
  'Community bracket builder',
  'Friend requests and direct messages',
  'Full leaderboard access',
  'Riot and Valorant account linking',
  'Achievement badges and rank display',
  'Public gamer profile and portfolio',
  'Tournament history and statistics',
]

const STATS = [
  { value: '25,000+', label: 'Active Gamers', color: 'text-red-400' },
  { value: '500+', label: 'Tournaments Run', color: 'text-white' },
  { value: 'EGP 2M+', label: 'In Prize Pools', color: 'text-yellow-400' },
  { value: '100%', label: 'Free Forever', color: 'text-green-400' },
]

export default function ForGamers() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [activeCapability, setActiveCapability] = useState(0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── VIDEO HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay loop muted playsInline
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-30' : 'opacity-0'}`}
            poster={HERO_FALLBACK}
          >
            <source src="https://www.pexels.com/video/7915440/download/?fps=25&h=1080&w=1920" type="video/mp4" />
            <source src="https://www.pexels.com/video/8728384/download/?fps=25&h=1080&w=1920" type="video/mp4" />
          </video>
          {!videoLoaded && (
            <img src={HERO_FALLBACK} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-zinc-950/60" />
        </div>

        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-red-600/8 blur-[150px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-red-500/8 border border-red-500/20 text-red-400 mb-7">
              <Gamepad2 className="h-3.5 w-3.5" />
              HERU Arena
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] mb-6 max-w-4xl"
          >
            Compete.<br />
            Improve.<br />
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Build your esports identity.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10"
          >
            The competitive home for every serious gamer in MENA. Join tournaments, build teams, climb rankings, access coaching — completely free. Always.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Link to="/auth/gamer/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/30 text-[15px] hover:-translate-y-0.5">
              Start Competing — Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/tournaments"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white transition-all border border-white/10 hover:border-white/20 text-[15px]">
              Browse Tournaments
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-8"
          >
            {STATS.map(s => (
              <div key={s.label}>
                <p className={`text-3xl font-black ${s.color} mb-0.5`}>{s.value}</p>
                <p className="text-xs text-zinc-600 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <ChevronDown className="h-4 w-4 text-zinc-600 animate-bounce" />
        </div>
      </section>

      {/* ─── FREE BADGE ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-2xl font-black text-white mb-1">HERU Arena is 100% free.</p>
            <p className="text-zinc-500">Every feature. Every tournament. Every capability. No subscription. No paywall.</p>
          </div>
          <Link to="/auth/gamer/register"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all shrink-0 shadow-lg shadow-red-600/20">
            Join Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              Platform Capabilities
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Everything a competitive gamer needs.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Six integrated capabilities designed to support your complete competitive career — from first match to top of the leaderboard.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Capability selector */}
            <div className="space-y-3">
              {CAPABILITIES.map((cap, i) => (
                <button
                  key={cap.title}
                  onClick={() => setActiveCapability(i)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    activeCapability === i
                      ? `${cap.bg} ${cap.border}`
                      : 'bg-white/[0.02] border-white/8 hover:bg-white/4 hover:border-white/12'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cap.bg} ${cap.color}`}>
                      <cap.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`font-bold text-[15px] ${activeCapability === i ? 'text-white' : 'text-zinc-300'}`}>{cap.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{cap.desc.slice(0, 60)}...</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Capability detail */}
            <div className={`sticky top-24 p-8 rounded-2xl border ${CAPABILITIES[activeCapability].border} ${CAPABILITIES[activeCapability].bg} transition-all duration-300`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${CAPABILITIES[activeCapability].bg} ${CAPABILITIES[activeCapability].color}`}
                style={{ border: '1px solid currentColor', opacity: 1 }}>
                {(() => { const Cap = CAPABILITIES[activeCapability].Icon; return <Cap className="h-7 w-7" /> })()}
              </div>
              <h3 className={`text-2xl font-black mb-4 ${CAPABILITIES[activeCapability].color}`}>
                {CAPABILITIES[activeCapability].title}
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-7">
                {CAPABILITIES[activeCapability].desc}
              </p>
              <ul className="space-y-3">
                {CAPABILITIES[activeCapability].detail.map(d => (
                  <li key={d} className="flex items-center gap-3 text-sm text-zinc-400">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${CAPABILITIES[activeCapability].color}`} />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth/gamer/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GAMES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">Supported Games</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {GAMES.map(g => (
              <span key={g} className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/8 text-sm text-zinc-400 hover:text-white hover:bg-white/6 hover:border-white/15 transition-all cursor-default">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── JOURNEY ──────────────────────────────────────────────────── */}
      <section className="py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Your competitive journey starts here.</h2>
            <p className="text-zinc-400 text-lg">From signup to ranked — four steps to your esports identity.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY.map((j, i) => (
              <div key={j.step} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/8">
                <p className={`text-5xl font-black opacity-10 mb-3 ${j.color}`}>{j.step}</p>
                <div className={`h-2 w-2 rounded-full ${j.dot} mb-4`} />
                <h3 className="font-black text-white mb-2 text-[15px]">{j.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{j.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-red-500/15">
            <img src={HERO_FALLBACK} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 to-zinc-950/80" />
            <div className="relative grid md:grid-cols-2 gap-0">
              <div className="p-10 lg:p-14">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6">
                  <Gamepad2 className="h-3 w-3" />
                  HERU Arena Pricing
                </span>
                <p className="text-6xl font-black text-white mb-2">EGP 0</p>
                <p className="text-zinc-400 mb-2 text-lg">per month — forever</p>
                <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                  HERU Arena is completely free. Every single feature available to every gamer, from day one.
                </p>
                <Link to="/auth/gamer/register"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/25">
                  Join Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-xs text-zinc-600 mt-4">No credit card required. No trial period. No catch.</p>
              </div>
              <div className="p-10 lg:p-14 flex items-center border-t md:border-t-0 md:border-l border-red-500/10">
                <div className="w-full">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-5">Everything included</p>
                  <div className="space-y-3">
                    {FREE_INCLUDES.map(f => (
                      <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center p-8 rounded-2xl bg-red-500/4 border border-red-500/10">
            <h3 className="text-xl font-black text-white mb-3">Why is HERU Arena free?</h3>
            <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed text-sm">
              Gamers are the heartbeat of the entire HERU ecosystem. More players means more tournaments, which attracts more sponsorship, which funds larger prize pools. The ecosystem flywheel runs on free, empowered gamers. That is why we will never charge for Arena.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-red-600/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Your competitive career is waiting.</h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join 25,000+ gamers across MENA who are already competing, climbing, and building their esports identity on HERU Arena.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth/gamer/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-base transition-all shadow-xl shadow-red-600/30">
              Create Your Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/tournaments"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10">
              Browse Live Tournaments
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
