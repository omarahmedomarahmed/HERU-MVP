import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import {
  CheckCircle, XCircle, Briefcase, BadgeCheck, Trophy, Users, Layers, X,
} from 'lucide-react';
import StaffPageHeader from '@/components/staff/StaffPageHeader';
import StaffBadge from '@/components/staff/StaffBadge';
import StaffTable from '@/components/staff/StaffTable';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtEGP(n) {
  return `EGP ${(n || 0).toLocaleString('en-EG')}`;
}

// ---------------------------------------------------------------------------
// Inline reject flow state
// ---------------------------------------------------------------------------

function RejectModal({ title, onCancel, onConfirm, isPending }) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#111111] border border-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-semibold text-zinc-100 mb-1">Reject: {title}</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Optionally provide a reason. This will be sent to the requester.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Rejection reason (optional)..."
          rows={3}
          className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium border border-[#2a2a2a] text-zinc-400 hover:text-zinc-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {isPending ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Action buttons helper
// ---------------------------------------------------------------------------

function ApproveRejectButtons({ onApprove, onReject, approving }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onApprove}
        disabled={approving}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition disabled:opacity-50"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Approve
      </button>
      <button
        onClick={onReject}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
      >
        <XCircle className="w-3.5 h-3.5" />
        Reject
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab panel: Service Providers
// ---------------------------------------------------------------------------

function ProvidersTab() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-approvals-providers'],
    queryFn: () => apiCall('/providers?approval_status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  const providers = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw?.data || raw?.providers || [];
    return arr.filter((p) => !p.approval_status || p.approval_status === 'pending');
  }, [raw]);

  const approveMutation = useMutation({
    mutationFn: (id) => apiCall(`/providers/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-approvals-providers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiCall(`/providers/${id}/reject`, { method: 'PUT', body: { reason } }),
    onSuccess: () => {
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff-approvals-providers'] });
    },
  });

  const columns = [
    {
      key: 'name',
      label: 'Provider Name',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-zinc-100">{row.business_name || row.full_name || '—'}</p>
          <p className="text-xs text-zinc-500">{row.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="text-sm text-zinc-300 capitalize">{row.category || row.service_category || '—'}</span>,
    },
    {
      key: 'bio',
      label: 'Bio',
      render: (row) => (
        <span className="text-sm text-zinc-500 line-clamp-2 max-w-xs">
          {row.bio || row.description || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (row) => <span className="text-sm text-zinc-500">{fmtDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <ApproveRejectButtons
          approving={approveMutation.isPending}
          onApprove={() => approveMutation.mutate(row.id)}
          onReject={() => setRejectTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <StaffTable
        columns={columns}
        data={providers}
        loading={isLoading}
        emptyMessage="No pending provider approvals."
      />
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.business_name || rejectTarget.full_name || 'Provider'}
          isPending={rejectMutation.isPending}
          onCancel={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab panel: Service Listings
// ---------------------------------------------------------------------------

function ServicesTab() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-approvals-services'],
    queryFn: () => apiCall('/services?status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  const services = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw?.data || raw?.services || [];
    return arr;
  }, [raw]);

  const approveMutation = useMutation({
    mutationFn: (id) => apiCall(`/services/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-approvals-services'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiCall(`/services/${id}/reject`, { method: 'PUT', body: { reason } }),
    onSuccess: () => {
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff-approvals-services'] });
    },
  });

  const columns = [
    {
      key: 'provider',
      label: 'Provider',
      render: (row) => (
        <span className="text-sm text-zinc-300">
          {row.provider_name || row.provider?.business_name || row.provider_id?.slice(0, 8) || '—'}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-zinc-100">{row.title || '—'}</p>
          <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">{row.description || ''}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => <span className="text-sm text-zinc-300 capitalize">{row.category || '—'}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span className="text-sm font-medium text-zinc-100">{fmtEGP(row.price)}</span>,
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (row) => <span className="text-sm text-zinc-500">{fmtDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <ApproveRejectButtons
          approving={approveMutation.isPending}
          onApprove={() => approveMutation.mutate(row.id)}
          onReject={() => setRejectTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <StaffTable
        columns={columns}
        data={services}
        loading={isLoading}
        emptyMessage="No pending service listings."
      />
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.title || 'Service'}
          isPending={rejectMutation.isPending}
          onCancel={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab panel: Organizer Verifications
// ---------------------------------------------------------------------------

function VerificationsTab() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-approvals-verifications'],
    queryFn: () => apiCall('/organizer-verifications?status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  const verifications = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw?.data || raw?.verifications || [];
    return arr;
  }, [raw]);

  const approveMutation = useMutation({
    mutationFn: (id) => apiCall(`/organizer-verifications/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-approvals-verifications'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiCall(`/organizer-verifications/${id}/reject`, { method: 'PUT', body: { reason } }),
    onSuccess: () => {
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff-approvals-verifications'] });
    },
  });

  const columns = [
    {
      key: 'organizer',
      label: 'Organizer',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-zinc-100">
            {row.organizer_name || row.full_name || row.organizer_email || '—'}
          </p>
          <p className="text-xs text-zinc-500">{row.organizer_email || row.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'brand_name',
      label: 'Brand',
      render: (row) => <span className="text-sm text-zinc-300">{row.brand_name || '—'}</span>,
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (row) => <span className="text-sm text-zinc-500">{fmtDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <ApproveRejectButtons
          approving={approveMutation.isPending}
          onApprove={() => approveMutation.mutate(row.id)}
          onReject={() => setRejectTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <StaffTable
        columns={columns}
        data={verifications}
        loading={isLoading}
        emptyMessage="No pending organizer verifications."
      />
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.brand_name || rejectTarget.organizer_email || 'Organizer'}
          isPending={rejectMutation.isPending}
          onCancel={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab panel: Teams
// ---------------------------------------------------------------------------

function TeamsTab() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-approvals-teams'],
    queryFn: () => apiCall('/teams?status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  const teams = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw?.data || raw?.teams || [];
    return arr;
  }, [raw]);

  const approveMutation = useMutation({
    mutationFn: (id) => apiCall(`/teams/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-approvals-teams'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiCall(`/teams/${id}/reject`, { method: 'PUT', body: { reason } }),
    onSuccess: () => {
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff-approvals-teams'] });
    },
  });

  const columns = [
    {
      key: 'name',
      label: 'Team Name',
      render: (row) => <span className="text-sm font-medium text-zinc-100">{row.name || '—'}</span>,
    },
    {
      key: 'leader',
      label: 'Leader',
      render: (row) => (
        <span className="text-sm text-zinc-300">
          {row.leader_name || row.leader?.full_name || row.leader_id?.slice(0, 8) || '—'}
        </span>
      ),
    },
    {
      key: 'members',
      label: 'Members',
      render: (row) => (
        <span className="text-sm text-zinc-400">
          {row.members?.length ?? row.members_count ?? '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (row) => <span className="text-sm text-zinc-500">{fmtDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <ApproveRejectButtons
          approving={approveMutation.isPending}
          onApprove={() => approveMutation.mutate(row.id)}
          onReject={() => setRejectTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <StaffTable
        columns={columns}
        data={teams}
        loading={isLoading}
        emptyMessage="No pending team approvals."
      />
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.name || 'Team'}
          isPending={rejectMutation.isPending}
          onCancel={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab panel: Tournaments
// ---------------------------------------------------------------------------

function TournamentsTab() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-approvals-tournaments'],
    queryFn: () => apiCall('/tournaments?status=pending'),
    staleTime: 30_000,
    retry: 1,
  });

  const tournaments = useMemo(() => {
    const arr = Array.isArray(raw) ? raw : raw?.data || raw?.tournaments || [];
    return arr;
  }, [raw]);

  const approveMutation = useMutation({
    mutationFn: (id) =>
      apiCall(`/tournaments/${id}/approve`, { method: 'PUT', body: { status: 'published' } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-approvals-tournaments'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) =>
      apiCall(`/tournaments/${id}/reject`, { method: 'PUT', body: { reason, status: 'rejected' } }),
    onSuccess: () => {
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff-approvals-tournaments'] });
    },
  });

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (row) => <span className="text-sm font-medium text-zinc-100">{row.title || row.name || '—'}</span>,
    },
    {
      key: 'game',
      label: 'Game',
      render: (row) => (
        <span className="text-sm text-zinc-300">
          {row.game?.name || row.game_name || row.game_id || '—'}
        </span>
      ),
    },
    {
      key: 'organizer',
      label: 'Organizer',
      render: (row) => (
        <span className="text-sm text-zinc-300">
          {row.organizer?.name || row.organizer_name || row.organizer_id?.slice(0, 8) || '—'}
        </span>
      ),
    },
    {
      key: 'prize_pool',
      label: 'Prize Pool',
      render: (row) => (
        <span className="text-sm font-medium text-zinc-100">
          {row.prize_pool ? fmtEGP(row.prize_pool) : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Submitted',
      render: (row) => <span className="text-sm text-zinc-500">{fmtDate(row.created_at)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <ApproveRejectButtons
          approving={approveMutation.isPending}
          onApprove={() => approveMutation.mutate(row.id)}
          onReject={() => setRejectTarget(row)}
        />
      ),
    },
  ];

  return (
    <>
      <StaffTable
        columns={columns}
        data={tournaments}
        loading={isLoading}
        emptyMessage="No pending tournament approvals."
      />
      {rejectTarget && (
        <RejectModal
          title={rejectTarget.title || rejectTarget.name || 'Tournament'}
          isPending={rejectMutation.isPending}
          onCancel={() => setRejectTarget(null)}
          onConfirm={(reason) => rejectMutation.mutate({ id: rejectTarget.id, reason })}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab count badge
// ---------------------------------------------------------------------------

function TabCountBadge({ count, active }) {
  if (!count) return null;
  return (
    <span
      className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-semibold ${
        active
          ? 'bg-white/20 text-white'
          : 'bg-amber-500/20 text-amber-400'
      }`}
    >
      {count}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  {
    key: 'providers',
    label: 'Service Providers',
    icon: Briefcase,
    queryKey: 'staff-approvals-providers',
    countField: 'providers',
  },
  {
    key: 'services',
    label: 'Service Listings',
    icon: Layers,
    queryKey: 'staff-approvals-services',
    countField: 'services',
  },
  {
    key: 'verifications',
    label: 'Org. Verifications',
    icon: BadgeCheck,
    queryKey: 'staff-approvals-verifications',
    countField: 'verifications',
  },
  {
    key: 'teams',
    label: 'Teams',
    icon: Users,
    queryKey: 'staff-approvals-teams',
    countField: 'teams',
  },
  {
    key: 'tournaments',
    label: 'Tournaments',
    icon: Trophy,
    queryKey: 'staff-approvals-tournaments',
    countField: 'tournaments',
  },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('providers');

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

  // Get tab counts from cached query data
  function getTabCount(tab) {
    const cached = queryClient.getQueryData([tab.queryKey]);
    if (!cached) return 0;
    const arr = Array.isArray(cached) ? cached : cached?.data || [];
    return arr.length;
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <StaffPageHeader
          title="Approvals"
          subtitle="Review and action all pending requests"
        />

        {/* Tab pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            const count = getTabCount(tab);
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100 hover:border-[#2a2a2a]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <TabCountBadge count={count} active={active} />
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'providers'     && <ProvidersTab />}
        {activeTab === 'services'      && <ServicesTab />}
        {activeTab === 'verifications' && <VerificationsTab />}
        {activeTab === 'teams'         && <TeamsTab />}
        {activeTab === 'tournaments'   && <TournamentsTab />}

      </div>
    </div>
  );
}
