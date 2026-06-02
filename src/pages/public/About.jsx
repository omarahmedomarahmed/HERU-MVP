import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Globe, Target, Users, Zap, ArrowRight, Building2, Radar, Briefcase, Gamepad2,
  TrendingUp, Shield, Star, ChevronRight, Trophy, BarChart3, DollarSign,
  Heart, Rocket, CheckCircle2, Crown, MapPin, Calendar, Award, Sparkles,
  Play, Eye, Layers, Network
} from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'
const MISSION_BG = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80'
const MARKET_BG = 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1920&q=80'
const TEAM_BG = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80'
const TIMELINE_BG = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&q=80'

const MISSION_PILLARS = [
  { Icon: Globe, title: 'MENA-First', desc: 'Built from day one for the MENA esports market — Egypt, Saudi Arabia, UAE, and beyond.', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { Icon: Target, title: 'Ecosystem Approach', desc: 'HERU serves all four stakeholders simultaneously through four integrated products that create compounding value.', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { Icon: Shield, title: 'Trusted Infrastructure', desc: 'Escrow payments, verified profiles, structured packages — every feature builds trust between stakeholders transacting for the first time.', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  { Icon: TrendingUp, title: 'Growth-Aligned', desc: 'HERU earns 15% on completed transactions only. Our business grows when the ecosystem grows.', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
]

const PRODUCTS = [
  { name: 'HERU Arena', label: 'For Gamers', href: '/for-gamers', color: 'text-red-400', dot: 'bg-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', Icon: Gamepad2, stat: '25K+ Gamers', desc: 'Compete, improve, and build your esports identity in MENA.' },
  { name: 'HERU Builder', label: 'For Organizers', href: '/for-organizers', color: 'text-purple-400', dot: 'bg-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', Icon: Building2, stat: '500+ Events', desc: 'Professional tournament infrastructure for events at any scale.' },
  { name: 'HERU Radar', label: 'For Sponsors', href: '/for-sponsors', color: 'text-yellow-400', dot: 'bg-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', Icon: Radar, stat: 'EGP 2M+ Deals', desc: 'The intelligence and activation layer for brands in esports.' },
  { name: 'HERU Gigs', label: 'For Providers', href: '/for-providers', color: 'text-cyan-400', dot: 'bg-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', Icon: Briefcase, stat: '85% Payout', desc: 'The professional services marketplace for the esports industry.' },
]

const MARKET_STATS = [
  { value: '$3.4B', label: 'MENA Digital Ad Market', Icon: BarChart3, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: '87M+', label: 'Gamers Across MENA', Icon: Gamepad2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { value: '$2.4B', label: 'MENA Gaming Market Value', Icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: '40%', label: 'Year-over-Year Growth', Icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
]

const COMPANY_TIMELINE = [
  { year: '2022', title: 'HERU Founded', desc: 'Company founded in Cairo with a vision to build the operating system for MENA esports.', Icon: Rocket, color: 'text-red-400', dot: 'bg-red-500' },
  { year: '2023 Q1', title: 'HERU Arena Launch', desc: 'First product launched — the gaming identity and tournament platform for MENA gamers.', Icon: Gamepad2, color: 'text-purple-400', dot: 'bg-purple-500' },
  { year: '2023 Q3', title: 'HERU Builder Goes Live', desc: 'Tournament infrastructure product launched. First 50 events created in week one.', Icon: Building2, color: 'text-yellow-400', dot: 'bg-yellow-500' },
  { year: '2024 Q1', title: 'HERU Gigs Marketplace', desc: 'Service provider marketplace launched with 9 professional categories and escrow protection.', Icon: Briefcase, color: 'text-cyan-400', dot: 'bg-cyan-500' },
  { year: '2024 Q3', title: 'HERU Radar Activated', desc: 'Sponsorship intelligence platform launched. EGP 500K in deals in first 90 days.', Icon: Radar, color: 'text-green-400', dot: 'bg-green-500' },
  { year: '2025', title: '25K+ Community & Growing', desc: '25,000+ active gamers, 500+ events, 6 MENA countries. HERU\'s ecosystem flywheel accelerating.', Icon: Trophy, color: 'text-blue-400', dot: 'bg-blue-500' },
]

const TEAM_ROLES = [
  { role: 'Chief Executive Officer', initials: 'CEO', color: 'text-red-400', bg: 'bg-red-500/10', desc: 'Esports industry veteran, MENA market specialist' },
  { role: 'Chief Technology Officer', initials: 'CTO', color: 'text-purple-400', bg: 'bg-purple-500/10', desc: 'Full-stack platform architect, 10+ years experience' },
  { role: 'Chief Operating Officer', initials: 'COO', color: 'text-yellow-400', bg: 'bg-yellow-500/10', desc: 'Operations and growth, MENA market expansion' },
  { role: 'Head of Product', initials: 'HP', color: 'text-cyan-400', bg: 'bg-cyan-500/10', desc: 'Product strategy and user experience design' },
  { role: 'Head of Growth', initials: 'HG', color: 'text-green-400', bg: 'bg-green-500/10', desc: 'User acquisition, partnerships, and marketing' },
  { role: 'Head of Partnerships', initials: 'HP2', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Brand relationships, publisher, and sponsor deals' },
  { role: 'Esports Lead', initials: 'EL', color: 'text-orange-400', bg: 'bg-orange-500/10', desc: 'Competitive integrity, tournament operations' },
  { role: 'Regional Director', initials: 'RD', color: 'text-pink-400', bg: 'bg-pink-500/10', desc: 'MENA market operations and expansion' },
]

const VALUES = [
  { Icon: Heart, title: 'Community First', desc: 'Every decision starts with the question: does this benefit the esports community?', color: 'text-red-400' },
  { Icon: Shield, title: 'Earn Through Integrity', desc: 'We grow only when our users grow. 15% on success — that\'s our only business model.', color: 'text-blue-400' },
  { Icon: Globe, title: 'Regional DNA', desc: 'MENA is not an afterthought. It\'s the core of every product decision we make.', color: 'text-green-400' },
  { Icon: Zap, title: 'Speed of Esports', desc: 'We move at the speed of competitive gaming — fast, decisive, and always evolving.', color: 'text-yellow-400' },
]

const ECOSYSTEM_FLOW = [
  { label: 'Organizer', action: 'Creates event + opens sponsorship packages', color: 'text-purple-400', bg: 'bg-purple-500/10', Icon: Building2 },
  { label: 'Gamers', action: 'Register, compete, and climb leaderboards', color: 'text-red-400', bg: 'bg-red-500/10', Icon: Gamepad2 },
  { label: 'Sponsors', action: 'Discover events, activate campaigns, track ROI', color: 'text-yellow-400', bg: 'bg-yellow-500/10', Icon: Radar },
  { label: 'Providers', action: 'Execute production, venue, marketing via HERU Gigs', color: 'text-cyan-400', bg: 'bg-cyan-500/10', Icon: Briefcase },
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

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── HERO / SLIDE 1 ────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/75 to-zinc-950" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[500px] rounded-full bg-red-600/6 blur-[200px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] rounded-full bg-purple-600/5 blur-[180px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <SectionLabel><Sparkles className="h-3 w-3" /> About HERU</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.0] mb-8 max-w-5xl"
          >
            We are building the operating{' '}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              system for MENA esports.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-xl text-zinc-400 max-w-3xl leading-relaxed mb-12"
          >
            HERU is an esports technology company building four integrated products that power every stakeholder in the competitive gaming economy — from individual players to enterprise brands. Founded in Cairo. Built for MENA. Scaling globally.
          </motion.p>

          {/* Company quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Founded', value: '2022', Icon: Calendar },
              { label: 'HQ', value: 'Cairo, Egypt', Icon: MapPin },
              { label: 'Products', value: '4 Products', Icon: Layers },
              { label: 'Market', value: '6 MENA Countries', Icon: Globe },
            ].map(({ label, value, Icon }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/8">
                <Icon className="h-5 w-5 text-zinc-500 shrink-0" />
                <div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-wider">{label}</p>
                  <p className="font-bold text-white text-sm">{value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── MISSION / SLIDE 2 ─────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={MISSION_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <SectionLabel><Target className="h-3 w-3" /> Mission</SectionLabel>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                To power every participant in the esports economy.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                HERU was founded on a simple observation: the esports industry in MENA was growing rapidly, but its participants — gamers, organizers, brands, and service providers — were operating in total isolation from each other.
              </p>
              <p className="text-zinc-500 text-base leading-relaxed">
                There was no unified infrastructure. No trusted payment rails. No discovery layer connecting supply to demand. HERU was built to solve exactly this — a four-sided marketplace with integrated products for every stakeholder.
              </p>
            </div>
            <div>
              <SectionLabel><Eye className="h-3 w-3" /> Vision</SectionLabel>
              <h2 className="text-3xl font-black text-white mb-6 leading-tight">
                MENA's esports economy — connected, trusted, and growing.
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-5">
                Where a gamer in Cairo can compete, get discovered, and earn. Where an organizer in Riyadh can build, fund, and run a world-class event. Where a global brand can enter gaming with full transparency and measurable ROI.
              </p>
              <div className="flex flex-col gap-2">
                {VALUES.slice(0, 2).map(({ Icon, title, color }) => (
                  <div key={title} className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm text-zinc-300 font-semibold">{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mission Pillars */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MISSION_PILLARS.map(({ Icon, title, desc, color, bg, border }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className={`p-6 rounded-2xl border ${border} bg-zinc-900/70 group hover:scale-105 transition-all duration-300 card-hover`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg} ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={`font-black text-[15px] mb-2 ${color}`}>{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ECOSYSTEM / SLIDE 3 ────────────────────────────────────────── */}
      <section className="py-32 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Network className="h-3 w-3" /> The Ecosystem</SectionLabel>
            <h2 className="text-4xl font-black text-white mb-4">Four products. One connected flywheel.</h2>
            <p className="text-zinc-500 text-base max-w-xl mx-auto">Each product feeds value to every other. The more users on any product, the more valuable the entire platform becomes.</p>
          </div>

          {/* Flywheel Visualization */}
          <div className="relative mb-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {ECOSYSTEM_FLOW.map(({ label, action, color, bg, Icon }, i) => (
                <motion.div
                  key={label}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={fadeUp}
                  className="relative"
                >
                  <div className={`p-6 rounded-2xl ${bg} border border-white/8 text-center group hover:border-white/20 transition-all card-hover`}>
                    <div className={`w-14 h-14 rounded-2xl bg-zinc-900/70 flex items-center justify-center mx-auto mb-4 ${color} group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className={`font-black text-lg mb-2 ${color}`}>{label}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{action}</p>
                  </div>
                  {i < ECOSYSTEM_FLOW.length - 1 && (
                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 z-10 hidden lg:flex items-center">
                      <ChevronRight className="h-5 w-5 text-zinc-700" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid sm:grid-cols-2 gap-5">
            {PRODUCTS.map((p, i) => (
              <motion.div
                key={p.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
              >
                <Link
                  to={p.href}
                  className={`group flex items-start gap-5 p-7 rounded-2xl bg-zinc-900/70 border ${p.border} hover:border-opacity-60 hover:bg-zinc-900/90 transition-all duration-300 card-hover`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${p.bg} flex items-center justify-center shrink-0 ${p.color} group-hover:scale-110 transition-transform`}>
                    <p.Icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className={`font-black text-[15px] ${p.color}`}>{p.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.color}`}>{p.stat}</span>
                    </div>
                    <p className="text-xs text-zinc-600 mb-2">{p.label}</p>
                    <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${p.color} shrink-0 mt-1 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPANY TIMELINE / SLIDE 4 ─────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={TIMELINE_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Calendar className="h-3 w-3" /> Company Timeline</SectionLabel>
            <h2 className="text-4xl font-black text-white mb-4">From idea to ecosystem.</h2>
            <p className="text-zinc-500 text-base">How HERU went from a single observation to a full-stack esports platform.</p>
          </div>

          <div className="relative">
            {/* Central timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-yellow-500 via-cyan-500 to-blue-500 opacity-30" />

            <div className="space-y-8">
              {COMPANY_TIMELINE.map(({ year, title, desc, Icon, color, dot }, i) => (
                <motion.div
                  key={year}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={fadeUp}
                  className="flex gap-8 pl-4"
                >
                  <div className="relative flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center ${color} shrink-0 z-10`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className={`absolute -left-[0.85rem] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${dot} z-20 shadow-lg`} />
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-black ${color} px-2 py-0.5 rounded-md bg-current/10`}>{year}</span>
                      <h3 className="font-black text-white text-lg">{title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARKET OPPORTUNITY / SLIDE 5 ───────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={MARKET_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><TrendingUp className="h-3 w-3" /> Market Opportunity</SectionLabel>
            <h2 className="text-4xl font-black text-white mb-4">MENA is one of the world's fastest-growing gaming markets.</h2>
            <p className="text-zinc-500 text-base max-w-2xl mx-auto">The region has the audience, the appetite, and the investment momentum. It lacked the infrastructure. HERU is that infrastructure.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {MARKET_STATS.map(({ value, label, Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-7 rounded-2xl bg-zinc-900/70 border border-white/8 text-center group hover:border-white/15 transition-all card-hover"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-4 ${color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-5xl font-black text-white mb-2">{value}</p>
                <p className="text-sm text-zinc-400">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Market Visual */}
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { region: 'Egypt', flag: '🇪🇬', desc: 'Largest esports market by volume in MENA. Cairo is HERU\'s operational home.', color: 'text-red-400' },
              { region: 'Saudi Arabia', flag: '🇸🇦', desc: 'Fastest-growing gaming investment market in the region. Vision 2030 esports focus.', color: 'text-green-400' },
              { region: 'UAE', flag: '🇦🇪', desc: 'Premium brand and sponsorship market. High ARPU gaming audience.', color: 'text-blue-400' },
            ].map(({ region, flag, desc, color }) => (
              <div key={region} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/12 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{flag}</span>
                  <h3 className={`font-black text-lg ${color}`}>{region}</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES / SLIDE 6 ───────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Heart className="h-3 w-3" /> Our Values</SectionLabel>
            <h2 className="text-3xl font-black text-white mb-4">The principles we build everything on.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/14 transition-all group"
              >
                <Icon className={`h-7 w-7 ${color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="font-black text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEAM / SLIDE 7 ─────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={TEAM_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-zinc-950/93" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Users className="h-3 w-3" /> The Team</SectionLabel>
            <h2 className="text-4xl font-black text-white mb-4">Built by people who love gaming.</h2>
            <p className="text-zinc-500 text-base max-w-xl mx-auto">
              The HERU team combines esports industry experience, technology expertise, and deep understanding of the MENA market.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEAM_ROLES.map((member, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-5 rounded-2xl bg-zinc-900/70 border border-white/8 text-center hover:border-white/15 transition-all card-hover"
              >
                <div className={`w-14 h-14 rounded-2xl ${member.bg} flex items-center justify-center mx-auto mb-3`}>
                  <span className={`text-sm font-black ${member.color}`}>{member.initials}</span>
                </div>
                <p className="text-xs font-bold text-white mb-1">{member.role}</p>
                <p className="text-[10px] text-zinc-600 leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-zinc-600 text-sm">Team profiles and advisor announcements coming soon.</p>
          </div>
        </div>
      </section>

      {/* ─── CTA / SLIDE 8 ──────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/8 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full bg-red-600/5 blur-[200px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-3xl bg-red-500/15 flex items-center justify-center mx-auto mb-8">
              <Rocket className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">Join the ecosystem.</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Whether you are a gamer, organizer, brand, or service provider — HERU has a product built for your role in the esports industry.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-base transition-all shadow-xl shadow-red-600/25 hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10"
              >
                View Pricing
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
