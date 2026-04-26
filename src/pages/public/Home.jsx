import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import PublicNav from '@/components/public/PublicNav'
import {
  Gamepad2, Building2, Radar, Briefcase,
  Trophy, Star, Zap, ChevronRight,
  ArrowRight, CheckCircle2, Globe
} from 'lucide-react'

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────
const PRODUCTS = [
  {
    name: 'HERU ARENA',
    label: 'For Gamers',
    tagline: 'Compete. Climb. Connect.',
    desc: 'Join tournaments, build teams, climb leaderboards, and book coaching sessions — all in one place.',
    features: ['Live bracket tournaments', 'Team creation & management', 'Coaching marketplace', 'HERU rank leaderboard'],
    href: '/for-gamers',
    cta: 'Start Competing',
    ctaHref: '/auth/gamer/register',
    color: 'red',
    accent: '#ef4444',
    bg: 'from-red-900/30 to-red-950/10',
    border: 'border-red-500/20 hover:border-red-500/50',
    Icon: Gamepad2,
  },
  {
    name: 'HERU BUILDER',
    label: 'For Organizers',
    tagline: 'Build events that get funded.',
    desc: 'Create online and offline tournaments, book service providers, build sponsorship packages, and manage everything from one CRM.',
    features: ['Tournament builder (online/offline)', 'Service provider marketplace', 'Sponsorship package creator', 'Tournament CRM'],
    href: '/for-organizers',
    cta: 'Build an Event',
    ctaHref: '/auth/organizer/register',
    color: 'purple',
    accent: '#7c3aed',
    bg: 'from-purple-900/30 to-purple-950/10',
    border: 'border-purple-500/20 hover:border-purple-500/50',
    Icon: Building2,
  },
  {
    name: 'HERU RADAR',
    label: 'For Sponsors',
    tagline: 'Sponsor esports. Measure everything.',
    desc: 'Browse live sponsorship opportunities, track your ROI, hire influencers, and build corporate activations at scale.',
    features: ['Sponsorship radar', 'ROI & performance tracking', 'Influencer hiring', 'Corporate event builder'],
    href: '/for-sponsors',
    cta: 'Explore Radar',
    ctaHref: '/auth/sponsor/register',
    color: 'yellow',
    accent: '#eab308',
    bg: 'from-yellow-900/20 to-yellow-950/10',
    border: 'border-yellow-500/20 hover:border-yellow-500/50',
    Icon: Radar,
  },
  {
    name: 'HERU GIGs',
    label: 'For Service Providers',
    tagline: 'Get paid to power esports.',
    desc: 'List your services — venue, production, coaching, talent, marketing — and get booked by organizers and sponsors across MENA.',
    features: ['9 service categories', 'Escrow-protected payouts', 'Public portfolio', 'Rating & reviews'],
    href: '/for-providers',
    cta: 'List Your Services',
    ctaHref: '/auth/provider/register',
    color: 'cyan',
    accent: '#06b6d4',
    bg: 'from-cyan-900/20 to-cyan-950/10',
    border: 'border-cyan-500/20 hover:border-cyan-500/50',
    Icon: Briefcase,
  },
]

const STATS = [
  { label: 'Tournaments Run',  value: '500+',    Icon: Trophy },
  { label: 'Active Gamers',    value: '25,000+', Icon: Gamepad2 },
  { label: 'EGP in Prizes',    value: '2M+',     Icon: Star },
  { label: 'MENA Countries',   value: '6',       Icon: Globe },
]

const HOW_IT_WORKS = [
  {
    step: '01', role: 'Organizer', color: 'text-purple-400', dot: 'bg-purple-500',
    desc: 'Creates a tournament in HERU BUILDER. Books service providers, sets prize pool, enables sponsorship radar.',
  },
  {
    step: '02', role: 'Sponsor', color: 'text-yellow-400', dot: 'bg-yellow-500',
    desc: 'Discovers the event on HERU RADAR, buys a sponsorship package, and tracks ROI in real time.',
  },
  {
    step: '03', role: 'Service Provider', color: 'text-cyan-400', dot: 'bg-cyan-500',
    desc: 'Gets booked via HERU GIGs for production, branding, venue, or talent. Delivers and gets paid via escrow.',
  },
  {
    step: '04', role: 'Gamer', color: 'text-red-400', dot: 'bg-red-500',
    desc: 'Registers on HERU ARENA, joins the tournament, competes, and climbs the global leaderboard.',
  },
]

