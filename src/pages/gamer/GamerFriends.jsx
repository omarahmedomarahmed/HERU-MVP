import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import { Users, UserPlus, Check, X, Search, Loader2, Clock } from 'lucide-react';

export default function GamerFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [addInput, setAddInput] = useState('');
  const [tab, setTab] = useState('friends');

  const { data: rawFriends = [], isLoading: fLoading } = useQuery({
    queryKey: ['my-friends', user?.id],
    queryFn: () => apiCall('/friends'),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: rawRequests = [], isLoading: rLoading } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: () => apiCall('/friends/requests'),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const friends = Array.isArray(rawFriends) ? rawFriends : rawFriends.data || [];
  const requests = Array.isArray(rawRequests) ? rawRequests : rawRequests.data || [];

  const sendMutation = useMutation({
    mutationFn: (addressee_id) => apiCall('/friends/request', { method: 'POST', body: { addressee_id } }),
    onSuccess: () => { setAddInput(''); queryClient.invalidateQueries({ queryKey: ['my-friends'] }); },
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => apiCall(`/friends/${id}/accept`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friend-requests', 'my-friends'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => apiCall(`/friends/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-friends'] }),
  });

  const tabs = [
    { key: 'friends', label: 'Friends', count: friends.length },
    { key: 'requests', label: 'Requests', count: requests.length },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">Friends</h2>
        <div className="flex gap-2 bg-zinc-800 rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${tab === t.key ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              {t.label} {t.count > 0 && <span className="ml-0.5 opacity-70">({t.count})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Add friend */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            placeholder="Enter user ID to add friend..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500"
          />
        </div>
        <button
          onClick={() => addInput && sendMutation.mutate(addInput)}
          disabled={!addInput || sendMutation.isPending}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
        >
          {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
        </button>
      </div>

      {tab === 'friends' && (
        <div className="space-y-2">
          {fLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-red-400 animate-spin" /></div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No friends yet. Use the search above to add friends.</p>
            </div>
          ) : friends.map((f) => {
            const partnerId = f.requester_id === user?.id ? f.addressee_id : f.requester_id;
            return (
              <div key={f.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                    {partnerId?.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-sm text-white font-medium">{partnerId?.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => removeMutation.mutate(f.id)}
                  className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-2">
          {rLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-red-400 animate-spin" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No pending friend requests.</p>
            </div>
          ) : requests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm">
                  {req.requester_id?.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm text-white font-medium">{req.requester_id?.slice(0, 8)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptMutation.mutate(req.id)}
                  disabled={acceptMutation.isPending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  onClick={() => removeMutation.mutate(req.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-gray-400 hover:bg-zinc-700 transition"
                >
                  <X className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
