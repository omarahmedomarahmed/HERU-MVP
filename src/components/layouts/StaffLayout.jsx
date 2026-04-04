import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { verifyStaffAccess, logoutStaff } from '@/lib/staffAuth.js';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Trophy, ShoppingBag, Ticket, 
  MessageSquare, Settings, LogOut, Menu, X, ChevronRight,
  Shield, UserCheck, Radar, DollarSign
} from 'lucide-react';

export default function StaffLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      setIsVerifying(true);
      if (mounted) {
        const isValid = await verifyStaffAccess(navigate);
        if (mounted) {
          if (isValid) {
            setIsVerified(true);
            setIsVerifying(false);
          } else {
            navigate('/admin', { replace: true });
          }
        }
      }
    };
    verify();
    return () => { mounted = false; };
  }, [navigate]);
  
  const navSections = [
    {
      title: 'Overview',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/staff/dashboard' },
      ]
    },
    {
      title: 'Management',
      items: [
        { icon: Trophy, label: 'Tournaments', path: '/staff/tournaments' },
        { icon: Users, label: 'Users', path: '/staff/users' },
        { icon: MessageSquare, label: 'Messages', path: '/staff/messages' },
        { icon: UserCheck, label: 'Approvals', path: '/staff/approvals' },
      ]
    },
    {
      title: 'Finance',
      items: [
        { icon: Radar, label: 'Sponsorship Radar', path: '/staff/radar' },
        { icon: DollarSign, label: 'Master Billing', path: '/staff/billing' },
        { icon: Ticket, label: 'Tournament Orders', path: '/staff/tournament-orders' },
        { icon: ShoppingBag, label: 'Marketplace', path: '/staff/marketplace' },
      ]
    },
    {
      title: 'Admin',
      items: [
        { icon: UserCheck, label: 'Organizers', path: '/staff/organizers' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: 'Settings', path: '/dashboard/staff/settings' },
      ]
    }
  ];

  const isActive = (path) => location.pathname.includes(path.toLowerCase()) || 
    location.pathname.includes(path.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1));

  const handleLogout = async () => {
    await logoutStaff(navigate);
  };

  if (isVerifying) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />
      
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40
        bg-zinc-950/95 backdrop-blur-xl border-r border-red-900/20
        transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-red-900/20 flex items-center justify-between">
           <Link to="/dashboard/staff" className="flex items-center gap-3">
            <HeruLogo className="h-8" />
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-red-500 font-bold text-sm">STAFF</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-gray-500 hover:text-white"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 border-b border-red-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate text-sm">{user?.full_name}</p>
                <p className="text-gray-500 text-xs">Staff Member</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              {sidebarOpen && (
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider px-4 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                   <Link
                     key={item.path}
                     to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive(item.path)
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
         <div className="p-3 border-t border-red-900/20 space-y-1">
           <Link
             to="/dashboard/staff/settings"
             className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
           >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-red-900/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <HeruLogo className="h-7" />
          </div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold px-2 py-1 border border-red-500/30 rounded">
            <Shield className="w-3 h-3" />
            STAFF
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-red-900/20 max-h-[80vh] overflow-y-auto"
            >
              <nav className="p-4 space-y-4">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-2">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg
                            ${isActive(item.path)
                              ? 'bg-red-500/20 text-red-400'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }
                          `}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="border-t border-red-900/20 pt-2">
                  <Link
                    to="/dashboard/staff/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className={`
        flex-1 min-h-screen
        pt-20 lg:pt-0
        bg-[#0a0a0a]
        transition-all duration-300
        ${typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarOpen ? 'lg:ml-48' : 'lg:ml-12') : ''}
      `}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}