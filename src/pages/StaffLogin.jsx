import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft, Key, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';

const MASTER_STAFF_KEY = 'HERUGGMASTERSOFGGGODMODE:ON';

export default function StaffLogin() {
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = () => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (token && expires && new Date(expires) > new Date()) {
      navigate('/dashboard/staff', { replace: true });
    } else {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!accessKey.trim()) {
      setError('Please enter the staff access key');
      return;
    }

    setLoading(true);
    setError('');

    if (accessKey.trim() === MASTER_STAFF_KEY) {
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      localStorage.setItem('heru_staff_token', sessionToken);
      localStorage.setItem('heru_staff_expires', expiresAt.toISOString());

      navigate('/dashboard/staff', { replace: true });
    } else {
      setError('Invalid staff access key.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <div className="w-full max-w-md">
        <Link to={'/'} className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <FloatingPanel className="p-8" glowBorder>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <HeruLogo className="h-10 mx-auto mb-3" />
            <h1 className="text-2xl font-black text-white">STAFF ACCESS</h1>
            <p className="text-gray-400 mt-1 text-sm">Restricted area — authorized personnel only</p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-6">
            <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <p className="text-purple-300 text-xs">This area is protected by a staff access key. Unauthorized access attempts are logged.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
             <div>
               <label className="text-sm text-gray-400 block mb-2">
                 <Key className="w-4 h-4 inline mr-1" />
                 Staff Access Key
               </label>
               <div className="relative">
                 <Input
                   type={showKey ? 'text' : 'password'}
                   value={accessKey}
                   onChange={(e) => setAccessKey(e.target.value)}
                   placeholder="Enter staff access key"
                   className="bg-zinc-800 border-zinc-700 text-white pr-10"
                   autoComplete="off"
                 />
                 <button
                   type="button"
                   onClick={() => setShowKey(!showKey)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                 >
                   {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                 </button>
               </div>
             </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <GlowButton type="submit" className="w-full" disabled={loading}>
              <Shield className="w-4 h-4" />
              {loading ? 'Verifying...' : 'Access Staff Dashboard'}
            </GlowButton>
          </form>
        </FloatingPanel>
      </div>
    </div>
  );
}