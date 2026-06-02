import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Trophy, Globe, BarChart3, Shield, Users, Zap, Star, ArrowRight,
  Building2, Target, TrendingUp, Award, CheckCircle2, Radar,
  Gamepad2, DollarSign, Sparkles, ChevronRight, Play, Rocket,
  Calendar, Radio, Monitor, Heart, Crown
} from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=1920&q=80'
const SEC2_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'
const SEC3_BG = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80'
const SEC4_BG = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&q=80'

const STATS = [
  { value: '500+', label: 'Tournaments Built', Icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: '25K+', label: 'Active Players', Icon: Users, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: '6', label: 'MENA Markets', Icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { value: 'EGP 2M+', label: 'In Prize Pools', Icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
]

const PUBLISHER_FEATURES = [
  {
    Icon: Trophy,
    title: 'Sanctioned Tournament Engine',
    desc: 'Run official title-sanctioned tournaments with HERU Builder. Full bracket management, automated scoring, and live brackets displayed to players.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    Icon: Users,
    title: 'Player Base Activation',
    desc: 'Reach 25,000+ gamers across MENA instantly. Create game-specific leaderboards and competitive seasons that keep your player base engaged year-round.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  {
    Icon: Radar,
    title: 'Sponsorship Integration',
    desc: 'Create structured sponsorship packages for your events through HERU Radar. Brands discover, activate, and get full ROI reporting — seamlessly.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    Icon: BarChart3,
    title: 'Real-Time Analytics',
    desc: 'Full tournament analytics: registrations, match play rates, viewership, prize distribution, and post-event reporting for stakeholders.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    Icon: Building2,
    title: 'Service Provider Network',
    desc: 'Hire verified production, casting, venue, and marketing teams from HERU Gigs. One platform for the full event supply chain.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    Icon: Shield,
    title: 'Escrow-Protected Operations',
    desc: 'All service provider payments secured in escrow. Prize pools distributed automatically. Every transaction verified and traceable.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01', Icon: Building2, color: 'text-purple-400', dot: 'bg-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5',
    title: 'Set Up Your Publisher Account',
    desc: 'Create a verified HERU organization account. Configure your brand identity, title information, and tournament preferences.',
  },
  {
    step: '02', Icon: Trophy, color: 'text-yellow-400', dot: 'bg-yellow-500', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5',
    title: 'Build Your Tournament Structure',
    desc: 'Use HERU Builder to design multi-stage circuits: open qualifiers → regional rounds → national finals. Set brackets, prize structures, and rules.',
  },
  {
    step: '03', Icon: Radar, color: 'text-red-400', dot: 'bg-red-500', border: 'border-red-500/20', bg: 'bg-red-500/5',
    title: 'Activate Sponsorships',
    desc: 'Publish sponsorship packages on HERU Radar. Brands discover your event and activate in clicks. You receive funds directly through HERU escrow.',
  },
  {
    step: '04', Icon: BarChart3, color: 'text-blue-400', dot: 'bg-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5',
    title: 'Run, Track & Report',
    desc: 'Live event management dashboard, real-time bracket engine, post-event analytics. Generate full tournament reports for sponsors and stakeholders.',
  },
]

const SUCCESS_STORIES = [
  {
    name: 'AXS Games',
    role: 'Mobile Game Publisher, Cairo',
    story: 'We ran three consecutive national circuits for our mobile title entirely through HERU. The bracket engine handled 1,200+ players and the sponsor integration paid for the prize pool.',
    result: '1,200+ players, 3 circuits',
    avatar: 'AX',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    game: 'Mobile Strategy Title',
    region: 'Egypt',
  },
  {
    name: 'Nexus Esports Studio',
    role: 'PC Gaming Publisher, Riyadh',
    story: 'HERU\'s service provider network meant we could hire verified casters, production teams, and venue managers for our 3-day LAN final. All through one platform, all through escrow.',
    result: '3-day LAN event, full production',
    avatar: 'NE',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    game: 'Competitive FPS Title',
    region: 'Saudi Arabia',
  },
  {
    name: 'Delta Interactive',
    role: 'Console Publisher, Dubai',
    story: 'The MENA leaderboard system in HERU Arena kept our players competing week over week between events. Monthly active engagement increased 40% in the first quarter.',
    result: '40% engagement increase',
    avatar: 'DI',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    game: 'Sports Simulation Title',
    region: 'UAE',
  },
]

const WHO_ITS_FOR = [
  { Icon: Monitor, label: 'PC Game Publishers', desc: 'Run sanctioned competitive circuits for your PC titles across MENA' },
  { Icon: Gamepad2, label: 'Console Publishers', desc: 'Build structured console tournaments with professional production' },
  { Icon: Radio, label: 'Mobile Game Publishers', desc: 'Activate large-scale mobile tournaments and esports leagues' },
  { Icon: Globe, label: 'Global Publishers', desc: 'Launch MENA regional programs with local operational infrastructure' },
  { Icon: Building2, label: 'Game Studios', desc: 'Showcase your titles through competitive events and community leagues' },
  { Icon: Crown, label: 'Esports Divisions', desc: 'Manage publisher esports operations with full infrastructure support' },
]

const TOURNAMENT_FORMATS = [
  { label: 'Single Elimination', desc: 'Classic knockout bracket', color: 'text-red-400' },
  { label: 'Double Elimination', desc: 'Winner + loser brackets', color: 'text-yellow-400' },
  { label: 'Round Robin', desc: 'Everyone plays everyone', color: 'text-green-400' },
  { label: 'Swiss Format', desc: 'Pairing-based tournament', color: 'text-blue-400' },
  { label: 'League Season', desc: 'Points-based regular season', color: 'text-purple-400' },
  { label: 'Multi-Stage Circuit', desc: 'Qualifier → Regional → Finals', color: 'text-cyan-400' },
]

const PEOPLE_ON_HERU = [
  { name: 'Karim T.', role: 'Publisher Relations Manager', result: 'Runs 2 annual circuits', avatar: 'KT', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { name: 'Mona F.', role: 'Esports Director', result: 'Built regional finals in 48h', avatar: 'MF', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { name: 'Tariq W.', role: 'Game Operations Lead', result: '3 MENA countries activated', avatar: 'TW', color: 'text-red-400', bg: 'bg-red-500/10' },
  { name: 'Salma H.', role: 'Growth & Community Lead', result: '15K players in one season', avatar: 'SH', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { name: 'Omar A.', role: 'Partnership Manager', result: 'EGP 500K in sponsorships', avatar: 'OA', color: 'text-green-400', bg: 'bg-green-500/10' },
  { name: 'Dalia M.', role: 'Events Producer', result: '3-day LAN event managed', avatar: 'DM', color: 'text-blue-400', bg: 'bg-blue-500/10' },
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

export default function ForPublishers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-18" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/65 via-zinc-950/75 to-zinc-950" />
        </div>
        <div className="absolute top-1/4 left-1/5 w-[700px] h-[500px] rounded-full bg-yellow-500/7 blur-[200px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/5 w-[500px] h-[400px] rounded-full bg-purple-600/6 blur-[180px] pointer-events-none" />

        <div className="absolute top-28 right-8 lg:right-16 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-yellow-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-xs text-zinc-500">Tournaments / Year</p>
                <p className="text-lg font-black text-white">500+</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-52 right-8 lg:right-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-red-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-xs text-zinc-500">Player Reach</p>
                <p className="text-lg font-black text-white">25K+ MENA</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <SectionLabel><Crown className="h-3 w-3" /> For Game Publishers</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.0] mb-8 max-w-5xl"
          >
            Build your game's{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
              competitive legacy.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12"
          >
            HERU gives game publishers the full operational stack to build, run, and scale competitive esports programs across MENA — from open qualifiers to national finals, all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/auth/organizer/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black text-base transition-all shadow-xl shadow-yellow-500/25 hover:-translate-y-1"
            >
              <Crown className="h-5 w-5" />
              Get Publisher Access
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/8 hover:bg-white/12 text-white text-base transition-all border border-white/10"
            >
              Talk to Our Team
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

      {/* ─── WHO IT'S FOR ───────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Building2 className="h-3 w-3" /> Who This Is For</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">For every type of game publisher.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {WHO_ITS_FOR.map(({ Icon, label, desc }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-white/8 hover:border-white/15 transition-all group card-hover"
              >
                <Icon className="h-5 w-5 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-white text-sm mb-1">{label}</h3>
                <p className="text-xs text-zinc-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ──────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={SEC3_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Zap className="h-3 w-3" /> Platform Features</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              The full publisher{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">infrastructure stack.</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PUBLISHER_FEATURES.map(({ Icon, title, desc, color, bg, border }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className={`p-6 rounded-2xl bg-zinc-900/70 border ${border} hover:border-opacity-60 transition-all group card-hover`}
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={`font-black text-base mb-2 ${color}`}>{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={SEC4_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-zinc-950/93" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Rocket className="h-3 w-3" /> Activation Timeline</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              From sign-up to first national circuit in under 7 days.
            </h2>
          </div>

          {/* Visual Timeline */}
          <div className="relative">
            <div className="absolute left-[2.25rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-500 via-yellow-500 to-blue-500 opacity-25 hidden md:block" />
            <div className="space-y-5">
              {HOW_IT_WORKS.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={fadeUp}
                  className={`flex gap-6 p-6 rounded-2xl border ${s.border} ${s.bg} group transition-all duration-300 card-hover`}
                >
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl bg-zinc-900/80 border ${s.border} flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform shrink-0`}>
                      <s.Icon className="h-6 w-6" />
                    </div>
                    <div className={`absolute -left-[1.1rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${s.dot} hidden md:block shadow-lg`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-black ${s.color} opacity-50`}>{s.step}</span>
                      <h3 className="font-black text-white text-base">{s.title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TOURNAMENT FORMATS ────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Trophy className="h-3 w-3" /> Tournament Formats</SectionLabel>
            <h2 className="text-3xl font-black text-white mb-4">Every competitive format supported.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {TOURNAMENT_FORMATS.map(({ label, desc, color }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full bg-current ${color}`} />
                  <h3 className={`font-bold text-sm ${color}`}>{label}</h3>
                </div>
                <p className="text-xs text-zinc-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUCCESS STORIES ───────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Star className="h-3 w-3" /> Publisher Stories</SectionLabel>
            <h2 className="text-3xl font-black text-white mb-4">Publishers already building on HERU.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SUCCESS_STORIES.map(({ name, role, story, result, avatar, color, bg, game, region }, i) => (
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
                    <p className="text-xs text-zinc-600">{game} · {region}</p>
                  </div>
                </div>
                <blockquote className="text-sm text-zinc-400 leading-relaxed flex-1 mb-4 italic">"{story}"</blockquote>
                <div className={`px-3 py-2 rounded-xl ${bg} border border-white/5 text-center`}>
                  <p className={`text-sm font-black ${color}`}>{result}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PEOPLE ON HERU ────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Heart className="h-3 w-3" /> The HERU Publisher Community</SectionLabel>
            <h2 className="text-3xl font-black text-white mb-4">The professionals running game programs on HERU.</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PEOPLE_ON_HERU.map(({ name, role, result, avatar, color, bg }, i) => (
              <motion.div
                key={name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-5 rounded-2xl bg-zinc-900/60 border border-white/8 text-center hover:border-white/15 transition-all card-hover"
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-3`}>
                  <span className={`text-sm font-black ${color}`}>{avatar}</span>
                </div>
                <p className="font-bold text-white text-xs mb-0.5">{name}</p>
                <p className="text-[10px] text-zinc-600 mb-1">{role}</p>
                <p className={`text-[10px] font-bold ${color}`}>{result}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-yellow-500/6 blur-[200px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-3xl bg-yellow-500/15 flex items-center justify-center mx-auto mb-8">
              <Crown className="h-10 w-10 text-yellow-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to build your title's{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">MENA circuit?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Get full publisher access to HERU and start building official competitive programs for your games across the MENA region today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/auth/organizer/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black text-base transition-all shadow-xl shadow-yellow-500/25 hover:-translate-y-1"
              >
                <Crown className="h-5 w-5" />
                Get Publisher Access
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10"
              >
                Contact Publisher Team
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
