import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Key, Shield, Eye, EyeOff, RefreshCw, Plus,
  User, Percent,
} from 'lucide-react';
import { Staff, AppSettings } from '@/api/heruClient';
import { useAuth } from '@/lib/AuthContext';

export default function StaffSettings() {
  const queryClient = useQueryClient();

  // Current session info from localStorage
  const staffName = localStorage.getItem('heru_staff_name') || 'Staff User';
  const staffEmail = localStorage.getItem('heru_staff_email') || '--';

  // Access keys
  const { data: accessKeys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['staff-access-keys'],
    queryFn: () => Staff.accessKeys(),
  });

  // App settings
  const { data: settings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['staff-app-settings'],
    queryFn: () => AppSettings.list(),
  });

  const platformFeeSetting = settings.find?.(s => s.setting_key === 'platform_fee_percent');
  const [feePercent, setFeePercent] = useState('');
  React.useEffect(() => {
    if (platformFeeSetting) setFeePercent(platformFeeSetting.setting_value || '15');
  }, [platformFeeSetting]);

  // New key form
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ staff_name: '', staff_email: '', access_key: '' });
  const [showKeys, setShowKeys] = useState({});

  const createKeyMutation = useMutation({
    mutationFn: (data) => Staff.createAccessKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-access-keys'] });
      setShowNewKey(false);
      setNewKeyForm({ staff_name: '', staff_email: '', access_key: '' });
    },
  });

  const deactivateKeyMutation = useMutation({
    mutationFn: (id) => Staff.deactivateKey(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-access-keys'] }),
  });

  const updateFeeMutation = useMutation({
    mutationFn: (value) => {
      if (platformFeeSetting) {
        return AppSettings.update(platformFeeSetting.setting_key, { setting_value: value });
      }
      return Promise.resolve();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-app-settings'] }),
  });

  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const key = 'HERU-STAFF-' + Array.from({ length: 3 }, () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
    setNewKeyForm(f => ({ ...f, access_key: key }));
  };

  const toggleShowKey = (id) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Staff <span className="text-red-400">Settings</span>
      </h1>

      {/* Current Session Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-red-400" />
          Current Session
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Staff Name</p>
            <p className="text-white text-sm">{staffName}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Email</p>
            <p className="text-white text-sm">{staffEmail}</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('heru_staff_token');
            localStorage.removeItem('heru_staff_expires');
            localStorage.removeItem('heru_staff_name');
            localStorage.removeItem('heru_staff_email');
            window.location.href = '/admin';
          }}
          className="mt-4 w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          Logout from Staff Area
        </button>
      </div>

      {/* Staff Access Keys */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-red-400" />
            Staff Access Keys
          </h2>
          <button
            onClick={() => setShowNewKey(!showNewKey)}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3 h-3" /> New Key
          </button>
        </div>

        {/* New key form */}
        {showNewKey && (
          <div className="bg-zinc-800 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Staff Name</label>
                <input
                  value={newKeyForm.staff_name}
                  onChange={e => setNewKeyForm(f => ({ ...f, staff_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Staff Email</label>
                <input
                  value={newKeyForm.staff_email}
                  onChange={e => setNewKeyForm(f => ({ ...f, staff_email: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
                  placeholder="Email"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Access Key</label>
              <div className="flex gap-2">
                <input
                  value={newKeyForm.access_key}
                  onChange={e => setNewKeyForm(f => ({ ...f, access_key: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-red-500"
                  placeholder="HERU-STAFF-..."
                />
                <button
                  onClick={generateRandomKey}
                  className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-300 rounded-lg transition-colors"
                  title="Generate random key"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewKey(false)}
                className="px-3 py-2 bg-zinc-700 text-gray-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => createKeyMutation.mutate(newKeyForm)}
                disabled={!newKeyForm.staff_name || !newKeyForm.staff_email || !newKeyForm.access_key || createKeyMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              >
                Create Key
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        {keysLoading ? (
          <p className="text-gray-500 text-sm">Loading keys...</p>
        ) : (Array.isArray(accessKeys) ? accessKeys : []).length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No access keys found</p>
        ) : (
          <div className="space-y-2">
            {(Array.isArray(accessKeys) ? accessKeys : []).map(key => (
              <div key={key.id} className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${key.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium">{key.staff_name}</p>
                    <p className="text-gray-500 text-xs">{key.staff_email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-gray-400 text-xs font-mono">
                        {showKeys[key.id] ? key.access_key : '****-****-****'}
                      </p>
                      <button onClick={() => toggleShowKey(key.id)} className="text-gray-500 hover:text-gray-300">
                        {showKeys[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {key.use_count != null && (
                    <span className="text-xs text-gray-500">Used {key.use_count}x</span>
                  )}
                  {key.is_active ? (
                    <button
                      onClick={() => deactivateKeyMutation.mutate(key.id)}
                      disabled={deactivateKeyMutation.isPending}
                      className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-zinc-700 text-gray-500 rounded">Inactive</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform Settings */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Percent className="w-5 h-5 text-red-400" />
          Platform Settings
        </h2>
        <div className="bg-zinc-800 rounded-lg p-4">
          <label className="text-xs text-gray-400 block mb-2">Platform Fee Percentage</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={feePercent}
              onChange={e => setFeePercent(e.target.value)}
              className="w-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-red-500"
            />
            <span className="text-gray-400 text-sm">%</span>
            <button
              onClick={() => updateFeeMutation.mutate(feePercent)}
              disabled={updateFeeMutation.isPending || !feePercent}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              Save
            </button>
          </div>
          <p className="text-gray-500 text-xs mt-2">
            Currently set to {platformFeeSetting?.setting_value || '15'}%. This fee is added on top of every tournament cost.
          </p>
        </div>
      </div>
    </div>
  );
}
