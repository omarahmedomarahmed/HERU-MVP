import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import { Briefcase, Plus, ChevronRight, Inbox, Clock, CheckCircle } from 'lucide-react';

function formatEGP(n) { return `EGP ${(n || 0).toLocaleString()}`; }

const STATUS_STYLE = {
  submitted:      'bg-amber-500/20 text-amber-400 border-amber-500/30',
  reviewing:      'bg-blue-500/20 text-blue-400 border-blue-500/30',
  proposal_sent:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  approved:       'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  in_progress:    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  completed:      'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  cancelled:      'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function SponsorManagedServices() {
  const { user } = useAuth();

  const { data: rawProjects = [], isLoading } = useQuery({
    queryKey: ['sponsor-managed-services', user?.id],
    queryFn: () => apiCall('/managed-services'),
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  const projects = Array.isArray(rawProjects) ? rawProjects : rawProjects.data || [];

  return (
    <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Managed Services</h1>
            <p className="text-sm text-gray-400 mt-1">Commission HERU to build complete esports campaigns for your brand.</p>
          </div>
          <Link
            to="/sponsor/managed-services/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-14 h-14 text-zinc-700 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-1">No managed projects yet</p>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Submit a project request and a HERU consultant will build your entire esports campaign strategy.
            </p>
            <Link
              to="/sponsor/managed-services/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Request a Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/sponsor/managed-services/${project.id}`}
                className="block rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-white font-bold truncate">{project.title}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${STATUS_STYLE[project.status] || STATUS_STYLE.submitted}`}>
                          {project.status?.replace('_', ' ')}
                        </span>
                      </div>
                      {project.budget && (
                        <p className="text-xs text-gray-400">Budget: {formatEGP(project.budget)}</p>
                      )}
                      {project.proposal_amount && (
                        <p className="text-xs text-yellow-400 font-bold mt-0.5">Proposal: {formatEGP(project.proposal_amount)}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}
