import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  BookOpen, Users, DollarSign, TrendingUp, Star, Shield, Award,
  ChevronRight, ArrowRight, CheckCircle2, Zap, Globe, Target,
  Trophy, Calendar, Gamepad2, BarChart3, Rocket, Sparkles,
  Clock, Heart, Briefcase, Monitor, Headphones
} from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1548438294-1ad5d5f4f063?w=1920&q=80'
const SEC2_BG = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80'
const SEC3_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'
const SEC4_BG = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1920&q=80'

const STATS = [
  { value: '500+', label: 'Active Coaches', Icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { value: '85%', label: 'Platform Payout', Icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: '25K+', label: 'Gamers Seeking Coaching', Icon: Gamepad2, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: '9', label: 'Service Categories', Icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/10' },
]

const GAMES_COACHED = [
  { name: 'Valorant', color: 'text-red-400', bg: 'bg-red-500/10' },
  { name: 'League of Legends', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { name: 'CS2', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { name: 'PUBG Mobile', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { name: 'FIFA / EA FC', color: 'text-green-400', bg: 'bg-green-500/10' },
  { name: 'Fortnite', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Mobile Legends', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { name: 'Clash of Clans', color: 'text-pink-400', bg: 'bg-pink-500/10' },
]

const HOW_IT_WORKS = [
  {
    step: '01', Icon: BookOpen, title: 'Create Your Coach Profile',
    desc: 'Set up your verified coaching profile on HERU. List your games, expertise level, available sessions, and pricing. Connect your gaming accounts to verify your rank.',
    color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5',
  },
  {
    step: '02', Icon: Target, title: 'Get Discovered by Gamers',
    desc: 'HERU\'s coaching marketplace puts you in front of 25,000+ gamers actively looking to improve. Filters by game, rank, language, and price make sure the right students find you.',
    color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5',
  },
  {
    step: '03', Icon: Calendar, title: 'Book & Run Sessions',
    desc: 'Gamers book sessions directly from your profile. Run sessions via your preferred platform — Discord, Zoom, or in-game. All booking management handled through HERU.',
    color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5',
  },
  {
    step: '04', Icon: DollarSign, title: 'Get Paid Securely',
    desc: 'Payments are held in HERU escrow and released after session confirmation. You keep 85% of every booking. No chasing payments, no disputes — just coaching.',
    color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/5',
  },
]

const COACH_TYPES = [
  { Icon: Trophy, label: 'Ranked Coach', desc: 'Rank-improvement focused sessions (Bronze → Diamond)', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { Icon: Target, label: 'Tactical Coach', desc: 'Strategic gameplay, team compositions, meta analysis', color: 'text-red-400', bg: 'bg-red-500/10' },
  { Icon: Headphones, label: 'Mental Coach', desc: 'Tilt management, focus training, mindset optimization', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { Icon: Monitor, label: 'VOD Reviewer', desc: 'Recorded game analysis with detailed written feedback', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { Icon: Users, label: 'Team Coach', desc: 'Coordination, communication, and team strategy sessions', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { Icon: Gamepad2, label: 'Mechanics Trainer', desc: 'Aim, reflexes, movement, and technical skill building', color: 'text-green-400', bg: 'bg-green-500/10' },
]

const BENEFITS = [
  { Icon: DollarSign, title: '85% Payout Rate', desc: 'HERU takes only 15%. You keep the majority of every session fee.', color: 'text-green-400' },
  { Icon: Shield, title: 'Escrow-Protected', desc: 'Payments are secured before sessions. You always get paid on delivery.', color: 'text-blue-400' },
  { Icon: Globe, title: 'MENA-Wide Reach', desc: 'Reach gamers across Egypt, Saudi Arabia, UAE, and 6+ MENA countries.', color: 'text-cyan-400' },
  { Icon: BarChart3, title: 'Booking Analytics', desc: 'Track views, conversion, and earnings from your coach dashboard.', color: 'text-purple-400' },
  { Icon: Star, title: 'Rating System', desc: 'Build your reputation through verified student reviews and ratings.', color: 'text-yellow-400' },
  { Icon: Rocket, title: 'Organic Discovery', desc: 'HERU never charges for visibility. Your profile ranks on merit.', color: 'text-red-400' },
]

const SUCCESS_STORIES = [
  {
    name: 'Youssef A.',
    role: 'Valorant Coach, Cairo',
    story: 'I left my day job after 3 months on HERU. I run 12 coaching sessions per week, all through the platform. The escrow system means I never have to chase a payment.',
    result: '12 sessions/week',
    avatar: 'YA',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    game: 'Valorant · Radiant',
  },
  {
    name: 'Fatima K.',
    role: 'Mobile Legends Coach, Riyadh',
    story: 'HERU is the only platform where I can reach students across MENA. I have students from Egypt, UAE, and Kuwait — all booked through the same profile.',
    result: '6 countries reached',
    avatar: 'FK',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    game: 'Mobile Legends · Mythical Glory',
  },
  {
    name: 'Bassem O.',
    role: 'CS2 & FPS Coach, Dubai',
    story: 'The analytics in my coach dashboard told me exactly which sessions convert best. I restructured my offerings based on the data and doubled my monthly income.',
    result: '2x income in 90 days',
    avatar: 'BO',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    game: 'CS2 · Global Elite',
  },
]

const PRICING_MODEL = [
  { label: 'Session Fee (any price you set)', yourShare: '85%', heruShare: '15%', color: 'text-green-400' },
  { label: 'Package Deals (multiple sessions)', yourShare: '85%', heruShare: '15%', color: 'text-blue-400' },
  { label: 'Team Coaching Packages', yourShare: '85%', heruShare: '15%', color: 'text-purple-400' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.09 } }),
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-6">
      {children}
    </span>
  )
}

export default function ForCoaches() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-18" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/65 via-zinc-950/75 to-zinc-950" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[500px] rounded-full bg-cyan-500/7 blur-[200px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] rounded-full bg-purple-600/6 blur-[180px] pointer-events-none" />

        <div className="absolute top-32 right-8 lg:right-16 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-cyan-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs text-zinc-500">Avg Session</p>
                <p className="text-lg font-black text-white">60 min</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-48 right-8 lg:right-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-green-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-xs text-zinc-500">Avg Earnings/mo</p>
                <p className="text-lg font-black text-white">EGP 12K+</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <SectionLabel><BookOpen className="h-3 w-3" /> For Coaches & Trainers</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.0] mb-8 max-w-5xl"
          >
            Turn your expertise into{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              a full-time career.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12"
          >
            HERU connects esports coaches with 25,000+ MENA gamers actively looking to improve. List your services, get booked, and earn — with escrow-protected payments on every session.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/auth/provider/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white text-base transition-all shadow-xl shadow-cyan-600/25 hover:-translate-y-1"
            >
              <Sparkles className="h-5 w-5" />
              List Your Coaching
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/coaches"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/8 hover:bg-white/12 text-white text-base transition-all border border-white/10"
            >
              Browse Coaches
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SEC2_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-zinc-950/92" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="text-center p-6 rounded-2xl bg-zinc-900/60 border border-white/8"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GAMES ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <SectionLabel><Gamepad2 className="h-3 w-3" /> Supported Games</SectionLabel>
            <h2 className="text-3xl font-black text-white">Coach across all major titles.</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {GAMES_COACHED.map(({ name, color, bg }, i) => (
              <motion.div
                key={name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className={`px-5 py-2.5 rounded-xl ${bg} border border-white/8 ${color} text-sm font-semibold hover:scale-105 transition-transform cursor-default`}
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={SEC3_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Zap className="h-3 w-3" /> How It Works</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              From sign-up to{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">first booking</span>
              {' '}in hours.
            </h2>
          </div>

          <div className="space-y-5">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className={`flex gap-6 p-6 rounded-2xl border ${step.border} ${step.bg} group hover:border-opacity-60 transition-all duration-300 card-hover`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-zinc-900/80 border ${step.border} flex items-center justify-center shrink-0 ${step.color} group-hover:scale-110 transition-transform`}>
                  <step.Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-black ${step.color} opacity-50`}>{step.step}</span>
                    <h3 className="font-black text-white text-lg">{step.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
                <ChevronRight className={`h-5 w-5 ${step.color} shrink-0 mt-3 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COACH TYPES ───────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={SEC4_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-zinc-950/92" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><BookOpen className="h-3 w-3" /> Coaching Formats</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Every coaching style welcome.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COACH_TYPES.map(({ Icon, label, desc, color, bg }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-white/8 hover:border-white/15 transition-all group card-hover"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{label}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING MODEL ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><DollarSign className="h-3 w-3" /> Revenue Model</SectionLabel>
            <h2 className="text-3xl font-black text-white mb-4">Simple, transparent pricing.</h2>
            <p className="text-zinc-400 text-base">You set your session rates. HERU takes 15%. That's it.</p>
          </div>
          <div className="rounded-2xl bg-zinc-900/80 border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 gap-0 p-4 border-b border-white/5">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Service Type</div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Your Share</div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">HERU Fee</div>
            </div>
            {PRICING_MODEL.map(({ label, yourShare, heruShare, color }, i) => (
              <div key={label} className="grid grid-cols-3 gap-0 p-4 border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                <div className="text-sm text-zinc-300">{label}</div>
                <div className={`text-center font-black text-lg ${color}`}>{yourShare}</div>
                <div className="text-center text-sm text-zinc-500">{heruShare}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-4">No subscription fees. No listing fees. Pay only on successful bookings.</p>
        </div>
      </section>

      {/* ─── BENEFITS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><CheckCircle2 className="h-3 w-3" /> Why HERU</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Everything a coach needs to grow.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/12 transition-all group"
              >
                <Icon className={`h-6 w-6 mb-3 ${color} group-hover:scale-110 transition-transform`} />
                <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUCCESS STORIES ───────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Heart className="h-3 w-3" /> Coach Stories</SectionLabel>
            <h2 className="text-3xl font-black text-white">Coaches already thriving on HERU.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SUCCESS_STORIES.map(({ name, role, story, result, avatar, color, bg, game }, i) => (
              <motion.div
                key={name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-zinc-900/70 border border-white/8 hover:border-white/15 transition-all card-hover flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                    <span className={`text-sm font-black ${color}`}>{avatar}</span>
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">{name}</p>
                    <p className="text-xs text-zinc-500">{role}</p>
                    <p className="text-xs text-zinc-600">{game}</p>
                  </div>
                </div>
                <blockquote className="text-sm text-zinc-400 leading-relaxed flex-1 mb-4 italic">
                  "{story}"
                </blockquote>
                <div className={`px-3 py-2 rounded-xl ${bg} border border-white/5 text-center`}>
                  <p className={`text-sm font-black ${color}`}>{result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-cyan-500/6 blur-[200px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/15 flex items-center justify-center mx-auto mb-8">
              <BookOpen className="h-10 w-10 text-cyan-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to coach at{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">scale?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Join 500+ coaches already earning through HERU. Create your profile today and reach 25,000+ gamers across MENA.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/auth/provider/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white text-base transition-all shadow-xl shadow-cyan-600/25 hover:-translate-y-1"
              >
                <Sparkles className="h-5 w-5" />
                Start Coaching on HERU
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/coaches"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10"
              >
                Browse Coaches
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
