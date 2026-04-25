import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import {
  Star, Package, TrendingUp, Zap, Target, FileText,
  ArrowRight, CheckCircle, BarChart3,
} from 'lucide-react';

const HOW_IT_WORKS = [
  { step: 1, title: 'Register Your Brand', desc: 'Create a sponsor account with your brand name, logo, and industry.' },
  { step: 2, title: 'Browse Radar & Buy', desc: 'Filter by game, budget, and reach. See exact deliverables. Buy in minutes via Paymob.' },
  { step: 3, title: 'Track & Report', desc: 'Your dashboard shows deliverable completion in real time. Get the post-tournament report.' },
];

const VALUE_PROPS = [
  { icon: Package,    title: 'Structured Packages',     desc: 'Every package has a fixed price, clear deliverables, and expected reach. No negotiation, no surprises.' },
  { icon: Target,     title: 'Verified Organizers',     desc: 'Sponsors only see verified organizers. Verification requires documentation and staff approval.' },
  { icon: FileText,   title: 'Post-Tournament Reports', desc: 'Every sponsorship comes with a post-event report: impressions, reach, clips, photos.' },
  { icon: TrendingUp, title: 'Subscription Analytics', desc: 'Pro and Enterprise subscribers get full campaign analytics, ROI tracking, and a HERU consultant.' },
];

const TIERS = [
  {
    name: 'Basic',
    price: 'Free',
    color: 'border-zinc-700',
    features: ['Browse Radar', 'Buy packages', 'Basic dashboard', 'Post-event report'],
  },
  {
    name: 'Pro',
    price: 'EGP 999/mo',
    color: 'border-yellow-500/50',
    highlight: true,
    features: ['Everything in Basic', 'Priority Radar placement', 'Advanced analytics', 'Dedicated account manager'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    color: 'border-purple-500/50',
    features: ['Everything in Pro', 'Custom campaigns', 'HERU managed services', 'Influencer marketplace access'],
  },
];

export default function ForSponsors() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AnimatedBackground />

      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/sponsor/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/auth/sponsor/register" className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition-colors">
              Register as Sponsor
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold mb-6">
            <Star className="w-3.5 h-3.5" /> FOR SPONSORS
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Put Your Brand{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-300">Where Gamers Are.</span>
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed mb-8">
            Reach 100,000+ MENA gamers through structured sponsorship packages. Clear deliverables. Real ROI. Buy in minutes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth/sponsor/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-base transition-colors shadow-lg shadow-yellow-900/20">
              <Zap className="w-4 h-4" /> Browse Packages Now
            </Link>
            <Link to="/radar" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-base transition-colors">
              See Radar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="text-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center text-black font-black text-lg mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-black text-white text-center mb-4">Why Sponsors Choose HERU</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Structured, transparent, measurable.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUE_PROPS.map((vp, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <vp.icon className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{vp.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{vp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-4">Subscription Plans</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Start free. Upgrade when you need more.</p>
        <div className="grid md:grid-cols-3 gap-5">
          {TIERS.map((tier) => (
            <div key={tier.name} className={`p-6 rounded-2xl bg-zinc-900 border ${tier.color} ${tier.highlight ? 'ring-1 ring-yellow-500/30' : ''}`}>
              {tier.highlight && (
                <div className="mb-3 inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  <Star className="w-3 h-3 fill-current" /> Most Popular
                </div>
              )}
              <h3 className="text-white font-black text-xl mb-1">{tier.name}</h3>
              <p className="text-2xl font-black text-white mb-5">{tier.price}</p>
              <ul className="space-y-2">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth/sponsor/register"
                className={`w-full mt-5 py-2.5 rounded-xl font-bold text-sm transition-colors block text-center ${
                  tier.highlight
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-yellow-900/20 to-zinc-900 border border-yellow-500/20 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to reach MENA gamers?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Join sponsors already building brand presence across the MENA esports scene.</p>
          <Link to="/auth/sponsor/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-base transition-colors shadow-lg shadow-yellow-900/20">
            <Star className="w-4 h-4" /> Register as Sponsor
          </Link>
        </div>
      </section>
    </div>
  );
}
