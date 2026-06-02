import { Link } from 'react-router-dom'
import HeruLogo from '@/components/shared/HeruLogo'

const PRODUCTS = [
  { label: 'HERU Arena',   href: '/for-gamers',     sub: 'For Gamers' },
  { label: 'HERU Builder', href: '/for-organizers',  sub: 'For Organizers' },
  { label: 'HERU Radar',   href: '/for-sponsors',    sub: 'For Sponsors' },
  { label: 'HERU Gigs',    href: '/for-providers',   sub: 'For Service Providers' },
]

const SOLUTIONS = [
  { label: 'Gamers',            href: '/for-gamers' },
  { label: 'Organizers',        href: '/for-organizers' },
  { label: 'Sponsors',          href: '/for-sponsors' },
  { label: 'Service Providers', href: '/for-providers' },
  { label: 'Publishers',        href: '/for-organizers' },
  { label: 'Brands',            href: '/for-sponsors' },
]

const PLATFORM = [
  { label: 'Tournaments',  href: '/tournaments' },
  { label: 'Teams',        href: '/teams' },
  { label: 'Leaderboards', href: '/leaderboards' },
  { label: 'Coaches',      href: '/coaches' },
  { label: 'Influencers',  href: '/influencers' },
  { label: 'Pricing',      href: '/pricing' },
]

const COMPANY = [
  { label: 'About HERU',   href: '/about' },
  { label: 'Resources',    href: '/resources' },
  { label: 'Get Started',  href: '/auth' },
]

const SIGN_IN = [
  { label: 'Gamer Login',    href: '/auth/gamer/login',     color: 'hover:text-red-400' },
  { label: 'Organizer Login',href: '/auth/organizer/login', color: 'hover:text-purple-400' },
  { label: 'Sponsor Login',  href: '/auth/sponsor/login',   color: 'hover:text-yellow-400' },
  { label: 'Provider Login', href: '/auth/provider/login',  color: 'hover:text-cyan-400' },
]

export default function PublicFooter() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main grid */}
        <div className="pt-16 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/">
              <HeruLogo className="h-9 mb-5" />
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 max-w-xs">
              The operating system for esports. Powering gamers, organizers, sponsors, and service providers across MENA.
            </p>
            <div className="flex flex-wrap gap-2">
              {PRODUCTS.map(p => (
                <Link
                  key={p.href}
                  to={p.href}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/8 hover:border-white/15 transition-all duration-200"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Products</p>
            <ul className="space-y-2.5">
              {PRODUCTS.map(p => (
                <li key={p.href}>
                  <Link to={p.href} className="group block">
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{p.label}</span>
                    <span className="block text-[11px] text-zinc-600 group-hover:text-zinc-500 transition-colors">{p.sub}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Platform</p>
            <ul className="space-y-2.5">
              {PLATFORM.map(p => (
                <li key={p.href}>
                  <Link to={p.href} className="text-sm text-zinc-400 hover:text-white transition-colors">{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-4">Company</p>
            <ul className="space-y-2.5 mb-6">
              {COMPANY.map(c => (
                <li key={c.href}>
                  <Link to={c.href} className="text-sm text-zinc-400 hover:text-white transition-colors">{c.label}</Link>
                </li>
              ))}
            </ul>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-3">Sign In</p>
            <ul className="space-y-2">
              {SIGN_IN.map(s => (
                <li key={s.href}>
                  <Link to={s.href} className={`text-sm text-zinc-500 ${s.color} transition-colors`}>{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/40 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">
            © 2026 HERU.gg — All rights reserved. Built for MENA esports.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-700">15% platform fee on all transactions</span>
            <div className="flex gap-4">
              <span className="text-xs text-zinc-700 cursor-default">Privacy Policy</span>
              <span className="text-xs text-zinc-700 cursor-default">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
