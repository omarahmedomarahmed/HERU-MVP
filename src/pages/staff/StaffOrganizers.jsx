import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2, Search, Filter, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, X, CheckCircle, Shield,
  MapPin, Star, Trophy, Globe, ExternalLink
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function VerificationBadge({ status }) {
  const map = {
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    unverified: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  const icons = {
    verified: CheckCircle,
    pending: Shield,
    unverified: Shield,
  };
  const Icon = icons[status] || Shield;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || map.unverified}`}>
      <Icon className="w-3 h-3" />
      {status || 'unverified'}
    </span>
  );
}

const PAGE_SIZE = 15;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
];

// ---------------------------------------------------------------------------
// Organizer detail (inline expand)
// ---------------------------------------------------------------------------

function OrganizerDetail({ org, onClose, onVerify, verifying }) {
  const socialLinks = org.social_links || {};
  const verificationStatus = org.verification_status || (org.is_verified ? 'verified' : 'unverified');

  return (
    <tr>
      <td colSpan={7} className="px-6 py-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {org.brand_logo ? (
              <img src={org.brand_logo} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center text-xl font-bold">
                {(org.brand_name || '?').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-base font-semibold text-gray-900">{org.brand_name || 'Unnamed'}</h3>
              {org.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> {org.location}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Profile info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile Details</h4>

            {org.description && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700">{org.description}</p>
              </div>
            )}
            {org.bio && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Bio</p>
                <p className="text-sm text-gray-700">{org.bio}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Rating</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {org.rating != null ? org.rating.toFixed(1) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Tournaments</p>
                <p className="font-medium text-gray-900">{org.total_tournaments_organized || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Co-organized</p>
                <p className="font-medium text-gray-900">{(org.co_organized_tournaments || []).length}</p>
              </div>
            </div>

            {(org.featured_games || []).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Featured Games</p>
                <div className="flex flex-wrap gap-1.5">
                  {org.featured_games.map((g, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(socialLinks).length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Social Links</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socialLinks).map(([key, url]) => (
                    url && (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <Globe className="w-3 h-3" />
                        {key}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {org.primary_color && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Brand Colors</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: org.primary_color }} />
                  <span className="text-xs text-gray-500">{org.primary_color}</span>
                  {org.secondary_color && (
                    <>
                      <div className="w-6 h-6 rounded border border-gray-200" style={{ backgroundColor: org.secondary_color }} />
                      <span className="text-xs text-gray-500">{org.secondary_color}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Verification panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Verification</h4>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current status:</p>
              <VerificationBadge status={verificationStatus} />
            </div>

            <p className="text-xs text-gray-400 mb-3">Change verification status:</p>
            <div className="flex flex-wrap gap-2">
              {['unverified', 'pending', 'verified'].map((s) => (
                <button
                  key={s}
                  disabled={verifying || verificationStatus === s}
                  onClick={() => onVerify(org.user_id, s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    verificationStatus === s
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s === 'verified' && <CheckCircle className="w-3 h-3 inline mr-1" />}
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            {verifying && (
              <p className="text-xs text-red-500 mt-3 animate-pulse">Updating verification...</p>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffOrganizers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);

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

  // Fetch
  const { data: rawOrganizers = [], isLoading } = useQuery({
    queryKey: ['staff-organizers'],
    queryFn: () => apiCall('/organizers'),
    staleTime: 30_000,
  });

  const organizers = Array.isArray(rawOrganizers) ? rawOrganizers : rawOrganizers.data || [];

  // Verification mutation
  const verifyMutation = useMutation({
    mutationFn: ({ userId, status }) =>
      apiCall(`/organizers/${userId}/verify`, {
        method: 'PUT',
        body: { verification_status: status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-organizers'] });
    },
  });

  function handleVerify(userId, status) {
    verifyMutation.mutate({ userId, status });
  }

  // Derive verification status helper
  function getVerificationStatus(org) {
    return org.verification_status || (org.is_verified ? 'verified' : 'unverified');
  }

  // Filter + search
  const filtered = useMemo(() => {
    return organizers.filter((o) => {
      const vs = getVerificationStatus(o);
      if (filter !== 'all' && vs !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const nameMatch = (o.brand_name || '').toLowerCase().includes(q);
        const locMatch = (o.location || '').toLowerCase().includes(q);
        if (!nameMatch && !locMatch) return false;
      }
      return true;
    });
  }, [organizers, filter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organizers</h1>
            <p className="text-sm text-gray-500 mt-0.5">{organizers.length} total profiles</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          {FILTER_OPTIONS.map((f) => {
            const count = f.value === 'all'
              ? organizers.length
              : organizers.filter(o => getVerificationStatus(o) === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                  filter === f.value
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
                <span className="ml-1.5 text-xs text-gray-400">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by brand name or location..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading organizers...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {search || filter !== 'all' ? 'No organizers match your filters.' : 'No organizers found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tournaments</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Rating</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verification</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((o) => (
                    <React.Fragment key={o.id}>
                      <tr
                        onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                        className="hover:bg-gray-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            {o.brand_logo ? (
                              <img src={o.brand_logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-violet-500" />
                              </div>
                            )}
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {o.brand_name || 'Unnamed'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {o.location || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-gray-400" />
                            {o.total_tournaments_organized || 0}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 text-center">
                          {o.rating != null ? (
                            <span className="flex items-center justify-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-400" />
                              {o.rating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <VerificationBadge status={getVerificationStatus(o)} />
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-500">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-3.5">
                          {expandedId === o.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </td>
                      </tr>
                      {expandedId === o.id && (
                        <OrganizerDetail
                          org={o}
                          onClose={() => setExpandedId(null)}
                          onVerify={handleVerify}
                          verifying={verifyMutation.isPending}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="px-2 text-xs font-medium text-gray-700">{safePage} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
