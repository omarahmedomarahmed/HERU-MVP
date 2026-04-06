import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  User, ArrowLeft, Gamepad2, Users, Star, Mic, Video,
  Trophy, Swords, Shield, MapPin, Calendar, ExternalLink,
  Pencil, LogIn,
} from 'lucide-react'
import { GamerProfile, Team, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'

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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
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

          {/* Stats Row */}
          <div className="relative mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <StatBox label="Teams" value={teams.length} icon={Users} />
            <StatBox label="Games" value={gamesCount} icon={Gamepad2} />
            <StatBox label="Played" value={tournamentsPlayed} icon={Swords} />
            <StatBox label="Won" value={tournamentsWon} icon={Trophy} />
          </div>
        </div>

        {/* ---------- Content Grid ---------- */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Games & Ranks */}
          <section className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Gamepad2 className="w-5 h-5 text-red-500" />
              Games & Ranks
            </h2>
            <div className="space-y-2.5">
              {profileData.games?.map((game, i) => (
                <GameRow key={i} game={game} />
              ))}
              {gamesCount === 0 && (
                <p className="text-zinc-600 text-center py-8 text-sm">No games added yet</p>
              )}
            </div>
          </section>

          {/* Teams */}
          <section className="rounded-2xl bg-zinc-900/50 border border-zinc-800/50 p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-red-500" />
              Teams
            </h2>
            <div className="space-y-2.5">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
              {teams.length === 0 && (
                <p className="text-zinc-600 text-center py-8 text-sm">Not in any teams yet</p>
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
