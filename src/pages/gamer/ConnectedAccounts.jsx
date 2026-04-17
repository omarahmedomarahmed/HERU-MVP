import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const REGIONS = [
  { value: 'euw1', label: 'EUW (Europe West)' },
  { value: 'eun1', label: 'EUNE (Europe Nordic & East)' },
  { value: 'me1', label: 'ME1 (Middle East)' },
  { value: 'na1', label: 'NA (North America)' },
  { value: 'kr', label: 'KR (Korea)' },
  { value: 'br1', label: 'BR (Brazil)' },
  { value: 'la1', label: 'LAN (Latin America North)' },
  { value: 'la2', label: 'LAS (Latin America South)' },
  { value: 'jp1', label: 'JP (Japan)' },
  { value: 'oc1', label: 'OCE (Oceania)' },
  { value: 'tr1', label: 'TR (Turkey)' },
  { value: 'ru', label: 'RU (Russia)' },
];

const RANK_COLORS = {
  IRON: '#574a4a', BRONZE: '#a07042', SILVER: '#8e9db5',
  GOLD: '#f0b429', PLATINUM: '#00c9b5', EMERALD: '#00c853',
  DIAMOND: '#5b8fdb', MASTER: '#9d4fc7', GRANDMASTER: '#e84040',
  CHALLENGER: '#f4c842',
};

function RankBadge({ tier, division }) {
  if (!tier) return <span className="text-gray-400 text-sm">Unranked</span>;
  return (
    <span className="font-bold text-sm" style={{ color: RANK_COLORS[tier] || '#fff' }}>
      {tier} {division || ''}
    </span>
  );
}

