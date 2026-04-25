import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import OrganizerLayout from '@/components/layouts/OrganizerLayout';
import {
  BadgeCheck, Upload, Link as LinkIcon, FileText, Clock,
  CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { icon: Clock,         color: 'text-amber-400',  bg: 'bg-amber-500/10',  label: 'Pending Review' },
  approved: { icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10',  label: 'Verified' },
  rejected: { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10',    label: 'Rejected' },
};

export default function OrganizerVerification() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    brand_name: '',
    website: '',
    instagram: '',
    linkedin: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const { data: verification } = useQuery({
    queryKey: ['my-verification', user?.id],
    queryFn: () => apiCall('/organizer-verifications/me'),
    enabled: !!user?.id,
    retry: false,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => apiCall('/organizer-verifications', { method: 'POST', body: data }),
    onSuccess: () => setSubmitted(true),
  });

  const status = verification?.status;
  const statusCfg = STATUS_CONFIG[status] || null;

  if (submitted || (status === 'pending')) {
    return (
      <OrganizerLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Under Review</h1>
          <p className="text-gray-400 max-w-sm mx-auto">
            Your verification request has been submitted. HERU staff will review it and get back to you within 2 business days.
          </p>
        </div>
      </OrganizerLayout>
    );
  }

  if (status === 'approved') {
    return (
      <OrganizerLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <BadgeCheck className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">You're Verified!</h1>
          <p className="text-gray-400 max-w-sm mx-auto">
            Your organizer profile is verified. You can now publish tournaments to the Sponsorship Radar.
          </p>
        </div>
      </OrganizerLayout>
    );
  }

  return (
    <OrganizerLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <BadgeCheck className="w-6 h-6 text-purple-400" />
            Organizer Verification
          </h1>
          <p className="text-gray-400">
            Verification is required to publish tournaments to the Sponsorship Radar. Submit your brand information and our team will review within 2 business days.
          </p>
        </div>

        {status === 'rejected' && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-400 mb-0.5">Previous request rejected</p>
              <p className="text-xs text-red-300/70">{verification?.rejection_reason || 'Please update your information and resubmit.'}</p>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Brand Name *</label>
            <input
              value={form.brand_name}
              onChange={(e) => setForm(p => ({ ...p, brand_name: e.target.value }))}
              placeholder="Your brand / organization name"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={form.website}
                onChange={(e) => setForm(p => ({ ...p, website: e.target.value }))}
                placeholder="https://yoursite.com"
                className="w-full pl-9 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Instagram / Social</label>
            <input
              value={form.instagram}
              onChange={(e) => setForm(p => ({ ...p, instagram: e.target.value }))}
              placeholder="@youraccount"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn / Business Profile</label>
            <input
              value={form.linkedin}
              onChange={(e) => setForm(p => ({ ...p, linkedin: e.target.value }))}
              placeholder="linkedin.com/company/..."
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Additional Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Tell us about your organization, past events, and why you want to organize on HERU..."
              rows={4}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <button
            onClick={() => submitMutation.mutate(form)}
            disabled={!form.brand_name || submitMutation.isPending}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <BadgeCheck className="w-4 h-4" />
            )}
            {submitMutation.isPending ? 'Submitting...' : 'Submit Verification Request'}
          </button>
        </div>
      </div>
    </OrganizerLayout>
  );
}
