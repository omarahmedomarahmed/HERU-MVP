import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Crosshair, Circle, Zap,
  Languages, MessageSquare, ChevronUp, X,
  Phone, MapPin, Mail
} from 'lucide-react'

// ─── Arabic Translation Dictionaries ─────────────────────────────────────────
const AR_TRANSLATIONS = {
  // Navigation
  'Products': 'المنتجات',
  'Solutions': 'الحلول',
  'Sign In': 'تسجيل الدخول',
  'Get Started': 'ابدأ الآن',
  'For Gamers': 'للاعبين',
  'For Organizers': 'للمنظمين',
  'For Sponsors': 'للرعاة',
  'For Service Providers': 'لمقدمي الخدمات',
  'Pricing': 'الأسعار',
  'About': 'من نحن',
  'Contact': 'اتصل بنا',
  // Common
  'Compete': 'تنافس',
  'Build': 'ابنِ',
  'Discover': 'اكتشف',
  'Showcase': 'اعرض',
  'Learn More': 'اعرف المزيد',
  'Join Now': 'انضم الآن',
  'View All': 'عرض الكل',
}

const CURSOR_MODES = [
  { id: 'default', label: 'Default', icon: MousePointer2, class: '', desc: 'Standard cursor' },
  { id: 'crosshair', label: 'Crosshair', icon: Crosshair, class: 'cursor-crosshair-mode', desc: 'Precision aim' },
  { id: 'dot', label: 'Dot', icon: Circle, class: 'cursor-dot-mode', desc: 'Minimal dot' },
  { id: 'gaming', label: 'Gaming', icon: Zap, class: 'cursor-gaming-mode', desc: 'Custom glow' },
]

// ─── Custom Cursor Component ──────────────────────────────────────────────────
function CustomCursor({ mode }) {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 })
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    if (mode !== 'dot' && mode !== 'gaming') return
    let ring = { x: -100, y: -100 }
    let animFrame

    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      ring.x = e.clientX
      ring.y = e.clientY
    }
    const down = () => setClicked(true)
    const up = () => setClicked(false)

    const animateRing = () => {
      setRingPos(prev => ({
        x: prev.x + (ring.x - prev.x) * 0.12,
        y: prev.y + (ring.y - prev.y) * 0.12,
      }))
      animFrame = requestAnimationFrame(animateRing)
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    animFrame = requestAnimationFrame(animateRing)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
      cancelAnimationFrame(animFrame)
    }
  }, [mode])

  if (mode !== 'dot' && mode !== 'gaming') return null

  return (
    <>
      <div
        id="custom-cursor"
        className={clicked ? 'clicked' : ''}
        style={{
          left: pos.x,
          top: pos.y,
          background: mode === 'gaming' ? 'rgba(250,204,21,0.9)' : 'rgba(239,68,68,0.8)',
          boxShadow: mode === 'gaming' ? '0 0 12px rgba(250,204,21,0.6)' : undefined,
        }}
      />
      <div
        id="cursor-ring"
        style={{
          left: ringPos.x,
          top: ringPos.y,
          borderColor: mode === 'gaming' ? 'rgba(250,204,21,0.4)' : 'rgba(239,68,68,0.4)',
        }}
      />
    </>
  )
}

