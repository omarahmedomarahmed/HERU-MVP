import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import HeruLogo from '@/components/shared/HeruLogo'
import { LayoutDashboard, Radar, Star, CreditCard, Wrench, User, Menu, LogOut, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'

const NAV_SECTIONS = [
  { label: 'Overview', items: [{ to: '/sponsor/dashboard', icon: LayoutDashboard, text: 'Dashboard' }, { to: '/sponsor/radar', icon: Radar, text: 'Sponsorship Radar' }] },
  { label: 'Sponsorships', items: [{ to: '/sponsor/sponsorships', icon: Star, text: 'My Sponsorships' }] },
  { label: 'Build', items: [{ to: '/sponsor/builder', icon: Wrench, text: 'Internal Builder' }] },
  { label: 'Account', items: [{ to: '/sponsor/subscription', icon: CreditCard, text: 'Subscription' }, { to: '/sponsor/profile', icon: User, text: 'Brand Profile' }] },
]

const BOTTOM_TABS = [
  { to: '/sponsor/dashboard', icon: LayoutDashboard, text: 'Home' },
  { to: '/sponsor/radar', icon: Radar, text: 'Radar' },
  { to: '/sponsor/sponsorships', icon: Star, text: 'Sponsorships' },
  { to: '/sponsor/subscription', icon: CreditCard, text: 'Plan' },
  { to: '/sponsor/profile', icon: User, text: 'Profile' },
]

export default function SponsorLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { userProfile, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/')
  const handleLogout = async () => { await logout(); navigate('/auth/sponsor/login') }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed && <HeruLogo className="h-7" />}
        {collapsed && <TrendingUp className="w-6 h-6 text-blue-400" />}
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_SECTIONS.map(section => (
          <div key={section.label} className="mb-4">
            {!collapsed && <p className="text-xs text-gray-600 uppercase tracking-wider px-3 mb-1">{section.label}</p>}
            {section.items.map(item => (
              <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all ${isActive(item.to) ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center' : ''}`}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.text}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"><TrendingUp className="w-3.5 h-3.5 text-white" /></div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{userProfile?.full_name || 'Sponsor'}</p>
              <p className="text-xs text-gray-500 truncate">{userProfile?.email || ''}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full text-sm ${collapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-4 h-4 flex-shrink-0" />{!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#0f0f1a] text-white overflow-hidden">
      <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-[#0a0a14] border-r border-white/5 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>{sidebarContent}</aside>
      <button onClick={() => setCollapsed(v => !v)} className="hidden lg:flex absolute z-10 top-20 items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shadow-lg transition-all duration-300" style={{ left: collapsed ? 52 : 212 }}>
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 flex flex-col w-56 bg-[#0a0a14] border-r border-white/5 h-full">{sidebarContent}</aside>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0a14]">
          <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-white"><Menu className="w-5 h-5" /></button>
          <HeruLogo className="h-6" />
        </div>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
        <nav className="lg:hidden flex border-t border-white/5 bg-[#0a0a14]">
          {BOTTOM_TABS.map(tab => (
            <Link key={tab.to} to={tab.to} className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${isActive(tab.to) ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <tab.icon className="w-5 h-5" /><span>{tab.text}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
