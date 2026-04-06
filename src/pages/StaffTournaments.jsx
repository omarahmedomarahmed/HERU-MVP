import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tournament, apiCall } from '@/api/heruClient';
import {
  Trophy, Search, Eye, ChevronDown, Trash2, Users, Calendar,
  Gamepad2, DollarSign, Loader2, AlertTriangle, X,
} from 'lucide-react';

const STATUS_OPTIONS = ['draft', 'published', 'live', 'completed'];

const STATUS_COLORS = {
  draft:     'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  published: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  live:      'bg-green-500/15 text-green-400 border border-green-500/30',
  completed: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
};

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'draft',     label: 'Draft' },
  { key: 'published', label: 'Published' },
  { key: 'live',      label: 'Live' },
  { key: 'completed', label: 'Completed' },
];

function formatEGP(value) {
  if (value == null) return 'EGP 0';
  return `EGP ${Number(value).toLocaleString('en-US')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Confirmation Dialog ──────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, confirmLabel, confirmColor, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${confirmColor || 'bg-blue-600 hover:bg-blue-500'}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Status Dropdown ──────────────────────────────────────────────────────────

function StatusDropdown({ currentStatus, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors"
      >
        Edit Status <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={(e) => {
                  e.stopPropagation();
                  if (status !== currentStatus) onSelect(status);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm capitalize transition-colors ${
                  status === currentStatus
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {status}
                {status === currentStatus && <span className="ml-2 text-xs text-zinc-500">(current)</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function StaffTournaments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Confirmation dialogs
  const [statusConfirm, setStatusConfirm] = useState(null); // { id, name, newStatus }
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  // ── Data fetching ────────────────────────────────────────────────────────

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['staff-tournaments'],
    queryFn: () => Tournament.list(),
  });

  // ── Mutations ────────────────────────────────────────────────────────────

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => Tournament.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tournaments'] });
      setStatusConfirm(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }) => Tournament.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tournaments'] });
      setDeleteConfirm(null);
    },
  });

  // ── Filtering ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = tournaments;

    // search by name
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name?.toLowerCase().includes(q));
    }

    // tab filter
    if (activeTab !== 'all') {
      list = list.filter((t) => t.status === activeTab);
    }

    // newest first
    return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tournaments, search, activeTab]);

  // Tab counts
  const counts = useMemo(() => {
    const base = search.trim()
      ? tournaments.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()))
      : tournaments;
    return {
      all:       base.length,
      draft:     base.filter((t) => t.status === 'draft').length,
      published: base.filter((t) => t.status === 'published').length,
      live:      base.filter((t) => t.status === 'live').length,
      completed: base.filter((t) => t.status === 'completed').length,
    };
  }, [tournaments, search]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-blue-500" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              All Tournaments
            </h1>
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-sm font-semibold border border-blue-500/30">
              {tournaments.length}
            </span>
          </div>
          <p className="text-zinc-500 text-sm mt-1 ml-10">
            God mode — view and manage every tournament on the platform
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tournament name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === key
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
            }`}
          >
            {label}
            <span className={`ml-1.5 text-xs ${activeTab === key ? 'text-blue-200' : 'text-zinc-600'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No tournaments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Game</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Type</th>
                <th className="text-center px-4 py-3 text-zinc-400 font-medium">Teams</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Organizer</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Cost</th>
                <th className="text-left px-4 py-3 text-zinc-400 font-medium">Created</th>
                <th className="text-right px-4 py-3 text-zinc-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  className="bg-zinc-900/40 hover:bg-zinc-800/50 transition-colors"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {t.tournament_image ? (
                          <img src={t.tournament_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Gamepad2 className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <span className="text-white font-medium truncate max-w-[200px]">{t.name}</span>
                    </div>
                  </td>

                  {/* Game */}
                  <td className="px-4 py-3 text-zinc-400">{t.game || '-'}</td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[t.status] || STATUS_COLORS.draft}`}>
                      {t.status === 'live' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
                      {t.status}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      t.tournament_type === 'shared' ? 'text-cyan-400' : 'text-zinc-500'
                    }`}>
                      {t.tournament_type || 'solo'}
                    </span>
                  </td>

                  {/* Teams */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-zinc-400">
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.teams?.length || 0}/{t.max_teams || '-'}</span>
                    </div>
                  </td>

                  {/* Organizer */}
                  <td className="px-4 py-3 text-zinc-400 truncate max-w-[150px]">
                    {t.organizer_brand?.brand_name || t.organizer_brand?.name || '-'}
                  </td>

                  {/* Cost */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-emerald-400 font-medium">{formatEGP(t.total_cost)}</span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                    {formatDate(t.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/staff/tournaments/${t.id}`)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 border border-blue-500/20 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <StatusDropdown
                        currentStatus={t.status}
                        onSelect={(newStatus) =>
                          setStatusConfirm({ id: t.id, name: t.name, newStatus })
                        }
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm({ id: t.id, name: t.name });
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete tournament"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Change Confirmation */}
      <ConfirmDialog
        open={!!statusConfirm}
        title="Change Tournament Status"
        message={
          statusConfirm
            ? `Change "${statusConfirm.name}" status to "${statusConfirm.newStatus}"? This will be visible to organizers and gamers immediately.`
            : ''
        }
        confirmLabel={`Set to ${statusConfirm?.newStatus || ''}`}
        confirmColor="bg-blue-600 hover:bg-blue-500"
        loading={updateStatusMutation.isPending}
        onConfirm={() =>
          updateStatusMutation.mutate({
            id: statusConfirm.id,
            status: statusConfirm.newStatus,
          })
        }
        onCancel={() => setStatusConfirm(null)}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Tournament"
        message={
          deleteConfirm
            ? `Are you sure you want to permanently delete "${deleteConfirm.name}"? This action cannot be undone. All associated brackets, chats, and data will be lost.`
            : ''
        }
        confirmLabel="Delete Forever"
        confirmColor="bg-red-600 hover:bg-red-500"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate({ id: deleteConfirm.id })}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