// ─── Main Floating Bar ────────────────────────────────────────────────────────
export default function FloatingBar() {
  const [open, setOpen] = useState(false)
  const [cursorMode, setCursorMode] = useState('default')
  const [isArabic, setIsArabic] = useState(false)
  const [showCursorMenu, setShowCursorMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const navigate = useNavigate()

  // Apply cursor class to body
  useEffect(() => {
    const body = document.body
    CURSOR_MODES.forEach(m => {
      if (m.class) body.classList.remove(m.class)
    })
    const mode = CURSOR_MODES.find(m => m.id === cursorMode)
    if (mode?.class) body.classList.add(mode.class)
  }, [cursorMode])

  // Apply Arabic RTL
  useEffect(() => {
    const html = document.documentElement
    if (isArabic) {
      html.setAttribute('dir', 'rtl')
      html.setAttribute('lang', 'ar')
      html.style.fontFamily = "'Noto Kufi Arabic', 'Tajawal', sans-serif"
    } else {
      html.setAttribute('dir', 'ltr')
      html.setAttribute('lang', 'en')
      html.style.fontFamily = ''
    }
  }, [isArabic])

  const toggleArabic = useCallback(() => {
    setIsArabic(prev => !prev)
    setShowLangMenu(false)
  }, [])

  const currentCursor = CURSOR_MODES.find(m => m.id === cursorMode)

  return (
    <>
      <CustomCursor mode={cursorMode} />

      {/* Floating Bar */}
      <div className="floating-bar">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col gap-2 mb-1"
            >
              {/* Language Toggle */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowLangMenu(p => !p); setShowCursorMenu(false) }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-200 border ${
                    isArabic
                      ? 'bg-yellow-500 border-yellow-400 text-black'
                      : 'bg-zinc-800/95 border-zinc-600/50 text-yellow-400 hover:bg-zinc-700'
                  }`}
                  title={isArabic ? 'Switch to English' : 'Switch to Arabic'}
                >
                  <Languages className="h-5 w-5" />
                </motion.button>
                {isArabic && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-zinc-900 animate-pulse" />
                )}
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-14 bottom-0 bg-zinc-800/95 backdrop-blur-xl border border-zinc-600/50 rounded-2xl p-3 shadow-2xl min-w-[180px]"
                    >
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 px-1">Language</p>
                      <button
                        onClick={() => { setIsArabic(false); setShowLangMenu(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${!isArabic ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        <span className="text-lg">🇬🇧</span> English
                        {!isArabic && <span className="ml-auto text-green-400 text-xs">Active</span>}
                      </button>
                      <button
                        onClick={() => { setIsArabic(true); setShowLangMenu(false) }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isArabic ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                      >
                        <span className="text-lg">🇪🇬</span> العربية
                        {isArabic && <span className="ml-auto text-yellow-400 text-xs">نشط</span>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Us */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/contact')}
                className="w-12 h-12 rounded-2xl bg-zinc-800/95 border border-zinc-600/50 flex items-center justify-center text-green-400 hover:bg-zinc-700 shadow-xl transition-all duration-200"
                title="Contact Us"
              >
                <MessageSquare className="h-5 w-5" />
              </motion.button>

              {/* Cursor Mode */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setShowCursorMenu(p => !p); setShowLangMenu(false) }}
                  className="w-12 h-12 rounded-2xl bg-zinc-800/95 border border-zinc-600/50 flex items-center justify-center text-red-400 hover:bg-zinc-700 shadow-xl transition-all duration-200"
                  title="Change Cursor"
                >
                  {currentCursor && <currentCursor.icon className="h-5 w-5" />}
                </motion.button>
                <AnimatePresence>
                  {showCursorMenu && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="absolute right-14 bottom-0 bg-zinc-800/95 backdrop-blur-xl border border-zinc-600/50 rounded-2xl p-3 shadow-2xl min-w-[200px]"
                    >
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 px-1">Cursor Style</p>
                      {CURSOR_MODES.map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => { setCursorMode(mode.id); setShowCursorMenu(false) }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            cursorMode === mode.id ? 'bg-red-500/20 text-red-400' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <mode.icon className="h-4 w-4 shrink-0" />
                          <div className="text-left">
                            <div className="font-semibold">{mode.label}</div>
                            <div className="text-[10px] opacity-60">{mode.desc}</div>
                          </div>
                          {cursorMode === mode.id && <span className="ml-auto text-red-400">●</span>}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setOpen(p => !p); setShowCursorMenu(false); setShowLangMenu(false) }}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 border ${
            open
              ? 'bg-red-600 border-red-500 text-white rotate-180'
              : 'bg-zinc-900/95 border-zinc-600/60 text-white hover:bg-zinc-800'
          }`}
          style={{ boxShadow: open ? '0 0 20px rgba(239,68,68,0.4)' : '0 4px 20px rgba(0,0,0,0.5)' }}
        >
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
            {open ? <X className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          </motion.div>
        </motion.button>

        {/* Arabic indicator badge */}
        {isArabic && !open && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
          >
            <span className="text-[8px] font-black text-black">ع</span>
          </motion.div>
        )}
      </div>
    </>
  )
}
