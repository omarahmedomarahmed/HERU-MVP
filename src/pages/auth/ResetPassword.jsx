import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'gamer';
  const isOrganizer = role === 'organizer';

  const loginLink = isOrganizer ? '/auth/organizer/login' : '/auth/gamer/login';
  const roleLabel = isOrganizer ? 'Organizer' : 'Gamer';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase sets the session automatically from the recovery link hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true);
      }
    });

    // Also check if user is already authenticated (link already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      // Sign out after password update so user can log in fresh with new password
      await supabase.auth.signOut();
      setTimeout(() => navigate(loginLink, { replace: true }), 2000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md relative z-10">
        <Link
          to={loginLink}
          className={`inline-flex items-center gap-2 text-gray-400 mb-6 transition-colors ${isOrganizer ? 'hover:text-red-400' : 'hover:text-red-400'}`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to {roleLabel} Login</span>
        </Link>

        <FloatingPanel className="p-8" glowBorder>
          <div className="text-center mb-8">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${isOrganizer ? 'from-red-600/30' : 'from-red-600/30'} to-zinc-800 border ${isOrganizer ? 'border-red-500/20' : 'border-red-500/20'} flex items-center justify-center mx-auto mb-4 shadow-lg ${isOrganizer ? 'shadow-red-500/10' : 'shadow-red-500/10'}`}>
              <Lock className={`w-8 h-8 ${isOrganizer ? 'text-red-400' : 'text-red-400'}`} />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white tracking-wide">SET NEW PASSWORD</h1>
            <p className="text-gray-400 mt-1 text-sm">Choose a strong password for your {roleLabel.toLowerCase()} account</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-semibold">Password updated!</p>
              <p className="text-gray-400 text-sm">Redirecting to {roleLabel.toLowerCase()} login...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              <div className={`w-10 h-10 border-3 rounded-full animate-spin mx-auto ${isOrganizer ? 'border-red-500/20 border-t-red-400' : 'border-red-500/20 border-t-red-400'}`} />
              <p className="text-gray-400 text-sm">Loading your recovery session...</p>
              <p className="text-gray-500 text-xs">If this takes too long, try clicking the reset link in your email again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1.5">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={`bg-zinc-800 border-zinc-700 text-white pr-10 ${isOrganizer ? 'focus:border-red-500 focus:ring-red-500/20' : 'focus:border-red-500 focus:ring-red-500/20'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1.5">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </GlowButton>
              ) : (
                <GlowButton type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </GlowButton>
              )}
            </form>
          )}
        </FloatingPanel>
      </div>
    </div>
  );
}
