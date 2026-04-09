import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Trophy, Users, GitBranch, ShoppingCart,
  Calendar, MapPin, Globe, Save, CheckCircle, MessageSquare, Send,
} from 'lucide-react';
import { Staff, apiCall } from '@/api/heruClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEGP(value) {
  return `EGP ${(value || 0).toLocaleString('en-EG', { minimumFractionDigits: 0 })}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const map = {
    draft: 'bg-gray-100 text-gray-600',
    pending_approval: 'bg-amber-50 text-amber-700',
    published: 'bg-red-50 text-red-700',
    live: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-gray-100 text-gray-500',
  };
  const labels = {
    pending_approval: 'Pending Approval',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {labels[status] || status || 'unknown'}
    </span>
  );
}

const TABS = [
  { key: 'details', label: 'Details', icon: Trophy },
  { key: 'teams', label: 'Teams', icon: Users },
  { key: 'brackets', label: 'Brackets', icon: GitBranch },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
];

const STATUS_OPTIONS = ['draft', 'pending_approval', 'published', 'live', 'completed'];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function StaffTournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  const [newStatus, setNewStatus] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['staff-tournament', id],
    queryFn: () => apiCall('/tournaments/' + id),
    staleTime: 30_000,
  });

  const tournament = raw?.data || raw || {};

  React.useEffect(() => {
    if (tournament.status && !newStatus) setNewStatus(tournament.status);
  }, [tournament.status, newStatus]);

  const statusMutation = useMutation({
    mutationFn: (status) => Staff.updateTournamentStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staff-tournament', id] }),
  });

  const updateFieldMutation = useMutation({
    mutationFn: ({ field, value }) => Staff.updateTournament(id, { [field]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tournament', id] });
      setEditingField(null);
      setEditValue('');
    },
  });

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue ?? '');
  };

  const saveField = () => {
    if (editingField) {
      let val = editValue;
      if (['max_teams', 'total_cost', 'prizepool_total', 'platform_fee'].includes(editingField)) {
        val = Number(val) || 0;
      }
      if (editingField === 'is_offline') {
        val = editValue === 'true';
      }
      updateFieldMutation.mutate({ field: editingField, value: val });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading tournament...</p>
      </div>
    );
  }

  const teams = tournament.teams || [];
  const brackets = tournament.brackets || [];
  const coOrgs = tournament.co_organizers || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <button onClick={() => navigate('/staff/tournaments')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Tournaments
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center shrink-0 overflow-hidden">
              {tournament.tournament_image ? (
                <img src={tournament.tournament_image} alt="" className="w-14 h-14 object-cover" />
              ) : (
                <Trophy className="w-6 h-6 text-red-500" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{tournament.name || 'Untitled'}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{tournament.game || 'No game'} &middot; {tournament.format || 'TBD'}</p>
            </div>
          </div>
          <StatusBadge status={tournament.status} />
        </div>

        {/* Status changer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Change Status</h3>
          <div className="flex items-center gap-3">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s === 'pending_approval' ? 'Pending Approval' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button
              onClick={() => statusMutation.mutate(newStatus)}
              disabled={statusMutation.isPending || newStatus === tournament.status}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Save className="w-4 h-4" />
              {statusMutation.isPending ? 'Saving...' : 'Update Status'}
            </button>
          </div>
          {statusMutation.isError && <p className="text-xs text-red-500 mt-2">Failed to update status.</p>}
          {statusMutation.isSuccess && <p className="text-xs text-emerald-600 mt-2">Status updated.</p>}
          {tournament.status === 'pending_approval' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">This tournament is awaiting staff approval.</p>
                  <p className="text-xs text-gray-500 mt-0.5">Approve to make it publicly visible.</p>
                </div>
                <button
                  onClick={() => statusMutation.mutate('published')}
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  {statusMutation.isPending ? 'Approving...' : 'Approve & Publish'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Details */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
            {updateFieldMutation.isError && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">Failed to update field.</p>
            )}
            {updateFieldMutation.isSuccess && (
              <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">Field updated successfully.</p>
            )}

            <h4 className="text-sm font-semibold text-gray-700">Editable Fields</h4>
            <div className="space-y-3">
              {[
                { field: 'name', label: 'Tournament Name', type: 'text' },
                { field: 'game', label: 'Game', type: 'text' },
                { field: 'format', label: 'Format', type: 'text' },
                { field: 'max_teams', label: 'Max Teams', type: 'number' },
                { field: 'schedule', label: 'Schedule', type: 'datetime-local' },
                { field: 'description', label: 'Description', type: 'textarea' },
                { field: 'venue', label: 'Venue', type: 'text' },
                { field: 'stream_link', label: 'Stream Link', type: 'text' },
                { field: 'total_cost', label: 'Total Cost (EGP)', type: 'number' },
                { field: 'prizepool_total', label: 'Prizepool (EGP)', type: 'number' },
                { field: 'platform_fee', label: 'Platform Fee (EGP)', type: 'number' },
              ].map(({ field, label, type }) => (
                <div key={field} className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{label}</p>
                    {editingField === field ? (
                      <div className="flex items-center gap-2 mt-1">
                        {type === 'textarea' ? (
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            rows={3}
                          />
                        ) : (
                          <input
                            type={type === 'datetime-local' ? 'datetime-local' : type}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                        )}
                        <button
                          onClick={saveField}
                          disabled={updateFieldMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {updateFieldMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {type === 'number' && ['total_cost', 'prizepool_total', 'platform_fee'].includes(field)
                          ? formatEGP(tournament[field])
                          : field === 'schedule'
                            ? formatDate(tournament[field])
                            : (tournament[field] ?? '-')}
                      </p>
                    )}
                  </div>
                  {editingField !== field && (
                    <button
                      onClick={() => startEditing(field, field === 'schedule' && tournament[field] ? new Date(tournament[field]).toISOString().slice(0, 16) : tournament[field])}
                      className="shrink-0 mt-3 px-2.5 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>

            <hr className="border-gray-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={Calendar} label="Schedule" value={formatDate(tournament.schedule)} />
              <InfoRow icon={Globe} label="Type" value={tournament.tournament_type === 'shared' ? 'Shared' : 'Solo'} />
              <InfoRow icon={Users} label="Max Teams" value={tournament.max_teams || '-'} />
              <InfoRow icon={MapPin} label="Venue" value={tournament.is_offline ? (tournament.venue || 'Offline') : 'Online'} />
            </div>
            <hr className="border-gray-100" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <CostCard label="Items Cost" value={formatEGP(tournament.total_cost)} />
              <CostCard label="Prizepool" value={formatEGP(tournament.prizepool_total)} />
              <CostCard label="Platform Fee (15%)" value={formatEGP(tournament.platform_fee)} />
            </div>
            {coOrgs.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Co-Organizers</h4>
                <div className="space-y-2">
                  {coOrgs.map((co, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-4 py-2.5">
                      <span className="text-gray-700">{co.brand_name || co.organizer_id}</span>
                      <span className="text-gray-500">{co.commitment_percent || 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Teams */}
        {activeTab === 'teams' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {teams.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-gray-400">No teams registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Team ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {teams.map((teamId, idx) => (
                      <tr key={teamId} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-6 py-3 text-sm font-mono text-red-600">{teamId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Brackets */}
        {activeTab === 'brackets' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {brackets.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No bracket data available.</p>
            ) : (
              <div className="space-y-3">
                {brackets.map((match, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{match.team_a || 'TBD'}</span>
                      <span className="text-gray-400 mx-2">vs</span>
                      <span className="font-medium">{match.team_b || 'TBD'}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.score_a != null ? `${match.score_a} - ${match.score_b}` : 'Pending'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && <OrdersTab tournamentId={id} />}

        {/* Tab: Chat */}
        {activeTab === 'chat' && <ChatTab tournament={tournament} tournamentId={id} queryClient={queryClient} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-lg bg-gray-100 p-2 mt-0.5">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function CostCard({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function OrdersTab({ tournamentId }) {
  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['staff-tournament-orders', tournamentId],
    queryFn: () => apiCall('/tournament-orders?tournament_id=' + tournamentId),
    staleTime: 30_000,
  });

  const orders = Array.isArray(raw) ? raw : raw.data || [];

  if (isLoading) return <div className="py-10 text-center text-sm text-gray-400">Loading orders...</div>;
  if (orders.length === 0) return <div className="py-10 text-center text-sm text-gray-400">No orders for this tournament.</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-mono text-red-600">{o.id?.slice(0, 8)}</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                  EGP {(o.grand_total || 0).toLocaleString('en-EG')}
                </td>
                <td className="px-6 py-3">
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-gray-100 text-gray-600">
                    {(o.fulfillment_status || 'unknown').replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChatTab({ tournament, tournamentId, queryClient }) {
  const [message, setMessage] = useState('');
  const chatMessages = tournament.support_chat || [];
  const chatEndRef = React.useRef(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const sendMutation = useMutation({
    mutationFn: (newMsg) => {
      const updatedChat = [...chatMessages, newMsg];
      return Staff.updateTournament(tournamentId, { support_chat: updatedChat });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-tournament', tournamentId] });
      setMessage('');
    },
  });

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    sendMutation.mutate({
      user_id: 'staff',
      sender_name: 'HERU Staff',
      message: text,
      timestamp: new Date().toISOString(),
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col" style={{ height: '500px' }}>
      <div className="px-5 py-3 border-b border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700">Support Chat</h4>
        <p className="text-xs text-gray-400">Staff-to-organizer tournament support channel</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {chatMessages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No messages yet. Start the conversation.</p>
        ) : (
          chatMessages.map((msg, idx) => {
            const isStaff = msg.user_id === 'staff';
            return (
              <div key={idx} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-lg px-3.5 py-2.5 ${
                  isStaff
                    ? 'bg-red-50 border border-red-100'
                    : 'bg-gray-50 border border-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isStaff ? 'text-red-600' : 'text-gray-700'}`}>
                      {msg.sender_name || (isStaff ? 'Staff' : 'Organizer')}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-gray-200">
        {sendMutation.isError && <p className="text-xs text-red-500 mb-2">Failed to send message.</p>}
        <div className="flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
            {sendMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
