import React from 'react';
import { Link } from 'react-router-dom';
import HeruLogo from '@/components/shared/HeruLogo';
import { Gamepad2, Building2, Radar, Briefcase, ArrowRight, ChevronRight } from 'lucide-react';

const BG_IMG = 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=1920&q=80';

const ROLES = [
  {
    title: 'Gamer',
    product: 'HERU ARENA',
    loginPath: '/auth/gamer/login',
    registerPath: '/auth/gamer/register',
    learnPath: '/for-gamers',
    Icon: Gamepad2,
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80',
    color: 'red',
    desc: 'Compete in tournaments, form teams, book coaches, climb leaderboards.',
    highlights: ['Free forever', 'Live tournaments', 'HERU rank system'],
    accent: 'text-red-400',
    bg: 'bg-red-500/8',
    border: 'border-red-500/20',
    hoverBorder: 'hover:border-red-500/50',
    btnColor: 'bg-red-600 hover:bg-red-500',
    badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  {
    title: 'Organizer',
    product: 'HERU BUILDER',
    loginPath: '/auth/organizer/login',
    registerPath: '/auth/organizer/register',
    learnPath: '/for-organizers',
    Icon: Building2,
    img: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600&q=80',
    color: 'purple',
    desc: 'Build funded tournaments, hire service providers, attract sponsors.',
    highlights: ['Free to build', '85% sponsorship income', 'Full CRM included'],
    accent: 'text-purple-400',
    bg: 'bg-purple-500/8',
    border: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/50',
    btnColor: 'bg-purple-700 hover:bg-purple-600',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  {
    title: 'Sponsor',
    product: 'HERU RADAR',
    loginPath: '/auth/sponsor/login',
    registerPath: '/auth/sponsor/register',
    learnPath: '/for-sponsors',
    Icon: Radar,
    img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&q=80',
    color: 'yellow',
    desc: 'Browse sponsorship packages, track ROI, hire influencers, build brand.',
    highlights: ['Free tier available', 'Real ROI data', 'MENA gamers reached'],
    accent: 'text-yellow-400',
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/20',
    hoverBorder: 'hover:border-yellow-500/50',
    btnColor: 'bg-yellow-600 hover:bg-yellow-500 text-black',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  {
    title: 'Service Provider',
    product: 'HERU GIGs',
    loginPath: '/auth/provider/login',
    registerPath: '/auth/provider/register',
    learnPath: '/for-providers',
    Icon: Briefcase,
    img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80',
    color: 'cyan',
    desc: 'List your services, get booked by organizers, receive escrow payments.',
    highlights: ['85% payout', 'No monthly fee', '9 service categories'],
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/50',
    btnColor: 'bg-cyan-600 hover:bg-cyan-500',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
];

export default function AuthChoice() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={BG_IMG} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950" />
      </div>
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-red-600/5 blur-[140px]" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[120px]" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Logo */}
        <Link to="/" className="mb-10">
          <HeruLogo className="h-12" />
        </Link>

        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Welcome to HERU<span className="text-red-500">.</span>gg
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            The esports operating system for MENA. Choose your role to get started.
          </p>
        </div>

        {/* Role cards */}
        <div className="w-full max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {ROLES.map((role) => (
            <div key={role.title}
              className={`group flex flex-col rounded-2xl border ${role.border} ${role.hoverBorder} ${role.bg} overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}>
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                <img src={role.img} alt={role.product} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${role.badgeColor}`}>{role.product}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <div className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center mb-4`}>
                  <role.Icon className={`w-5 h-5 ${role.accent}`} />
                </div>
                <h2 className="text-lg font-black text-white mb-2">{role.title}</h2>
                <p className="text-zinc-400 text-xs leading-relaxed mb-4">{role.desc}</p>

                <div className="space-y-1.5 mb-5">
                  {role.highlights.map(h => (
                    <div key={h} className="flex items-center gap-2 text-xs text-zinc-300">
                      <div className={`w-1.5 h-1.5 rounded-full ${role.accent.replace('text-', 'bg-')}`} />
                      {h}
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-2">
                  <Link to={role.loginPath}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all ${role.btnColor}`}>
                    Sign In <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link to={role.registerPath}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product explore links */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {ROLES.map(r => (
            <Link key={r.title} to={r.learnPath}
              className={`inline-flex items-center gap-1.5 text-xs font-medium ${r.accent} hover:opacity-80 transition-opacity`}>
              Learn about {r.product} <ChevronRight className="w-3 h-3" />
            </Link>
          ))}
        </div>

        <p className="text-zinc-700 text-sm">
          <Link to="/" className="text-zinc-600 hover:text-zinc-400 transition-colors">← Back to home</Link>
          {' · '}
          Staff access is restricted and not linked here.
        </p>
      </div>
    </div>
  );
}
