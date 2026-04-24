import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import { Users, Trophy, Star, Briefcase, ArrowRight } from 'lucide-react';

const tiles = [
  {
    title: 'Gamer',
    path: '/auth/gamer/login',
    icon: Users,
    color: 'red',
    desc: 'Compete in tournaments, form teams, climb the leaderboard.',
    bullets: ['Join or create a team', 'Enter tournaments', 'Book coaching sessions'],
  },
  {
    title: 'Organizer',
    path: '/auth/organizer/login',
    icon: Trophy,
    color: 'purple',
    desc: 'Build events, hire service providers, attract sponsors.',
    bullets: ['Use the Tournament Builder', 'Hire casters, designers, venues', 'Create sponsorship packages'],
  },
  {
    title: 'Sponsor',
    path: '/auth/sponsor/login',
    icon: Star,
    color: 'yellow',
    desc: 'Reach MENA gamers. Browse radar, buy packages, track ROI.',
    bullets: ['Browse sponsorship radar', 'Purchase sponsor packages', 'Get post-event reports'],
  },
  {
    title: 'Service Provider',
    path: '/auth/provider/login',
    icon: Briefcase,
    color: 'cyan',
    desc: 'Get hired to power esports events. Casters, designers, venues, influencers.',
    bullets: ['List your services', 'Get booked by organizers', 'Build your esports portfolio'],
  },
];

const colorMap = {
  red:    { border: 'hover:border-red-500/50',    icon: 'from-red-600 to-red-800',       btn: 'bg-red-500/20 text-red-400 border-red-500/30',    dot: 'bg-red-500',    glow: 'hover:shadow-[0_0_20px_rgba(255,26,26,0.12)]' },
  purple: { border: 'hover:border-purple-500/50', icon: 'from-purple-600 to-purple-800', btn: 'bg-purple-500/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-500', glow: 'hover:shadow-[0_0_20px_rgba(124,58,237,0.12)]' },
  yellow: { border: 'hover:border-yellow-500/50', icon: 'from-yellow-500 to-yellow-700', btn: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', dot: 'bg-yellow-400', glow: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.12)]' },
  cyan:   { border: 'hover:border-cyan-500/50',   icon: 'from-cyan-600 to-cyan-800',     btn: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',    dot: 'bg-cyan-400',   glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]' },
};

export default function AuthChoice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="w-full max-w-5xl">
        <div className="flex justify-center mb-10">
          <HeruLogo className="h-12" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
            Welcome to HERU.gg
          </h1>
          <p className="text-gray-400 text-lg">
            The esports marketplace for MENA. Choose your role.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {tiles.map(({ title, path, icon: Icon, color, desc, bullets }) => {
            const c = colorMap[color];
            return (
              <Link key={title} to={path} className="group">
                <div className={`h-full rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col transition-all duration-300 ${c.border} ${c.glow}`}>
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
                    <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                  </div>

                  <div className="mt-auto">
                    <ul className="space-y-2 mb-4">
                      {bullets.map(b => (
                        <li key={b} className="flex items-center gap-2 text-xs text-gray-300">
                          <div className={`w-1 h-1 rounded-full flex-shrink-0 ${c.dot}`} />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <button className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${c.btn}`}>
                      Sign In <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Staff?{' '}
            <Link to="/admin" className="text-gray-500 hover:text-gray-400 underline transition-colors">
              Access admin portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
