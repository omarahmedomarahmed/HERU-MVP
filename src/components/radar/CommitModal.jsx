import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import GlowButton from '@/components/ui/GlowButton';
import FundingBar from './FundingBar';
import { Check, AlertCircle, TrendingUp } from 'lucide-react';

export default function CommitModal({ radar, profile, onClose, onConfirm, isLoading }) {
  const [amount, setAmount] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  if (!radar) return null;

  const commitAmount = parseFloat(amount) || 0;
  const remaining = radar.amount_still_needed || 0;
  const totalCost = radar.total_cost || 0;
  const myPercent = totalCost > 0 ? Math.round((commitAmount / totalCost) * 100) : 0;
  const newFundingPercent = Math.min(100, (radar.funding_percent || 0) + myPercent);
  const isOvercommitting = commitAmount > remaining;

  const handleConfirm = () => {
    if (!commitAmount || commitAmount <= 0) return;
    onConfirm({ amount: commitAmount, paymentConfirmed });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-white">
            Commit as Co-Organizer
          </DialogTitle>
          <p className="text-gray-400 text-sm mt-1">{radar.tournament_name}</p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Cost Breakdown */}
          <div className="bg-zinc-800 rounded-xl p-4 space-y-2 text-sm">
            <p className="text-gray-400 font-medium mb-3">Tournament Cost Breakdown</p>
            {radar.order_breakdown?.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-gray-400 capitalize">{item.title}</span>
                <span className="text-white">EGP {item.price?.toLocaleString()}</span>
              </div>
            ))}
            {(radar.order_breakdown?.length || 0) > 5 && (
              <p className="text-gray-500 text-xs">+ {radar.order_breakdown.length - 5} more items</p>
            )}
            <div className="border-t border-zinc-700 pt-2 flex justify-between font-bold">
              <span className="text-gray-300">Total Cost</span>
              <span className="text-white">EGP {totalCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Current Funding State */}
          <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Already Committed</span>
              <span className="text-green-400 font-bold">EGP {Math.round(totalCost * (radar.funding_percent || 0) / 100).toLocaleString()} ({radar.funding_percent || 0}%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Still Needed</span>
              <span className="text-red-400 font-bold">EGP {remaining.toLocaleString()}</span>
            </div>
            <FundingBar percent={radar.funding_percent || 0} totalCost={totalCost} />
          </div>

          {/* Commitment Amount Input */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Your Commitment Amount (EGP)
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`e.g. ${Math.round(remaining * 0.5).toLocaleString()}`}
              className="bg-zinc-800 border-zinc-700 text-white text-lg"
              min={1}
            />
            <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
              <TrendingUp className="w-3 h-3 mt-0.5 text-blue-400 flex-shrink-0" />
              <span>No minimum — but a higher % gives your brand more visibility on the shared tournament page.</span>
            </div>
          </div>

          {/* Preview after commit */}
          {commitAmount > 0 && (
            <div className="bg-zinc-800 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-400 font-medium">After Your Commitment</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Share</span>
                <span className="text-yellow-400 font-bold">EGP {commitAmount.toLocaleString()} ({myPercent}%)</span>
              </div>
              {isOvercommitting && (
                <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  Your amount exceeds the remaining needed. It will be capped at the needed amount.
                </div>
              )}
              <FundingBar percent={newFundingPercent} totalCost={totalCost} />
            </div>
          )}

          {/* Payment Confirmation */}
          <div
            onClick={() => setPaymentConfirmed(!paymentConfirmed)}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentConfirmed ? 'border-green-500/40 bg-green-500/5' : 'border-zinc-700 bg-zinc-800/30'}`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${paymentConfirmed ? 'border-green-400 bg-green-400' : 'border-zinc-600'}`}>
              {paymentConfirmed && <Check className="w-3 h-3 text-black" />}
            </div>
            <div>
              <p className="text-white text-sm font-medium">I confirm this payment</p>
              <p className="text-gray-500 text-xs mt-0.5">Checking this marks your payment as confirmed and grants you access to the shared tournament dashboard.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-600 transition-all text-sm"
            >
              Cancel
            </button>
            <GlowButton
              className="flex-1"
              disabled={!commitAmount || commitAmount <= 0 || isLoading}
              onClick={handleConfirm}
            >
              {isLoading ? 'Processing...' : paymentConfirmed ? '✓ Confirm & Pay' : 'Commit (Pay Later)'}
            </GlowButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}