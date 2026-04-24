import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import {
  Briefcase, Inbox, ChevronDown, Send, CheckCircle, UserCheck, X,
} from 'lucide-react';

const STATUS_STYLE = {
  submitted:      'bg-amber-50 text-amber-700',
  reviewing:      'bg-blue-50 text-blue-700',
  proposal_sent:  'bg-purple-50 text-purple-700',
  approved:       'bg-emerald-50 text-emerald-700',
  in_progress:    'bg-cyan-50 text-cyan-700',
  completed:      'bg-gray-100 text-gray-600',
  cancelled:      'bg-red-50 text-red-600',
};

function formatEGP(n) {
  return `EGP ${(n || 0).toLocaleString()}`;
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
}

export default function StaffManagedProjects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [proposalText, setProposalText] = useState('');
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposingId, setProposingId] = useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: rawProjects = [], isLoading } = useQuery({
    queryKey: ['staff-managed-projects'],
    queryFn: () => apiCall('/managed-services'),
    staleTime: 30_000,
  });

  const projects = Array.isArray(rawProjects) ? rawProjects : rawProjects.data || [];

  const assignMutation = useMutation({
    mutationFn: (id) => apiCall(`/managed-services/${id}/assign`, { method: 'PUT', body: { staff_id: null } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-managed-projects'] }),
  });

  const proposalMutation = useMutation({
    mutationFn: ({ id, text, amount }) =>
      apiCall(`/managed-services/${id}/proposal`, { method: 'PUT', body: { proposal_text: text, proposal_amount: Number(amount) } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-managed-projects'] });
      setProposingId(null);
      setProposalText('');
      setProposalAmount('');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => apiCall(`/managed-services/${id}/complete`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-managed-projects'] }),
  });

  return (
    <StaffLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Managed Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Sponsor consultancy requests. Assign staff, send proposals, mark complete.</p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-16 text-sm text-gray-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No managed service projects yet.</p>
            </div>
          ) : projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900 truncate">{project.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[project.status] || 'bg-gray-100 text-gray-600'}`}>
                      {project.status?.replace('_', ' ')}
                    </span>
                    {project.budget && (
                      <span className="text-xs text-gray-500">Budget: {formatEGP(project.budget)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(project.created_at)}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expandedId === project.id ? 'rotate-180' : ''}`} />
              </div>

              {expandedId === project.id && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {project.status === 'submitted' && (
                      <button
                        onClick={() => assignMutation.mutate(project.id)}
                        disabled={assignMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Assign to Me
                      </button>
                    )}
                    {['reviewing', 'approved'].includes(project.status) && !proposingId && (
                      <button
                        onClick={() => setProposingId(project.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Proposal
                      </button>
                    )}
                    {project.status === 'in_progress' && (
                      <button
                        onClick={() => completeMutation.mutate(project.id)}
                        disabled={completeMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                      </button>
                    )}
                  </div>

                  {proposingId === project.id && (
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-700">Send Proposal</p>
                      <textarea
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        rows={4}
                        placeholder="Describe the scope, deliverables, and timeline..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Amount (EGP):</span>
                        <input
                          type="number"
                          value={proposalAmount}
                          onChange={(e) => setProposalAmount(e.target.value)}
                          className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => proposalMutation.mutate({ id: project.id, text: proposalText, amount: proposalAmount })}
                          disabled={!proposalText || proposalMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {proposalMutation.isPending ? 'Sending...' : 'Send'}
                        </button>
                        <button
                          onClick={() => setProposingId(null)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {project.proposal_text && (
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                      <p className="text-xs font-semibold text-purple-700 mb-1">Proposal Sent</p>
                      <p className="text-sm text-purple-900">{project.proposal_text}</p>
                      {project.proposal_amount && (
                        <p className="text-xs text-purple-600 mt-1 font-semibold">{formatEGP(project.proposal_amount)}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </StaffLayout>
  );
}
