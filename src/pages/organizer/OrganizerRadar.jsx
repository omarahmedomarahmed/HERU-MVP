import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import OrganizerLayout from '@/components/layouts/OrganizerLayout';
import { Zap, AlertCircle, Loader2 } from 'lucide-react';

const TIER_COLORS = {
  platinum: 'bg-slate-400/20 text-slate-300 border-slate-400/30',
  gold:     'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  silver:   'bg-zinc-400/20 text-zinc-300 border-zinc-400/30',
  bronze:   'bg-amber-700/20 text-amber-600 border-amber-700/30',
};

const STATUS_COLORS = {
  active:    'bg-green-500/20 text-green-400',
  draft:     'bg-zinc-700/40 text-zinc-400',
  sold:      'bg-purple-500/20 text-purple-400',
  inactive:  'bg-zinc-700/40 text-zinc-500',
};

function formatEGP(n) {
  return `EGP ${(n || 0).toLocaleString()}`;
}

function PackageCard({ pkg }) {
  const tierKey = (pkg.tier || '').toLowerCase();
  const statusKey = (pkg.status || 'active').toLowerCase();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">
            {pkg.package_name || pkg.name || 'Unnamed Package'}
          </p>
          <p className="text-zinc-500 text-xs mt-0.5 truncate">
            {pkg.tournament_name || pkg.tournament?.name || '—'}
          </p>
        </div>
        {pkg.tier && (
          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${TIER_COLORS[tierKey] || 'bg-zinc-700/30 text-zinc-400 border-zinc-700/50'}`}>
            {pkg.tier}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-purple-400 font-black text-lg">
          {formatEGP(pkg.price)}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[statusKey] || STATUS_COLORS.inactive}`}>
          {pkg.status || 'active'}
        </span>
      </div>

      {pkg.estimated_reach && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Zap className="w-3.5 h-3.5 text-yellow-400/60" />
          <span>Est. reach: <span className="text-zinc-300">{Number(pkg.estimated_reach).toLocaleString()}</span></span>
        </div>
      )}

      {Array.isArray(pkg.deliverables) && pkg.deliverables.length > 0 && (
        <ul className="space-y-1 mt-1">
          {pkg.deliverables.slice(0, 3).map((d, i) => (
            <li key={i} className="text-xs text-zinc-500 flex items-start gap-1.5">
              <span className="text-purple-500 shrink-0">•</span>
              <span className="line-clamp-1">{typeof d === 'string' ? d : d.label || d.name || JSON.stringify(d)}</span>
            </li>
          ))}
          {pkg.deliverables.length > 3 && (
            <li className="text-xs text-zinc-600">+{pkg.deliverables.length - 3} more</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function OrganizerRadar() {
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['organizer-profile-me'],
    queryFn: () => apiCall('/organizer-profiles/me'),
    retry: false,
  });

  const { data: packagesData, isLoading: packagesLoading } = useQuery({
    queryKey: ['sponsorship-packages-active'],
    queryFn: () => apiCall('/sponsorship-packages?status=active&limit=20'),
    enabled: !!profileData,
    staleTime: 5 * 60_000,
  });

  const isLoading = profileLoading || packagesLoading;
  const packages = packagesData?.packages || packagesData || [];

  return (
    <OrganizerLayout>
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h1 className="text-2xl font-black text-white">Sponsorship Radar</h1>
          </div>
          <p className="text-sm text-zinc-400">
            View active packages on the radar. Create packages from your tournament management page.
          </p>
        </div>

        {/* No profile prompt */}
        {!profileLoading && !profileData && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center text-center gap-4">
            <AlertCircle className="w-10 h-10 text-purple-400" />
            <div>
              <p className="text-white font-bold mb-1">Complete your organizer profile</p>
              <p className="text-sm text-zinc-400">
                You need an organizer profile to view and manage sponsorship packages.
              </p>
            </div>
            <a
              href="/organizer/profile"
              className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors"
            >
              Complete Profile
            </a>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Packages grid */}
        {!isLoading && profileData && packages.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && profileData && packages.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <Zap className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-white font-bold mb-1">No active packages on the radar</p>
            <p className="text-sm text-zinc-500">
              Add sponsorship packages from your tournament management page to list them here.
            </p>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}
