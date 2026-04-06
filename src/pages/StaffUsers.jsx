import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import { Users, Shield } from 'lucide-react';
import { Staff } from '@/api/heruClient'


export default function StaffUsers() {
  const [filterRole, setFilterRole] = useState('all');
  const [filterVerified, setFilterVerified] = useState('all');

  const { data: users = [] } = useQuery({
    queryKey: ['staff-all-users'],
    queryFn: () => Staff.list('-created_date'),
  });

  const filtered = users.filter(u => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (filterVerified === 'verified' && !u.is_verified) return false;
    if (filterVerified === 'unverified' && u.is_verified) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-black text-white">ALL <span className="text-red-500">USERS</span></h1>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded text-sm"
          >
            <option value="all">All Roles</option>
            <option value="user">Gamer</option>
            <option value="organizer">Organizer</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 text-white rounded text-sm"
          >
            <option value="all">All Verified</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        <FloatingPanel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition">
                    <td className="px-6 py-4 text-white font-bold">{u.full_name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded ${u.is_verified ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-gray-400'}`}>
                        {u.is_verified ? '✓ Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(u.created_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/dashboard/staff/users/${u.id}`} className="text-red-400 hover:text-red-300 text-sm font-bold">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FloatingPanel>
      </div>
    </>
  );
}