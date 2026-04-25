import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import {
  Trophy, Package, Star, Zap, TrendingUp, BadgeCheck,
  ArrowRight, Users, DollarSign, Briefcase,
} from 'lucide-react';

const HOW_IT_WORKS = [
  { step: 1, title: 'Build Your Tournament', desc: 'Use the step-by-step builder. Add service providers from the marketplace, set your prizepool.' },
  { step: 2, title: 'Create Sponsor Packages', desc: 'Define 1-3 sponsorship tiers with deliverables and pricing. HERU shows you expected reach.' },
  { step: 3, title: 'Publish & Get Funded', desc: 'Verified organizers go live on the Sponsorship Radar. Sponsors browse and buy packages directly.' },
];

const VALUE_PROPS = [
  { icon: Trophy,     title: 'Tournament Builder',         desc: 'Multi-step tool with cost calculator, service provider marketplace, and package builder.' },
  { icon: Package,    title: 'Sponsorship Package Builder', desc: 'Create structured packages with deliverables. Sponsors see exactly what they get. No negotiation.' },
  { icon: Briefcase,  title: 'Service Provider Marketplace', desc: 'Hire casters, designers, venue operators, and production crews directly from the builder.' },
  { icon: BadgeCheck, title: 'Organizer Verification',     desc: 'Get the verified badge. Required to publish tournaments to the Sponsorship Radar.' },
];

const ECONOMICS = [
  { label: 'Stream Setup (provider)',   value: 'EGP 8,000' },
  { label: 'Branding Package (provider)', value: 'EGP 5,000' },
  { label: 'Host/MC (provider)',         value: 'EGP 4,000' },
  { label: 'Venue (provider)',           value: 'EGP 6,000' },
  { label: 'Prizepool',                  value: 'EGP 20,000' },
  { label: 'HERU Fee (15%)',             value: 'EGP 6,450', highlight: true },
];

export default function ForOrganizers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AnimatedBackground />

      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/organizer/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/auth/organizer/register" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors">
              Register Brand
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6">
            <Trophy className="w-3.5 h-3.5" /> FOR ORGANIZERS
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Build Events That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-300">Sponsors Fund.</span>
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed mb-8">
            Stop begging brands. HERU gives organizers the tools to build structured tournaments that sponsors can buy into directly — on your terms.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth/organizer/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base transition-colors shadow-lg shadow-purple-900/30">
              <Zap className="w-4 h-4" /> Register Your Brand
            </Link>
            <Link to="/radar" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-base transition-colors">
              View Radar <ArrowRight className="w-4 h-4" />
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
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
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
        <h2 className="text-3xl font-black text-white text-center mb-4">Your Full Toolkit</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Everything an organizer needs to plan, fund, and run professional esports events.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUE_PROPS.map((vp, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <vp.icon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{vp.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{vp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Economics example */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 max-w-lg mx-auto">
          <h2 className="text-xl font-black text-white mb-1">Example Economics</h2>
          <p className="text-xs text-gray-500 mb-5">8-team Valorant tournament, Cairo</p>
          <div className="space-y-2 mb-5">
            {ECONOMICS.map((item, i) => (
              <div key={i} className={`flex justify-between text-sm ${item.highlight ? 'text-red-400 font-bold' : 'text-gray-300'}`}>
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
            ))}
            <div className="border-t border-zinc-700 pt-2 flex justify-between text-sm font-black text-white">
              <span>Total organizer cost</span>
              <span>EGP 49,450</span>
            </div>
          </div>
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
            <p className="text-xs text-gray-400 mb-1">With sponsorship packages (2x service cost):</p>
            <p className="text-2xl font-black text-green-400">EGP 52,550 profit</p>
            <p className="text-xs text-green-500 mt-0.5">After all costs and HERU fees</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/30 to-zinc-900 border border-purple-500/20 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Build your first tournament</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Join organizers building funded tournaments across MENA.</p>
          <Link to="/auth/organizer/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base transition-colors shadow-lg shadow-purple-900/30">
            <Trophy className="w-4 h-4" /> Register as Organizer
          </Link>
        </div>
      </section>
    </div>
  );
}
