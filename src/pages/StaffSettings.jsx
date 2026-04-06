import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Settings, Shield, Database, Key, Eye, EyeOff, RefreshCw, CheckCircle } from 'lucide-react';
import { AppSettings, GamerProfile, Order, Team, Tournament } from '@/api/heruClient'


const STAFF_KEY_SETTING = 'staff_access_key';

export default function StaffSettings() {
  const [newStaffKey, setNewStaffKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ['app-settings'],
    queryFn: () => AppSettings.list(),
  });

  const staffKeySetting = settings.find(s => s.setting_key === STAFF_KEY_SETTING);
  const currentKey = staffKeySetting?.setting_value || 'HERU-STAFF-2024-SECURE';

  const { data: gamerCount } = useQuery({
    queryKey: ['gamer-count'],
    queryFn: () => GamerProfile.list(),
    select: (d) => d.length
  });
  const { data: teamCount } = useQuery({
    queryKey: ['team-count'],
    queryFn: () => Team.list(),
    select: (d) => d.length
  });
  const { data: tournamentCount } = useQuery({
    queryKey: ['tournament-count'],
    queryFn: () => Tournament.list(),
    select: (d) => d.length
  });
  const { data: orderCount } = useQuery({
    queryKey: ['order-count'],
    queryFn: () => Order.list(),
    select: (d) => d.length
  });

  const updateStaffKeyMutation = useMutation({
    mutationFn: async (key) => {
      if (staffKeySetting) {
        return AppSettings.update(staffKeySetting.id, { setting_value: key });
      } else {
        return AppSettings.create({
          setting_key: STAFF_KEY_SETTING,
          setting_value: key,
          description: 'Staff dashboard access key'
        });
      }
    },
    onSuccess: () => {
      setSuccessMsg('Staff access key updated! You will need the new key on next login.');
      setNewStaffKey('');
      queryClient.invalidateQueries(['app-settings']);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  });

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const key = 'HERU-STAFF-' + Array.from({length: 4}, () => 
      Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
    setNewStaffKey(key);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">
            STAFF <span className="text-red-500">SETTINGS</span>
          </h1>
          <p className="text-gray-400">Platform configuration and security management</p>
        </div>

        {/* Staff Access Key */}
        <FloatingPanel className="p-6 mb-6" glowBorder>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-red-500" />
            Staff Access Key
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            This key protects the entire staff area. Keep it secret. Changing it will require the new key on next staff login.
          </p>

          <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-xs text-gray-500 mb-1">Current active key:</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-sm flex-1 break-all">
                {showKey ? currentKey : '•'.repeat(Math.min(currentKey.length, 30))}
              </p>
              <button onClick={() => setShowKey(!showKey)} className="text-gray-400 hover:text-white flex-shrink-0">
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newStaffKey}
                onChange={(e) => setNewStaffKey(e.target.value)}
                placeholder="Enter new staff access key..."
                className="bg-zinc-800 border-zinc-700 text-white font-mono flex-1"
                type={showKey ? 'text' : 'password'}
              />
              <GlowButton variant="ghost" size="sm" onClick={generateRandomKey} title="Generate random key">
                <RefreshCw className="w-4 h-4" />
              </GlowButton>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <p className="text-green-400 text-sm">{successMsg}</p>
              </div>
            )}

            <GlowButton
              className="w-full"
              onClick={() => newStaffKey.trim() && updateStaffKeyMutation.mutate(newStaffKey.trim())}
              disabled={!newStaffKey.trim()}
            >
              <Shield className="w-4 h-4" /> Update Staff Access Key
            </GlowButton>
          </div>
        </FloatingPanel>

        {/* Platform Statistics */}
        <FloatingPanel className="p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 text-red-500" />
            Platform Statistics
          </h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-gray-400">Total Gamers</p>
              <p className="text-2xl font-bold text-white">{gamerCount ?? '-'}</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-gray-400">Total Teams</p>
              <p className="text-2xl font-bold text-white">{teamCount ?? '-'}</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-gray-400">Total Tournaments</p>
              <p className="text-2xl font-bold text-white">{tournamentCount ?? '-'}</p>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-lg">
              <p className="text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-white">{orderCount ?? '-'}</p>
            </div>
          </div>
        </FloatingPanel>

        <FloatingPanel className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Quick Actions
          </h2>
          <GlowButton 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => { sessionStorage.removeItem('staff_session'); window.location.href = '/admin'; }}
          >
            Logout from Staff Area
          </GlowButton>
        </FloatingPanel>
      </div>
    </>
  );
}