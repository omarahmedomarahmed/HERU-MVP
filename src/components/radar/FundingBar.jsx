import React from 'react';
import { cn } from '@/lib/utils';

export default function FundingBar({ percent = 0, totalCost = 0, className, large = false }) {
  const pct = Math.min(100, Math.max(0, percent));
  const amountStillNeeded = Math.max(0, totalCost - Math.round(totalCost * pct / 100));

  const barColor =
    pct >= 100 ? 'bg-green-500' :
    pct >= 70  ? 'bg-blue-500' :
    pct >= 30  ? 'bg-amber-500' :
                 'bg-red-500';

  const labelColor =
    pct >= 100 ? 'text-green-400' :
    pct >= 70  ? 'text-blue-400' :
    pct >= 30  ? 'text-amber-400' :
                 'text-red-400';

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className={cn('w-full bg-zinc-800 rounded-full overflow-hidden', large ? 'h-4' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={cn('font-medium', labelColor, large ? 'text-sm' : 'text-xs')}>
        {pct >= 100
          ? '✓ Fully Funded'
          : `${pct}% funded — EGP ${amountStillNeeded.toLocaleString()} still needed`}
      </p>
    </div>
  );
}