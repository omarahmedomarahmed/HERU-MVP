import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeruLogo from '@/components/shared/HeruLogo';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Gamepad2, CheckCircle, UserPlus, AlertTriangle, Trophy, Star, Zap } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const SIDE_IMG = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=900&q=80';

const PERKS = [
  '100% free — no credit card',
  'Join 500+ tournaments',
  'Build your esports team',
  'Climb the MENA leaderboard',
];

export default function GamerAuthRegister() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'gamer') {
      navigate('/gamer/home', { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (form.username.trim().length < 3) { setError('Username must be at least 3 characters'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const result = await register(form.email, form.password, 'gamer', { full_name: form.username.trim() });
      if (result.needsSignIn) {
        setSuccess(true);
        setTimeout(() => navigate('/auth/gamer/login', { replace: true }), 2000);
      } else {
        navigate('/gamer/home', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-12 rounded-3xl bg-zinc-900 border border-zinc-800">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Account Created!</h2>
          <p className="text-zinc-400 mb-8">Redirecting you to sign in...</p>
          <div className="p-5 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl text-left">
            <p className="text-yellow-400 font-bold text-sm mb-2">⚔ Connect Your Riot Account</p>
            <p className="text-zinc-400 text-xs mb-4">Link your League of Legends or Valorant account to show your rank and compete in HERU tournaments.</p>
            <Link to="/gamer/profile?tab=connect"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-300 text-xs font-bold rounded-xl transition-colors">
              Link Riot Account →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden">
        <img src={SIDE_IMG} alt="HERU ARENA" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/85 via-zinc-950/75 to-zinc-950/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950" />

        <div className="relative z-10 p-10 flex flex-col h-full">
          <Link to="/" className="mb-8"><HeruLogo className="h-10" /></Link>

          <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-[0.15em] w-fit">
            <Gamepad2 className="w-3.5 h-3.5" /> HERU Arena
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">Join MENA's esports ecosystem. Free forever.</h2>
          <div className="space-y-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-red-400" />
                </div>
                <span className="text-zinc-300 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex lg:hidden mb-8"><HeruLogo className="h-9" /></Link>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
              <Gamepad2 className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Create Gamer Account</h1>
            <p className="text-zinc-500 text-sm">Join the HERU ARENA community for free</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Username / Gamertag</label>
              <Input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Choose your gamertag"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-red-500 focus:ring-red-500/20 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Email</label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="gamer@email.com"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-red-500 focus:ring-red-500/20 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="bg-zinc-900 border-zinc-800 text-white pr-12 focus:border-red-500 focus:ring-red-500/20 h-12 rounded-xl" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Confirm Password</label>
              <Input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-red-500 focus:ring-red-500/20 h-12 rounded-xl" required />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 h-12"
              disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Gamer Account</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-center">
            <p className="text-zinc-500 text-sm">
              Already registered?{' '}
              <Link to="/auth/gamer/login" className="text-red-400 hover:text-red-300 font-semibold transition-colors">Sign in</Link>
            </p>
            <p className="text-zinc-600 text-xs">
              Not a gamer?{' '}
              <Link to="/auth" className="text-zinc-500 hover:text-white transition-colors">Choose your role</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
