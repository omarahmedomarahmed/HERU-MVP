import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare, Users, Search, Trophy, Clock,
} from 'lucide-react';
import { Tournament } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

export default function StaffMessages() {
  const [tab, setTab] = useState('organizer');
  const [search, setSearch] = useState('');

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['staff-messages-tournaments'],
    queryFn: () => Tournament.list(),
  });

  const conversationList = useMemo(() => {
    return tournaments
      .filter(t => {
        const hasOrgChat = t.organizer_chat?.length > 0;
        const hasGeneralChat = t.general_chat?.length > 0;
        const hasSupportChat = t.support_chat?.length > 0;
        return hasOrgChat || hasGeneralChat || hasSupportChat;
      })
      .map(t => {
        const orgChat = t.organizer_chat || [];
        const generalChat = t.general_chat || [];
        const supportChat = t.support_chat || [];
        const allMessages = [...orgChat, ...generalChat, ...supportChat];
        const lastMsg = allMessages.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0];
        const uniqueSenders = new Set(allMessages.map(m => m.sender_id).filter(Boolean));

        return {
          id: t.id,
          name: t.name,
          game: t.game,
          orgChatCount: orgChat.length,
          generalChatCount: generalChat.length,
          supportChatCount: supportChat.length,
          participantCount: uniqueSenders.size,
          lastMessage: lastMsg?.message || '',
          lastSender: lastMsg?.sender_name || '',
          lastTime: lastMsg?.timestamp,
          status: t.status,
        };
      })
      .sort((a, b) => new Date(b.lastTime || 0) - new Date(a.lastTime || 0));
  }, [tournaments]);

  const filteredConversations = useMemo(() => {
    return conversationList.filter(c => {
      const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase());
      if (tab === 'organizer') return matchSearch && c.orgChatCount > 0;
      if (tab === 'general') return matchSearch && c.generalChatCount > 0;
      if (tab === 'support') return matchSearch && c.supportChatCount > 0;
      return matchSearch;
    });
  }, [conversationList, search, tab]);

  const totalMessages = conversationList.reduce((s, c) => s + c.orgChatCount + c.generalChatCount + c.supportChatCount, 0);

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Platform <span className="text-blue-400">Messages</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {conversationList.length} conversations, {totalMessages} total messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Organizer Chats</span>
          </div>
          <p className="text-xl font-bold text-white">
            {conversationList.filter(c => c.orgChatCount > 0).length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">General Chats</span>
          </div>
          <p className="text-xl font-bold text-white">
            {conversationList.filter(c => c.generalChatCount > 0).length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Support Chats</span>
          </div>
          <p className="text-xl font-bold text-white">
            {conversationList.filter(c => c.supportChatCount > 0).length}
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { id: 'organizer', label: 'Organizer Chat', icon: Users },
          { id: 'general', label: 'General Chat', icon: MessageSquare },
          { id: 'support', label: 'Support Chat', icon: Trophy },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-gray-400 hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tournaments..."
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Conversation list */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading messages...</div>
      ) : filteredConversations.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-500">No conversations found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map(conv => (
            <div
              key={conv.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm truncate">{conv.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        conv.status === 'live' ? 'bg-green-500/20 text-green-400' :
                        conv.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-zinc-700 text-gray-400'
                      }`}>
                        {conv.status}
                      </span>
                    </div>
                    {conv.lastMessage && (
                      <p className="text-gray-400 text-xs truncate">
                        <span className="text-gray-500">{conv.lastSender}:</span> {conv.lastMessage}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {conv.participantCount} participants
                      </span>
                      <span>
                        {tab === 'organizer' ? conv.orgChatCount :
                         tab === 'general' ? conv.generalChatCount :
                         conv.supportChatCount} messages
                      </span>
                      {conv.game && <span>{conv.game}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  {conv.lastTime && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTime(conv.lastTime)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
