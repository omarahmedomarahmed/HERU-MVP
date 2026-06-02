import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  BookOpen, FileText, BarChart3, Users, ArrowRight, TrendingUp, Globe, Zap
} from 'lucide-react'

const CATEGORIES = [
  {
    Icon: BookOpen,
    label: 'Guides',
    desc: 'Step-by-step documentation for every HERU product. From onboarding to advanced features.',
    color: 'text-red-400',
    bg: 'bg-red-500/8',
    border: 'border-red-500/15',
    count: 'Coming soon',
    items: [
      'Getting started with HERU Arena',
      'Building your first tournament on HERU Builder',
      'Sponsorship package creation guide',
      'HERU Gigs listing best practices',
    ],
  },
  {
    Icon: FileText,
    label: 'Articles',
    desc: 'Esports industry perspectives, product updates, and in-depth analyses from the HERU team.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/8',
    border: 'border-purple-500/15',
    count: 'Coming soon',
    items: [
      'The state of esports in MENA 2026',
      'How sponsorship ROI is transforming tournament economics',
      'Building a professional esports career: the complete guide',
      'Why service providers are the backbone of esports events',
    ],
  },
  {
    Icon: BarChart3,
    label: 'Reports',
    desc: 'Data-driven market reports on MENA esports trends, sponsorship benchmarks, and ecosystem growth.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/15',
    count: 'Coming soon',
    items: [
      'MENA Esports Market Report Q1 2026',
      'Sponsorship Benchmarking Study',
      'Gamer Demographics Report: MENA',
      'Tournament Economics: A Data Analysis',
    ],
  },
  {
    Icon: Users,
    label: 'Case Studies',
    desc: 'Real stories from gamers, organizers, sponsors, and service providers who power the HERU ecosystem.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/15',
    count: 'Coming soon',
    items: [
      'How Organizer X ran a 500-team tournament on HERU Builder',
      'Brand Y achieved 4x ROI through HERU Radar sponsorship',
      'How a production company scaled bookings through HERU Gigs',
      'From local player to MENA top 10 on HERU Arena',
    ],
  },
]

const INDUSTRY_TOPICS = [
  'Tournament Operations', 'Esports Sponsorship', 'Brand Activation',
  'Gamer Development', 'Production Services', 'MENA Market',
  'Competitive Gaming', 'Esports Economics', 'Event Management',
  'Digital Marketing', 'Gaming Culture', 'Esports Investment',
]

export default function Resources() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/5 blur-[140px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[140px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-6">
              Resources
            </span>
            <h1 className="text-5xl sm:text-6xl font-black text-white mb-5 leading-tight">
              Knowledge for the{' '}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                esports industry.
              </span>
            </h1>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Guides, articles, market reports, and case studies from the HERU team and the MENA esports ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Content Categories ───────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-5">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`p-7 rounded-2xl border ${cat.border} ${cat.bg}`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cat.bg} ${cat.color}`}>
                    <cat.Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-zinc-600 font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                    {cat.count}
                  </span>
                </div>
                <h2 className={`text-xl font-black mb-2 ${cat.color}`}>{cat.label}</h2>
                <p className="text-zinc-500 text-sm leading-relaxed mb-6">{cat.desc}</p>
                <div className="space-y-2">
                  {cat.items.map(item => (
                    <div key={item}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-default">
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.bg.replace('bg-', 'bg-').replace('/8', '')} shrink-0`} style={{ background: 'currentColor' }} />
                      <span className="text-sm text-zinc-400">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Topics ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6">Topics We Cover</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {INDUSTRY_TOPICS.map(topic => (
              <span key={topic}
                className="px-4 py-2 rounded-lg bg-white/[0.02] border border-white/8 text-sm text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/15 transition-all cursor-default">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter / Notify ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="p-10 lg:p-14 rounded-3xl bg-white/[0.02] border border-white/8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="h-7 w-7 text-red-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Resources launching soon.</h2>
            <p className="text-zinc-400 text-lg mb-4 max-w-xl mx-auto leading-relaxed">
              The HERU Resource Hub is under active development. Guides, reports, and case studies are being published now.
            </p>
            <p className="text-zinc-600 text-sm mb-8">
              In the meantime, explore our products or get started on the platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/25">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white transition-all border border-white/10">
                About HERU
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Quick Links ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 text-center">Quick Access</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'HERU Arena', sub: 'Platform for gamers', href: '/for-gamers', color: 'text-red-400', border: 'border-red-500/15' },
              { label: 'HERU Builder', sub: 'Platform for organizers', href: '/for-organizers', color: 'text-purple-400', border: 'border-purple-500/15' },
              { label: 'HERU Radar', sub: 'Platform for sponsors', href: '/for-sponsors', color: 'text-yellow-400', border: 'border-yellow-500/15' },
              { label: 'HERU Gigs', sub: 'Platform for providers', href: '/for-providers', color: 'text-cyan-400', border: 'border-cyan-500/15' },
            ].map(link => (
              <Link key={link.label} to={link.href}
                className={`group flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border ${link.border} hover:bg-white/5 hover:border-white/15 transition-all duration-300`}>
                <div>
                  <p className={`font-bold text-sm ${link.color}`}>{link.label}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{link.sub}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
