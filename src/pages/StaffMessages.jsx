import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import { MessageSquare } from 'lucide-react';
import { Tournament } from '@/api/heruClient'


export default function StaffMessages() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: tournaments = [] } = useQuery({
    queryKey: ['staff-tournament-chats'],
    queryFn: () => Tournament.list(),
  });

  const tournamentsWithChats = tournaments.filter(t => 
    (t.organizer_chat?.length > 0) || (t.general_chat?.length > 0) || (t.support_chat?.length > 0)
  );

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-black text-white">STAFF <span className="text-red-500">MESSAGES</span></h1>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['tournaments', 'organizers', 'gigs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'tournaments' && (
          <FloatingPanel className="p-6">
            {tournamentsWithChats.length === 0 ? (
              <p className="text-gray-500">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {tournamentsWithChats.map(t => (
                  <div key={t.id} className="bg-zinc-800/50 p-4 rounded">
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {t.organizer_chat?.length || 0} organizer messages
                    </p>
                  </div>
                ))}
              </div>
            )}
          </FloatingPanel>
        )}

        {activeTab === 'organizers' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-500">Organizer chats coming soon</p>
          </FloatingPanel>
        )}

        {activeTab === 'gigs' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-500">Gig chats coming soon</p>
          </FloatingPanel>
        )}
      </div>
    </>
  );
}