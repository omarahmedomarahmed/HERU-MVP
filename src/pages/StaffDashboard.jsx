import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import StaffLayout from '@/components/layouts/StaffLayout';
import { BillingSnapshot, MarketplaceItem, OrganizerProfile, SponsorshipRadar, Tournament, TournamentOrder, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

import {
  Trophy, Radar, CreditCard, Users, ShoppingCart, Plus, Lock, Check,
  DollarSign, TrendingUp
} from 'lucide-react';

const TABS = [
  { id: 'tournaments', label: 'All Tournaments', icon: Trophy },
  { id: 'radar', label: 'Sponsorship Radar', icon: Radar },
  { id: 'orders', label: 'Tournament Orders', icon: CreditCard },
  { id: 'organizers', label: 'All Organizers', icon: Users },
  { id: 'marketplace', label: 'Marketplace Items', icon: ShoppingCart },
  { id: 'billing', label: 'Master Billing', icon: CreditCard },
];

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
      return;
    }
    apiCall('/auth/me').then(u => setUser(u)).catch(() => setUser(null));
  }, [navigate]);

  return (
    <StaffLayout user={user}>
      <div>
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'tournaments' && <TournamentsTab />}
        {activeTab === 'radar' && <RadarTab />}
        {activeTab === 'orders' && <OrdersTab navigate={navigate} />}
        {activeTab === 'organizers' && <OrganizersTab />}
        {activeTab === 'marketplace' && <MarketplaceTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </StaffLayout>
  );
}

function TournamentsTab() {
  const { data: tournaments = [] } = useQuery({
    queryKey: ['staff-all-tournaments'],
    queryFn: () => Tournament.list('-created_date'),
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">ALL <span className="text-red-500">TOURNAMENTS</span></h1>
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Game</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Teams</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map(t => (
                <tr key={t.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white font-bold">{t.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{t.game}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      t.status === 'live' ? 'bg-green-500/20 text-green-400' :
                      t.status === 'published' ? 'bg-blue-500/20 text-blue-400' :
                      t.status === 'draft' ? 'bg-zinc-700 text-gray-300' :
                      'bg-gray-600/20 text-gray-400'
                    }`}>
                      {t.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{t.teams?.length || 0}/{t.max_teams || '∞'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      t.tournament_type === 'shared' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-gray-300'
                    }`}>
                      {t.tournament_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/tournament/${t.id}`} className="text-red-400 hover:text-red-300 text-sm font-bold">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>
    </div>
  );
}

function RadarTab() {
  const { data: radars = [] } = useQuery({
    queryKey: ['staff-all-radar'],
    queryFn: () => SponsorshipRadar.list('-created_date'),
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">SPONSORSHIP <span className="text-red-500">RADAR</span></h1>
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Game</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Funding %</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {radars.map(r => (
                <tr key={r.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white font-bold">{r.tournament_name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{r.game}</td>
                  <td className="px-6 py-4 text-white font-bold">EGP {r.total_cost?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white font-bold">{r.funding_percent}%</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      r.status === 'fully_funded' ? 'bg-green-500/20 text-green-400' :
                      r.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-zinc-700 text-gray-300'
                    }`}>
                      {r.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/radar/tournament/${r.id}`} className="text-red-400 hover:text-red-300 text-sm font-bold">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>
    </div>
  );
}

function OrdersTab({ navigate }) {
  const { data: orders = [] } = useQuery({
    queryKey: ['staff-all-orders'],
    queryFn: () => TournamentOrder.list('-created_date'),
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">TOURNAMENT <span className="text-red-500">ORDERS</span></h1>
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Main Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Total (EGP)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white font-bold">{o.tournament_name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      o.tournament_type === 'shared' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-gray-300'
                    }`}>
                      {o.tournament_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{o.main_organizer_brand}</td>
                  <td className="px-6 py-4 text-white font-bold">EGP {o.grand_total?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      o.fulfillment_status === 'fulfilled' ? 'bg-green-500/20 text-green-400' :
                      o.fulfillment_status === 'in_fulfillment' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {o.fulfillment_status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => navigate(`/staff/tournament-orders/${o.id}`)} className="text-red-400 hover:text-red-300 text-sm font-bold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>
    </div>
  );
}

function OrganizersTab() {
  const { data: organizers = [] } = useQuery({
    queryKey: ['staff-all-organizers'],
    queryFn: () => OrganizerProfile.list('-created_date'),
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">ALL <span className="text-red-500">ORGANIZERS</span></h1>
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Brand Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Email</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Location</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Tournaments</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {organizers.map(o => (
                <tr key={o.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white font-bold">{o.brand_name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{o.organizer_email}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{o.location || '—'}</td>
                  <td className="px-6 py-4 text-white font-bold">{o.total_tournaments_organized || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      o.is_verified ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-gray-400'
                    }`}>
                      {o.is_verified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href={`/organizer/${o.id}`} className="text-red-400 hover:text-red-300 text-sm font-bold">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>
    </div>
  );
}

function MarketplaceTab() {
  const { data: items = [] } = useQuery({
    queryKey: ['staff-marketplace-items'],
    queryFn: () => MarketplaceItem.list('-created_date'),
  });

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6">MARKETPLACE <span className="text-red-500">ITEMS</span></h1>
      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Category</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Price (EGP)</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white font-bold">{item.title}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{item.category}</td>
                  <td className="px-6 py-4 text-white font-bold">EGP {item.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>
    </div>
  );
}

function BillingTab() {
  const { data: snapshots = [] } = useQuery({
    queryKey: ['staff-billing-snapshots'],
    queryFn: () => BillingSnapshot.list('-created_at'),
  });

  const stats = {
    total: snapshots.reduce((sum, s) => sum + s.amount_due, 0),
    paid: snapshots.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + s.amount_paid, 0),
    pending: snapshots.filter(s => s.payment_status !== 'paid').length,
  };

  const handleStatusUpdate = async (snapshot, newStatus) => {
    await BillingSnapshot.update(snapshot.id, { payment_status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white mb-6">MASTER <span className="text-red-500">BILLING</span></h1>
        
        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <FloatingPanel className="p-5">
            <p className="text-gray-400 text-xs mb-1 uppercase">Total Due</p>
            <p className="text-white font-black text-2xl">EGP {stats.total.toLocaleString()}</p>
          </FloatingPanel>
          <FloatingPanel className="p-5">
            <p className="text-gray-400 text-xs mb-1 uppercase">Paid</p>
            <p className="text-green-400 font-black text-2xl">EGP {stats.paid.toLocaleString()}</p>
          </FloatingPanel>
          <FloatingPanel className="p-5">
            <p className="text-gray-400 text-xs mb-1 uppercase">Pending</p>
            <p className="text-yellow-400 font-black text-2xl">{stats.pending}</p>
          </FloatingPanel>
        </div>
      </div>

      <FloatingPanel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Organizer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Amount Due</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map(s => (
                <tr key={s.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                  <td className="px-6 py-4 text-white font-bold">{s.tournament_name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{s.organizer_brand_name}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${s.billing_type === 'main_organizer' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {s.billing_type?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white font-bold">EGP {s.amount_due?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-400 font-bold">EGP {s.amount_paid?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      s.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                      s.payment_status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-zinc-700 text-gray-400'
                    }`}>
                      {s.payment_status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {s.payment_status !== 'paid' && (
                      <button onClick={() => handleStatusUpdate(s, 'paid')} className="text-red-400 hover:text-red-300 text-sm font-bold">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FloatingPanel>
    </div>
  );
}