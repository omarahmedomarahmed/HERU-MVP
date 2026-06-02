import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Briefcase, Star, Shield, Users, BarChart3, DollarSign,
  CheckCircle2, ArrowRight, ChevronDown, Award, Globe,
  Building2, Zap, Trophy, Target, MessageSquare
} from 'lucide-react'

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&q=80'
const CATEGORIES_BG = 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1920&q=80'
const HOW_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'

const CATEGORIES = [
  { label: 'Coaches', desc: 'Game-specific 1-on-1 coaching for gamers across all levels and titles.' },
  { label: 'Influencers', desc: 'Esports content creators and streamers for brand activations and campaigns.' },
  { label: 'Designers', desc: 'Visual identity, overlays, motion graphics, and esports creative production.' },
  { label: 'Production', desc: 'Full-scale event production — streams, cameras, audio, graphics, and control.' },
  { label: 'Casters', desc: 'Professional play-by-play and color commentary for live tournament broadcasts.' },
  { label: 'Analysts', desc: 'Game data analysts and performance coaching specialists for competitive teams.' },
  { label: 'Venues', desc: 'Gaming centers, arenas, and event spaces equipped for esports competitions.' },
  { label: 'Marketing', desc: 'Esports marketing agencies and brand activation specialists for MENA events.' },
  { label: 'Gaming Centers', desc: 'Physical gaming venues offering structured event hosting and equipment.' },
]

