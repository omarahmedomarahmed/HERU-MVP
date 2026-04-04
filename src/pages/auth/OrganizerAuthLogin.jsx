import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext'


export default function OrganizerAuthLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await supabase.auth.getSession().then(({data}) => !!data.session);
        if (isAuth) {
          const user = await apiCall('/auth/me');
          if (user?.role === 'organizer' || user?.role === 'admin') {
            navigate('/dashboard/organizer/tournaments', { replace: true });
          }
        }
      } catch (e) {}
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await navigate('/auth/gamer/login');
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <FloatingPanel className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/30 to-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white">ORGANIZER LOGIN</h1>
            <p className="text-gray-400 mt-1 text-sm">Sign in to your organizer account</p>
          </div>

          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

          <GlowButton onClick={handleLogin} variant="secondary" className="w-full !border-blue-500 !text-blue-400 hover:!bg-blue-500/10" disabled={loading}>
            <Building2 className="w-4 h-4" />
            {loading ? 'Redirecting...' : 'Sign In with HERU'}
          </GlowButton>

          <div className="border-t border-zinc-700 pt-5 mt-6 space-y-3 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/auth/organizer/register" className="text-blue-400 hover:text-blue-300 font-semibold">
                Create Account
              </Link>
            </p>
            <p className="text-gray-600 text-xs">
              Are you a gamer?{' '}
              <Link to="/auth/gamer/login" className="text-red-400 hover:text-red-300">
                Login here →
              </Link>
            </p>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}