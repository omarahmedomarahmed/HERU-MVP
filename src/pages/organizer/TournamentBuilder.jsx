import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GamerProfile, Service, OrganizerProfile, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'
import { useToast } from '@/components/ui/use-toast'

import {
  Trophy, Gamepad2, Users, Star, Palette, MapPin, Award,
  ChevronRight, ChevronLeft, Check, Plus, X, Save, Send,
  Eye, Megaphone, Image, Video, DollarSign, Zap, Lock
} from 'lucide-react';

const STAGES = [
  { id: 'game', label: 'Game Setup', icon: Gamepad2 },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'talent', label: 'Live Talent', icon: Star },
  { id: 'production', label: 'Production', icon: Video },
  { id: 'venue', label: 'Venue', icon: MapPin },
  { id: 'prizepool', label: 'Prizepool', icon: Award },
];

import { useGames } from '@/hooks/useGames';
const FORMATS = ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss', 'Best of 1', 'Best of 3', 'Best of 5'];

// Pure helper — safe to call outside component (no hooks)
function calcSubtotal(t, items = []) {
  let cost = 0;
  const resolve = (id) => items.find(i => i.id === id)?.price || 0;
  (t.talents || []).forEach(talent => { cost += talent.price || 0; });
  (t.branding_items || []).forEach(id => { cost += resolve(id); });
  (t.production_items || []).forEach(id => { cost += resolve(id); });
  (t.prizepool_items || []).forEach(id => { cost += resolve(id); });
  (t.venue_items || []).forEach(id => { cost += resolve(id); });
  cost += t.prizepool_total || 0;
  return cost;
}

const DEFAULT_PRIZE_BREAKDOWN = [
  { place: 1, label: '1st Place', cash: 0, item_ids: [] },
  { place: 2, label: '2nd Place', cash: 0, item_ids: [] },
  { place: 3, label: '3rd Place', cash: 0, item_ids: [] },
];

