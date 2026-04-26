import { Link } from 'react-router-dom'
import PublicNav from '@/components/public/PublicNav'
import {
  Briefcase, Building2, Users, Mic2, Megaphone, Wifi,
  Cpu, ShoppingBag, ClipboardList, Star, Shield,
  Zap, ArrowRight, CheckCircle2, ChevronRight,
  DollarSign, TrendingUp, Sparkles, BadgeCheck
} from 'lucide-react'

const CATEGORIES = [
  {
    Icon: Building2, name: 'Specialized Gaming Venue',
    desc: 'Offer your gaming center, arena, or LAN hall for offline tournaments. Get discovered by organizers building events in your city.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: Star, name: 'Coach',
    desc: 'Offer 1-on-1 and group coaching sessions in Valorant, CS2, LoL, FIFA, and more. Players book directly via the HERU coaching marketplace.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
    note: 'Visible to gamers only',
  },
  {
    Icon: Users, name: 'Talent & Influencer',
    desc: 'Streamers, casters, cosplayers, and esports personalities. Get booked by organizers for activations and sponsors for brand campaigns.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
    note: 'Visible to organizers & sponsors',
  },
  {
    Icon: Mic2, name: 'Media Production',
    desc: 'Live streaming crews, broadcast engineering, on-site production, and post-event video editing. Power the coverage that makes events worth watching.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: Megaphone, name: 'Marketing',
    desc: 'Social media campaigns, paid ads, content plans, and event promotion. Help organizers sell out registrations and grow their brand.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: Wifi, name: 'Gaming Community',
    desc: 'Discord servers, Facebook groups, Instagram pages, and TikTok channels with engaged MENA gaming audiences. Offer reach to organizers and sponsors.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: Cpu, name: 'Gaming Hardware & Setup',
    desc: 'Peripheral rentals, gaming PC setups, monitor walls, and tech infrastructure for offline events. Provide the gear that makes tournaments run.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: ShoppingBag, name: 'Offline Event Vendors',
    desc: 'Food & beverage, printing & merchandising, signage, trophies, swag bags, and booth setups. Everything an offline event needs to look professional.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: ClipboardList, name: 'Tournament Management',
    desc: 'Referee services, bracket administration, on-site staff, registration desk management, and day-of event operations. Run the show behind the scenes.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
]

const FEATURES = [
  {
    Icon: Briefcase, title: 'Multi-Service Listings',
    desc: 'List multiple services under one account. Each gets its own profile, pricing, portfolio, and reviews.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: BadgeCheck, title: 'Staff Verification Flow',
    desc: 'Submit your listing for HERU staff review. Approved providers appear inside the Tournament Builder for organizers to discover and book.',
    color: 'text-teal-400', bg: 'bg-teal-500/10',
  },
  {
    Icon: Shield, title: 'Escrow Payments',
    desc: "Payment is held securely at booking. Once the organizer confirms delivery, your 85% is released instantly. You're always protected.",
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: Star, title: 'Portfolio Showcase',
    desc: 'Add past projects, client testimonials, photos, and links to build a credible public profile that wins bookings.',
    color: 'text-teal-400', bg: 'bg-teal-500/10',
  },
  {
    Icon: TrendingUp, title: 'Ratings & Reviews',
    desc: 'Every completed booking generates a verified review. Build your reputation on the platform and stand out from the crowd.',
    color: 'text-cyan-400', bg: 'bg-cyan-500/10',
  },
  {
    Icon: Zap, title: 'Premium Visibility',
    desc: 'Upgrade for priority placement in the Tournament Builder pool. Get in front of more organizers and land more bookings.',
    color: 'text-teal-400', bg: 'bg-teal-500/10',
  },
]

const HOW = [
  { step: '01', title: 'Create your provider account', desc: 'Sign up, complete your profile, and choose your service category.' },
  { step: '02', title: 'Submit a listing', desc: 'Add pricing, description, portfolio, and service details. Submit for staff review.' },
  { step: '03', title: 'Get booked via Builder', desc: 'Once approved, organizers discover and book you directly inside their tournament builder.' },
  { step: '04', title: 'Deliver & get paid', desc: 'Complete the job, get confirmed by the organizer, and receive 85% via escrow release.' },
]

export default function ForProviders() {
  return (
    <div className="min-h-screen bg-[#080f0f] text-white">
      <PublicNav />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-600/8 blur-[140px]" />
          <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full bg-teal-600/6 blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10
                          border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6 uppercase tracking-wider">
            <Briefcase className="h-3.5 w-3.5" />
            HERU GIGs — For Service Providers
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Get paid to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
              power esports.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            List your services. Get discovered by tournament organizers and sponsors across MENA.
            Deliver. Get paid 85% via escrow — every time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth/provider/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-cyan-600 hover:bg-cyan-500 text-white transition-colors text-sm">
              <Zap className="h-4 w-4" />List Your Services
            </Link>
            <Link to="/auth/provider/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold
                         bg-white/8 hover:bg-white/12 text-white border border-white/10 transition-colors text-sm">
              Log in <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ECONOMICS BANNER */}
      <section className="py-10 px-4">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-cyan-900/20 to-teal-950/10
                        border border-cyan-500/20 p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-black text-cyan-400 mb-1">85%</p>
              <p className="text-xs text-gray-400">You keep on every booking</p>
            </div>
            <div>
              <p className="text-4xl font-black text-cyan-400 mb-1">15%</p>
              <p className="text-xs text-gray-400">HERU platform fee — that's it</p>
            </div>
            <div>
              <p className="text-4xl font-black text-cyan-400 mb-1">100%</p>
              <p className="text-xs text-gray-400">Escrow-protected payments</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Service Categories</p>
            <h2 className="text-4xl font-black text-white">9 ways to get booked.</h2>
            <p className="text-gray-400 mt-3 max-w-xl mx-auto">
              Every type of esports service provider has a home on HERU GIGs.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(({ Icon, name, desc, color, bg, note }) => (
              <div key={name} className="p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-cyan-500/20 transition-colors">
                <div className={`p-2.5 rounded-xl ${bg} ${color} w-fit mb-4`}><Icon className="h-5 w-5" /></div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white">{name}</h3>
                  {note && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
                      {note}
                    </span>
                  )}
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
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">How It Works</p>
            <h2 className="text-3xl font-black text-white">From listing to payout in 4 steps.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {HOW.map(({ step, title, desc }) => (
              <div key={step} className="p-5 rounded-2xl bg-white/4 border border-white/8">
                <p className="text-4xl font-black text-cyan-500/25 mb-3">{step}</p>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">Platform Features</p>
            <h2 className="text-4xl font-black text-white">Everything you need to run your gig.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ Icon, title, desc, color, bg }) => (
              <div key={title} className="p-5 rounded-2xl bg-white/4 border border-white/8 hover:border-cyan-500/20 transition-colors">
                <div className={`p-2.5 rounded-xl ${bg} ${color} w-fit mb-4`}><Icon className="h-5 w-5" /></div>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ESCROW SPOTLIGHT */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-cyan-900/20 to-teal-950/10
                        border border-cyan-500/20 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="p-4 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 shrink-0">
              <Shield className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Escrow Protection</p>
              <h2 className="text-2xl font-black text-white mb-3">You deliver. You get paid. Guaranteed.</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                When an organizer books you, payment is locked in escrow before the event.
                You complete the job, the organizer confirms delivery, and your 85% is released.
                No chasing invoices, no payment disputes — just clean payouts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Payment secured at booking', 'Organizer confirms delivery', 'Your share released instantly'].map((f, i) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APPROVAL FLOW */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto rounded-2xl bg-white/3 border border-white/8 p-8 text-center">
          <BadgeCheck className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-2xl font-black text-white mb-2">Quality-verified by HERU staff</h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto mb-6">
            Every service listing goes through a manual review before appearing in the Tournament Builder.
            This keeps quality high for organizers — and makes your listing more valuable once approved.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Submit your listing', 'Staff reviews within 48h', 'Approved → visible in Builder', 'Bookings start coming in'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-600" />}
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-white mb-4">Ready to power MENA esports?</h2>
          <p className="text-gray-400 mb-8">
            Create your provider account, list your first service, and start getting discovered by tournament organizers today.
          </p>
          <Link to="/auth/provider/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold
                       bg-cyan-600 hover:bg-cyan-500 text-white transition-colors">
            Create Provider Account <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-xs text-gray-600 mt-4">
            Already have an account?{' '}
            <Link to="/auth/provider/login" className="text-cyan-400 hover:underline">Log in</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
