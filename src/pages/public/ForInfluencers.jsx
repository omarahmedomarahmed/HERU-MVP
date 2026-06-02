import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  Star, TrendingUp, Users, DollarSign, Video, Radio, Globe, Zap,
  ChevronRight, ArrowRight, Play, Heart, Eye, MessageCircle,
  Camera, Mic, Monitor, Award, Shield, BarChart3, Sparkles,
  Instagram, Youtube, Twitch, CheckCircle2, Target, Rocket
} from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1920&q=80'
const SEC2_BG = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80'
const SEC3_BG = 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1920&q=80'
const SEC4_BG = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&q=80'
const SEC5_BG = 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1920&q=80'

const STATS = [
  { value: '25K+', label: 'Active Gamers', Icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { value: '500+', label: 'Events Run', Icon: Radio, color: 'text-red-400', bg: 'bg-red-500/10' },
  { value: 'EGP 2M+', label: 'Deals Activated', Icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: '6', label: 'MENA Countries', Icon: Globe, color: 'text-blue-400', bg: 'bg-blue-500/10' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    Icon: Camera,
    title: 'Build Your Profile',
    desc: 'Create a verified influencer profile on HERU — showcase your channels, audience stats, content niche, and past brand collaborations.',
    color: 'text-yellow-400',
    dot: 'bg-yellow-500',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
  {
    step: '02',
    Icon: Target,
    title: 'Get Discovered by Brands',
    desc: 'Sponsors and tournament organizers use HERU Radar to find content creators. Your verified profile surfaces you to brands actively looking to activate.',
    color: 'text-red-400',
    dot: 'bg-red-500',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
  {
    step: '03',
    Icon: DollarSign,
    title: 'Accept Bookings & Get Paid',
    desc: 'Receive direct booking requests from sponsors and organizers. All payments go through HERU escrow — you get paid on delivery, every time.',
    color: 'text-green-400',
    dot: 'bg-green-500',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    step: '04',
    Icon: BarChart3,
    title: 'Track Your Growth',
    desc: 'Real-time analytics on your profile views, booking requests, and earnings. Watch your influence turn into a sustainable income stream.',
    color: 'text-blue-400',
    dot: 'bg-blue-500',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
]

const CONTENT_TYPES = [
  { Icon: Youtube, label: 'YouTube', desc: 'Gaming content, reviews, tournament coverage', color: 'text-red-500', bg: 'bg-red-500/10' },
  { Icon: Monitor, label: 'Twitch', desc: 'Live streaming, tournament broadcasts', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { Icon: Instagram, label: 'Instagram', desc: 'Visual content, stories, reels for gaming', color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { Icon: Mic, label: 'Podcast / Audio', desc: 'Gaming talk shows, esports analysis', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { Icon: Video, label: 'Short-Form Video', desc: 'TikTok, Reels, Shorts', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { Icon: Radio, label: 'Commentary', desc: 'Live event casting and analysis', color: 'text-green-400', bg: 'bg-green-500/10' },
]

const BENEFITS = [
  { Icon: Shield, title: 'Escrow-Protected Payments', desc: 'Every brand deal paid via HERU escrow. Funds released when you deliver.', color: 'text-green-400' },
  { Icon: Globe, title: 'MENA-Wide Visibility', desc: 'Appear in front of brands across Egypt, Saudi Arabia, UAE, and more.', color: 'text-blue-400' },
  { Icon: Rocket, title: 'Zero Platform Ads', desc: 'We never compete with you. No promoted posts, no algorithm barriers.', color: 'text-purple-400' },
  { Icon: Sparkles, title: 'Verified Creator Badge', desc: 'Get verified to unlock premium sponsorship opportunities and higher rates.', color: 'text-yellow-400' },
  { Icon: BarChart3, title: 'Performance Analytics', desc: 'See exactly how brands find you and what converts into bookings.', color: 'text-red-400' },
  { Icon: Award, title: 'HERU Tier System', desc: 'As you grow, unlock Bronze → Silver → Gold → Diamond creator tiers.', color: 'text-cyan-400' },
]

const SUCCESS_STORIES = [
  {
    name: 'Layla H.',
    role: 'Gaming Content Creator, Cairo',
    story: 'I went from 0 brand deals to 8 bookings in my first 60 days on HERU. The escrow system was the only reason brands trusted me — and I trusted them.',
    stat: '8 deals in 60 days',
    avatar: 'LH',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    channel: 'YouTube / TikTok',
    subs: '45K followers',
  },
  {
    name: 'Khaled R.',
    role: 'Twitch Streamer & Caster, Alexandria',
    story: 'HERU Radar connected me to three tournament organizers in one week. I now do live commentary for 4 major events per month — all through HERU bookings.',
    stat: '4 events / month',
    avatar: 'KR',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    channel: 'Twitch / YouTube',
    subs: '28K followers',
  },
  {
    name: 'Nour A.',
    role: 'Esports Journalist & Influencer, Dubai',
    story: 'As a verified creator on HERU, brands come to me now. I\'ve done campaigns for three gaming hardware companies this quarter alone, all managed through the platform.',
    stat: '3 brand campaigns / quarter',
    avatar: 'NA',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    channel: 'Instagram / YouTube',
    subs: '82K followers',
  },
]

const CREATOR_TIERS = [
  { tier: 'Bronze', followers: '1K – 10K', perks: 'Profile listing, direct booking, escrow payments', color: 'text-orange-600', bg: 'bg-orange-600/10', border: 'border-orange-600/20' },
  { tier: 'Silver', followers: '10K – 50K', perks: 'Featured in search, brand match alerts, priority support', color: 'text-zinc-300', bg: 'bg-zinc-300/10', border: 'border-zinc-300/20' },
  { tier: 'Gold', followers: '50K – 200K', perks: 'Promoted to brands, managed campaign options, higher rates', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
  { tier: 'Diamond', followers: '200K+', perks: 'Featured on homepage, dedicated account manager, premium deals', color: 'text-blue-300', bg: 'bg-blue-300/10', border: 'border-blue-300/20' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.55, delay: i * 0.09 } }),
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-6">
      {children}
    </span>
  )
}

export default function ForInfluencers() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/70 to-zinc-950" />
        </div>
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[500px] rounded-full bg-yellow-500/8 blur-[200px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] rounded-full bg-red-600/8 blur-[180px] pointer-events-none" />

        {/* Floating stats */}
        <div className="absolute top-32 right-8 lg:right-16 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-yellow-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-xs text-zinc-500">Monthly Reach</p>
                <p className="text-lg font-black text-white">2.4M+</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-40 right-8 lg:right-20 hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
            className="p-4 rounded-2xl bg-zinc-900/80 border border-green-500/20 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-xs text-zinc-500">Avg Deal Value</p>
                <p className="text-lg font-black text-white">EGP 8K+</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <SectionLabel><Star className="h-3 w-3" /> For Influencers & Creators</SectionLabel>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.0] mb-8 max-w-5xl"
          >
            Your influence is{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              your currency.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12"
          >
            HERU connects gaming content creators and influencers directly with esports brands and tournament organizers across MENA. Build your profile, get discovered, and turn your audience into a business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/auth/provider/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black text-base transition-all shadow-xl shadow-yellow-500/25 hover:shadow-yellow-400/30 hover:-translate-y-1"
            >
              <Sparkles className="h-5 w-5" />
              Join as Creator
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/coaches"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/8 hover:bg-white/12 text-white text-base transition-all border border-white/10"
            >
              <Play className="h-4 w-4" />
              Browse Creators
            </Link>
          </motion.div>

          {/* Floating content type badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-2 mt-12"
          >
            {['YouTube', 'Twitch', 'Instagram', 'TikTok', 'Podcasts', 'Live Commentary'].map((tag, i) => (
              <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-zinc-400">
                {tag}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SEC2_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-zinc-950/90" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, Icon, color, bg }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="text-center p-6 rounded-2xl bg-zinc-900/60 border border-white/8"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-4xl font-black text-white mb-1">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SEC3_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel><Zap className="h-3 w-3" /> How It Works</SectionLabel>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              From creator to paid professional in{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">four steps.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-yellow-500 via-red-500 to-blue-500 opacity-20 hidden lg:block" />

            <div className="space-y-6">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  custom={i} variants={fadeUp}
                  className={`relative flex gap-6 p-6 rounded-2xl border ${step.border} ${step.bg} group hover:border-opacity-50 transition-all duration-300`}
                >
                  <div className={`absolute left-[calc(2rem-1px)] top-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${step.dot} hidden lg:block -ml-16`} />
                  <div className={`w-14 h-14 rounded-2xl bg-zinc-900/80 border ${step.border} flex items-center justify-center shrink-0 ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                    <step.Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-black ${step.color} opacity-60`}>{step.step}</span>
                      <h3 className="font-black text-white text-lg">{step.title}</h3>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${step.color} shrink-0 mt-3 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONTENT TYPES ─────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={SEC4_BG} alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/90 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Camera className="h-3 w-3" /> Content Types</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Every content format. One platform.</h2>
            <p className="text-zinc-400 text-base max-w-xl mx-auto">HERU supports creators across all major gaming content formats.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {CONTENT_TYPES.map(({ Icon, label, desc, color, bg }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-white/8 hover:border-white/15 transition-all group card-hover"
              >
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1">{label}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CREATOR TIERS ─────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute inset-0">
          <img src={SEC5_BG} alt="" className="w-full h-full object-cover opacity-8" />
          <div className="absolute inset-0 bg-zinc-950/93" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Award className="h-3 w-3" /> Creator Tiers</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Grow your tier. Unlock better deals.</h2>
            <p className="text-zinc-400 text-base max-w-xl mx-auto">The bigger your audience, the more powerful your HERU profile becomes.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CREATOR_TIERS.map(({ tier, followers, perks, color, bg, border }, i) => (
              <motion.div
                key={tier}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className={`p-6 rounded-2xl bg-zinc-900/70 border ${border} group hover:scale-105 transition-all duration-300 card-hover`}
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Award className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className={`font-black text-lg mb-1 ${color}`}>{tier}</h3>
                <p className="text-xs text-zinc-500 mb-4">{followers} followers</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{perks}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><CheckCircle2 className="h-3 w-3" /> Platform Benefits</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Built for creators, not algorithms.</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map(({ Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/12 transition-all group"
              >
                <Icon className={`h-6 w-6 mb-3 ${color} group-hover:scale-110 transition-transform`} />
                <h3 className="font-bold text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUCCESS STORIES ───────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] rounded-full bg-yellow-600/5 blur-[180px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel><Heart className="h-3 w-3" /> Success Stories</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Creators already winning on HERU.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {SUCCESS_STORIES.map(({ name, role, story, stat, avatar, color, bg, channel, subs }, i) => (
              <motion.div
                key={name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-zinc-900/70 border border-white/8 hover:border-white/15 transition-all card-hover flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center`}>
                    <span className={`text-sm font-black ${color}`}>{avatar}</span>
                  </div>
                  <div>
                    <p className="font-black text-white text-sm">{name}</p>
                    <p className="text-xs text-zinc-500">{role}</p>
                  </div>
                </div>
                <blockquote className="text-sm text-zinc-400 leading-relaxed flex-1 mb-4 italic">
                  "{story}"
                </blockquote>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xs text-zinc-600">{channel}</p>
                    <p className="text-xs text-zinc-500">{subs}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg ${bg} border border-white/5`}>
                    <p className={`text-xs font-bold ${color}`}>{stat}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-950/10 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-yellow-500/6 blur-[200px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="w-20 h-20 rounded-3xl bg-yellow-500/20 flex items-center justify-center mx-auto mb-8">
              <Star className="h-10 w-10 text-yellow-400" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to monetize your{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">influence?</span>
            </h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
              Join HERU as a gaming creator and start connecting with brands and tournament organizers across MENA today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/auth/provider/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black text-base transition-all shadow-xl shadow-yellow-500/30 hover:-translate-y-1"
              >
                <Sparkles className="h-5 w-5" />
                Create My Profile
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/influencers"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold bg-white/6 hover:bg-white/10 text-white text-base transition-all border border-white/10"
              >
                Browse Creators
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
