import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package, Search, Filter, ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight, X, Users
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
    draft: 'bg-gray-100 text-gray-600',
    pending_payment: 'bg-amber-50 text-amber-700',
    in_fulfillment: 'bg-red-50 text-red-700',
    fulfilled: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  );
}

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'in_fulfillment', label: 'In Fulfillment' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ---------------------------------------------------------------------------
// Order detail (inline expand)
// ---------------------------------------------------------------------------

function OrderDetail({ order, onClose }) {
  const items = order.items || [];
  const coOrgs = order.co_organizers || [];

  return (
    <tr>
      <td colSpan={6} className="px-6 py-5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Order Details - {order.tournament_name || 'Untitled'}
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-200 transition">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Cost breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Items Subtotal</p>
            <p className="text-base font-bold text-gray-900">{formatEGP(order.subtotal_items)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Prizepool</p>
            <p className="text-base font-bold text-gray-900">{formatEGP(order.prizepool_amount)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Platform Fee (15%)</p>
            <p className="text-base font-bold text-gray-900">{formatEGP(order.platform_fee)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <p className="text-xs text-gray-500">Grand Total</p>
            <p className="text-base font-bold text-red-600">{formatEGP(order.grand_total)}</p>
          </div>
        </div>

        {/* Items table */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({items.length})</h4>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-4 py-2 text-xs text-gray-400">Item</th>
                  <th className="px-4 py-2 text-xs text-gray-400">Category</th>
                  <th className="px-4 py-2 text-xs text-gray-400 text-right">Price</th>
                  <th className="px-4 py-2 text-xs text-gray-400 text-center">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.title || item.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 capitalize">{(item.category || '-').replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2 text-sm text-gray-700 text-right">{formatEGP(item.price)}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 text-center">{item.quantity || 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Co-organizers */}
        {coOrgs.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 mb-4 p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Co-Organizers ({coOrgs.length})
            </h4>
            <div className="space-y-2">
              {coOrgs.map((co, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm text-gray-700">{co.brand_name || co.organizer_brand || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {co.commitment_percent || 0}% - {formatEGP(co.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff notes */}
        {order.staff_notes && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Staff Notes</h4>
            <p className="text-sm text-gray-600">{order.staff_notes}</p>
          </div>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffTournamentOrders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const { data: rawOrders = [], isLoading } = useQuery({
    queryKey: ['staff-tournament-orders'],
    queryFn: () => apiCall('/tournament-orders'),
    staleTime: 30_000,
  });

  const orders = Array.isArray(rawOrders) ? rawOrders : rawOrders.data || [];

  // Filter + search
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.fulfillment_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const tournMatch = (o.tournament_name || '').toLowerCase().includes(q);
        const orgMatch = (o.main_organizer_brand || '').toLowerCase().includes(q);
        const idMatch = (o.id || '').toLowerCase().includes(q);
        if (!tournMatch && !orgMatch && !idMatch) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  React.useEffect(() => { setPage(1); }, [search, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tournament Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tournament, organizer, or order ID..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              {search || statusFilter !== 'all' ? 'No orders match your filters.' : 'No tournament orders found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tournament</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Organizer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Grand Total</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
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
                          <span className="text-sm font-mono text-gray-600">
                            {(o.id || '').slice(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                              {o.tournament_name || 'Untitled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600 truncate max-w-[150px]">
                          {o.main_organizer_brand || '-'}
                        </td>
                        <td className="px-6 py-3.5 text-sm font-medium text-gray-900 text-right">
                          {formatEGP(o.grand_total)}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={o.fulfillment_status} />
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
                        <OrderDetail order={o} onClose={() => setExpandedId(null)} />
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
