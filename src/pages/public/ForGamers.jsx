import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Gamepad2, Trophy, Users, Star, MessageSquare,
  Zap, Target, Swords, UserCheck, ArrowRight,
  ChevronRight, Sparkles
} from 'lucide-react'

const FEATURES = [
  {
    Icon: Trophy,
    title: 'Live Bracket Tournaments',
    desc: 'Join published tournaments from professional organizers. Real brackets, real competition, real prizes in EGP.',
    color: 'text-red-400', bg: 'bg-red-500/10',
  },
  {
    Icon: Swords,
    title: 'Community Tournament Builder',
    label: 'NEW',
    desc: 'Create private 1v1 or team scrims instantly. Invite friends, set the rules, run a bracket — no organizer needed.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
  {
    Icon: Users,
    title: 'Team Creation & Management',
    desc: 'Build a roster, set roles, invite members, and enter tournaments as a team. Browse open rosters looking for players.',
    color: 'text-red-400', bg: 'bg-red-500/10',
  },
  {
    Icon: UserCheck,
    title: 'Coaching Marketplace',
    desc: 'Book 1-on-1 sessions with verified coaches across Valorant, CS2, LoL, FIFA, and more.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
  {
    Icon: Star,
    title: 'HERU Rank Leaderboard',
    desc: 'Every tournament win earns rank points. Climb the MENA leaderboard and earn your HERU badge.',
    color: 'text-red-400', bg: 'bg-red-500/10',
  },
  {
    Icon: MessageSquare,
    title: 'Friends, Teams & DMs',
    desc: 'Add friends by gamer tag or Riot ID, build your network, and message anyone directly on the platform.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
  {
    Icon: Target,
    title: 'In-Game Stats & Profiles',
    desc: 'Link your Riot account to show real rank, champion mastery, and match history directly on your public profile.',
    color: 'text-red-400', bg: 'bg-red-500/10',
  },
  {
    Icon: Gamepad2,
    title: 'Gamer Profile & Portfolio',
    desc: 'Showcase your tournament history, team affiliations, achievements, and talent profile — all in one public page.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
]

const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Fortnite', 'FIFA / EA FC', 'PUBG', 'Apex Legends', 'Rocket League', 'Overwatch 2', 'Rainbow Six Siege', 'Mobile Legends', 'Free Fire', 'Call of Duty']

const HOW = [
  { step: '01', title: 'Create your profile', desc: 'Sign up, set your gamer tag, link your Riot/Discord, and choose your games.' },
  { step: '02', title: 'Join or build a team', desc: 'Find a team looking for your role, or create your own and recruit.' },
  { step: '03', title: 'Compete & climb', desc: 'Enter tournaments, win matches, earn rank points, move up the MENA leaderboard.' },
  { step: '04', title: 'Get discovered', desc: 'Organizers and sponsors browse top players. Stand out with your stats and portfolio.' },
]

export default function ForGamers() {
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <PublicNav />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-red-600/10 blur-[140px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10
                          border border-red-500/20 text-red-400 text-xs font-semibold mb-6 uppercase tracking-wider">
            <Gamepad2 className="h-3.5 w-3.5" />
            HERU ARENA — For Gamers
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Compete.{' '}
            <span className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              Climb.
            </span>
            {' '}Connect.
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            The competitive home for MENA gamers. Join tournaments, build teams,
            book coaches, and rise to the top of the HERU rank leaderboard — all free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth/gamer/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-red-600 hover:bg-red-500 text-white transition-colors text-sm">
              <Zap className="h-4 w-4" />Create Free Profile
            </Link>
            <Link to="/tournaments"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-colors text-sm">
              Browse Tournaments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* COMMUNITY BUILDER SPOTLIGHT */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-red-900/20 to-orange-950/10
                        border border-red-500/20 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/20 shrink-0">
              <Swords className="h-8 w-8 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400">New Feature</p>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold">NEW</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Community Tournament Builder</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Create your own private 1v1 match, team scrim, or mini bracket tournament — instantly.
                Invite friends via link, set the format, and track results. No organizer account needed.
                Perfect for practice matches, clan wars, and community events.
              </p>
            </div>
            <Link to="/auth/gamer/register"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         bg-red-600 hover:bg-red-500 text-white transition-colors">
              Try It <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Everything You Need</p>
            <h2 className="text-4xl font-black text-white">Built for competitive gamers.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ Icon, title, label, desc, color, bg }) => (
              <div key={title} className="p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-red-500/20 transition-colors">
                <div className={`p-2.5 rounded-xl ${bg} ${color} w-fit mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{title}</h3>
                  {label && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">{label}</span>}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-gradient-to-b from-white/2 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">From signup to champion</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW.map(({ step, title, desc }) => (
              <div key={step} className="p-5 rounded-2xl bg-white/4 border border-white/8">
                <p className="text-4xl font-black text-red-500/25 mb-3">{step}</p>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMES */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4">Supported Games</p>
          <h2 className="text-3xl font-black text-white mb-8">Your game is here.</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {GAMES.map(g => (
              <span key={g} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10
                                       text-sm text-gray-300 hover:border-red-500/30 hover:text-white transition-colors">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-8 w-8 text-red-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white mb-4">Free to compete. Forever.</h2>
          <p className="text-gray-400 mb-8">
            HERU ARENA is free for all gamers. No subscription, no pay-to-play.
            Just compete, climb, and connect.
          </p>
          <Link to="/auth/gamer/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold
                       bg-red-600 hover:bg-red-500 text-white transition-colors">
            Create Your Profile <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-gray-600 mt-4">Already have an account? <Link to="/auth/gamer/login" className="text-red-400 hover:underline">Log in</Link></p>
        </div>
      </section>
    </div>
  )
}
