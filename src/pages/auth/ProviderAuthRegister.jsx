import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import FloatingPanel from '@/components/ui/FloatingPanel';
import { Input } from '@/components/ui/input';
import { Briefcase, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const CATEGORIES = [
  { id: 'branding', label: 'Branding & Design' },
  { id: 'production', label: 'Stream & Media Production' },
  { id: 'talent', label: 'Host / Caster / Analyst' },
  { id: 'venue', label: 'Venue' },
  { id: 'marketing', label: 'Marketing (Discord, Influencer)' },
];

export default function ProviderAuthRegister() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '', display_name: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleCategory = (id) => setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (selectedCategories.length === 0) { setError('Please select at least one service category'); return; }
    setLoading(true); setError('');
    try {
      await register(form.email, form.password, 'service_provider', { full_name: form.full_name, display_name: form.display_name || form.full_name, categories: selectedCategories });
      navigate('/provider/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="w-full max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex justify-center mb-6"><HeruLogo className="h-10" /></div>
        <FloatingPanel className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center"><Briefcase className="w-6 h-6 text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">Register as Service Provider</h1><p className="text-gray-400 text-sm">Get booked by tournament organizers</p></div>
          </div>
          {error && (<div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5"><AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-400 text-sm">{error}</p></div>)}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400 mb-1.5 block">Full Name</label><Input value={form.full_name} onChange={set('full_name')} placeholder="Your real name" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" /></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Display Name *</label><Input value={form.display_name} onChange={set('display_name')} placeholder="Studio / Brand name" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
            </div>
            <div><label className="text-sm text-gray-400 mb-1.5 block">Email *</label><Input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Service Categories * (select all that apply)</label>
              <div className="grid grid-cols-1 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${selectedCategories.includes(cat.id) ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'}`}>
                    <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selectedCategories.includes(cat.id) ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'}`}>{selectedCategories.includes(cat.id) && <span className="text-white text-xs">✓</span>}</div>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm text-gray-400 mb-1.5 block">Password *</label><Input type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
              <div><label className="text-sm text-gray-400 mb-1.5 block">Confirm Password *</label><Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Repeat" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" required /></div>
            </div>
            <p className="text-xs text-gray-500">After registering, your account will be reviewed by HERU staff before your services are visible to organizers.</p>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-medium transition-colors disabled:opacity-50">{loading ? 'Creating account...' : 'Create Provider Account'}</button>
          </form>
          <div className="mt-5 text-center space-y-2">
            <p className="text-gray-500 text-sm">Already have an account? <Link to="/auth/provider/login" className="text-cyan-400 hover:text-cyan-300">Sign in</Link></p>
            <Link to="/auth" className="text-gray-600 hover:text-gray-500 text-xs block">← Back to account types</Link>
          </div>
        </FloatingPanel>
      </div>
    </div>
  );
}
