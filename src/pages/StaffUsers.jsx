import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Search, Shield, ShieldCheck, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, UserCog, Eye
} from 'lucide-react';
import { Staff } from '@/api/heruClient';

const ROLES = ['all', 'gamer', 'organizer', 'admin'];

const ROLE_BADGE = {
  gamer:     'bg-red-500/20 text-red-400 border border-red-500/30',
  organizer: 'bg-red-500/20 text-red-400 border border-red-500/30',
  admin:     'bg-red-500/20 text-red-400 border border-red-500/30',
  user:      'bg-red-500/20 text-red-400 border border-red-500/30',
};

const PER_PAGE = 20;

export default function StaffUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [pendingRole, setPendingRole] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['staff-all-users'],
    queryFn: () => Staff.users(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, role }) => Staff.updateUser(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-all-users'] });
      setEditingId(null);
      setPendingRole(null);
      setConfirmId(null);
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return users.filter((u) => {
      const role = u.role === 'user' ? 'gamer' : u.role;
      if (filterRole !== 'all' && role !== filterRole) return false;
      if (q) {
        const name = (u.full_name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const id = (u.id || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [users, search, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleRoleSelect = (userId, newRole) => {
    setPendingRole(newRole);
    setConfirmId(userId);
  };

  const confirmRoleChange = () => {
    if (confirmId && pendingRole) {
      updateMutation.mutate({ id: confirmId, role: pendingRole });
    }
  };

  const cancelRoleChange = () => {
    setConfirmId(null);
    setPendingRole(null);
    setEditingId(null);
  };

  const displayRole = (role) => (role === 'user' ? 'gamer' : role);

  // Reset page when filters change
  React.useEffect(() => { setPage(1); }, [search, filterRole]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20">
          <Users className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">All Users</h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition"
        />
      </div>

      {/* Role filter tabs */}
      <div className="flex gap-1.5">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filterRole === role
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent'
            }`}
          >
            {role === 'all' ? 'All' : role === 'admin' ? 'Admins' : `${role}s`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verified</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Created</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-zinc-500 text-sm">
                    Loading users...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-zinc-500 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginated.map((u) => {
                  const role = displayRole(u.role);
                  const isEditing = editingId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                      {/* Avatar + Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {u.avatar ? (
                              <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-zinc-500">
                                {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="text-white font-medium text-sm truncate max-w-[180px]">
                            {u.full_name || 'Unnamed'}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5 text-zinc-400 text-sm">{u.email || '-'}</td>

                      {/* Role badge */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${ROLE_BADGE[role] || ROLE_BADGE.gamer}`}>
                          {role}
                        </span>
                      </td>

                      {/* Verified */}
                      <td className="px-5 py-3.5">
                        {u.is_verified ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-green-400" />
                        ) : (
                          <XCircle className="w-4.5 h-4.5 text-zinc-600" />
                        )}
                      </td>

                      {/* Created date */}
                      <td className="px-5 py-3.5 text-zinc-500 text-sm">
                        {u.created_date || u.created_at
                          ? new Date(u.created_date || u.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {/* View button */}
                          <Link
                            to={`/staff/users/${u.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </Link>

                          {/* Edit Role */}
                          {isEditing ? (
                            <select
                              autoFocus
                              defaultValue={role}
                              onChange={(e) => handleRoleSelect(u.id, e.target.value)}
                              onBlur={() => { if (!confirmId) cancelRoleChange(); }}
                              className="px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-600 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500/50 cursor-pointer"
                            >
                              <option value="gamer">Gamer</option>
                              <option value="organizer">Organizer</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingId(u.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-400 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition"
                            >
                              <UserCog className="w-3.5 h-3.5" />
                              Edit Role
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-800">
            <span className="text-xs text-zinc-500">
              Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-zinc-600 text-xs">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                        item === safePage
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <ShieldCheck className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Confirm Role Change</h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Change this user's role to{' '}
              <span className={`font-semibold capitalize ${
                pendingRole === 'admin' ? 'text-red-400' : pendingRole === 'organizer' ? 'text-red-400' : 'text-red-400'
              }`}>
                {pendingRole}
              </span>
              ? This will affect their access and permissions immediately.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={cancelRoleChange}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={updateMutation.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg transition disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
