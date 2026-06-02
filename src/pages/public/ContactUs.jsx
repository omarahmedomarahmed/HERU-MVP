import { useState } from 'react'
import { motion } from 'framer-motion'
import PublicNav from '@/components/public/PublicNav'
import PublicFooter from '@/components/public/PublicFooter'
import {
  MapPin, Phone, Mail, Send, CheckCircle2, ChevronDown,
  MessageSquare, Clock, Globe, Building2, Radar, Briefcase, Gamepad2,
  ArrowRight, Headphones, Users, Trophy
} from 'lucide-react'

const HERO_BG = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
const MAP_BG = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80'

const PRODUCTS = [
  { id: 'arena', label: 'HERU Arena', desc: 'For Gamers', color: 'text-red-400', dot: 'bg-red-500' },
  { id: 'builder', label: 'HERU Builder', desc: 'For Organizers', color: 'text-purple-400', dot: 'bg-purple-500' },
  { id: 'radar', label: 'HERU Radar', desc: 'For Sponsors & Brands', color: 'text-yellow-400', dot: 'bg-yellow-500' },
  { id: 'gigs', label: 'HERU Gigs', desc: 'For Service Providers', color: 'text-cyan-400', dot: 'bg-cyan-500' },
  { id: 'general', label: 'General Inquiry', desc: 'Other topics', color: 'text-zinc-400', dot: 'bg-zinc-500' },
]

