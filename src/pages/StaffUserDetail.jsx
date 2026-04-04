import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { ArrowLeft, Shield, Mail, Calendar } from 'lucide-react';
import { Bill, GamerProfile, OrganizerProfile, Staff } from '@/api/heruClient'


export default function StaffUserDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['staff-user-detail', id],
    queryFn: () => Staff.list().then(u => u.find(x => x.id === id)),
    enabled: !!id,
  });

  const { data: gamerProfile } = useQuery({
    queryKey: ['user-gamer-profile', id],
    queryFn: () => GamerProfile.list({ user_id: id }),
    enabled: !!id,
  });

  const { data: organizerProfile } = useQuery({
    queryKey: ['user-organizer-profile', id],
    queryFn: () => OrganizerProfile.list({ user_id: id }),
    enabled: !!id,
  });

  const { data: bills = [] } = useQuery({
    queryKey: ['user-bills', id],
    queryFn: () => Bill.list({ payer_id: id }),
    enabled: !!id,
  });

  if (!user) return <StaffLayout><div className="p-8">Loading...</div></StaffLayout>;

  return (
    <StaffLayout>
      <div className="space-y-6">
        <Link to="/dashboard/staff/users" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <FloatingPanel className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center">
              {user.role === 'admin' ? <Shield className="w-8 h-8 text-red-500" /> : <span className="text-2xl">👤</span>}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user.full_name}</h1>
              <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" /> Joined {new Date(user.created_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </FloatingPanel>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['profile', 'activity', 'approvals'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <FloatingPanel className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Role</p>
                <p className="text-white font-bold">{user.role?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Verified</p>
                <p className="text-white font-bold">{user.is_verified ? '✓ Yes' : 'No'}</p>
              </div>
            </div>
            {gamerProfile?.[0] && (
              <div className="border-t border-zinc-700 pt-4">
                <p className="text-gray-400 text-sm mb-3 font-bold">Gamer Profile</p>
                <p className="text-gray-300">Username: {gamerProfile[0].username}</p>
                <p className="text-gray-300">Is Talent: {gamerProfile[0].is_talent ? 'Yes' : 'No'}</p>
              </div>
            )}
            {organizerProfile?.[0] && (
              <div className="border-t border-zinc-700 pt-4">
                <p className="text-gray-400 text-sm mb-3 font-bold">Organizer Profile</p>
                <p className="text-gray-300">Brand: {organizerProfile[0].brand_name}</p>
                <p className="text-gray-300">Tournaments: {organizerProfile[0].total_tournaments_organized || 0}</p>
              </div>
            )}
          </FloatingPanel>
        )}

        {activeTab === 'activity' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-400 text-sm mb-4">Bills & Orders</p>
            <div className="space-y-2">
              {bills.length === 0 ? (
                <p className="text-gray-500 text-sm">No activity</p>
              ) : (
                bills.map(b => (
                   <Link key={b.id} to={`/dashboard/staff/billing/${b.bill_number}`} className="block bg-zinc-800/50 p-3 rounded hover:bg-zinc-800 transition">
                     <p className="text-white font-bold text-sm">{b.bill_number}</p>
                     <p className="text-gray-400 text-xs">{b.tournament_name} • EGP {b.grand_total?.toLocaleString()}</p>
                   </Link>
                 ))
              )}
            </div>
          </FloatingPanel>
        )}

        {activeTab === 'approvals' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-400 text-sm">No approvals pending</p>
          </FloatingPanel>
        )}
      </div>
    </StaffLayout>
  );
}