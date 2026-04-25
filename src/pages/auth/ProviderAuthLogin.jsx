import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { Input } from '@/components/ui/input';
import { Briefcase, Eye, EyeOff, LogIn, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function ProviderAuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && role === 'service_provider') {
      navigate('/provider/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password'); return; }
    setLoading(true); setError('');
    try {
      const { profile } = await login(email, password);
      if (profile?.role !== 'service_provider') {
        await logout();
        setError('This account does not have service provider access.');
        setLoading(false);
        return;
      }
      navigate('/provider/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex justify-center mb-6"><HeruLogo className="h-10" /></div>
        <FloatingPanel className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center"><Briefcase className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">Service Provider Login</h1><p className="text-gray-400 text-sm">Manage your bookings and services</p></div>
          </div>
          {error && (<div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5"><AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>)}
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="text-sm text-gray-400 mb-1.5 block">Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" autoComplete="email" /></div>
            <div><label className="text-sm text-gray-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-colors disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <p className="text-gray-500 text-sm">No account? <Link to="/auth/provider/register" className="text-cyan-400 hover:text-cyan-300">Register as provider</Link></p>
            <Link to="/auth" className="text-gray-600 hover:text-gray-500 text-xs block">← Back to account types</Link>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}
