import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Building2, ArrowLeft, CheckCircle, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function OrganizerAuthRegister() {
  const [form, setForm] = useState({ brandName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated, role, loading: authLoading } = useAuth();

  // Auto-redirect if already authenticated as organizer
  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'organizer') {
      navigate('/organizer/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.brandName || !form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.brandName.trim().length < 2) {
      setError('Brand name must be at least 2 characters');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await register(form.email, form.password, 'organizer', { full_name: form.brandName.trim() });
      if (result.needsSignIn) {
        setSuccess(true);
        setTimeout(() => navigate('/auth/organizer/login', { replace: true }), 2000);
      } else {
        navigate('/organizer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        <FloatingPanel className="p-8 max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Account Created!</h2>
          <p className="text-gray-400">Redirecting to sign in...</p>
        </FloatingPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <AnimatedBackground />
      <div className="w-full max-w-md relative z-10">
        <Link to="/auth/organizer/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <FloatingPanel className="p-8">
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 border border-red-500/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/10">
              <Building2 className="w-8 h-8 text-red-400" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white tracking-wide">REGISTER AS ORGANIZER</h1>
            <p className="text-gray-400 mt-1 text-sm">Set up your brand on HERU</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Brand / Organization Name</label>
              <Input
                type="text"
                value={form.brandName}
                onChange={e => setForm({ ...form, brandName: e.target.value })}
                placeholder="Your brand or org name"
                className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500/20"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="brand@email.com"
                className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500/20"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="bg-zinc-800 border-zinc-700 text-white pr-10 focus:border-red-500 focus:ring-red-500/20"
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
              <label className="text-sm text-gray-400 block mb-1.5">Confirm Password</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                className="bg-zinc-800 border-zinc-700 text-white focus:border-red-500 focus:ring-red-500/20"
                required
              />
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
              className="w-full !border-red-500 !text-red-400 hover:!bg-red-500/10"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register as Organizer
                </>
              )}
            </GlowButton>
          </form>

          <div className="mt-5 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              Already registered?{' '}
              <Link to="/auth/organizer/login" className="text-red-400 hover:text-red-300 transition-colors">Sign in</Link>
            </p>
            <p className="text-gray-600 text-xs">
              Are you a gamer?{' '}
              <Link to="/auth/gamer/register" className="text-red-400 hover:text-red-300 transition-colors">Register here</Link>
            </p>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}
