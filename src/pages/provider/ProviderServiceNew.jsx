import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Plus, X, AlertCircle, Loader2 } from 'lucide-react';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const CATEGORIES = [
  { value: 'branding', label: 'Branding & Design' },
  { value: 'production', label: 'Stream & Media Production' },
  { value: 'talent', label: 'Host / Caster / Analyst' },
  { value: 'venue', label: 'Venue' },
  { value: 'marketing', label: 'Marketing / Discord Server' },
];

const PRICE_TYPES = [
  { value: 'fixed', label: 'Fixed price' },
  { value: 'per_day', label: 'Per day' },
  { value: 'per_event', label: 'Per event' },
];

export default function ProviderServiceNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', category: '', description: '',
    price: '', price_type: 'fixed', portfolio_url: '',
  });
  const [deliverables, setDeliverables] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addDeliverable = () => setDeliverables(d => [...d, '']);
  const setDeliverable = (i, v) => setDeliverables(d => d.map((x, idx) => idx === i ? v : x));
  const removeDeliverable = (i) => setDeliverables(d => d.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Please select a category'); return; }
    if (!form.price || isNaN(Number(form.price))) { setError('Enter a valid price'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          deliverables: deliverables.filter(d => d.trim()),
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create service');
      navigate('/provider/services');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add New Service</h1>
        <p className="text-gray-400 mt-1">Create a service listing for tournament organizers to book</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-5">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Category *</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${
                  form.category === cat.value
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${form.category === cat.value ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                  {form.category === cat.value && <span className="text-white text-xs">✓</span>}
                </div>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Service Title *</label>
          <Input value={form.title} onChange={set('title')} placeholder="e.g. Tournament Logo Package" required className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Description</label>
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={4}
            placeholder="Describe what you offer, your process, turnaround time, etc."
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Price (EGP) *</label>
            <Input type="number" value={form.price} onChange={set('price')} placeholder="0" min="0" required className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Price Type</label>
            <select
              value={form.price_type}
              onChange={set('price_type')}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              {PRICE_TYPES.map(pt => <option key={pt.value} value={pt.value} className="bg-gray-900">{pt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Deliverables</label>
          <div className="space-y-2">
            {deliverables.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={d}
                  onChange={e => setDeliverable(i, e.target.value)}
                  placeholder={`Deliverable ${i + 1}`}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1"
                />
                {deliverables.length > 1 && (
                  <button type="button" onClick={() => removeDeliverable(i)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addDeliverable} className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add deliverable
            </button>
          </div>
        </div>

        {/* Portfolio URL */}
        <div>
          <label className="text-sm text-gray-400 mb-1.5 block">Portfolio / Sample Work URL</label>
          <Input value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://behance.net/yourwork or YouTube link" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
        </div>

        <p className="text-xs text-gray-500">
          After submission, HERU staff will review your service (usually 24–48 hours). You will be notified once approved.
        </p>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/provider/services')} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
