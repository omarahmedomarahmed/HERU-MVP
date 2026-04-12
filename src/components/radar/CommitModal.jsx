import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GlowButton from '@/components/ui/GlowButton';
import FundingBar from './FundingBar';
import { Check, AlertCircle, Users, Zap } from 'lucide-react';

export default function CommitModal({ radar, profile, onClose, onConfirm, isLoading }) {
  const [selectedSlots, setSelectedSlots] = useState(1);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  if (!radar) return null;

  const totalCost = radar.total_cost || 0;
  const mainPercent = radar.main_organizer_percent || 33;
  const coOrgCount = radar.co_organizers?.length || 0;

  // Determine available slots
  // If main committed 33%: 2 co-org slots at 33% each
  // If main committed 66%: 1 sponsor slot at 66% — but HERU only allows co-org (33%) per the rules
  const maxSlots = mainPercent <= 34 ? 2 : 1;
  const filledSlots = coOrgCount;
  const openSlots = Math.max(0, maxSlots - filledSlots);
  const perSlotPercent = 33;
  const perSlotAmount = Math.round(totalCost * (perSlotPercent / 100));

  const canSelectTwo = openSlots >= 2;
  const commitPercent = selectedSlots * perSlotPercent;
  const commitAmount = selectedSlots * perSlotAmount;
  const newFundingPercent = Math.min(100, (radar.funding_percent || 0) + commitPercent);
  const role = selectedSlots === 2 ? 'Lead Co-Organizer (66%)' : 'Co-Organizer (33%)';

  if (openSlots === 0) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white">No Slots Available</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm">All co-organizer slots for this tournament are filled.</p>
          <GlowButton className="w-full mt-4" variant="ghost" onClick={onClose}>Close</GlowButton>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-white">Join as Co-Organizer</DialogTitle>
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
              <span className="text-gray-300">Total Tournament Cost</span>
              <span className="text-white">EGP {totalCost.toLocaleString()}</span>
            </div>
          </div>

          {/* Funding progress */}
          <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Funded so far</span>
              <span className="text-green-400 font-bold">{radar.funding_percent || 0}%</span>
            </div>
            <FundingBar percent={radar.funding_percent || 0} totalCost={totalCost} />
          </div>

          {/* Slot selection */}
          <div>
            <p className="text-sm text-gray-400 font-medium mb-3">Select how many slots to take</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSlots(1)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${selectedSlots === 1 ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-white text-sm">1 Slot (33%)</span>
                  {selectedSlots === 1 && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                </div>
                <p className="text-yellow-400 font-black">EGP {perSlotAmount.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-1">Co-Organizer role</p>
              </button>

              {canSelectTwo ? (
                <button
                  onClick={() => setSelectedSlots(2)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${selectedSlots === 2 ? 'border-yellow-500 bg-yellow-500/10' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-white text-sm">2 Slots (66%)</span>
                    {selectedSlots === 2 && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                  </div>
                  <p className="text-yellow-400 font-black">EGP {(perSlotAmount * 2).toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-1">Lead Co-Organizer role</p>
                </button>
              ) : (
                <div className="rounded-xl border-2 border-zinc-800 bg-zinc-900 p-4 opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-zinc-500" />
                    <span className="font-bold text-zinc-500 text-sm">2 Slots (66%)</span>
                  </div>
                  <p className="text-zinc-600 text-xs mt-1">Only 1 slot remaining</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-zinc-800 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Your role</span>
              <span className="text-white font-bold">{role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Your commitment</span>
              <span className="text-yellow-400 font-bold">EGP {commitAmount.toLocaleString()} ({commitPercent}%)</span>
            </div>
            <FundingBar percent={newFundingPercent} totalCost={totalCost} />
            {newFundingPercent >= 100 && (
              <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                <Check className="w-3 h-3" /> Tournament will be fully funded after your commitment!
              </div>
            )}
          </div>

          {/* Confirmation checkbox */}
          <div
            onClick={() => setPaymentConfirmed(!paymentConfirmed)}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${paymentConfirmed ? 'border-green-500/40 bg-green-500/5' : 'border-zinc-700 bg-zinc-800/30'}`}
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${paymentConfirmed ? 'border-green-400 bg-green-400' : 'border-zinc-600'}`}>
              {paymentConfirmed && <Check className="w-3 h-3 text-black" />}
            </div>
            <div>
              <p className="text-white text-sm font-medium">I confirm this commitment</p>
              <p className="text-gray-500 text-xs mt-0.5">You'll receive a bill for EGP {commitAmount.toLocaleString()} and get access to the tournament dashboard upon payment.</p>
            </div>
          </div>

          {!paymentConfirmed && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Please confirm your commitment above before proceeding.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-700 text-gray-400 hover:text-white hover:border-zinc-600 transition-all text-sm">
              Cancel
            </button>
            <GlowButton className="flex-1" disabled={!paymentConfirmed || isLoading} onClick={() => onConfirm({ amount: commitAmount, percent: commitPercent, slots: selectedSlots, paymentConfirmed })}>
              {isLoading ? 'Processing...' : `Commit EGP ${commitAmount.toLocaleString()}`}
            </GlowButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
