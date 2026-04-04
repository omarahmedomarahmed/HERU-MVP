import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Gamepad2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function GamerAuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role === 'gamer') {
      navigate('/gamer/home', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

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
      const userRole = profile?.role || profile?.user?.role;
      if (userRole === 'gamer') {
        navigate('/gamer/home', { replace: true });
      } else if (userRole === 'organizer') {
        navigate('/organizer/dashboard', { replace: true });
      } else if (userRole === 'admin') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/gamer/home', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <FloatingPanel className="p-8" glowBorder>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-red-500" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white">GAMER LOGIN</h1>
            <p className="text-gray-400 mt-1 text-sm">Sign in to your gamer account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="bg-zinc-800 border-zinc-700 text-white"
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

            <div className="text-right">
              <Link to="/auth/forgot-password" className="text-xs text-red-400 hover:text-red-300">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <GlowButton type="submit" className="w-full" disabled={loading}>
              <Gamepad2 className="w-4 h-4" />
              {loading ? 'Signing in...' : 'Sign In'}
            </GlowButton>
          </form>

          <div className="border-t border-zinc-700 pt-5 mt-6 space-y-3 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/auth/gamer/register" className="text-red-400 hover:text-red-300 font-semibold">
                Create Account
              </Link>
            </p>
            <p className="text-gray-600 text-xs">
              Organizer?{' '}
              <Link to="/auth/organizer/login" className="text-blue-400 hover:text-blue-300">
                Login here →
              </Link>
            </p>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}
