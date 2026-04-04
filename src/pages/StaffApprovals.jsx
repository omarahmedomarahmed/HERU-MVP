import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { Check, X } from 'lucide-react';
import { ApprovalRequest } from '@/api/heruClient'


export default function StaffApprovals() {
  const [activeTab, setActiveTab] = useState('team_join');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: approvals = [] } = useQuery({
    queryKey: ['staff-approvals'],
    queryFn: () => ApprovalRequest.list('-submitted_at'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, rejection_reason }) =>
      ApprovalRequest.update(id, { status, rejection_reason, reviewed_at: new Date().toISOString() }),
    onSuccess: () => queryClient.invalidateQueries(['staff-approvals']),
  });

  const filtered = approvals.filter(a => a.approval_type === activeTab);

  const stats = {
    pending: approvals.filter(a => a.status === 'pending').length,
    approved: approvals.filter(a => a.status === 'approved').length,
    rejected: approvals.filter(a => a.status === 'rejected').length,
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-black text-white">APPROVALS <span className="text-red-500">CENTER</span></h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <FloatingPanel className="p-4 text-center">
            <p className="text-2xl font-black text-yellow-400">{stats.pending}</p>
            <p className="text-gray-400 text-xs mt-1">Pending</p>
          </FloatingPanel>
          <FloatingPanel className="p-4 text-center">
            <p className="text-2xl font-black text-green-400">{stats.approved}</p>
            <p className="text-gray-400 text-xs mt-1">Approved</p>
          </FloatingPanel>
          <FloatingPanel className="p-4 text-center">
            <p className="text-2xl font-black text-red-400">{stats.rejected}</p>
            <p className="text-gray-400 text-xs mt-1">Rejected</p>
          </FloatingPanel>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['team_join', 'tournament_publish', 'talent_application'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Approvals List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <FloatingPanel className="p-6 text-center">
              <p className="text-gray-500">No {activeTab.replace('_', ' ')} approvals</p>
            </FloatingPanel>
          ) : (
            filtered.map(a => (
              <FloatingPanel key={a.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-white font-bold">{a.requester_name}</p>
                    <p className="text-gray-400 text-sm mt-1">{a.requester_email}</p>
                    {a.additional_info && <p className="text-gray-300 text-sm mt-2">{a.additional_info}</p>}
                    <p className="text-gray-500 text-xs mt-2">{new Date(a.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {a.status === 'pending' ? (
                      <>
                        <GlowButton
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: a.id, status: 'approved' })}
                        >
                          <Check className="w-4 h-4" /> Approve
                        </GlowButton>
                        <GlowButton
                          variant="ghost"
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: a.id, status: 'rejected' })}
                        >
                          <X className="w-4 h-4" /> Reject
                        </GlowButton>
                      </>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded ${
                        a.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {a.status?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </FloatingPanel>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  );
}