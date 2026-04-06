import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, RotateCcw, CheckCircle } from 'lucide-react';
import { apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Single setting row
// ---------------------------------------------------------------------------

function SettingRow({ setting, onSave, saving }) {
  const [value, setValue] = useState(setting.setting_value || '');
  const [saved, setSaved] = useState(false);
  const isDirty = value !== (setting.setting_value || '');

  function handleSave() {
    onSave(setting.id || setting.setting_key, value, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleReset() {
    setValue(setting.setting_value || '');
  }

  // Determine input type based on value
  const isBool = value === 'true' || value === 'false';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="sm:w-1/3 min-w-0">
        <p className="text-sm font-medium text-gray-900 font-mono">{setting.setting_key}</p>
        {setting.description && (
          <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="flex-1 flex items-center gap-2">
        {isBool ? (
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
          />
        )}
        {isDirty && (
          <button
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!isDirty || saving}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
        >
          {saved ? (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffSettings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [savingKey, setSavingKey] = useState(null);

  // Staff guard
  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  // Fetch
  const { data: rawSettings = [], isLoading } = useQuery({
    queryKey: ['staff-settings'],
    queryFn: () => apiCall('/settings'),
    staleTime: 60_000,
  });

  const settings = Array.isArray(rawSettings) ? rawSettings : rawSettings.data || [];

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: ({ key, value }) =>
      apiCall(`/settings/${key}`, {
        method: 'PUT',
        body: { setting_value: value },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-settings'] });
    },
  });

  function handleSave(key, value, onDone) {
    setSavingKey(key);
    saveMutation.mutate(
      { key, value },
      {
        onSettled: () => {
          setSavingKey(null);
          if (onDone) onDone();
        },
      }
    );
  }

  // Fallback settings to show when no data exists yet
  const defaultSettings = [
    { setting_key: 'platform_fee_percent', setting_value: '15', description: 'Platform fee percentage applied to all tournament costs' },
    { setting_key: 'paymob_enabled', setting_value: 'false', description: 'Enable Paymob payment gateway integration' },
    { setting_key: 'maintenance_mode', setting_value: 'false', description: 'Put the platform in maintenance mode' },
    { setting_key: 'min_commitment_percent', setting_value: '33', description: 'Minimum commitment percentage for co-organizers' },
    { setting_key: 'max_co_organizers', setting_value: '2', description: 'Maximum co-organizers per shared tournament' },
  ];

  const displaySettings = settings.length > 0 ? settings : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-red-50 p-2.5">
              <Settings className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage platform configuration</p>
            </div>
          </div>
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading settings...</div>
          ) : displaySettings.length === 0 ? (
            <div className="px-6 py-10">
              <p className="text-sm text-gray-400 text-center mb-6">
                No settings found. Default configuration values shown below for reference.
              </p>
              <div className="px-2">
                {defaultSettings.map((s) => (
                  <div key={s.setting_key} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="sm:w-1/3">
                      <p className="text-sm font-medium text-gray-500 font-mono">{s.setting_key}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-gray-600 font-mono">{s.setting_value}</span>
                      <span className="ml-2 text-xs text-gray-400">(default)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 py-2">
              {displaySettings.map((s) => (
                <SettingRow
                  key={s.id || s.setting_key}
                  setting={s}
                  onSave={handleSave}
                  saving={savingKey === (s.id || s.setting_key)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-xs text-red-700">
            Changes take effect immediately. Some settings (like maintenance mode) may require a page refresh for users to see the update.
          </p>
        </div>
      </div>
    </div>
  );
}
