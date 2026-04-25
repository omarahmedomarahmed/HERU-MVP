// reviewed 2026-04-25
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { apiCall } from '@/api/heruClient';

export default function SupportChat({ accentColor = '#ef4444' }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'staff', text: 'Hi! How can we help you today?', time: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    const userMsg = { from: 'me', text, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);
    try {
      await apiCall('/support/chat', { method: 'POST', body: { message: text } });
      setMessages(prev => [...prev, {
        from: 'staff',
        text: "Thanks! Our team will follow up shortly. You can also email us at support@heru.gg",
        time: new Date().toISOString(),
      }]);
    } catch {
      // silently fail — message was optimistically shown
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
        style={{ backgroundColor: accentColor }}
        aria-label="Support chat"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-h-[420px] flex flex-col rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-800" style={{ backgroundColor: accentColor + '22' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: accentColor }}>
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold">HERU Support</p>
              <p className="text-gray-400 text-xs">Typically replies in minutes</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0" style={{ maxHeight: 280 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.from === 'me'
                      ? 'text-white'
                      : 'bg-zinc-800 text-gray-200'
                  }`}
                  style={msg.from === 'me' ? { backgroundColor: accentColor } : {}}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-zinc-800 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-current"
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending}
              className="px-3 py-2 rounded-xl text-white transition-colors disabled:opacity-40"
              style={{ backgroundColor: accentColor }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
