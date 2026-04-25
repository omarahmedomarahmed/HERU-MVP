import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import {
  Bell, Trophy, Users, Package, Briefcase, ChevronRight,
  Check, CheckCheck, ArrowLeft, Star, Swords, UserPlus,
  UserCheck, Gift, MessageSquare, AlertCircle
} from 'lucide-react';
import { GamerProfile, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const TYPE_CONFIG = {
  tournament:       { icon: Trophy,       color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  tournament_invite:{ icon: Trophy,       color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  team:             { icon: Users,        color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  team_invite:      { icon: UserPlus,     color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  team_join:        { icon: UserCheck,    color: 'text-green-400',  bg: 'bg-green-400/10' },
  order:            { icon: Package,      color: 'text-purple-400', bg: 'bg-purple-400/10' },
  gig:              { icon: Briefcase,    color: 'text-orange-400', bg: 'bg-orange-400/10' },
  talent:           { icon: Star,         color: 'text-pink-400',   bg: 'bg-pink-400/10' },
  arena:            { icon: Swords,       color: 'text-red-400',    bg: 'bg-red-400/10' },
  reward:           { icon: Gift,         color: 'text-amber-400',  bg: 'bg-amber-400/10' },
  message:          { icon: MessageSquare,color: 'text-cyan-400',   bg: 'bg-cyan-400/10' },
  system:           { icon: AlertCircle,  color: 'text-gray-400',   bg: 'bg-gray-400/10' },
};

function NotifIcon({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;
  return (
    <div className={`p-2 rounded-lg flex-shrink-0 ${cfg.bg}`}>
      <Icon className={`w-5 h-5 ${cfg.color}`} />
    </div>
  );
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function GamerNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user?.id,
    refetchInterval: 15_000, // poll every 15 s for real-time feel
  });

  const notifications = [...(profile?.notifications || [])].reverse();
  const unread = notifications.filter(n => !n.read);

  // Mark all as read when page opens
  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!profile?.id || unread.length === 0) return;
      const updated = (profile.notifications || []).map(n => ({ ...n, read: true }));
      await GamerProfile.update(profile.id, { notifications: updated });
    },
    onSuccess: () => queryClient.invalidateQueries(['gamer-profile', user?.id]),
  });

  useEffect(() => {
    if (profile && unread.length > 0) {
      const timer = setTimeout(() => markAllRead.mutate(), 2000);
      return () => clearTimeout(timer);
    }
  }, [profile?.id, unread.length]); // eslint-disable-line

  return (
    <GamerLayout user={user} profile={profile}>
      <div className="max-w-2xl mx-auto py-4 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-red-500" />
              Notifications
            </h1>
            {unread.length > 0 && (
              <p className="text-gray-400 text-sm">{unread.length} unread</p>
            )}
          </div>
          {notifications.length > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 rounded-xl bg-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <FloatingPanel className="p-12 text-center">
            <Bell className="w-14 h-14 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-300 font-semibold text-lg">All caught up!</p>
            <p className="text-gray-600 text-sm mt-1">
              You'll see updates about tournaments, teams, orders, and gigs here
            </p>
          </FloatingPanel>
        ) : (
          <div className="space-y-2">
            {/* Unread section */}
            {unread.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 mb-2">New</p>
                {unread.map((notif, i) => (
                  <NotifRow key={notif.id || i} notif={notif} navigate={navigate} />
                ))}
                <div className="border-t border-zinc-800 my-4" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1 mb-2">Earlier</p>
              </>
            )}
            {/* All (or read-only if there were unread) */}
            {notifications.filter(n => n.read || unread.length === 0).map((notif, i) => (
              <NotifRow key={notif.id || i} notif={notif} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </GamerLayout>
  );
}

function NotifRow({ notif, navigate }) {
  const isUnread = !notif.read;
  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer
        hover:border-red-500/30 hover:bg-zinc-800/40
        ${isUnread
          ? 'border-red-500/20 bg-red-500/5 border-l-2 border-l-red-500'
          : 'border-zinc-800/60 bg-zinc-900/40'
        }
      `}
      onClick={() => notif.link && navigate(notif.link)}
    >
      <NotifIcon type={notif.type} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-semibold text-sm leading-snug ${isUnread ? 'text-white' : 'text-gray-300'}`}>
            {notif.title || notif.message}
          </p>
          <span className="text-gray-600 text-xs whitespace-nowrap flex-shrink-0">{timeAgo(notif.created_at)}</span>
        </div>
        {notif.description && (
          <p className="text-gray-500 text-xs mt-0.5 leading-snug">{notif.description}</p>
        )}
        {notif.message && notif.title && notif.message !== notif.title && (
          <p className="text-gray-400 text-xs mt-1 leading-snug">{notif.message}</p>
        )}
      </div>
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        {notif.link && <ChevronRight className="w-4 h-4 text-gray-600" />}
        {!isUnread && <Check className="w-3 h-3 text-green-600" />}
      </div>
    </div>
  );
}
