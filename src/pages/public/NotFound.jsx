import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import GlowButton from '@/components/ui/GlowButton';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#0a0a0a' }}>
      {/* 404 heading */}
      <h1
        className="text-[10rem] sm:text-[12rem] font-black leading-none select-none"
        style={{
          color: '#ff1a1a',
          textShadow: '0 0 40px rgba(255,26,26,0.4), 0 0 80px rgba(255,26,26,0.2)',
          fontFamily: "'Rajdhani', 'Inter', sans-serif",
          letterSpacing: '-0.04em',
        }}
      >
        404
      </h1>

      {/* Messages */}
      <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-wide uppercase">
        Page Not Found
      </h2>
      <p className="mt-3 text-gray-400 text-center max-w-md text-sm sm:text-base leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>

      {/* Go Home button */}
      <div className="mt-10">
        <GlowButton size="lg" onClick={() => navigate('/')}>
          <Home className="w-5 h-5" />
          Go Home
        </GlowButton>
      </div>
    </div>
  );
}
