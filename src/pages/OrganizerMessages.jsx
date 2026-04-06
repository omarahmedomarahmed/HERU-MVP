import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tournament, SponsorshipRadar, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import {
  MessageSquare, Send, Trophy, Search, Circle, ArrowLeft,
  Users, Clock, ChevronRight,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Role badge component
// ---------------------------------------------------------------------------
function RoleBadge({ role }) {
  const colors = {
    organizer: 'bg-red-500/20 text-red-400 border-red-500/30',
    'co-organizer': 'bg-red-500/20 text-red-400 border-red-500/30',
    sponsor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    staff: 'bg-red-500/20 text-red-400 border-red-500/30',
    talent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };
  const cls = colors[role] || 'bg-zinc-700/40 text-zinc-400 border-zinc-600/30';
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cls}`}>
      {role}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Format relative time
// ---------------------------------------------------------------------------
function timeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(timestamp).toLocaleDateString();
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function OrganizerMessages() {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showThreads, setShowThreads] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const userId = user?.id;

  // -----------------------------------------------------------------------
  // Fetch tournaments where user is main organizer
  // -----------------------------------------------------------------------
  const { data: myTournaments = [], isLoading: loadingMy } = useQuery({
    queryKey: ['org-msg-my', userId],
    queryFn: async () => {
      const all = await Tournament.list();
      return all.filter((t) => t.organizer_id === userId || t.main_organizer_id === userId);
    },
    enabled: !!userId,
    refetchInterval: 15000,
  });

  // -----------------------------------------------------------------------
  // Fetch tournaments where user is co-organizer (via radar)
  // -----------------------------------------------------------------------
  const { data: coOrgTournaments = [], isLoading: loadingCoOrg } = useQuery({
    queryKey: ['org-msg-coorg', userId],
    queryFn: async () => {
      const radars = await SponsorshipRadar.list();
      const myRadars = radars.filter((r) => {
        const coOrgs = r.co_organizers || [];
        return coOrgs.some(
          (co) =>
            co.organizer_id === userId ||
            co.user_id === userId
        );
      });
      if (!myRadars.length) return [];
      const tournamentIds = myRadars.map((r) => r.tournament_id).filter(Boolean);
      if (!tournamentIds.length) return [];
      const all = await Tournament.list();
      return all.filter((t) => tournamentIds.includes(t.id));
    },
    enabled: !!userId,
    refetchInterval: 15000,
  });

  // -----------------------------------------------------------------------
  // Merge and deduplicate
  // -----------------------------------------------------------------------
  const allTournaments = useMemo(() => {
    const map = new Map();
    [...myTournaments, ...coOrgTournaments].forEach((t) => {
      if (!map.has(t.id)) map.set(t.id, t);
    });
    return Array.from(map.values());
  }, [myTournaments, coOrgTournaments]);

  // -----------------------------------------------------------------------
  // Build thread list with last message info and unread tracking
  // -----------------------------------------------------------------------
  const threads = useMemo(() => {
    return allTournaments
      .map((t) => {
        const chat = t.organizer_chat || [];
        const lastMsg = chat.length > 0 ? chat[chat.length - 1] : null;

        // Simple unread: messages from others after last message the user sent
        let unread = 0;
        const lastOwnIdx = chat.map((m, i) => (m.sender_id === userId ? i : -1))
          .filter((i) => i >= 0)
          .pop();
        if (lastOwnIdx !== undefined && lastOwnIdx >= 0) {
          unread = chat.slice(lastOwnIdx + 1).filter((m) => m.sender_id !== userId).length;
        } else if (chat.length > 0) {
          // User has never sent a message, all non-own are "unread"
          unread = chat.filter((m) => m.sender_id !== userId).length;
        }

        return {
          id: t.id,
          name: t.name,
          game: t.game,
          status: t.status,
          lastMessage: lastMsg?.message || lastMsg?.content || null,
          lastSender: lastMsg?.sender_name || lastMsg?.sender_brand || null,
          lastTimestamp: lastMsg?.timestamp || t.updated_at || t.created_at,
          messageCount: chat.length,
          unread,
          tournament: t,
        };
      })
      .sort((a, b) => {
        const ta = a.lastTimestamp ? new Date(a.lastTimestamp).getTime() : 0;
        const tb = b.lastTimestamp ? new Date(b.lastTimestamp).getTime() : 0;
        return tb - ta;
      });
  }, [allTournaments, userId]);

  // -----------------------------------------------------------------------
  // Filtered threads
  // -----------------------------------------------------------------------
  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.game && t.game.toLowerCase().includes(q))
    );
  }, [threads, search]);

  // -----------------------------------------------------------------------
  // Selected tournament
  // -----------------------------------------------------------------------
  const selectedThread = threads.find((t) => t.id === selectedId);
  const selectedTournament = selectedThread?.tournament || null;
  const chatMessages = selectedTournament?.organizer_chat || [];

  // -----------------------------------------------------------------------
  // Auto-scroll on new messages
  // -----------------------------------------------------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length, selectedId]);

  // Focus input when selecting a thread
  useEffect(() => {
    if (selectedId) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedId]);

  // -----------------------------------------------------------------------
  // Send message mutation
  // -----------------------------------------------------------------------
  const sendMutation = useMutation({
    mutationFn: async (text) => {
      await Tournament.sendChat(selectedId, {
        sender_id: userId,
        sender_name: userProfile?.brand_name || userProfile?.full_name || user?.email || 'Organizer',
        sender_role: 'organizer',
        message: text,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-msg-my'] });
      queryClient.invalidateQueries({ queryKey: ['org-msg-coorg'] });
    },
  });

  const handleSend = () => {
    const text = message.trim();
    if (!text || !selectedId) return;
    setMessage('');
    sendMutation.mutate(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isLoading = loadingMy || loadingCoOrg;

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------
  if (!isLoading && allTournaments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="w-8 h-8 text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No conversations yet</h2>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Messages will appear when you create or join a tournament. Start by building a tournament
            or browsing the Sponsorship Radar to co-organize one.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-black text-white">
          <span className="text-red-500">MESSAGES</span>
        </h1>
        <p className="text-zinc-500 text-sm">Tournament conversations with co-organizers, talents, and staff</p>
      </div>

      {/* Two-panel layout */}
      <div className="flex-1 flex rounded-xl border border-zinc-800/60 bg-zinc-900/50 overflow-hidden min-h-0">
        {/* --------------------------------------------------------------- */}
        {/* Thread list panel */}
        {/* --------------------------------------------------------------- */}
        <div
          className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-zinc-800/60 flex flex-col ${
            selectedId && !showThreads ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search */}
          <div className="p-3 border-b border-zinc-800/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800/60 border border-zinc-700/40 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
              />
            </div>
          </div>

          {/* Thread items */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">Loading conversations...</p>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-zinc-500 text-sm">
                  {search ? 'No tournaments match your search' : 'No conversations'}
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = thread.id === selectedId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => {
                      setSelectedId(thread.id);
                      setShowThreads(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-zinc-800/30 transition-colors ${
                      isActive
                        ? 'bg-red-500/10 border-l-2 border-l-red-500'
                        : 'hover:bg-zinc-800/40 border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Tournament icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-red-500/20' : 'bg-zinc-800/60'
                        }`}
                      >
                        <Trophy
                          className={`w-5 h-5 ${isActive ? 'text-red-400' : 'text-zinc-500'}`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span
                            className={`text-sm truncate ${
                              thread.unread > 0 ? 'font-bold text-white' : 'font-semibold text-white'
                            }`}
                          >
                            {thread.name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {thread.lastTimestamp && (
                              <span className="text-[11px] text-zinc-500">
                                {timeAgo(thread.lastTimestamp)}
                              </span>
                            )}
                          </div>
                        </div>
                        {thread.game && (
                          <p className="text-[11px] text-zinc-500 mb-1">{thread.game}</p>
                        )}
                        <div className="flex items-center justify-between gap-2">
                          {thread.lastMessage ? (
                            <p
                              className={`text-xs truncate ${
                                thread.unread > 0 ? 'text-zinc-300 font-medium' : 'text-zinc-400'
                              }`}
                            >
                              {thread.lastSender && (
                                <span className="text-zinc-500">{thread.lastSender}: </span>
                              )}
                              {thread.lastMessage}
                            </p>
                          ) : (
                            <p className="text-xs text-zinc-600 italic">No messages yet</p>
                          )}
                          {/* Unread indicator */}
                          {thread.unread > 0 && (
                            <span className="flex-shrink-0 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1.5">
                              {thread.unread > 99 ? '99+' : thread.unread}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Live status indicator */}
                      {thread.status === 'live' && (
                        <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* Chat panel */}
        {/* --------------------------------------------------------------- */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            !selectedId && showThreads ? 'hidden md:flex' : 'flex'
          }`}
        >
          {!selectedTournament ? (
            /* No thread selected */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Select a tournament to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/80 flex-shrink-0">
                {/* Back button (mobile) */}
                <button
                  onClick={() => {
                    setShowThreads(true);
                    setSelectedId(null);
                  }}
                  className="md:hidden p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-bold text-sm truncate">
                    {selectedTournament.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    {selectedTournament.game && <span>{selectedTournament.game}</span>}
                    {selectedTournament.status && (
                      <>
                        <span className="text-zinc-700">|</span>
                        <span
                          className={
                            selectedTournament.status === 'live'
                              ? 'text-green-400'
                              : selectedTournament.status === 'completed'
                              ? 'text-zinc-400'
                              : 'text-amber-400'
                          }
                        >
                          {selectedTournament.status.charAt(0).toUpperCase() +
                            selectedTournament.status.slice(1)}
                        </span>
                      </>
                    )}
                    <span className="text-zinc-700">|</span>
                    <Users className="w-3 h-3 inline" />
                    <span>{chatMessages.length} messages</span>
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500 text-sm">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => {
                    const isOwn = msg.sender_id === userId;
                    const showDate =
                      idx === 0 ||
                      new Date(msg.timestamp).toDateString() !==
                        new Date(chatMessages[idx - 1]?.timestamp).toDateString();

                    return (
                      <React.Fragment key={idx}>
                        {showDate && msg.timestamp && (
                          <div className="flex justify-center my-4">
                            <span className="text-[11px] text-zinc-600 bg-zinc-800/60 px-3 py-1 rounded-full">
                              {new Date(msg.timestamp).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? 'bg-red-600 text-white rounded-br-md'
                                : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                            }`}
                          >
                            {/* Sender info */}
                            {!isOwn && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-zinc-300">
                                  {msg.sender_name || msg.sender_brand || 'Unknown'}
                                </span>
                                {msg.sender_role && <RoleBadge role={msg.sender_role} />}
                              </div>
                            )}

                            {/* Message text */}
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {msg.message || msg.content}
                            </p>

                            {/* Timestamp */}
                            <p
                              className={`text-[10px] mt-1 ${
                                isOwn ? 'text-red-200/50 text-right' : 'text-zinc-500'
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="px-4 py-3 border-t border-zinc-800/60 bg-zinc-900/80 flex-shrink-0">
                <div className="flex items-end gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={sendMutation.isPending}
                    className="flex-1 bg-zinc-800/60 border border-zinc-700/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sendMutation.isPending}
                    className="p-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
