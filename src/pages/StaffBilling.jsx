import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Search, Eye, DollarSign, Check, FileText, AlertTriangle, Filter,
} from 'lucide-react';
import { Staff, Bill } from '@/api/heruClient';

const STATUS_BADGE = {
  paid:    'bg-green-500/20 text-green-400 border border-green-500/30',
  unpaid:  'bg-red-500/20 text-red-400 border border-red-500/30',
  partial: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  overdue: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
};

const TYPE_BADGE = {
  gamer:        'bg-zinc-700 text-gray-300',
  organizer:    'bg-red-500/20 text-red-400',
  co_organizer: 'bg-cyan-500/20 text-cyan-400',
};

export default function StaffBilling() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState(null);

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['staff-all-bills'],
    queryFn: () => Staff.allBills(),
  });

  const filtered = useMemo(() => {
    return bills.filter(b => {
      const matchSearch = !search ||
        b.bill_number?.toLowerCase().includes(search.toLowerCase()) ||
        b.payer_name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || b.payment_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bills, search, statusFilter]);

  const stats = useMemo(() => ({
    total: bills.reduce((s, b) => s + (b.grand_total || 0), 0),
    paid: bills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.grand_total || 0), 0),
    unpaid: bills.filter(b => b.payment_status === 'unpaid').reduce((s, b) => s + (b.grand_total || 0), 0),
    count: bills.length,
  }), [bills]);

  const markPaidMutation = useMutation({
    mutationFn: (bill) => Staff.updateBill(bill.id, {
      payment_status: 'paid',
      paid_amount: bill.grand_total,
      paid_date: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-all-bills'] });
      setSelectedBill(null);
    },
  });

  const markUnpaidMutation = useMutation({
    mutationFn: (bill) => Staff.updateBill(bill.id, {
      payment_status: 'unpaid',
      paid_amount: 0,
      paid_date: null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-all-bills'] });
      setSelectedBill(null);
    },
  });

  const zeroOutMutation = useMutation({
    mutationFn: (bill) => {
      const zeroedItems = (bill.items || []).map(item => ({
        ...item,
        price: 0,
        subtotal: 0,
        original_price: item.subtotal ?? item.price ?? 0,
      }));
      return Staff.updateBill(bill.id, {
        items: zeroedItems,
        subtotal: 0,
        platform_fee: 0,
        tax: 0,
        grand_total: 0,
        payment_status: 'paid',
        paid_amount: 0,
        paid_date: new Date().toISOString().split('T')[0],
        payment_method: 'staff_zeroed',
        notes: `${bill.notes ? bill.notes + '\n' : ''}[Staff] Bill zeroed out on ${new Date().toISOString().split('T')[0]}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-all-bills'] });
      setSelectedBill(null);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Master <span className="text-red-400">Billing</span>
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Total Billed</span>
          </div>
          <p className="text-xl font-bold text-white">EGP {stats.total.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Paid</span>
          </div>
          <p className="text-xl font-bold text-green-400">EGP {stats.paid.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-gray-400">Unpaid</span>
          </div>
          <p className="text-xl font-bold text-red-400">EGP {stats.unpaid.toLocaleString()}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-400">Total Bills</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by bill number or payer name..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            {['all', 'paid', 'unpaid', 'partial', 'overdue'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === s
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-gray-400 font-medium px-5 py-3">Bill Number</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Type</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Payer</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Tournament</th>
                <th className="text-right text-gray-400 font-medium px-5 py-3">Amount (EGP)</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Status</th>
                <th className="text-left text-gray-400 font-medium px-5 py-3">Due Date</th>
                <th className="text-center text-gray-400 font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">Loading bills...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">No bills found</td>
                </tr>
              ) : (
                filtered.map(bill => (
                  <tr key={bill.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-white font-mono text-xs">{bill.bill_number}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${TYPE_BADGE[bill.bill_type] || 'bg-zinc-700 text-gray-300'}`}>
                        {bill.bill_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{bill.payer_name || bill.payer_email || bill.payer_id?.slice(0, 8) || '--'}</td>
                    <td className="px-5 py-3 text-gray-400 truncate max-w-48">{bill.tournament_name || '--'}</td>
                    <td className="px-5 py-3 text-right text-white font-bold">EGP {(bill.grand_total || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_BADGE[bill.payment_status] || 'bg-zinc-700 text-gray-300'}`}>
                        {bill.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {bill.due_date ? format(new Date(bill.due_date), 'MMM dd, yyyy') : '--'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => navigate(`/staff/billing/${bill.bill_number}`)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                          title="View bill detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {bill.payment_status !== 'paid' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }}
                            className="text-green-400 hover:text-green-300 transition-colors p-1"
                            title="Mark as paid"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {bill.payment_status === 'paid' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedBill(bill); }}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
                            title="Mark as unpaid"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Detail Modal */}
      {selectedBill && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setSelectedBill(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{selectedBill.bill_number}</h2>
              <button onClick={() => setSelectedBill(null)} className="text-gray-500 hover:text-white text-xl">&times;</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Payer</p>
                <p className="text-white">{selectedBill.payer_name || selectedBill.payer_email || '--'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Amount</p>
                <p className="text-white font-bold">EGP {(selectedBill.grand_total || 0).toLocaleString()}</p>
              </div>
              {selectedBill.tournament_name && (
                <div>
                  <p className="text-gray-500 text-xs">Tournament</p>
                  <p className="text-white">{selectedBill.tournament_name}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs">Status</p>
                <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_BADGE[selectedBill.payment_status] || 'bg-zinc-700 text-gray-300'}`}>
                  {selectedBill.payment_status}
                </span>
              </div>
              {selectedBill.platform_fee > 0 && (
                <div>
                  <p className="text-gray-500 text-xs">Platform Fee</p>
                  <p className="text-red-400 font-medium">EGP {(selectedBill.platform_fee || 0).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedBill.payment_status !== 'paid' && (
                <button
                  onClick={() => markPaidMutation.mutate(selectedBill)}
                  disabled={markPaidMutation.isPending}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {markPaidMutation.isPending ? 'Updating...' : 'Mark as Paid'}
                </button>
              )}
              {selectedBill.payment_status === 'paid' && (
                <button
                  onClick={() => markUnpaidMutation.mutate(selectedBill)}
                  disabled={markUnpaidMutation.isPending}
                  className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {markUnpaidMutation.isPending ? 'Updating...' : 'Mark as Unpaid'}
                </button>
              )}
              {selectedBill.grand_total > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Zero out this entire bill? All items will be set to EGP 0 and the bill marked as paid.')) {
                      zeroOutMutation.mutate(selectedBill);
                    }
                  }}
                  disabled={zeroOutMutation.isPending}
                  className="flex-1 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {zeroOutMutation.isPending ? 'Zeroing...' : 'Zero Out Bill'}
                </button>
              )}
            </div>
            {(markPaidMutation.isError || markUnpaidMutation.isError || zeroOutMutation.isError) && (
              <p className="text-red-400 text-xs">
                Error: {(markPaidMutation.error || markUnpaidMutation.error || zeroOutMutation.error)?.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