function RiotAccountCard({ account, onSync, onRemove, onTogglePublic }) {
  const [syncing, setSyncing] = useState(false);
  const gameLabel = account.game_key === 'lol' ? 'League of Legends' : 'Valorant';
  const iconUrl = account.game_key === 'lol'
    ? `https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${account.profile_icon_id || 1}.png`
    : null;

  async function handleSync() {
    setSyncing(true);
    await onSync(account.id);
    setSyncing(false);
  }

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-start gap-4">
      {iconUrl ? (
        <img src={iconUrl} alt="icon" className="w-12 h-12 rounded-full border border-gray-600" onError={e => e.target.style.display = 'none'} />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold text-lg">
          {account.game_key === 'lol' ? 'L' : 'V'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white">{account.game_name}#{account.tag_line}</span>
          {account.is_primary && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Primary</span>}
          {!account.is_public && <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded-full">Private</span>}
        </div>
        <div className="text-sm text-gray-400">{gameLabel} • {account.region?.toUpperCase()}</div>
        {account.game_key === 'lol' && (
          <div className="mt-1 flex items-center gap-3 text-sm flex-wrap">
            <RankBadge tier={account.rank_tier} division={account.rank_division} />
            {account.rank_tier && <span className="text-gray-400">{account.rank_lp} LP</span>}
            {(account.wins || account.losses) ? (
              <span className="text-gray-400">{account.wins}W {account.losses}L ({account.wins + account.losses > 0 ? Math.round(account.wins / (account.wins + account.losses) * 100) : 0}% WR)</span>
            ) : null}
            {account.summoner_level && <span className="text-gray-500">Level {account.summoner_level}</span>}
          </div>
        )}
        {account.game_key === 'valorant' && (
          <div className="mt-1 text-xs text-gray-500">Full Valorant stats require Production API access</div>
        )}
        {account.last_synced_at && (
          <div className="text-xs text-gray-600 mt-1">Synced {new Date(account.last_synced_at).toLocaleDateString()}</div>
        )}
      </div>
      <div className="flex flex-col gap-1 items-end">
        <button onClick={handleSync} disabled={syncing} className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 px-2 py-1 rounded hover:bg-blue-500/10 transition">
          {syncing ? '⟳' : '↻ Sync'}
        </button>
        <button onClick={() => onTogglePublic(account.id, !account.is_public)} className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-700 transition">
          {account.is_public ? '👁 Public' : '🔒 Private'}
        </button>
        <button onClick={() => onRemove(account.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition">
          Remove
        </button>
      </div>
    </div>
  );
}

function LinkRiotModal({ game, onClose, onLink }) {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('euw1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!gameName.trim() || !tagLine.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onLink({ gameName: gameName.trim(), tagLine: tagLine.trim(), region, game });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-1">Link {game === 'lol' ? 'League of Legends' : 'Valorant'} Account</h3>
        <p className="text-sm text-gray-400 mb-4">Enter your Riot ID (the same one you see in-game)</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Game Name</label>
              <input value={gameName} onChange={e => setGameName(e.target.value)} placeholder="Faker" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500" required />
            </div>
            <div className="w-28">
              <label className="block text-xs text-gray-400 mb-1">Tag</label>
              <div className="flex items-center bg-gray-800 border border-gray-600 rounded-lg">
                <span className="px-2 text-gray-400 text-sm">#</span>
                <input value={tagLine} onChange={e => setTagLine(e.target.value)} placeholder="KR1" className="flex-1 bg-transparent px-1 py-2 text-white text-sm focus:outline-none w-full" required />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500">
              {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-gray-300 rounded-lg py-2 text-sm hover:bg-gray-800 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-50 transition">
              {loading ? 'Linking...' : 'Link Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ConnectedAccounts() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (searchParams.get('discord') === 'connected') showToast('✅ Discord connected!');
    if (searchParams.get('error')) showToast(`❌ ${searchParams.get('error').replace(/_/g, ' ')}`, true);
    loadStatus();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  async function loadStatus() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/connect/status', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function connectDiscord() {
    window.location.href = `/api/connect/discord/auth`;
  }

  async function disconnectDiscord() {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch('/api/connect/discord', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    showToast('Discord disconnected');
    loadStatus();
  }

  async function linkRiot({ gameName, tagLine, region, game }) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/connect/riot/link', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameName, tagLine, region, game }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast(`✅ ${game === 'lol' ? 'LoL' : 'Valorant'} account linked!`);
    loadStatus();
  }

  async function syncRiot(accountId) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/connect/riot/${accountId}/sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    showToast('Stats synced!');
    loadStatus();
  }

  async function removeRiot(accountId) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/connect/riot/${accountId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    showToast('Account removed');
    loadStatus();
  }

  async function togglePublic(accountId, isPublic) {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/connect/riot/${accountId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: isPublic }),
    });
    loadStatus();
  }

  const discordAccount = status?.discord?.find(a => a.platform === 'discord' && a.is_active);
  const lolAccounts = status?.riot?.filter(a => a.game_key === 'lol') || [];
  const valAccounts = status?.riot?.filter(a => a.game_key === 'valorant') || [];
  const isComplete = status?.is_complete;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.startsWith('❌') ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Connected Accounts</h1>
          <p className="text-gray-400 mt-1">Link your Discord and Riot accounts to complete your HERU profile</p>
        </div>

        {!loading && (
          <div className={`rounded-xl p-4 mb-6 border ${isComplete ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isComplete ? '✅' : '⚠️'}</span>
              <div>
                <div className={`font-semibold ${isComplete ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isComplete ? 'Profile Complete' : 'Profile Incomplete'}
                </div>
                <div className="text-sm text-gray-400">
                  {isComplete ? 'Your HERU gamer profile is fully verified.' : 'Link Discord + at least one Riot account to complete your profile.'}
                </div>
              </div>
            </div>
            {!isComplete && (
              <div className="flex gap-4 mt-3 text-sm">
                <span className={discordAccount ? 'text-green-400' : 'text-gray-500'}>
                  {discordAccount ? '✓' : '○'} Discord
                </span>
                <span className={status?.riot?.length > 0 ? 'text-green-400' : 'text-gray-500'}>
                  {status?.riot?.length > 0 ? '✓' : '○'} Riot Account
                </span>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-xs">D</span>
                Discord
              </h2>
              {discordAccount ? (
                <div className="bg-gray-800/60 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-4">
                  {discordAccount.platform_avatar && (
                    <img src={discordAccount.platform_avatar} alt="avatar" className="w-12 h-12 rounded-full" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-white">{discordAccount.platform_username}</div>
                    <div className="text-sm text-green-400">Connected ✓</div>
                    <div className="text-xs text-gray-500">Bot available on any server with HERU BOT</div>
                  </div>
                  <button onClick={disconnectDiscord} className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition border border-red-500/20">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={connectDiscord} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-4 font-semibold transition flex items-center justify-center gap-3">
                  <span className="text-xl">Discord</span>
                  Connect Discord Account
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-700 rounded flex items-center justify-center text-xs font-bold">L</span>
                  League of Legends
                </h2>
                <button onClick={() => setLinking('lol')} className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                  + Link Account
                </button>
              </div>
              {lolAccounts.length === 0 ? (
                <div className="bg-gray-800/40 border border-gray-700 border-dashed rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">⚔️</div>
                  <div className="text-gray-400 text-sm">No LoL accounts linked yet</div>
                  <button onClick={() => setLinking('lol')} className="mt-3 text-sm text-red-400 hover:text-red-300">
                    Link your first LoL account →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lolAccounts.map(acc => (
                    <RiotAccountCard key={acc.id} account={acc} onSync={syncRiot} onRemove={removeRiot} onTogglePublic={togglePublic} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-700 rounded flex items-center justify-center text-xs font-bold">V</span>
                  Valorant
                </h2>
                <button onClick={() => setLinking('valorant')} className="text-sm text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition">
                  + Link Account
                </button>
              </div>
              {valAccounts.length === 0 ? (
                <div className="bg-gray-800/40 border border-gray-700 border-dashed rounded-xl p-6 text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-gray-400 text-sm">No Valorant accounts linked yet</div>
                  <button onClick={() => setLinking('valorant')} className="mt-3 text-sm text-red-400 hover:text-red-300">
                    Link your first Valorant account →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {valAccounts.map(acc => (
                    <RiotAccountCard key={acc.id} account={acc} onSync={syncRiot} onRemove={removeRiot} onTogglePublic={togglePublic} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {linking && (
        <LinkRiotModal game={linking} onClose={() => setLinking(null)} onLink={linkRiot} />
      )}
    </div>
  );
}
