import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, Menu, X, LogIn, Zap } from 'lucide-react'
import HeruLogo from '@/components/shared/HeruLogo'

const LOGIN_LINKS = [
  { label: 'Gamer',            href: '/auth/gamer/login',     color: 'text-red-400' },
  { label: 'Organizer',        href: '/auth/organizer/login', color: 'text-purple-400' },
  { label: 'Sponsor / Brand',  href: '/auth/sponsor/login',   color: 'text-yellow-400' },
  { label: 'Service Provider', href: '/auth/provider/login',  color: 'text-cyan-400' },
]

const PRODUCTS = [
  { to: '/for-gamers',    emoji: '⚔',  label: 'ARENA',   name: 'Gamers',    color: 'text-red-500' },
  { to: '/for-organizers', emoji: '🏗', label: 'BUILDER', name: 'Organizers', color: 'text-purple-500' },
  { to: '/for-sponsors',  emoji: '📡', label: 'RADAR',   name: 'Sponsors',  color: 'text-yellow-500' },
  { to: '/for-providers', emoji: '💼', label: 'GIGs',    name: 'Providers', color: 'text-cyan-500' },
]

function LoginDropdown({ onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden backdrop-blur-md">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-4 pt-3 pb-2">Sign in as</p>
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
  const [loginOpen, setLoginOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const loginRef = useRef(null)

  useEffect(() => {
    setLoginOpen(false)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <HeruLogo className="h-8" />
          </Link>

          {/* 4 Product buttons — center */}
          <nav className="hidden md:flex items-center gap-1">
            {PRODUCTS.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="group flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <span className={`${p.color} text-lg leading-none`}>{p.emoji}</span>
                <div>
                  <div className="text-xs text-zinc-500 leading-none">{p.label}</div>
                  <div className="text-sm font-semibold text-zinc-100 leading-none mt-0.5">{p.name}</div>
                </div>
              </Link>
            ))}
          </nav>

          {/* Right side: Login dropdown + Get Started */}
          <div className="hidden md:flex items-center gap-2">
            <div ref={loginRef} className="relative">
              <button
                onClick={() => setLoginOpen(l => !l)}
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 pt-16 bg-zinc-950/99 overflow-y-auto md:hidden">
          <div className="p-4 space-y-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest px-1 pb-1">Products</p>
            {PRODUCTS.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className={`${p.color} text-xl leading-none`}>{p.emoji}</span>
                <div>
                  <div className="text-xs text-zinc-500 leading-none">{p.label}</div>
                  <div className="text-sm font-semibold text-zinc-100 leading-none mt-0.5">{p.name}</div>
                </div>
              </Link>
            ))}
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
