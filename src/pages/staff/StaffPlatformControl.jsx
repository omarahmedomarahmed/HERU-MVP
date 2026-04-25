import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import { Settings, Save, ToggleLeft, ToggleRight } from 'lucide-react';

const DEFAULT_SETTINGS = [
  { key: 'coaching_enabled',      label: 'Coaching Marketplace',       type: 'toggle', description: 'Allow gamers to book coaching sessions.' },
  { key: 'leaderboards_enabled',  label: 'Leaderboards',               type: 'toggle', description: 'Show public leaderboard pages.' },
  { key: 'influencer_marketplace_enabled', label: 'Influencer Marketplace', type: 'toggle', description: 'Allow sponsor influencer browsing.' },
  { key: 'managed_services_enabled', label: 'Managed Services',        type: 'toggle', description: 'Allow sponsors to request managed campaigns.' },
  { key: 'platform_fee_percent',  label: 'Platform Fee (%)',           type: 'number', description: 'HERU platform fee applied to all transactions.' },
  { key: 'min_sponsorship_multiplier', label: 'Min Package Multiplier', type: 'number', description: 'Warn organizers if package < this × service cost.' },
];

export default function StaffPlatformControl() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localValues, setLocalValues] = useState({});

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: rawSettings = [], isLoading } = useQuery({
    queryKey: ['staff-app-settings'],
    queryFn: () => apiCall('/settings'),
    staleTime: 30_000,
    onSuccess: (data) => {
      const vals = {};
      (Array.isArray(data) ? data : data?.data || []).forEach((s) => {
        vals[s.setting_key] = s.setting_value;
      });
      setLocalValues(vals);
    },
  });

  const settings = Array.isArray(rawSettings) ? rawSettings : rawSettings.data || [];

  React.useEffect(() => {
    if (settings.length > 0 && Object.keys(localValues).length === 0) {
      const vals = {};
      settings.forEach((s) => { vals[s.setting_key] = s.setting_value; });
      setLocalValues(vals);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: ({ key, value }) => apiCall(`/settings/${key}`, { method: 'PUT', body: { setting_value: String(value) } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-app-settings'] }),
  });

  function toggle(key) {
    const current = localValues[key];
    const newVal = current === 'true' || current === true ? 'false' : 'true';
    setLocalValues(prev => ({ ...prev, [key]: newVal }));
    saveMutation.mutate({ key, value: newVal });
  }

  function saveNumber(key) {
    saveMutation.mutate({ key, value: localValues[key] });
  }

  return (
    <div>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Platform Control</h1>
          <p className="text-sm text-gray-500 mt-1">Feature toggles and platform-wide configuration.</p>
        </div>

        <div className="space-y-4">
          {DEFAULT_SETTINGS.map((setting) => {
            const value = localValues[setting.key];
            const isOn = value === 'true' || value === true;

            return (
              <div key={setting.key} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900">{setting.label}</p>
                    <code className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{setting.key}</code>
                  </div>
                  <p className="text-xs text-gray-500">{setting.description}</p>
                </div>

                {setting.type === 'toggle' ? (
                  <button
                    onClick={() => toggle(setting.key)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isOn ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {isOn ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    {isOn ? 'Enabled' : 'Disabled'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={localValues[setting.key] || ''}
                      onChange={(e) => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={() => saveNumber(setting.key)}
                      disabled={saveMutation.isPending}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
