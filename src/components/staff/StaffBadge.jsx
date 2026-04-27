import React from 'react';

const STATUS_STYLES = {
  // Green group
  active:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  approved:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  released:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  live:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  verified:  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  paid:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',

  // Amber group
  pending:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  held:      'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  submitted: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  draft:     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  review:    'bg-amber-500/20 text-amber-400 border border-amber-500/30',

  // Red group
  banned:    'bg-red-500/20 text-red-400 border border-red-500/30',
  rejected:  'bg-red-500/20 text-red-400 border border-red-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  expired:   'bg-red-500/20 text-red-400 border border-red-500/30',
  disabled:  'bg-red-500/20 text-red-400 border border-red-500/30',
  unpaid:    'bg-red-500/20 text-red-400 border border-red-500/30',
};

const DEFAULT_STYLE = 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30';

/**
 * Props:
 *   status — string (maps to a color group)
 */
export default function StaffBadge({ status }) {
  const key = (status || '').toLowerCase();
  const style = STATUS_STYLES[key] || DEFAULT_STYLE;

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}
