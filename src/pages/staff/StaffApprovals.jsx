import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import {
  CheckCircle, XCircle, Clock, Search, Users, Trophy,
  Sparkles, AlertTriangle, ChevronDown, Inbox, Briefcase, BadgeCheck,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const TYPE_CONFIG = {
  team_join: {
    label: 'Team Join',
    color: 'bg-red-50 text-red-700',
    icon: Users,
  },
  tournament_publish: {
    label: 'Tournament Publish',
    color: 'bg-violet-50 text-violet-700',
    icon: Trophy,
  },
  talent_application: {
    label: 'Talent Application',
    color: 'bg-amber-50 text-amber-700',
    icon: Sparkles,
  },
  service_provider: {
    label: 'Service Provider',
    color: 'bg-cyan-50 text-cyan-700',
    icon: Briefcase,
  },
  organizer_verification: {
    label: 'Organizer Verification',
    color: 'bg-purple-50 text-purple-700',
    icon: BadgeCheck,
  },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || { label: type, color: 'bg-gray-100 text-gray-600', icon: AlertTriangle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status || 'unknown'}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Staff guard
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Fetch approvals
  const { data: rawApprovals, isLoading } = useQuery({
    queryKey: ['staff-approvals'],
    queryFn: () => apiCall('/approvals'),
    staleTime: 30_000,
    retry: 1,
  });

  // Fetch pending services (provider service approvals)
  const { data: rawServices } = useQuery({
    queryKey: ['staff-pending-services'],
    queryFn: () => apiCall('/services?status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  // Fetch pending organizer verifications
  const { data: rawVerifications } = useQuery({
    queryKey: ['staff-pending-verifications'],
    queryFn: () => apiCall('/organizer-verifications?status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  const approvals = useMemo(() => {
    if (Array.isArray(rawApprovals)) return rawApprovals;
    return rawApprovals?.data || [];
  }, [rawApprovals]);

  const pendingServices = useMemo(() => {
    if (Array.isArray(rawServices)) return rawServices;
    return rawServices?.data || [];
  }, [rawServices]);

  const pendingVerifications = useMemo(() => {
    if (Array.isArray(rawVerifications)) return rawVerifications;
    return rawVerifications?.data || [];
  }, [rawVerifications]);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id) => apiCall(`/approvals/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-approvals'] }),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, rejection_reason }) =>
      apiCall(`/approvals/${id}/reject`, {
        method: 'PUT',
        body: { rejection_reason },
      }),
    onSuccess: () => {
      setRejectingId(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['staff-approvals'] });
    },
  });

  // Approve service mutation
  const approveServiceMutation = useMutation({
    mutationFn: (id) => apiCall(`/services/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-pending-services'] }),
  });

  // Reject service mutation
  const rejectServiceMutation = useMutation({
    mutationFn: ({ id, reason }) => apiCall(`/services/${id}/reject`, { method: 'PUT', body: { reason } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-pending-services'] }),
  });

  // Approve verification mutation
  const approveVerificationMutation = useMutation({
    mutationFn: (id) => apiCall(`/organizer-verifications/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-pending-verifications'] }),
  });

  // Reject verification mutation
  const rejectVerificationMutation = useMutation({
    mutationFn: ({ id, reason }) => apiCall(`/organizer-verifications/${id}/reject`, { method: 'PUT', body: { reason } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-pending-verifications'] }),
  });

  // Filter by tab and search
  const filtered = useMemo(() => {
    return approvals.filter((a) => {
      if (a.status !== activeTab) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = (a.requester_name || '').toLowerCase().includes(q);
        const matchEmail = (a.requester_email || '').toLowerCase().includes(q);
        const matchRef = (a.reference_name || '').toLowerCase().includes(q);
        const matchType = (a.approval_type || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRef && !matchType) return false;
      }
      return true;
    });
  }, [approvals, activeTab, searchQuery]);

  // Tab counts
  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    approvals.forEach((a) => {
      if (c[a.status] !== undefined) c[a.status]++;
    });
    return c;
  }, [approvals]);

  const tabs = [
    { key: 'pending', label: 'Pending', icon: Clock, count: counts.pending },
    { key: 'approved', label: 'Approved', icon: CheckCircle, count: counts.approved },
    { key: 'rejected', label: 'Rejected', icon: XCircle, count: counts.rejected },
    { key: 'services', label: 'Service Providers', icon: Briefcase, count: pendingServices.length },
    { key: 'verifications', label: 'Org. Verification', icon: BadgeCheck, count: pendingVerifications.length },
  ];

  function handleApprove(id) {
    if (approveMutation.isPending) return;
    approveMutation.mutate(id);
  }

  function handleRejectConfirm() {
    if (!rejectingId || rejectMutation.isPending) return;
    rejectMutation.mutate({ id: rejectingId, rejection_reason: rejectionReason });
  }

  return (
    <StaffLayout>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage team joins, tournament publish requests, service providers, and organizer verifications
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-1 text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-5 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or reference..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Table — only show for status-based tabs */}
        {!['services', 'verifications'].includes(activeTab) && <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading approvals...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {searchQuery ? 'No approvals match your search.' : `No ${activeTab} approvals.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    {activeTab === 'pending' && (
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    )}
                    {activeTab === 'rejected' && (
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3.5">
                        <TypeBadge type={a.approval_type} />
                      </td>
                      <td className="px-6 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.requester_name || '-'}</p>
                          <p className="text-xs text-gray-400">{a.requester_email || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[200px]">
                        {a.reference_name || a.reference_id?.slice(0, 8) || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-500">
                        {formatDate(a.created_at)}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={a.status} />
                      </td>
                      {activeTab === 'pending' && (
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(a.id)}
                              disabled={approveMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => { setRejectingId(a.id); setRejectionReason(''); }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        </td>
                      )}
                      {activeTab === 'rejected' && (
                        <td className="px-6 py-3.5 text-sm text-gray-500 truncate max-w-[200px]">
                          {a.rejection_reason || '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>}

        {/* Service Providers Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {pendingServices.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No pending service approvals.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (EGP)</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingServices.map((svc) => (
                      <tr key={svc.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{svc.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{svc.description}</p>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 capitalize">{svc.category}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-900">EGP {(svc.price || 0).toLocaleString()}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(svc.created_at)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveServiceMutation.mutate(svc.id)}
                              disabled={approveServiceMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectServiceMutation.mutate({ id: svc.id, reason: 'Does not meet platform standards' })}
                              disabled={rejectServiceMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Organizer Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {pendingVerifications.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No pending organizer verifications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Organizer</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingVerifications.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{v.organizer_email || v.organizer_id?.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">{v.brand_name || '-'}</td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(v.created_at)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveVerificationMutation.mutate(v.id)}
                              disabled={approveVerificationMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectVerificationMutation.mutate({ id: v.id, reason: 'Insufficient documentation' })}
                              disabled={rejectVerificationMutation.isPending}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rejection modal */}
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setRejectingId(null)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Reject Approval</h3>
              <p className="text-sm text-gray-500 mb-4">
                Provide an optional reason for rejecting this request.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason (optional)..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
