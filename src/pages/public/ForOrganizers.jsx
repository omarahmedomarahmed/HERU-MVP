import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Building2, Trophy, Briefcase, Radar, Users,
  Zap, ArrowRight, CheckCircle2, ChevronRight,
  LayoutGrid, Link2, BarChart3, Headphones, Sparkles
} from 'lucide-react'

const FEATURES = [
  {
    Icon: LayoutGrid, title: 'Tournament Builder',
    desc: 'Create online or offline tournaments in minutes — format, prize pool, entry fee, skill level, and registration rules in a guided builder.',
    color: 'text-purple-400', bg: 'bg-purple-500/10',
  },
  {
    Icon: Briefcase, title: 'Service Provider Marketplace',
    desc: 'Browse and book approved venues, streaming crews, branding designers, marketing teams, and talent — all inside the tournament builder.',
    color: 'text-blue-400', bg: 'bg-blue-500/10',
  },
  {
    Icon: Radar, title: 'Sponsorship Package Creator',
    desc: 'Design gold, silver, and title sponsor tiers with deliverables. List them on HERU RADAR to attract brand sponsors automatically.',
    color: 'text-yellow-400', bg: 'bg-yellow-500/10',
  },
  {
    Icon: BarChart3, title: 'Tournament CRM',
    desc: 'Manage teams, brackets, service providers, sponsor deliverables, and chat from one command center while your event runs live.',
    color: 'text-purple-400', bg: 'bg-purple-500/10',
  },
  {
    Icon: Trophy, title: 'Brackets & Seeding Manager',
    desc: 'Single elimination, double elimination, round robin, or Swiss. Auto-generate brackets or seed teams manually.',
    color: 'text-blue-400', bg: 'bg-blue-500/10',
  },
  {
    Icon: Link2, title: 'Registration Links',
    desc: 'Every tournament gets a shareable link. Public (open registration) or private (link-only) for invite-only corporate events.',
    color: 'text-purple-400', bg: 'bg-purple-500/10',
  },
  {
    Icon: Users, title: 'Organizer Public Portfolio',
    desc: 'Every published tournament builds your public organizer profile — stats, past events, reviews, and sponsor-ready credentials.',
    color: 'text-blue-400', bg: 'bg-blue-500/10',
  },
  {
    Icon: Headphones, title: 'Build It For Me',
    desc: "HERU consultants can plan, build, staff, and fund your event from scratch. Request a consultation directly from your dashboard.",
    color: 'text-purple-400', bg: 'bg-purple-500/10',
  },
]

const HOW = [
  { step: '01', title: 'Create your tournament', desc: 'Set game, format, dates, prize pool, and entry fee using the step-by-step builder.' },
  { step: '02', title: 'Book service providers', desc: 'Browse approved venues, streaming crews, and marketing teams. Book inside the builder.' },
  { step: '03', title: 'Create sponsorship packages', desc: 'Design sponsor tiers and list them on HERU RADAR to attract brand investment.' },
  { step: '04', title: 'Publish & manage', desc: 'Share your registration link, run brackets, and coordinate everything from the CRM.' },
]

const BILLING_FEATURES = [
  'Itemized invoices for every service provider booked',
  'Sponsorship income ledger with payment tracking',
  'Automatic bill generation on tournament completion',
  'Escrow release controls — you confirm delivery, then funds release',
]

export default function ForOrganizers() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white">
      <PublicNav />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-blue-600/8 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10
                          border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6 uppercase tracking-wider">
            <Building2 className="h-3.5 w-3.5" />
            HERU BUILDER — For Organizers
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Build events{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              that get funded.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            The complete tournament operating system for MENA esports organizers.
            Build, staff, monetize, and manage — from first draft to final bracket.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth/organizer/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-purple-700 hover:bg-purple-600 text-white transition-colors text-sm">
              <Zap className="h-4 w-4" />Start Building
            </Link>
            <Link to="/auth/organizer/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-colors text-sm">
              Log in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Full Feature Set</p>
            <h2 className="text-4xl font-black text-white">One platform. End-to-end.</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">From the first planning step to the final sponsor report.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-purple-500/20 transition-colors">
                <div className={`p-2.5 rounded-xl ${bg} ${color} w-fit mb-4`}><Icon className="h-5 w-5" /></div>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Workflow</p>
            <h2 className="text-3xl font-black text-white">From idea to live event in 4 steps.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW.map(({ step, title, desc }) => (
              <div key={step} className="p-5 rounded-2xl bg-white/4 border border-white/8">
                <p className="text-4xl font-black text-purple-500/25 mb-3">{step}</p>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CRM SPOTLIGHT */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-purple-900/20 to-blue-950/10
                        border border-purple-500/20 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/20 shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Tournament CRM</p>
              <h2 className="text-2xl font-black text-white mb-3">More than a bracket — a full event command center.</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Once live, the CRM gives you 6 dedicated tabs: Overview, Teams, Brackets, Providers,
                Organizer Chat, and Settings. Service providers also get CRM access to coordinate delivery.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Teams & check-in','Bracket management','Provider coordination',
                  'Sponsor communication','Status workflow','Registration controls'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400 shrink-0" />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ECONOMICS */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Transparent Pricing</p>
            <h2 className="text-3xl font-black text-white">Simple. Fair. 15% platform fee.</h2>
            <p className="text-gray-400 mt-3 text-sm max-w-lg mx-auto">
              HERU takes 15% on service bookings and sponsorship income. You keep 85%.
              Tournament entry fees go to your prize pool — HERU takes nothing from prizes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Platform fee on service bookings', value: '15%' },
              { label: 'Platform fee on sponsorship income', value: '15%' },
              { label: 'You keep from every transaction', value: '85%' },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 rounded-2xl bg-white/4 border border-white/8 text-center">
                <p className="text-3xl font-black text-purple-400 mb-1">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-2xl bg-white/4 border border-white/8">
            <p className="text-sm font-bold text-white mb-3">Billing & Invoicing includes:</p>
            <ul className="space-y-2">
              {BILLING_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* BUILD IT FOR ME */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-blue-900/20 to-blue-950/10
                        border border-blue-500/20 p-8 text-center">
          <Headphones className="h-8 w-8 text-blue-400 mx-auto mb-3" />
          <h2 className="text-2xl font-black text-white mb-2">Want us to build it for you?</h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto mb-6">
            HERU consultants can plan, staff, fund, and execute your entire event.
            Request a consultation from your organizer dashboard after signing up.
          </p>
          <Link to="/auth/organizer/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                       bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            Get Started <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to build your next event?</h2>
          <p className="text-gray-400 mb-8">
            Join organizers across Egypt, Saudi Arabia, and UAE running their events on HERU BUILDER.
          </p>
          <Link to="/auth/organizer/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold
                       bg-purple-700 hover:bg-purple-600 text-white transition-colors">
            Create Organizer Account <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/auth/organizer/login" className="text-purple-400 hover:underline">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
