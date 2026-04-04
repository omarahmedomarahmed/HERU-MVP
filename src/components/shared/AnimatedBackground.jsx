import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      
      {/* Carbon fiber texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.02) 2px,
            rgba(255,255,255,0.02) 4px
          ), repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(255,255,255,0.02) 2px,
            rgba(255,255,255,0.02) 4px
          )`
        }}
      />
      
      {/* Animated red grid lines */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,26,26,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,26,26,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>
      
      {/* Moving red light sweep */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,26,26,0.1) 50%, transparent 100%)',
          animation: 'sweep 8s ease-in-out infinite'
        }}
      />
      
      {/* Corner gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-red-500/5 to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-red-500/5 to-transparent" />
      
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        @keyframes sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}