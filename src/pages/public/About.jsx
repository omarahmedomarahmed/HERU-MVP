import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Globe, Target, Users, Zap, ArrowRight, Building2, Radar, Briefcase, Gamepad2,
  TrendingUp, Shield, Star, ChevronRight
} from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80'

const MISSION_PILLARS = [
  {
    Icon: Globe,
    title: 'MENA-First',
    desc: 'Built from day one for the MENA esports market — Egypt, Saudi Arabia, UAE, and beyond. Infrastructure designed for the region, not adapted from it.',
    color: 'text-red-400',
    bg: 'bg-red-500/8',
  },
  {
    Icon: Target,
    title: 'Ecosystem Approach',
    desc: 'HERU does not serve one stakeholder. We serve all four — simultaneously — through four integrated products that feed value to each other.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/8',
  },
  {
    Icon: Shield,
    title: 'Trusted Infrastructure',
    desc: 'Escrow payments. Verified profiles. Structured sponsorship packages. Every feature is designed to build trust between stakeholders who are transacting for the first time.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/8',
  },
  {
    Icon: TrendingUp,
    title: 'Growth-Aligned',
    desc: 'HERU earns a 15% fee on completed transactions only. Our business grows when the ecosystem grows. This is the only alignment model we will ever operate under.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/8',
  },
]

const PRODUCTS = [
  { name: 'HERU Arena', label: 'For Gamers', href: '/for-gamers', color: 'text-red-400', dot: 'bg-red-500', desc: 'The competitive platform for every serious gamer in MENA.' },
  { name: 'HERU Builder', label: 'For Organizers', href: '/for-organizers', color: 'text-purple-400', dot: 'bg-purple-500', desc: 'Professional tournament infrastructure for events at any scale.' },
  { name: 'HERU Radar', label: 'For Sponsors', href: '/for-sponsors', color: 'text-yellow-400', dot: 'bg-yellow-500', desc: 'The intelligence and activation layer for brands in esports.' },
  { name: 'HERU Gigs', label: 'For Service Providers', href: '/for-providers', color: 'text-cyan-400', dot: 'bg-cyan-500', desc: 'The professional services marketplace for the esports industry.' },
]

const MARKET_STATS = [
  { value: '$3.4B', label: 'MENA digital advertising market', source: 'Industry estimate' },
  { value: '87M+', label: 'Gamers across MENA', source: 'Regional data' },
  { value: '$2.4B', label: 'MENA gaming market value', source: 'Market research' },
  { value: '40%', label: 'Year-over-year growth', source: 'Industry reports' },
]

const PARTNERS_PLACEHOLDER = [
  'Tournament Partner A', 'Technology Partner B', 'Media Partner C',
  'Gaming Brand D', 'Hardware Partner E', 'Regional Partner F',
]

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/70 to-zinc-950" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/6 blur-[150px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-7">
              About HERU
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] mb-7 max-w-4xl"
          >
            We are building the operating{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              system for MENA esports.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl leading-relaxed"
          >
            HERU is an esports technology company. We build integrated products that power every stakeholder in the competitive gaming economy — from individual players to enterprise brands.
          </motion.p>
        </div>
      </section>

      {/* ─── Mission ──────────────────────────────────────────────────── */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">Mission</span>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                To power every participant in the esports economy.
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                HERU was founded on a simple observation: the esports industry in MENA was growing rapidly, but its participants — gamers, organizers, brands, and service providers — were operating in total isolation from each other.
              </p>
              <p className="text-zinc-500 text-base leading-relaxed">
                There was no unified infrastructure. No trusted payment rails. No discovery layer connecting supply to demand. HERU was built to solve exactly this — a four-sided marketplace with integrated products for every stakeholder in the esports ecosystem.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">Vision</span>
              <h2 className="text-3xl font-black text-white mb-6 leading-tight">
                MENA's esports economy — connected, trusted, and growing.
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-5">
                Our vision is a MENA esports ecosystem where every stakeholder has access to the tools, the buyers, and the infrastructure they need to build a professional career or business in gaming.
              </p>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Where a gamer in Cairo can compete, get discovered, and earn. Where an organizer in Riyadh can build, fund, and run a world-class event. Where a global brand can enter the gaming market with full transparency and measurable ROI.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MISSION_PILLARS.map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${bg} ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={`font-black text-[15px] mb-2 ${color}`}>{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── The Ecosystem ────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">The Ecosystem</span>
            <h2 className="text-4xl font-black text-white mb-4">Four products. One connected platform.</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PRODUCTS.map(p => (
              <Link
                key={p.name}
                to={p.href}
                className="group flex items-start gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all duration-300"
              >
                <span className={`h-3 w-3 rounded-full ${p.dot} shrink-0 mt-1`} />
                <div className="flex-1">
                  <p className={`font-black text-[15px] mb-0.5 ${p.color}`}>{p.name}</p>
                  <p className="text-xs text-zinc-600 mb-2">{p.label}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-white transition-colors shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Market Opportunity ───────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Market Opportunity</span>
            <h2 className="text-4xl font-black text-white mb-4">MENA is one of the world's fastest-growing gaming markets.</h2>
            <p className="text-zinc-500 text-base max-w-xl mx-auto">The region has the audience, the appetite, and the investment momentum. It lacked the infrastructure. HERU is that infrastructure.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MARKET_STATS.map(stat => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 text-center">
                <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
                <p className="text-xs text-zinc-600">{stat.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Team Placeholder ─────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Team</span>
            <h2 className="text-4xl font-black text-white mb-4">Built by people who love gaming.</h2>
            <p className="text-zinc-500 text-base max-w-xl mx-auto">
              The HERU team combines esports industry experience, technology expertise, and deep understanding of the MENA market.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { role: 'Chief Executive Officer', initials: 'CEO', color: 'text-red-400', bg: 'bg-red-500/10' },
              { role: 'Chief Technology Officer', initials: 'CTO', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { role: 'Chief Operating Officer', initials: 'COO', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
              { role: 'Head of Product', initials: 'HP', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { role: 'Head of Growth', initials: 'HG', color: 'text-green-400', bg: 'bg-green-500/10' },
              { role: 'Head of Partnerships', initials: 'HP', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { role: 'Esports Lead', initials: 'EL', color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { role: 'Regional Director', initials: 'RD', color: 'text-pink-400', bg: 'bg-pink-500/10' },
            ].map((member, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 text-center">
                <div className={`w-14 h-14 rounded-2xl ${member.bg} flex items-center justify-center mx-auto mb-3`}>
                  <span className={`text-sm font-black ${member.color}`}>{member.initials}</span>
                </div>
                <p className="text-xs text-zinc-500 leading-snug">{member.role}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-zinc-600 text-sm">Team profiles and advisor announcements coming soon.</p>
          </div>
        </div>
      </section>

      {/* ─── Partners ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-4">Partners</span>
            <h2 className="text-3xl font-black text-white mb-4">Built with industry partners.</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {PARTNERS_PLACEHOLDER.map(p => (
              <div key={p} className="px-6 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-zinc-600 text-sm">
                {p}
              </div>
            ))}
          </div>
          <p className="text-center text-zinc-700 text-xs mt-6">Partner announcements and logos coming soon.</p>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-red-600/6 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Join the ecosystem.</h2>
          <p className="text-zinc-400 text-lg mb-10">
            Whether you are a gamer, organizer, brand, or service provider — HERU has a product built for your role in the esports industry.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white text-base transition-all shadow-xl shadow-red-600/25">
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
