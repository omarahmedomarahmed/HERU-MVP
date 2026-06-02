import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, ArrowRight, Phone, Mail } from 'lucide-react'
import HeruLogo from '@/components/shared/HeruLogo'

// ─── Nav Data ───────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'HERU Arena',
    label: 'For Gamers',
    desc: 'Compete, improve, and build your esports identity.',
    href: '/for-gamers',
    color: 'text-red-400',
    dot: 'bg-red-500',
    pill: 'bg-red-500/10 border-red-500/20 text-red-400',
  },
  {
    name: 'HERU Builder',
    label: 'For Organizers',
    desc: 'Build tournaments, manage operations, monetize events.',
    href: '/for-organizers',
    color: 'text-purple-400',
    dot: 'bg-purple-500',
    pill: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  },
  {
    name: 'HERU Radar',
    label: 'For Sponsors & Brands',
    desc: 'Discover opportunities, activate campaigns, reach gaming audiences.',
    href: '/for-sponsors',
    color: 'text-yellow-400',
    dot: 'bg-yellow-500',
    pill: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  },
  {
    name: 'HERU Gigs',
    label: 'For Service Providers',
    desc: 'Showcase services, get discovered, get booked.',
    href: '/for-providers',
    color: 'text-cyan-400',
    dot: 'bg-cyan-500',
    pill: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  },
]

const SOLUTIONS = [
  { label: 'Gamers',            href: '/for-gamers',        desc: 'Compete in professional esports tournaments' },
  { label: 'Organizers',        href: '/for-organizers',    desc: 'Build and monetize world-class events' },
  { label: 'Sponsors & Brands', href: '/for-sponsors',      desc: 'Activate brands in the gaming ecosystem' },
  { label: 'Coaches',           href: '/for-coaches',       desc: 'Grow your coaching business on HERU' },
  { label: 'Influencers',       href: '/for-influencers',   desc: 'Monetize your audience and gaming brand' },
  { label: 'Service Providers', href: '/for-providers',     desc: 'Get discovered and booked by organizers' },
  { label: 'Game Publishers',   href: '/for-publishers',    desc: 'Run title-sanctioned events and grow player base' },
]

const SIGN_IN = [
  { label: 'Gamer',            href: '/auth/gamer/login',     color: 'text-red-400',    dot: 'bg-red-500' },
  { label: 'Organizer',        href: '/auth/organizer/login', color: 'text-purple-400', dot: 'bg-purple-500' },
  { label: 'Sponsor / Brand',  href: '/auth/sponsor/login',   color: 'text-yellow-400', dot: 'bg-yellow-500' },
  { label: 'Service Provider', href: '/auth/provider/login',  color: 'text-cyan-400',   dot: 'bg-cyan-500' },
]

// ─── Dropdown Components ─────────────────────────────────────────────────────

