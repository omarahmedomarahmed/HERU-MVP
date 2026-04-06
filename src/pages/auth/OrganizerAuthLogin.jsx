import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Building2, ArrowLeft, Eye, EyeOff, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function OrganizerAuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, role, loading: authLoading } = useAuth();

  // Auto-redirect if already authenticated as organizer
  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'organizer') {
      navigate('/organizer/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { profile } = await login(email, password);
      if (profile?.role !== 'organizer') {
        // Wrong role — sign them out so they aren't stuck in a bad state
        await logout();
        setError(
          profile?.role === 'gamer'
            ? 'This account is registered as a gamer. Please use the gamer login.'
            : 'This account does not have organizer access.'
        );
        setLoading(false);
        return;
      }
      navigate('/organizer/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <FloatingPanel className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-zinc-800 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/10">
              <Building2 className="w-8 h-8 text-indigo-400" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white tracking-wide">ORGANIZER LOGIN</h1>
            <p className="text-gray-400 mt-1 text-sm">Sign in to your organizer account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brand@email.com"
                className="bg-zinc-800 border-zinc-700 text-white focus:border-indigo-500 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-zinc-800 border-zinc-700 text-white pr-10 focus:border-indigo-500 focus:ring-indigo-500/20"
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

            <div className="text-right">
              <Link to="/auth/forgot-password?role=organizer" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <GlowButton
              type="submit"
              variant="secondary"
              className="w-full !border-indigo-500 !text-indigo-400 hover:!bg-indigo-500/10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-300/30 border-t-indigo-300 rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </GlowButton>
          </form>

          <div className="border-t border-zinc-700/50 pt-5 mt-6 space-y-3 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/auth/organizer/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
            <p className="text-gray-600 text-xs">
              Are you a gamer?{' '}
              <Link to="/auth/gamer/login" className="text-red-400 hover:text-red-300 transition-colors">
                Login here
              </Link>
            </p>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}
