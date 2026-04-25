import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import {
  Briefcase, Star, TrendingUp, Zap, Shield, DollarSign,
  ArrowRight, CheckCircle, Mic, Camera, MapPin, Megaphone,
} from 'lucide-react';

const HOW_IT_WORKS = [
  { step: 1, title: 'Create Your Listing', desc: 'Register as a service provider, pick your category, write your service description, and set your price.' },
  { step: 2, title: 'Staff Approves', desc: 'HERU staff reviews your listing. Once approved, you appear inside the Tournament Builder for organizers.' },
  { step: 3, title: 'Get Booked & Paid', desc: 'Organizer books you. Payment is held in escrow. You deliver, they confirm, you get paid (minus 15% HERU fee).' },
];

const CATEGORIES = [
  { icon: Camera,    name: 'Production',  desc: 'Streaming setup, video editing, live production.' },
  { icon: Briefcase, name: 'Branding',    desc: 'Logo design, tournament assets, overlays, jerseys.' },
  { icon: Mic,       name: 'Talent',      desc: 'Host/MC, caster, analyst, observer.' },
  { icon: MapPin,    name: 'Venue',       desc: 'Gaming centers, gaming cafes, offline event spaces.' },
  { icon: Megaphone, name: 'Marketing',   desc: 'Discord servers, influencers, social media campaigns.' },
  { icon: Star,      name: 'Coaching',    desc: 'Book gamers for 1:1 sessions via the coaches marketplace.' },
];

const VALUE_PROPS = [
  { icon: TrendingUp, title: 'Built-In Distribution',    desc: 'Once approved, your service appears inside the Tournament Builder. Organizers find you as they plan events.' },
  { icon: Shield,     title: 'Escrow Payment Protection', desc: 'Payment held until you deliver. Then released automatically. No chasing invoices.' },
  { icon: Star,       title: 'Rating & Reviews',          desc: 'Every booking generates a review. High-rated providers rank higher in search.' },
  { icon: DollarSign, title: '85% Payout',                desc: 'HERU takes 15%. You keep 85% of every booking. Paid directly to your account after confirmation.' },
];

export default function ForProviders() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AnimatedBackground />

      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/"><HeruLogo className="h-7" /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/provider/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link to="/auth/provider/register" className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold transition-colors">
              List Your Services
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-6">
            <Briefcase className="w-3.5 h-3.5" /> FOR SERVICE PROVIDERS
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            Get Paid to Power{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">Esports Events.</span>
          </h1>
          <p className="text-gray-400 text-xl leading-relaxed mb-8">
            List your services once. Appear in front of every organizer building a tournament. Get booked, deliver, get paid.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth/provider/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base transition-colors shadow-lg shadow-cyan-900/20">
              <Zap className="w-4 h-4" /> List Your Services
            </Link>
            <Link to="/auth/provider/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-base transition-colors">
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-white mb-8 text-center">Service Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {CATEGORIES.map((cat, i) => (
            <div key={i} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <cat.icon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{cat.name}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{cat.desc}</p>
              </div>
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
              <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
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
        <h2 className="text-3xl font-black text-white text-center mb-4">Built for Esports Professionals</h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">No cold pitching. No unpaid invoices. Just esports work, paid fairly.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUE_PROPS.map((vp, i) => (
            <div key={i} className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                <vp.icon className="w-5 h-5 text-cyan-400" />
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
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-2">Simple Pricing</h2>
          <p className="text-gray-400 text-sm mb-6">No monthly fee. HERU only earns when you earn.</p>
          <div className="text-5xl font-black text-white mb-2">15%</div>
          <p className="text-gray-400 text-sm">HERU fee per completed booking</p>
          <p className="text-2xl font-black text-cyan-400 mt-4">You keep 85%</p>
          <p className="text-xs text-gray-500 mt-2">Paid out after organizer confirms delivery</p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-900/20 to-zinc-900 border border-cyan-500/20 p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Start getting booked today</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">Hundreds of esports events need your skills. Join the HERU marketplace.</p>
          <Link to="/auth/provider/register" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-base transition-colors shadow-lg shadow-cyan-900/20">
            <Briefcase className="w-4 h-4" /> List Your Services
          </Link>
        </div>
      </section>
    </div>
  );
}
