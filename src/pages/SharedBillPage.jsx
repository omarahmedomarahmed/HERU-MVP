import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { ChevronLeft, CreditCard, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Bill, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


export default function SharedBillPage() {
  const { bill_number } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    apiCall('/auth/me').then(setUser).catch(() => null);
  }, []);

  const { data: bill } = useQuery({
    queryKey: ['bill', bill_number],
    queryFn: async () => {
      const bills = await Bill.list({ bill_number });
      return bills?.[0] || null;
    },
    enabled: !!bill_number,
  });

  const { data: tournament } = useQuery({
    queryKey: ['bill-tournament', bill?.tournament_id],
    queryFn: async () => {
      if (!bill?.tournament_id) return null;
      const tours = await Tournament.list({ id: bill.tournament_id });
      return tours?.[0] || null;
    },
    enabled: !!bill?.tournament_id,
  });

  const { data: allBillsForTourney } = useQuery({
    queryKey: ['tournament-bills', bill?.tournament_id],
    queryFn: async () => {
      if (!bill?.tournament_id) return [];
      return Bill.list({ tournament_id: bill.tournament_id });
    },
    enabled: !!bill?.tournament_id && bill?.shared_tournament,
  });

  const handleMarkPaid = async () => {
    await Bill.update(bill.id, {
      payment_status: 'paid',
      paid_amount: bill.grand_total,
      paid_date: new Date().toISOString().split('T')[0],
    });
    alert('✓ Payment confirmed (test mode)');
    window.location.reload();
  };

  if (!bill) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">Bill not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-white mb-2">{bill.bill_number}</h1>
          <p className="text-gray-400">
            Issued {bill.issued_at ? format(new Date(bill.issued_at), 'MMM dd, yyyy') : '—'}
            {bill.due_date && ` • Due ${format(new Date(bill.due_date), 'MMM dd, yyyy')}`}
          </p>
        </div>

        {/* Tournament Info */}
        {tournament && (
          <FloatingPanel className="p-6">
            <h2 className="text-lg font-bold text-white mb-2">{tournament.name}</h2>
            <p className="text-gray-400">{tournament.game}</p>
          </FloatingPanel>
        )}

        {/* Shared Banner */}
        {bill.shared_tournament && (
          <FloatingPanel className="p-6 border-blue-500/30 bg-blue-500/5">
            <p className="text-blue-400 font-bold">📋 Shared Tournament Bill</p>
            <p className="text-blue-300 text-sm mt-1">All parties involved can view and manage this bill</p>
          </FloatingPanel>
        )}

        {/* All Parties */}
        {bill.shared_tournament && allBillsForTourney?.length > 0 && (
          <FloatingPanel className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">All Parties</h2>
            <div className="space-y-3">
              {allBillsForTourney.map((partyBill) => (
                <div key={partyBill.id} className="bg-zinc-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-white font-bold">{partyBill.payer_name}</p>
                      <p className="text-gray-400 text-sm capitalize">{partyBill.payer_type}</p>
                      <p className="text-gray-500 text-xs mt-1">{partyBill.bill_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black">EGP {(partyBill.grand_total || 0).toLocaleString()}</p>
                      <p className={`text-xs mt-1 ${partyBill.payment_status === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
                        {partyBill.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                      </p>
                    </div>
                  </div>

                  {/* Items for this party */}
                  {partyBill.items?.length > 0 && (
                    <div className="pt-3 border-t border-zinc-700 space-y-1">
                      {partyBill.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm text-gray-400">
                          <span>{item.title}</span>
                          <span>EGP {(item.subtotal || 0).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pay button for own bill */}
                  {user && partyBill.payer_id === user.id && partyBill.payment_status !== 'paid' && (
                    <button
                      onClick={handleMarkPaid}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Pay Now — EGP {(partyBill.grand_total || 0).toLocaleString()}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </FloatingPanel>
        )}

        {/* Items Breakdown */}
        {bill.items?.length > 0 && (
          <FloatingPanel className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">Items ({bill.items.length})</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 text-gray-400">Item</th>
                  <th className="text-left py-2 text-gray-400">Category</th>
                  <th className="text-center py-2 text-gray-400">Qty</th>
                  <th className="text-right py-2 text-gray-400">Price (EGP)</th>
                  <th className="text-right py-2 text-gray-400">Total (EGP)</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-3 text-white">{item.title}</td>
                    <td className="py-3 text-gray-400 capitalize">{item.category}</td>
                    <td className="py-3 text-center text-gray-300">{item.quantity || 1}</td>
                    <td className="py-3 text-right text-gray-300">EGP {(item.price || 0).toLocaleString()}</td>
                    <td className="py-3 text-right text-white font-bold">EGP {(item.subtotal || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">EGP {(bill.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">EGP {(bill.tax || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold">
                <span className="text-white">Grand Total</span>
                <span className="text-white text-lg">EGP {(bill.grand_total || 0).toLocaleString()}</span>
              </div>
            </div>
          </FloatingPanel>
        )}

        {/* Payment Status */}
        <FloatingPanel className="p-6">
          <h2 className="text-lg font-bold text-white mb-4">Payment Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-1">Current Status</p>
              <p className={`font-bold ${bill.payment_status === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
                {bill.payment_status === 'paid' ? '✓ PAID' : 'UNPAID'}
              </p>
            </div>
            {bill.payment_status !== 'paid' && user && bill.payer_id === user.id && (
              <GlowButton onClick={handleMarkPaid}>
                <CreditCard className="w-4 h-4" /> Pay Now
              </GlowButton>
            )}
          </div>
        </FloatingPanel>

        {/* Payment Method */}
        <FloatingPanel className="p-6 border-yellow-500/30 bg-yellow-500/5">
          <p className="text-yellow-400 flex items-center gap-2 font-bold mb-2">
            <Lock className="w-4 h-4" /> Paymob Integration — Coming Soon
          </p>
          <p className="text-yellow-300 text-sm">Payment processing will be available soon</p>
        </FloatingPanel>
      </div>
    </div>
  );
}