import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { Bell, Trophy, Users, Package, Briefcase, ChevronRight, Check } from 'lucide-react';
import { GamerProfile, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

const ICON_MAP = {
  tournament: Trophy,
  team: Users,
  order: Package,
  gig: Briefcase,
};

function NotificationIcon({ type }) {
  const Icon = ICON_MAP[type] || Bell;
  return <Icon className="w-5 h-5" />;
}

export default function GamerNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const notifications = (profile?.notifications || []).slice().reverse();

  return (
    <GamerLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <Bell className="w-6 h-6 text-red-500" /> Notifications
        </h1>

        {notifications.length === 0 ? (
          <FloatingPanel className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No notifications yet</p>
            <p className="text-gray-600 text-sm mt-1">You'll see updates about tournaments, teams, and orders here</p>
          </FloatingPanel>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif, i) => (
              <FloatingPanel
                key={i}
                className={`p-4 cursor-pointer hover:border-red-500/30 transition-colors ${
                  notif.read ? 'opacity-60' : ''
                }`}
                onClick={() => notif.link && navigate(notif.link)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${notif.read ? 'bg-zinc-800' : 'bg-red-500/10'}`}>
                    <NotificationIcon type={notif.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">{notif.title || notif.message}</p>
                    {notif.description && (
                      <p className="text-gray-400 text-sm mt-1">{notif.description}</p>
                    )}
                    <p className="text-gray-600 text-xs mt-2">
                      {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                  {notif.link && <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />}
                  {notif.read && <Check className="w-4 h-4 text-green-500 mt-1" />}
                </div>
              </FloatingPanel>
            ))}
          </div>
        )}
      </div>
    </GamerLayout>
  );
}
