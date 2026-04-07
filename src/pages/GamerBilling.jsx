import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { useToast } from '@/components/ui/use-toast';
import { Bill, apiCall } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import {
  Wallet, CreditCard, Receipt, DollarSign, Clock,
  CheckCircle, AlertCircle, Plus, Trash2,
  ChevronDown, ChevronRight
} from 'lucide-react';

const STATUS_CONFIG = {
  paid:    { icon: CheckCircle, label: 'Paid',    color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  unpaid:  { icon: Clock,       label: 'Unpaid',  color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  partial: { icon: AlertCircle, label: 'Partial', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  overdue: { icon: AlertCircle, label: 'Overdue', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unpaid;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.bg} border ${config.border}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function formatEGP(amount) {
  if (amount == null) return 'EGP 0';
  return `EGP ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function BillCard({ bill }) {
  const [expanded, setExpanded] = useState(false);
  const items = bill.items || [];
  const itemsSummary = items.length > 0
    ? items.slice(0, 3).map(i => i.title || i.name || 'Item').join(', ') + (items.length > 3 ? ` +${items.length - 3} more` : '')
    : 'No items';

  return (
    <FloatingPanel className="overflow-hidden">
      {/* Clickable header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-red-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-semibold text-sm">{bill.bill_number || 'N/A'}</span>
              <StatusBadge status={bill.payment_status} />
            </div>
            <p className="text-zinc-400 text-xs mt-0.5 truncate">
              {bill.issued_at ? format(new Date(bill.issued_at), 'MMM d, yyyy') : 'No date'}
              {' — '}
              {itemsSummary}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-white font-bold text-sm">{formatEGP(bill.grand_total)}</span>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-zinc-400" />
            : <ChevronRight className="w-4 h-4 text-zinc-400" />
          }
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-zinc-800/60 px-4 py-4 space-y-4">
          {/* Itemized list */}
          {items.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Items</h4>
              <div className="space-y-1.5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{item.title || item.name || 'Item'}</span>
                    <span className="text-zinc-400">
                      {item.quantity && item.quantity > 1 ? `${item.quantity} x ` : ''}
                      {formatEGP(item.price || item.amount || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals breakdown */}
          <div className="border-t border-zinc-800/40 pt-3 space-y-1.5">
            {bill.subtotal != null && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Subtotal</span>
                <span className="text-zinc-300">{formatEGP(bill.subtotal)}</span>
              </div>
            )}
            {bill.platform_fee != null && Number(bill.platform_fee) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Platform Fee (15%)</span>
                <span className="text-zinc-300">{formatEGP(bill.platform_fee)}</span>
              </div>
            )}
            {bill.tax != null && Number(bill.tax) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Tax</span>
                <span className="text-zinc-300">{formatEGP(bill.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-1 border-t border-zinc-800/40">
              <span className="text-white">Grand Total</span>
              <span className="text-white">{formatEGP(bill.grand_total)}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="border-t border-zinc-800/40 pt-3 space-y-1.5">
            {bill.payment_method && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Payment Method</span>
                <span className="text-zinc-300">{bill.payment_method}</span>
              </div>
            )}
            {bill.paid_amount != null && Number(bill.paid_amount) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Paid Amount</span>
                <span className="text-green-400">{formatEGP(bill.paid_amount)}</span>
              </div>
            )}
            {bill.due_date && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Due Date</span>
                <span className="text-zinc-300">{format(new Date(bill.due_date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          {/* Pay Now button for unpaid/partial bills */}
          {(bill.payment_status === 'unpaid' || bill.payment_status === 'partial' || bill.payment_status === 'overdue') && (
            <div className="pt-2">
              <Link to={`/bill/${bill.bill_number}`}>
                <GlowButton variant="primary" size="md" className="w-full">
                  Pay Now
                </GlowButton>
              </Link>
            </div>
          )}
        </div>
      )}
    </FloatingPanel>
  );
}

function PaymentMethodCard({ method, isDefault, onSetDefault, onDelete }) {
  const brandIcon = method.brand?.toLowerCase() === 'visa' ? 'Visa' : method.brand?.toLowerCase() === 'mastercard' ? 'Mastercard' : method.brand || 'Card';

  return (
    <FloatingPanel className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{brandIcon}</span>
              <span className="text-zinc-400 text-sm">**** {method.last4 || '0000'}</span>
              {isDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                  Default
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">Expires {method.expiry || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <button
              onClick={() => onSetDefault?.(method.id)}
              className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-white/5"
            >
              Set Default
            </button>
          )}
          <button
            onClick={() => onDelete?.(method.id)}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </FloatingPanel>
  );
}

const TABS = [
  { key: 'all',      label: 'All Bills' },
  { key: 'unpaid',   label: 'Unpaid' },
  { key: 'paid',     label: 'Paid' },
  { key: 'methods',  label: 'Payment Methods' },
];

export default function GamerBilling() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch bills for current user
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['gamer-bills', user?.id],
    queryFn: () => Bill.list({ payer_id: user?.id }),
    enabled: !!user?.id,
  });

  // Stats
  const totalBills = bills.length;
  const unpaidBills = bills.filter(b => b.payment_status === 'unpaid' || b.payment_status === 'partial' || b.payment_status === 'overdue');
  const paidBills = bills.filter(b => b.payment_status === 'paid');
  const unpaidAmount = unpaidBills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);
  const paidAmount = paidBills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);

  // Filter bills by tab
  const filteredBills = activeTab === 'all'
    ? bills
    : activeTab === 'unpaid'
      ? unpaidBills
      : activeTab === 'paid'
        ? paidBills
        : [];

  // Placeholder payment methods
  const [paymentMethods] = useState([]);
  const [defaultMethodId] = useState(null);

  const handleSetDefault = (id) => {
    toast({ title: 'Coming Soon', description: 'Payment method management will be available soon.' });
  };

  const handleDeleteMethod = (id) => {
    toast({ title: 'Coming Soon', description: 'Payment method management will be available soon.' });
  };

  const handleAddMethod = () => {
    toast({ title: 'Coming Soon', description: 'Paymob payment integration is coming soon.' });
  };

  const stats = [
    { label: 'Total Bills', value: totalBills, icon: Receipt, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Unpaid Amount', value: formatEGP(unpaidAmount), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Paid Amount', value: formatEGP(paidAmount), icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <GamerLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Billing & Payments</h1>
            <p className="text-zinc-400 text-sm">Manage your bills and payment methods</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <FloatingPanel key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs">{stat.label}</p>
                    <p className="text-white font-bold text-lg">{stat.value}</p>
                  </div>
                </div>
              </FloatingPanel>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900/60 rounded-lg p-1 border border-zinc-800/60">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
              {tab.key === 'unpaid' && unpaidBills.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-yellow-500/20 text-yellow-400">
                  {unpaidBills.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab !== 'methods' ? (
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
              </div>
            ) : filteredBills.length === 0 ? (
              <FloatingPanel className="p-8 text-center">
                <Receipt className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">
                  {activeTab === 'all' ? 'No bills yet' : activeTab === 'unpaid' ? 'No unpaid bills' : 'No paid bills'}
                </p>
              </FloatingPanel>
            ) : (
              filteredBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))
            )}
          </div>
        ) : (
          /* Payment Methods Tab */
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <FloatingPanel className="p-8 text-center">
                <CreditCard className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm mb-1">No payment methods saved</p>
                <p className="text-zinc-500 text-xs">Add a payment method to make paying bills faster</p>
              </FloatingPanel>
            ) : (
              paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  isDefault={method.id === defaultMethodId}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDeleteMethod}
                />
              ))
            )}

            <GlowButton
              variant="secondary"
              size="md"
              onClick={handleAddMethod}
              className="w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Payment Method
            </GlowButton>

            {/* Coming soon notice */}
            <FloatingPanel className="p-4 border-yellow-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Coming Soon</p>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Paymob payment integration is being set up. You will be able to save cards and pay bills directly from this page.
                  </p>
                </div>
              </div>
            </FloatingPanel>
          </div>
        )}
      </div>
    </GamerLayout>
  );
}
