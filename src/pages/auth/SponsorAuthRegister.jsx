import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { Input } from '@/components/ui/input';
import { TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const INDUSTRIES = ['Technology','Gaming','Telecom','Food & Beverage','Fashion','Automotive','Finance','Media','Sports','Other'];

export default function SponsorAuthRegister() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '', brand_name: '', industry: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!form.brand_name) { setError('Brand name is required'); return; }
    setLoading(true); setError('');
    try {
      await register(form.email, form.password, 'sponsor', { full_name: form.full_name, brand_name: form.brand_name, industry: form.industry, website: form.website });
      navigate('/sponsor/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex justify-center mb-6"><HeruLogo className="h-10" /></div>
        <FloatingPanel className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-black" /></div>
            <div><h1 className="text-xl font-bold text-white">Create Sponsor Account</h1><p className="text-gray-400 text-sm">Start sponsoring esports events in MENA</p></div>
          </div>
          {error && (<div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5"><AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>)}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400 mb-1.5 block">Full Name</label><Input value={form.full_name} onChange={set('full_name')} placeholder="Your name" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Brand Name *</label><Input value={form.brand_name} onChange={set('brand_name')} placeholder="Company / Brand" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
            </div>
            <div><label className="text-sm text-gray-400 mb-1.5 block">Email *</label><Input type="email" value={form.email} onChange={set('email')} placeholder="brand@company.com" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400 mb-1.5 block">Industry</label><select value={form.industry} onChange={set('industry')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500"><option value="">Select industry</option>{INDUSTRIES.map(i => <option key={i} value={i} className="bg-gray-900">{i}</option>)}</select></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Website</label><Input value={form.website} onChange={set('website')} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400 mb-1.5 block">Password *</label><Input type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Confirm Password *</label><Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat password" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors disabled:opacity-50">{loading ? 'Creating account...' : 'Create Sponsor Account'}</button>
          </form>
          <div className="mt-5 text-center space-y-2">
            <p className="text-gray-500 text-sm">Already have an account? <Link to="/auth/sponsor/login" className="text-blue-400 hover:text-blue-300">Sign in</Link></p>
            <Link to="/auth" className="text-gray-600 hover:text-gray-500 text-xs block">← Back to account types</Link>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}
