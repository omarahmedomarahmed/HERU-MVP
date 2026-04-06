import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import { ArrowLeft, Trophy, Calendar, Users, Zap, Edit2, Save } from 'lucide-react';
import { Tournament } from '@/api/heruClient'


export default function StaffTournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const { data: tournament } = useQuery({
    queryKey: ['staff-tournament-detail', id],
    queryFn: () => Tournament.list().then(t => t.find(x => x.id === id)),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => Tournament.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-tournament-detail', id]);
      setEditMode(false);
    }
  });

  if (!tournament) return <div className="p-8">Loading...</div>;

  return (
    <>
      <div className="space-y-6">
        <Link to="/dashboard/staff/tournaments" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white">{tournament.name}</h1>
          <GlowButton variant={editMode ? "secondary" : "ghost"} onClick={() => setEditMode(!editMode)}>
            <Edit2 className="w-4 h-4" /> {editMode ? 'Cancel' : 'Edit'}
          </GlowButton>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['overview', 'teams', 'talents', 'order', 'radar', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <FloatingPanel className="p-6 space-y-4">
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Name</label>
                  <input
                    value={editData.name || tournament.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <select
                    value={editData.status || tournament.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="live">Live</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <GlowButton onClick={() => updateMutation.mutate(editData)} className="w-full">
                  <Save className="w-4 h-4" /> Save Changes
                </GlowButton>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm">Game</p>
                  <p className="text-white font-bold">{tournament.game}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <span className={`text-xs px-2 py-1 rounded ${tournament.status === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {tournament.status?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <span className={`text-xs px-2 py-1 rounded ${tournament.tournament_type === 'shared' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-gray-300'}`}>
                    {tournament.tournament_type?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Prize Pool</p>
                  <p className="text-white font-bold">EGP {(tournament.prizepool_total || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Cost</p>
                  <p className="text-white font-bold">EGP {(tournament.total_cost || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Teams</p>
                  <p className="text-white font-bold">{tournament.teams?.length || 0}/{tournament.max_teams || '∞'}</p>
                </div>
              </div>
            )}
          </FloatingPanel>
        )}

        {activeTab === 'teams' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-400 text-sm">Teams: {tournament.teams?.length || 0} confirmed</p>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {tournament.teams?.map(teamId => (
                <div key={teamId} className="bg-zinc-800/50 p-3 rounded">
                  <p className="text-white font-bold text-sm">{teamId}</p>
                </div>
              ))}
            </div>
          </FloatingPanel>
        )}

        {activeTab === 'talents' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-400 text-sm">Talents: {tournament.talents?.length || 0}</p>
            <div className="space-y-2 mt-4">
              {tournament.talents?.map((t, i) => (
                <div key={i} className="bg-zinc-800/50 p-3 rounded flex justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{t.talent_type}</p>
                    <p className="text-gray-400 text-xs">{t.user_id}</p>
                  </div>
                  <p className="text-red-400 font-bold">EGP {(t.price || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </FloatingPanel>
        )}

        {activeTab === 'order' && (
          <FloatingPanel className="p-6">
            <GlowButton onClick={() => navigate(`/dashboard/staff/tournaments/${id}/order`)}>
              View Tournament Order →
            </GlowButton>
          </FloatingPanel>
        )}

        {tournament.tournament_type === 'shared' && activeTab === 'radar' && (
          <FloatingPanel className="p-6">
            <p className="text-gray-400 text-sm">Sponsorship Radar: {tournament.sponsorship_radar_id || 'Not created'}</p>
          </FloatingPanel>
        )}

        {activeTab === 'settings' && editMode && (
          <FloatingPanel className="p-6">
            <p className="text-gray-400">Use Edit mode above to modify tournament settings</p>
          </FloatingPanel>
        )}
      </div>
    </>
  );
}