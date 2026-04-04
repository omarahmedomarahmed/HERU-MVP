import React from 'react';
import { Link } from 'react-router-dom';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import FundingBar from './FundingBar';
import { Calendar, Gamepad2, Users, DollarSign, Trophy, Shield } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ status }) {
  const map = {
    open:         { label: 'Open',         cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    in_progress:  { label: 'In Progress',  cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    fully_funded: { label: 'Fully Funded', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    closed:       { label: 'Closed',       cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' },
  };
  const s = map[status] || map.open;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${s.cls}`}>{s.label}</span>
  );
}

export default function RadarTournamentCard({ radar, onCommit, isSelf = false }) {
  const scheduleDate = radar.schedule ? new Date(radar.schedule) : null;
  const coOrgCount = radar.co_organizers?.length || 0;

  return (
    <FloatingPanel className="p-5 space-y-4" glowBorder={radar.status === 'open'}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={`/organizer/${radar.main_organizer_id}`} onClick={e => e.stopPropagation()} className="flex-shrink-0">
            {radar.main_organizer_brand?.logo ? (
              <img src={radar.main_organizer_brand.logo} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800 hover:ring-2 hover:ring-red-500/50 transition-all" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Shield className="w-5 h-5 text-zinc-500" />
              </div>
            )}
          </Link>
          <div className="min-w-0">
            <h3 className="text-white font-black text-base truncate">{radar.tournament_name}</h3>
            <Link to={`/organizer/${radar.main_organizer_id}`} className="text-gray-500 text-xs hover:text-red-400 transition-colors" onClick={e => e.stopPropagation()}>
              {radar.main_organizer_brand?.name || 'Unknown Organizer'}
            </Link>
          </div>
        </div>
        <StatusBadge status={radar.status} />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Gamepad2 className="w-3 h-3" />{radar.game}</span>
        {scheduleDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(scheduleDate, 'MMM d, yyyy')}
          </span>
        )}
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{coOrgCount} co-organizer{coOrgCount !== 1 ? 's' : ''}</span>
        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />EGP {radar.total_cost?.toLocaleString()}</span>
      </div>

      {/* Description */}
      {radar.description && (
        <p className="text-gray-400 text-sm line-clamp-2">{radar.description}</p>
      )}

      {/* Required Branding Items Preview */}
      {radar.order_breakdown?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Trophy className="w-3 h-3" /> Item Breakdown Preview</p>
          <div className="flex flex-wrap gap-2">
            {radar.order_breakdown.slice(0, 4).map((item, i) => (
              <span key={i} className="text-xs bg-zinc-800 text-gray-300 px-2 py-1 rounded border border-zinc-700 capitalize">
                {item.title}
              </span>
            ))}
            {radar.order_breakdown.length > 4 && (
              <span className="text-xs text-gray-500 px-2 py-1">+{radar.order_breakdown.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Funding Bar */}
      <FundingBar
        percent={radar.funding_percent || 0}
        totalCost={radar.total_cost || 0}
      />

      {/* Co-organizers logos */}
      {coOrgCount > 0 && (
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">Co-organizers:</p>
          <div className="flex -space-x-2">
            {radar.co_organizers.slice(0, 5).map((co, i) => (
              <Link key={i} to={`/organizer/${co.organizer_id}`} title={co.brand_name} onClick={e => e.stopPropagation()}>
                <div className="w-6 h-6 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-red-500/50 transition-all">
                  {co.brand_logo
                    ? <img src={co.brand_logo} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[9px] text-white font-bold">{(co.brand_name || '?')[0]}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={`/radar/tournament/${radar.id}`} className="flex-1">
          <GlowButton className="w-full" size="sm" variant="ghost">
            View Full Details
          </GlowButton>
        </Link>
        {!isSelf && radar.status !== 'fully_funded' && radar.status !== 'closed' && onCommit && (
          <GlowButton size="sm" onClick={() => onCommit(radar)}>
            Commit
          </GlowButton>
        )}
      </div>

      {isSelf && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-zinc-800 rounded-lg px-3 py-2">
          <Shield className="w-3 h-3 text-yellow-400" />
          You are the main organizer of this tournament
        </div>
      )}
    </FloatingPanel>
  );
}