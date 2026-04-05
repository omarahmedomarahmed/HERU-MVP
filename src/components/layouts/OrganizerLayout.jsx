import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import HeruLogo from '@/components/shared/HeruLogo'
import {
  LayoutDashboard, Trophy, Plus, Radar, CreditCard, Share2,
  MessageSquare, User, Menu, X, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/organizer/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
      { to: '/organizer/radar', icon: Radar, text: 'Sponsorship Radar' },
    ],
  },
  {
    label: 'Tournaments',
    items: [
      { to: '/organizer/tournaments', icon: Trophy, text: 'My Tournaments' },
      { to: '/organizer/tournaments/new', icon: Plus, text: 'Build Tournament' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/organizer/billing', icon: CreditCard, text: 'Billing' },
      { to: '/organizer/sponsored', icon: Share2, text: 'Co-Organized' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/organizer/messages', icon: MessageSquare, text: 'Messages' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/organizer/profile', icon: User, text: 'My Profile' },
    ],
  },
]

const BOTTOM_TABS = [
  { to: '/organizer/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
  { to: '/organizer/tournaments', icon: Trophy, text: 'Tournaments' },
  { to: '/organizer/tournaments/new', icon: Plus, text: 'Builder' },
  { to: '/organizer/radar', icon: Radar, text: 'Radar' },
  { to: '/organizer/profile', icon: User, text: 'Profile' },
]

function NavItem({ to, icon: Icon, text, active, collapsed }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-purple-600/20 text-purple-400'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
      }`}
      title={collapsed ? text : undefined}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{text}</span>}
    </Link>
  )
}

export default function OrganizerLayout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { userProfile, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to) =>
    to === '/organizer/dashboard'
      ? pathname === to
      : pathname.startsWith(to)

  const handleLogout = async () => {
    await logout()
    navigate('/auth/organizer/login')
  }

  const displayName =
    userProfile?.organizer_profile?.brand_name ||
    userProfile?.full_name ||
    'Organizer'

  return (
    <div className="flex h-screen bg-[#0f0f1a] text-gray-100">
      {/* ===== Desktop sidebar ===== */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/5 bg-[#1a1a2e] transition-[width] duration-200 ${
          collapsed ? 'w-16' : 'w-[260px]'
        }`}
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5">
          {!collapsed && <HeruLogo className="h-8" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    active={isActive(item.to)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-white/5 px-3 py-3">
          {!collapsed && (
            <p className="px-3 mb-2 text-xs text-gray-400 truncate">{displayName}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ===== Main column (header + content + bottom tabs) ===== */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-white/5 bg-[#1a1a2e]">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 text-gray-400 hover:text-gray-200"
          >
            <Menu size={22} />
          </button>
          <HeruLogo className="h-7" />
          <div className="w-8" />
        </header>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#1a1a2e] flex flex-col">
              <div className="flex items-center justify-between h-14 px-4 border-b border-white/5">
                <HeruLogo className="h-7" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {NAV_SECTIONS.map((section) => (
                  <div key={section.label}>
                    <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => (
                        <NavItem
                          key={item.to}
                          {...item}
                          active={isActive(item.to)}
                          collapsed={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
              <div className="border-t border-white/5 px-3 py-3">
                <p className="px-3 mb-2 text-xs text-gray-400 truncate">{displayName}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut size={20} className="shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 bg-[#1a1a2e] border-t border-white/5 z-40">
          {BOTTOM_TABS.map(({ to, icon: Icon, text }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                  active ? 'text-purple-400' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span>{text}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
