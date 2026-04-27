import React from 'react';

/**
 * Props:
 *   title    — string
 *   subtitle — string (optional)
 *   actions  — array of { label, onClick, variant: 'primary' | 'ghost' } (optional)
 */
export default function StaffPageHeader({ title, subtitle, actions = [] }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
      </div>

      {actions.length > 0 && (
        <div className="flex items-center gap-2 shrink-0">
          {actions.map((action, idx) => {
            const isPrimary = action.variant === 'primary';
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={
                  isPrimary
                    ? 'px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors'
                    : 'px-4 py-2 text-sm font-medium rounded-lg border border-[#2a2a2a] text-zinc-400 hover:text-zinc-100 hover:border-[#3a3a3a] transition-colors'
                }
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
