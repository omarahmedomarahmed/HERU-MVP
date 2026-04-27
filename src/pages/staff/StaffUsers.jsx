import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search, ChevronLeft, ChevronRight,
  Eye, ShieldOff, Shield, ExternalLink, X,
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';
import StaffPageHeader from '@/components/staff/StaffPageHeader';
import StaffBadge from '@/components/staff/StaffBadge';
import StaffTable from '@/components/staff/StaffTable';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAGE_SIZE = 20;

const ROLE_TABS = [
  { value: 'gamer',            label: 'Gamers' },
  { value: 'organizer',        label: 'Organizers' },
  { value: 'sponsor',          label: 'Sponsors' },
  { value: 'service_provider', label: 'Providers' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// User detail modal
// ---------------------------------------------------------------------------

function UserModal({ user, onClose }) {
  if (!user) return null;

  const roleLabel = {
    gamer: 'Gamer',
    organizer: 'Organizer',
    sponsor: 'Sponsor',
    service_provider: 'Provider',
    admin: 'Admin',
  }[user.role] || user.role;

  const profilePath = {
    gamer: `/staff/gamers`,
    organizer: `/staff/organizers`,
    sponsor: `/staff/users`,
    service_provider: `/staff/services`,
  }[user.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111111] border border-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-md p-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xl font-bold shrink-0">
            {((user.full_name || user.email || '?').charAt(0)).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-100">{user.full_name || '—'}</p>
            <p className="text-sm text-zinc-500">{user.email || '—'}</p>
          </div>
        </div>

        {/* Details grid */}
        <dl className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <dt className="text-xs text-zinc-500 uppercase tracking-wider">Role</dt>
            <dd><StaffBadge status={user.role} /></dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-xs text-zinc-500 uppercase tracking-wider">Status</dt>
            <dd><StaffBadge status={user.disabled || user.is_banned ? 'banned' : 'active'} /></dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-xs text-zinc-500 uppercase tracking-wider">Joined</dt>
            <dd className="text-sm text-zinc-300">{fmtDate(user.created_at)}</dd>
          </div>
          {user.username_slug && (
            <div className="flex items-center justify-between">
              <dt className="text-xs text-zinc-500 uppercase tracking-wider">Username</dt>
              <dd className="text-sm text-zinc-300">@{user.username_slug}</dd>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center justify-between">
              <dt className="text-xs text-zinc-500 uppercase tracking-wider">Phone</dt>
              <dd className="text-sm text-zinc-300">{user.phone}</dd>
            </div>
          )}
        </dl>

        {/* Link to full profile */}
        {profilePath && (
          <a
            href={profilePath}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#2a2a2a] text-sm text-zinc-400 hover:text-zinc-100 hover:border-[#3a3a3a] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View {roleLabel} Profile
          </a>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeRole, setActiveRole] = useState('gamer');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

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

  // Reset page when filters change
  React.useEffect(() => { setPage(1); }, [activeRole, search]);

  // Fetch users
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['staff-users', activeRole, search, page],
    queryFn: () =>
      apiCall(`/staff/users?role=${activeRole}&search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}`),
    staleTime: 30_000,
    retry: 1,
  });

  const users = Array.isArray(rawData) ? rawData : rawData?.data || rawData?.users || [];
  const total = rawData?.total ?? users.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Ban/Unban
  const banMutation = useMutation({
    mutationFn: ({ userId, banned }) =>
      apiCall(`/staff/users/${userId}/ban`, { method: 'PUT', body: { banned } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-users'] }),
  });

  // Impersonate
  const handleImpersonate = async (userId) => {
    try {
      const res = await apiCall(`/staff/impersonate/${userId}`, { method: 'POST' });
      const token = res?.token || res?.impersonate_token;
      if (token) {
        window.open(`/?impersonate_token=${token}`, '_blank');
      }
    } catch (err) {
      console.error('Impersonate failed:', err);
    }
  };

  // Column definitions vary by role
  const getColumns = () => {
    const base = [
      {
        key: 'name',
        label: 'Name / Username',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-bold shrink-0">
              {((row.full_name || row.email || '?').charAt(0)).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">{row.full_name || '—'}</p>
              {row.username_slug && (
                <p className="text-xs text-zinc-500">@{row.username_slug}</p>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        label: 'Email',
        render: (row) => (
          <span className="text-sm text-zinc-400 truncate">{row.email || '—'}</span>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <StaffBadge status={row.disabled || row.is_banned ? 'banned' : 'active'} />
        ),
      },
      {
        key: 'created_at',
        label: 'Joined',
        render: (row) => <span className="text-sm text-zinc-500">{fmtDate(row.created_at)}</span>,
      },
    ];

    const extrasByRole = {
      gamer: [
        {
          key: 'games_count',
          label: 'Games',
          render: (row) => <span className="text-sm text-zinc-400">{row.games_count ?? row.connected_games?.length ?? '—'}</span>,
        },
        {
          key: 'teams_count',
          label: 'Teams',
          render: (row) => <span className="text-sm text-zinc-400">{row.teams_count ?? '—'}</span>,
        },
      ],
      organizer: [
        {
          key: 'verification_status',
          label: 'Verification',
          render: (row) => <StaffBadge status={row.verification_status || row.is_verified ? 'verified' : 'pending'} />,
        },
        {
          key: 'tournaments_count',
          label: 'Tournaments',
          render: (row) => <span className="text-sm text-zinc-400">{row.tournaments_count ?? '—'}</span>,
        },
      ],
      sponsor: [
        {
          key: 'subscription_plan',
          label: 'Plan',
          render: (row) => (
            <span className="text-sm text-zinc-300 capitalize">
              {row.subscription_plan || row.plan || 'Free'}
            </span>
          ),
        },
      ],
      service_provider: [
        {
          key: 'approval_status',
          label: 'Approval',
          render: (row) => <StaffBadge status={row.approval_status || 'pending'} />,
        },
        {
          key: 'category',
          label: 'Category',
          render: (row) => <span className="text-sm text-zinc-400 capitalize">{row.category || '—'}</span>,
        },
      ],
    };

    const actions = {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        const isBanned = row.disabled || row.is_banned;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedUser(row); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#2a2a2a] text-zinc-400 hover:text-zinc-100 hover:border-[#3a3a3a] transition"
            >
              <Eye className="w-3 h-3" />
              View
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleImpersonate(row.id); }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
            >
              <ExternalLink className="w-3 h-3" />
              Impersonate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                banMutation.mutate({ userId: row.id, banned: !isBanned });
              }}
              disabled={banMutation.isPending}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${
                isBanned
                  ? 'border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                  : 'border border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              {isBanned ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
              {isBanned ? 'Unban' : 'Ban'}
            </button>
          </div>
        );
      },
    };

    return [...base, ...(extrasByRole[activeRole] || []), actions];
  };

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <StaffPageHeader
          title="All Users"
          subtitle="Manage every account on the platform"
        />

        {/* Role tab pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {ROLE_TABS.map((tab) => {
            const active = activeRole === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveRole(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-red-600 text-white'
                    : 'bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100 hover:border-[#2a2a2a]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder-zinc-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        {/* Table */}
        <StaffTable
          columns={getColumns()}
          data={users}
          loading={isLoading}
          emptyMessage={search ? 'No users match your search.' : `No ${activeRole.replace('_', ' ')}s found.`}
        />

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-xs text-zinc-500">
              {startItem}–{endItem} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-medium text-zinc-400">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
