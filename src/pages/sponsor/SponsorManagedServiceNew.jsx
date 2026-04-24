import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { apiCall } from '@/api/heruClient';
import SponsorLayout from '@/components/layouts/SponsorLayout';
import { Briefcase, ArrowLeft } from 'lucide-react';

export default function SponsorManagedServiceNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', budget: '' });

  const createMutation = useMutation({
    mutationFn: (data) => apiCall('/managed-services', { method: 'POST', body: data }),
    onSuccess: (data) => navigate(`/sponsor/managed-services/${data.id}`),
  });

  return (
    <SponsorLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/sponsor/managed-services')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-yellow-400" />
            Request a Managed Campaign
          </h1>
          <p className="text-gray-400">
            Tell us what you need. A HERU consultant will review your request and send you a custom proposal.
          </p>
        </div>

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Title *</label>
            <input
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Valorant Season Campaign — Q2 2026"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Campaign Brief *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe your goals, target audience, games/events you want to target, preferred deliverables..."
              rows={6}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Budget (EGP)</label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => setForm(p => ({ ...p, budget: e.target.value }))}
              placeholder="e.g. 50000"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/20 p-4">
            <p className="text-xs text-yellow-300 font-medium mb-1">What happens next?</p>
            <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
              <li>HERU staff reviews your brief</li>
              <li>A consultant contacts you within 2 business days</li>
              <li>You receive a custom proposal with budget and deliverables</li>
              <li>Approve the proposal to kick off the campaign</li>
            </ol>
          </div>

          <button
            onClick={() => createMutation.mutate({ ...form, budget: form.budget ? Number(form.budget) : undefined })}
            disabled={!form.title || !form.description || createMutation.isPending}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Briefcase className="w-4 h-4" />
            )}
            {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </SponsorLayout>
  );
}
