import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { ArrowLeft, Download, Copy, Check, DollarSign, AlertCircle, CheckCircle, Users, CreditCard, Shield, Ban, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Bill, TournamentOrder, Staff } from '@/api/heruClient'


export default function BillDetail() {
  const { bill_number } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('test');

  // Detect if accessed from a staff route
  const isStaffView = location.pathname.startsWith('/staff/');

  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill', bill_number],
    queryFn: () => Bill.getByNumber(bill_number),
    enabled: !!bill_number,
  });

  const { data: tournamentOrder } = useQuery({
    queryKey: ['tournament-order-bill', bill?.tournament_order_id],
    queryFn: () => bill?.tournament_order_id ? TournamentOrder.get(bill.tournament_order_id) : null,
    enabled: !!bill?.tournament_order_id,
  });

  // For shared bills: fetch all bills for the same tournament
  const { data: sharedBills = [] } = useQuery({
    queryKey: ['shared-bills', bill?.tournament_id],
    queryFn: () => Bill.list({ tournament_id: bill.tournament_id }),
    enabled: !!bill?.shared_tournament && !!bill?.tournament_id,
  });

  const payMutation = useMutation({
    mutationFn: () => Bill.markPaid(bill.id, { payment_method: paymentMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bill', bill_number]);
      queryClient.invalidateQueries(['shared-bills']);
    },
  });

  // ---- Staff God-Mode mutations ----
  const staffMarkPaidMutation = useMutation({
    mutationFn: () => Staff.updateBill(bill.id, {
      payment_status: 'paid',
      paid_amount: bill.grand_total,
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: 'staff_override',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bill', bill_number]);
      queryClient.invalidateQueries(['shared-bills']);
      queryClient.invalidateQueries(['staff-all-bills']);
      queryClient.invalidateQueries(['staff-revenue-bills']);
    },
  });

  const staffMarkUnpaidMutation = useMutation({
    mutationFn: () => Staff.updateBill(bill.id, {
      payment_status: 'unpaid',
      paid_amount: 0,
      paid_date: null,
      payment_method: null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['bill', bill_number]);
      queryClient.invalidateQueries(['shared-bills']);
      queryClient.invalidateQueries(['staff-all-bills']);
      queryClient.invalidateQueries(['staff-revenue-bills']);
    },
  });

  const staffZeroOutMutation = useMutation({
    mutationFn: () => {
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
      queryClient.invalidateQueries(['bill', bill_number]);
      queryClient.invalidateQueries(['shared-bills']);
      queryClient.invalidateQueries(['staff-all-bills']);
      queryClient.invalidateQueries(['staff-revenue-bills']);
    },
  });

  const staffZeroItemMutation = useMutation({
    mutationFn: (itemIndex) => {
      const updatedItems = [...(bill.items || [])];
      const item = updatedItems[itemIndex];
      updatedItems[itemIndex] = {
        ...item,
        original_price: item.subtotal ?? item.price ?? 0,
        price: 0,
        subtotal: 0,
      };
      const newSubtotal = updatedItems.reduce((sum, it) => sum + (it.subtotal ?? it.price ?? 0), 0);
      const newPlatformFee = Math.round(newSubtotal * 0.15);
      const newGrandTotal = newSubtotal + newPlatformFee + (bill.tax || 0);
      return Staff.updateBill(bill.id, {
        items: updatedItems,
        subtotal: newSubtotal,
        platform_fee: newPlatformFee,
        grand_total: newGrandTotal,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bill', bill_number]);
      queryClient.invalidateQueries(['shared-bills']);
      queryClient.invalidateQueries(['staff-all-bills']);
      queryClient.invalidateQueries(['staff-revenue-bills']);
    },
  });

  const downloadPDF = () => {
    if (!bill) return;
    const content = `
BILL #${bill.bill_number}
${bill.payer_name}
${bill.payer_email}

Tournament: ${bill.tournament_name}
Issued: ${format(new Date(bill.issued_at), 'MMM dd, yyyy')}
Due: ${bill.due_date ? format(new Date(bill.due_date), 'MMM dd, yyyy') : 'N/A'}

ITEMS:
${bill.items?.map(item => `${item.title} x${item.quantity}: EGP ${item.subtotal?.toLocaleString()}`).join('\n')}

Subtotal: EGP ${bill.subtotal?.toLocaleString()}
Tax: EGP ${bill.tax?.toLocaleString()}
Total: EGP ${bill.grand_total?.toLocaleString()}

Paid: EGP ${bill.paid_amount?.toLocaleString()}
Status: ${bill.payment_status?.toUpperCase()}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_${bill.bill_number}.txt`;
    a.click();
  };

  const copyToClipboard = () => {
    if (!bill) return;
    const content = `Bill #${bill.bill_number}\n${bill.payer_name}\n\nTotal: EGP ${bill.grand_total?.toLocaleString()}\nStatus: ${bill.payment_status}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!bill) {
    return (
      <FloatingPanel className="p-12 text-center">
        <h3 className="text-xl text-white font-bold">Bill not found</h3>
        <button onClick={() => navigate(-1)} className="mt-4 text-gray-400 hover:text-white flex items-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </FloatingPanel>
    );
  }

  const statusColors = {
    paid: 'bg-green-500/20 text-green-400',
    partial: 'bg-yellow-500/20 text-yellow-400',
    unpaid: 'bg-red-500/20 text-red-400',
    overdue: 'bg-red-600/20 text-red-300',
  };

  const itemStatusColors = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-red-500/20 text-red-400',
    fulfilled: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  // Check if all items are fulfilled
  const allItemsFulfilled = tournamentOrder?.items?.every(item => item.status === 'fulfilled') || false;
  const fulfilledCount = tournamentOrder?.items?.filter(item => item.status === 'fulfilled').length || 0;
  const totalItems = tournamentOrder?.items?.length || 0;
  const canMarkAsPaid = allItemsFulfilled && bill?.payment_status !== 'paid';

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(isStaffView ? '/staff/billing' : '/organizer/billing')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Billing
      </button>

        <FloatingPanel className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Bill #{bill.bill_number}</h1>
              <p className="text-gray-400">{bill.tournament_name}</p>
            </div>
            <span className={`text-sm font-bold px-4 py-2 rounded-full ${statusColors[bill.payment_status]}`}>
              {bill.payment_status?.toUpperCase()}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-zinc-800">
            <div>
              <p className="text-gray-400 text-sm mb-1">Bill To</p>
              <p className="text-white font-bold">{bill.payer_name || bill.payer_email?.split('@')[0] || 'Organizer'}</p>
              <p className="text-gray-400 text-sm">{bill.payer_email || '—'}</p>
              {bill.bill_type && (
                <p className="text-gray-500 text-xs mt-1 capitalize">{bill.bill_type.replace(/_/g, ' ')}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm mb-1">Issued</p>
              <p className="text-white font-bold">{format(new Date(bill.issued_at), 'MMM dd, yyyy')}</p>
              {bill.due_date && (
                <>
                  <p className="text-gray-400 text-sm mt-2">Due</p>
                  <p className="text-white">{format(new Date(bill.due_date), 'MMM dd, yyyy')}</p>
                </>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">Bill Items & Fulfillment Status</h2>
            {(!bill.items || bill.items.length === 0) ? (
              <div className="text-center py-6 text-gray-500 text-sm bg-zinc-800/30 rounded-lg">
                No itemized breakdown available for this bill.
              </div>
            ) : (
            <div className="space-y-2">
              {bill.items.map((item, i) => {
                const tourOrder = tournamentOrder?.items?.find(o => o.item_id === item.item_id);
                const itemStatus = tourOrder?.status || 'pending';
                const itemPrice = item.subtotal ?? item.price ?? 0;
                const itemQty = item.quantity ?? 1;
                return (
                  <div key={i} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-4 py-3">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.title || item.name || 'Item'}</p>
                      <p className="text-gray-500 text-sm capitalize">{item.category || '—'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${itemStatusColors[itemStatus] || 'bg-zinc-700 text-gray-300'}`}>
                        {itemStatus?.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">x{itemQty}</p>
                        <p className="text-white font-bold">EGP {itemPrice.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
            {tournamentOrder && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Fulfillment Progress: {fulfilledCount}/{totalItems} items fulfilled
                </p>
              </div>
            )}
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-6 mb-8 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">EGP {(bill.subtotal ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-400">Platform Fee (15%)</span>
              <span className="text-red-400">EGP {(bill.platform_fee ?? 0).toLocaleString()}</span>
            </div>
            {(bill.tax ?? 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">EGP {bill.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-zinc-700">
              <span className="text-white font-bold">Total Due</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-cyan-400 font-black text-xl">
                EGP {(bill.grand_total ?? 0).toLocaleString()}
              </span>
            </div>
            {bill.paid_amount > 0 && (
              <div className="flex justify-between pt-2">
                <span className="text-gray-400">Paid</span>
                <span className="text-green-400 font-bold">EGP {bill.paid_amount?.toLocaleString()}</span>
              </div>
            )}
            {bill.shared_tournament && bill.total_tournament_cost > 0 && (
              <div className="flex justify-between pt-2 text-xs">
                <span className="text-gray-500">Your share of total tournament cost</span>
                <span className="text-gray-400">
                  {Math.round((bill.grand_total / bill.total_tournament_cost) * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Shared Tournament — All Parties */}
          {bill.shared_tournament && sharedBills.length > 1 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                All Parties ({sharedBills.length})
              </h2>
              <div className="space-y-2">
                {sharedBills.map(sb => (
                  <div key={sb.id} className={`flex items-center justify-between px-4 py-3 rounded-lg ${sb.id === bill.id ? 'bg-red-500/10 border border-red-500/30' : 'bg-zinc-800/40'}`}>
                    <div>
                      <p className="text-white font-medium">{sb.payer_name || sb.payer_email?.split('@')[0] || 'Organizer'}</p>
                      <p className="text-xs text-gray-500 capitalize">{sb.bill_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${sb.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {sb.payment_status}
                      </span>
                      <span className="text-white font-bold">EGP {sb.grand_total?.toLocaleString()}</span>
                      {sb.total_tournament_cost > 0 && (
                        <span className="text-gray-500 text-xs">({Math.round((sb.grand_total / sb.total_tournament_cost) * 100)}%)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====== Staff God-Mode Controls ====== */}
          {isStaffView && (
            <div className="mb-8 p-5 bg-zinc-800/70 border-2 border-amber-500/40 rounded-xl">
              <h3 className="text-white font-bold mb-1 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-amber-400" />
                Staff Controls
              </h3>
              <p className="text-gray-500 text-xs mb-4">Admin overrides for this bill. Actions take effect immediately.</p>

              {/* Per-item zero-out buttons */}
              {bill.items && bill.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">Zero Out Individual Items</p>
                  <div className="space-y-1.5">
                    {bill.items.map((item, idx) => {
                      const itemPrice = item.subtotal ?? item.price ?? 0;
                      const isZeroed = itemPrice === 0;
                      return (
                        <div key={idx} className="flex items-center justify-between bg-zinc-900/60 rounded-lg px-3 py-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-sm truncate block">{item.title || item.name || `Item ${idx + 1}`}</span>
                            {item.original_price != null && item.original_price !== itemPrice && (
                              <span className="text-gray-500 text-xs line-through">EGP {item.original_price.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className={`text-sm font-medium ${isZeroed ? 'text-gray-500' : 'text-white'}`}>
                              EGP {itemPrice.toLocaleString()}
                            </span>
                            {!isZeroed && (
                              <button
                                onClick={() => staffZeroItemMutation.mutate(idx)}
                                disabled={staffZeroItemMutation.isPending}
                                className="px-2 py-1 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition-colors font-medium"
                                title="Set this item price to zero"
                              >
                                Zero
                              </button>
                            )}
                            {isZeroed && (
                              <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-500 rounded font-medium">Zeroed</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {staffZeroItemMutation.isError && (
                    <p className="text-red-400 text-xs mt-2">Failed to zero item: {staffZeroItemMutation.error?.message}</p>
                  )}
                </div>
              )}

              {/* Bulk actions */}
              <div className="flex flex-wrap gap-2">
                {bill.payment_status !== 'paid' && (
                  <button
                    onClick={() => staffMarkPaidMutation.mutate()}
                    disabled={staffMarkPaidMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {staffMarkPaidMutation.isPending ? 'Updating...' : 'Mark as Paid'}
                  </button>
                )}
                {bill.payment_status === 'paid' && (
                  <button
                    onClick={() => staffMarkUnpaidMutation.mutate()}
                    disabled={staffMarkUnpaidMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {staffMarkUnpaidMutation.isPending ? 'Updating...' : 'Mark as Unpaid'}
                  </button>
                )}
                {bill.grand_total > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Zero out the entire bill? This sets all items to EGP 0 and marks the bill as paid. This cannot be easily undone.')) {
                        staffZeroOutMutation.mutate();
                      }
                    }}
                    disabled={staffZeroOutMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {staffZeroOutMutation.isPending ? 'Zeroing...' : 'Zero Out Entire Bill'}
                  </button>
                )}
              </div>

              {/* Feedback messages */}
              {staffMarkPaidMutation.isSuccess && <p className="text-green-400 text-xs mt-2">Bill marked as paid.</p>}
              {staffMarkUnpaidMutation.isSuccess && <p className="text-amber-400 text-xs mt-2">Bill marked as unpaid.</p>}
              {staffZeroOutMutation.isSuccess && <p className="text-red-400 text-xs mt-2">Bill has been zeroed out.</p>}
              {(staffMarkPaidMutation.isError || staffMarkUnpaidMutation.isError || staffZeroOutMutation.isError) && (
                <p className="text-red-400 text-xs mt-2">
                  Error: {(staffMarkPaidMutation.error || staffMarkUnpaidMutation.error || staffZeroOutMutation.error)?.message}
                </p>
              )}
            </div>
          )}

          {/* Payment Section */}
          {bill.payment_status !== 'paid' && (
            <div className="mb-6 p-5 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-400" />
                Payment Method
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['test', 'bank_transfer', 'paymob'].map(method => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-lg text-sm text-center transition-all ${paymentMethod === method
                      ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                      : 'bg-zinc-800 border border-zinc-700 text-gray-400 hover:border-zinc-600'
                    }`}
                  >
                    {method === 'test' ? 'Test Mode' : method === 'bank_transfer' ? 'Bank Transfer' : 'Paymob Card'}
                  </button>
                ))}
              </div>
              {paymentMethod === 'paymob' && (
                <p className="text-xs text-gray-500 mb-3">Paymob integration coming soon. Use Test Mode for now.</p>
              )}
              <GlowButton
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending || paymentMethod === 'paymob'}
                className="w-full bg-gradient-to-r from-red-600 to-red-600 hover:from-red-500 hover:to-red-500"
              >
                <DollarSign className="w-4 h-4" />
                {payMutation.isPending ? 'Processing...' : `Pay EGP ${bill.grand_total?.toLocaleString()}`}
              </GlowButton>
              {payMutation.isError && (
                <p className="text-red-400 text-sm mt-2">Payment failed: {payMutation.error?.message}</p>
              )}
            </div>
          )}

          {bill.payment_status === 'paid' && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-bold text-sm">Payment Complete</p>
                <p className="text-green-300 text-xs mt-0.5">
                  Paid EGP {bill.paid_amount?.toLocaleString()} via {bill.payment_method || 'test'} on {bill.paid_date ? format(new Date(bill.paid_date), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <GlowButton onClick={downloadPDF} variant="ghost" className="flex-1">
              <Download className="w-4 h-4" /> Download
            </GlowButton>
            <GlowButton onClick={copyToClipboard} variant="ghost" className="flex-1">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Info'}
            </GlowButton>
          </div>

          {bill.notes && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-gray-400 text-sm mb-2">Notes</p>
              <p className="text-gray-300">{bill.notes}</p>
            </div>
          )}
        </FloatingPanel>
    </div>
  );
}