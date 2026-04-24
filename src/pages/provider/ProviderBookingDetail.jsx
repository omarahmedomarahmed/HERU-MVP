import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle, Loader2, Folder, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const FILE_FOLDERS = ['Tournament Branding', 'Organizer Branding', 'Social Media', 'Deliverables'];

const STATUS_STYLES = {
  pending:   'bg-yellow-500/20 text-yellow-400',
  accepted:  'bg-green-500/20 text-green-400',
  rejected:  'bg-red-500/20 text-red-400',
  completed: 'bg-gray-500/20 text-gray-400',
};

export default function ProviderBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [actioning, setActioning] = useState('');
  const [tab, setTab] = useState('chat');
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch(`/api/service-bookings/${id}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    })
      .then(r => r.json())
      .then(d => setBooking(d.booking || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [booking?.chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/service-bookings/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ message: message.trim() })
      });
      const data = await res.json();
      if (res.ok) { setBooking(b => ({ ...b, chat: data.chat })); setMessage(''); }
    } catch {} finally { setSending(false); }
  };

  const handleAction = async (action) => {
    setActioning(action);
    try {
      const res = await fetch(`/api/service-bookings/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const statusMap = { accept: 'accepted', reject: 'rejected', complete: 'completed' };
        setBooking(b => ({ ...b, status: statusMap[action] }));
      }
    } catch {} finally { setActioning(''); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" /></div>;
  if (!booking) return <div className="text-center py-16 text-gray-500"><p>Booking not found</p></div>;

  const isProvider = booking.provider_id === userProfile?.id;
  const chat = booking.chat || [];
  const files = booking.file_library || [];

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/provider/bookings')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </button>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">{booking.services?.title || 'Service Booking'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{booking.tournament_name || 'No tournament'}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span>EGP {Number(booking.price).toLocaleString()} total</span>
            <span>· Net to you: EGP {Number(booking.net_to_provider).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[booking.status] || 'bg-gray-500/20 text-gray-400'}`}>
            {booking.status}
          </span>
          {isProvider && booking.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={() => handleAction('accept')} disabled={!!actioning} className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                {actioning === 'accept' ? '...' : 'Accept'}
              </button>
              <button onClick={() => handleAction('reject')} disabled={!!actioning} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                {actioning === 'reject' ? '...' : 'Reject'}
              </button>
            </div>
          )}
          {isProvider && booking.status === 'accepted' && (
            <button onClick={() => handleAction('complete')} disabled={!!actioning} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {actioning === 'complete' ? '...' : 'Mark Complete'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {[{ id: 'chat', label: 'Chat', icon: MessageSquare }, { id: 'files', label: 'File Library', icon: Folder }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-gray-400 hover:text-white'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {chat.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">No messages yet. Start the conversation.</p>
            )}
            {chat.map((msg, i) => {
              const isMe = msg.sender_id === userProfile?.id;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-emerald-600 text-white' : 'bg-white/10 text-gray-200'}`}>
                    {!isMe && <p className="text-xs text-gray-400 mb-1">{msg.sender_name || 'Organizer'}</p>}
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1 text-right">{msg.created_at ? new Date(msg.created_at).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-white/10 p-3 flex gap-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type a message..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1"
            />
            <button onClick={sendMessage} disabled={sending || !message.trim()} className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {tab === 'files' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {FILE_FOLDERS.map(folder => {
            const folderFiles = files.filter(f => f.folder === folder);
            return (
              <div key={folder} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-emerald-400" /> {folder}
                </h3>
                {folderFiles.length === 0 ? (
                  <p className="text-gray-600 text-xs">No files yet</p>
                ) : (
                  <ul className="space-y-1">
                    {folderFiles.map((f, i) => (
                      <li key={i}>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-xs truncate block">
                          {f.name || f.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
