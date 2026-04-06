import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import {
  MessageSquare, Search, Clock, Trophy, ShoppingBag,
  ChevronRight, Inbox,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelative(ts) {
  if (!ts) return '';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Staff guard
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Fetch messages
  const { data: rawMessages, isLoading } = useQuery({
    queryKey: ['staff-messages'],
    queryFn: () => apiCall('/staff/messages'),
    staleTime: 30_000,
    retry: 1,
  });

  // Build thread list from response or fallback
  const threads = useMemo(() => {
    if (Array.isArray(rawMessages)) return rawMessages;
    if (rawMessages?.threads) return rawMessages.threads;

    // Fallback: build from tournaments and orders if backend returns them
    const result = [];
    const tournaments = rawMessages?.tournaments || [];
    const orders = rawMessages?.orders || [];

    tournaments.forEach((t) => {
      if (t.support_chat?.length > 0) {
        const last = t.support_chat[t.support_chat.length - 1];
        result.push({
          id: `tournament-support-${t.id}`,
          source: 'tournament',
          sourceLabel: 'Tournament Support',
          name: t.name || 'Unnamed Tournament',
          lastMessage: last.message || '',
          lastSender: last.sender_name || last.sender_role || 'Unknown',
          timestamp: last.timestamp,
          messageCount: t.support_chat.length,
          link: `/staff/tournaments/${t.id}`,
        });
      }
      if (t.organizer_chat?.length > 0) {
        const last = t.organizer_chat[t.organizer_chat.length - 1];
        result.push({
          id: `tournament-org-${t.id}`,
          source: 'tournament',
          sourceLabel: 'Organizer Chat',
          name: t.name || 'Unnamed Tournament',
          lastMessage: last.message || '',
          lastSender: last.sender_name || last.sender_role || 'Unknown',
          timestamp: last.timestamp,
          messageCount: t.organizer_chat.length,
          link: `/staff/tournaments/${t.id}`,
        });
      }
    });

    orders.forEach((o) => {
      if (o.support_chat?.length > 0) {
        const last = o.support_chat[o.support_chat.length - 1];
        result.push({
          id: `order-support-${o.id}`,
          source: 'order',
          sourceLabel: 'Order Support',
          name: `Order #${(o.id || '').slice(0, 8)}`,
          lastMessage: last.message || '',
          lastSender: last.sender_name || last.sender_role || 'Unknown',
          timestamp: last.timestamp,
          messageCount: o.support_chat.length,
          link: `/staff/orders/${o.id}`,
        });
      }
    });

    result.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return result;
  }, [rawMessages]);

  // Filter
  const filtered = useMemo(() => {
    return threads.filter((t) => {
      if (sourceFilter !== 'all' && t.source !== sourceFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (t.name || '').toLowerCase().includes(q);
        const matchMsg = (t.lastMessage || '').toLowerCase().includes(q);
        const matchSender = (t.lastSender || '').toLowerCase().includes(q);
        if (!matchName && !matchMsg && !matchSender) return false;
      }
      return true;
    });
  }, [threads, sourceFilter, searchQuery]);

  const tournamentCount = threads.filter((t) => t.source === 'tournament').length;
  const orderCount = threads.filter((t) => t.source === 'order').length;

  return (
    <StaffLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            Messages from tournament and order support chats
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{threads.length}</p>
                <p className="text-xs text-gray-500">Total Threads</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tournamentCount}</p>
                <p className="text-xs text-gray-500">Tournament Chats</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
                <p className="text-xs text-gray-500">Order Chats</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search threads by name, message, or sender..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'tournament', label: 'Tournaments' },
                { value: 'order', label: 'Orders' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSourceFilter(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    sourceFilter === opt.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Thread List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No message threads found</p>
            <p className="text-gray-400 text-sm mt-1">
              Support chats from tournaments and orders will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate(thread.link)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      thread.source === 'tournament' ? 'bg-amber-50' : 'bg-green-50'
                    }`}
                  >
                    {thread.source === 'tournament' ? (
                      <Trophy className="w-5 h-5 text-amber-600" />
                    ) : (
                      <ShoppingBag className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {thread.name}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          thread.source === 'tournament'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {thread.sourceLabel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      <span className="font-medium text-gray-600">
                        {thread.lastSender}:
                      </span>{' '}
                      {thread.lastMessage}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelative(thread.timestamp)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {thread.messageCount} message{thread.messageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
