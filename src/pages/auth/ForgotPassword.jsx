import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import HeruLogo from '@/components/shared/HeruLogo';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle, AlertTriangle, ArrowLeft, Gamepad2, Building2, Radar, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ROLE_CONFIG = {
  gamer:     { Icon: Gamepad2,  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    btn: 'bg-red-600 hover:bg-red-500',    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=900&q=80',    label: 'Gamer',    loginPath: '/auth/gamer/login' },
  organizer: { Icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', btn: 'bg-purple-700 hover:bg-purple-600', img: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=900&q=80', label: 'Organizer', loginPath: '/auth/organizer/login' },
  sponsor:   { Icon: Radar,     color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', btn: 'bg-yellow-600 hover:bg-yellow-500 text-black font-black', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=900&q=80', label: 'Sponsor', loginPath: '/auth/sponsor/login' },
  provider:  { Icon: Briefcase, color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   btn: 'bg-cyan-600 hover:bg-cyan-500',   img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=900&q=80',  label: 'Provider',  loginPath: '/auth/provider/login' },
};

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'gamer';
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.gamer;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password?role=${role}`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ── Left Image Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden">
        <img src={cfg.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/50 to-zinc-950" />

        <div className="relative z-10 p-10">
          <Link to="/"><HeruLogo className="h-10" /></Link>
        </div>

        <div className="relative z-10 p-10">
          <div className={`w-14 h-14 rounded-2xl ${cfg.bg} ${cfg.border} border flex items-center justify-center mb-5`}>
            <cfg.Icon className={`w-7 h-7 ${cfg.color}`} />
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-3">Reset Your<br/>Password.</h2>
          <p className="text-zinc-400 text-base leading-relaxed">We'll send you a secure link to set a new password.</p>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex lg:hidden mb-8"><HeruLogo className="h-9" /></Link>

          <Link to={cfg.loginPath} className={`inline-flex items-center gap-2 ${cfg.color} hover:opacity-80 mb-8 text-sm font-medium transition-opacity`}>
            <ArrowLeft className="w-4 h-4" /> Back to {cfg.label} Login
          </Link>

          <div className="mb-8">
            <div className={`w-14 h-14 rounded-2xl ${cfg.bg} ${cfg.border} border flex items-center justify-center mb-5`}>
              <Mail className={`w-7 h-7 ${cfg.color}`} />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Forgot Password?</h1>
            <p className="text-zinc-500 text-sm">Enter your {cfg.label.toLowerCase()} email to receive a reset link</p>
          </div>

          {sent ? (
            <div className="text-center space-y-5 py-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white mb-2">Check Your Email</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  If an account exists for <span className="text-white font-semibold">{email}</span>, we've sent a password reset link. Check your inbox and spam folder.
                </p>
              </div>
              <Link to={cfg.loginPath}
                className={`inline-flex items-center gap-2 font-semibold text-sm transition-colors ${cfg.color} hover:opacity-80`}>
                <ArrowLeft className="w-4 h-4" /> Back to {cfg.label} Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Email Address</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl`}
                  required />
              </div>

              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button type="submit"
                className={`w-full flex items-center justify-center gap-2.5 ${cfg.btn} text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 h-12`}
                disabled={loading}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                ) : (
                  <><Mail className="w-4 h-4" /> Send Reset Link</>
                )}
              </button>

              <p className="text-zinc-600 text-xs text-center">
                Remember your password?{' '}
                <Link to={cfg.loginPath} className={`${cfg.color} hover:opacity-80 transition-opacity`}>Sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
