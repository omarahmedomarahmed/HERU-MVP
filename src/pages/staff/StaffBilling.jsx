import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText, Search, Filter, DollarSign, AlertCircle,
  CheckCircle, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function StatusBadge({ status }) {
  const map = {
    unpaid: 'bg-red-50 text-red-600',
    partial: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    gamer: 'bg-blue-50 text-blue-700',
    organizer: 'bg-violet-50 text-violet-700',
    co_organizer: 'bg-cyan-50 text-cyan-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[type] || 'bg-gray-100 text-gray-600'}`}>
      {(type || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

const TAB_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffBilling() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
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
  const { data: rawBills = [], isLoading } = useQuery({
    queryKey: ['staff-bills'],
    queryFn: () => apiCall('/bills'),
    staleTime: 30_000,
  });

  const bills = Array.isArray(rawBills) ? rawBills : rawBills.data || [];

  // Computed stats
  const stats = useMemo(() => {
    const totalBilled = bills.reduce((sum, b) => sum + (b.grand_total || 0), 0);
    const totalCollected = bills
      .filter(b => b.payment_status === 'paid')
      .reduce((sum, b) => sum + (b.grand_total || 0), 0);
    const partialCollected = bills
      .filter(b => b.payment_status === 'partial')
      .reduce((sum, b) => sum + (b.paid_amount || 0), 0);
    const platformFees = bills.reduce((sum, b) => sum + (b.platform_fee || 0), 0);

    return {
      totalBilled,
      totalCollected: totalCollected + partialCollected,
      outstanding: totalBilled - totalCollected - partialCollected,
      platformFees,
    };
  }, [bills]);

  // Filter + search
  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (activeTab !== 'all' && b.payment_status !== activeTab) return false;
      if (search) {
        const q = search.toLowerCase();
        const numMatch = (b.bill_number || '').toLowerCase().includes(q);
        const payerMatch = (b.payer_name || '').toLowerCase().includes(q);
        const tournMatch = (b.tournament_name || '').toLowerCase().includes(q);
        if (!numMatch && !payerMatch && !tournMatch) return false;
      }
      return true;
    });
  }, [bills, activeTab, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Master billing across all parties</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total Billed" value={formatEGP(stats.totalBilled)} color="blue" />
          <StatCard icon={CheckCircle} label="Total Collected" value={formatEGP(stats.totalCollected)} color="green" />
          <StatCard icon={AlertCircle} label="Outstanding" value={formatEGP(stats.outstanding)} color="amber" />
          <StatCard icon={DollarSign} label="Platform Fees Earned" value={formatEGP(stats.platformFees)} color="green" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          {TAB_OPTIONS.map((tab) => {
            const count = tab.value === 'all'
              ? bills.length
              : bills.filter(b => b.payment_status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.value
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
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
              placeholder="Search by bill #, payer, or tournament..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading bills...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {search || activeTab !== 'all' ? 'No bills match your filters.' : 'No bills found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill #</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tournament</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/staff/billing/${b.bill_number}`)}
                      className="hover:bg-gray-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-mono font-medium text-blue-600">
                          {b.bill_number || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <TypeBadge type={b.bill_type} />
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[150px]">
                        {b.payer_name || b.payer_email || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[180px]">
                        {b.tournament_name || '-'}
                      </td>
                      <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                        {formatEGP(b.grand_total)}
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={b.payment_status} />
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-500">
                        {b.due_date ? new Date(b.due_date).toLocaleDateString() : '-'}
                      </td>
                    </tr>
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
