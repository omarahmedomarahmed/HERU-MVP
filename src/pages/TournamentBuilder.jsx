import React, { useState, useEffect } from 'react';
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
import { GamerProfile, MarketplaceItem, OrganizerProfile, Team, Tournament, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'
import { uploadFile } from '@/lib/uploadFile'

import {
  Trophy, Gamepad2, Users, Star, Palette, MapPin, Award,
  ChevronRight, ChevronLeft, Check, Plus, X, Save, Send,
  Eye, Megaphone, Image, Video, Share2, DollarSign, Zap, Lock, AlertCircle
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

const GAMES = ['Valorant', 'CS2', 'League of Legends', 'Dota 2', 'Rocket League', 'Apex Legends', 'Fortnite', 'Call of Duty', 'Rainbow Six Siege', 'Overwatch 2'];
const FORMATS = ['Single Elimination', 'Double Elimination', 'Round Robin', 'Swiss', 'Best of 1', 'Best of 3', 'Best of 5'];

export default function TournamentBuilder() {
  const [user, setUser] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [tournament, setTournament] = useState({
    name: '',
    game: '',
    format: '',
    max_teams: 8,
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
    main_organizer_percent: 30,
    on_radar: false,
  });
  // Shared tournament commitment state
  const [commitmentPercent, setCommitmentPercent] = useState(33);
  const [commitmentConfirmed, setCommitmentConfirmed] = useState(false);
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState(null);

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
      const profiles = await OrganizerProfile.list({ user_id: user.id });
      return profiles[0];
    },
    enabled: !!user?.id,
  });

  const { data: existingTournament } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => Tournament.get(tournamentId),
    enabled: !!tournamentId,
  });

  useEffect(() => {
    if (existingTournament) {
      setTournament(existingTournament);
    } else if (profile) {
      setTournament(prev => ({
        ...prev,
        organizer_brand: {
          name: profile.brand_name,
          logo: profile.brand_logo,
          primary_color: profile.primary_color || '#ff1a1a',
          secondary_color: profile.secondary_color || '#0a0a0a'
        }
      }));
    }
  }, [existingTournament, profile]);

  // Autosave every 30 seconds when tournament has a name
  useEffect(() => {
    if (!tournament.name || !user?.id) return;
    const interval = setInterval(() => {
      const data = { ...tournament, organizer_id: user?.id, total_cost: calculateTotalCost(), platform_fee: calculatePlatformFee() };
      const save = tournamentId
        ? Tournament.update(tournamentId, data)
        : Tournament.create(data);
      save.then((result) => {
        setLastSaved(new Date());
        if (!tournamentId && result?.id) {
          navigate(`/organizer/tournaments/new/${result.id}`, { replace: true });
        }
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [tournament.name, user?.id, tournamentId]);

  const { data: allTeams = [] } = useQuery({
    queryKey: ['all-teams'],
    queryFn: () => Team.list('-created_date'),
  });

  const { data: marketplaceItems = [] } = useQuery({
    queryKey: ['marketplace-items'],
    queryFn: () => MarketplaceItem.list({ is_active: true }),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ['talents'],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ is_talent: true });
      return profiles;
    },
  });

  const brandingItems = marketplaceItems.filter(i => i.category === 'branding');
  const productionItems = marketplaceItems.filter(i => i.category === 'production');
  const venueItems = marketplaceItems.filter(i => i.category === 'venue');
  const prizepoolItems = marketplaceItems.filter(i => i.category === 'prizepool');

  const saveTournamentMutation = useMutation({
    mutationFn: async () => {
      const data = { ...tournament, organizer_id: user?.id, total_cost: calculateTotalCost() };
      if (tournamentId) {
        return Tournament.update(tournamentId, data);
      } else {
        return Tournament.create(data);
      }
    },
    onSuccess: (result) => {
      if (!tournamentId && result?.id) {
        navigate(`/organizer/tournaments/new/${result.id}`);
      }
      queryClient.invalidateQueries(['organizer-tournaments']);
    }
  });

  const publishTournamentMutation = useMutation({
    mutationFn: async () => {
      // Step 1: Save tournament with all fields (including radar funding percent for shared)
      const dataToSave = {
        ...tournament,
        organizer_id: user?.id,
        main_organizer_id: user?.id,
        radar_funding_percent: tournament.tournament_type === 'shared' ? commitmentPercent : 100,
        main_organizer_percent: commitmentPercent,
      };

      let tId = tournamentId;
      if (tId) {
        await Tournament.update(tId, dataToSave);
      } else {
        const created = await Tournament.create(dataToSave);
        tId = created.id;
      }

      // Step 2: Call backend publish endpoint — handles TournamentOrder, Bill, SponsorshipRadar atomically
      await Tournament.publish(tId);

      queryClient.invalidateQueries(['organizer-tournaments']);
      return tId;
    },
    onSuccess: () => {
      navigate('/organizer/billing');
    }
  });

  const calculateItemsSubtotal = () => {
    let cost = 0;
    tournament.talents?.forEach(t => cost += t.price || 0);
    tournament.branding_items?.forEach(id => {
      const item = marketplaceItems.find(i => i.id === id);
      if (item) cost += item.price || 0;
    });
    tournament.production_items?.forEach(id => {
      const item = marketplaceItems.find(i => i.id === id);
      if (item) cost += item.price || 0;
    });
    tournament.prizepool_items?.forEach(id => {
      const item = marketplaceItems.find(i => i.id === id);
      if (item) cost += item.price || 0;
    });
    tournament.venue_items?.forEach(id => {
      const item = marketplaceItems.find(i => i.id === id);
      if (item) cost += item.price || 0;
    });
    return cost;
  };

  const calculateSubtotal = () => {
    return calculateItemsSubtotal() + (tournament.prizepool_total || 0);
  };

  const calculatePlatformFee = () => {
    return Math.round(calculateSubtotal() * 0.15);
  };

  const calculateTotalCost = () => {
    return calculateSubtotal() + calculatePlatformFee();
  };

  // Required items for shared tournaments: live_talent + production categories
  const requiredCategories = ['live_talent', 'production'];
  const requiredItems = marketplaceItems.filter(i => requiredCategories.includes(i.category));
  const requiredItemIds = requiredItems.map(i => i.id);
  const allRequiredSelected = requiredItemIds.length > 0 && requiredItemIds.every(id =>
    tournament.branding_items?.includes(id) ||
    tournament.production_items?.includes(id)
  );

  const sharedBrandingReady = commitmentConfirmed && allRequiredSelected;

  const isBrandingStage = STAGES[currentStage]?.id === 'branding';
  const canProceedFromBranding = tournament.tournament_type === 'solo' || sharedBrandingReady;

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
          user_id: talent.user_id,
          talent_type: talent.talent_type,
          price: talent.talent_price || 0
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
              <Select value={tournament.game} onValueChange={(v) => setTournament({ ...tournament, game: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {GAMES.map(game => (
                    <SelectItem key={game} value={game}>{game}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <label className="text-sm text-gray-400 block mb-2">Max Teams *</label>
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

            {/* Tournament Type & Funding */}
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-yellow-400" />
                Tournament Type & Funding
              </h3>
              <p className="text-gray-400 text-sm mb-4">How will this tournament be funded?</p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <GameCard 
                  className={`p-4 cursor-pointer ${tournament.tournament_type === 'solo' ? 'border-green-500' : ''}`}
                  onClick={() => {
                    setTournament({ ...tournament, tournament_type: 'solo', on_radar: false });
                    setCommitmentConfirmed(false);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-green-400" /> Solo Tournament
                    </h4>
                    {tournament.tournament_type === 'solo' && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  <p className="text-gray-500 text-sm">I'm funding this tournament entirely on my own.</p>
                </GameCard>
                <GameCard 
                  className={`p-4 cursor-pointer ${tournament.tournament_type === 'shared' ? 'border-yellow-500' : ''}`}
                  onClick={() => setTournament({ ...tournament, tournament_type: 'shared', on_radar: true })}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" /> Shared Tournament
                    </h4>
                    {tournament.tournament_type === 'shared' && <Check className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <p className="text-gray-500 text-sm">I want to co-organize and split costs with other organizers.</p>
                  <span className="inline-block mt-2 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">Sponsorship Radar</span>
                </GameCard>
              </div>

              {/* Shared Tournament — Commitment Flow */}
              {tournament.tournament_type === 'shared' && (
                <div className="space-y-6 border-t border-zinc-800 pt-5">
                  {/* Step A — Commit your 30% */}
                  <div className={`p-4 rounded-xl border ${commitmentConfirmed ? 'border-green-500/40 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {commitmentConfirmed
                        ? <Check className="w-5 h-5 text-green-400" />
                        : <Lock className="w-5 h-5 text-yellow-400" />}
                      <h4 className="text-white font-bold">Step A — Commit Your Share</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Minimum commitment is <span className="text-yellow-300 font-bold">33%</span>. This guarantees equal share for up to 2 co-organizers at 33% each.
                    </p>

                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Your commitment: <span className="text-white font-bold">{commitmentPercent}%</span></span>
                      <span className="text-yellow-400 font-bold text-lg">EGP {commitAmount.toLocaleString()}</span>
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
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>33% (min)</span>
                      <span>100%</span>
                    </div>
                    <div className="p-3 bg-zinc-900 rounded-lg text-sm mb-4 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Cost</span>
                        <span className="text-white font-bold">EGP {totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Your Share ({commitmentPercent}%)</span>
                        <span className="text-yellow-400 font-bold">EGP {commitAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-800 pt-1">
                        <span className="text-gray-400">Still Needed from Co-Organizers</span>
                        <span className="text-red-400 font-bold">EGP {Math.max(0, totalCost - commitAmount).toLocaleString()}</span>
                      </div>
                    </div>
                    {!commitmentConfirmed ? (
                      <GlowButton className="w-full" onClick={() => setCommitmentConfirmed(true)}>
                        <Check className="w-4 h-4" /> Commit My Share
                      </GlowButton>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <Check className="w-4 h-4" /> Commitment confirmed — EGP {commitAmount.toLocaleString()} ({commitmentPercent}%)
                        <button onClick={() => setCommitmentConfirmed(false)} className="ml-auto text-gray-500 hover:text-white text-xs">Edit</button>
                      </div>
                    )}
                  </div>

                  {/* Step B — Required Items */}
                  <div className={`p-4 rounded-xl border ${allRequiredSelected ? 'border-green-500/40 bg-green-500/5' : 'border-zinc-700 bg-zinc-900/30'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {allRequiredSelected
                        ? <Check className="w-5 h-5 text-green-400" />
                        : <AlertCircle className="w-5 h-5 text-orange-400" />}
                      <h4 className="text-white font-bold">Step B — Required Items for Shared Listing</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      These items are required for a shared tournament listing. All must be selected.
                    </p>
                    {requiredItems.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {requiredItems.map(item => {
                          const isSelected = tournament.branding_items?.includes(item.id) || tournament.production_items?.includes(item.id);
                          const field = item.category === 'live_talent' ? 'branding' : 'production';
                          return (
                            <GameCard
                              key={item.id}
                              className={`p-3 cursor-pointer ${isSelected ? 'border-green-500' : 'border-orange-500/40'}`}
                              onClick={() => toggleMarketplaceItem(item.id, field)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white font-medium text-sm">{item.title}</p>
                                  <p className="text-gray-500 text-xs capitalize">{item.category.replace('_', ' ')}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {isSelected
                                    ? <Check className="w-4 h-4 text-green-400" />
                                    : <AlertCircle className="w-4 h-4 text-orange-400" />}
                                  <span className="text-red-400 text-xs font-bold">EGP {item.price}</span>
                                </div>
                              </div>
                            </GameCard>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-4">No required items found in marketplace. Add live_talent and production items first.</p>
                    )}
                  </div>

                  {/* Ready confirmation */}
                  {sharedBrandingReady && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-400 font-bold">You're ready to list on Sponsorship Radar!</p>
                        <p className="text-green-300/70 text-sm mt-1">Your tournament will appear publicly after publishing. Co-organizers can commit their share on the Radar.</p>
                      </div>
                    </div>
                  )}

                  {/* Blocked warning if not ready */}
                  {!sharedBrandingReady && (
                    <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg flex items-center gap-2 text-gray-400 text-sm">
                      <Lock className="w-4 h-4 text-gray-500" />
                      Complete Steps A & B above to unlock the next stage.
                    </div>
                  )}
                </div>
              )}
            </FloatingPanel>
          </div>
        );
      }

      case 'teams':
        return (
          <div className="space-y-6">
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
                      {team.logo ? (
                        <img src={team.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-6 h-6 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{team.name}</p>
                        {tournament.invited_teams?.includes(team.id) && (
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{team.members?.length || 0} members</p>
                    </div>
                  </div>
                </GameCard>
              ))}
            </div>
          </div>
        );

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
                      <HexBadge className="text-[10px] mt-1">{talent.talent_type}</HexBadge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">
                      ★ {talent.talent_rating || 'New'}
                    </span>
                    <span className="text-red-400 font-bold">EGP {talent.talent_price || 0}/event</span>
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

      case 'prizepool':
        return (
          <div className="space-y-6">
            {/* Cash Prizepool */}
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Cash Prize Pool
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Prize Pool Amount (EGP)</label>
                  <Input
                    type="number"
                    value={tournament.prizepool_total || ''}
                    onChange={(e) => setTournament({ ...tournament, prizepool_total: parseFloat(e.target.value) || 0 })}
                    placeholder="5000"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">HERU Coins Prize Pool</label>
                  <Input
                    type="number"
                    value={tournament.prizepool_coins || ''}
                    onChange={(e) => setTournament({ ...tournament, prizepool_coins: parseInt(e.target.value) || 0 })}
                    placeholder="1000"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </FloatingPanel>

            <div>
              <h3 className="text-lg font-bold text-white">Prizepool Items from Shop</h3>
              <p className="text-gray-400 text-sm mb-4">Add physical prizes for tournament winners (click multiple times to add quantity)</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prizepoolItems.map(item => {
                const count = tournament.prizepool_items?.filter(id => id === item.id).length || 0;
                return (
                  <GameCard 
                    key={item.id}
                    className={`p-4 cursor-pointer ${count > 0 ? 'border-red-500' : ''}`}
                    onClick={() => {
                      setTournament(prev => ({
                        ...prev,
                        prizepool_items: [...(prev.prizepool_items || []), item.id]
                      }));
                    }}
                  >
                    <div className="aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden relative">
                      {item.image ? (
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                      {count > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          x{count}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold truncate">{item.title}</h4>
                      {count > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const items = [...(tournament.prizepool_items || [])];
                            const idx = items.lastIndexOf(item.id);
                            if (idx > -1) items.splice(idx, 1);
                            setTournament(prev => ({ ...prev, prizepool_items: items }));
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-red-400 font-bold">EGP {item.price}</p>
                  </GameCard>
                );
              })}
            </div>

            {prizepoolItems.length === 0 && (
              <FloatingPanel className="p-8 text-center">
                <Award className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-400">No prizepool items available</p>
              </FloatingPanel>
            )}
          </div>
        );

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
            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-medium">
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
              <span className="text-xs text-purple-400 animate-pulse">Saving...</span>
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
            onClick={() => publishTournamentMutation.mutate()}
            disabled={!tournament.name || !tournament.game}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
          >
            <Send className="w-4 h-4" /> {tournament.tournament_type === 'shared' ? 'Publish to Radar' : 'Publish'}
          </GlowButton>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STAGES.map((stage, i) => (
          <button
            key={stage.id}
            onClick={() => setCurrentStage(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              i === currentStage
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-lg shadow-purple-500/10'
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
            <div className="relative group">
              <GlowButton
                onClick={() => setCurrentStage(Math.min(STAGES.length - 1, currentStage + 1))}
                disabled={currentStage === STAGES.length - 1 || (isBrandingStage && !canProceedFromBranding)}
              >
                Next <ChevronRight className="w-4 h-4" />
              </GlowButton>
              {isBrandingStage && !canProceedFromBranding && (
                <div className="absolute bottom-full mb-2 right-0 bg-zinc-800 text-yellow-400 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap border border-yellow-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Complete your commitment & required items first
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Cost Summary */}
        <div>
          <FloatingPanel className="p-5 sticky top-4 border border-purple-500/20" glowBorder>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-400" />
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
                      const item = marketplaceItems.find(i => i.id === id);
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
                      const item = marketplaceItems.find(i => i.id === id);
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
                      const item = marketplaceItems.find(i => i.id === id);
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
                      const item = marketplaceItems.find(i => i.id === id);
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
                <span className="text-blue-400">Platform Fee (15%)</span>
                <span className="text-blue-400 font-medium">EGP {calculatePlatformFee().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-purple-500/30 pt-2">
                <span className="text-gray-300">Grand Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">EGP {calculateTotalCost().toLocaleString()}</span>
              </div>
            </div>

            {tournament.tournament_type === 'shared' && commitmentPercent > 0 && (
              <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-purple-300">Your Share ({commitmentPercent}%)</span>
                  <span className="text-purple-400 font-bold">EGP {Math.round(calculateTotalCost() * (commitmentPercent / 100)).toLocaleString()}</span>
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