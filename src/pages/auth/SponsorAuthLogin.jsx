import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeruLogo from '@/components/shared/HeruLogo';
import { Input } from '@/components/ui/input';
import { Radar, Eye, EyeOff, LogIn, AlertTriangle, BarChart3, Globe, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const SIDE_IMG = 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80';

const BULLETS = [
  { icon: Radar,    text: 'Browse live sponsorship packages' },
  { icon: BarChart3, text: 'Track ROI after every event' },
  { icon: Globe,    text: 'Reach 25,000+ MENA gamers' },
];

export default function SponsorAuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'sponsor') {
      navigate('/sponsor/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true); setError('');
    try {
      const { profile } = await login(email, password);
      if (profile?.role !== 'sponsor') {
        await logout();
        setError('This account does not have sponsor access. Please use the correct login.');
        setLoading(false); return;
      }
      navigate('/sponsor/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ── Left Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden">
        <img src={SIDE_IMG} alt="HERU RADAR" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/80 via-zinc-950/70 to-zinc-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        <div className="relative z-10 p-10">
          <Link to="/"><HeruLogo className="h-10" /></Link>
        </div>

        <div className="relative z-10 p-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Radar className="w-3.5 h-3.5" /> HERU RADAR
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">Sponsor Esports.<br/>Measure Everything.</h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-6">Real ROI data on every sponsorship you make.</p>
          <div className="space-y-3">
            {BULLETS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-zinc-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex lg:hidden mb-8"><HeruLogo className="h-9" /></Link>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-5">
              <Radar className="w-7 h-7 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Sponsor Login</h1>
            <p className="text-zinc-500 text-sm">Sign in to your HERU RADAR account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="brand@company.com"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-yellow-500 focus:ring-yellow-500/20 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-zinc-900 border-zinc-800 text-white pr-12 focus:border-yellow-500 focus:ring-yellow-500/20 h-12 rounded-xl" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-2">
              <Link to="/auth/forgot-password?role=sponsor" className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-yellow-300 text-sm">{error}</p>
              </div>
            )}

            <button type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-black py-3.5 rounded-xl transition-all shadow-lg shadow-yellow-600/20 disabled:opacity-50 h-12"
              disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-center">
            <p className="text-zinc-500 text-sm">
              Don't have an account?{' '}
              <Link to="/auth/sponsor/register" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">Create Account</Link>
            </p>
            <p className="text-zinc-600 text-xs">
              Not a sponsor?{' '}
              <Link to="/auth" className="text-zinc-500 hover:text-white transition-colors">Choose your role</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
