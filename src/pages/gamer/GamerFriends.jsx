import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import GamerLayout from '@/components/layouts/GamerLayout';
import { Users, UserPlus, Check, X, Search, Loader2, Clock, MessageSquare, User2 } from 'lucide-react';

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export default function GamerFriends() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('friends');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { data: rawFriends = [], isLoading: fLoading } = useQuery({
    queryKey: ['my-friends', user?.id],
    queryFn: () => apiCall('/friends').then(d => Array.isArray(d) ? d : d?.friends || d?.data || []),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const { data: rawRequests = [], isLoading: rLoading } = useQuery({
    queryKey: ['friend-requests', user?.id],
    queryFn: () => apiCall('/friends/requests').then(d => Array.isArray(d) ? d : d?.requests || d?.data || []),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const friends = Array.isArray(rawFriends) ? rawFriends : [];
  const requests = Array.isArray(rawRequests) ? rawRequests : [];

  const sendMutation = useMutation({
    mutationFn: (friend_id) => apiCall('/friends/request', { method: 'POST', body: { friend_id } }),
    onSuccess: () => { setSearch(''); setSearchResults([]); queryClient.invalidateQueries({ queryKey: ['my-friends'] }); },
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => apiCall(`/friends/${id}/accept`, { method: 'PUT' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['friend-requests'] }); queryClient.invalidateQueries({ queryKey: ['my-friends'] }); },
  });

  const removeMutation = useMutation({
    mutationFn: (id) => apiCall(`/friends/${id}`, { method: 'DELETE' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-friends'] }); queryClient.invalidateQueries({ queryKey: ['friend-requests'] }); },
  });

  const doSearch = useCallback(debounce(async (q) => {
    if (!q || q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const data = await apiCall(`/friends/search?q=${encodeURIComponent(q)}`);
      setSearchResults(data?.users || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, 400), []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    doSearch(e.target.value);
  };

  const friendIds = new Set(friends.flatMap(f => [f.user_id, f.friend_id]).filter(id => id !== user?.id));
  const requestedIds = new Set(requests.map(r => r.user_id));

  const getPartnerLabel = (f) => {
    const otherId = f.user_id === user?.id ? f.friend_id : f.user_id;
    return f.friend_name || f.user_name || otherId?.slice(0, 8) || 'Unknown';
  };
  const getPartnerId = (f) => f.user_id === user?.id ? f.friend_id : f.user_id;

  const tabs = [
    { key: 'friends', label: 'Friends', count: friends.length },
    { key: 'requests', label: 'Requests', count: requests.length },
    { key: 'add', label: 'Add Friend' },
  ];

  return (
    <GamerLayout>
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-white">Friends</h2>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${tab === t.key ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              {t.label}
              {t.count > 0 && <span className="ml-1 bg-white/20 text-[10px] px-1 rounded-full">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Add Friend Tab */}
      {tab === 'add' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-1">Find Players</h3>
            <p className="text-gray-400 text-xs mb-4">Search by name to send a friend request</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input value={search} onChange={handleSearchChange}
                placeholder="Search by player name..."
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500" />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map(u => {
                const isFriend = friendIds.has(u.id);
                const isPending = requestedIds.has(u.id);
                return (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : <User2 className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{u.full_name}</p>
                        <p className="text-gray-500 text-xs capitalize">{u.role}</p>
                      </div>
                    </div>
                    {isFriend ? (
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Friends</span>
                    ) : isPending ? (
                      <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">Pending</span>
                    ) : (
                      <button onClick={() => sendMutation.mutate(u.id)} disabled={sendMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-500 text-white transition disabled:opacity-50">
                        <UserPlus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {search.length >= 2 && !searching && searchResults.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-4">No players found matching "{search}"</p>
          )}
        </div>
      )}

      {/* Friends Tab */}
      {tab === 'friends' && (
        <div className="space-y-2">
          {fLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-red-400 animate-spin" /></div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Users className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-3">No friends yet</p>
              <button onClick={() => setTab('add')} className="text-red-400 text-sm hover:text-red-300 transition-colors">Search for players →</button>
            </div>
          ) : friends.map((f) => {
            const partnerId = getPartnerId(f);
            const label = getPartnerLabel(f);
            return (
              <div key={f.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{label?.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{label}</p>
                    <p className="text-gray-500 text-xs">Gamer</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/gamer/messages?dm=${partnerId}`} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white transition">
                    <MessageSquare className="w-3.5 h-3.5" /> DM
                  </Link>
                  <button onClick={() => removeMutation.mutate(f.id)} disabled={removeMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requests Tab */}
      {tab === 'requests' && (
        <div className="space-y-2">
          {rLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 text-red-400 animate-spin" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No pending friend requests</p>
            </div>
          ) : requests.map((req) => {
            const fromName = req.user_name || req.user_id?.slice(0, 8) || 'Player';
            return (
              <div key={req.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-700 to-orange-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{fromName?.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{fromName}</p>
                    <p className="text-gray-500 text-xs">Wants to be friends</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptMutation.mutate(req.id)} disabled={acceptMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition disabled:opacity-50">
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button onClick={() => removeMutation.mutate(req.id)} disabled={removeMutation.isPending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-gray-400 hover:bg-zinc-700 transition">
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </GamerLayout>
  );
}
