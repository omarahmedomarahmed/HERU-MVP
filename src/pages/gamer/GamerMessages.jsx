import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import { Send, MessageCircle, Loader2 } from 'lucide-react';

export default function GamerMessages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const { data: rawConversations = [], isLoading: cLoading } = useQuery({
    queryKey: ['dm-conversations', user?.id],
    queryFn: () => apiCall('/direct-messages/conversations'),
    enabled: !!user?.id,
    staleTime: 15_000,
    refetchInterval: 15_000,
  });

  const { data: rawThread = [], isLoading: tLoading } = useQuery({
    queryKey: ['dm-thread', user?.id, selectedPartner],
    queryFn: () => apiCall(`/direct-messages/${selectedPartner}`),
    enabled: !!user?.id && !!selectedPartner,
    staleTime: 5_000,
    refetchInterval: 5_000,
  });

  const conversations = Array.isArray(rawConversations) ? rawConversations : rawConversations.data || [];
  const thread = Array.isArray(rawThread) ? rawThread : rawThread.data || [];

  const sendMutation = useMutation({
    mutationFn: ({ recipient_id, content }) =>
      apiCall('/direct-messages', { method: 'POST', body: { recipient_id, content } }),
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['dm-thread', user?.id, selectedPartner] });
      queryClient.invalidateQueries({ queryKey: ['dm-conversations'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  function handleSend() {
    if (!messageInput.trim() || !selectedPartner) return;
    sendMutation.mutate({ recipient_id: selectedPartner, content: messageInput.trim() });
  }

  return (
    <div className="h-[600px] flex rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-white">Messages</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          {cLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No conversations yet</p>
            </div>
          ) : conversations.map((conv) => (
            <button
              key={conv.partner_id}
              onClick={() => setSelectedPartner(conv.partner_id)}
              className={`w-full text-left p-4 hover:bg-zinc-800 transition-colors ${selectedPartner === conv.partner_id ? 'bg-zinc-800' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {conv.partner_id?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{conv.partner_id?.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-500 truncate">{conv.last_message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col">
        {!selectedPartner ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-zinc-800">
              <p className="text-sm font-bold text-white">{selectedPartner?.slice(0, 8)}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {tLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                </div>
              ) : thread.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${isOwn ? 'bg-red-600 text-white rounded-br-sm' : 'bg-zinc-800 text-gray-200 rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-zinc-800 flex gap-2">
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
              <button
                onClick={handleSend}
                disabled={!messageInput.trim() || sendMutation.isPending}
                className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
