import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  User, ArrowLeft, Gamepad2, Users, Star, Mic, Video,
  Trophy, Swords, Shield, Calendar, ExternalLink,
  Pencil, LogIn, ChevronDown, ChevronUp, Flame, Zap, MessageSquare,
} from 'lucide-react'
import { GamerProfile, Team, Connect, Badge } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import HeruLogo from '@/components/shared/HeruLogo'

// ---------------------------------------------------------------------------
// Riot helpers
// ---------------------------------------------------------------------------

const RANK_COLORS = {
  IRON:        'text-zinc-400 border-zinc-600 bg-zinc-800/50',
  BRONZE:      'text-amber-700 border-amber-800 bg-amber-900/20',
  SILVER:      'text-slate-300 border-slate-500 bg-slate-800/30',
  GOLD:        'text-yellow-400 border-yellow-600 bg-yellow-900/20',
  PLATINUM:    'text-teal-300 border-teal-600 bg-teal-900/20',
  EMERALD:     'text-emerald-400 border-emerald-600 bg-emerald-900/20',
  DIAMOND:     'text-blue-300 border-blue-500 bg-blue-900/20',
  MASTER:      'text-purple-400 border-purple-500 bg-purple-900/20',
  GRANDMASTER: 'text-red-400 border-red-500 bg-red-900/20',
  CHALLENGER:  'text-cyan-300 border-cyan-400 bg-cyan-900/20',
}

function RankBadge({ tier, division, lp, small }) {
  if (!tier) return <span className="text-zinc-600 text-xs">Unranked</span>
  const color = RANK_COLORS[tier?.toUpperCase()] || 'text-zinc-400 border-zinc-600 bg-zinc-800/50'
  const noDiv = ['MASTER','GRANDMASTER','CHALLENGER'].includes(tier?.toUpperCase())
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border font-bold text-xs ${color} ${small ? 'text-[10px] px-1.5' : ''}`}>
      {tier} {!noDiv && division} {lp !== undefined && `${lp} LP`}
    </span>
  )
}

function WinRate({ wins, losses }) {
  const total = (wins || 0) + (losses || 0)
  const wr = total > 0 ? Math.round(((wins || 0) / total) * 100) : 0
  const color = wr >= 55 ? 'text-emerald-400' : wr >= 50 ? 'text-blue-400' : 'text-zinc-400'
  return (
    <span className={`font-bold ${color}`}>{wr}%</span>
  )
}

function ChampionMastery({ mastery }) {
  const version = '14.10.1'
  const imgUrl = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${mastery.championName || 'Aatrox'}.png`
  const pts = mastery.championPoints >= 1000
    ? `${Math.round(mastery.championPoints / 1000)}k`
    : mastery.championPoints
  return (
    <div className="flex flex-col items-center gap-1 group">
      <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700/50 group-hover:border-red-500/40 transition-colors">
        <img src={imgUrl} alt={mastery.championName} className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
      </div>
      <span className="text-[9px] text-zinc-500 font-medium">{pts}</span>
    </div>
  )
}

function MatchRow({ match }) {
  const [open, setOpen] = useState(false)
  const duration = match.duration_s ? `${Math.floor(match.duration_s / 60)}m` : '—'
  const date = match.played_at ? new Date(match.played_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' }) : ''
  const version = '14.10.1'
  const champImg = match.champion
    ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${match.champion}.png`
    : null
  return (
    <div className={`rounded-lg border text-xs ${match.win ? 'border-emerald-800/40 bg-emerald-900/10' : 'border-red-900/40 bg-red-900/10'}`}>
      <button className="w-full flex items-center gap-2 p-2 text-left" onClick={() => setOpen(o => !o)}>
        <span className={`w-1 h-8 rounded-full shrink-0 ${match.win ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {champImg && <img src={champImg} alt={match.champion} className="w-7 h-7 rounded-md object-cover shrink-0" onError={e=>{e.target.style.display='none'}} />}
        <span className={`font-bold w-6 ${match.win ? 'text-emerald-400' : 'text-red-400'}`}>{match.win ? 'W' : 'L'}</span>
        <span className="text-white font-semibold">{match.champion}</span>
        <span className="text-zinc-400 ml-1">{match.kills}/{match.deaths}/{match.assists}</span>
        <span className="text-zinc-500 ml-auto">{duration}</span>
        <span className="text-zinc-600 ml-2 hidden sm:inline">{date}</span>
        {open ? <ChevronUp className="w-3 h-3 text-zinc-500 shrink-0" /> : <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-3 pb-3 grid grid-cols-3 gap-2 text-center border-t border-zinc-800/50 mt-1 pt-2">
          <div><p className="text-zinc-500">KDA</p><p className="text-white font-bold">{match.kda}</p></div>
          <div><p className="text-zinc-500">CS</p><p className="text-white font-bold">{match.cs}</p></div>
          <div><p className="text-zinc-500">Damage</p><p className="text-white font-bold">{match.damage_dealt ? `${Math.round(match.damage_dealt/1000)}k` : '—'}</p></div>
        </div>
      )}
    </div>
  )
}

