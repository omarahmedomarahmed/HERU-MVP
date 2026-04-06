import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, User, Mail, Calendar, Shield, Save,
  CheckCircle, XCircle, Trophy, Building2, Gamepad2,
  ToggleLeft, ToggleRight, ExternalLink
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function RoleBadge({ role }) {
  const map = {
    gamer: 'bg-red-50 text-red-700',
    organizer: 'bg-violet-50 text-violet-700',
    admin: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[role] || 'bg-gray-100 text-gray-600'}`}>
      {role || 'unknown'}
    </span>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0 w-40">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{children}</span>
    </div>
  );
}

function ToggleButton({ enabled, onToggle, label, description }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? 'bg-red-600' : 'bg-gray-200'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editRole, setEditRole] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});

  // Guard
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Fetch user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['staff-user-detail', id],
    queryFn: () => apiCall(`/staff/users/${id}`),
    enabled: !!id,
    staleTime: 20_000,
    retry: 1,
  });

  // Derived profile data -- the API may nest these inside the user object
  const gamerProfile = user?.gamer_profile || null;
  const organizerProfile = user?.organizer_profile || null;
  const userTournaments = user?.tournaments || [];

  // Initialize edit state when user loads
  React.useEffect(() => {
    if (user && editRole === null) {
      setEditRole(user.role);
    }
  }, [user, editRole]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => apiCall(`/staff/users/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-user-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['staff-users-list'] });
      setHasChanges(false);
      setPendingChanges({});
    },
  });

  // Helpers for pending changes
  const queueChange = (field, value) => {
    setPendingChanges(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const getEffective = (field) => {
    return field in pendingChanges ? pendingChanges[field] : user?.[field];
  };

  const handleSave = () => {
    const changes = { ...pendingChanges };
    if (editRole !== user?.role) {
      changes.role = editRole;
    }
    updateMutation.mutate(changes);
  };

  // ---------- Loading / error ----------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Loading user...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-3">Failed to load user</p>
          <Link to="/staff/users" className="text-sm font-medium text-red-600 hover:text-red-700">
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  // ---------- Render ----------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          to="/staff/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl font-bold shrink-0">
                {(user.full_name || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.full_name || 'Unnamed User'}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <RoleBadge role={user.role} />
                  {user.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                      <XCircle className="w-3.5 h-3.5" /> Not verified
                    </span>
                  )}
                  {user.disabled && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600">Disabled</span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-400">
              <div className="flex items-center gap-1 justify-end">
                <Calendar className="w-3.5 h-3.5" />
                Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </div>
              <p className="mt-1 font-mono">{(user.id || '').slice(0, 12)}...</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit controls */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Account Controls</h2>
            </div>
            <div className="px-5 py-3">
              {/* Role */}
              <div className="py-3 border-b border-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  value={editRole || user.role}
                  onChange={(e) => {
                    setEditRole(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="gamer">Gamer</option>
                  <option value="organizer">Organizer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Toggles */}
              <ToggleButton
                label="Verified"
                description="Allow this user to appear as verified on the platform"
                enabled={getEffective('is_verified') ?? false}
                onToggle={() => queueChange('is_verified', !getEffective('is_verified'))}
              />
              <ToggleButton
                label="Disabled"
                description="Prevent this user from logging in"
                enabled={getEffective('disabled') ?? false}
                onToggle={() => queueChange('disabled', !getEffective('disabled'))}
              />

              {/* Save button */}
              {hasChanges && (
                <div className="pt-4 border-t border-gray-100 mt-2">
                  <button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    <Save className="w-4 h-4" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  {updateMutation.isError && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      Failed to save: {updateMutation.error?.message || 'Unknown error'}
                    </p>
                  )}
                  {updateMutation.isSuccess && (
                    <p className="text-xs text-emerald-600 mt-2 text-center">Changes saved successfully</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Account Information</h2>
            </div>
            <div className="px-5 py-3">
              <InfoRow label="User ID">
                <span className="font-mono text-xs">{user.id}</span>
              </InfoRow>
              <InfoRow label="Full Name">{user.full_name || '-'}</InfoRow>
              <InfoRow label="Email">{user.email || '-'}</InfoRow>
              <InfoRow label="Role">{user.role || '-'}</InfoRow>
              <InfoRow label="Created">
                {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
              </InfoRow>
            </div>
          </div>

          {/* Gamer profile */}
          {gamerProfile && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-semibold text-gray-900">Gamer Profile</h2>
              </div>
              <div className="px-5 py-3">
                <InfoRow label="Username">{gamerProfile.username || '-'}</InfoRow>
                <InfoRow label="Bio">{gamerProfile.bio || '-'}</InfoRow>
                <InfoRow label="Is Talent">
                  {gamerProfile.is_talent ? (
                    <span className="text-emerald-600 font-medium">Yes</span>
                  ) : 'No'}
                </InfoRow>
                {gamerProfile.is_talent && (
                  <>
                    <InfoRow label="Talent Type">{gamerProfile.talent_type || '-'}</InfoRow>
                    <InfoRow label="Talent Price">{gamerProfile.talent_price ? formatEGP(gamerProfile.talent_price) : '-'}</InfoRow>
                    <InfoRow label="Rating">{gamerProfile.talent_rating ?? '-'}</InfoRow>
                  </>
                )}
                <InfoRow label="Games">
                  {Array.isArray(gamerProfile.games) && gamerProfile.games.length > 0
                    ? gamerProfile.games.join(', ')
                    : '-'}
                </InfoRow>
                <InfoRow label="Teams">
                  {Array.isArray(gamerProfile.team_ids) && gamerProfile.team_ids.length > 0
                    ? `${gamerProfile.team_ids.length} team(s)`
                    : 'None'}
                </InfoRow>
              </div>
            </div>
          )}

          {/* Organizer profile */}
          {organizerProfile && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-gray-900">Organizer Profile</h2>
              </div>
              <div className="px-5 py-3">
                <InfoRow label="Brand Name">{organizerProfile.brand_name || '-'}</InfoRow>
                <InfoRow label="Location">{organizerProfile.location || '-'}</InfoRow>
                <InfoRow label="Description">{organizerProfile.description || '-'}</InfoRow>
                <InfoRow label="Verified">
                  {organizerProfile.is_verified ? (
                    <span className="text-emerald-600 font-medium">Yes</span>
                  ) : 'No'}
                </InfoRow>
                <InfoRow label="Tournaments Organized">
                  {organizerProfile.total_tournaments_organized ?? 0}
                </InfoRow>
                <InfoRow label="Rating">{organizerProfile.rating ?? '-'}</InfoRow>
                <InfoRow label="Featured Games">
                  {Array.isArray(organizerProfile.featured_games) && organizerProfile.featured_games.length > 0
                    ? organizerProfile.featured_games.join(', ')
                    : '-'}
                </InfoRow>

                {/* Link to their tournaments */}
                {Array.isArray(userTournaments) && userTournaments.length > 0 && (
                  <div className="pt-3 mt-2 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tournaments</p>
                    <div className="space-y-1.5">
                      {userTournaments.slice(0, 5).map((t) => (
                        <Link
                          key={t.id}
                          to={`/staff/tournaments/${t.id}`}
                          className="flex items-center justify-between py-1.5 text-sm hover:bg-gray-50 -mx-2 px-2 rounded transition"
                        >
                          <div className="flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-gray-700 truncate max-w-[200px]">{t.name}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300" />
                        </Link>
                      ))}
                      {userTournaments.length > 5 && (
                        <p className="text-xs text-gray-400 pt-1">+{userTournaments.length - 5} more</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No profile fallback */}
          {!gamerProfile && !organizerProfile && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-10 text-center">
              <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No linked profile found for this user</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
