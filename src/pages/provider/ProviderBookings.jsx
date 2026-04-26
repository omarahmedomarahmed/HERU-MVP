import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Filter, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const STATUS_STYLES = {
  pending:   { cls: 'bg-yellow-500/20 text-yellow-400', label: 'Pending' },
  accepted:  { cls: 'bg-green-500/20 text-green-400', label: 'Active' },
  rejected:  { cls: 'bg-red-500/20 text-red-400', label: 'Rejected' },
  completed: { cls: 'bg-gray-500/20 text-gray-400', label: 'Completed' },
  cancelled: { cls: 'bg-red-500/20 text-red-400', label: 'Cancelled' },
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actioning, setActioning] = useState('');

  useEffect(() => {
    fetch('/api/service-bookings', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    })
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const handleAction = async (id, action) => {
    setActioning(id + action);
    try {
      const res = await fetch(`/api/service-bookings/${id}/${action}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        setBookings(bs => bs.map(b => b.id === id ? { ...b, status: action === 'accept' ? 'accepted' : 'rejected' } : b));
      }
    } catch {}
    finally { setActioning(''); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <p className="text-gray-400 mt-1">Manage your service booking requests</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['all', 'pending', 'accepted', 'completed', 'rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <span className="capitalize">{s}</span>
            <span className="ml-1.5 text-xs opacity-70">
              {s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-40" />
          <p className="text-gray-400">No {filter === 'all' ? '' : filter} bookings</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(b => {
            const st = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
            return (
              <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{b.services?.title || 'Service Booking'}</p>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {b.tournament_name ? `For: ${b.tournament_name}` : 'No tournament specified'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                      <span>EGP {Number(b.price).toLocaleString()} total</span>
                      <span>· Net: EGP {Number(b.net_to_provider).toLocaleString()}</span>
                      <span>· {new Date(b.created_at).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    {b.notes && <p className="text-gray-500 text-xs mt-1.5 line-clamp-1">"{b.notes}"</p>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${st.cls}`}>{st.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/provider/bookings/${b.id}`} className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-xs font-medium transition-colors">
                    View Details
                  </Link>
                  {b.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAction(b.id, 'accept')}
                        disabled={!!actioning}
                        className="px-3 py-1.5 bg-green-600/80 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {actioning === b.id + 'accept' ? '...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleAction(b.id, 'reject')}
                        disabled={!!actioning}
                        className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {actioning === b.id + 'reject' ? '...' : 'Reject'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
