import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Loader2, User, ChevronDown } from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function apiFetch(path, options = {}) {
  const { supabase } = await import('@/lib/supabase');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-white/10 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-red-600' : 'bg-purple-600'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-red-600/20 border border-red-600/30 text-white rounded-tr-sm'
          : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
      }`}>
        {isUser
          ? <span>{msg.content}</span>
          : <span dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
        }
        {msg.timestamp && (
          <div className={`text-xs mt-1 opacity-50 ${isUser ? 'text-right' : ''}`}>
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot size={16} />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  'What tournaments are currently active?',
  'How do I join a team?',
  'Show me my profile stats',
  'How does the prizepool work?',
];

export default function AiAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { if (!loading) scrollToBottom(); }, [messages, loading]);

  function scrollToBottom() { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await apiFetch('/api/ai-agent/session');
      setMessages((data.messages || []).map((m, i) => ({ id: i, role: m.role, content: m.content, timestamp: m.timestamp })));
    } catch {
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function sendMessage(text) {
    const msg = text.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() }]);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/ai-agent/message', { method: 'POST', body: JSON.stringify({ message: msg }) });
      let content = data.response || "I'm not sure how to help with that. Try asking something else!";
      if (data.requiresConfirmation) content += '\n\n*(This action requires confirmation — reply **confirm** to proceed or **cancel** to abort.)*';
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content, timestamp: new Date().toISOString() }]);
    } catch (err) {
      setError(err.message.includes('401') ? 'Please log in to use HERU AI.' : err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function clearHistory() {
    if (!window.confirm('Clear all conversation history?')) return;
    try { await apiFetch('/api/ai-agent/session', { method: 'DELETE' }); setMessages([]); } catch {}
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const isEmpty = !historyLoading && messages.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg">HERU AI Assistant</h1>
            <p className="text-xs text-gray-400">Powered by Claude • Ask anything about HERU.gg</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearHistory} className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
            <Trash2 size={14} /> Clear
          </button>
        )}
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ minHeight: 0 }}>
        {historyLoading ? (
          <div className="flex items-center justify-center h-32"><Loader2 size={24} className="animate-spin text-purple-400" /></div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600/30 to-red-600/30 border border-purple-500/30 flex items-center justify-center mb-4">
              <Bot size={28} className="text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">How can I help you?</h2>
            <p className="text-gray-400 text-sm max-w-xs mb-8">Ask me about tournaments, teams, your stats, or how to use HERU.gg</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map(q => (
                <button key={q} onClick={() => sendMessage(q)} className="text-left text-sm px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-colors text-gray-300 hover:text-white">{q}</button>
              ))}
            </div>
          </div>
        ) : messages.map(msg => <Message key={msg.id} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button onClick={scrollToBottom} className="fixed bottom-24 right-6 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shadow-lg transition-colors z-10">
          <ChevronDown size={18} />
        </button>
      )}

      {error && (
        <div className="mx-4 mb-2 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>
      )}

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ask HERU AI anything…" rows={1} disabled={loading}
            className="flex-1 bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 resize-none transition-colors"
            style={{ maxHeight: '120px', overflowY: 'auto' }} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">Press Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  );
}
