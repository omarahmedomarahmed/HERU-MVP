import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearStaffSession } from '@/lib/staffAuth'
import HeruLogo from '@/components/shared/HeruLogo'
import {
  LayoutDashboard, Trophy, Users, Building2, MessageSquare, CheckCircle,
  CreditCard, Receipt, ShoppingBag, Radar, Settings, Menu, X, LogOut,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/staff/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/staff/tournaments', icon: Trophy, text: 'Tournaments' },
      { to: '/staff/users', icon: Users, text: 'Users' },
      { to: '/staff/organizers', icon: Building2, text: 'Organizers' },
      { to: '/staff/messages', icon: MessageSquare, text: 'Messages' },
      { to: '/staff/approvals', icon: CheckCircle, text: 'Approvals' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/staff/billing', icon: CreditCard, text: 'Billing' },
      { to: '/staff/tournament-orders', icon: Receipt, text: 'Tournament Orders' },
      { to: '/staff/marketplace', icon: ShoppingBag, text: 'Marketplace' },
      { to: '/staff/radar', icon: Radar, text: 'Radar' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/staff/settings', icon: Settings, text: 'Settings' },
    ],
  },
]

export default function StaffLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    clearStaffSession()
    navigate('/admin')
  }

  function NavContent({ onItemClick }) {
    return (
      <>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="px-4 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onItemClick}
                    className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span>{item.text}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200 z-30">
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200">
          <HeruLogo className="h-7" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Staff Panel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto pt-4 pb-2">
          <NavContent />
        </nav>

        {/* Bottom logout */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-40">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 ml-3">
          <HeruLogo className="h-6" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Staff
          </span>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-[280px] max-w-[85vw] bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 h-14 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <HeruLogo className="h-6" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Staff
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto pt-4 pb-2">
              <NavContent onItemClick={() => setDrawerOpen(false)} />
            </nav>

            <div className="border-t border-slate-200 p-3">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="md:ml-[260px] pt-14 md:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
