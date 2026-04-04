import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
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
      setTimeout(() => navigate('/auth', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <Link to="/auth" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>

        <FloatingPanel className="p-8" glowBorder>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white">SET NEW PASSWORD</h1>
            <p className="text-gray-400 mt-1 text-sm">Choose a strong password for your account</p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-white font-semibold">Password updated!</p>
              <p className="text-gray-400 text-sm">Redirecting you to login...</p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
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
                    placeholder="••••••••"
                    className="bg-zinc-800 border-zinc-700 text-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
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
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <GlowButton type="submit" className="w-full" disabled={loading}>
                <Lock className="w-4 h-4" />
                {loading ? 'Updating...' : 'Update Password'}
              </GlowButton>
            </form>
          )}
        </FloatingPanel>
      </div>
    </div>
  );
}