function LolPublicCard({ account }) {
  const [showMatches, setShowMatches] = useState(false)
  const matches = account.match_history_cache || []
  const masteries = account.champion_masteries || []
  const wins = account.wins || 0
  const losses = account.losses || 0

  return (
    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {account.profile_icon_id && (
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${account.profile_icon_id}.png`}
            alt="" className="w-12 h-12 rounded-full border border-zinc-700"
            onError={e => { e.target.style.display='none' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate">{account.game_name}#{account.tag_line}</p>
          <p className="text-zinc-500 text-xs">{account.region?.toUpperCase()} · Lv {account.summoner_level}</p>
        </div>
        {account.is_primary && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/20 font-bold">MAIN</span>
        )}
      </div>

      {/* Rank */}
      <div className="flex flex-wrap gap-2">
        {account.rank_tier ? (
          <div className="flex items-center gap-2">
            <RankBadge tier={account.rank_tier} division={account.rank_division} lp={account.rank_lp} />
            {account.hot_streak && <Flame className="w-4 h-4 text-orange-400" title="Hot streak" />}
          </div>
        ) : (
          <span className="text-zinc-600 text-xs">Unranked (Solo/Duo)</span>
        )}
        {account.flex_rank_tier && (
          <RankBadge tier={account.flex_rank_tier} division={account.flex_rank_division} lp={account.flex_rank_lp} small />
        )}
      </div>

      {/* W/L */}
      {(wins + losses) > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="text-emerald-400 font-bold">{wins}W</span>
          <span className="text-red-400 font-bold">{losses}L</span>
          <WinRate wins={wins} losses={losses} />
          {account.total_mastery_score > 0 && (
            <span className="text-zinc-500 ml-auto flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" /> {account.total_mastery_score.toLocaleString()} mastery
            </span>
          )}
        </div>
      )}

      {/* Champion masteries */}
      {masteries.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {masteries.slice(0, 7).map((m, i) => <ChampionMastery key={i} mastery={m} />)}
        </div>
      )}

      {/* Match history toggle */}
      {matches.length > 0 && (
        <div>
          <button
            onClick={() => setShowMatches(o => !o)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-2"
          >
            {showMatches ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Recent Matches ({matches.length})
          </button>
          {showMatches && (
            <div className="space-y-1.5">
              {matches.map((m, i) => <MatchRow key={i} match={m} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatBox({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl bg-zinc-900/80 border border-zinc-800/60">
      {Icon && <Icon className="w-4 h-4 text-red-500 mb-0.5" />}
      <span className="text-2xl font-black text-white">{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">{label}</span>
    </div>
  )
}

function TalentBadge({ type }) {
  const iconMap = {
    caster: Mic,
    host: Mic,
    streamer: Video,
    cameraman: Video,
    observer: Video,
  }
  const Icon = iconMap[type?.toLowerCase()] || Star
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
      <Icon className="w-3.5 h-3.5" />
      {type || 'Talent'}
    </span>
  )
}

function GameRow({ game }) {
  return (
    <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/40 hover:border-zinc-700/60 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <Gamepad2 className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-white font-medium text-sm">{game.game_name}</p>
          {game.game_id && <p className="text-zinc-600 text-xs">ID: {game.game_id}</p>}
        </div>
      </div>
      {game.rank && (
        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 border border-red-500/20">
          {game.rank}
        </span>
      )}
    </div>
  )
}

function TeamCard({ team }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="flex items-center gap-3 p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/40 hover:border-red-500/30 transition-all group"
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
        {team.logo ? (
          <img src={team.logo} alt="" className="w-full h-full object-cover" />
        ) : (
          <Users className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-white font-medium text-sm truncate group-hover:text-red-400 transition-colors">
          {team.name}
        </p>
        <p className="text-zinc-500 text-xs">{team.members?.length || 0} members</p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-400 ml-auto shrink-0 transition-colors" />
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function GamerProfileView() {
  const { slug, id: paramId } = useParams()
  const identifier = slug || paramId

  // Current auth user (may be null for guests)
  const { user: authUser } = useAuth()

  // Determine if identifier looks like a UUID
  const isUUID = identifier && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)

  // Fetch the gamer profile
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['public-gamer-profile', identifier],
    queryFn: async () => {
      if (!identifier) return null
      if (isUUID) {
        // Try fetching by ID directly
        try {
          const result = await GamerProfile.get(identifier)
          return result
        } catch {
          // Fallback to list by user_id
          const results = await GamerProfile.list({ user_id: identifier })
          return results?.[0] || null
        }
      } else {
        // Slug-based lookup
        const results = await GamerProfile.list({ username_slug: identifier })
        return results?.[0] || null
      }
    },
    enabled: !!identifier,
  })

  // Fetch gamer stats
  const profileId = profileData?.id || profileData?.user_id
  const { data: stats } = useQuery({
    queryKey: ['gamer-stats', profileId],
    queryFn: () => GamerProfile.stats(profileId),
    enabled: !!profileId,
  })

  // Fetch teams the gamer belongs to
  const { data: teams = [] } = useQuery({
    queryKey: ['gamer-teams', profileData?.team_ids],
    queryFn: async () => {
      if (!profileData?.team_ids?.length) return []
      const allTeams = await Team.list()
      return allTeams.filter(t => profileData.team_ids.includes(t.id))
    },
    enabled: !!profileData?.team_ids?.length,
  })

  // Fetch public Riot accounts
  const { data: riotAccounts = [] } = useQuery({
    queryKey: ['public-riot-accounts', profileData?.user_id],
    queryFn: () => Connect.publicRiotAccounts(profileData.user_id),
    enabled: !!profileData?.user_id,
  })

  // Fetch public Discord
  const { data: discordPublic } = useQuery({
    queryKey: ['public-discord', profileData?.user_id],
    queryFn: () => Connect.publicDiscord(profileData.user_id),
    enabled: !!profileData?.user_id,
  })

  // Fetch gamer badges
  const { data: gamerBadges = [] } = useQuery({
    queryKey: ['gamer-badges', profileData?.user_id],
    queryFn: () => Badge.userBadges(profileData.user_id),
    enabled: !!profileData?.user_id,
  })

  // Check if viewing own profile
  const isOwnProfile = authUser && profileData && (
    authUser.id === profileData.user_id || authUser.id === profileData.id
  )

  // ------- Loading -------
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <p className="text-zinc-600 text-sm">Loading profile...</p>
        </div>
      </div>
    )
  }

  // ------- Not Found -------
  if (!profileData || profileError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-zinc-700" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Profile Not Found</h1>
          <p className="text-zinc-500 mb-8">This gamer profile does not exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const gamesCount = profileData.games?.length || 0
  const tournamentsPlayed = stats?.tournaments_played || 0
  const tournamentsWon = stats?.tournaments_won || 0

  // Aggregate Riot stats for the stat bar
  const primaryLol = riotAccounts.find(a => a.game_key === 'lol' && a.is_primary) || riotAccounts.find(a => a.game_key === 'lol')
  const riotWins = primaryLol ? (primaryLol.wins || 0) : 0
  const riotLosses = primaryLol ? (primaryLol.losses || 0) : 0
  const lolAccounts = riotAccounts.filter(a => a.game_key === 'lol')
  const valAccounts = riotAccounts.filter(a => a.game_key === 'valorant')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <Link to="/" className="flex items-center gap-1.5 ml-1">
              <HeruLogo className="h-7" />
            </Link>
          </div>
          {isOwnProfile ? (
            <Link
              to="/gamer/profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600/15 text-red-400 border border-red-500/20 hover:bg-red-600/25 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit Profile
            </Link>
          ) : !authUser ? (
            <Link
              to="/auth/gamer/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              Sign in to connect
            </Link>
          ) : null}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* ---------- Profile Hero ---------- */}
        <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-800/60 p-8 mb-8 overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-zinc-800">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt={profileData.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-red-500/60" />
              )}
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {profileData.username || 'Unknown Gamer'}
                </h1>
                {profileData.is_talent && <TalentBadge type={profileData.talent_type} />}
              </div>

              {/* Badges */}
              {gamerBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {gamerBadges.map(gb => (
                    <span
                      key={gb.id}
                      title={gb.badge?.description || gb.badge?.name}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-bold"
                      style={{ color: gb.badge?.color || '#ff1a1a', borderColor: `${gb.badge?.color || '#ff1a1a'}50`, backgroundColor: `${gb.badge?.color || '#ff1a1a'}15` }}
                    >
                      {gb.badge?.icon && <span>{gb.badge.icon}</span>}
                      {gb.badge?.name}
                    </span>
                  ))}
                </div>
              )}

              {discordPublic && (
                <div className="flex items-center gap-1.5 mb-3 justify-center sm:justify-start">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{discordPublic.platform_username}</span>
                  </div>
                </div>
              )}

              {profileData.bio && (
                <p className="text-zinc-400 text-sm leading-relaxed max-w-lg mb-4">{profileData.bio}</p>
              )}

              {/* Talent price if applicable */}
              {profileData.is_talent && profileData.talent_price && (
                <p className="text-xs text-zinc-500 mb-4">
                  Talent rate: <span className="text-amber-400 font-bold">EGP {Number(profileData.talent_price).toLocaleString()}</span>
                  {profileData.talent_rating && (
                    <span className="ml-3 inline-flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {profileData.talent_rating}
                    </span>
                  )}
                </p>
              )}

              {/* Joined date */}
              {profileData.created_at && (
                <p className="text-xs text-zinc-600 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Calendar className="w-3 h-3" />
                  Joined {new Date(profileData.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>

          {/* Quick rank badges row */}
          {riotAccounts.length > 0 && (
            <div className="relative mt-6 flex flex-wrap gap-2">
              {riotAccounts.map(acc => {
                const tier = (acc.rank_tier || acc.val_rank_tier || '').toUpperCase();
                const isLoL = acc.game_key === 'lol';
                const wins = acc.wins || 0;
                const losses = acc.losses || 0;
                const wr = wins + losses > 0 ? Math.round(wins / (wins + losses) * 100) : null;
                return (
                  <div key={acc.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-xs">
                    {isLoL && acc.profile_icon_id && (
                      <img src={`https://ddragon.leagueoflegends.com/cdn/16.8.1/img/profileicon/${acc.profile_icon_id}.png`} alt="" className="w-5 h-5 rounded-full" onError={e => e.target.style.display='none'} />
                    )}
                    <span className="text-white font-mono">{acc.game_name}#{acc.tag_line}</span>
                    {tier && <span className="font-black text-yellow-400">{tier}</span>}
                    {wr !== null && <span className={wr >= 50 ? 'text-emerald-400' : 'text-red-400'}>{wr}%WR</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ---------- Riot Ranked Accounts ---------- */}
        {riotAccounts.length > 0 && (
          <section className="mb-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Swords className="w-5 h-5 text-yellow-400" />
              Riot Accounts
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {lolAccounts.map(acc => <LolPublicCard key={acc.id} account={acc} />)}
              {valAccounts.map(acc => (
                <div key={acc.id} className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-900/20 border border-red-800/40 flex items-center justify-center shrink-0">
                      <Swords className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{acc.game_name}#{acc.tag_line}</p>
                      <p className="text-zinc-500 text-xs">Valorant · {acc.region?.toUpperCase()}</p>
                    </div>
                    {acc.is_primary && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/20 font-bold">MAIN</span>}
                  </div>
                  {acc.val_rank_tier ? (
                    <RankBadge tier={acc.val_rank_tier} lp={acc.val_rank_rating} />
                  ) : (
                    <span className="text-zinc-600 text-xs">Rank data unavailable (requires prod API key)</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---------- Content Grid ---------- */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Teams */}
          <section className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-red-500" />
              Teams
            </h2>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
              {teams.length === 0 && (
                <p className="text-zinc-600 py-8 text-sm col-span-2 text-center">Not in any teams yet</p>
              )}
            </div>
          </section>
        </div>

        {/* ---------- Talent Showcase ---------- */}
        {profileData.is_talent && profileData.talent_video_link && (
          <section className="mt-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Video className="w-5 h-5 text-amber-500" />
              Talent Showcase
            </h2>
            <div className="rounded-xl overflow-hidden bg-black aspect-video">
              <iframe
                src={profileData.talent_video_link.replace('watch?v=', 'embed/')}
                title="Talent Showcase"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* ---------- Guest CTA ---------- */}
        {!authUser && (
          <div className="mt-10 rounded-2xl bg-gradient-to-r from-red-600/10 to-zinc-900/50 border border-red-500/20 p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Want to connect with {profileData.username}?</h3>
            <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
              Create a HERU account to join teams, compete in tournaments, and connect with gamers across the MENA region.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/auth/gamer/register"
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors text-sm"
              >
                Create Account
              </Link>
              <Link
                to="/auth/gamer/login"
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg transition-colors text-sm border border-zinc-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
