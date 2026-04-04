import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Users, Trophy, ArrowRight } from 'lucide-react';

export default function AuthChoice() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <HeruLogo className="h-12" />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">
            Welcome to HERU.gg
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your path to compete
          </p>
        </div>

        {/* Choice Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Gamer Card */}
          <Link to="/auth/gamer/login" className="group">
            <FloatingPanel className="h-full cursor-pointer hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,26,26,0.1)]">
              <div className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(255,26,26,0.3)] transition-all">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Gamer</h2>
                  <p className="text-gray-400 text-sm">
                    Join tournaments, form teams, and compete with the best
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="space-y-3 mb-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span>Create your profile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span>Find and join tournaments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span>Build your team</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors text-sm font-medium">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </FloatingPanel>
          </Link>

          {/* Organizer Card */}
          <Link to="/auth/organizer/login" className="group">
            <FloatingPanel className="h-full cursor-pointer hover:border-red-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,26,26,0.1)]">
              <div className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(255,26,26,0.3)] transition-all">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Organizer</h2>
                  <p className="text-gray-400 text-sm">
                    Create tournaments, manage teams, and build your esports brand
                  </p>
                </div>

                <div className="mt-auto">
                  <div className="space-y-3 mb-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span>Organize tournaments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span>Manage participants</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 rounded-full bg-red-500" />
                      <span>Access sponsorship radar</span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors text-sm font-medium">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </FloatingPanel>
          </Link>
        </div>

        {/* Staff Link */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Staff? <Link to="/admin" className="text-gray-500 hover:text-gray-400 underline transition-colors">
              Access admin portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}