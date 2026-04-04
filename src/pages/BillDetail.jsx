import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrganizerSession } from '@/lib/auth-guards';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { ArrowLeft, Download, Copy, Check, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Bill, TournamentOrder } from '@/api/heruClient'


export default function BillDetail() {
  const { bill_id } = useParams();
  const navigate = useNavigate();
  const [session] = useState(getOrganizerSession());
  const [copied, setCopied] = useState(false);

  const { data: bill, isLoading } = useQuery({
    queryKey: ['bill', bill_id],
    queryFn: async () => {
      const bills = await Bill.list({ id: bill_id });
      return bills[0] || null;
    },
    enabled: !!bill_id,
  });

  const { data: tournamentOrder } = useQuery({
    queryKey: ['tournament-order-bill', bill?.tournament_order_id],
    queryFn: async () => {
      if (!bill?.tournament_order_id) return null;
      const orders = await TournamentOrder.list({ id: bill.tournament_order_id });
      return orders[0] || null;
    },
    enabled: !!bill?.tournament_order_id,
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <AnimatedBackground />
        <div className="animate-spin w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <AnimatedBackground />
        <FloatingPanel className="p-12 text-center">
          <h3 className="text-xl text-white font-bold">Bill not found</h3>
          <button onClick={() => navigate(-1)} className="mt-4 text-gray-400 hover:text-white flex items-center gap-2 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </FloatingPanel>
      </div>
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
    in_progress: 'bg-blue-500/20 text-blue-400',
    fulfilled: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };

  // Check if all items are fulfilled
  const allItemsFulfilled = tournamentOrder?.items?.every(item => item.status === 'fulfilled') || false;
  const fulfilledCount = tournamentOrder?.items?.filter(item => item.status === 'fulfilled').length || 0;
  const totalItems = tournamentOrder?.items?.length || 0;
  const canMarkAsPaid = allItemsFulfilled && bill?.payment_status !== 'paid';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AnimatedBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
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
              <p className="text-white font-bold">{bill.payer_name}</p>
              <p className="text-gray-400 text-sm">{bill.payer_email}</p>
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
            <div className="space-y-2">
              {bill.items?.map((item, i) => {
                const tourOrder = tournamentOrder?.items?.find(o => o.item_id === item.item_id);
                const itemStatus = tourOrder?.status || 'pending';
                return (
                  <div key={i} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-4 py-3">
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-gray-500 text-sm capitalize">{item.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${itemStatusColors[itemStatus] || 'bg-zinc-700 text-gray-300'}`}>
                        {itemStatus?.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">x{item.quantity}</p>
                        <p className="text-white font-bold">EGP {item.subtotal?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {tournamentOrder && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Fulfillment Progress: {fulfilledCount}/{totalItems} items fulfilled
                </p>
              </div>
            )}
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-6 mb-8 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">EGP {bill.subtotal?.toLocaleString()}</span>
            </div>
            {bill.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">EGP {bill.tax?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-zinc-700">
              <span className="text-white font-bold">Total Due</span>
              <span className="text-green-400 font-black text-xl">EGP {bill.grand_total?.toLocaleString()}</span>
            </div>
            {bill.paid_amount > 0 && (
              <div className="flex justify-between pt-2">
                <span className="text-gray-400">Paid</span>
                <span className="text-yellow-400">EGP {bill.paid_amount?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {!canMarkAsPaid && bill?.payment_status !== 'paid' && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-bold text-sm">Payment Blocked</p>
                <p className="text-yellow-300 text-sm mt-1">
                  All items must be fulfilled before marking this bill as paid. {fulfilledCount}/{totalItems} items are currently fulfilled.
                </p>
              </div>
            </div>
          )}

          {canMarkAsPaid && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">All items fulfilled. Ready to process payment.</p>
            </div>
          )}

          <div className="flex gap-3">
            <GlowButton onClick={downloadPDF} className="flex-1">
              <Download className="w-4 h-4" /> Download as Text
            </GlowButton>
            <GlowButton onClick={copyToClipboard} variant="ghost" className="flex-1">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Info'}
            </GlowButton>
            {bill?.payment_status !== 'paid' && (
              <GlowButton disabled={!canMarkAsPaid} className="flex-1">
                <DollarSign className="w-4 h-4" /> Mark as Paid {canMarkAsPaid ? '' : '(Blocked)'}
              </GlowButton>
            )}
          </div>

          {bill.notes && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <p className="text-gray-400 text-sm mb-2">Notes</p>
              <p className="text-gray-300">{bill.notes}</p>
            </div>
          )}
        </FloatingPanel>
      </div>
    </div>
  );
}