export default function TournamentBuilder() {
  const [user, setUser] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [tournament, setTournament] = useState({
    name: '',
    game: '',
    format: '',
    max_teams: 8,
    participant_type: 'team',
    schedule: '',
    description: '',
    is_offline: false,
    venue: '',
    organizer_brand: {},
    teams: [],
    invited_teams: [],
    talents: [],
    branding_items: [],
    production_items: [],
    prizepool_items: [],
    tournament_image: '',
    stream_embed_url: '',
    signup_rules: '',
    total_cost: 0,
    prizepool_total: 0,
    platform_fee: 0,
    platform_fee_percent: 15,
    status: 'draft',
    tournament_type: 'solo',
    main_organizer_id: null,
    organizer_contribution: 0,
    main_organizer_percent: 33,
    sponsorship_enabled: false,
    venue_items: [],
    player_invites: [],
    prizepool_coins: 0,
    prize_breakdown: DEFAULT_PRIZE_BREAKDOWN,
  });
  // Shared tournament commitment state
  const [commitmentPercent, setCommitmentPercent] = useState(33);
  const [commitmentConfirmed, setCommitmentConfirmed] = useState(false);
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState(null);
  const { toast } = useToast();
  const GAMES = useGames();
  // Ref to keep autosave closure fresh — always points to latest tournament state
  const tournamentRef = useRef(tournament);
  useEffect(() => { tournamentRef.current = tournament; }, [tournament]);
  // Flag to prevent existingTournament from overwriting user edits after first load
  const loadedRef = useRef(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await apiCall('/auth/me');
      setUser(userData);
    } catch (e) {
      navigate('/organizer/dashboard');
    }
  };

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await OrganizerProfile.list({ user_id: user.id });
      const profiles = Array.isArray(res) ? res : res?.profiles || res?.data || [];
      return profiles[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: existingTournament } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => Tournament.get(tournamentId),
    enabled: !!tournamentId,
  });

  useEffect(() => {
    if (loadedRef.current) return; // Never overwrite user edits after first load
    if (existingTournament) {
      setTournament({
        ...existingTournament,
        // Ensure arrays are never null
        invited_teams: existingTournament.invited_teams || [],
        player_invites: existingTournament.player_invites || [],
        talents: existingTournament.talents || [],
        branding_items: existingTournament.branding_items || [],
        production_items: existingTournament.production_items || [],
        prizepool_items: existingTournament.prizepool_items || [],
        venue_items: existingTournament.venue_items || [],
        prize_breakdown: existingTournament.prize_breakdown || [
          { place: 1, label: '1st Place', cash: 0, item_ids: [] },
          { place: 2, label: '2nd Place', cash: 0, item_ids: [] },
          { place: 3, label: '3rd Place', cash: 0, item_ids: [] },
        ],
      });
      if (existingTournament.tournament_type === 'shared') {
        setCommitmentPercent(existingTournament.radar_funding_percent || 33);
        setCommitmentConfirmed(true);
      }
      loadedRef.current = true;
    } else if (profile) {
      setTournament(prev => ({
        ...prev,
        organizer_brand: {
          name: profile.brand_name || '',
          logo: profile.brand_logo || '',
          primary_color: profile.primary_color || '#ff1a1a',
          secondary_color: profile.secondary_color || '#0a0a0a',
        }
      }));
      loadedRef.current = true;
    }
  }, [existingTournament, profile]);

  // Autosave every 30 seconds — uses ref so closure is always fresh
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);
  const tournamentIdRef = useRef(tournamentId);
  useEffect(() => { tournamentIdRef.current = tournamentId; }, [tournamentId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = tournamentRef.current;
      const u = userRef.current;
      const tId = tournamentIdRef.current;
      if (!t?.name || !u?.id) return;
      const subtotal = calcSubtotal(t);
      const fee = Math.round(subtotal * 0.15);
      const data = {
        ...t,
        organizer_id: u.id,
        participant_type: t.participant_type || 'team',
        total_cost: subtotal + fee,
        platform_fee: fee,
      };
      const save = tId ? Tournament.update(tId, data) : Tournament.create(data);
      save.then((result) => {
        setLastSaved(new Date());
        if (!tId && result?.id) {
          navigate(`/organizer/tournaments/new/${result.id}`, { replace: true });
        }
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: allTeams = [] } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => Team.list('-created_date').then(d => Array.isArray(d) ? d : d?.teams || d?.data || []),
  });

  const { data: approvedServices = [] } = useQuery({
    queryKey: ['approved-services'],
    queryFn: () => Service.list({ status: 'approved' }).then(d => Array.isArray(d) ? d : d?.services || d?.data || []),
  });

  const { data: allGamers = [] } = useQuery({
    queryKey: ['all-gamers'],
    queryFn: () => GamerProfile.list({}).then(d => Array.isArray(d) ? d : d?.gamers || d?.profiles || d?.data || []),
  });

  const brandingItems = approvedServices.filter(i => i.category === 'Branding');
  const productionItems = approvedServices.filter(i => i.category === 'Production');
  const venueItems = approvedServices.filter(i => i.category === 'Venue');
  const talentItems = approvedServices.filter(i => i.category === 'Talent');
  const marketingItems = approvedServices.filter(i => i.category === 'Marketing');
  const prizepoolItems = [];
  const talents = talentItems;

  const saveTournamentMutation = useMutation({
    mutationFn: async () => {
      const subtotal = calculateSubtotal();
      const fee = calculatePlatformFee();
      const data = {
        ...tournament,
        organizer_id: user?.id,
        participant_type: tournament.participant_type || 'team',
        total_cost: subtotal + fee,
        platform_fee: fee,
        venue_items: tournament.venue_items || [],
        player_invites: tournament.player_invites || [],
        prizepool_coins: tournament.prizepool_coins || 0,
        prize_breakdown: tournament.prize_breakdown || DEFAULT_PRIZE_BREAKDOWN,
      };
      if (tournamentId) {
        return Tournament.update(tournamentId, data);
      } else {
        return Tournament.create(data);
      }
    },
    onSuccess: (result) => {
      if (!tournamentId && result?.id) {
        navigate(`/organizer/tournaments/new/${result.id}`, { replace: true });
      }
      setLastSaved(new Date());
      queryClient.invalidateQueries(['organizer-tournaments']);
      toast({ title: 'Draft saved', description: 'Your tournament has been saved as a draft.', duration: 5000 });
    },
    onError: (err) => {
      console.error('[save tournament]', err);
      toast({ title: 'Save failed', description: err.message || 'Could not save tournament.', variant: 'destructive', duration: 5000 });
    }
  });

  const publishTournamentMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Save tournament with all fields (including radar funding percent for shared)
      const dataToSave = {
        ...tournament,
        organizer_id: user?.id,
        main_organizer_id: user?.id,
        participant_type: tournament.participant_type || 'team',
        radar_funding_percent: tournament.tournament_type === 'shared' ? commitmentPercent : 100,
      };

      let tId = tournamentId;
      if (tId) {
        await Tournament.update(tId, dataToSave);
      } else {
        const created = await Tournament.create(dataToSave);
        if (!created?.id) throw new Error('Failed to create tournament. Please try again.');
        tId = created.id;
      }

      // Step 2: Call backend publish endpoint — handles TournamentOrder, Bill, SponsorshipRadar atomically
      await Tournament.publish(tId);

      queryClient.invalidateQueries(['organizer-tournaments']);
      return tId;
    },
    onSuccess: () => {
      toast({ title: 'Tournament published!', description: 'Your tournament is now live.', duration: 5000 });
      navigate('/organizer/tournaments');
    },
    onError: (err) => {
      console.error('[publish tournament]', err);
      toast({ title: 'Publish failed', description: err.message || 'Could not publish tournament.', variant: 'destructive', duration: 5000 });
    }
  });

  const calculateSubtotal = () => calcSubtotal(tournament, approvedServices);
  const calculatePlatformFee = () => Math.round(calculateSubtotal() * 0.15);
  const calculateTotalCost = () => calculateSubtotal() + calculatePlatformFee();
  // kept for sidebar display only
  const calculateItemsSubtotal = () => {
    let cost = 0;
    (tournament.talents || []).forEach(t => { cost += t.price || 0; });
    ['branding_items','production_items','prizepool_items','venue_items'].forEach(field => {
      (tournament[field] || []).forEach(id => {
        cost += approvedServices.find(i => i.id === id)?.price || 0;
      });
    });
    return cost;
  };


  const addTeamInvite = (teamId) => {
    if (!tournament.invited_teams?.includes(teamId)) {
      setTournament(prev => ({
        ...prev,
        invited_teams: [...(prev.invited_teams || []), teamId]
      }));
    }
  };

  const removeTeamInvite = (teamId) => {
    setTournament(prev => ({
      ...prev,
      invited_teams: prev.invited_teams?.filter(id => id !== teamId) || []
    }));
  };

  const selectAllTeams = () => {
    const gameTeams = allTeams.filter(t => t.games?.includes(tournament.game));
    setTournament(prev => ({
      ...prev,
      invited_teams: gameTeams.map(t => t.id)
    }));
  };

  const addTalent = (talent) => {
    if (!tournament.talents?.find(t => t.user_id === talent.user_id)) {
      setTournament(prev => ({
        ...prev,
        talents: [...(prev.talents || []), {
          user_id: talent.user_id || talent.provider_id,
          category: talent.category || 'Talent',
          price: talent.price || 0
        }]
      }));
    }
  };

  const removeTalent = (userId) => {
    setTournament(prev => ({
      ...prev,
      talents: prev.talents?.filter(t => t.user_id !== userId) || []
    }));
  };

  const toggleMarketplaceItem = (itemId, category) => {
    const field = `${category}_items`;
    setTournament(prev => {
      const items = prev[field] || [];
      if (items.includes(itemId)) {
        return { ...prev, [field]: items.filter(id => id !== itemId) };
      } else {
        return { ...prev, [field]: [...items, itemId] };
      }
    });
  };

  const renderStageContent = () => {
    const stage = STAGES[currentStage];

    switch (stage.id) {
      case 'game':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Tournament Name *</label>
              <Input
                value={tournament.name}
                onChange={(e) => setTournament({ ...tournament, name: e.target.value })}
                placeholder="e.g. HERU Championship 2024"
                className="bg-zinc-800 border-zinc-700 text-white text-lg"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Game *</label>
              <Select value={GAMES.includes(tournament.game) ? tournament.game : tournament.game ? '__other__' : ''} onValueChange={(v) => {
                if (v === '__other__') {
                  setTournament({ ...tournament, game: '' });
                } else {
                  setTournament({ ...tournament, game: v });
                }
              }}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {GAMES.map(game => (
                    <SelectItem key={game} value={game}>{game}</SelectItem>
                  ))}
                  <SelectItem value="__other__">Other...</SelectItem>
                </SelectContent>
              </Select>
              {!GAMES.includes(tournament.game) && tournament.game !== '' && (
                <Input
                  value={tournament.game}
                  onChange={(e) => setTournament({ ...tournament, game: e.target.value })}
                  placeholder="Enter game name..."
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                />
              )}
              {tournament.game === '' && (
                <Input
                  onChange={(e) => setTournament({ ...tournament, game: e.target.value })}
                  placeholder="Enter game name..."
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                />
              )}
            </div>

            {/* Participant Type Toggle */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Participant Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTournament(prev => ({ ...prev, participant_type: 'team' }))}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    tournament.participant_type !== 'player'
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-gray-400 hover:border-zinc-500'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">Team vs Team</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTournament(prev => ({ ...prev, participant_type: 'player' }))}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    tournament.participant_type === 'player'
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-zinc-700 bg-zinc-800 text-gray-400 hover:border-zinc-500'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-medium">1v1 (Solo Players)</span>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Format *</label>
                <Select value={tournament.format} onValueChange={(v) => setTournament({ ...tournament, format: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {FORMATS.map(format => (
                      <SelectItem key={format} value={format}>{format}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">
                  {tournament.participant_type === 'player' ? 'Max Players *' : 'Max Teams *'}
                </label>
                <Input
                  type="number"
                  value={tournament.max_teams}
                  onChange={(e) => setTournament({ ...tournament, max_teams: parseInt(e.target.value) })}
                  min={2}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Schedule</label>
              <Input
                type="datetime-local"
                value={tournament.schedule}
                onChange={(e) => setTournament({ ...tournament, schedule: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Description</label>
              <Textarea
                value={tournament.description}
                onChange={(e) => setTournament({ ...tournament, description: e.target.value })}
                placeholder="Describe your tournament..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Tournament Cover Image</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  <Image className="w-4 h-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const { file_url } = await uploadFile(file);
                        setTournament(prev => ({ ...prev, tournament_image: file_url }));
                      } catch (err) {
                        console.error('Upload failed:', err);
                      }
                    }}
                  />
                </label>
                <span className="text-xs text-gray-500">or paste URL below</span>
              </div>
              <Input
                value={tournament.tournament_image}
                onChange={(e) => setTournament({ ...tournament, tournament_image: e.target.value })}
                placeholder="https://... (cover image shown on tournament page)"
                className="bg-zinc-800 border-zinc-700 text-white mt-2"
              />
              {tournament.tournament_image && (
                <div className="mt-2 h-32 rounded-lg overflow-hidden bg-zinc-800">
                  <img src={tournament.tournament_image} alt="Preview" className="w-full h-full object-cover opacity-80" />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Stream Embed URL (optional)</label>
              <Input
                value={tournament.stream_embed_url}
                onChange={(e) => setTournament({ ...tournament, stream_embed_url: e.target.value })}
                placeholder="https://player.twitch.tv/?channel=... or YouTube embed URL"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Stream will appear on the tournament page when live</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-2">Signup Rules</label>
              <Textarea
                value={tournament.signup_rules}
                onChange={(e) => setTournament({ ...tournament, signup_rules: e.target.value })}
                placeholder="Rules for teams joining this tournament..."
                className="bg-zinc-800 border-zinc-700 text-white"
                rows={3}
              />
            </div>
          </div>
        );

      case 'branding': {
        const totalCost = calculateTotalCost();
        const commitAmount = Math.round(totalCost * (commitmentPercent / 100));
        return (
          <div className="space-y-6">
            {/* Brand Settings */}
            <FloatingPanel className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Brand Settings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Brand Name</label>
                  <Input
                    value={tournament.organizer_brand?.name || ''}
                    onChange={(e) => setTournament({ 
                      ...tournament, 
                      organizer_brand: { ...tournament.organizer_brand, name: e.target.value }
                    })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Logo URL</label>
                  <Input
                    value={tournament.organizer_brand?.logo || ''}
                    onChange={(e) => setTournament({ 
                      ...tournament, 
                      organizer_brand: { ...tournament.organizer_brand, logo: e.target.value }
                    })}
                    placeholder="https://..."
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </FloatingPanel>

            {/* Brand Exposure Packages */}
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-red-500" />
                Brand Exposure Packages
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Get maximum exposure for your brand with professional branding packages
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {brandingItems.map(item => (
                  <GameCard 
                    key={item.id}
                    className={`p-4 cursor-pointer ${tournament.branding_items?.includes(item.id) ? 'border-red-500' : ''}`}
                    onClick={() => toggleMarketplaceItem(item.id, 'branding')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold">{item.title}</h4>
                      {tournament.branding_items?.includes(item.id) && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{item.description}</p>
                    <p className="text-red-400 font-bold">EGP {item.price}</p>
                  </GameCard>
                ))}
              </div>
              {brandingItems.length === 0 && (
                <p className="text-gray-500 text-center py-8">No branding packages available</p>
              )}
            </FloatingPanel>

            {/* Shared Tournament Info — reminder if shared is selected at top */}
            {tournament.tournament_type === 'shared' && (
              <FloatingPanel className="p-4 border border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">Shared Tournament</span>
                  <span className="text-gray-500">— commitment set to {commitmentPercent}% above.</span>
                  {!commitmentConfirmed && (
                    <span className="text-orange-400 text-xs ml-auto">Lock in your commitment above before publishing.</span>
                  )}
                </div>
              </FloatingPanel>
            )}
          </div>
        );
      }

      case 'teams': {
        const isPlayer = tournament.participant_type === 'player'; // eslint-disable-line
        return (
          <div className="space-y-6">
            {isPlayer ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Invite Players (1v1)</h3>
                    <p className="text-gray-400 text-sm">
                      Invited: {tournament.player_invites?.length || 0} / {tournament.max_teams} players
                    </p>
                  </div>
                  <GlowButton variant="secondary" size="sm" onClick={() => {
                    const ids = allGamers.map(g => g.user_id).filter(Boolean);
                    setTournament(prev => ({ ...prev, player_invites: ids.slice(0, prev.max_teams) }));
                  }}>
                    Invite All
                  </GlowButton>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allGamers.map(gamer => {
                    const invited = tournament.player_invites?.includes(gamer.user_id);
                    return (
                      <GameCard
                        key={gamer.id}
                        className={`p-4 cursor-pointer ${invited ? 'border-red-500' : ''}`}
                        onClick={() => {
                          setTournament(prev => ({
                            ...prev,
                            player_invites: invited
                              ? (prev.player_invites || []).filter(id => id !== gamer.user_id)
                              : [...(prev.player_invites || []), gamer.user_id],
                          }));
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {gamer.avatar ? <img src={gamer.avatar} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-red-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium truncate">{gamer.username || 'Player'}</p>
                              {invited && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                            </div>
                            {gamer.games?.length > 0 && <HexBadge className="text-[10px]">{gamer.games[0]}</HexBadge>}
                          </div>
                        </div>
                      </GameCard>
                    );
                  })}
                  {allGamers.length === 0 && (
                    <div className="col-span-3 text-center py-10 text-gray-500">No registered players found yet.</div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Invite Teams</h3>
                    <p className="text-gray-400 text-sm">
                      Selected: {tournament.invited_teams?.length || 0} / {tournament.max_teams} teams
                    </p>
                  </div>
                  <GlowButton variant="secondary" size="sm" onClick={selectAllTeams}>
                    Select All {tournament.game} Teams
                  </GlowButton>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTeams.filter(t => !tournament.game || t.games?.includes(tournament.game)).map(team => (
                    <GameCard
                      key={team.id}
                      className={`p-4 cursor-pointer ${tournament.invited_teams?.includes(team.id) ? 'border-red-500' : ''}`}
                      onClick={() => tournament.invited_teams?.includes(team.id) ? removeTeamInvite(team.id) : addTeamInvite(team.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium truncate">{team.name}</p>
                            {tournament.invited_teams?.includes(team.id) && <Check className="w-4 h-4 text-green-400 flex-shrink-0" />}
                          </div>
                          <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                        </div>
                      </div>
                    </GameCard>
                  ))}
                  {allTeams.filter(t => !tournament.game || t.games?.includes(tournament.game)).length === 0 && (
                    <div className="col-span-3 text-center py-10 text-gray-500">No teams found for {tournament.game || 'this game'}.</div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      }

      case 'talent':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Hire Live Talent</h3>
              <p className="text-gray-400 text-sm">Add professional casters, hosts, and analysts</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {talents.map(talent => (
                <GameCard 
                  key={talent.id}
                  className={`p-4 cursor-pointer ${tournament.talents?.find(t => t.user_id === talent.user_id) ? 'border-red-500' : ''}`}
                  onClick={() => tournament.talents?.find(t => t.user_id === talent.user_id) ? removeTalent(talent.user_id) : addTalent(talent)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
                      {talent.avatar ? (
                        <img src={talent.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Star className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{talent.username}</p>
                        {tournament.talents?.find(t => t.user_id === talent.user_id) && (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <HexBadge className="text-[10px] mt-1">{talent.category || 'Talent'}</HexBadge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">
                      ★ {talent.talent_rating || 'New'}
                    </span>
                    <span className="text-red-400 font-bold">EGP {talent.price || 0}/event</span>
                  </div>
                </GameCard>
              ))}
            </div>

            {talents.length === 0 && (
              <FloatingPanel className="p-8 text-center">
                <Star className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400">No talents available yet</p>
              </FloatingPanel>
            )}
          </div>
        );

      case 'production':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Production Services</h3>
              <p className="text-gray-400 text-sm">Add stream overlays, graphics, and production elements</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {productionItems.map(item => (
                <GameCard 
                  key={item.id}
                  className={`p-4 cursor-pointer ${tournament.production_items?.includes(item.id) ? 'border-red-500' : ''}`}
                  onClick={() => toggleMarketplaceItem(item.id, 'production')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">{item.title}</h4>
                    {tournament.production_items?.includes(item.id) && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{item.description}</p>
                  <p className="text-red-400 font-bold">EGP {item.price}</p>
                </GameCard>
              ))}
            </div>

            {productionItems.length === 0 && (
              <FloatingPanel className="p-8 text-center">
                <Video className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400">No production services available</p>
              </FloatingPanel>
            )}
          </div>
        );

      case 'venue':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Switch
                checked={tournament.is_offline}
                onCheckedChange={(checked) => setTournament({ ...tournament, is_offline: checked })}
              />
              <label className="text-white">This is an offline/LAN tournament</label>
            </div>

            {tournament.is_offline && (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Venue Name</label>
                  <Input
                    value={tournament.venue}
                    onChange={(e) => setTournament({ ...tournament, venue: e.target.value })}
                    placeholder="e.g. LA Convention Center"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Venue Packages</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {venueItems.map(item => (
                      <GameCard 
                        key={item.id}
                        className={`p-4 cursor-pointer ${tournament.venue_items?.includes(item.id) ? 'border-red-500' : ''}`}
                        onClick={() => toggleMarketplaceItem(item.id, 'venue')}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold">{item.title}</h4>
                          {tournament.venue_items?.includes(item.id) && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mb-2">{item.description}</p>
                        <p className="text-red-400 font-bold">EGP {item.price}</p>
                        </GameCard>
                        ))}
                        </div>
                        </div>
                        </>
                        )}
                        </div>
                        );

      case 'prizepool': {
        const breakdown = tournament.prize_breakdown || DEFAULT_PRIZE_BREAKDOWN;
        const updateBreakdown = (idx, field, val) => {
          const updated = breakdown.map((b, i) => i === idx ? { ...b, [field]: val } : b);
          setTournament(prev => ({ ...prev, prize_breakdown: updated }));
        };
        const totalCashBreakdown = breakdown.reduce((s, b) => s + (b.cash || 0), 0);
        return (
          <div className="space-y-6">
            {/* Total Pool */}
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Total Prize Pool
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Total Cash Pool (EGP)</label>
                  <Input type="number" value={tournament.prizepool_total || ''} onChange={(e) => setTournament(prev => ({ ...prev, prizepool_total: parseFloat(e.target.value) || 0 }))} placeholder="5000" className="bg-zinc-800 border-zinc-700 text-white" />
                  {totalCashBreakdown > 0 && (totalCashBreakdown !== (tournament.prizepool_total || 0)) && (
                    <p className="text-xs text-yellow-400 mt-1">⚠ Breakdown total (EGP {totalCashBreakdown.toLocaleString()}) doesn't match pool total.</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">HERU Coins Prize Pool</label>
                  <Input type="number" value={tournament.prizepool_coins || ''} onChange={(e) => setTournament(prev => ({ ...prev, prizepool_coins: parseInt(e.target.value) || 0 }))} placeholder="1000" className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
            </FloatingPanel>

            {/* Per-place breakdown */}
            <FloatingPanel className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" /> Prize Breakdown by Place
                </h3>
                <GlowButton size="sm" variant="secondary" onClick={() => {
                  setTournament(prev => ({
                    ...prev,
                    prize_breakdown: [...(prev.prize_breakdown || DEFAULT_PRIZE_BREAKDOWN), { place: (prev.prize_breakdown?.length || 3) + 1, label: `${(prev.prize_breakdown?.length || 3) + 1}th Place`, cash: 0, item_ids: [] }]
                  }));
                }}>
                  <Plus className="w-3 h-3" /> Add Place
                </GlowButton>
              </div>
              <div className="space-y-4">
                {breakdown.map((prize, idx) => (
                  <div key={idx} className="border border-zinc-700 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${prize.place}`}
                        </span>
                        <Input value={prize.label} onChange={(e) => updateBreakdown(idx, 'label', e.target.value)} className="bg-zinc-800 border-zinc-700 text-white w-36 text-sm" />
                      </div>
                      {idx > 2 && (
                        <button onClick={() => setTournament(prev => ({ ...prev, prize_breakdown: prev.prize_breakdown.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-300">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Cash Prize (EGP)</label>
                        <Input type="number" value={prize.cash || ''} onChange={(e) => updateBreakdown(idx, 'cash', parseFloat(e.target.value) || 0)} placeholder="0" className="bg-zinc-800 border-zinc-700 text-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1">Physical Prizes from Shop</label>
                        <div className="flex flex-wrap gap-1">
                          {(prize.item_ids || []).map((iid, ii) => {
                            const item = approvedServices.find(m => m.id === iid);
                            return item ? (
                              <span key={ii} className="inline-flex items-center gap-1 text-xs bg-zinc-700 text-gray-300 px-2 py-0.5 rounded">
                                {item.title}
                                <button onClick={() => updateBreakdown(idx, 'item_ids', prize.item_ids.filter((_, j) => j !== ii))} className="text-red-400 ml-1"><X className="w-3 h-3" /></button>
                              </span>
                            ) : null;
                          })}
                          <select
                            className="text-xs bg-zinc-800 border border-zinc-700 text-gray-300 px-2 py-0.5 rounded cursor-pointer"
                            value=""
                            onChange={(e) => { if (e.target.value) updateBreakdown(idx, 'item_ids', [...(prize.item_ids || []), e.target.value]); }}
                          >
                            <option value="">+ Add item</option>
                            {prizepoolItems.map(item => (
                              <option key={item.id} value={item.id}>{item.title} — EGP {item.price}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FloatingPanel>

            {/* Shop items for prizepool */}
            {prizepoolItems.length > 0 && (
              <FloatingPanel className="p-6">
                <h3 className="text-lg font-bold text-white mb-4">Available Prize Items</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prizepoolItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="w-10 h-10 rounded bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Award className="w-5 h-5 text-zinc-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.title}</p>
                        <p className="text-red-400 text-xs font-bold">EGP {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </FloatingPanel>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white">
              {tournamentId ? 'Edit Tournament' : 'Build Tournament'}
            </h1>
            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
              Stage {currentStage + 1}/{STAGES.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-gray-400">{tournament.name || 'Untitled Tournament'}</p>
            {lastSaved && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {saveTournamentMutation.isPending && (
              <span className="text-xs text-red-400 animate-pulse">Saving...</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <GlowButton
            variant="ghost"
            onClick={() => {
              saveTournamentMutation.mutate();
              setLastSaved(new Date());
            }}
          >
            <Save className="w-4 h-4" /> Save Draft
          </GlowButton>
          <GlowButton
            onClick={() => {
              const missing = [];
              if (!profile?.brand_name) missing.push('Brand Name');
              if (!profile?.brand_logo) missing.push('Brand Logo');
              if (missing.length > 0) {
                toast({
                  title: 'Profile incomplete',
                  description: `Please fill in these fields on your Profile page before publishing: ${missing.join(', ')}`,
                  variant: 'destructive',
                  duration: 7000,
                });
                return;
              }
              publishTournamentMutation.mutate();
            }}
            disabled={!tournament.name || !tournament.game || publishTournamentMutation.isPending}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
          >
            {publishTournamentMutation.isPending ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Publishing...</>
            ) : (
              <><Send className="w-4 h-4" /> {tournament.tournament_type === 'shared' ? 'Publish to Radar' : 'Publish'}</>
            )}
          </GlowButton>
        </div>
      </div>

      {/* Tournament Type Selection — Solo vs Shared */}
      <div className="mb-8">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div
            onClick={() => {
              setTournament(prev => ({ ...prev, tournament_type: 'solo', sponsorship_enabled: false }));
              setCommitmentConfirmed(false);
            }}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
              tournament.tournament_type === 'solo'
                ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/10'
                : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tournament.tournament_type === 'solo' ? 'bg-green-500/20' : 'bg-zinc-800'
                }`}>
                  <Trophy className={`w-5 h-5 ${tournament.tournament_type === 'solo' ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <h3 className="text-lg font-bold text-white">Solo Tournament</h3>
              </div>
              {tournament.tournament_type === 'solo' && <Check className="w-6 h-6 text-green-400" />}
            </div>
            <p className="text-gray-400 text-sm ml-13">You fund 100% of the tournament cost.</p>
          </div>

          <div
            onClick={() => setTournament(prev => ({ ...prev, tournament_type: 'shared', sponsorship_enabled: true }))}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
              tournament.tournament_type === 'shared'
                ? 'border-yellow-500 bg-yellow-500/10 shadow-lg shadow-yellow-500/10'
                : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tournament.tournament_type === 'shared' ? 'bg-yellow-500/20' : 'bg-zinc-800'
                }`}>
                  <Zap className={`w-5 h-5 ${tournament.tournament_type === 'shared' ? 'text-yellow-400' : 'text-gray-500'}`} />
                </div>
                <h3 className="text-lg font-bold text-white">Shared Tournament</h3>
              </div>
              {tournament.tournament_type === 'shared' && <Check className="w-6 h-6 text-yellow-400" />}
            </div>
            <p className="text-gray-400 text-sm ml-13">Get co-organizers or sponsors. Min 33% commitment.</p>
            <span className="inline-block mt-2 ml-13 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">Sponsorship Radar</span>
          </div>
        </div>

        {/* Shared commitment slider — shown inline when shared is selected */}
        {tournament.tournament_type === 'shared' && (
          <div className={`rounded-xl border p-5 transition-all ${
            commitmentConfirmed ? 'border-green-500/40 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {commitmentConfirmed
                ? <Check className="w-5 h-5 text-green-400" />
                : <Lock className="w-5 h-5 text-yellow-400" />}
              <h4 className="text-white font-bold">Your Commitment</h4>
              <span className="text-gray-500 text-xs ml-2">
                {commitmentPercent === 33 && '2 co-organizer slots (33% each)'}
                {commitmentPercent > 33 && commitmentPercent < 66 && `1 co-org slot (${100 - commitmentPercent}%)`}
                {commitmentPercent === 66 && '1 sponsor slot (66%)'}
                {commitmentPercent > 66 && commitmentPercent < 100 && `1 slot (${100 - commitmentPercent}%)`}
                {commitmentPercent === 100 && 'No slots — effectively solo'}
              </span>
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-sm">Your commitment: <span className="text-white font-bold">{commitmentPercent}%</span></span>
              <span className="text-yellow-400 font-bold text-lg">EGP {Math.round(calculateTotalCost() * (commitmentPercent / 100)).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={33}
              max={100}
              value={commitmentPercent}
              onChange={(e) => {
                setCommitmentPercent(parseInt(e.target.value));
                setCommitmentConfirmed(false);
              }}
              className="w-full accent-yellow-400 mb-1"
              disabled={commitmentConfirmed}
            />
            <div className="flex justify-between text-xs text-gray-500 mb-3">
              <span>33% (min)</span>
              <span>66%</span>
              <span>100%</span>
            </div>

            <div className="flex items-center gap-3">
              {!commitmentConfirmed ? (
                <GlowButton size="sm" onClick={() => setCommitmentConfirmed(true)}>
                  <Check className="w-4 h-4" /> Lock In Commitment
                </GlowButton>
              ) : (
                <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                  <Check className="w-4 h-4" /> Locked at {commitmentPercent}% — EGP {Math.round(calculateTotalCost() * (commitmentPercent / 100)).toLocaleString()}
                  <button onClick={() => setCommitmentConfirmed(false)} className="ml-2 text-gray-500 hover:text-white text-xs underline">Edit</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STAGES.map((stage, i) => (
          <button
            key={stage.id}
            onClick={() => setCurrentStage(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              i === currentStage
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/10'
                : i < currentStage
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-zinc-800/50 text-gray-500 hover:bg-zinc-800 hover:text-gray-300'
            }`}
          >
            <stage.icon className="w-4 h-4" />
            {stage.label}
            {i < currentStage && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <FloatingPanel className="p-6">
            {renderStageContent()}
          </FloatingPanel>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <GlowButton
              variant="ghost"
              onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </GlowButton>
            {currentStage === STAGES.length - 1 ? (
              <GlowButton
                onClick={() => publishTournamentMutation.mutate()}
                disabled={!tournament.name || !tournament.game || publishTournamentMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-red-700 border-red-500 shadow-lg shadow-red-900/30 px-8"
              >
                {publishTournamentMutation.isPending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Publishing...</>
                ) : (
                  <><Send className="w-4 h-4" /> {tournament.tournament_type === 'shared' ? 'Publish to Radar' : 'Publish Tournament'}</>
                )}
              </GlowButton>
            ) : (
              <GlowButton
                onClick={() => setCurrentStage(Math.min(STAGES.length - 1, currentStage + 1))}
              >
                Next <ChevronRight className="w-4 h-4" />
              </GlowButton>
            )}
          </div>
        </div>

        {/* Sidebar - Cost Summary */}
        <div>
          <FloatingPanel className="p-5 sticky top-4 border border-red-500/20" glowBorder>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-400" />
              Cost Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              {tournament.talents?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Talent ({tournament.talents.length})</span>
                  <span className="text-white">EGP {tournament.talents.reduce((sum, t) => sum + (t.price || 0), 0)}</span>
                </div>
              )}
              {tournament.branding_items?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Branding ({tournament.branding_items.length})</span>
                  <span className="text-white">
                  EGP {tournament.branding_items.reduce((sum, id) => {
                      const item = approvedServices.find(i => i.id === id);
                      return sum + (item?.price || 0);
                    }, 0)}
                  </span>
                </div>
              )}
              {tournament.production_items?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Production ({tournament.production_items.length})</span>
                  <span className="text-white">
                  EGP {tournament.production_items.reduce((sum, id) => {
                      const item = approvedServices.find(i => i.id === id);
                      return sum + (item?.price || 0);
                    }, 0)}
                  </span>
                </div>
              )}
              {tournament.prizepool_items?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Prizepool ({tournament.prizepool_items.length})</span>
                  <span className="text-white">
                  EGP {tournament.prizepool_items.reduce((sum, id) => {
                      const item = approvedServices.find(i => i.id === id);
                      return sum + (item?.price || 0);
                    }, 0)}
                  </span>
                </div>
              )}
              {tournament.venue_items?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Venue ({tournament.venue_items.length})</span>
                  <span className="text-white">
                  EGP {tournament.venue_items.reduce((sum, id) => {
                      const item = approvedServices.find(i => i.id === id);
                      return sum + (item?.price || 0);
                    }, 0)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-800 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Items Subtotal</span>
                <span className="text-white">EGP {calculateItemsSubtotal().toLocaleString()}</span>
              </div>
              {(tournament.prizepool_total || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-400">Prize Pool</span>
                  <span className="text-yellow-400 font-bold">EGP {(tournament.prizepool_total || 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">EGP {calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Platform Fee (15%)</span>
                <span className="text-red-400 font-medium">EGP {calculatePlatformFee().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-red-500/30 pt-2">
                <span className="text-gray-300">Grand Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-300">EGP {calculateTotalCost().toLocaleString()}</span>
              </div>
            </div>

            {tournament.tournament_type === 'shared' && commitmentPercent > 0 && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-300">Your Share ({commitmentPercent}%)</span>
                  <span className="text-red-400 font-bold">EGP {Math.round(calculateTotalCost() * (commitmentPercent / 100)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Needed from co-orgs</span>
                  <span className="text-gray-400">EGP {Math.round(calculateTotalCost() * ((100 - commitmentPercent) / 100)).toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-gray-500 mb-2">Summary</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• {tournament.invited_teams?.length || 0} teams invited</li>
                <li>• {tournament.talents?.length || 0} talents hired</li>
                <li>• {tournament.prizepool_items?.length || 0} prizes</li>
                <li>• Type: {tournament.tournament_type === 'shared' ? 'Shared (Radar)' : 'Solo'}</li>
              </ul>
            </div>
          </FloatingPanel>
        </div>
      </div>
    </>
  );
}