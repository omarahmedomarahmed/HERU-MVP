import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Radar, BarChart3, Users, Building2, Star,
  Zap, ArrowRight, CheckCircle2, ChevronRight,
  TrendingUp, Eye, Megaphone, Sparkles, Crown
} from 'lucide-react'

const FEATURES = [
  {
    Icon: Radar, title: 'Sponsorship Radar',
    desc: 'Browse live sponsorship opportunities across MENA tournaments. Filter by game, budget, reach, and event type — online or offline.',
    color: 'text-yellow-400', bg: 'bg-yellow-500/10',
  },
  {
    Icon: BarChart3, title: 'ROI & Performance Tracking',
    desc: "Once you sponsor an event, track views, reach, deliverables completed, and organizer reports — all in your dashboard.",
    color: 'text-green-400', bg: 'bg-green-500/10',
  },
  {
    Icon: Users, title: 'Influencer & Talent Hiring',
    desc: 'Browse verified streamers, content creators, cosplayers, and esports personalities. Book them for activations directly from your sponsor dashboard.',
    color: 'text-yellow-400', bg: 'bg-yellow-500/10',
  },
  {
    Icon: Building2, title: 'Corporate Activations Builder',
    desc: 'Build private invite-only esports activations for your brand or clients. Perfect for corporate team events, product launches, and brand campaigns.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
  {
    Icon: Eye, title: 'Organizer Performance History',
    desc: "View any organizer's verified profile, past tournament stats, attendance numbers, and sponsor reviews before committing to a package.",
    color: 'text-yellow-400', bg: 'bg-yellow-500/10',
  },
  {
    Icon: Megaphone, title: 'Managed Campaigns',
    desc: 'Submit a brief and let the HERU team manage your entire esports campaign — from event selection to execution to post-event reporting.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
  {
    Icon: TrendingUp, title: 'Sponsorship Affiliate Program',
    desc: 'Refer other brands to HERU and earn a percentage of their first-year sponsorship spend. Full tracking in your dashboard.',
    color: 'text-yellow-400', bg: 'bg-yellow-500/10',
  },
  {
    Icon: Star, title: 'Priority Listing & Support',
    desc: 'Community and Premium subscribers get priority placement in organizer outreach, dedicated account management, and early access to new events.',
    color: 'text-orange-400', bg: 'bg-orange-500/10',
  },
]

const TIERS = [
  {
    name: 'Free',
    price: 'EGP 0',
    period: 'per month',
    desc: 'Access all sponsorship packages as one-off purchases.',
    highlight: false,
    features: [
      'Browse full sponsorship radar',
      'One-off package purchases',
      'Basic sponsor dashboard',
      'Post-event reports',
    ],
    cta: 'Start Free',
    ctaHref: '/auth/sponsor/register',
    Icon: Star,
  },
  {
    name: 'Community',
    price: 'EGP 150,000',
    period: 'per month',
    desc: '2 online sponsorships per month with full analytics and support.',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Everything in Free',
      '2 Online sponsorships / month',
      'ROI tracking & analytics',
      'Influencer marketplace access',
      'Priority radar placement',
      'Dedicated account support',
    ],
    cta: 'Get Community',
    ctaHref: '/auth/sponsor/register',
    Icon: TrendingUp,
  },
  {
    name: 'Premium',
    price: 'EGP 300,000',
    period: 'per month',
    desc: '2 online + 1 offline sponsorship per month, plus managed services.',
    highlight: false,
    features: [
      'Everything in Community',
      '2 Online + 1 Offline / month',
      'Managed campaign service',
      'Corporate activations builder',
      'Custom integrations',
      'Dedicated account manager',
      'Affiliate program access',
    ],
    cta: 'Get Premium',
    ctaHref: '/auth/sponsor/register',
    Icon: Crown,
  },
]

const HOW = [
  { step: '01', title: 'Create your brand account', desc: 'Sign up, add your brand profile, and choose a plan.' },
  { step: '02', title: 'Browse the Radar', desc: 'Discover live tournament sponsorship packages filtered by game, reach, and budget.' },
  { step: '03', title: 'Buy & activate', desc: 'Purchase a package, review deliverables, and connect with the organizer.' },
  { step: '04', title: 'Track your ROI', desc: 'Monitor live performance, receive post-event reports, and measure brand impact.' },
]

export default function ForSponsors() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <PublicNav />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-yellow-600/8 blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-orange-600/6 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10
                          border border-yellow-500/20 text-yellow-400 text-xs font-semibold mb-6 uppercase tracking-wider">
            <Radar className="h-3.5 w-3.5" />
            HERU RADAR — For Sponsors & Brands
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Sponsor esports.{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Measure everything.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Put your brand in front of 25,000+ MENA gamers. Browse live sponsorship
            packages, track ROI in real time, hire influencers, and build corporate activations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth/sponsor/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-yellow-500 hover:bg-yellow-400 text-black transition-colors text-sm">
              <Zap className="h-4 w-4" />Explore the Radar
            </Link>
            <Link to="/auth/sponsor/login"
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
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">Full Feature Set</p>
            <h2 className="text-4xl font-black text-white">Everything your brand needs to win esports.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-yellow-500/20 transition-colors">
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Process</p>
            <h2 className="text-3xl font-black text-white">From sign-up to live in 4 steps.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW.map(({ step, title, desc }) => (
              <div key={step} className="p-5 rounded-2xl bg-white/4 border border-white/8">
                <p className="text-4xl font-black text-yellow-500/25 mb-3">{step}</p>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TIERS */}
      <section className="py-24 px-4" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-3">HERU RADAR Plans</p>
            <h2 className="text-4xl font-black text-white">Choose your sponsorship tier.</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              All plans in EGP. Start free, upgrade when your brand is ready to scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TIERS.map(({ name, price, period, desc, highlight, badge, features, cta, ctaHref, Icon }) => (
              <div key={name}
                className={`relative flex flex-col rounded-2xl border p-7 transition-all
                  ${highlight
                    ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-950/10 border-yellow-500/40 shadow-lg shadow-yellow-500/10'
                    : 'bg-white/4 border-white/10'}`}>
                {badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
                                   bg-yellow-500 text-black text-xs font-bold">
                    {badge}
                  </span>
                )}
                <div className={`p-2.5 rounded-xl w-fit mb-4 ${highlight ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/8 text-gray-400'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-lg font-black text-white">{name}</p>
                <div className="mt-2 mb-1">
                  <span className={`text-2xl font-black ${highlight ? 'text-yellow-400' : 'text-white'}`}>{price}</span>
                  <span className="text-gray-500 text-sm ml-1">/{period}</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">{desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${highlight ? 'text-yellow-400' : 'text-gray-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to={ctaHref}
                  className={`w-full text-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
                    ${highlight
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
                      : 'bg-white/10 hover:bg-white/15 text-white'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white mb-4">Start with free. Scale when ready.</h2>
          <p className="text-gray-400 mb-8">
            Create your brand account, browse live opportunities, and sponsor your first tournament today — no commitment required.
          </p>
          <Link to="/auth/sponsor/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold
                       bg-yellow-500 hover:bg-yellow-400 text-black transition-colors">
            Create Brand Account <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/auth/sponsor/login" className="text-yellow-400 hover:underline">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
