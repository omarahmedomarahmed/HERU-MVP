import React, { useEffect, useState } from 'react';
import { CheckCircle, Zap, TrendingUp, Crown, AlertCircle, Loader2 } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    icon: Zap,
    color: 'blue',
    monthly: 150000,
    annual: 1500000,
    features: [
      '5 active sponsorships',
      'Full Sponsorship Radar access',
      'Analytics dashboard',
      'Priority radar listing',
      'Brand badge on packages',
      'Email support',
    ],
    highlight: false,
  },
  {
    key: 'growth',
    name: 'Growth',
    icon: TrendingUp,
    color: 'yellow',
    monthly: 250000,
    annual: 2500000,
    features: [
      '15 active sponsorships',
      'Everything in Starter',
      'Influencer marketplace',
      'Corporate gaming events',
      'Managed services access',
      'Dedicated account support',
    ],
    highlight: true,
  },
  {
    key: 'premium',
    name: 'Premium',
    icon: Crown,
    color: 'purple',
    monthly: 500000,
    annual: 5000000,
    features: [
      'Unlimited sponsorships',
      'Everything in Growth',
      'HERU Consultant booking',
      'Custom integrations',
      'Dedicated account manager',
      'Custom reporting',
    ],
    highlight: false,
  },
];

const colorBorder = { blue: 'border-blue-500/40', yellow: 'border-yellow-500/40', purple: 'border-purple-500/40' };
const colorBg    = { blue: 'bg-blue-500/10', yellow: 'bg-yellow-500/10', purple: 'bg-purple-500/10' };
const colorIcon  = { blue: 'text-blue-400 bg-blue-500/20', yellow: 'text-yellow-400 bg-yellow-500/20', purple: 'text-purple-400 bg-purple-500/20' };
const colorBtn   = { blue: 'bg-blue-600 hover:bg-blue-500', yellow: 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold', purple: 'bg-purple-600 hover:bg-purple-500' };
const colorText  = { blue: 'text-blue-400', yellow: 'text-yellow-400', purple: 'text-purple-400' };

export default function SponsorSubscription() {
  const [billing, setBilling] = useState('monthly');
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/subscriptions/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r => r.json())
      .then(d => setCurrent(d.subscription || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planKey) => {
    setPurchasing(planKey); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ plan: planKey, billing_cycle: billing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');
      setCurrent(data.subscription);
      setSuccess(`Successfully subscribed to ${PLANS.find(p => p.key === planKey)?.name}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing('');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription? You will lose access at the end of the billing period.')) return;
    setCancelling(true); setError('');
    try {
      const res = await fetch('/api/subscriptions/cancel', { method: 'PUT', headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');
      setCurrent(null);
      setSuccess('Subscription cancelled. Access continues until the end of your billing period.');
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const currentPlan = PLANS.find(p => p.key === current?.plan);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Brand Plans</h1>
        <p className="text-gray-400 mt-1">Choose a plan to unlock sponsorship tools, influencer marketplace, and managed campaigns across MENA.</p>
      </div>

      {/* Active plan banner */}
      {!loading && current && currentPlan && (
        <div className={`border rounded-xl p-4 flex items-center justify-between ${colorBorder[currentPlan.color]} ${colorBg[currentPlan.color]}`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Active: {currentPlan.name} ({current.billing_cycle})</p>
              {current.renewal_date && (
                <p className="text-gray-400 text-xs mt-0.5">
                  Renews {new Date(current.renewal_date).toLocaleDateString('en-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <button onClick={handleCancel} disabled={cancelling} className="text-xs text-red-400 hover:text-red-300 transition-colors">
            {cancelling ? 'Cancelling...' : 'Cancel plan'}
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-sm ${billing === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
        <button
          onClick={() => setBilling(b => b === 'monthly' ? 'annual' : 'monthly')}
          className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'annual' ? 'bg-yellow-500' : 'bg-white/20'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${billing === 'annual' ? 'left-7' : 'left-1'}`} />
        </button>
        <span className={`text-sm ${billing === 'annual' ? 'text-white' : 'text-gray-500'}`}>
          Annual <span className="text-green-400 text-xs ml-1">Save ~17%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const price = billing === 'annual' ? plan.annual : plan.monthly;
          const isActive = current?.plan === plan.key && current?.status === 'active';

          return (
            <div
              key={plan.key}
              className={`relative border rounded-xl p-6 transition-all ${
                plan.highlight
                  ? `${colorBorder[plan.color]} ${colorBg[plan.color]} ring-1 ring-yellow-500/30`
                  : isActive
                    ? `${colorBorder[plan.color]} ${colorBg[plan.color]}`
                    : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black">
                  Most Popular
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorIcon[plan.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{plan.name}</h3>
                  {isActive && <span className="text-xs text-green-400">Current plan</span>}
                </div>
              </div>

              <div className="mb-5">
                <span className={`text-2xl font-black ${colorText[plan.color]}`}>
                  EGP {(price / 1000).toLocaleString()}K
                </span>
                <span className="text-gray-400 text-sm ml-1">/{billing === 'annual' ? 'year' : 'mo'}</span>
                {billing === 'annual' && (
                  <p className="text-xs text-gray-500 mt-1">≈ EGP {Math.round(price / 12 / 1000).toLocaleString()}K /month</p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className={`w-3.5 h-3.5 ${colorText[plan.color]} flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={!!purchasing || isActive}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 text-white ${colorBtn[plan.color]}`}
              >
                {purchasing === plan.key
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : isActive
                    ? 'Current Plan'
                    : `Get ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Free plan note */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
        <p className="text-gray-400 text-sm">
          <span className="text-white font-medium">Free plan</span> — Browse the radar and view sponsorship packages at no cost.
          Upgrade to Starter, Growth, or Premium for analytics, managed campaigns, and unlimited sponsorships.
        </p>
      </div>
    </div>
  );
}
