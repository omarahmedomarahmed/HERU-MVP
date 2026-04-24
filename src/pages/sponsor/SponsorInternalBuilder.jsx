import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ArrowRight, CheckCircle, Lock } from 'lucide-react';

export default function SponsorInternalBuilder() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Internal Builder</h1>
        </div>
        <p className="text-gray-400">Build and publish your own branded esports tournament</p>
      </div>

      {/* Feature highlights */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-6">
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
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* How it differs */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-3">How this differs from organizer events</h2>
        <div className="space-y-3 text-sm">
          {[
            ['Sponsorship Packages step', 'Skipped — you fund the event directly'],
            ['Radar listing', 'Your event does not appear on Sponsor Radar'],
            ['Organizer brand', 'Shows your brand as the event organizer'],
            ['Service providers', 'Same marketplace — book branding, production, venue'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-gray-400">{label}</span>
              <span className="text-white text-right">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/organizer/tournaments/new?mode=sponsor"
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
        >
          Start Building <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/sponsor/sponsorships"
          className="flex items-center justify-center gap-2 py-3 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-colors text-sm"
        >
          View My Events
        </Link>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Internal Builder is available to Enterprise subscribers.{' '}
        <Link to="/sponsor/subscription" className="text-blue-400 hover:text-blue-300">Upgrade your plan →</Link>
      </p>
    </div>
  );
}