const CAPABILITIES = [
  {
    Icon: Globe,
    title: 'Marketplace',
    desc: 'List your services on the HERU Gigs marketplace and get discovered by tournament organizers and sponsors actively seeking your expertise.',
    detail: ['Public service listing page', 'Category-based discovery', 'Organizer search and filtering', 'Rating-based ranking', 'Profile visibility controls'],
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
  },
  {
    Icon: Award,
    title: 'Portfolio',
    desc: 'Build a comprehensive public portfolio showcasing past events, clients, deliverables, and testimonials — your professional proof of work.',
    detail: ['Event portfolio gallery', 'Client and deliverable showcase', 'Testimonial display', 'Media and video links', 'Work history verification'],
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
  {
    Icon: Star,
    title: 'Reviews',
    desc: 'Collect verified reviews from organizers after every completed booking. Build a public rating and review history that drives future bookings.',
    detail: ['Verified post-booking reviews', '5-star rating system', 'Public review display', 'Review response capability', 'Rating-based sorting'],
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    Icon: BarChart3,
    title: 'Discovery',
    desc: 'Appear in front of the right buyers at the right time. Organizers building events see your profile based on category, availability, and ratings.',
    detail: ['Category-based discovery', 'Availability-based matching', 'Rating-ranked visibility', 'Tournament builder integration', 'Organizer notification system'],
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    Icon: MessageSquare,
    title: 'Bookings',
    desc: 'Receive and manage bookings through a structured workflow. Chat directly with organizers, share files, and confirm deliveries — all in one place.',
    detail: ['Booking request management', 'Direct organizer messaging', 'File sharing and uploads', 'Delivery confirmation workflow', 'Booking status tracking'],
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
  },
  {
    Icon: Shield,
    title: 'Payments',
    desc: 'All bookings are paid through secure escrow. Funds are held until the organizer confirms delivery — protecting both sides of every transaction.',
    detail: ['Escrow-protected payments', '85% net payout to provider', 'Payment on delivery confirmation', 'Income tracking dashboard', 'Payout history records'],
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
]

const JOURNEY = [
  { step: '01', title: 'Create Your Profile', desc: 'Register as a service provider. Select your category and build your professional profile with bio, portfolio, and service listings.', color: 'text-cyan-400', dot: 'bg-cyan-500' },
  { step: '02', title: 'List Your Services', desc: 'Create detailed service listings with descriptions, pricing, delivery timelines, and portfolio examples. Submit for staff approval.', color: 'text-blue-400', dot: 'bg-blue-500' },
  { step: '03', title: 'Get Discovered', desc: 'Approved listings appear in the HERU Gigs marketplace and inside the Tournament Builder when organizers create events.', color: 'text-purple-400', dot: 'bg-purple-500' },
  { step: '04', title: 'Deliver and Get Paid', desc: 'Accept booking requests, communicate with organizers, deliver your service, and receive payment via escrow release — 85% to you.', color: 'text-green-400', dot: 'bg-green-500' },
]

const STATS = [
  { value: '85%', label: 'Payout Rate', color: 'text-cyan-400' },
  { value: '9', label: 'Service Categories', color: 'text-white' },
  { value: 'Escrow', label: 'Payment Protection', color: 'text-green-400' },
  { value: '500+', label: 'Events to Serve', color: 'text-white' },
]

export default function ForProviders() {
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [activeCapability, setActiveCapability] = useState(0)

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── VIDEO HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay loop muted playsInline
            onCanPlay={() => setVideoLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-25' : 'opacity-0'}`}
            poster={HERO_FALLBACK}
          >
            <source src="https://www.pexels.com/video/8728384/download/?fps=25&h=1080&w=1920" type="video/mp4" />
          </video>
          {!videoLoaded && (
            <img src={HERO_FALLBACK} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/60 to-zinc-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/70 via-transparent to-zinc-950/60" />
        </div>

        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-cyan-600/8 blur-[150px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-cyan-500/8 border border-cyan-500/20 text-cyan-400 mb-7">
              <Briefcase className="h-3.5 w-3.5" />
              HERU Gigs
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] mb-6 max-w-4xl"
          >
            Showcase services.<br />
            Get discovered.<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Get booked.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-10"
          >
            The professional services marketplace for the MENA esports industry. List your expertise, build your portfolio, and get booked by tournament organizers and sponsors — with every payment secured through escrow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-16"
          >
            <Link to="/auth/provider/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/30 text-[15px] hover:-translate-y-0.5">
              List Your Services
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white transition-all border border-white/10 hover:border-white/20 text-[15px]">
              View Platform Fees
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-8">
            {STATS.map(s => (
              <div key={s.label}>
                <p className={`text-3xl font-black ${s.color} mb-0.5`}>{s.value}</p>
                <p className="text-xs text-zinc-600 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <ChevronDown className="h-4 w-4 text-zinc-600 animate-bounce" />
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">Service Categories</p>
            <h2 className="text-3xl font-black text-white mb-2">Nine categories. One marketplace.</h2>
            <p className="text-zinc-500 text-sm">Every type of esports service professional has a home in HERU Gigs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.label}
                className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/8 hover:border-cyan-500/20 hover:bg-cyan-500/4 transition-all duration-300">
                <span className="h-2 w-2 rounded-full bg-cyan-500 mt-2 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">{cat.label}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-5">
              Platform Capabilities
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-5">Everything you need to grow your business.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Six integrated capabilities covering your full service business — from listing to getting paid.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              {CAPABILITIES.map((cap, i) => (
                <button
                  key={cap.title}
                  onClick={() => setActiveCapability(i)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                    activeCapability === i
                      ? `${cap.bg} ${cap.border}`
                      : 'bg-white/[0.02] border-white/8 hover:bg-white/4 hover:border-white/12'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cap.bg} ${cap.color}`}>
                      <cap.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`font-bold text-[15px] ${activeCapability === i ? 'text-white' : 'text-zinc-300'}`}>{cap.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{cap.desc.slice(0, 60)}...</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className={`sticky top-24 p-8 rounded-2xl border ${CAPABILITIES[activeCapability].border} ${CAPABILITIES[activeCapability].bg} transition-all duration-300`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${CAPABILITIES[activeCapability].bg}`}>
                {(() => { const Cap = CAPABILITIES[activeCapability].Icon; return <Cap className={`h-7 w-7 ${CAPABILITIES[activeCapability].color}`} /> })()}
              </div>
              <h3 className={`text-2xl font-black mb-4 ${CAPABILITIES[activeCapability].color}`}>
                {CAPABILITIES[activeCapability].title}
              </h3>
              <p className="text-zinc-300 leading-relaxed mb-7">
                {CAPABILITIES[activeCapability].desc}
              </p>
              <ul className="space-y-3">
                {CAPABILITIES[activeCapability].detail.map(d => (
                  <li key={d} className="flex items-center gap-3 text-sm text-zinc-400">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${CAPABILITIES[activeCapability].color}`} />
                    {d}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/auth/provider/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── JOURNEY ──────────────────────────────────────────────────── */}
      <section className="py-32 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">From listing to booked — four steps.</h2>
            <p className="text-zinc-400 text-lg">The full path from creating your profile to earning through HERU Gigs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY.map((j) => (
              <div key={j.step} className="p-6 rounded-2xl bg-white/[0.03] border border-white/8">
                <p className={`text-5xl font-black opacity-10 mb-3 ${j.color}`}>{j.step}</p>
                <div className={`h-2 w-2 rounded-full ${j.dot} mb-4`} />
                <h3 className="font-black text-white mb-2 text-[15px]">{j.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{j.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────── */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">Simple, transparent fees.</h2>
            <p className="text-zinc-400 text-lg">Free to join. Only pay when you earn.</p>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/15 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/40 to-zinc-950/90" />
            <div className="relative grid md:grid-cols-2 gap-0">
              <div className="p-10">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-6">
                  <Briefcase className="h-3 w-3" />
                  HERU Gigs Pricing
                </span>
                <p className="text-5xl font-black text-white mb-1">Free to List</p>
                <p className="text-zinc-400 mb-6 text-base leading-relaxed">
                  No monthly subscription. No listing fees. HERU charges a 15% platform fee only on completed bookings.
                </p>
                <div className="p-4 rounded-xl bg-cyan-500/8 border border-cyan-500/15 mb-8">
                  <p className="text-cyan-400 font-bold text-sm mb-1">85% goes to you</p>
                  <p className="text-zinc-500 text-xs">For every EGP 1,000 booking, you receive EGP 850 after the platform fee.</p>
                </div>
                <Link to="/auth/provider/register"
                  className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-600/25">
                  Join Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="p-10 flex items-center border-t md:border-t-0 md:border-l border-cyan-500/10">
                <div className="w-full">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] mb-5">What is included</p>
                  <div className="space-y-3">
                    {[
                      'Professional service listing page',
                      'Public portfolio and portfolio gallery',
                      'Verified rating and review system',
                      'Marketplace discovery placement',
                      'Tournament Builder integration',
                      'Direct organizer messaging',
                      'Escrow payment protection',
                      'Income tracking dashboard',
                    ].map(f => (
                      <div key={f} className="flex items-center gap-3 text-zinc-300 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 text-center">
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xl mx-auto">
              Premium visibility features and featured placement options coming soon. All listings during the growth phase receive maximum organic visibility at no additional cost.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-5">Your next booking is waiting.</h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join the HERU Gigs marketplace and get in front of tournament organizers who need your services — with every payment secured.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth/provider/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white text-base transition-all shadow-xl shadow-cyan-600/25">
              Create Your Profile
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10">
              Platform Fees
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
