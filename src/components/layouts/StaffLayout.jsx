import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearStaffSession } from '@/lib/staffAuth'
import {
  LayoutDashboard, Trophy, Users, Building2, MessageSquare, CheckCircle,
  CreditCard, Receipt, ShoppingBag, Radar, Settings, Menu, X, LogOut,
  TrendingUp, ChevronLeft, ChevronRight, Shield, Bell, Search,
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { to: '/staff/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
      { to: '/staff/revenue', icon: TrendingUp, text: 'Revenue' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/staff/tournaments', icon: Trophy, text: 'Tournaments' },
      { to: '/staff/users', icon: Users, text: 'Users' },
      { to: '/staff/organizers', icon: Building2, text: 'Organizers' },
      { to: '/staff/approvals', icon: CheckCircle, text: 'Approvals' },
      { to: '/staff/messages', icon: MessageSquare, text: 'Messages' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/staff/billing', icon: CreditCard, text: 'Billing' },
      { to: '/staff/orders', icon: Receipt, text: 'Orders' },
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
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    clearStaffSession()
    navigate('/admin')
  }

  const pageName = location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard'

  const sidebarContent = (isMobile = false) => (
    <>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!(collapsed && !isMobile) && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={isMobile ? () => setDrawerOpen(false) : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                    title={collapsed && !isMobile ? item.text : undefined}
                  >
                    <item.icon size={18} className={`shrink-0 ${active ? 'text-blue-600' : ''}`} />
                    {!(collapsed && !isMobile) && <span className="truncate">{item.text}</span>}
                    {active && !(collapsed && !isMobile) && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3">
        {!(collapsed && !isMobile) && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-700 truncate">Staff Admin</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!(collapsed && !isMobile) && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden md:flex md:flex-col border-r border-slate-200/80 bg-white transition-[width] duration-300 ease-out z-10 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                <Shield size={14} className="text-blue-400" />
              </div>
              <div>
                <span className="text-sm font-black tracking-wide text-slate-800">HERU</span>
                <span className="text-[10px] text-blue-500 ml-0.5 font-bold">STAFF</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {sidebarContent(false)}
      </aside>

      {/* ── Main column ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top header */}
        <header className="flex items-center justify-between h-14 px-4 md:px-6 bg-white border-b border-slate-200/80 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50"
            >
              <Menu size={20} />
            </button>
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                <Shield size={12} className="text-blue-400" />
              </div>
              <span className="text-sm font-black text-slate-800">HERU</span>
            </div>
            {/* Page title */}
            <div className="hidden md:block">
              <h1 className="text-lg font-bold text-slate-800 capitalize">{pageName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              <Search size={18} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors relative">
              <Bell size={18} />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 ml-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                <Shield size={10} className="text-blue-400" />
              </div>
              <span className="text-sm text-slate-600 font-semibold">Admin</span>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative w-[280px] max-w-[85vw] bg-white flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                    <Shield size={12} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-black text-slate-800">HERU <span className="text-blue-500 text-[10px]">STAFF</span></span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
              {sidebarContent(true)}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
