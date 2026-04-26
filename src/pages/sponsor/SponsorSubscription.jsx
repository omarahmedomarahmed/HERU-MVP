import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Subscription } from '@/api/heruClient';
import { CheckCircle, Zap, TrendingUp, Crown, Star, AlertCircle, Loader2 } from 'lucide-react';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    icon: Star,
    price: 0,
    priceLabel: 'EGP 0',
    period: 'per month',
    desc: 'Access all sponsorship packages as one-off purchases.',
    color: 'gray',
    highlight: false,
    features: [
      'Browse full sponsorship radar',
      'One-off package purchases',
      'Basic sponsor dashboard',
      'Post-event reports',
    ],
    ctaLabel: 'Current Plan',
    disabled: true,
  },
  {
    key: 'community',
    name: 'Community',
    icon: TrendingUp,
    price: 150000,
    priceLabel: 'EGP 150,000',
    period: 'per month',
    desc: '2 online sponsorships per month with full analytics and support.',
    color: 'yellow',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      '2 Online sponsorships / month',
      'ROI tracking & analytics',
      'Influencer marketplace access',
      'Priority radar placement',
      'Dedicated account support',
    ],
    ctaLabel: 'Get Community',
  },
  {
    key: 'premium',
    name: 'Premium',
    icon: Crown,
    price: 300000,
    priceLabel: 'EGP 300,000',
    period: 'per month',
    desc: '2 online + 1 offline sponsorship per month, plus managed services.',
    color: 'orange',
    highlight: false,
    features: [
      'Everything in Community',
      '2 Online + 1 Offline / month',
      'Managed campaign service',
      'Corporate activations builder',
      'Custom integrations',
      'Dedicated account manager',
      'Affiliate program access',
    ],
    ctaLabel: 'Get Premium',
  },
];

const colorBorder = { gray: 'border-white/10', yellow: 'border-yellow-500/40', orange: 'border-orange-500/40' };
const colorBg     = { gray: 'bg-white/4', yellow: 'bg-yellow-900/20', orange: 'bg-orange-900/10' };
const colorIcon   = { gray: 'text-gray-400 bg-white/8', yellow: 'text-yellow-400 bg-yellow-500/20', orange: 'text-orange-400 bg-orange-500/20' };
const colorBtn    = { gray: 'bg-white/10 text-gray-400 cursor-default', yellow: 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold', orange: 'bg-white/10 hover:bg-white/15 text-white' };
const colorText   = { gray: 'text-gray-400', yellow: 'text-yellow-400', orange: 'text-orange-400' };
const colorCheck  = { gray: 'text-gray-600', yellow: 'text-yellow-400', orange: 'text-gray-500' };

export default function SponsorSubscription() {
  const qc = useQueryClient();
  const [purchasing, setPurchasing] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: subData, isLoading: loading } = useQuery({
    queryKey: ['subscription-me'],
    queryFn: () => Subscription.me().then(d => d?.subscription ?? null),
    staleTime: 60_000,
  });
  const current = subData ?? null;

  const { mutate: doCancel, isPending: cancelling } = useMutation({
    mutationFn: () => Subscription.cancel(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-me'] });
      setSuccess('Subscription cancelled. Access continues until the end of your billing period.');
    },
    onError: (err) => setError(err.message),
  });

  const handleSubscribe = async (planKey) => {
    if (planKey === 'free') return;
    setPurchasing(planKey); setError(''); setSuccess('');
    try {
      await Subscription.create({ plan: planKey, billing_cycle: 'monthly' });
      qc.invalidateQueries({ queryKey: ['subscription-me'] });
      setSuccess(`Successfully subscribed to ${PLANS.find(p => p.key === planKey)?.name}!`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPurchasing('');
    }
  };

  const handleCancel = () => {
    if (!window.confirm('Cancel your subscription? You will lose access at the end of the billing period.')) return;
    setError('');
    doCancel();
  };

  const activePlanKey = current?.plan || 'free';
  const activePlan = PLANS.find(p => p.key === activePlanKey);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">HERU RADAR Plans</h1>
        <p className="text-gray-400 mt-1">Choose your sponsorship tier. All plans billed monthly in EGP.</p>
      </div>

      {!loading && current && activePlan && activePlan.key !== 'free' && (
        <div className={`border rounded-xl p-4 flex items-center justify-between ${colorBorder[activePlan.color]} ${colorBg[activePlan.color]}`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">Active: {activePlan.name}</p>
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

      <div className="grid sm:grid-cols-3 gap-5">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isActive = activePlanKey === plan.key;

          return (
            <div
              key={plan.key}
              className={`relative flex flex-col border rounded-xl p-6 transition-all ${colorBorder[plan.color]} ${colorBg[plan.color]} ${plan.highlight ? 'ring-1 ring-yellow-500/20' : ''}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black whitespace-nowrap">
                  {plan.badge}
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

              <div className="mb-1">
                <span className={`text-2xl font-black ${colorText[plan.color]}`}>{plan.priceLabel}</span>
                <span className="text-gray-500 text-sm ml-1">/{plan.period}</span>
              </div>
              <p className="text-xs text-gray-500 mb-5">{plan.desc}</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${colorCheck[plan.color]}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => !isActive && handleSubscribe(plan.key)}
                disabled={!!purchasing || isActive || plan.disabled}
                className={`w-full py-2.5 rounded-lg text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${
                  isActive ? 'bg-white/5 text-gray-500 cursor-default' : colorBtn[plan.color]
                }`}
              >
                {purchasing === plan.key
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  : isActive
                    ? 'Current Plan'
                    : plan.ctaLabel}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
        <p className="text-gray-400 text-sm">
          All plans in EGP. Monthly billing. Cancel anytime from this page.
          One-off package purchases are available on all plans — no subscription required.
        </p>
      </div>
    </div>
  );
}
