import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import HeruLogo from '@/components/shared/HeruLogo'
import {
  LayoutDashboard, Trophy, Plus, Radar, CreditCard, Share2,
  MessageSquare, User, Menu, X, LogOut, ChevronLeft, ChevronRight,
  Zap, Bell, Search, Settings, Building2,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/organizer/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
      { to: '/organizer/radar', icon: Radar, text: 'Sponsorship Radar', badge: 'NEW' },
    ],
  },
  {
    label: 'Tournaments',
    items: [
      { to: '/organizer/tournaments', icon: Trophy, text: 'My Tournaments' },
      { to: '/organizer/sponsored', icon: Share2, text: 'Co-Organized' },
      { to: '/organizer/tournaments/new', icon: Plus, text: 'Build Tournament', highlight: true },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/organizer/billing', icon: CreditCard, text: 'Billing' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { to: '/organizer/messages', icon: MessageSquare, text: 'Messages' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { to: '/organizer/venues', icon: Building2, text: 'Submit Venue' },
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
  { to: '/organizer/dashboard', icon: LayoutDashboard, text: 'Home' },
  { to: '/organizer/tournaments', icon: Trophy, text: 'Tournaments' },
  { to: '/organizer/tournaments/new', icon: Plus, text: 'Build', highlight: true },
  { to: '/organizer/radar', icon: Radar, text: 'Radar' },
  { to: '/organizer/billing', icon: CreditCard, text: 'Billing' },
]

function NavItem({ to, icon: Icon, text, active, collapsed, highlight, badge }) {
  if (highlight) {
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
          active
            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25'
            : 'bg-gradient-to-r from-red-600/10 to-orange-600/10 text-red-300 hover:from-red-600/20 hover:to-orange-600/20 border border-red-500/20'
        }`}
        title={collapsed ? text : undefined}
      >
        <Icon size={18} className="shrink-0" />
        {!collapsed && <span className="truncate">{text}</span>}
        {!collapsed && !active && <Zap size={14} className="ml-auto text-red-400" />}
      </Link>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        active
          ? 'bg-white/[0.08] text-white shadow-sm'
          : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
      }`}
      title={collapsed ? text : undefined}
    >
      <div className={`p-0.5 ${active ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
        <Icon size={18} className="shrink-0" />
      </div>
      {!collapsed && <span className="truncate">{text}</span>}
      {badge && !collapsed && (
        <span className="ml-auto text-[9px] font-black tracking-wider bg-red-500 text-white px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
      {active && !collapsed && !badge && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400" />}
    </Link>
  )
}

export default function OrganizerLayout({ children, isDashboard }) {
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

  const brandLogo = userProfile?.organizer_profile?.brand_logo

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!(collapsed && !isMobile) && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-red-400/60">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <div key={item.to} onClick={isMobile ? () => setMobileOpen(false) : undefined}>
                  <NavItem
                    {...item}
                    active={isActive(item.to)}
                    collapsed={collapsed && !isMobile}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        {!(collapsed && !isMobile) && (
          <div className="flex items-center gap-3 px-3 py-2">
            {brandLogo ? (
              <img src={brandLogo} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-red-400/60 uppercase tracking-wider font-medium">Organizer</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!(collapsed && !isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-[#080812] text-gray-100 overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-red-600/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-600/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* ===== Desktop sidebar ===== */}
      <aside
        className={`hidden md:flex flex-col border-r border-white/[0.06] backdrop-blur-xl transition-[width] duration-300 ease-out z-10 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
        style={{ background: 'linear-gradient(180deg, rgba(15,15,30,0.95) 0%, rgba(10,10,20,0.98) 100%)' }}
      >
        {/* Logo + collapse toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.06]">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <HeruLogo className="h-7" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {sidebarContent(false)}
      </aside>

      {/* ===== Main column ===== */}
      <div className="flex flex-col flex-1 min-w-0 z-10">
        {/* Top header bar */}
        <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-white/[0.06] backdrop-blur-sm bg-[#080812]/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/[0.04]"
            >
              <Menu size={20} />
            </button>
            {/* Page breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">
                {pathname.split('/').filter(Boolean).slice(0, -1).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')}
              </span>
            </div>
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2">
              <HeruLogo className="h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/[0.04] transition-colors">
              <Bell size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {brandLogo ? (
                <img src={brandLogo} alt="" className="w-6 h-6 rounded-md object-cover" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white text-xs font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-300 font-medium">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              className="absolute left-0 top-0 bottom-0 w-[280px] flex flex-col shadow-2xl"
              style={{ background: 'linear-gradient(180deg, rgba(15,15,30,0.98) 0%, rgba(10,10,20,1) 100%)' }}
            >
              <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.06]">
                <HeruLogo className="h-6" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              {sidebarContent(true)}
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 flex items-stretch h-16 bg-[#0a0a18]/95 backdrop-blur-xl border-t border-white/[0.06] z-40">
          {BOTTOM_TABS.map(({ to, icon: Icon, text, highlight }) => {
            const active = isActive(to)
            if (highlight) {
              return (
                <Link
                  key={to}
                  to={to}
                  className="flex flex-col items-center justify-center flex-1 gap-0.5 relative"
                >
                  <div className={`w-10 h-10 -mt-4 rounded-2xl flex items-center justify-center shadow-lg ${
                    active
                      ? 'bg-gradient-to-br from-red-600 to-orange-600 shadow-red-500/30'
                      : 'bg-gradient-to-br from-red-600/30 to-orange-600/30 border border-red-500/20'
                  }`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <span className={`text-[10px] font-semibold ${active ? 'text-red-400' : 'text-gray-500'}`}>{text}</span>
                </Link>
              )
            }
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center flex-1 gap-1"
              >
                <Icon size={18} className={active ? 'text-red-400' : 'text-gray-600'} />
                <span className={`text-[10px] font-medium ${active ? 'text-red-400' : 'text-gray-600'}`}>{text}</span>
                {active && <div className="absolute top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
