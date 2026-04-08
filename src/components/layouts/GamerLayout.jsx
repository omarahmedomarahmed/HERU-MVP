import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import OrdersDropdown from '@/components/navigation/OrdersDropdown.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Home, Trophy, Users, ShoppingBag, User, Bell,
  ShoppingCart, Menu, X, LogOut, Package, LayoutDashboard,
  Swords, Wallet
} from 'lucide-react';

export default function GamerLayout({ children, user, profile, cartCount = 0, notificationCount = 0 }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { icon: Swords, label: 'Arena', path: '/gamer/arena', prominent: true },
    { icon: Home, label: 'Home', path: '/gamer/home' },
    { icon: Trophy, label: 'Tournaments', path: '/gamer/tournaments' },
    { icon: Users, label: 'Teams', path: '/gamer/teams' },
    { icon: ShoppingBag, label: 'Shop', path: '/gamer/marketplace' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate('/auth/gamer/login');
  };

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['orders-nav', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return Order.list({ gamer_id: user.id }, '-created_date', 5);
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to={'/gamer/home'}>
              <HeruLogo className="h-8" />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${isActive(item.path)
                      ? item.prominent
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-900/40 border border-red-500'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : item.prominent
                        ? 'bg-gradient-to-r from-red-700/30 to-red-800/20 text-red-400 hover:from-red-600/50 hover:to-red-700/30 border border-red-600/40 shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 ${item.prominent ? 'drop-shadow-sm' : ''}`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Orders */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setOrdersOpen(!ordersOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Package className="w-5 h-5" />
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                )}
              </button>
              <OrdersDropdown 
                isOpen={ordersOpen} 
                onClose={() => setOrdersOpen(false)}
                orders={orders}
              />
            </div>

            {/* Cart */}
            <Link
              to={'/gamer/cart'}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-zinc-800">
                        <h3 className="text-white font-bold">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {profile?.notifications?.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-zinc-800/50 ${!notif.read ? 'bg-red-500/5' : ''}`}
                          >
                            <p className="text-gray-300 text-sm">{notif.message}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                        {(!profile?.notifications || profile.notifications.length === 0) && (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No notifications</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Dashboard button */}
            <Link
              to="/gamer/home"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Profile */}
            <Link
              to={'/gamer/profile'}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center overflow-hidden border-2 border-red-500/50">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-zinc-800"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                      ${isActive(item.path)
                        ? item.prominent
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                          : 'bg-red-500/20 text-red-400'
                        : item.prominent
                          ? 'bg-red-700/20 text-red-400 border border-red-600/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.prominent && !isActive(item.path) && (
                      <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">BATTLE</span>
                    )}
                  </Link>
                ))}
                <div className="border-t border-zinc-800 pt-2 mt-2">
                  <Link
                    to="/gamer/home"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    to={'/gamer/orders'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Package className="w-5 h-5" />
                    My Orders
                  </Link>
                  <Link
                    to={'/gamer/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
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
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}