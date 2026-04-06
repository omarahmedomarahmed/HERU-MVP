import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bill } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import {
  Share2, Trophy, DollarSign, CheckCircle, Clock, AlertCircle,
  ChevronRight, Gamepad2,
} from 'lucide-react';

const STATUS_STYLES = {
  unpaid: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Clock, label: 'Unpaid' },
  paid: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30', icon: CheckCircle, label: 'Paid' },
  partial: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', icon: AlertCircle, label: 'Partial' },
  overdue: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', icon: AlertCircle, label: 'Overdue' },
};

export default function CoOrganizedTournaments() {
  const { user } = useAuth();

  const { data: coOrgBills = [], isLoading } = useQuery({
    queryKey: ['co-org-bills', user?.id],
    queryFn: () => Bill.list({ bill_type: 'co_organizer' }),
    enabled: !!user?.id,
  });

  // Group bills by tournament
  const tournaments = coOrgBills.reduce((acc, bill) => {
    const key = bill.tournament_id;
    if (!acc[key]) {
      acc[key] = {
        tournament_id: bill.tournament_id,
        tournament_name: bill.tournament_name,
        bills: [],
        total_committed: 0,
        payment_status: 'unpaid',
      };
    }
    acc[key].bills.push(bill);
    acc[key].total_committed += bill.grand_total || 0;
    if (bill.payment_status === 'paid') acc[key].payment_status = 'paid';
    return acc;
  }, {});

  const tournamentList = Object.values(tournaments);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Share2 className="w-7 h-7 text-red-400" />
            Co-Organized Tournaments
          </h1>
          <p className="text-gray-400 mt-1">Tournaments you've joined as a co-organizer or sponsor</p>
        </div>
        <Link to="/organizer/radar">
          <GlowButton variant="secondary" size="sm">
            Browse Radar
          </GlowButton>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <FloatingPanel className="p-4 text-center">
          <p className="text-2xl font-bold text-white">{tournamentList.length}</p>
          <p className="text-xs text-gray-400">Tournaments</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {tournamentList.filter(t => t.payment_status !== 'paid').length}
          </p>
          <p className="text-xs text-gray-400">Pending Payment</p>
        </FloatingPanel>
        <FloatingPanel className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            EGP {coOrgBills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.grand_total || 0), 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Total Invested</p>
        </FloatingPanel>
      </div>

      {/* Tournament Cards */}
      {tournamentList.length === 0 ? (
        <FloatingPanel className="p-12 text-center">
          <Share2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Co-Organized Tournaments Yet</h3>
          <p className="text-gray-400 mb-6">Browse the Sponsorship Radar to find tournaments looking for co-organizers</p>
          <Link to="/organizer/radar">
            <GlowButton className="bg-gradient-to-r from-red-600 to-red-600">
              Explore Radar
            </GlowButton>
          </Link>
        </FloatingPanel>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tournamentList.map(t => {
            const status = STATUS_STYLES[t.payment_status] || STATUS_STYLES.unpaid;
            const StatusIcon = status.icon;
            const bill = t.bills[0];
            return (
              <Link
                key={t.tournament_id}
                to={t.payment_status === 'paid'
                  ? `/organizer/tournaments/${t.tournament_id}/view`
                  : `/organizer/billing/${bill?.bill_number}`
                }
              >
                <FloatingPanel className="p-5 hover:border-red-500/40 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600/30 to-red-600/30 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold group-hover:text-red-300 transition-colors">
                          {t.tournament_name || 'Untitled Tournament'}
                        </h3>
                        {bill?.tournament_name && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Gamepad2 className="w-3 h-3" /> {bill.tournament_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.text} ${status.border} border flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">
                        <DollarSign className="w-3.5 h-3.5 inline" />
                        EGP {t.total_committed.toLocaleString()}
                      </span>
                      {bill?.total_tournament_cost && (
                        <span className="text-gray-500 text-xs">
                          ({Math.round((t.total_committed / bill.total_tournament_cost) * 100)}% of total)
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
                  </div>
                </FloatingPanel>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
