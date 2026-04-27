import React from 'react';

// accent → icon bg + text color
const ACCENT_STYLES = {
  red:    'bg-red-500/10 text-red-500',
  green:  'bg-emerald-500/10 text-emerald-400',
  amber:  'bg-amber-500/10 text-amber-400',
  violet: 'bg-violet-500/10 text-violet-400',
};

const DELTA_STYLES = {
  positive: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  negative: 'bg-red-500/20 text-red-400 border border-red-500/30',
  neutral:  'bg-zinc-700/50 text-zinc-400 border border-zinc-600/30',
};

function getDeltaVariant(delta) {
  if (!delta) return 'neutral';
  if (delta.startsWith('+')) return 'positive';
  if (delta.startsWith('-')) return 'negative';
  return 'neutral';
}

/**
 * Props:
 *   icon    — Lucide component
 *   label   — string
 *   value   — string | number
 *   delta   — string like "+12%" (optional)
 *   sub     — string subtitle (optional)
 *   accent  — "red" | "green" | "amber" | "violet" (default "red")
 */
export default function StaffStatCard({ icon: Icon, label, value, delta, sub, accent = 'red' }) {
  const iconStyle = ACCENT_STYLES[accent] || ACCENT_STYLES.red;
  const deltaVariant = getDeltaVariant(delta);

  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
        <div className={`rounded-lg p-2 ${iconStyle}`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-zinc-100 leading-none">{value ?? '—'}</span>
        {delta && (
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 mb-0.5 ${DELTA_STYLES[deltaVariant]}`}>
            {delta}
          </span>
        )}
      </div>

      {sub && <p className="text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}
