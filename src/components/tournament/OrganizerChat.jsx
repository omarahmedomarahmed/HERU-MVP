import React, { useState, useRef, useEffect } from 'react';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Lock } from 'lucide-react';

export default function OrganizerChat({ tournament, currentUser, senderBrand, onSendMessage, isLoading }) {
  const [msg, setMsg] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tournament?.organizer_chat]);

  const handleSend = () => {
    if (!msg.trim()) return;
    onSendMessage(msg.trim());
    setMsg('');
  };

  return (
    <FloatingPanel className="p-5">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-red-400" />
        Organizer Chat
        <span className="text-xs text-gray-500 font-normal ml-1">— visible to main organizer &amp; co-organizers only</span>
      </h3>

      <div className="h-80 overflow-y-auto bg-zinc-950 rounded-xl p-4 space-y-3 mb-4">
        {!tournament?.organizer_chat?.length && (
          <p className="text-gray-600 text-sm text-center py-8">No messages yet. Start the conversation!</p>
        )}
        {(tournament?.organizer_chat || []).map((m, i) => {
          const isMe = m.sender_id === currentUser?.id;
          return (
            <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${isMe ? 'bg-red-600 text-white' : 'bg-zinc-800 text-gray-200'}`}>
                <p className="text-[10px] opacity-60 mb-1">
                  {m.sender_name}{m.sender_brand ? ` · ${m.sender_brand}` : ''} · {m.sender_role}
                </p>
                <p className="text-sm leading-relaxed">{m.message}</p>
                <p className="text-[10px] opacity-40 mt-1 text-right">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <Input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="bg-zinc-800 border-zinc-700 text-white"
        />
        <GlowButton size="sm" onClick={handleSend} disabled={!msg.trim() || isLoading}>
          <Send className="w-4 h-4" />
        </GlowButton>
      </div>
    </FloatingPanel>
  );
}

export function OrganizerChatLocked() {
  return (
    <FloatingPanel className="p-8 text-center">
      <Lock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
      <p className="text-white font-bold mb-1">Organizer Chat Locked</p>
      <p className="text-gray-400 text-sm">Complete your payment to unlock co-organizer access and join this chat.</p>
    </FloatingPanel>
  );
}