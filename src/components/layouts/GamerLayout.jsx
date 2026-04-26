// reviewed 2026-04-25
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import SupportChat from '@/components/ui/SupportChat';
import { motion, AnimatePresence } from 'framer-motion';
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Home, Trophy, Users, User, Bell,
  Menu, X, LogOut, LayoutDashboard,
  Swords, UserPlus, BookOpen, MessageSquare, ChevronRight,
  Link2, Bot
} from 'lucide-react';

export default function GamerLayout({ children, user: userProp, profile: profileProp }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user: authUser } = useAuth();

  const user = userProp || authUser;

  // Always fetch profile in the layout so notifications/red-dots work on all pages
  const { data: layoutProfile } = useQuery({
    queryKey: ['gamer-profile-layout', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const profile = profileProp || layoutProfile;

  // Compute badge counts from real data
  const notifications = profile?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Pending tournament invites (for profile red dot)
  const pendingTournamentInvites = (profile?.tournament_invites || []).filter(i => i.status === 'pending').length;

  // Fetch teams where user is a member to check pending team invites
  const { data: myTeams = [] } = useQuery({
    queryKey: ['my-teams-nav', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const all = await Team.list();
      return all.filter(t => t.members?.includes(user.id) || t.leader_id === user.id);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Pending team join requests (for Teams red dot — only if user is team leader)
  const pendingTeamRequests = myTeams.reduce((acc, t) => {
    if (t.leader_id === user?.id) {
      acc += (t.join_requests || []).filter(r => r.status === 'pending').length;
    }
    return acc;
  }, 0);

  // Unread DM count
  const { data: dmConversations = [] } = useQuery({
    queryKey: ['dm-conversations', user?.id],
    queryFn: async () => {
      try {
        const data = await apiCall('/direct-messages/conversations');
        return Array.isArray(data) ? data : data?.data || [];
      } catch { return []; }
    },
    enabled: !!user?.id,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
  const unreadDMs = dmConversations.filter(c => c.unread_count > 0).length;

  // Total alerts driving red dot on Profile nav
  const profileAlerts = pendingTournamentInvites;

  // Desktop nav — Friends & Messages are accessible via Profile tabs and header icon
  const navItems = [
    { icon: Swords, label: 'Arena', path: '/gamer/arena', prominent: true },
    { icon: Home, label: 'Home', path: '/gamer/home' },
    { icon: Trophy, label: 'Tournaments', path: '/gamer/tournaments' },
    { icon: Users, label: 'Teams', path: '/gamer/teams', badge: pendingTeamRequests },
    { icon: BookOpen, label: 'Coaching', path: '/coaches' },
  ];

  // Mobile menu items (includes all items including Friends & Messages)
  const mobileNavItems = [
    ...navItems,
    { icon: UserPlus, label: 'Friends', path: '/gamer/friends' },
    { icon: MessageSquare, label: 'Messages', path: '/gamer/messages' },
  ];

  const isActive = (path, search) => {
    if (search) {
      return location.pathname === path && location.search.includes(search);
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/gamer/login');
  };

  const recentNotifs = [...notifications].reverse().slice(0, 5);

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
                  key={item.path + (item.search || '')}
                  to={item.search ? `${item.path}?${item.search}` : item.path}
                  className={`
                    relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${isActive(item.path, item.search)
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
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Messages icon */}
            <Link
              to="/gamer/messages"
              className="relative p-2 text-gray-400 hover:text-white transition-colors hidden md:block"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadDMs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {unreadDMs > 9 ? '9+' : unreadDMs}
                </span>
              )}
            </Link>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(v => !v)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    {/* Backdrop — click anywhere to close */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <Bell className="w-4 h-4 text-red-400" />
                          Notifications
                          {unreadCount > 0 && (
                            <span className="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{unreadCount}</span>
                          )}
                        </h3>
                        <button onClick={() => setNotificationsOpen(false)} className="text-gray-500 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/50">
                        {recentNotifs.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">No notifications yet</p>
                          </div>
                        ) : (
                          recentNotifs.map((notif, i) => (
                            <button
                              key={notif.id || i}
                              className={`w-full text-left p-3 hover:bg-zinc-800/50 transition-colors ${!notif.read ? 'bg-red-500/5 border-l-2 border-red-500' : ''}`}
                              onClick={() => {
                                setNotificationsOpen(false);
                                if (notif.link) navigate(notif.link);
                              }}
                            >
                              <p className="text-gray-200 text-sm leading-snug">{notif.title || notif.message}</p>
                              {notif.description && (
                                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{notif.description}</p>
                              )}
                              <p className="text-gray-600 text-xs mt-1">
                                {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                      <Link
                        to="/gamer/notifications"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center justify-center gap-2 p-3 border-t border-zinc-800 text-red-400 hover:bg-red-500/5 text-sm font-medium transition-colors"
                      >
                        View All Notifications
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile — shows red dot if there are pending invites */}
            <Link
              to={'/gamer/profile'}
              className="relative flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center overflow-hidden border-2 border-red-500/50">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              {profileAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-zinc-950" />
              )}
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
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.path + (item.search || '')}
                    to={item.search ? `${item.path}?${item.search}` : item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                      ${isActive(item.path, item.search)
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
                    {item.badge > 0 && (
                      <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.prominent && !isActive(item.path, item.search) && !item.badge && (
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
                    to={'/gamer/notifications'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Bell className="w-5 h-5" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={'/coaches'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <BookOpen className="w-5 h-5" />
                    Coaching Sessions
                  </Link>
                  <Link
                    to={'/gamer/profile?tab=connect'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Link2 className="w-5 h-5" />
                    Connected Accounts
                  </Link>
                  <Link
                    to={'/gamer/ai-agent'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <Bot className="w-5 h-5" />
                    AI Assistant
                  </Link>
                  <Link
                    to={'/gamer/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="relative flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                  >
                    <User className="w-5 h-5" />
                    Profile
                    {profileAlerts > 0 && (
                      <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                        {profileAlerts}
                      </span>
                    )}
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
      <SupportChat accentColor="#ef4444" />
    </div>
  );
}
