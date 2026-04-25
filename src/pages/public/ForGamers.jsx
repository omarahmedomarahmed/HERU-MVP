import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import {
  Trophy, Users, Star, Zap, Target, TrendingUp,
  ChevronRight, CheckCircle, ArrowRight,
} from 'lucide-react';

const HOW_IT_WORKS = [
  { step: 1, title: 'Register', desc: 'Create your gamer profile, add your games and region.' },
  { step: 2, title: 'Find & Join', desc: 'Browse tournaments by game, format, and skill level. Join or form a team.' },
  { step: 3, title: 'Compete & Rank', desc: 'Win matches, climb the leaderboard, and build your esports resume.' },
];

const VALUE_PROPS = [
  { icon: Trophy, title: 'Tournament Discovery', desc: 'Find MENA tournaments filtered by game, format, skill level, and date. No more missing out.' },
  { icon: Users,  title: 'Team System',           desc: 'Create or join teams. Manage rosters, send invites, lock lineup before tournaments.' },
  { icon: TrendingUp, title: 'Live Leaderboards', desc: 'Cross-tournament rankings by game. Your win record follows you everywhere.' },
  { icon: Star,   title: 'Coaching Marketplace',  desc: 'Book 1:1 sessions with verified coaches. VOD reviews, strategy calls, live coaching.' },
];

const STATS = [
  { value: '500+', label: 'Gamers Registered' },
  { value: '10+',  label: 'Tournaments Live' },
  { value: '5+',   label: 'Games Covered' },
  { value: 'EGP 130K+', label: 'Prizes Distributed' },
];

export default function ForGamers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AnimatedBackground />

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/gamer/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/auth/gamer/register" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-6">
            <Zap className="w-3.5 h-3.5" /> HERU ARENA — For Gamers
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Compete. Connect.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">Level Up.</span>
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed mb-8">
            HERU.gg is the hub for MENA competitive gamers. Find tournaments, build your team, climb leaderboards, and book world-class coaches.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth/gamer/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-base transition-colors shadow-lg shadow-red-900/30">
              <Zap className="w-4 h-4" /> Create Free Account
            </Link>
            <Link to="/tournaments" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-base transition-colors">
              Browse Tournaments <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="text-center p-8 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
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
        <h2 className="text-3xl font-black text-white text-center mb-4">Everything You Need to Compete</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">Built for MENA gamers who take their game seriously.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUE_PROPS.map((vp, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <vp.icon className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">{vp.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{vp.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-red-900/30 to-zinc-900 border border-red-500/20 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to compete?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Join 500+ MENA gamers already competing on HERU.gg.</p>
          <Link to="/auth/gamer/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-base transition-colors shadow-lg shadow-red-900/30">
            <Zap className="w-4 h-4" /> Start Competing Free
          </Link>
        </div>
      </section>
    </div>
  );
}
