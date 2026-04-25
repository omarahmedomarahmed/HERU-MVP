import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const STATUS = {
  approved: { label: 'Active', cls: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  pending:  { label: 'Pending Review', cls: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  rejected: { label: 'Rejected', cls: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services/mine', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    })
      .then(r => r.json())
      .then(d => setServices(d.services || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Services</h1>
          <p className="text-gray-400 mt-1">Services you offer to tournament organizers</p>
        </div>
        <Link
          to="/provider/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Service
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-40" />
          <p className="text-gray-400 mb-4">No services yet</p>
          <Link to="/provider/services/new" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add your first service
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(svc => {
            const statusKey = svc.status || (svc.is_approved ? 'approved' : 'pending');
            const st = STATUS[statusKey] || STATUS.pending;
            const Icon = st.icon;
            return (
              <div key={svc.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold">{svc.title}</h3>
                    <span className="bg-white/10 text-gray-400 px-2 py-0.5 rounded text-xs capitalize">{svc.category}</span>
                  </div>
                  {svc.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">{svc.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-medium text-white">EGP {Number(svc.price).toLocaleString()}</span>
                    <span className="capitalize">{svc.price_type?.replace('_', ' ')}</span>
                    {svc.total_bookings > 0 && <span>{svc.total_bookings} bookings</span>}
                    {svc.rating > 0 && <span>★ {Number(svc.rating).toFixed(1)}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
                    <Icon className="w-3.5 h-3.5" /> {st.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && services.some(s => s.status !== 'approved') && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          Services pending approval will be visible to organizers once the HERU team reviews them (usually within 24–48 hours).
        </div>
      )}
    </div>
  );
}
