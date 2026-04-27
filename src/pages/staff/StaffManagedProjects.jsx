import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiCall } from '@/api/heruClient'
import {
  Briefcase, Inbox, ChevronDown, Send, CheckCircle, UserCheck, X, MessageSquare,
} from 'lucide-react'

const fmtEGP = (n) => `EGP ${(n || 0).toLocaleString('en-EG')}`

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

const STATUS_TABS = [
  { value: 'all',         label: 'All' },
  { value: 'submitted',   label: 'Submitted' },
  { value: 'reviewing',   label: 'Reviewing' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed',   label: 'Completed' },
]

const STATUS_BADGE = {
  submitted:     'bg-amber-500/20 text-amber-400',
  reviewing:     'bg-blue-500/20 text-blue-400',
  proposal_sent: 'bg-violet-500/20 text-violet-400',
  approved:      'bg-emerald-500/20 text-emerald-400',
  in_progress:   'bg-cyan-500/20 text-cyan-400',
  completed:     'bg-zinc-700/50 text-zinc-400',
  cancelled:     'bg-red-500/20 text-red-400',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[status] || 'bg-zinc-800 text-zinc-500'}`}>
      {(status || 'unknown').replace(/_/g, ' ')}
    </span>
  )
}

export default function StaffManagedProjects() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab]       = useState('all')
  const [expandedId, setExpandedId]     = useState(null)
  const [proposalText, setProposalText] = useState('')
  const [proposalAmount, setProposalAmount] = useState('')
  const [proposingId, setProposingId]   = useState(null)
  const [consultantId, setConsultantId] = useState('')
  const [assigningId, setAssigningId]   = useState(null)

  const { data: rawProjects = [], isLoading } = useQuery({
    queryKey: ['staff-managed-projects'],
    queryFn: () => apiCall('/managed-services?limit=100'),
    staleTime: 30_000,
    retry: 1,
  })

  const projects = Array.isArray(rawProjects) ? rawProjects : rawProjects.data || []

  const filtered = activeTab === 'all' ? projects : projects.filter(p => p.status === activeTab)

  const assignMutation = useMutation({
    mutationFn: ({ id, consultant_id }) =>
      apiCall(`/managed-services/${id}`, { method: 'PUT', body: JSON.stringify({ consultant_id, status: 'reviewing' }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-managed-projects'] })
      setAssigningId(null)
      setConsultantId('')
    },
  })

  const proposalMutation = useMutation({
    mutationFn: ({ id, text, amount }) =>
      apiCall(`/managed-services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ proposal_text: text, proposal_amount: Number(amount), status: 'proposal_sent' }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-managed-projects'] })
      setProposingId(null)
      setProposalText('')
      setProposalAmount('')
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id) =>
      apiCall(`/managed-services/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-managed-projects'] }),
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Managed Projects</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Sponsor consultancy requests — assign staff, send proposals, mark complete</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_TABS.map(tab => {
          const count = tab.value === 'all' ? projects.length : projects.filter(p => p.status === tab.value).length
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === tab.value
                  ? 'bg-red-600 text-white'
                  : 'bg-[#111111] border border-[#1e1e1e] text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {tab.label} <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Project list */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-zinc-600">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No managed service projects found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <div key={project.id} className="bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden">
              {/* Row header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-[#161616] transition-colors"
                onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{project.title || 'Untitled Project'}</p>
                    <StatusBadge status={project.status} />
                    {project.budget && (
                      <span className="text-xs text-zinc-500">Budget: {fmtEGP(project.budget)}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    Submitted {formatDate(project.created_at)}
                    {project.sponsor_name && <span> · {project.sponsor_name}</span>}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-transform ${expandedId === project.id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded detail */}
              {expandedId === project.id && (
                <div className="border-t border-[#1e1e1e] p-5 space-y-4">
                  {project.description && (
                    <p className="text-sm text-zinc-400">{project.description}</p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Assign consultant */}
                    {['submitted', 'reviewing'].includes(project.status) && assigningId !== project.id && (
                      <button
                        onClick={() => setAssigningId(project.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Assign Consultant
                      </button>
                    )}

                    {/* Send proposal */}
                    {['reviewing', 'approved'].includes(project.status) && proposingId !== project.id && (
                      <button
                        onClick={() => setProposingId(project.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Proposal
                      </button>
                    )}

                    {/* Mark complete */}
                    {project.status === 'in_progress' && (
                      <button
                        onClick={() => completeMutation.mutate(project.id)}
                        disabled={completeMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Complete
                      </button>
                    )}
                  </div>

                  {/* Assign consultant form */}
                  {assigningId === project.id && (
                    <div className="rounded-lg bg-[#0d0d0d] border border-[#1e1e1e] p-4 space-y-3">
                      <p className="text-xs font-semibold text-zinc-300">Assign Consultant</p>
                      <input
                        type="text"
                        value={consultantId}
                        onChange={(e) => setConsultantId(e.target.value)}
                        placeholder="Consultant user ID (UUID)"
                        className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-red-500/50"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => assignMutation.mutate({ id: project.id, consultant_id: consultantId })}
                          disabled={!consultantId || assignMutation.isPending}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                        </button>
                        <button
                          onClick={() => setAssigningId(null)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 hover:text-zinc-100 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Proposal form */}
                  {proposingId === project.id && (
                    <div className="rounded-lg bg-[#0d0d0d] border border-[#1e1e1e] p-4 space-y-3">
                      <p className="text-xs font-semibold text-zinc-300">Send Proposal</p>
                      <textarea
                        value={proposalText}
                        onChange={(e) => setProposalText(e.target.value)}
                        rows={4}
                        placeholder="Describe the scope, deliverables, and timeline..."
                        className="w-full px-3 py-2 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-red-500/50 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">Amount (EGP):</span>
                        <input
                          type="number"
                          value={proposalAmount}
                          onChange={(e) => setProposalAmount(e.target.value)}
                          className="w-32 px-2 py-1.5 text-sm bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-100 rounded-lg focus:outline-none focus:border-red-500/50"
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
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#1a1a1a] border border-[#2a2a2a] text-zinc-400 hover:text-zinc-100 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Existing proposal */}
                  {project.proposal_text && (
                    <div className="rounded-lg bg-violet-500/5 border border-violet-500/20 p-4">
                      <p className="text-xs font-semibold text-violet-400 mb-1">Proposal Sent</p>
                      <p className="text-sm text-zinc-300">{project.proposal_text}</p>
                      {project.proposal_amount && (
                        <p className="text-xs text-violet-400 mt-1 font-semibold">{fmtEGP(project.proposal_amount)}</p>
                      )}
                    </div>
                  )}

                  {/* Chat history */}
                  {project.chat && project.chat.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> Chat History ({project.chat.length})
                      </p>
                      <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg bg-[#0d0d0d] border border-[#1e1e1e] p-3">
                        {project.chat.map((msg, i) => (
                          <div key={i} className="text-xs">
                            <span className="text-zinc-500 font-mono mr-2">
                              {msg.sender_name || msg.sender_role || 'User'}:
                            </span>
                            <span className="text-zinc-300">{msg.message || msg.text || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
