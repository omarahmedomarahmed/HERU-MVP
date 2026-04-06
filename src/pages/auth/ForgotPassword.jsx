import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'gamer';
  const isOrganizer = role === 'organizer';

  const backLink = isOrganizer ? '/auth/organizer/login' : '/auth/gamer/login';
  const roleLabel = isOrganizer ? 'Organizer' : 'Gamer';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    setError('');
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md relative z-10">
        <Link
          to={backLink}
          className={`inline-flex items-center gap-2 text-gray-400 mb-6 transition-colors ${isOrganizer ? 'hover:text-red-400' : 'hover:text-red-400'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to {roleLabel} Login</span>
        </Link>

        <FloatingPanel className="p-8" glowBorder>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${isOrganizer ? 'from-red-600/30' : 'from-red-600/30'} to-zinc-800 border ${isOrganizer ? 'border-red-500/20' : 'border-red-500/20'} flex items-center justify-center mx-auto mb-4 shadow-lg ${isOrganizer ? 'shadow-red-500/10' : 'shadow-red-500/10'}`}>
              <Mail className={`w-8 h-8 ${isOrganizer ? 'text-red-400' : 'text-red-400'}`} />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white tracking-wide">RESET PASSWORD</h1>
            <p className="text-gray-400 mt-1 text-sm">
              Enter your {roleLabel.toLowerCase()} email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-semibold">Check your email</p>
              <p className="text-gray-400 text-sm">
                If an account exists for <span className="text-white">{email}</span>, we sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                to={backLink}
                className={`inline-block text-sm mt-4 transition-colors ${isOrganizer ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-300'}`}
              >
                Back to {roleLabel} Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={`bg-zinc-800 border-zinc-700 text-white ${isOrganizer ? 'focus:border-red-500 focus:ring-red-500/20' : 'focus:border-red-500 focus:ring-red-500/20'}`}
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {isOrganizer ? (
                <GlowButton
                  type="submit"
                  variant="secondary"
                  className="w-full !border-red-500 !text-red-400 hover:!bg-red-500/10"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </GlowButton>
              ) : (
                <GlowButton type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </GlowButton>
              )}

              <p className="text-gray-500 text-xs text-center mt-4">
                Remember your password?{' '}
                <Link
                  to={backLink}
                  className={`transition-colors ${isOrganizer ? 'text-red-400 hover:text-red-300' : 'text-red-400 hover:text-red-300'}`}
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </FloatingPanel>
      </div>
    </div>
  );
}
