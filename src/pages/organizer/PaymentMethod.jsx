import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { CreditCard, Lock, ArrowLeft, Building2, Smartphone } from 'lucide-react';

const METHODS = [
  { id: 'paymob_card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard via Paymob', available: false },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, desc: 'Direct bank transfer (EGP)', available: true },
  { id: 'mobile_wallet', label: 'Mobile Wallet', icon: Smartphone, desc: 'Vodafone Cash, InstaPay', available: false },
];

export default function PaymentMethod() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
      <button onClick={() => navigate('/organizer/billing')} className="flex items-center gap-2 text-gray-400 hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to Billing
      </button>

      <div>
        <h1 className="text-2xl font-black text-white mb-2">Payment Method</h1>
        <p className="text-gray-400">Choose how you'd like to pay your invoices</p>
      </div>

      <div className="space-y-3">
        {METHODS.map((method) => {
          const Icon = method.icon;
          return (
            <FloatingPanel
              key={method.id}
              className={`p-5 cursor-pointer transition-all ${
                selected === method.id ? 'border-purple-500/50 bg-purple-500/5' : ''
              } ${!method.available ? 'opacity-50' : 'hover:border-purple-500/30'}`}
              onClick={() => method.available && setSelected(method.id)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-zinc-800">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">{method.label}</p>
                  <p className="text-gray-400 text-sm">{method.desc}</p>
                </div>
                {!method.available && (
                  <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-full">Coming Soon</span>
                )}
                {selected === method.id && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </FloatingPanel>
          );
        })}
      </div>

      {/* Paymob integration notice */}
      <FloatingPanel className="p-5 border-yellow-500/20 bg-yellow-500/5">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-bold">Paymob Integration</p>
            <p className="text-yellow-300/70 text-sm mt-1">
              Card payments and mobile wallets are being integrated with Paymob.
              For now, use bank transfer and contact support with your payment receipt.
            </p>
          </div>
        </div>
      </FloatingPanel>

      {selected === 'bank_transfer' && (
        <FloatingPanel className="p-5">
          <h3 className="text-white font-bold mb-3">Bank Transfer Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Bank</span>
              <span className="text-white font-mono">CIB Egypt</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account Name</span>
              <span className="text-white font-mono">HERU Esports LLC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">IBAN</span>
              <span className="text-white font-mono">EG00 0000 0000 0000 0000 0000</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">After transfer, send receipt to billing@heru.gg or via platform support chat.</p>
        </FloatingPanel>
      )}

      <GlowButton
        onClick={() => {
          alert('Payment method saved');
          navigate('/organizer/billing');
        }}
        disabled={!selected}
        className="w-full"
      >
        Save Payment Method
      </GlowButton>
    </div>
  );
}
