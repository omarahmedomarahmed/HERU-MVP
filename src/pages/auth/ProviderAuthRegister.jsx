import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeruLogo from '@/components/shared/HeruLogo';
import { Input } from '@/components/ui/input';
import { Briefcase, AlertTriangle, UserPlus, CheckCircle, DollarSign, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const SIDE_IMG = 'https://images.unsplash.com/photo-1627163439134-7a8c47e08208?w=900&q=80';

const CATEGORIES = [
  { id: 'Venue',          label: 'Specialized Venue' },
  { id: 'Coaching',       label: 'Coaching' },
  { id: 'Talent',         label: 'Talent & Influencer' },
  { id: 'Production',     label: 'Media Production' },
  { id: 'Marketing',      label: 'Marketing' },
  { id: 'Community',      label: 'Gaming Community' },
  { id: 'Hardware',       label: 'Gaming Hardware' },
  { id: 'EventVendor',    label: 'Event Vendors' },
  { id: 'TournamentMgmt', label: 'Tournament Mgmt' },
];

const PERKS = [
  'No monthly subscription fee',
  '85% payout on every booking',
  'Full CRM & file sharing access',
  'Public portfolio page included',
];

export default function ProviderAuthRegister() {
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', full_name: '', display_name: '' });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const toggleCat = (id) => setSelectedCategories(p => p.includes(id) ? p.filter(c => c !== id) : [...p, id]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!form.display_name) { setError('Display name is required'); return; }
    setLoading(true); setError('');
    try {
      const result = await register(form.email, form.password, 'service_provider', {
        full_name: form.full_name,
        display_name: form.display_name,
        categories: selectedCategories,
      });
      if (result?.needsSignIn) {
        setSuccess(true);
        setTimeout(() => navigate('/auth/provider/login', { replace: true }), 2000);
      } else {
        navigate('/provider/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-12 rounded-3xl bg-zinc-900 border border-zinc-800">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-3">Account Created!</h2>
          <p className="text-zinc-400 mb-3">Redirecting to sign in...</p>
          <p className="text-zinc-500 text-sm">Your account is pending staff review. You'll be notified once approved to list services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden">
        <img src={SIDE_IMG} alt="HERU GIGs" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/80 via-zinc-950/60 to-zinc-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />

        <div className="relative z-10 p-10">
          <Link to="/"><HeruLogo className="h-10" /></Link>
        </div>

        <div className="relative z-10 p-10">
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Briefcase className="w-3.5 h-3.5" /> No Monthly Fees
          </div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">Join HERU GIGs.<br/>Get Booked.</h2>
          <div className="space-y-3">
            {PERKS.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3 h-3 text-cyan-400" />
                </div>
                <span className="text-zinc-300 text-sm">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex lg:hidden mb-8"><HeruLogo className="h-9" /></Link>

          <div className="mb-8">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
              <Briefcase className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Create Provider Account</h1>
            <p className="text-zinc-500 text-sm">Join HERU GIGs and start getting booked</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Full Name</label>
                <Input type="text" value={form.full_name} onChange={set('full_name')}
                  placeholder="Your name"
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12 rounded-xl" />
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Display Name *</label>
                <Input type="text" value={form.display_name} onChange={set('display_name')}
                  placeholder="Public name"
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12 rounded-xl" required />
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Email *</label>
              <Input type="email" value={form.email} onChange={set('email')}
                placeholder="provider@email.com"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12 rounded-xl" required />
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Password *</label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  placeholder="Min. 6 characters"
                  className="bg-zinc-900 border-zinc-800 text-white pr-12 focus:border-cyan-500 focus:ring-cyan-500/20 h-12 rounded-xl" required />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-zinc-400 block mb-1.5 font-medium">Confirm Password *</label>
              <Input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="Re-enter password"
                className="bg-zinc-900 border-zinc-800 text-white focus:border-cyan-500 focus:ring-cyan-500/20 h-12 rounded-xl" required />
            </div>

            {/* Category picker */}
            <div>
              <label className="text-sm text-zinc-400 block mb-2 font-medium">Service Categories (optional)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map(c => (
                  <button type="button" key={c.id} onClick={() => toggleCat(c.id)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all text-center ${
                      selectedCategories.includes(c.id)
                        ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-cyan-500/8 border border-cyan-500/20 rounded-xl p-4">
                <AlertTriangle className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-cyan-300 text-sm">{error}</p>
              </div>
            )}

            <button type="submit"
              className="w-full flex items-center justify-center gap-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-600/20 disabled:opacity-50 h-12"
              disabled={loading}>
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Provider Account</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-center">
            <p className="text-zinc-500 text-sm">
              Already registered?{' '}
              <Link to="/auth/provider/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Sign in</Link>
            </p>
            <p className="text-zinc-600 text-xs">
              Not a provider?{' '}
              <Link to="/auth" className="text-zinc-500 hover:text-white transition-colors">Choose your role</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