const TIER_PREVIEW = [
  { name: 'Free',      price: 'EGP 0',        period: '/month', highlight: false, desc: 'One-off access to all packages' },
  { name: 'Community', price: 'EGP 150,000',  period: '/month', highlight: true,  desc: '2 Online sponsorships / month' },
  { name: 'Premium',   price: 'EGP 300,000',  period: '/month', highlight: false, desc: '2 Online + 1 Offline / month' },
]

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function ProductCard({ p }) {
  const cm = {
    red:    { badge: 'bg-red-500/15 text-red-400 border-red-500/30',    icon: 'text-red-400',    cta: 'bg-red-600 hover:bg-red-500',       check: 'text-red-400' },
    purple: { badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: 'text-purple-400', cta: 'bg-purple-700 hover:bg-purple-600', check: 'text-purple-400' },
    yellow: { badge: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', icon: 'text-yellow-400', cta: 'bg-yellow-600 hover:bg-yellow-500', check: 'text-yellow-400' },
    cyan:   { badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: 'text-cyan-400',    cta: 'bg-cyan-600 hover:bg-cyan-500',     check: 'text-cyan-400' },
  }
  const c = cm[p.color]
  return (
    <div className={`flex flex-col rounded-2xl border bg-gradient-to-br ${p.bg} ${p.border}
                     p-6 transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl bg-black/30 ${c.icon}`}><p.Icon className="h-6 w-6" /></div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}>{p.label}</span>
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{p.name}</p>
      <h3 className="text-xl font-black text-white mb-2 leading-tight">{p.tagline}</h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-4">{p.desc}</p>
      <ul className="space-y-1.5 mb-6">
        {p.features.map(f => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${c.check}`} />{f}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex gap-2">
        <Link to={p.ctaHref}
          className={`flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${c.cta}`}>
          {p.cta}
        </Link>
        <Link to={p.href}
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors">
          Learn more
        </Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Home() {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['home-leaderboard'],
    queryFn: () => apiCall('/leaderboards?limit=5').then(d => d?.entries || d?.data || (Array.isArray(d) ? d : [])),
    staleTime: 5 * 60_000,
  })

  const { data: liveTournaments = [] } = useQuery({
    queryKey: ['home-tournaments'],
    queryFn: () => apiCall('/tournaments?status=live&limit=3').then(d => Array.isArray(d) ? d : d?.tournaments || []),
    staleTime: 60_000,
  })

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <PublicNav />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-red-600/10 blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-purple-600/10 blur-[120px]" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10
                          border border-red-500/20 text-red-400 text-xs font-semibold mb-6 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Now live across MENA
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            The Esports{' '}
            <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent">
              Operating System
            </span>
            {' '}for MENA
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Four products. One platform. Gamers compete. Organizers build.
            Sponsors invest. Service providers get paid.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-red-600 hover:bg-red-500 text-white transition-colors text-sm">
              <Zap className="h-4 w-4" />Get Started Free
            </Link>
            <Link to="/tournaments"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-white/8 hover:bg-white/12 text-white transition-colors text-sm border border-white/10">
              Browse Tournaments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative py-12 px-4 border-y border-white/5 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=1920&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ label, value, Icon }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 text-red-400/60 mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="relative py-24 px-4 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Four Products</p>
            <h2 className="text-4xl font-black text-white">Everything esports needs.</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              One platform connecting every stakeholder in the MENA esports ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {PRODUCTS.map(p => <ProductCard key={p.name} p={p} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-white/2 to-transparent overflow-hidden">
        <img src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1920&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">The Flywheel</p>
            <h2 className="text-4xl font-black text-white">How it works</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Each stakeholder fuels the next. One action creates value for all four.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map(({ step, role, color, dot, desc }) => (
              <div key={step} className="p-6 rounded-2xl bg-white/4 border border-white/8">
                <div className={`text-5xl font-black mb-4 ${color} opacity-20`}>{step}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`h-2 w-2 rounded-full ${dot}`} />
                  <p className={`text-sm font-bold ${color}`}>{role}</p>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIVE TOURNAMENTS */}
      {liveTournaments.length > 0 && (
        <section className="relative py-20 px-4 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&q=70" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none" />
          <div className="relative max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">Live now</p>
                <h2 className="text-2xl font-black text-white">Active Tournaments</h2>
              </div>
              <Link to="/tournaments"
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                See all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {liveTournaments.map(t => (
                <Link key={t.id} to={`/tournaments/${t.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8
                             hover:border-red-500/30 transition-all">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-700/40 to-red-900/40
                                  flex items-center justify-center shrink-0">
                    {t.tournament_image
                      ? <img src={t.tournament_image} alt="" className="h-full w-full object-cover rounded-xl" />
                      : <Trophy className="h-5 w-5 text-red-400/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.game} · {t.max_teams || '?'} teams</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
                    </span>
                    <span className="text-xs text-gray-500">EGP {Number(t.prizepool_total || 0).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LEADERBOARD */}
      {leaderboard.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-1">HERU Rank</p>
                <h2 className="text-2xl font-black text-white">Top Players</h2>
              </div>
              <Link to="/leaderboards"
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                Full leaderboard <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((e, i) => (
                <div key={e.id || i}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/8">
                  <span className="w-7 text-center text-sm font-bold">
                    {i < 3 ? medals[i] : <span className="text-gray-500">#{i + 1}</span>}
                  </span>
                  <span className="flex-1 text-sm font-medium text-white truncate">
                    {e.username || e.full_name || 'Player'}
                  </span>
                  <span className="text-xs font-bold text-yellow-400">{(e.score || 0).toLocaleString()} pts</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RADAR CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-yellow-900/20 to-yellow-950/10
                        border border-yellow-500/20 p-10 text-center">
          <Radar className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2">HERU RADAR</p>
          <h2 className="text-3xl font-black text-white mb-3">Ready to sponsor esports?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Browse live sponsorship packages, track ROI, hire influencers, and build branded
            esports activations across MENA.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {TIER_PREVIEW.map(t => (
              <div key={t.name}
                className={`px-5 py-3 rounded-xl border text-center min-w-[140px]
                  ${t.highlight ? 'bg-yellow-500/15 border-yellow-500/40' : 'bg-white/5 border-white/10'}`}>
                <p className={`text-sm font-bold ${t.highlight ? 'text-yellow-400' : 'text-white'}`}>{t.name}</p>
                <p className={`text-xs font-semibold mt-1 ${t.highlight ? 'text-yellow-300' : 'text-gray-300'}`}>
                  {t.price}<span className="text-gray-500 font-normal">{t.period}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/auth/sponsor/register"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                       bg-yellow-500 hover:bg-yellow-400 text-black transition-colors text-sm">
            Start Sponsoring <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/8 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <p className="text-xl font-black text-white mb-2">HERU<span className="text-red-500">.</span>gg</p>
              <p className="text-xs text-gray-500 leading-relaxed">The esports operating system for MENA.</p>
            </div>
            {[
              ['Products', PRODUCTS.map(p => [p.name, p.href])],
              ['Platform', [['Tournaments','/tournaments'],['Teams','/teams'],['Coaches','/coaches'],['Leaderboards','/leaderboards'],['Influencers','/influencers']]],
              ['Get Started', [['Compete as Gamer','/auth/gamer/register'],['Build a Tournament','/auth/organizer/register'],['Sponsor Events','/auth/sponsor/register'],['List Services','/auth/provider/register']]],
              ['Login', [['Gamer','/auth/gamer/login'],['Organizer','/auth/organizer/login'],['Sponsor','/auth/sponsor/login'],['Service Provider','/auth/provider/login']]],
            ].map(([heading, links]) => (
              <div key={heading}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{heading}</p>
                <ul className="space-y-2">
                  {links.map(([label, href]) => (
                    <li key={href}><Link to={href} className="text-sm text-gray-500 hover:text-white transition-colors">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2026 HERU.gg — All rights reserved.</p>
            <p className="text-xs text-gray-600">Built for MENA esports. 15% platform fee on all transactions.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
