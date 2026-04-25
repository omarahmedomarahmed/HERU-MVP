import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import { Wrench, ArrowRight, CheckCircle, Lock, Zap } from 'lucide-react';

export default function SponsorInternalBuilder() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['sponsor-subscription', user?.id],
    queryFn: () => apiCall('/subscriptions/me').catch(() => null),
    enabled: !!user?.id,
  });

  const plan = subscription?.subscription?.plan || subscription?.plan || 'free';
  const hasAccess = plan === 'enterprise';

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-3">Enterprise Feature</h1>
        <p className="text-gray-400 mb-2">The Internal Campaign Builder is available on the <span className="text-yellow-400 font-bold">Enterprise plan</span>.</p>
        <p className="text-gray-500 text-sm mb-8">Build your own branded tournament events, book service providers, and manage the full production — without going through an organizer.</p>
        <div className="bg-zinc-900 border border-yellow-500/20 rounded-2xl p-6 mb-8 text-left">
          <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">What you unlock with Enterprise</div>
          <div className="space-y-2.5">
            {[
              'Internal Tournament Builder — build your own branded events',
              'HERU Consultant booking — get expert help running your campaign',
              'Managed Services access — hire our team to run it end-to-end',
              'Dedicated account manager',
              'Custom reporting and ROI dashboards',
            ].map(f => (
              <div key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" /> {f}
              </div>
            ))}
          </div>
        </div>
        <Link to="/sponsor/subscription" className="inline-flex items-center gap-2 px-8 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition shadow-lg shadow-yellow-500/20">
          <Zap className="w-4 h-4" /> Upgrade to Enterprise
        </Link>
        <p className="text-xs text-gray-600 mt-4">Currently on: <span className="text-gray-400 capitalize">{plan}</span> plan</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Internal Campaign Builder</h1>
          <span className="text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded-full">Enterprise</span>
        </div>
        <p className="text-gray-400">Build and publish your own branded esports tournament</p>
      </div>

      <div className="bg-gradient-to-br from-yellow-600/10 to-zinc-900 border border-yellow-500/20 rounded-xl p-6 mb-6">
        <h2 className="text-white font-bold text-lg mb-4">What you can build</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            'Branded tournament with your logo',
            'Custom game format & structure',
            'Book service providers (production, branding, venue)',
            'No sponsorship step — you are the sponsor',
            'Full control panel & bracket management',
            'Published on HERU public tournament feed',
          ].map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" /> {f}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-3">How this differs from organizer events</h2>
        <div className="space-y-3 text-sm">
          {[
            ['Sponsorship Packages step', 'Skipped — you fund the event directly'],
            ['Radar listing', 'Your event does not appear on Sponsor Radar'],
            ['Organizer brand', 'Shows your brand as the event organizer'],
            ['Service providers', 'Same pool — book branding, production, venue'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-400">{label}</span>
              <span className="text-white text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/organizer/tournaments/new?mode=sponsor"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition shadow-lg">
          Start Building <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/sponsor/sponsorships"
          className="flex items-center justify-center gap-2 py-3 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition text-sm">
          View My Events
        </Link>
      </div>
    </div>
  );
}
