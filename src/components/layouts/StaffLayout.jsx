import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearStaffSession } from '@/lib/staffAuth'
import HeruLogo from '@/components/shared/HeruLogo'
import {
  LayoutDashboard, Trophy, Users, Building2, MessageSquare, CheckCircle,
  CreditCard, ShoppingBag, Radar, Settings, Menu, X, LogOut,
  TrendingUp, Shield, Bell, Gamepad2, UsersRound, Briefcase,
  FileText, ScrollText, KeyRound, Layers, Receipt, Hammer, ChevronDown,
  Award, MapPin,
} from 'lucide-react'

const NAV = [
  {
    label: 'Overview',
    items: [
      { to: '/staff/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
      { to: '/staff/revenue',   icon: TrendingUp,       text: 'Revenue'   },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/staff/tournaments',       icon: Trophy,      text: 'Tournaments'      },
      { to: '/staff/tournament-builder',icon: Hammer,      text: 'Build Tournament' },
      { to: '/staff/users',             icon: Users,       text: 'Users'            },
      { to: '/staff/gamers',            icon: Gamepad2,    text: 'Gamers'           },
      { to: '/staff/teams',             icon: UsersRound,  text: 'Teams'            },
      { to: '/staff/organizers',        icon: Building2,   text: 'Organizers'       },
      { to: '/staff/services',              icon: Briefcase,   text: 'Gig Requests'     },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/staff/billing',            icon: CreditCard,  text: 'Billing'             },
      { to: '/staff/orders',             icon: Receipt,     text: 'Orders'              },
      { to: '/staff/tournament-orders',  icon: Layers,      text: 'Tournament Orders'   },
      { to: '/staff/marketplace',        icon: ShoppingBag, text: 'Marketplace'         },
      { to: '/staff/radar',              icon: Radar,       text: 'Sponsorship Radar'   },
    ],
  },
  {
    label: 'Moderation',
    items: [
      { to: '/staff/approvals', icon: CheckCircle,   text: 'Approvals' },
      { to: '/staff/messages',  icon: MessageSquare, text: 'Messages'  },
      { to: '/staff/badges',    icon: Award,         text: 'Badges'    },
      { to: '/staff/venues',    icon: MapPin,        text: 'Venues'    },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/staff/settings', icon: KeyRound,    text: 'Access Keys' },
      { to: '/staff/audit',    icon: ScrollText,  text: 'Audit Trail' },
    ],
  },
]

export default function StaffLayout({ children }) {
  const [open, setOpen]         = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({})
  const location  = useLocation()
  const navigate  = useNavigate()

  const active = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const logout = () => { clearStaffSession(); navigate('/') }

  const toggleSection = (label) =>
    setExpandedSections(p => ({ ...p, [label]: !p[label] }))

  const SidebarNav = ({ mobile = false }) => (
    <nav className="flex-1 overflow-y-auto py-3 space-y-1 px-2">
      {NAV.map((section) => {
        const isExp = expandedSections[section.label] !== false
        return (
          <div key={section.label} className="mb-1">
            {!collapsed && (
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500/50">
                  {section.label}
                </span>
                <ChevronDown size={10} className={`text-red-500/30 transition-transform ${isExp ? '' : '-rotate-90'}`} />
              </button>
            )}
            {(collapsed || isExp) && section.items.map((item) => {
              const on = active(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={mobile ? () => setOpen(false) : undefined}
                  title={collapsed ? item.text : undefined}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${on
                      ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <item.icon size={16} className={`shrink-0 ${on ? 'text-red-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                  {!collapsed && <span className="truncate">{item.text}</span>}
                  {on && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500" />}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#0e0e0e] border-r border-red-500/10 transition-[width] duration-200 z-10
        ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>

        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-3 border-b border-red-500/10 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/50">
                <Shield size={14} className="text-white" />
              </div>
              <div>
                <span className="text-white font-black text-sm tracking-tight">HERU</span>
                <span className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-1">ADMIN</span>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors ml-auto"
          >
            {collapsed
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            }
          </button>
        </div>

        <SidebarNav />

        {/* Footer */}
        <div className="shrink-0 border-t border-red-500/10 p-2">
          <button
            onClick={logout}
            title={collapsed ? 'Sign Out' : undefined}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={15} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-4 bg-[#0e0e0e]/90 backdrop-blur border-b border-red-500/10 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="md:hidden p-1.5 text-zinc-400 hover:text-white">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500 animate-pulse" />
              <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                {location.pathname.replace('/staff/', '').replace(/-/g, ' ') || 'dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-zinc-500 hover:text-zinc-200 rounded-lg hover:bg-white/5">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <Shield size={12} className="text-red-400" />
              <span className="text-xs text-red-400 font-bold uppercase tracking-wider">God Mode</span>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative w-[260px] bg-[#0e0e0e] flex flex-col border-r border-red-500/10 shadow-2xl">
              <div className="flex items-center justify-between px-4 h-14 border-b border-red-500/10">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-red-500" />
                  <span className="text-white font-black text-sm">HERU <span className="text-red-500">ADMIN</span></span>
                </div>
                <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-white p-1">
                  <X size={18} />
                </button>
              </div>
              <SidebarNav mobile />
              <div className="border-t border-red-500/10 p-3">
                <button onClick={logout} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 text-sm px-3 py-2 w-full">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-[#080808]">
          <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
