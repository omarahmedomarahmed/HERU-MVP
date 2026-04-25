import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import GamerLayout from '@/components/layouts/GamerLayout.jsx';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { GamerProfile as GamerProfileAPI, Order, Team, Achievement, Connect, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'
import PhoneInput from '@/components/ui/PhoneInput'
import UrlInput from '@/components/ui/UrlInput'
import { useToast } from '@/components/ui/use-toast'

import {
  User, Edit2, Save, X, Gamepad2, Users, Star,
  Package, Plus, Trash2, LogOut, Briefcase, Trophy,
  Swords, TrendingUp, Crown, Shield, Medal, Award,
  Target, Lock, ShoppingBag, DollarSign, CreditCard, Bell, ChevronRight,
  Link2, RefreshCw, Eye, EyeOff, CheckCircle2, AlertCircle, MessageSquare,
  ChevronDown, ChevronUp, Zap, ExternalLink
} from 'lucide-react';

// Achievement icon mapping
const ACHIEVEMENT_ICONS = {
  wins: Trophy,
  tournaments_played: Swords,
  tournaments_won: Crown,
  teams_created: Shield,
  teams_joined: Users,
};

// Achievement rarity colors
const RARITY_COLORS = {
  common: 'from-zinc-500/20 to-zinc-700/20 border-zinc-600/30',
  uncommon: 'from-green-500/20 to-green-700/20 border-green-600/30',
  rare: 'from-red-500/20 to-red-700/20 border-red-600/30',
  epic: 'from-red-500/20 to-red-700/20 border-red-600/30',
  legendary: 'from-yellow-500/20 to-red-500/20 border-yellow-500/30',
};

const RARITY_GLOW = {
  common: '',
  uncommon: 'text-green-400',
  rare: 'text-red-400',
  epic: 'text-red-400',
  legendary: 'text-yellow-400',
};

const RIOT_RANK_TIER_COLORS = {
  IRON: 'text-zinc-400', BRONZE: 'text-amber-700', SILVER: 'text-slate-300',
  GOLD: 'text-yellow-400', PLATINUM: 'text-teal-300', EMERALD: 'text-emerald-400',
  DIAMOND: 'text-blue-300', MASTER: 'text-purple-400', GRANDMASTER: 'text-red-400', CHALLENGER: 'text-cyan-300',
};
const RIOT_RANK_TIER_BG = {
  IRON: 'bg-zinc-500/20', BRONZE: 'bg-amber-700/20', SILVER: 'bg-slate-400/20',
  GOLD: 'bg-yellow-400/20', PLATINUM: 'bg-teal-300/20', EMERALD: 'bg-emerald-400/20',
  DIAMOND: 'bg-blue-300/20', MASTER: 'bg-purple-400/20', GRANDMASTER: 'bg-red-400/20', CHALLENGER: 'bg-cyan-300/20',
};

const RANK_TIER_COLORS = {
  IRON: 'text-zinc-400', BRONZE: 'text-amber-600', SILVER: 'text-slate-300',
  GOLD: 'text-yellow-400', PLATINUM: 'text-teal-300', EMERALD: 'text-emerald-400',
  DIAMOND: 'text-blue-300', MASTER: 'text-purple-400', GRANDMASTER: 'text-red-400', CHALLENGER: 'text-cyan-300',
};

function MatchHistoryRow({ match, gameKey }) {
  const win = match.win || match.result === 'Win';
  const kills = match.kills ?? match.k ?? '?';
  const deaths = match.deaths ?? match.d ?? '?';
  const assists = match.assists ?? match.a ?? '?';
  const champion = match.champion || match.agent || match.character || '';
  const duration = match.game_duration
    ? `${Math.floor(match.game_duration / 60)}m ${match.game_duration % 60}s`
    : '';
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-xs ${win ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <span className={`font-bold w-8 ${win ? 'text-emerald-400' : 'text-red-400'}`}>{win ? 'WIN' : 'LOSS'}</span>
      {champion && <span className="text-gray-300 font-medium truncate max-w-[80px]">{champion}</span>}
      <span className="text-gray-400 font-mono">{kills}/{deaths}/{assists}</span>
      {duration && <span className="text-gray-600 ml-auto">{duration}</span>}
    </div>
  );
}

const TIER_HEX = { IRON:'#9ca3af',BRONZE:'#b45309',SILVER:'#94a3b8',GOLD:'#eab308',PLATINUM:'#14b8a6',EMERALD:'#10b981',DIAMOND:'#60a5fa',MASTER:'#a855f7',GRANDMASTER:'#ef4444',CHALLENGER:'#06b6d4' };

function RiotAccountsPanel({ accounts, onSync, onTogglePublic }) {
  const [expanded, setExpanded] = useState(accounts[0]?.id || null);
  const [syncing, setSyncing] = useState(null);
  const navigate = useNavigate();

  if (accounts.length === 0) {
    return (
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-gradient-to-br from-zinc-900 via-zinc-900 to-red-950/20 p-10 flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600/20 to-zinc-800 border border-red-500/30 flex items-center justify-center">
            <Gamepad2 className="w-9 h-9 text-red-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white mb-1">Link Your Gaming Account</h3>
            <p className="text-gray-400 text-sm max-w-xs">Connect your Riot account to display your rank, champions, and full match history here.</p>
          </div>
          <button onClick={() => navigate('/gamer/profile/connected-accounts')}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-500/20">
            <Link2 className="w-4 h-4" /> Link Riot Account
          </button>
        </div>
      </div>
    );
  }

  const acc = accounts.find(a => a.id === expanded) || accounts[0];

  return (
    <div className="mt-6 pt-6 border-t border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-red-500" /> Gaming Accounts
        </h3>
        <button onClick={() => navigate('/gamer/profile/connected-accounts')}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
          <Link2 className="w-3 h-3" /> + Add Account
        </button>
      </div>

      {/* Account selector tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {accounts.map(a => {
          const tier = (a.rank_tier || '').toUpperCase();
          const tierHex = TIER_HEX[tier] || '#6b7280';
          const isLoL = a.game_key === 'lol';
          const isActive = expanded === a.id;
          return (
            <button key={a.id} onClick={() => setExpanded(a.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${isActive ? 'border-red-500/50 bg-red-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}>
              {isLoL && a.profile_icon_id ? (
                <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${a.profile_icon_id}.png`} alt="" className="w-7 h-7 rounded-full" onError={e => e.target.style.display='none'} />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-black text-gray-300">{isLoL ? 'L' : 'V'}</div>
              )}
              <div className="text-left">
                <p className="text-white font-mono text-xs font-bold leading-none">{a.game_name}#{a.tag_line}</p>
                {tier && <p className="text-xs font-bold leading-none mt-0.5" style={{ color: tierHex }}>{tier}</p>}
              </div>
              {!a.is_public && <EyeOff className="w-3 h-3 text-gray-600" />}
            </button>
          );
        })}
      </div>

      {/* Active account card */}
      {acc && (
        <div className="rounded-2xl border border-zinc-700/50 overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/50">
          {/* Card hero */}
          <div className="relative p-5 pb-4" style={{ background: `linear-gradient(135deg, ${TIER_HEX[(acc.rank_tier||'').toUpperCase()] || '#1f1f1f'}18 0%, transparent 60%)` }}>
            <div className="flex items-start gap-4">
              {acc.game_key === 'lol' && acc.profile_icon_id ? (
                <div className="relative">
                  <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${acc.profile_icon_id}.png`} alt=""
                    className="w-20 h-20 rounded-2xl border-2 border-zinc-600 shadow-xl" onError={e => e.target.style.display='none'} />
                  {acc.summoner_level && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-zinc-800 border border-zinc-600 text-gray-300 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">Lv {acc.summoner_level}</span>}
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-900/40 to-zinc-800 border border-zinc-600 flex items-center justify-center">
                  <span className="text-2xl font-black text-red-400">{acc.game_key === 'lol' ? 'LoL' : 'VAL'}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xl font-black text-white font-mono">{acc.game_name}<span className="text-gray-500 text-base">#{acc.tag_line}</span></h4>
                    <p className="text-gray-500 text-xs mt-0.5">{acc.game_key === 'lol' ? 'League of Legends' : 'Valorant'} · {acc.region?.toUpperCase()}</p>
                    {acc.rank_tier && (
                      <p className="font-black text-lg mt-1" style={{ color: TIER_HEX[acc.rank_tier.toUpperCase()] || '#fff' }}>
                        {acc.rank_tier} {acc.rank_division || ''} {acc.rank_lp != null ? <span className="text-gray-400 font-normal text-sm">· {acc.rank_lp} LP</span> : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setSyncing(acc.id); onSync(acc.id).finally(() => setSyncing(null)); }} disabled={syncing === acc.id}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-blue-400 hover:text-blue-300 transition" title="Sync">
                      <RefreshCw className={`w-3.5 h-3.5 ${syncing === acc.id ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => onTogglePublic(acc.id, !acc.is_public)}
                      className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-gray-400 hover:text-gray-300 transition" title={acc.is_public ? 'Make private' : 'Make public'}>
                      {acc.is_public ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {/* W/L row */}
                {(acc.wins || acc.losses) ? (
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-emerald-400 font-bold">{acc.wins || 0}W</span>
                    <span className="text-red-400 font-bold">{acc.losses || 0}L</span>
                    {(acc.wins||0)+(acc.losses||0) > 0 && (
                      <span className={`font-bold ${Math.round((acc.wins||0)/((acc.wins||0)+(acc.losses||0))*100)>=50?'text-emerald-400':'text-red-400'}`}>
                        {Math.round((acc.wins||0)/((acc.wins||0)+(acc.losses||0))*100)}% WR
                      </span>
                    )}
                    {acc.hot_streak && <span className="text-orange-400 text-xs font-bold flex items-center gap-0.5">🔥 Hot Streak</span>}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Champion masteries */}
          {Array.isArray(acc.champion_masteries) && acc.champion_masteries.length > 0 && (
            <div className="px-5 pb-4 border-t border-zinc-800/50 pt-4">
              <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> Top Champions</p>
              <div className="flex gap-3 flex-wrap">
                {acc.champion_masteries.slice(0, 7).map((m, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${m.champion_name||m.name}.png`}
                        alt={m.champion_name||m.name} className="w-12 h-12 rounded-xl border border-zinc-700 shadow-md"
                        onError={e => e.target.style.display='none'} />
                      {m.champion_level && <span className="absolute -bottom-1 -right-1 text-[10px] bg-yellow-500 text-black font-black px-1 rounded-full">M{m.champion_level}</span>}
                    </div>
                    <span className="text-xs text-gray-400 text-center max-w-[48px] truncate">{m.champion_name||m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match history */}
          <div className="px-5 pb-5 border-t border-zinc-800/50 pt-4">
            <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-1.5"><Swords className="w-3.5 h-3.5 text-red-400" /> Recent Matches</p>
            {Array.isArray(acc.match_history_cache) && acc.match_history_cache.length > 0 ? (
              <div className="space-y-1.5">
                {acc.match_history_cache.slice(0, 8).map((m, i) => {
                  const win = m.win || m.result === 'Win';
                  const k=m.kills??m.k??'?'; const d=m.deaths??m.d??'?'; const a2=m.assists??m.a??'?';
                  const champ = m.champion || m.agent || '';
                  const dur = m.game_duration ? `${Math.floor(m.game_duration/60)}m` : '';
                  return (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm ${win?'border-emerald-500/20 bg-emerald-500/5':'border-red-500/20 bg-red-500/5'}`}>
                      <span className={`font-black text-xs w-8 ${win?'text-emerald-400':'text-red-400'}`}>{win?'WIN':'LOSS'}</span>
                      {champ && <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champ}.png`} alt={champ}
                        className="w-8 h-8 rounded-lg border border-zinc-700" onError={e => e.target.style.display='none'} />}
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium text-sm">{champ||'Unknown'}</span>
                        {m.queue_type && <span className="text-gray-600 text-xs ml-2">{m.queue_type}</span>}
                      </div>
                      <span className="text-gray-400 font-mono text-xs">{k}/{d}/{a2}</span>
                      {dur && <span className="text-gray-600 text-xs hidden sm:inline">{dur}</span>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm">No match history yet</p>
                <button onClick={() => { setSyncing(acc.id); onSync(acc.id).finally(()=>setSyncing(null)); }}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mx-auto">
                  <RefreshCw className="w-3 h-3" /> Sync to load matches
                </button>
              </div>
            )}
          </div>

          {acc.last_synced_at && (
            <div className="px-5 pb-3 text-xs text-gray-700 text-right">Synced {new Date(acc.last_synced_at).toLocaleDateString()}</div>
          )}
        </div>
      )}
    </div>
  );
}

function StatsTab({ riotAccounts, onRefetch }) {
  const [selectedAccId, setSelectedAccId] = useState(riotAccounts[0]?.id || null);
  const acc = riotAccounts.find(a => a.id === selectedAccId) || riotAccounts[0];
  const [expandedMatch, setExpandedMatch] = useState(null);

  if (!riotAccounts.length) {
    return (
      <div className="text-center py-16">
        <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
        <p className="text-gray-400 font-medium mb-2">No gaming accounts linked yet</p>
        <p className="text-gray-500 text-sm">Link a Riot account in the Connect tab to see your stats here.</p>
      </div>
    );
  }

  const matches = Array.isArray(acc?.match_history_cache) ? acc.match_history_cache : [];
  const wins = acc?.wins || 0;
  const losses = acc?.losses || 0;
  const wr = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null;

  return (
    <div className="space-y-4">
      {/* Account selector */}
      {riotAccounts.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {riotAccounts.map(a => (
            <button key={a.id}
              onClick={() => { setSelectedAccId(a.id); setExpandedMatch(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${selectedAccId === a.id ? 'border-red-500 bg-red-500/10 text-white' : 'border-zinc-700 bg-zinc-800/50 text-gray-400 hover:border-zinc-600'}`}>
              {a.game_key === 'lol' && a.profile_icon_id && (
                <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${a.profile_icon_id}.png`} alt="" className="w-6 h-6 rounded-full" onError={e => e.target.style.display='none'} />
              )}
              <span className="font-mono">{a.game_name}#{a.tag_line}</span>
              <span className="text-xs opacity-60">{a.game_key === 'lol' ? 'LoL' : 'VAL'}</span>
            </button>
          ))}
        </div>
      )}

      {acc && (
        <FloatingPanel className="p-5">
          {/* Account header */}
          <div className="flex items-center gap-4 mb-5">
            {acc.game_key === 'lol' && acc.profile_icon_id && (
              <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${acc.profile_icon_id}.png`} alt="" className="w-16 h-16 rounded-full border-2 border-zinc-600" onError={e => e.target.style.display='none'} />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-black text-white font-mono">{acc.game_name}<span className="text-gray-500">#{acc.tag_line}</span></h3>
              <p className="text-gray-500 text-sm">{acc.game_key === 'lol' ? 'League of Legends' : 'Valorant'} · {acc.region?.toUpperCase()} · Level {acc.summoner_level}</p>
              {acc.rank_tier && (
                <p className="text-sm font-bold mt-1" style={{ color: { IRON:'#9ca3af',BRONZE:'#b45309',SILVER:'#cbd5e1',GOLD:'#facc15',PLATINUM:'#2dd4bf',EMERALD:'#34d399',DIAMOND:'#93c5fd',MASTER:'#c084fc',GRANDMASTER:'#f87171',CHALLENGER:'#67e8f9' }[acc.rank_tier] || '#fff' }}>
                  {acc.rank_tier} {acc.rank_division || ''} {acc.rank_lp != null ? `· ${acc.rank_lp} LP` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Wins', value: wins, color: 'text-emerald-400' },
              { label: 'Losses', value: losses, color: 'text-red-400' },
              { label: 'Win Rate', value: wr != null ? `${wr}%` : '—', color: wr >= 50 ? 'text-emerald-400' : 'text-red-400' },
              { label: 'Level', value: acc.summoner_level || '—', color: 'text-white' },
            ].map(s => (
              <div key={s.label} className="text-center p-3 bg-zinc-800/50 rounded-xl">
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Champion masteries */}
          {Array.isArray(acc.champion_masteries) && acc.champion_masteries.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-500" /> Top Champions</p>
              <div className="flex gap-3 flex-wrap">
                {acc.champion_masteries.slice(0, 7).map((m, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div className="relative">
                      <img
                        src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${m.champion_name || m.name}.png`}
                        alt={m.champion_name || m.name}
                        className="w-14 h-14 rounded-xl border border-zinc-700"
                        onError={e => { e.target.src = 'https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/Aatrox.png'; }}
                      />
                      {m.champion_level && (
                        <span className="absolute -bottom-1 -right-1 text-xs bg-yellow-500 text-black font-black px-1 rounded-full">M{m.champion_level}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 text-center max-w-[56px] truncate">{m.champion_name || m.name}</span>
                    {m.champion_points && <span className="text-xs text-yellow-600">{(m.champion_points / 1000).toFixed(0)}k pts</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Match history */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold mb-3 flex items-center gap-1.5"><Swords className="w-3.5 h-3.5 text-red-400" /> Match History ({matches.length})</p>
            {matches.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-6">No matches cached. Click Sync on the account above.</p>
            ) : (
              <div className="space-y-2">
                {matches.map((m, i) => {
                  const win = m.win || m.result === 'Win';
                  const k = m.kills ?? m.k ?? '?'; const d = m.deaths ?? m.d ?? '?'; const a = m.assists ?? m.a ?? '?';
                  const champion = m.champion || m.agent || m.character || '';
                  const duration = m.game_duration ? `${Math.floor(m.game_duration/60)}m${m.game_duration%60}s` : '';
                  const isOpen = expandedMatch === i;
                  return (
                    <div key={i} className={`rounded-xl border overflow-hidden ${win ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                      <button className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${win ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'bg-red-500/5 hover:bg-red-500/10'}`}
                        onClick={() => setExpandedMatch(isOpen ? null : i)}>
                        <span className={`font-black w-10 text-xs ${win ? 'text-emerald-400' : 'text-red-400'}`}>{win ? 'WIN' : 'LOSS'}</span>
                        {champion && (
                          <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/champion/${champion}.png`} alt={champion}
                            className="w-8 h-8 rounded-lg border border-zinc-700" onError={e => e.target.style.display='none'} />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-white font-medium">{champion || 'Unknown'}</span>
                          <span className="text-gray-500 mx-2 font-mono text-xs">{k}/{d}/{a}</span>
                          {m.queue_type && <span className="text-xs text-gray-600">{m.queue_type}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {duration && <span>{duration}</span>}
                          {m.date && <span className="hidden sm:inline">{new Date(m.date).toLocaleDateString()}</span>}
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-2 border-t border-zinc-800/50 bg-zinc-900/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {[
                            { label: 'KDA', value: m.kda || `${k}/${d}/${a}` },
                            { label: 'CS', value: m.cs ?? m.creep_score ?? '—' },
                            { label: 'Damage', value: m.damage_dealt ? `${Math.round(m.damage_dealt/1000)}k` : '—' },
                            { label: 'Gold', value: m.gold_earned ? `${Math.round(m.gold_earned/1000)}k` : '—' },
                            { label: 'Vision', value: m.vision_score ?? '—' },
                            { label: 'Mode', value: m.queue_type || m.game_mode || '—' },
                            { label: 'Duration', value: duration || '—' },
                            { label: 'Date', value: m.date ? new Date(m.date).toLocaleDateString() : '—' },
                          ].map(s => (
                            <div key={s.label} className="text-center p-2 bg-zinc-800/50 rounded-lg">
                              <p className="text-white font-bold">{s.value}</p>
                              <p className="text-gray-600 uppercase">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </FloatingPanel>
      )}
    </div>
  );
}

export default function GamerProfile() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'games';
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [addGameModal, setAddGameModal] = useState(false);
  const [orderChatModal, setOrderChatModal] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [newGame, setNewGame] = useState({ game_name: '', game_id: '', rank: '' });
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState('');
  const [slugSuccess, setSlugSuccess] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [becomeOrgModal, setBecomeOrgModal] = useState(false);
  const [orgForm, setOrgForm] = useState({ brand_name: '', full_name: '', contact_number: '', website: '', facebook: '', instagram: '' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      // /auth/me returns { user: { id, email, ... }, gamer_profile: {...} }
      const u = userData?.user || userData;
      setUser({
        id: u.id,
        email: u.email,
        full_name: u.full_name || u.email?.split('@')[0] || '',
        role: u.role,
      });
    } catch (e) {
      navigate('/auth/gamer/login');
    }
  };

  const { data: profile, isLoading } = useQuery({
    queryKey: ['gamer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await GamerProfileAPI.list({ user_id: user.id });
      if (profiles.length === 0) {
        const newProfile = await GamerProfileAPI.create({
          user_id: user.id,
          username: user.full_name || user.email?.split('@')[0] || 'Gamer',
          games: [],
          team_ids: [],
          purchased_items: [],
          notifications: [],
        });
        return newProfile;
      }
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['gamer-stats', user?.id],
    queryFn: () => GamerProfileAPI.stats(user.id),
    enabled: !!user?.id,
  });

  // Fetch earned achievements
  const { data: earnedAchievements = [] } = useQuery({
    queryKey: ['gamer-achievements', user?.id],
    queryFn: () => GamerProfileAPI.achievements(user.id),
    enabled: !!user?.id,
  });

  // Fetch all achievement definitions (to show locked ones)
  const { data: allAchievements = [] } = useQuery({
    queryKey: ['achievements-all'],
    queryFn: () => Achievement.list(),
  });

  // Fetch own Riot accounts with full data (match history, masteries)
  const { data: ownRiotAccounts = [], refetch: refetchRiot } = useQuery({
    queryKey: ['riot-accounts-full', user?.id],
    queryFn: () => Connect.riotAccounts(),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Fetch connect status for Discord display on top card
  const { data: connectStatusTop } = useQuery({
    queryKey: ['connect-status-top', user?.id],
    queryFn: () => Connect.status(),
    enabled: !!user?.id,
    staleTime: 60_000,
  });
  const discordAccount = (connectStatusTop?.discord || []).find(a => a.platform === 'discord' && a.is_active);

  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (profile) {
      setEditForm({
        username: profile.username || '',
        bio: profile.bio || '',
        avatar: profile.avatar || '',
        cover_image: profile.cover_image || '',
      });
      setSlugInput(profile.username_slug || '');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => GamerProfileAPI.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setEditing(false);
    }
  });

  const addGameMutation = useMutation({
    mutationFn: async (game) => {
      const games = [...(profile.games || []), game];
      return GamerProfileAPI.updateMe({ games });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setAddGameModal(false);
      setNewGame({ game_name: '', game_id: '', rank: '' });
    }
  });

  const removeGameMutation = useMutation({
    mutationFn: async (index) => {
      const games = [...(profile.games || [])];
      games.splice(index, 1);
      return GamerProfileAPI.updateMe({ games });
    },
    onSuccess: () => queryClient.invalidateQueries(['gamer-profile', user?.id])
  });

  const updateSlugMutation = useMutation({
    mutationFn: async (slug) => {
      const cleaned = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (cleaned.length < 3) throw new Error('Username must be at least 3 characters');
      // Check for duplicates via API
      const existing = await GamerProfileAPI.list({ username_slug: cleaned });
      if (existing.length > 0 && existing[0].user_id !== user?.id) {
        throw new Error('This username is already taken');
      }
      return GamerProfileAPI.updateMe({ username_slug: cleaned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      setSlugError('');
      setSlugSuccess('Profile link updated!');
      setTimeout(() => setSlugSuccess(''), 3000);
    },
    onError: (err) => {
      setSlugError(err.message);
      setSlugSuccess('');
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      await GamerProfileAPI.updateMe({ avatar: file_url });
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      await GamerProfileAPI.updateMe({ cover_image: file_url });
      queryClient.invalidateQueries(['gamer-profile', user?.id]);
      toast({ title: 'Cover image updated!' });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setCoverUploading(false);
    }
  };

  const becomeOrganizerMutation = useMutation({
    mutationFn: async (data) => {
      return ApprovalRequest.create({
        approval_type: 'organizer_profile',
        requester_name: profile?.username || user?.full_name,
        requester_email: user?.email,
        reference_id: user.id,
        reference_name: data.brand_name,
        details: data,
      });
    },
    onSuccess: () => {
      // Keep modal open to show success message, then close after delay
      setOrgForm({ brand_name: '', full_name: '', contact_number: '', website: '', facebook: '', instagram: '' });
      setTimeout(() => setBecomeOrgModal(false), 2000);
    },
    onError: (err) => {
      toast({ title: 'Submission failed', description: err.message || 'Failed to submit. Please try again.', variant: 'destructive' });
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['my-teams', profile?.team_ids],
    queryFn: async () => {
      if (!profile?.team_ids?.length) return [];
      const allTeams = await Team.list();
      return allTeams.filter(t => profile.team_ids.includes(t.id));
    },
    enabled: !!profile?.team_ids?.length,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return Order.list({ gamer_id: user.id }, '-created_date');
    },
    enabled: !!user?.id,
  });

  const sendOrderMessageMutation = useMutation({
    mutationFn: async ({ orderId, message }) => {
      const order = orders.find(o => o.id === orderId);
      const msgObj = {
        sender_id: user.id,
        sender_name: profile?.username || user.full_name,
        sender_role: 'gamer',
        message,
        timestamp: new Date().toISOString()
      };
      const updatedChat = [...(order.support_chat || []), msgObj];
      await Order.update(orderId, { support_chat: updatedChat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-orders', user?.id]);
      setNewMessage('');
    }
  });

  const handleLogout = async () => {
    await logout();
  };

  const cart = JSON.parse(localStorage.getItem(`cart_${user?.id}`) || '[]');

  // Build achievement grid (earned + locked)
  const earnedIds = new Set(earnedAchievements.map(ea => ea.achievement_id || ea.achievements?.id));
  const achievementGrid = allAchievements.map(ach => ({
    ...ach,
    earned: earnedIds.has(ach.id),
    earnedData: earnedAchievements.find(ea => (ea.achievement_id || ea.achievements?.id) === ach.id),
  }));

  if (isLoading) {
    return (
      <GamerLayout user={user} profile={profile} cartCount={cart.length}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      </GamerLayout>
    );
  }

  return (
    <GamerLayout user={user} profile={profile} cartCount={cart.length}>
      {/* Profile Header */}
      <FloatingPanel className="overflow-hidden mb-6" glowBorder>
        {/* Cover Image Banner */}
        <div className="relative h-28 bg-gradient-to-r from-red-900/40 via-zinc-900 to-red-900/20">
          {profile?.cover_image && (
            <img src={profile.cover_image} alt="" className="w-full h-full object-cover" />
          )}
          <label className="absolute top-2 right-2 cursor-pointer bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 transition-colors backdrop-blur-sm">
            {coverUploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Edit2 className="w-3 h-3" />}
            Cover
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
          </label>
        </div>

        <div className="relative z-10 p-6 flex flex-col md:flex-row gap-6" style={{ marginTop: '-3rem' }}>
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden ring-4 ring-zinc-900 border-2 border-zinc-700">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-red-500" />
              )}
              {/* Edit icon overlaid directly on the avatar */}
              <label className="absolute inset-0 cursor-pointer flex items-end justify-end p-1.5 opacity-0 hover:opacity-100 transition-opacity bg-black/40 rounded-2xl">
                <div className="bg-zinc-900/90 border border-zinc-600 text-white w-7 h-7 rounded-full flex items-center justify-center">
                  {avatarUploading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Edit2 className="w-3 h-3" />}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={avatarUploading} />
              </label>
            </div>

          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-4">
                <Input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Username"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Bio"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={3}
                />
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Avatar</label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors">
                      Upload
                      <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { file_url } = await uploadFile(file);
                          setEditForm({ ...editForm, avatar: file_url });
                        } catch (err) { console.error(err); }
                      }} />
                    </label>
                    <Input
                      value={editForm.avatar}
                      onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                      placeholder="or paste URL"
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <GlowButton onClick={() => updateProfileMutation.mutate(editForm)}>
                    <Save className="w-4 h-4" /> Save
                  </GlowButton>
                  <GlowButton variant="ghost" onClick={() => setEditing(false)}>
                    <X className="w-4 h-4" /> Cancel
                  </GlowButton>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-black text-white truncate">
                        {profile?.username || user?.full_name}
                      </h1>
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full uppercase">Gamer</span>
                    </div>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    {profile?.username_slug && (
                      <p className="text-gray-500 text-xs mt-1">
                        Profile: <span className="text-red-400">{window.location.origin}/gamer/profile/{profile.username_slug}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="flex gap-2">
                      <GlowButton variant="secondary" size="sm" onClick={() => setEditing(true)}>
                        <Edit2 className="w-4 h-4" /> Edit
                      </GlowButton>
                      <a
                        href="https://discord.com/oauth2/authorize?client_id=HERU_BOT_ID&scope=bot&permissions=8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-bold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Add HERU Bot to Server
                      </a>
                    </div>
                    {/* Discord badge — same style as Connect tab */}
                    {discordAccount && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                        {discordAccount.platform_avatar ? (
                          <img src={discordAccount.platform_avatar} alt="" className="w-6 h-6 rounded-full flex-shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[10px] text-indigo-400 font-semibold leading-none">Discord</p>
                          <p className="text-white text-xs font-bold truncate leading-snug">{discordAccount.platform_username}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {profile?.bio && (
                  <p className="text-gray-300 mt-3 line-clamp-3">{profile.bio}</p>
                )}

                {/* Username Slug / Profile Link Editor */}
                <div className="mt-4 p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
                  <p className="text-xs text-gray-500 mb-2 font-medium">Custom Profile Link</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">/gamer/profile/</span>
                    <input
                      value={slugInput}
                      onChange={(e) => { setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')); setSlugError(''); setSlugSuccess(''); }}
                      placeholder="yourname"
                      className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={() => updateSlugMutation.mutate(slugInput)}
                      disabled={updateSlugMutation.isPending || slugInput === profile?.username_slug}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded transition-colors"
                    >
                      {updateSlugMutation.isPending ? '...' : 'Save'}
                    </button>
                  </div>
                  {slugError && <p className="text-red-400 text-xs mt-1">{slugError}</p>}
                  {slugSuccess && <p className="text-green-400 text-xs mt-1">{slugSuccess}</p>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Riot Gaming Accounts Section */}
        {!editing && (
          <RiotAccountsPanel
            accounts={ownRiotAccounts}
            onSync={async (id) => {
              await Connect.syncRiot(id);
              refetchRiot();
            }}
            onTogglePublic={async (id, isPublic) => {
              await Connect.updateRiot(id, { is_public: isPublic });
              refetchRiot();
            }}
          />
        )}
      </FloatingPanel>

      {/* Main Tabs */}
      <Tabs defaultValue={defaultTab === 'games' ? 'teams' : defaultTab} className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="teams" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Users className="w-4 h-4 mr-1.5" /> Teams
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <TrendingUp className="w-4 h-4 mr-1.5" /> Stats
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Award className="w-4 h-4 mr-1.5" /> Badges
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Bell className="w-4 h-4 mr-1.5" /> Invites
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Package className="w-4 h-4 mr-1.5" /> Orders
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <DollarSign className="w-4 h-4 mr-1.5" /> Billing
          </TabsTrigger>
          <TabsTrigger value="connect" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
            <Link2 className="w-4 h-4 mr-1.5" /> Connect
          </TabsTrigger>
        </TabsList>

        {/* Games Tab */}
        {/* Teams Tab */}
        {/* Stats Tab */}
        <TabsContent value="stats">
          <StatsTab riotAccounts={ownRiotAccounts} onRefetch={refetchRiot} />
        </TabsContent>

        <TabsContent value="teams">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                My Teams
              </h2>
              <Link to="/gamer/teams/create">
                <GlowButton variant="secondary" size="sm">
                  <Plus className="w-4 h-4" /> Create Team
                </GlowButton>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {teams.map((team, i) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/gamer/teams/${team.id}`}>
                    <GameCard className="p-4 hover:border-red-500/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {team.logo ? (
                            <img src={team.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-7 h-7 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold truncate">{team.name}</p>
                          <p className="text-gray-500 text-sm">{team.members?.length || 0} members</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {team.games?.slice(0, 2).map((game, gi) => (
                              <span key={gi} className="text-xs bg-zinc-800 text-gray-300 px-2 py-0.5 rounded">
                                {game}
                              </span>
                            ))}
                          </div>
                        </div>
                        {team.leader_id === user?.id && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                            LEADER
                          </span>
                        )}
                      </div>
                    </GameCard>
                  </Link>
                </motion.div>
              ))}
            </div>
            {teams.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium mb-1">Not part of any team yet</p>
                <p className="text-gray-600 text-sm mb-4">Create or join a team to compete in tournaments</p>
                <div className="flex gap-3 justify-center">
                  <Link to="/gamer/teams/create">
                    <GlowButton size="sm">
                      <Plus className="w-4 h-4" /> Create Team
                    </GlowButton>
                  </Link>
                  <Link to="/teams">
                    <GlowButton variant="secondary" size="sm">
                      <Target className="w-4 h-4" /> Browse Teams
                    </GlowButton>
                  </Link>
                </div>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          {/* Riot Accounts Stats */}
          {ownRiotAccounts.length > 0 && (
            <FloatingPanel className="p-6 mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-500" />
                Riot Game Stats
              </h2>
              <div className="space-y-4">
                {ownRiotAccounts.map(acc => {
                  const tier = (acc.rank_tier || '').toUpperCase();
                  const tierColor = RIOT_RANK_TIER_COLORS[tier] || 'text-gray-400';
                  const tierBg = RIOT_RANK_TIER_BG[tier] || 'bg-gray-500/20';
                  const gameLabel = acc.game_key === 'lol' ? 'League of Legends' : acc.game_key === 'valorant' ? 'Valorant' : acc.game_key;
                  return (
                    <div key={acc.id} className="flex items-center gap-4 p-4 bg-zinc-800/40 rounded-xl border border-zinc-700/30">
                      {acc.profile_icon_id ? (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${acc.profile_icon_id}.png`}
                          alt="icon"
                          className="w-12 h-12 rounded-full border-2 border-zinc-600"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                          <Gamepad2 className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate font-mono">{acc.game_name}#{acc.tag_line}</p>
                        <p className="text-gray-500 text-xs">{gameLabel} · {acc.region?.toUpperCase()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        {tier ? (
                          <>
                            <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${tierColor} ${tierBg} mb-1`}>
                              {tier} {acc.rank_division || ''}
                            </div>
                            {acc.rank_lp != null && (
                              <p className="text-gray-400 text-xs">{acc.rank_lp} LP</p>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-600 text-xs">Unranked</span>
                        )}
                      </div>
                      {acc.summoner_level && (
                        <div className="text-center shrink-0">
                          <p className="text-white font-bold text-lg">{acc.summoner_level}</p>
                          <p className="text-gray-600 text-[10px] uppercase">Level</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </FloatingPanel>
          )}

          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Achievements
              </h2>
              <HexBadge className="bg-yellow-500/10 text-yellow-400">
                {earnedAchievements.length}/{allAchievements.length}
              </HexBadge>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${allAchievements.length > 0 ? (earnedAchievements.length / allAchievements.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {achievementGrid.map((ach, i) => {
                const IconComp = ACHIEVEMENT_ICONS[ach.criteria?.type] || Award;
                const rarity = ach.rarity || 'common';
                const colorClass = RARITY_COLORS[rarity] || RARITY_COLORS.common;
                const glowClass = RARITY_GLOW[rarity] || '';

                return (
                  <motion.div
                    key={ach.id || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className={`relative p-4 rounded-xl border text-center transition-all
                      ${ach.earned
                        ? `bg-gradient-to-br ${colorClass} hover:scale-105`
                        : 'bg-zinc-900/50 border-zinc-800 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2
                        ${ach.earned ? 'bg-zinc-900/60' : 'bg-zinc-800/60'}`}
                      >
                        {ach.earned ? (
                          <IconComp className={`w-6 h-6 ${glowClass || 'text-white'}`} />
                        ) : (
                          <Lock className="w-5 h-5 text-zinc-600" />
                        )}
                      </div>
                      <p className={`text-sm font-bold truncate ${ach.earned ? 'text-white' : 'text-zinc-600'}`}>
                        {ach.name || ach.title}
                      </p>
                      <p className={`text-xs mt-0.5 truncate ${ach.earned ? 'text-gray-400' : 'text-zinc-700'}`}>
                        {ach.description}
                      </p>
                      {ach.earned && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(ach.earnedData?.earned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {allAchievements.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400 font-medium">No achievements available yet</p>
                <p className="text-gray-600 text-sm">Achievements will appear as you play tournaments</p>
              </div>
            )}
          </FloatingPanel>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <FloatingPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-red-500" />
                My Orders
              </h2>
              <Link to="/gamer/orders">
                <GlowButton variant="ghost" size="sm">View All</GlowButton>
              </Link>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-zinc-800/50 rounded-xl cursor-pointer hover:bg-zinc-800 transition-colors border border-zinc-700/20"
                  onClick={() => setOrderChatModal(order)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium">Order #{order.id.slice(0, 8)}</p>
                    <HexBadge className={
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'processing' ? 'bg-red-500/20 text-red-400' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }>
                      {order.status}
                    </HexBadge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{order.items?.length || 0} items</span>
                    <span className="text-white font-bold">EGP {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-zinc-700 mx-auto mb-2" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link to="/gamer/marketplace" className="inline-block mt-3">
                    <GlowButton size="sm" variant="secondary">
                      <ShoppingBag className="w-4 h-4" /> Browse Store
                    </GlowButton>
                  </Link>
                </div>
              )}
            </div>
          </FloatingPanel>
        </TabsContent>

        {/* Tournament Invites Tab */}
        <TabsContent value="tournaments">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-red-500" />
              Tournament Invites
            </h2>
            <TournamentInvitesTab userId={user?.id} profile={profile} />
          </FloatingPanel>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <FloatingPanel className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <DollarSign className="w-5 h-5 text-red-500" />
              My Bills
            </h2>
            <BillingTab userId={user?.id} />
          </FloatingPanel>
        </TabsContent>

        {/* HERU Connect Tab */}
        <TabsContent value="connect">
          <ConnectTab userId={user?.id} profile={profile} queryClient={queryClient} />
        </TabsContent>
      </Tabs>

      {/* Logout */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Add Game Modal */}
      <Dialog open={addGameModal} onOpenChange={setAddGameModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Game</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game Name</label>
              <Input
                value={newGame.game_name}
                onChange={(e) => setNewGame({ ...newGame, game_name: e.target.value })}
                placeholder="e.g. Valorant, CS2, League of Legends"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Game ID / Username</label>
              <Input
                value={newGame.game_id}
                onChange={(e) => setNewGame({ ...newGame, game_id: e.target.value })}
                placeholder="Your in-game ID"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Rank</label>
              <Input
                value={newGame.rank}
                onChange={(e) => setNewGame({ ...newGame, rank: e.target.value })}
                placeholder="e.g. Diamond, Global Elite"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <GlowButton
              className="w-full"
              onClick={() => addGameMutation.mutate(newGame)}
              disabled={!newGame.game_name || !newGame.game_id}
            >
              <Plus className="w-4 h-4" /> Add Game
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Chat Modal */}
      <Dialog open={!!orderChatModal} onOpenChange={() => setOrderChatModal(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{orderChatModal?.id?.slice(0, 8)} - Support Chat</DialogTitle>
          </DialogHeader>
          {orderChatModal && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Status:</span>
                  <HexBadge>{orderChatModal.status}</HexBadge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total:</span>
                  <span className="text-white font-bold">EGP {orderChatModal.total?.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-64 overflow-y-auto mb-4 space-y-2 p-2 bg-zinc-950 rounded-lg">
                {orderChatModal.support_chat?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender_role === 'gamer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_role === 'gamer' ? 'bg-red-600' : 'bg-zinc-800'
                    }`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name}</p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
                {(!orderChatModal.support_chat || orderChatModal.support_chat.length === 0) && (
                  <p className="text-gray-500 text-center py-8">No messages yet</p>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Message staff..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendOrderMessageMutation.mutate({ orderId: orderChatModal.id, message: newMessage });
                    }
                  }}
                />
                <GlowButton onClick={() => newMessage.trim() && sendOrderMessageMutation.mutate({ orderId: orderChatModal.id, message: newMessage })}>
                  Send
                </GlowButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Become Organizer Modal */}
      <Dialog open={becomeOrgModal} onOpenChange={setBecomeOrgModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-red-400" /> Become an Organizer
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-indigo-300 font-bold text-sm">Add the HERU Bot to your Discord server</p>
              <p className="text-indigo-400/70 text-xs mt-0.5">Build and manage tournaments with single commands. Your linked Discord plays a key role in bot interactions.</p>
              <a href="https://discord.com/oauth2/authorize?client_id=HERU_BOT_ID&scope=bot&permissions=8" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors">
                <MessageSquare className="w-3 h-3" /> Add HERU Bot to Server
              </a>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Fill in your organizer details. Your request will be reviewed by staff before approval.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Brand / Organization Name *</label>
              <Input value={orgForm.brand_name} onChange={(e) => setOrgForm({ ...orgForm, brand_name: e.target.value })} placeholder="Your brand name" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name *</label>
              <Input value={orgForm.full_name} onChange={(e) => setOrgForm({ ...orgForm, full_name: e.target.value })} placeholder="Your full name" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Contact Number</label>
              <PhoneInput value={orgForm.contact_number} onChange={(v) => setOrgForm({ ...orgForm, contact_number: v })} />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Website</label>
              <UrlInput value={orgForm.website} onChange={(v) => setOrgForm({ ...orgForm, website: v })} placeholder="https://yoursite.com" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Facebook</label>
                <UrlInput value={orgForm.facebook} onChange={(v) => setOrgForm({ ...orgForm, facebook: v })} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Instagram</label>
                <UrlInput value={orgForm.instagram} onChange={(v) => setOrgForm({ ...orgForm, instagram: v })} placeholder="https://instagram.com/..." />
              </div>
            </div>
            <GlowButton
              className="w-full"
              onClick={() => becomeOrganizerMutation.mutate(orgForm)}
              disabled={!orgForm.brand_name || !orgForm.full_name || becomeOrganizerMutation.isPending}
            >
              {becomeOrganizerMutation.isPending ? 'Submitting...' : 'Submit for Approval'}
            </GlowButton>
            {becomeOrganizerMutation.isSuccess && (
              <p className="text-green-400 text-xs text-center">Request submitted! Staff will review your application.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </GamerLayout>
  );
}

// ─── Tournament Invites Sub-Component ────────────────────────────────────────
function TournamentInvitesTab({ userId, profile }) {
  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['gamer-tournament-invites', userId],
    queryFn: async () => {
      if (!userId) return [];
      // Fetch tournaments where user is in invited_teams or gamer_invites
      const res = await fetch(`/api/tournaments?invited_gamer=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  // Also show team join invites from teams
  const { data: teamInvites = [] } = useQuery({
    queryKey: ['team-invites', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/teams?invited_member=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="text-gray-400 py-8 text-center">Loading invites...</div>;

  const hasAny = tournaments.length > 0 || teamInvites.length > 0;

  return (
    <div className="space-y-6">
      {/* Tournament Invites */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" /> Tournament Invites
        </h3>
        {tournaments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-zinc-800/30 rounded-xl">
            <Trophy className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm">No tournament invites</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.game} · {t.format}</p>
                  {t.schedule && (
                    <p className="text-gray-600 text-xs mt-0.5">{new Date(t.schedule).toLocaleDateString()}</p>
                  )}
                </div>
                <Link to={`/gamer/arena/${t.id}`}>
                  <GlowButton size="sm" variant="secondary">
                    <ChevronRight className="w-4 h-4" /> View
                  </GlowButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Invites */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" /> Team Invites
        </h3>
        {teamInvites.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-zinc-800/30 rounded-xl">
            <Users className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
            <p className="text-sm">No team invites</p>
          </div>
        ) : (
          <div className="space-y-3">
            {teamInvites.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30">
                <div className="flex items-center gap-3">
                  {team.logo ? (
                    <img src={team.logo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-bold">{team.name}</p>
                    <p className="text-gray-500 text-xs">{team.games?.join(', ')}</p>
                  </div>
                </div>
                <Link to={`/gamer/teams/${team.id}`}>
                  <GlowButton size="sm" variant="secondary">
                    <ChevronRight className="w-4 h-4" /> View
                  </GlowButton>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasAny && (
        <p className="text-center text-gray-500 text-sm pt-4">
          Join teams or compete in tournaments to see invites here.
        </p>
      )}
    </div>
  );
}

// ─── RANK TIER COLORS ────────────────────────────────────────────────────────
const RANK_COLORS = {
  IRON: 'text-gray-400 bg-gray-500/20',
  BRONZE: 'text-orange-700 bg-orange-900/20',
  SILVER: 'text-gray-300 bg-gray-500/20',
  GOLD: 'text-yellow-400 bg-yellow-500/20',
  PLATINUM: 'text-cyan-300 bg-cyan-500/20',
  EMERALD: 'text-emerald-400 bg-emerald-500/20',
  DIAMOND: 'text-blue-400 bg-blue-500/20',
  MASTER: 'text-purple-400 bg-purple-500/20',
  GRANDMASTER: 'text-red-400 bg-red-500/20',
  CHALLENGER: 'text-yellow-300 bg-yellow-400/20',
};

// ─── HERU Connect Sub-Component ──────────────────────────────────────────────
function ConnectTab({ userId, profile, queryClient }) {
  const [linkModal, setLinkModal] = useState(null); // null | 'lol' | 'valorant'
  const [linkForm, setLinkForm] = useState({ gameName: '', tagLine: '', region: 'euw1' });
  const [linkError, setLinkError] = useState('');
  const [syncing, setSyncing] = useState({});
  const [discordConnecting, setDiscordConnecting] = useState(false);
  const { toast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: connectStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['connect-status', userId],
    queryFn: () => Connect.status(),
    enabled: !!userId,
    staleTime: 30000,
  });

  useEffect(() => {
    if (searchParams.get('discord') === 'connected') {
      toast({ title: 'Discord connected!', description: 'Your Discord account has been linked.' });
      refetchStatus();
      setSearchParams(prev => { prev.delete('discord'); return prev; });
    }
    if (searchParams.get('error')) {
      toast({ title: 'Connection failed', description: searchParams.get('error'), variant: 'destructive' });
      setSearchParams(prev => { prev.delete('error'); return prev; });
    }
  }, []);

  const discordAccounts = connectStatus?.discord || [];
  const riotAccounts = connectStatus?.riot || [];
  const hasDiscord = discordAccounts.some(a => a.platform === 'discord' && a.is_active);

  const linkRiotMutation = useMutation({
    mutationFn: async (data) => Connect.linkRiot(data),
    onSuccess: () => {
      setLinkModal(null);
      setLinkForm({ gameName: '', tagLine: '', region: 'euw1' });
      setLinkError('');
      refetchStatus();
      queryClient.invalidateQueries(['gamer-profile', userId]);
      toast({ title: 'Riot account linked!', description: 'Your account has been linked successfully.' });
    },
    onError: (err) => {
      setLinkError(err.message || 'Failed to link account');
    },
  });

  const removeRiotMutation = useMutation({
    mutationFn: (id) => Connect.removeRiot(id),
    onSuccess: () => { refetchStatus(); toast({ title: 'Account removed' }); },
  });

  const disconnectDiscordMutation = useMutation({
    mutationFn: () => Connect.disconnectDiscord(),
    onSuccess: () => { refetchStatus(); toast({ title: 'Discord disconnected' }); },
  });

  const handleDiscordConnect = async () => {
    setDiscordConnecting(true);
    try {
      const url = await Connect.discordAuthUrl();
      window.location.href = url;
    } catch (err) {
      toast({ title: 'Discord connect failed', description: err.message, variant: 'destructive' });
      setDiscordConnecting(false);
    }
  };

  const handleSync = async (id) => {
    setSyncing(s => ({ ...s, [id]: true }));
    try {
      await Connect.syncRiot(id);
      refetchStatus();
      toast({ title: 'Account synced!' });
    } catch (err) {
      toast({ title: 'Sync failed', description: err.message, variant: 'destructive' });
    } finally {
      setSyncing(s => ({ ...s, [id]: false }));
    }
  };

  const handleTogglePublic = async (id, is_public) => {
    try {
      await Connect.updateRiot(id, { is_public: !is_public });
      refetchStatus();
    } catch (err) {
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' });
    }
  };

  const LOL_REGIONS = [
    { value: 'euw1', label: 'EUW (Europe West)' },
    { value: 'eun1', label: 'EUNE (Europe Nordic)' },
    { value: 'me1', label: 'ME (Middle East / MENA)' },
    { value: 'na1', label: 'NA (North America)' },
    { value: 'kr', label: 'KR (Korea)' },
    { value: 'br1', label: 'BR (Brazil)' },
    { value: 'tr1', label: 'TR (Turkey)' },
  ];

  const lolAccounts = riotAccounts.filter(a => a.game_key === 'lol');
  const valAccounts = riotAccounts.filter(a => a.game_key === 'valorant');

  return (
    <div className="space-y-6">
      {/* ── Discord Section ─────────────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            Discord
          </h2>
          {hasDiscord ? (
            <span className="flex items-center gap-1.5 text-green-400 text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-gray-500 text-sm">
              <AlertCircle className="w-4 h-4" /> Not connected
            </span>
          )}
        </div>

        {hasDiscord ? (
          <div className="space-y-3">
            {discordAccounts.filter(a => a.platform === 'discord' && a.is_active).map(acc => (
              <div key={acc.id} className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                {acc.platform_avatar ? (
                  <img src={acc.platform_avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{acc.platform_username}</p>
                  {acc.last_synced_at && (
                    <p className="text-gray-500 text-xs">
                      Synced {new Date(acc.last_synced_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => disconnectDiscordMutation.mutate()}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/10 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connect your Discord account to join tournament servers automatically and receive notifications.
            </p>
            <button
              onClick={handleDiscordConnect}
              disabled={discordConnecting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              {discordConnecting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Redirecting...</>
              ) : (
                <><MessageSquare className="w-4 h-4" /> Connect Discord</>
              )}
            </button>
          </div>
        )}
      </FloatingPanel>

      {/* ── League of Legends Section ──────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="w-5 h-5 text-yellow-400" />
            League of Legends
          </h2>
          <button
            onClick={() => { setLinkModal('lol'); setLinkError(''); setLinkForm({ gameName: '', tagLine: '', region: 'euw1' }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 rounded-lg text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Link Account
          </button>
        </div>

        {lolAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Swords className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm mb-1">No LoL accounts linked</p>
            <p className="text-xs text-gray-600">Link your Riot ID to show your rank and compete in HERU tournaments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lolAccounts.map(acc => {
              const rankColor = RANK_COLORS[acc.rank_tier] || 'text-gray-400 bg-gray-500/20';
              return (
                <div key={acc.id} className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30 hover:border-yellow-500/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {acc.profile_icon_id ? (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${acc.profile_icon_id}.png`}
                          alt=""
                          className="w-12 h-12 rounded-xl border border-zinc-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-zinc-700 flex items-center justify-center">
                          <Swords className="w-6 h-6 text-yellow-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-bold truncate">{acc.game_name}#{acc.tag_line}</p>
                        <p className="text-gray-500 text-xs">{acc.region?.toUpperCase()} · Level {acc.summoner_level || '?'}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {acc.rank_tier ? (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rankColor}`}>
                              {acc.rank_tier} {acc.rank_division} {acc.rank_lp ? `· ${acc.rank_lp} LP` : ''}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">Unranked</span>
                          )}
                          {acc.wins > 0 && (
                            <span className="text-xs text-gray-500">{acc.wins}W {acc.losses}L</span>
                          )}
                          {acc.is_primary && (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">PRIMARY</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleTogglePublic(acc.id, acc.is_public)}
                        title={acc.is_public ? 'Make private' : 'Make public'}
                        className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        {acc.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleSync(acc.id)}
                        disabled={syncing[acc.id]}
                        title="Sync stats"
                        className="p-2 text-gray-500 hover:text-blue-400 rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing[acc.id] ? 'animate-spin text-blue-400' : ''}`} />
                      </button>
                      <button
                        onClick={() => removeRiotMutation.mutate(acc.id)}
                        title="Remove account"
                        className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-zinc-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </FloatingPanel>

      {/* ── Valorant Section ───────────────────────────────── */}
      <FloatingPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-red-400" />
            Valorant
          </h2>
          <button
            onClick={() => { setLinkModal('valorant'); setLinkError(''); setLinkForm({ gameName: '', tagLine: '', region: 'euw1' }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Link Account
          </button>
        </div>

        {valAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p className="text-sm mb-1">No Valorant accounts linked</p>
            <p className="text-xs text-gray-600">Link your Riot ID to compete in HERU Valorant tournaments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {valAccounts.map(acc => (
              <div key={acc.id} className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30 hover:border-red-500/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold truncate">{acc.game_name}#{acc.tag_line}</p>
                      <p className="text-gray-500 text-xs">{acc.region?.toUpperCase()}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {acc.val_rank_tier ? (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                            {acc.val_rank_tier} {acc.val_rank_rating ? `· ${acc.val_rank_rating} RR` : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600">Rank not available</span>
                        )}
                        {acc.is_primary && (
                          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold">PRIMARY</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleTogglePublic(acc.id, acc.is_public)}
                      title={acc.is_public ? 'Make private' : 'Make public'}
                      className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      {acc.is_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleSync(acc.id)}
                      disabled={syncing[acc.id]}
                      title="Sync stats"
                      className="p-2 text-gray-500 hover:text-blue-400 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing[acc.id] ? 'animate-spin text-blue-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => removeRiotMutation.mutate(acc.id)}
                      title="Remove account"
                      className="p-2 text-gray-500 hover:text-red-400 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </FloatingPanel>

      {/* ── Link Riot Account Modal ────────────────────────── */}
      <Dialog open={!!linkModal} onOpenChange={() => { setLinkModal(null); setLinkError(''); }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {linkModal === 'lol'
                ? <><Swords className="w-5 h-5 text-yellow-400" /> Link League of Legends Account</>
                : <><Target className="w-5 h-5 text-red-400" /> Link Valorant Account</>
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-gray-400 text-sm">
              Enter your Riot ID exactly as it appears in-game (e.g. <span className="text-white font-mono">PlayerName#EUW</span>).
            </p>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Game Name</label>
              <Input
                value={linkForm.gameName}
                onChange={(e) => setLinkForm({ ...linkForm, gameName: e.target.value })}
                placeholder="PlayerName"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Tag Line</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold">#</span>
                <Input
                  value={linkForm.tagLine}
                  onChange={(e) => setLinkForm({ ...linkForm, tagLine: e.target.value.replace('#', '') })}
                  placeholder="EUW"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Region</label>
              <select
                value={linkForm.region}
                onChange={(e) => setLinkForm({ ...linkForm, region: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              >
                {LOL_REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            {linkError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{linkError}</p>
              </div>
            )}
            <GlowButton
              className="w-full"
              onClick={() => linkRiotMutation.mutate({ ...linkForm, game: linkModal })}
              disabled={!linkForm.gameName || !linkForm.tagLine || linkRiotMutation.isPending}
            >
              {linkRiotMutation.isPending ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Linking...</>
              ) : (
                <><Link2 className="w-4 h-4" /> Link Account</>
              )}
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Billing Sub-Component ────────────────────────────────────────────────────
function BillingTab({ userId }) {
  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['gamer-bills', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/bills?payer_id=${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  if (isLoading) return <div className="text-gray-400 py-8 text-center">Loading bills...</div>;

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
        <p className="font-medium">No bills yet</p>
        <p className="text-sm mt-1">Bills from marketplace orders will appear here.</p>
      </div>
    );
  }

  const statusColor = (s) => {
    if (s === 'paid') return 'text-green-400 bg-green-500/10';
    if (s === 'partial') return 'text-yellow-400 bg-yellow-500/10';
    if (s === 'overdue') return 'text-red-400 bg-red-500/10';
    return 'text-gray-400 bg-zinc-700/50';
  };

  return (
    <div className="space-y-3">
      {bills.map((bill) => (
        <div key={bill.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/30 hover:border-red-500/20 transition-colors">
          <div>
            <p className="text-white font-bold font-mono text-sm">{bill.bill_number}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {bill.tournament_name || bill.bill_type} · {new Date(bill.created_at).toLocaleDateString()}
            </p>
            {bill.due_date && bill.payment_status !== 'paid' && (
              <p className="text-gray-600 text-xs">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white font-bold">EGP {bill.grand_total?.toLocaleString()}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(bill.payment_status)}`}>
                {bill.payment_status?.toUpperCase()}
              </span>
            </div>
            <Link to={`/bill/${bill.bill_number}`}>
              <button className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
