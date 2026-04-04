import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import { Radar as RadarIcon, ChevronLeft } from 'lucide-react';
import FundingBar from '@/components/radar/FundingBar';
import EmbeddedRadarDetail from '@/components/radar/EmbeddedRadarDetail';
import { SponsorshipRadar } from '@/api/heruClient'


export default function EmbeddedRadar({ session, profile }) {
  const [selectedRadar, setSelectedRadar] = useState(null);

  const { data: radars = [] } = useQuery({
    queryKey: ['organizer-radar-embedded'],
    queryFn: () => SponsorshipRadar.list({ status: ['open', 'in_progress'] }, '-created_date'),
  });

  const myRadars = radars.filter(r => r.main_organizer_id === session?.profileId);
  const sponsorableRadars = radars.filter(r => r.main_organizer_id !== session?.profileId);

  if (selectedRadar) {
    return (
      <EmbeddedRadarDetail
        radarId={selectedRadar.id}
        onBack={() => setSelectedRadar(null)}
        session={session}
        profile={profile}
      />
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-white">MY <span className="text-red-500">SPONSORSHIPS</span></h1>

      {/* My Sponsorships */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <RadarIcon className="w-5 h-5 text-yellow-500" /> My Listed Tournaments ({myRadars.length})
        </h2>
        {myRadars.length === 0 ? (
          <FloatingPanel className="p-12 text-center">
            <RadarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No tournaments listed on Sponsorship Radar yet</p>
            <p className="text-gray-500 text-sm">Create a shared tournament to list it here and attract co-organizers</p>
          </FloatingPanel>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {myRadars.map(r => (
              <GameCard key={r.id} className="p-6 h-full cursor-pointer hover:border-red-500 transition-colors" onClick={() => setSelectedRadar(r)}>
                <h3 className="text-white font-bold text-lg mb-2">{r.tournament_name}</h3>
                <p className="text-gray-400 text-sm mb-4">{r.game}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Cost</span>
                    <span className="text-white font-bold">EGP {r.total_cost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Your Contribution</span>
                    <span className="text-yellow-400 font-bold">{r.main_organizer_percent}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Co-Organizers</span>
                    <span className="text-white font-bold">{r.co_organizers?.length || 0}</span>
                  </div>
                </div>
                <FundingBar percent={r.funding_percent} totalCost={r.total_cost} />
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-yellow-400 font-bold">{r.funding_percent}% Funded</span>
                  <span className="text-red-400">EGP {(r.amount_still_needed || 0).toLocaleString()} needed</span>
                </div>
                <GlowButton className="w-full mt-4" size="sm">View Details →</GlowButton>
              </GameCard>
            ))}
          </div>
        )}
      </div>

      {/* Available Sponsorships */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <RadarIcon className="w-5 h-5 text-green-500" /> Available Sponsorships ({sponsorableRadars.length})
        </h2>
        {sponsorableRadars.length === 0 ? (
          <FloatingPanel className="p-12 text-center">
            <RadarIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No tournaments available to sponsor yet</p>
          </FloatingPanel>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {sponsorableRadars.map(r => (
              <GameCard key={r.id} className="p-6 h-full cursor-pointer hover:border-yellow-500 transition-colors" onClick={() => setSelectedRadar(r)}>
                <h3 className="text-white font-bold text-lg mb-2">{r.tournament_name}</h3>
                <p className="text-gray-400 text-sm mb-4">{r.game}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Cost</span>
                    <span className="text-white font-bold">EGP {r.total_cost?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Funding</span>
                    <span className="text-yellow-400 font-bold">{r.funding_percent}%</span>
                  </div>
                </div>
                <FundingBar percent={r.funding_percent} totalCost={r.total_cost} />
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-red-400">EGP {(r.amount_still_needed || 0).toLocaleString()} needed</span>
                </div>
                <GlowButton className="w-full mt-4" size="sm" variant="secondary">Commit & Details →</GlowButton>
              </GameCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}