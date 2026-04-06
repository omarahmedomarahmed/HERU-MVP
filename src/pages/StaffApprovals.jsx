import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApprovalRequest } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Trophy,
  Mic,
  Building2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const TYPE_TABS = [
  { key: 'all', label: 'All Types', icon: ShieldCheck },
  { key: 'team_join', label: 'Team Join', icon: Users },
  { key: 'tournament_publish', label: 'Tournament Publish', icon: Trophy },
  { key: 'talent_application', label: 'Talent Application', icon: Mic },
  { key: 'organizer_profile', label: 'Organizer Profile', icon: Building2 },
];

const TYPE_COLORS = {
  team_join: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  tournament_publish: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  talent_application: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  organizer_profile: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', icon: Clock },
  approved: { bg: 'bg-green-500/15', text: 'text-green-400', icon: CheckCircle2 },
  rejected: { bg: 'bg-red-500/15', text: 'text-red-400', icon: XCircle },
};

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTypeLabel(type) {
  return (type || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function DetailsDisplay({ details }) {
  if (!details || typeof details !== 'object' || Object.keys(details).length === 0) {
    return <span className="text-zinc-500 text-sm italic">No additional details</span>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="flex items-start gap-2 text-sm">
          <span className="text-zinc-500 shrink-0">
            {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:
          </span>
          <span className="text-zinc-300 break-all">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ApprovalCard({ approval, onApprove, onReject, isApproving, isRejecting }) {
  const [expanded, setExpanded] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const typeColor = TYPE_COLORS[approval.approval_type] || TYPE_COLORS.team_join;
  const statusStyle = STATUS_STYLES[approval.status] || STATUS_STYLES.pending;
  const StatusIcon = statusStyle.icon;
  const isPending = approval.status === 'pending';

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    onReject(approval.id, rejectionReason.trim());
    setShowRejectForm(false);
    setRejectionReason('');
  };

  return (
    <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl overflow-hidden hover:border-zinc-600/60 transition-colors">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`shrink-0 mt-0.5 px-2.5 py-1 rounded-md text-xs font-semibold ${typeColor.bg} ${typeColor.text} border ${typeColor.border}`}>
              {formatTypeLabel(approval.approval_type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-white font-medium truncate">
                  {approval.requester_name || 'Unknown User'}
                </h3>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                  <StatusIcon className="w-3 h-3" />
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </div>
              </div>
              <p className="text-zinc-400 text-sm mt-0.5 truncate">
                {approval.requester_email || 'No email'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-zinc-500 text-xs whitespace-nowrap">
              {formatDate(approval.created_at)}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-zinc-500">Reference:</span>
          <span className="text-blue-400 font-medium">
            {approval.reference_name || approval.reference_id || '--'}
          </span>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-700/50">
            <p className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-2">Details</p>
            <DetailsDisplay details={approval.details} />

            {approval.status === 'rejected' && approval.rejection_reason && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs uppercase tracking-wider font-semibold mb-1">Rejection Reason</p>
                <p className="text-red-300 text-sm">{approval.rejection_reason}</p>
              </div>
            )}

            {approval.reviewed_at && (
              <p className="text-zinc-500 text-xs mt-3">
                Reviewed on {formatDate(approval.reviewed_at)}
              </p>
            )}
          </div>
        )}

        {isPending && (
          <div className="mt-4 pt-4 border-t border-zinc-700/50">
            {showRejectForm ? (
              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason.trim() || isRejecting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:text-red-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => { setShowRejectForm(false); setRejectionReason(''); }}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApprove(approval.id)}
                  disabled={isApproving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StaffApprovals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const { data: approvals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['approval-requests'],
    queryFn: () => ApprovalRequest.list(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id }) => ApprovalRequest.approve(id, { reviewed_by: user?.id }),
    onMutate: ({ id }) => setApprovingId(id),
    onSettled: () => setApprovingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-requests'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, rejection_reason }) =>
      ApprovalRequest.reject(id, { rejection_reason, reviewed_by: user?.id }),
    onMutate: ({ id }) => setRejectingId(id),
    onSettled: () => setRejectingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['approval-requests'] }),
  });

  const handleApprove = (id) => approveMutation.mutate({ id });
  const handleReject = (id, rejection_reason) => rejectMutation.mutate({ id, rejection_reason });

  const filtered = approvals.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (typeFilter !== 'all' && a.approval_type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (a.requester_name || '').toLowerCase().includes(q);
      const matchEmail = (a.requester_email || '').toLowerCase().includes(q);
      const matchRef = (a.reference_name || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRef) return false;
    }
    return true;
  });

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  const statusCounts = {
    all: approvals.length,
    pending: pendingCount,
    approved: approvals.filter((a) => a.status === 'approved').length,
    rejected: approvals.filter((a) => a.status === 'rejected').length,
  };

  const typeCounts = {
    all: approvals.length,
    team_join: approvals.filter((a) => a.approval_type === 'team_join').length,
    tournament_publish: approvals.filter((a) => a.approval_type === 'tournament_publish').length,
    talent_application: approvals.filter((a) => a.approval_type === 'talent_application').length,
    organizer_profile: approvals.filter((a) => a.approval_type === 'organizer_profile').length,
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/15 border border-blue-500/30 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-white">Approval Requests</h1>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {pendingCount}
                  </span>
                )}
              </div>
              <p className="text-zinc-400 text-sm mt-0.5">
                Review and manage platform approval requests
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 text-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or reference..."
            className="w-full pl-10 pr-10 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-800/60 border border-zinc-700/50 rounded-xl mb-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === tab.key ? 'bg-blue-500/40 text-blue-100' : 'bg-zinc-700 text-zinc-400'
              }`}>
                {statusCounts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Type sub-tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
          {TYPE_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                  typeFilter === tab.key
                    ? 'bg-blue-600/15 text-blue-400 border-blue-500/30'
                    : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/50 hover:text-zinc-200 hover:border-zinc-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {typeCounts[tab.key] > 0 && (
                  <span className={`text-xs px-1.5 rounded-full ${
                    typeFilter === tab.key ? 'bg-blue-500/30 text-blue-300' : 'bg-zinc-700 text-zinc-500'
                  }`}>
                    {typeCounts[tab.key]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Loading approval requests...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <AlertTriangle className="w-8 h-8 mb-3 text-red-400" />
            <p className="text-sm mb-3">Failed to load approvals</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
            <ShieldCheck className="w-10 h-10 mb-3 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-300">No approval requests found</p>
            <p className="text-xs mt-1 text-zinc-500">
              {searchQuery
                ? 'Try adjusting your search query'
                : statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try changing the filters'
                : 'No requests have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={approvingId === approval.id}
                isRejecting={rejectingId === approval.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
