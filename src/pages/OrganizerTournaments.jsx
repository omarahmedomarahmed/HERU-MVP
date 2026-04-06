import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import GlowButton from '@/components/ui/GlowButton';
import { Trophy, Plus, Users, Calendar, Eye, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizerProfile, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


export default function OrganizerTournaments() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
      
      const profiles = await OrganizerProfile.list({ user_id: userData.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (e) {
      navigate('/organizer/dashboard');
    }
  };

  const { data: tournaments = [], isLoading } = useQuery({
    queryKey: ['organizer-tournaments', user?.id],
    queryFn: () => Tournament.list({ organizer_id: user?.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const draftTournaments = tournaments.filter(t => t.status === 'draft');
  const publishedTournaments = tournaments.filter(t => t.status === 'published');
  const liveTournaments = tournaments.filter(t => t.status === 'live');
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  const TournamentCard = ({ tournament }) => (
    <GameCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center flex-shrink-0">
          <Trophy className="w-10 h-10 text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-white truncate">{tournament.name}</h3>
            <HexBadge className={
              tournament.status === 'live' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
              tournament.status === 'published' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
              tournament.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
              'bg-gray-500/20 text-gray-400 border-gray-500/50'
            }>
              {tournament.status === 'live' ? '🔴 LIVE' : tournament.status.toUpperCase()}
            </HexBadge>
          </div>
          <p className="text-gray-400 text-sm mb-3">{tournament.game}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {tournament.teams?.length || 0}/{tournament.max_teams || '∞'}
            </span>
            {tournament.schedule && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(tournament.schedule).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/organizer/tournaments/${tournament.id}`}>
            <GlowButton variant="secondary" size="sm">
              <Settings className="w-4 h-4" /> Manage
            </GlowButton>
          </Link>
          <Link to={`/organizer/tournaments/${tournament.id}`}>
            <GlowButton variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </GlowButton>
          </Link>
        </div>
      </div>
    </GameCard>
  );

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">MY TOURNAMENTS</h1>
          <p className="text-gray-400">Manage all your tournaments</p>
        </div>
        <Link to={'/organizer/tournaments/new'}>
          <GlowButton>
            <Plus className="w-4 h-4" />
            Create Tournament
          </GlowButton>
        </Link>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-zinc-900 border-zinc-800 mb-6">
          <TabsTrigger value="all">All ({tournaments.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftTournaments.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedTournaments.length})</TabsTrigger>
          <TabsTrigger value="live">Live ({liveTournaments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTournaments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-pulse" />
              <p className="text-gray-400">Loading tournaments...</p>
            </div>
          ) : tournaments.length === 0 ? (
            <FloatingPanel className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No tournaments yet</h3>
              <p className="text-gray-400 mb-6">Create your first tournament to get started</p>
              <Link to={'/organizer/tournaments/new'}>
                <GlowButton>
                  <Plus className="w-4 h-4" /> Create Tournament
                </GlowButton>
              </Link>
            </FloatingPanel>
          ) : (
            <div className="grid gap-4">
              {tournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="draft">
          <div className="grid gap-4">
            {draftTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>

        <TabsContent value="published">
          <div className="grid gap-4">
            {publishedTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>

        <TabsContent value="live">
          <div className="grid gap-4">
            {liveTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {completedTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}