import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Gamepad2, Building2, Radar, Briefcase, ChevronDown, Menu, X, LogIn, Zap } from 'lucide-react'
import HeruLogo from '@/components/shared/HeruLogo'

const PRODUCTS = [
  {
    name: 'HERU ARENA',
    tagline: 'Compete. Climb. Connect.',
    desc: 'Tournaments, teams, coaching & leaderboards for gamers.',
    href: '/for-gamers',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    Icon: Gamepad2,
  },
  {
    name: 'HERU BUILDER',
    tagline: 'Build events that get funded.',
    desc: 'Tournament builder, service marketplace & sponsorship CRM.',
    href: '/for-organizers',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    Icon: Building2,
  },
  {
    name: 'HERU RADAR',
    tagline: 'Put your brand where gamers are.',
    desc: 'Sponsor esports events & track ROI in real time.',
    href: '/for-sponsors',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    Icon: Radar,
  },
  {
    name: 'HERU GIGs',
    tagline: 'Get paid to power esports.',
    desc: 'List your services — venues, coaching, production & more.',
    href: '/for-providers',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    Icon: Briefcase,
  },
]

const LOGIN_LINKS = [
  { label: 'Gamer',            href: '/auth/gamer/login',     color: 'text-red-400' },
  { label: 'Organizer',        href: '/auth/organizer/login', color: 'text-purple-400' },
  { label: 'Sponsor / Brand',  href: '/auth/sponsor/login',   color: 'text-yellow-400' },
  { label: 'Service Provider', href: '/auth/provider/login',  color: 'text-cyan-400' },
]

function ProductDropdown({ onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] rounded-2xl bg-zinc-950/98 border border-zinc-800/50 backdrop-blur-xl shadow-2xl z-50 p-4">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-1">Products</p>
      <div className="grid grid-cols-2 gap-2">
        {PRODUCTS.map((p) => (
          <Link
            key={p.name}
            to={p.href}
            onClick={onClose}
            className={`group flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 hover:scale-[1.02] ${p.bg}`}
          >
            <div className={`mt-0.5 shrink-0 ${p.color}`}>
              <p.Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-sm font-bold ${p.color}`}>{p.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{p.tagline}</p>
              <p className="text-xs text-zinc-500 mt-1 leading-snug hidden group-hover:block">{p.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function LoginDropdown({ onClose }) {
  return (
    <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-zinc-950/98 border border-zinc-800/50 backdrop-blur-xl shadow-2xl z-50 py-2">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-4 pb-2">Sign in as</p>
      {LOGIN_LINKS.map((l) => (
        <Link
          key={l.href}
          to={l.href}
          onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-white/5 transition-colors ${l.color}`}
        >
          <LogIn className="h-3.5 w-3.5" />
          {l.label}
        </Link>
      ))}
    </div>
  )
}

export default function PublicNav() {
  const [productsOpen, setProductsOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileProducts, setMobileProducts] = useState(false)
  const location = useLocation()
  const productsRef = useRef(null)
  const loginRef = useRef(null)

  useEffect(() => {
    setProductsOpen(false)
    setLoginOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onClickOutside(e) {
      if (productsRef.current && !productsRef.current.contains(e.target)) setProductsOpen(false)
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <Link to="/" className="flex items-center">
            <HeruLogo className="h-8" />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <div ref={productsRef} className="relative">
              <button
                onClick={() => { setProductsOpen(p => !p); setLoginOpen(false) }}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${productsOpen ? 'text-white bg-white/10' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}
              >
                Products
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
              </button>
              {productsOpen && <ProductDropdown onClose={() => setProductsOpen(false)} />}
            </div>
            <Link to="/tournaments" className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
              Tournaments
            </Link>
            <Link to="/leaderboards" className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
              Leaderboards
            </Link>
            <Link to="/coaches" className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors">
              Coaches
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <div ref={loginRef} className="relative">
              <button
                onClick={() => { setLoginOpen(l => !l); setProductsOpen(false) }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${loginOpen ? 'text-white bg-white/10' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}
              >
                <LogIn className="h-4 w-4" />
                Sign In
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${loginOpen ? 'rotate-180' : ''}`} />
              </button>
              {loginOpen && <LoginDropdown onClose={() => setLoginOpen(false)} />}
            </div>
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              Get Started
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-zinc-950/99 overflow-y-auto md:hidden">
          <div className="p-4 space-y-2">
            <button
              onClick={() => setMobileProducts(p => !p)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 text-white font-semibold text-sm"
            >
              Products
              <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${mobileProducts ? 'rotate-180' : ''}`} />
            </button>
            {mobileProducts && (
              <div className="space-y-1 ml-2">
                {PRODUCTS.map((p) => (
                  <Link
                    key={p.name}
                    to={p.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${p.bg}`}
                  >
                    <p.Icon className={`h-4 w-4 ${p.color}`} />
                    <div>
                      <p className={`text-sm font-bold ${p.color}`}>{p.name}</p>
                      <p className="text-xs text-zinc-400">{p.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <Link to="/tournaments" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-white font-medium text-sm bg-white/5">Tournaments</Link>
            <Link to="/leaderboards" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-white font-medium text-sm bg-white/5">Leaderboards</Link>
            <Link to="/coaches" onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-white font-medium text-sm bg-white/5">Coaches</Link>
            <div className="border-t border-white/10 pt-4 mt-2 space-y-2">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1">Sign in as</p>
              {LOGIN_LINKS.map((l) => (
                <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-sm font-medium ${l.color}`}>
                  <LogIn className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
              <Link to="/auth" onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold text-sm mt-2">
                <Zap className="h-4 w-4" />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
