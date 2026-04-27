import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Props:
 *   columns      — array of { key, label, render?: (row) => jsx }
 *   data         — array of row objects
 *   loading      — boolean
 *   onRowClick   — (row) => void (optional — makes rows clickable)
 *   emptyMessage — string (default "No data found.")
 */
export default function StaffTable({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  emptyMessage = 'No data found.',
}) {
  if (loading) {
    return (
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#111111] border-b border-[#1e1e1e]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]">
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-3.5">
                      <div className="h-4 bg-zinc-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl px-6 py-16 text-center">
        <Inbox className="w-9 h-9 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  const clickable = typeof onRowClick === 'function';

  return (
    <div className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#111111] border-b border-[#1e1e1e]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                onClick={clickable ? () => onRowClick(row) : undefined}
                className={`border-b border-[#1e1e1e] transition-colors ${
                  clickable ? 'cursor-pointer hover:bg-[#161616]' : 'hover:bg-[#161616]'
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 text-sm text-zinc-100">
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
