import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Eye, ChevronRight, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Bill } from '@/api/heruClient'


export default function StaffBilling() {
  const [billTypeFilter, setBillTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const [payerSearch, setPayerSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const { data: bills = [] } = useQuery({
    queryKey: ['all-bills'],
    queryFn: () => Bill.list('-created_date'),
  });

  const uniqueTournaments = useMemo(() => {
    const tourneyNames = bills
      .map(b => b.tournament_name)
      .filter(Boolean);
    return [...new Set(tourneyNames)];
  }, [bills]);

  const filteredBills = useMemo(() => {
    return bills.filter(b => {
      const typeMatch = billTypeFilter === 'all' || b.bill_type === billTypeFilter;
      const statusMatch = statusFilter === 'all' || b.payment_status === statusFilter;
      const tourneyMatch = tournamentFilter === 'all' || b.tournament_name === tournamentFilter;
      const payerMatch = !payerSearch || (b.payer_name?.toLowerCase().includes(payerSearch.toLowerCase()));
      return typeMatch && statusMatch && tourneyMatch && payerMatch;
    });
  }, [bills, billTypeFilter, statusFilter, tournamentFilter, payerSearch]);

  const totalBilled = bills.reduce((sum, b) => sum + (b.grand_total || 0), 0);
  const totalPaid = bills
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + (b.grand_total || 0), 0);
  const totalUnpaid = bills
    .filter(b => b.payment_status === 'unpaid')
    .reduce((sum, b) => sum + (b.grand_total || 0), 0);
  const sharedCount = bills.filter(b => b.shared_tournament).length;

  const groupedByTournament = useMemo(() => {
    const groups = {};
    const standaloneSharedBills = [];

    filteredBills.forEach(bill => {
      if (bill.shared_tournament && bill.tournament_id) {
        if (!groups[bill.tournament_id]) {
          groups[bill.tournament_id] = {
            tournamentId: bill.tournament_id,
            tournamentName: bill.tournament_name,
            bills: [],
          };
        }
        groups[bill.tournament_id].bills.push(bill);
      } else {
        standaloneSharedBills.push(bill);
      }
    });

    return { groups, standaloneSharedBills };
  }, [filteredBills]);

  const typeBadge = (type) => {
    const styles = {
      gamer: 'bg-gray-500/20 text-gray-300',
      organizer: 'bg-blue-500/20 text-blue-400',
      co_organizer: 'bg-cyan-500/20 text-cyan-400',
    };
    const labels = {
      gamer: 'Gamer',
      organizer: 'Organizer',
      co_organizer: 'Co-Organizer',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${styles[type] || 'bg-gray-700'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const statusBadge = (status) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400',
      unpaid: 'bg-red-500/20 text-red-400',
      partial: 'bg-amber-500/20 text-amber-400',
      overdue: 'bg-orange-500/20 text-orange-400',
    };
    const labels = {
      paid: '✓ Paid',
      unpaid: 'Unpaid',
      partial: 'Partial',
      overdue: 'Overdue',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${styles[status] || 'bg-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">BILLING <span className="text-red-500">DASHBOARD</span></h1>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <FloatingPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Billed</p>
              <p className="text-white font-black text-2xl">EGP {totalBilled.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-yellow-500 opacity-50" />
          </div>
        </FloatingPanel>

        <FloatingPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Paid</p>
              <p className="text-green-400 font-black text-2xl">EGP {totalPaid.toLocaleString()}</p>
            </div>
            <Check className="w-10 h-10 text-green-500 opacity-50" />
          </div>
        </FloatingPanel>

        <FloatingPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Unpaid</p>
              <p className="text-red-400 font-black text-2xl">EGP {totalUnpaid.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </FloatingPanel>

        <FloatingPanel className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Shared Bills</p>
              <p className="text-blue-400 font-black text-2xl">{sharedCount}</p>
            </div>
            <ChevronRight className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </FloatingPanel>
      </div>

      {/* Filters */}
      <FloatingPanel className="p-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase mb-4">Filters</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-xs text-gray-500 block mb-2">Bill Type</label>
            <Select value={billTypeFilter} onValueChange={setBillTypeFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="gamer">Gamer</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="co_organizer">Co-Organizer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Payment Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Tournament</label>
            <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="all">All</SelectItem>
                {uniqueTournaments.map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2">
            <label className="text-xs text-gray-500 block mb-2">Payer Name</label>
            <Input
              type="text"
              placeholder="Search payer..."
              value={payerSearch}
              onChange={e => setPayerSearch(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
      </FloatingPanel>

      {/* Bills Table */}
      <FloatingPanel className="p-6 overflow-x-auto">
        <h2 className="text-lg font-bold text-white mb-6">All Bills ({filteredBills.length})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-gray-400 py-3 px-4 font-medium">Bill Number</th>
              <th className="text-left text-gray-400 py-3 px-4 font-medium">Type</th>
              <th className="text-left text-gray-400 py-3 px-4 font-medium">Payer</th>
              <th className="text-left text-gray-400 py-3 px-4 font-medium">Tournament</th>
              <th className="text-right text-gray-400 py-3 px-4 font-medium">Amount (EGP)</th>
              <th className="text-left text-gray-400 py-3 px-4 font-medium">Status</th>
              <th className="text-center text-gray-400 py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Shared Tournament Groups */}
            {Object.values(groupedByTournament.groups).map((group) => (
              <React.Fragment key={group.tournamentId}>
                <tr className="border-t border-zinc-800 bg-zinc-900/30">
                  <td colSpan="7" className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{group.tournamentName}</span>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Shared Bill</span>
                    </div>
                  </td>
                </tr>
                {group.bills.map((bill) => (
                  <tr key={bill.id} className="border-t border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="py-3 px-4 text-white">{bill.bill_number}</td>
                    <td className="py-3 px-4">{typeBadge(bill.bill_type)}</td>
                    <td className="py-3 px-4 text-gray-300">{bill.payer_name}</td>
                    <td className="py-3 px-4 text-gray-400">—</td>
                    <td className="py-3 px-4 text-white font-bold text-right">EGP {(bill.grand_total || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">{statusBadge(bill.payment_status)}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => setSelectedBill(bill)} className="text-blue-400 hover:text-blue-300">
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}

            {/* Solo & Gamer Bills */}
            {groupedByTournament.standaloneSharedBills.map((bill) => (
              <tr key={bill.id} className="border-t border-zinc-800 hover:bg-zinc-800/20">
                <td className="py-3 px-4 text-white">{bill.bill_number}</td>
                <td className="py-3 px-4">{typeBadge(bill.bill_type)}</td>
                <td className="py-3 px-4 text-gray-300">{bill.payer_name}</td>
                <td className="py-3 px-4 text-gray-400">{bill.tournament_name || '—'}</td>
                <td className="py-3 px-4 text-white font-bold text-right">EGP {(bill.grand_total || 0).toLocaleString()}</td>
                <td className="py-3 px-4">{statusBadge(bill.payment_status)}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => setSelectedBill(bill)} className="text-blue-400 hover:text-blue-300">
                    <Eye className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </FloatingPanel>

      {/* Bill Detail Panel */}
      <AnimatePresence>
        {selectedBill && <BillDetailPanel bill={selectedBill} onClose={() => setSelectedBill(null)} bills={bills} />}
      </AnimatePresence>
    </div>
  );
}

function BillDetailPanel({ bill, onClose, bills }) {
  const [notes, setNotes] = React.useState(bill.notes || '');
  const [saving, setSaving] = React.useState(false);
  const queryClient = useQueryClient();

  const relatedBills = bill.shared_tournament && bill.tournament_id
    ? bills.filter(b => b.tournament_id === bill.tournament_id && b.id !== bill.id)
    : [];

  const handleMarkPaid = async () => {
    setSaving(true);
    try {
      await Bill.update(bill.id, {
        payment_status: 'paid',
        paid_amount: bill.grand_total,
        paid_date: new Date().toISOString().split('T')[0],
      });
      if (queryClient) queryClient.invalidateQueries(['all-bills']);
      alert('✓ Bill marked as paid');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleMarkUnpaid = async () => {
    setSaving(true);
    try {
      await Bill.update(bill.id, {
        payment_status: 'unpaid',
        paid_amount: 0,
        paid_date: null,
      });
      if (queryClient) queryClient.invalidateQueries(['all-bills']);
      alert('✓ Bill marked as unpaid');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await Bill.update(bill.id, { notes });
      if (queryClient) queryClient.invalidateQueries(['all-bills']);
      alert('✓ Notes saved');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur">
          <h2 className="text-xl font-bold text-white">{bill.bill_number}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Issued Date</p>
              <p className="text-white font-bold">{bill.issued_at ? format(new Date(bill.issued_at), 'MMM dd, yyyy') : '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Due Date</p>
              <p className="text-white font-bold">{bill.due_date ? format(new Date(bill.due_date), 'MMM dd, yyyy') : '—'}</p>
            </div>
          </div>

          {/* Payer Info */}
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-gray-500 text-xs uppercase mb-3 font-bold">Payer</p>
            <div className="space-y-2">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="text-white font-bold">{bill.payer_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">{bill.payer_email}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Type</p>
                <p className="text-white capitalize">{bill.payer_type}</p>
              </div>
            </div>
          </div>

          {/* Tournament Info */}
          {bill.tournament_name && (
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-gray-400 text-sm">Tournament</p>
              <p className="text-white font-bold">{bill.tournament_name}</p>
            </div>
          )}

          {/* Items */}
          {bill.items?.length > 0 && (
            <div>
              <h3 className="text-white font-bold mb-3">Items</h3>
              <div className="space-y-2">
                {bill.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-zinc-800">
                    <div>
                      <p className="text-white">{item.title}</p>
                      <p className="text-gray-500 text-xs">{item.category} • Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">EGP {(item.subtotal || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <p className="text-gray-400">Subtotal</p>
              <p className="text-white">EGP {(bill.subtotal || 0).toLocaleString()}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p className="text-gray-400">Tax</p>
              <p className="text-white">EGP {(bill.tax || 0).toLocaleString()}</p>
            </div>
            <div className="flex justify-between border-t border-zinc-700 pt-2">
              <p className="text-white font-bold">Grand Total</p>
              <p className="text-white font-black text-lg">EGP {(bill.grand_total || 0).toLocaleString()}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs uppercase mb-1">Payment Status</p>
              <div className="flex items-center gap-2">
                {bill.payment_status === 'paid' ? (
                  <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded font-bold">✓ PAID</span>
                ) : (
                  <span className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded font-bold">UNPAID</span>
                )}
              </div>
            </div>
            <div>
              {bill.payment_status === 'paid' ? (
                <GlowButton variant="secondary" size="sm" onClick={handleMarkUnpaid} disabled={saving}>
                  Mark as Unpaid
                </GlowButton>
              ) : (
                <GlowButton size="sm" onClick={handleMarkPaid} disabled={saving}>
                  Mark as Paid
                </GlowButton>
              )}
            </div>
          </div>

          {/* Shared Bill Info */}
          {bill.shared_tournament && relatedBills.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h3 className="text-blue-400 font-bold mb-3">Other Parties on This Bill</h3>
              <div className="space-y-3">
                {relatedBills.map(rBill => (
                  <div key={rBill.id} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                    <div>
                      <p className="text-white font-bold">{rBill.bill_number}</p>
                      <p className="text-gray-400 text-sm">{rBill.payer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">EGP {(rBill.grand_total || 0).toLocaleString()}</p>
                      <p className={`text-xs ${rBill.payment_status === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
                        {rBill.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-gray-500 text-xs uppercase mb-2 font-bold">Internal Notes</p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white text-sm"
              rows={3}
              placeholder="Add notes..."
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-bold"
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}