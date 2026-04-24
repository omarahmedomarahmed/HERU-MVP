import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import SponsorLayout from '@/components/layouts/SponsorLayout';
import {
  ArrowLeft, Briefcase, Send, CheckCircle, Clock,
  MessageCircle, Loader2,
} from 'lucide-react';

function formatEGP(n) { return `EGP ${(n || 0).toLocaleString()}`; }

const STATUS_STYLE = {
  submitted:      'bg-amber-500/20 text-amber-400',
  reviewing:      'bg-blue-500/20 text-blue-400',
  proposal_sent:  'bg-purple-500/20 text-purple-400',
  approved:       'bg-emerald-500/20 text-emerald-400',
  in_progress:    'bg-cyan-500/20 text-cyan-400',
  completed:      'bg-zinc-500/20 text-zinc-400',
};

export default function SponsorManagedServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [chatMsg, setChatMsg] = useState('');

  const { data: project, isLoading } = useQuery({
    queryKey: ['managed-service-detail', id],
    queryFn: () => apiCall(`/managed-services/${id}`),
    enabled: !!id,
    staleTime: 15_000,
  });

  const approveMutation = useMutation({
    mutationFn: () => apiCall(`/managed-services/${id}/approve`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['managed-service-detail', id] }),
  });

  const chatMutation = useMutation({
    mutationFn: (message) => apiCall(`/managed-services/${id}/chat`, { method: 'POST', body: { message } }),
    onSuccess: () => {
      setChatMsg('');
      queryClient.invalidateQueries({ queryKey: ['managed-service-detail', id] });
    },
  });

  if (isLoading) {
    return (
      <SponsorLayout>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
        </div>
      </SponsorLayout>
    );
  }

  if (!project) {
    return (
      <SponsorLayout>
        <div className="text-center py-16">
          <p className="text-gray-400">Project not found.</p>
        </div>
      </SponsorLayout>
    );
  }

  const chat = project.chat || [];

  return (
    <SponsorLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/sponsor/managed-services')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">{project.title}</h1>
            <p className="text-gray-400 text-sm mt-1">{project.description}</p>
          </div>
          <span className={`text-xs font-black px-3 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_STYLE[project.status] || 'bg-zinc-500/20 text-zinc-400'}`}>
            {project.status?.replace('_', ' ')}
          </span>
        </div>

        {/* Proposal */}
        {project.proposal_text && (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 mb-6">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-yellow-400" /> HERU Proposal
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{project.proposal_text}</p>
            {project.proposal_amount && (
              <p className="text-2xl font-black text-yellow-400 mb-4">{formatEGP(project.proposal_amount)}</p>
            )}
            {project.status === 'proposal_sent' && (
              <button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {approveMutation.isPending ? 'Approving...' : 'Approve Proposal'}
              </button>
            )}
          </div>
        )}

        {!project.proposal_text && (
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5 mb-6 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Waiting for HERU to assign a consultant and send a proposal.</p>
          </div>
        )}

        {/* Chat */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-bold text-white">Project Chat</h2>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chat.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-4">No messages yet</p>
            ) : chat.map((msg, i) => {
              const isOwn = msg.sender_id === user?.id;
              return (
                <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${isOwn ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-gray-200'}`}>
                    {!isOwn && <p className="text-[10px] opacity-60 mb-1 capitalize">{msg.sender_role}</p>}
                    {msg.message}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-zinc-800 flex gap-2">
            <input
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && chatMsg.trim() && chatMutation.mutate(chatMsg.trim())}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
            <button
              onClick={() => chatMsg.trim() && chatMutation.mutate(chatMsg.trim())}
              disabled={!chatMsg.trim() || chatMutation.isPending}
              className="px-3 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </SponsorLayout>
  );
}
