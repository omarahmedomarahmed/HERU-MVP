import React from 'react';

export default function Layout({ children, currentPageName }) {
  // Layout is minimal - each page has its own layout based on role
  // This ensures different visual layouts for Gamer, Organizer, and Staff
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }
        @keyframes sweep {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #ff1a1a;
        }
        
        /* Selection color */
        ::selection {
          background: rgba(255, 26, 26, 0.3);
          color: white;
        }
      `}</style>
      {children}
    </div>
  );
}