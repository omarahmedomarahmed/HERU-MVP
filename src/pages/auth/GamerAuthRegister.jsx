import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Gamepad2, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext'


export default function GamerAuthRegister() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await navigate('/auth/gamer/login');
    } catch (err) {
      setError('Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <Link to="/auth/gamer/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </Link>

        <FloatingPanel className="p-8" glowBorder>
          <div className="text-center mb-7">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-red-500" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white">JOIN AS GAMER</h1>
            <p className="text-gray-400 mt-1 text-sm">Create your free esports account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1.5">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
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
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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
              <label className="text-sm text-gray-400 block mb-1.5">Confirm Password</label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <GlowButton type="submit" className="w-full" disabled={loading}>
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Create Gamer Account'}
            </GlowButton>
          </form>

          <div className="mt-5 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/auth/gamer/login" className="text-red-400 hover:text-red-300">Sign in</Link>
            </p>
            <p className="text-gray-600 text-xs">
              Are you an organizer?{' '}
              <Link to="/auth/organizer/register" className="text-blue-400 hover:text-blue-300">Register here →</Link>
            </p>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}