const CONTACT_INFO = [
  {
    Icon: MapPin,
    label: 'Office Address',
    value: '171 Tahrir St, The Greek Campus',
    sub: 'Cairo, Egypt',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    Icon: Phone,
    label: 'Phone',
    value: '+20 2 HERU-GGG',
    sub: 'Sun–Thu, 9am–6pm EET',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    Icon: Mail,
    label: 'Email',
    value: 'hello@heru.gg',
    sub: 'We reply within 24 hours',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    Icon: Clock,
    label: 'Business Hours',
    value: 'Sun – Thu',
    sub: '9:00 AM – 6:00 PM EET',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
]

const SUPPORT_TYPES = [
  { Icon: Headphones, label: 'Technical Support', desc: 'Platform issues, bugs, and account problems', color: 'text-blue-400' },
  { Icon: Users, label: 'Partnership Inquiries', desc: 'Brand deals, sponsorships, and collaboration', color: 'text-purple-400' },
  { Icon: Trophy, label: 'Tournament Support', desc: 'Event planning, setup, and operations help', color: 'text-yellow-400' },
  { Icon: MessageSquare, label: 'General Questions', desc: 'Pricing, features, and platform guidance', color: 'text-green-400' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
}

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '', email: '', company: '', product: '', subject: '', message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.product) e.product = 'Please select a product'
    if (!form.message.trim()) e.message = 'Message is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <PublicNav />

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/80 to-zinc-950" />
        </div>
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[400px] rounded-full bg-red-600/8 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-purple-600/6 blur-[150px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2 rounded-full border border-white/8 bg-white/3 mb-7">
              <MessageSquare className="h-3 w-3" />
              Contact HERU
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] mb-7 max-w-4xl"
          >
            Let's build{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              something together.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl leading-relaxed"
          >
            Whether you're a gamer, organizer, brand, or service provider — our team is here to help you get started on HERU.
          </motion.p>
        </div>
      </section>

      {/* ─── Contact Cards ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 -mt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map(({ Icon, label, value, sub, color, bg }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-6 rounded-2xl bg-zinc-900/80 border border-white/8 hover:border-white/15 transition-all duration-300 group card-hover"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
                <p className="text-white font-bold text-sm mb-1">{value}</p>
                <p className="text-xs text-zinc-500">{sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Support Types ─────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {SUPPORT_TYPES.map(({ Icon, label, desc, color }, i) => (
              <motion.div
                key={label}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                custom={i} variants={fadeUp}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/12 transition-all"
              >
                <Icon className={`h-6 w-6 mb-3 ${color}`} />
                <h3 className="font-bold text-sm text-white mb-1">{label}</h3>
                <p className="text-xs text-zinc-500">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Main Content: Form + Map ──────────────────────────────────── */}
      <section className="py-8 px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
            >
              <div className="p-8 rounded-3xl bg-zinc-900/80 border border-white/10 backdrop-blur-sm">
                <h2 className="text-2xl font-black text-white mb-2">Send us a message</h2>
                <p className="text-zinc-500 text-sm mb-8">Fill out the form and we'll get back to you within 24 hours.</p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Message Sent!</h3>
                    <p className="text-zinc-400 text-sm">We'll be in touch within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name:'', email:'', company:'', product:'', subject:'', message:'' }) }}
                      className="mt-6 text-sm text-red-400 hover:text-red-300 underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Ahmed Mohamed"
                          className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 transition-all ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500'}`}
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email *</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="ahmed@company.com"
                          className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500'}`}
                        />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Company / Organization</label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Your company or team name"
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Product / Topic *</label>
                      <div className="relative">
                        <select
                          value={form.product}
                          onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
                          className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 transition-all appearance-none ${errors.product ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500'} ${!form.product ? 'text-zinc-600' : 'text-white'}`}
                        >
                          <option value="" className="bg-zinc-900">Select a product...</option>
                          {PRODUCTS.map(p => (
                            <option key={p.id} value={p.id} className="bg-zinc-900">{p.label} — {p.desc}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                      </div>
                      {errors.product && <p className="text-xs text-red-400 mt-1">{errors.product}</p>}
                    </div>

                    {form.product && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-wrap gap-2"
                      >
                        {PRODUCTS.find(p => p.id === form.product) && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8">
                            <span className={`h-2 w-2 rounded-full ${PRODUCTS.find(p => p.id === form.product)?.dot}`} />
                            <span className={`text-xs font-bold ${PRODUCTS.find(p => p.id === form.product)?.color}`}>
                              {PRODUCTS.find(p => p.id === form.product)?.label}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Subject</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Brief subject line"
                        className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        className={`w-full bg-zinc-800/80 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 transition-all resize-none ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500'}`}
                      />
                      {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-red-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Map + Location Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              {/* Map Card */}
              <div className="rounded-3xl overflow-hidden border border-white/10 relative h-72 lg:h-80">
                <img src={MAP_BG} alt="Cairo Map" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-red-600/50 animate-pulse-glow">
                      <MapPin className="h-7 w-7 text-white" />
                    </div>
                    <p className="font-black text-white text-lg">HERU HQ</p>
                    <p className="text-zinc-300 text-sm">171 Tahrir St, The Greek Campus</p>
                    <p className="text-zinc-400 text-xs">Cairo, Egypt</p>
                  </div>
                </div>
                {/* Google Maps Link */}
                <a
                  href="https://maps.google.com/?q=The+Greek+Campus,+171+Tahrir+Street,+Cairo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 rounded-xl border border-white/10 text-sm text-white hover:bg-zinc-800 transition-all"
                >
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  Open in Maps
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              {/* Address Card */}
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-white mb-1">HERU Headquarters</h3>
                    <p className="text-zinc-400 text-sm">The Greek Campus, Cairo</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">171 Tahrir Street</p>
                      <p className="text-xs text-zinc-500">The Greek Campus, Cairo, Egypt</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">hello@heru.gg</p>
                      <p className="text-xs text-zinc-500">General inquiries & support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">+20 2 HERU-GGG</p>
                      <p className="text-xs text-zinc-500">Sunday–Thursday, 9AM–6PM EET</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-white/10">
                <h3 className="font-bold text-sm text-zinc-400 mb-4 uppercase tracking-wider">Quick Links</h3>
                <div className="space-y-2">
                  {[
                    { label: 'HERU Arena — For Gamers', href: '/for-gamers', Icon: Gamepad2, color: 'text-red-400' },
                    { label: 'HERU Builder — For Organizers', href: '/for-organizers', Icon: Building2, color: 'text-purple-400' },
                    { label: 'HERU Radar — For Brands', href: '/for-sponsors', Icon: Radar, color: 'text-yellow-400' },
                    { label: 'HERU Gigs — For Providers', href: '/for-providers', Icon: Briefcase, color: 'text-cyan-400' },
                  ].map(({ label, href, Icon, color }) => (
                    <a
                      key={href}
                      href={href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                    >
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-zinc-400 ml-auto transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