function ProductsDropdown({ onClose }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-[620px] bg-zinc-900 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl shadow-black/70 z-50 overflow-hidden" style={{background:'rgba(9,9,11,0.97)'}}>
      <div className="p-2">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Products</p>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {PRODUCTS.map((p) => (
            <Link
              key={p.href}
              to={p.href}
              onClick={onClose}
              className="group flex items-start gap-3 p-4 rounded-xl hover:bg-white/5 transition-all duration-200"
            >
              <span className={`mt-1 h-2 w-2 rounded-full ${p.dot} shrink-0`} />
              <div>
                <p className={`text-sm font-bold ${p.color} leading-none mb-1`}>{p.name}</p>
                <p className="text-[11px] text-zinc-500 leading-none mb-1.5">{p.label}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="border-t border-zinc-800 mt-2 pt-3 pb-1 px-4">
          <Link to="/pricing" onClick={onClose} className="flex items-center justify-between group">
            <span className="text-xs text-zinc-500 group-hover:text-white transition-colors">View all pricing plans</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function SolutionsDropdown({ onClose }) {
  return (
    <div className="absolute left-0 top-full mt-2 w-72 bg-zinc-900 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl shadow-black/70 z-50 overflow-hidden" style={{background:'rgba(9,9,11,0.97)'}}>
      <div className="p-2">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Solutions</p>
        </div>
        {SOLUTIONS.map((s) => (
          <Link
            key={s.label}
            to={s.href}
            onClick={onClose}
            className="flex flex-col px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-zinc-100 leading-none mb-0.5">{s.label}</span>
            <span className="text-xs text-zinc-500">{s.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function SignInDropdown({ onClose }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 backdrop-blur-xl border border-zinc-700 rounded-2xl shadow-2xl shadow-black/70 z-50 overflow-hidden" style={{background:'rgba(9,9,11,0.97)'}}>
      <div className="p-2">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em]">Sign in as</p>
        </div>
        {SIGN_IN.map((s) => (
          <Link
            key={s.href}
            to={s.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <span className={`h-2 w-2 rounded-full ${s.dot} shrink-0`} />
            <span className={`text-sm font-semibold ${s.color}`}>{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Nav Item with Dropdown ───────────────────────────────────────────────────

function NavDropdown({ label, children, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${open ? 'text-white bg-white/8' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children({ onClose: () => setOpen(false) })}
    </div>
  )
}

// ─── Main Nav ────────────────────────────────────────────────────────────────

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setMobileSection(null)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-zinc-950/98 backdrop-blur-xl border-b border-zinc-800/60 shadow-lg shadow-black/20'
            : 'bg-transparent backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 mr-4">
            <HeruLogo className="h-8" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            <NavDropdown label="Products">
              {({ onClose }) => <ProductsDropdown onClose={onClose} />}
            </NavDropdown>

            <NavDropdown label="Solutions">
              {({ onClose }) => <SolutionsDropdown onClose={onClose} />}
            </NavDropdown>

            <Link
              to="/pricing"
              className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Pricing
            </Link>

            <Link
              to="/about"
              className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              About
            </Link>

            <Link
              to="/resources"
              className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Resources
            </Link>
            <Link
              to="/contact"
              className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-2">
            <NavDropdown label="Sign In" align="right">
              {({ onClose }) => <SignInDropdown onClose={onClose} />}
            </NavDropdown>
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-500 text-white transition-all duration-200 shadow-lg shadow-red-600/20 hover:shadow-red-500/30"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-zinc-950/99 overflow-y-auto lg:hidden">
          <div className="p-4 space-y-1 max-w-sm mx-auto">

            {/* Products section */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              onClick={() => setMobileSection(s => s === 'products' ? null : 'products')}
            >
              <span className="text-sm font-semibold text-zinc-100">Products</span>
              <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${mobileSection === 'products' ? 'rotate-180' : ''}`} />
            </button>
            {mobileSection === 'products' && (
              <div className="pl-4 space-y-1">
                {PRODUCTS.map((p) => (
                  <Link
                    key={p.href}
                    to={p.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <span className={`h-2 w-2 rounded-full ${p.dot}`} />
                    <div>
                      <p className={`text-sm font-bold ${p.color}`}>{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Solutions section */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-left"
              onClick={() => setMobileSection(s => s === 'solutions' ? null : 'solutions')}
            >
              <span className="text-sm font-semibold text-zinc-100">Solutions</span>
              <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${mobileSection === 'solutions' ? 'rotate-180' : ''}`} />
            </button>
            {mobileSection === 'solutions' && (
              <div className="pl-4 space-y-1">
                {SOLUTIONS.map((s) => (
                  <Link
                    key={s.label}
                    to={s.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col px-4 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-semibold text-zinc-200">{s.label}</span>
                    <span className="text-xs text-zinc-500">{s.desc}</span>
                  </Link>
                ))}
              </div>
            )}

            <Link to="/pricing" onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold text-zinc-100">
              Pricing
            </Link>

            <Link to="/about" onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold text-zinc-100">
              About
            </Link>

            <Link to="/resources" onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-semibold text-zinc-100">
              Resources
            </Link>

            <div className="border-t border-zinc-800/60 pt-3 mt-3 space-y-1">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-4 pb-1">Sign In</p>
              {SIGN_IN.map((s) => (
                <Link
                  key={s.href}
                  to={s.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                  <span className={`text-sm font-semibold ${s.color}`}>{s.label}</span>
                </Link>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-colors"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
