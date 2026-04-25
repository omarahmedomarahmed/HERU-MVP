import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import {
  Briefcase, Search, Inbox, CheckCircle, XCircle, Star,
} from 'lucide-react';

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

const STATUS_STYLE = {
  pending:  'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-600',
};

export default function StaffMarketplace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: rawServices = [], isLoading } = useQuery({
    queryKey: ['staff-services'],
    queryFn: () => apiCall('/services'),
    staleTime: 30_000,
  });

  const services = Array.isArray(rawServices) ? rawServices : rawServices.data || [];

  const approveMutation = useMutation({
    mutationFn: (id) => apiCall(`/services/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-services'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiCall(`/services/${id}/reject`, { method: 'PUT', body: { reason: 'Does not meet platform standards' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-services'] }),
  });

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(s.title || '').toLowerCase().includes(q) &&
            !(s.category || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [services, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    const c = { all: services.length, pending: 0, approved: 0, rejected: 0 };
    services.forEach((s) => { if (c[s.status] !== undefined) c[s.status]++; });
    return c;
  }, [services]);

  return (
    <div>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve service provider listings. Approved services appear in the Tournament Builder.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s} {counts[s] > 0 && <span className="ml-1 text-xs opacity-70">({counts[s]})</span>}
            </button>
          ))}
          <div className="ml-auto relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading services...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No services found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((svc) => (
                    <tr key={svc.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{svc.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{svc.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                          {svc.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-900 font-medium">{formatEGP(svc.price)}</td>
                      <td className="px-6 py-3.5">
                        {svc.rating ? (
                          <span className="flex items-center gap-1 text-sm text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {svc.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[svc.status] || 'bg-gray-100 text-gray-600'}`}>
                          {svc.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {svc.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveMutation.mutate(svc.id)}
                              disabled={approveMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(svc.id)}
                              disabled={rejectMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                        {svc.status === 'approved' && (
                          <span className="text-xs text-gray-400">Live</span>
                        )}
                        {svc.status === 'rejected' && (
                          <span className="text-xs text-gray-400">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
