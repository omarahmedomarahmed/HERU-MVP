import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { BookOpen, DollarSign, Star, AlertCircle, ArrowRight, Clock, CheckCircle } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

export default function ProviderDashboard() {
  const { userProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/providers/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }).then(r => r.json()),
      fetch('/api/service-bookings', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } }).then(r => r.json()),
    ])
      .then(([pData, bData]) => {
        setProfile(pData.profile || null);
        setBookings(bData.bookings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'accepted');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.net_to_provider || 0), 0);
  const isApproved = profile?.is_approved;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Provider Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back, {profile?.display_name || userProfile?.full_name || 'Provider'}
        </p>
      </div>

      {/* Approval notice */}
      {!loading && !isApproved && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium text-sm">Account pending approval</p>
            <p className="text-gray-400 text-xs mt-0.5">
              HERU staff are reviewing your profile. Once approved, your services will be visible to organizers.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-xs">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{pendingBookings.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-gray-400 text-xs">Active</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeBookings.length}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-gray-400 text-xs">Net Revenue</span>
          </div>
          <p className="text-xl font-bold text-white">EGP {totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400 text-xs">Rating</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {profile?.rating ? Number(profile.rating).toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link to="/provider/services/new" className="bg-emerald-600/20 border border-emerald-500/30 rounded-xl p-5 hover:bg-emerald-600/30 transition-colors flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Add New Service</p>
            <p className="text-gray-400 text-sm mt-0.5">List a service for organizers to book</p>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-400" />
        </Link>
        <Link to="/provider/bookings" className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">View Bookings</p>
            <p className="text-gray-400 text-sm mt-0.5">{pendingBookings.length} pending response</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Recent Bookings</h2>
          <Link to="/provider/bookings" className="text-emerald-400 hover:text-emerald-300 text-sm">View all →</Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">No bookings yet</p>
            <p className="text-gray-600 text-sm">Once your services are approved, organizers can book you here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map(b => (
              <Link key={b.id} to={`/provider/bookings/${b.id}`} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/8 transition-colors">
                <div>
                  <p className="text-white font-medium text-sm">{b.services?.title || 'Service Booking'}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {b.tournament_name || 'No tournament'} · EGP {Number(b.price).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                  b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  b.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {b.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
