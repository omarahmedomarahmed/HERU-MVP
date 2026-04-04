import React from 'react';
import { Users, User } from 'lucide-react';

export default function TournamentTypeBadge({ tournament, coOrganizerProfiles = [] }) {
  if (!tournament) return null;

  if (tournament.tournament_type === 'shared') {
    const coOrgs = tournament.co_organizers || [];
    return (
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <Users className="w-3 h-3" /> Shared
        </span>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
          <span>Organized by</span>
          <span className="text-white font-medium">{tournament.organizer_brand?.name || 'Main Organizer'}</span>
          {coOrgs.length > 0 && (
            <>
              <span>+</span>
              <div className="flex -space-x-1.5 items-center">
                {coOrgs.slice(0, 4).map((co, i) => (
                  <div
                    key={i}
                    title={co.brand_name}
                    className="w-5 h-5 rounded-full bg-zinc-700 border border-zinc-600 overflow-hidden flex items-center justify-center"
                  >
                    {co.brand_logo
                      ? <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                      : <span className="text-[8px] text-white font-bold">{(co.brand_name || '?')[0]}</span>}
                  </div>
                ))}
              </div>
              <span className="text-gray-400">{coOrgs.length} co-organizer{coOrgs.length !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-700/60 text-gray-300 border border-zinc-600/50">
      <User className="w-3 h-3" /> Solo
    </span>
  );
}