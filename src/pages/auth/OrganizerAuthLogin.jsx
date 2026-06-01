import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeruLogo from '@/components/shared/HeruLogo';
import { Input } from '@/components/ui/input';
import { Building2, Eye, EyeOff, LogIn, AlertTriangle, Trophy, DollarSign, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const SIDE_IMG = 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=900&q=80';

const BULLETS = [
  { icon: Trophy,    text: 'Build funded tournaments' },
  { icon: DollarSign, text: '85% sponsorship income' },
  { icon: Users,     text: 'Full tournament CRM' },
];

export default function OrganizerAuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'organizer') {
      navigate('/organizer/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true); setError('');
    try {
      const { profile } = await login(email, password);
      if (profile?.role !== 'organizer') {
        await logout();
        setError(profile?.role === 'gamer'
          ? 'This account is a gamer account. Use the gamer login.'
          : 'This account does not have organizer access.');
        setLoading(false); return;
      }
      navigate('/organizer/dashboard', { replace: true });
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
        <img src={SIDE_IMG} alt="HERU BUILDER" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-zinc-950/70 to-zinc-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        <div className="relative z-10 p-10">
          <Link to="/"><HeruLogo className="h-10" /></Link>
        </div>

        <div className="relative z-10 p-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5" /> HERU BUILDER
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">Build Events.<br/>Get Funded.</h2>
          <p className="text-zinc-400 text-base leading-relaxed mb-6">The most powerful tournament platform in MENA.</p>
          <div className="space-y-3">
            {BULLETS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-purple-400" />
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
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
              <Building2 className="w-7 h-7 text-purple-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Organizer Login</h1>
            <p className="text-zinc-500 text-sm">Sign in to your HERU BUILDER account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="brand@email.com"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-zinc-900 border-zinc-800 text-white pr-12 focus:border-purple-500 focus:ring-purple-500/20 h-12 rounded-xl" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-right -mt-2">
              <Link to="/auth/forgot-password?role=organizer" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-purple-500/8 border border-purple-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                <p className="text-purple-300 text-sm">{error}</p>
              </div>
            )}

            <button type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-purple-700 hover:bg-purple-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-700/20 disabled:opacity-50 h-12"
              disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-center">
            <p className="text-zinc-500 text-sm">
              Don't have an account?{' '}
              <Link to="/auth/organizer/register" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Create Account</Link>
            </p>
            <p className="text-zinc-600 text-xs">
              Not an organizer?{' '}
              <Link to="/auth" className="text-zinc-500 hover:text-white transition-colors">Choose your role</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
