import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall, Service } from '@/api/heruClient';
import { useGames } from '@/hooks/useGames';
import { useToast } from '@/components/ui/use-toast';
import { uploadFile } from '@/lib/uploadFile';
import {
  Trophy, Gamepad2, Users, MapPin, Award, Calendar,
  ChevronRight, ChevronLeft, Check, Save, Send, Image,
  Zap, Globe, Building, Loader2, AlertCircle, Eye,
  Briefcase, Plus, X,
} from 'lucide-react';

const STEPS = [
  { id: 'setup',     label: 'Game Setup',   icon: Gamepad2 },
  { id: 'details',   label: 'Details',      icon: Trophy },
  { id: 'prizepool', label: 'Prize Pool',   icon: Award },
  { id: 'services',  label: 'Services',     icon: Briefcase },
  { id: 'publish',   label: 'Publish',      icon: Send },
];

const FORMATS = [
  'Single Elimination', 'Double Elimination', 'Round Robin',
  'Swiss', 'Best of 1', 'Best of 3', 'Best of 5',
];

const SKILL_LEVELS = [
  { value: 'open',         label: 'Open — Everyone welcome' },
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'pro',          label: 'Pro / Competitive' },
];

const DEFAULT_PRIZE_BREAKDOWN = [
  { place: 1, label: '1st Place', cash: 0 },
  { place: 2, label: '2nd Place', cash: 0 },
  { place: 3, label: '3rd Place', cash: 0 },
];

function formatEGP(n) {
  return `EGP ${(n || 0).toLocaleString()}`;
}

function FieldLabel({ children, hint }) {
  return (
    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
      {children}
      {hint && <span className="ml-1.5 text-zinc-500 font-normal normal-case">{hint}</span>}
    </label>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors ${className}`}
      {...props}
    />
  );
}

function Select({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors resize-none ${className}`}
      rows={4}
      {...props}
    />
  );
}

export default function TournamentBuilder() {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();
  const GAMES = useGames();
  const isEditing = !!tournamentId;

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    game: '',
    format: 'Single Elimination',
    participant_type: 'team',
    max_teams: 8,
    start_date: '',
    end_date: '',
    entry_fee: 0,
    is_online: true,
    venue_name: '',
    venue_address: '',
    venue_google_maps: '',
    skill_level: 'open',
    rules: '',
    description: '',
    tournament_image: '',
    prizepool_total: 0,
    prize_breakdown: DEFAULT_PRIZE_BREAKDOWN,
    sponsorship_enabled: false,
    status: 'draft',
    organizer_brand: {},
    is_private: false,
  });

  const [bookedServices, setBookedServices] = useState([]);

  // Load approved service providers for the services step
  const { data: approvedServices = [] } = useQuery({
    queryKey: ['services-approved'],
    queryFn: () => Service.list({ status: 'approved' }).then(d => d?.services || []),
    staleTime: 5 * 60_000,
  });

  // Load existing tournament when editing
  const { data: existing, isLoading: existingLoading } = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => apiCall(`/tournaments/${tournamentId}`),
    enabled: !!tournamentId,
    staleTime: 0,
  });

  const loadedRef = useRef(false);
  useEffect(() => {
    if (!existing || loadedRef.current) return;
    loadedRef.current = true;
    const t = existing;
    setForm({
      name:               t.name || '',
      game:               t.game || '',
      format:             t.format || 'Single Elimination',
      participant_type:   t.participant_type || 'team',
      max_teams:          t.max_teams || 8,
      start_date:         t.start_date ? t.start_date.slice(0, 16) : '',
      end_date:           t.end_date   ? t.end_date.slice(0, 16)   : '',
      entry_fee:          t.entry_fee || 0,
      is_online:          t.is_online !== false,
      venue_name:         t.venue_name || '',
      venue_address:      t.venue_address || '',
      venue_google_maps:  t.venue_google_maps || '',
      skill_level:        t.skill_level || 'open',
      rules:              t.rules || '',
      description:        t.organizer_brand?.description || '',
      tournament_image:   t.tournament_image || '',
      prizepool_total:    t.prizepool_total || 0,
      prize_breakdown:    t.organizer_brand?.prize_breakdown || DEFAULT_PRIZE_BREAKDOWN,
      sponsorship_enabled: t.sponsorship_enabled || false,
      status:             t.status || 'draft',
      organizer_brand:    t.organizer_brand || {},
      is_private:         t.is_private || false,
    });
  }, [existing]);

  const set = useCallback((key, value) => setForm(f => ({ ...f, [key]: value })), []);

  function buildPayload(overrides = {}) {
    return {
      name:               form.name,
      game:               form.game,
      format:             form.format,
      participant_type:   form.participant_type,
      max_teams:          Number(form.max_teams),
      start_date:         form.start_date || null,
      end_date:           form.end_date   || null,
      entry_fee:          Number(form.entry_fee),
      is_online:          form.is_online,
      venue_name:         form.is_online ? null : (form.venue_name || null),
      venue_address:      form.is_online ? null : (form.venue_address || null),
      venue_google_maps:  form.is_online ? null : (form.venue_google_maps || null),
      skill_level:        form.skill_level,
      rules:              form.rules || null,
      is_private:         form.is_private,
      tournament_image:   form.tournament_image || null,
      prizepool_total:    Number(form.prizepool_total),
      sponsorship_enabled: form.sponsorship_enabled,
      organizer_brand: {
        ...form.organizer_brand,
        description:     form.description,
        prize_breakdown: form.prize_breakdown,
      },
      ...overrides,
    };
  }

  async function saveProgress(statusOverride) {
    if (!form.name.trim()) return null;
    setSaving(true);
    try {
      const payload = buildPayload(statusOverride ? { status: statusOverride } : {});
      let result;
      if (isEditing) {
        result = await apiCall(`/tournaments/${tournamentId}`, { method: 'PUT', body: payload });
      } else {
        result = await apiCall('/tournaments', { method: 'POST', body: { ...payload, status: statusOverride || 'draft' } });
      }
      qc.invalidateQueries({ queryKey: ['my-tournaments'] });
      return result;
    } catch (err) {
      toast({ title: 'Save failed', description: err?.message || 'Please try again.', variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (step === 0 && !form.name.trim()) {
      toast({ title: 'Tournament name is required', variant: 'destructive' });
      return;
    }
    if (step === 0 && !form.game) {
      toast({ title: 'Please select a game', variant: 'destructive' });
      return;
    }
    const saved = await saveProgress();
    if (!saved && isEditing === false && step === 0) return; // New and failed
    if (!isEditing && saved?.id) {
      navigate(`/organizer/tournaments/new/${saved.id}`, { replace: true });
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  async function handlePublish() {
    const result = await saveProgress('published');
    if (result) {
      toast({ title: 'Tournament published!', description: 'Your tournament is now live.' });
      navigate('/organizer/tournaments');
    }
  }

  async function handleSaveDraft() {
    const result = await saveProgress('draft');
    if (result) {
      toast({ title: 'Draft saved' });
      navigate('/organizer/tournaments');
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await uploadFile(file, 'tournament-images');
      set('tournament_image', url);
    } catch {
      toast({ title: 'Image upload failed', variant: 'destructive' });
    } finally {
      setImageUploading(false);
    }
  }

  function updatePrize(index, field, value) {
    const next = [...form.prize_breakdown];
    next[index] = { ...next[index], [field]: field === 'cash' ? Number(value) : value };
    set('prize_breakdown', next);
  }

  if (existingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">
              {isEditing ? 'Edit Tournament' : 'New Tournament'}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {form.name || 'Untitled tournament'}
            </p>
          </div>
          <Link to="/organizer/tournaments" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Back
          </Link>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                    active ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' :
                    done  ? 'text-green-400 cursor-pointer hover:text-green-300' :
                    'text-zinc-600 cursor-default'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:block">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-green-700' : 'bg-zinc-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step 0: Game Setup */}
        {step === 0 && (
          <div className="space-y-5 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Game Setup</h2>

            <div>
              <FieldLabel>Tournament Name *</FieldLabel>
              <Input
                placeholder="e.g. HERU Cup — Summer 2026"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Game *</FieldLabel>
                <Select value={form.game} onChange={v => set('game', v)}>
                  <option value="">Select game…</option>
                  {GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
              </div>
              <div>
                <FieldLabel>Format</FieldLabel>
                <Select value={form.format} onChange={v => set('format', v)}>
                  {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Participants</FieldLabel>
                <Select value={form.participant_type} onChange={v => set('participant_type', v)}>
                  <option value="team">Teams</option>
                  <option value="solo">Solo Players</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Max {form.participant_type === 'team' ? 'Teams' : 'Players'}</FieldLabel>
                <Select value={form.max_teams} onChange={v => set('max_teams', v)}>
                  {[4, 8, 16, 32, 64, 128].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Start Date</FieldLabel>
                <Input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={e => set('start_date', e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>End Date</FieldLabel>
                <Input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={e => set('end_date', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Entry Fee (EGP)</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  placeholder="0 for free"
                  value={form.entry_fee}
                  onChange={e => set('entry_fee', e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Skill Level</FieldLabel>
                <Select value={form.skill_level} onChange={v => set('skill_level', v)}>
                  {SKILL_LEVELS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Online / Offline toggle */}
            <div>
              <FieldLabel>Location</FieldLabel>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => set('is_online', true)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${form.is_online ? 'bg-purple-600/20 border-purple-500/40 text-purple-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}
                >
                  <Globe className="w-4 h-4" /> Online
                </button>
                <button
                  type="button"
                  onClick={() => set('is_online', false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${!form.is_online ? 'bg-purple-600/20 border-purple-500/40 text-purple-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}
                >
                  <Building className="w-4 h-4" /> Offline
                </button>
              </div>
              {!form.is_online && (
                <div className="mt-3 space-y-3">
                  <div>
                    <FieldLabel>Venue Name</FieldLabel>
                    <Input
                      placeholder="Venue name / address"
                      value={form.venue_name}
                      onChange={e => set('venue_name', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Venue Address</FieldLabel>
                    <Input
                      placeholder="Street address, city"
                      value={form.venue_address || ''}
                      onChange={e => set('venue_address', e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Google Maps Link</FieldLabel>
                    <Input
                      placeholder="https://maps.google.com/..."
                      value={form.venue_google_maps || ''}
                      onChange={e => set('venue_google_maps', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-5 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Tournament Details</h2>

            <div>
              <FieldLabel>Description</FieldLabel>
              <Textarea
                placeholder="Tell participants what this tournament is about…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div>
              <FieldLabel>Rules & Format Notes</FieldLabel>
              <Textarea
                placeholder="Game mode, check-in requirements, code of conduct…"
                value={form.rules}
                onChange={e => set('rules', e.target.value)}
                rows={5}
              />
            </div>

            <div>
              <FieldLabel>Tournament Banner Image</FieldLabel>
              <div className="space-y-3">
                {form.tournament_image && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-zinc-700">
                    <img
                      src={form.tournament_image}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => set('tournament_image', '')}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full text-white flex items-center justify-center text-xs hover:bg-black/80 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-zinc-700 text-zinc-400 text-sm cursor-pointer hover:border-purple-500/50 hover:text-purple-400 transition-colors w-fit">
                  {imageUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><Image className="w-4 h-4" /> Upload Image</>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* Registration Type */}
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Registration Link</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {form.is_private
                      ? 'Private — only participants with the invite link can register'
                      : 'Public — open registration visible on the tournament browser'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('is_private', !form.is_private)}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${form.is_private ? 'bg-purple-600' : 'bg-zinc-600'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_private ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                <span className={!form.is_private ? 'text-purple-400 font-semibold' : 'text-zinc-500'}>Public</span>
                <span className={form.is_private ? 'text-purple-400 font-semibold' : 'text-zinc-500'}>Private (invite-only)</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Prize Pool */}
        {step === 2 && (
          <div className="space-y-5 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-white mb-1">Prize Pool</h2>

            <div>
              <FieldLabel>Total Prize Pool (EGP)</FieldLabel>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.prizepool_total}
                onChange={e => set('prizepool_total', e.target.value)}
              />
              <p className="text-xs text-zinc-600 mt-1">
                Prize pool distributes to winners. Sponsors can contribute to this.
              </p>
            </div>

            {Number(form.prizepool_total) > 0 && (
              <div>
                <FieldLabel>Prize Breakdown</FieldLabel>
                <div className="space-y-3">
                  {form.prize_breakdown.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        'bg-amber-700/20 text-amber-600'
                      }`}>
                        {p.place}
                      </div>
                      <input
                        value={p.label}
                        onChange={e => updatePrize(i, 'label', e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-zinc-500">EGP</span>
                        <input
                          type="number"
                          min="0"
                          value={p.cash}
                          onChange={e => updatePrize(i, 'cash', e.target.value)}
                          className="w-28 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white text-right focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-zinc-800/60 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Distributed</span>
                    <span className="font-bold text-white">
                      {formatEGP(form.prize_breakdown.reduce((s, p) => s + (p.cash || 0), 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-zinc-400">Total Pool</span>
                    <span className="font-bold text-purple-400">{formatEGP(form.prizepool_total)}</span>
                  </div>
                </div>
              </div>
            )}

            {Number(form.prizepool_total) === 0 && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <Zap className="w-4 h-4 text-zinc-500 shrink-0" />
                <p className="text-sm text-zinc-500">No prize pool — this is a free-to-enter tournament.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Services */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Book Service Providers</h2>
              <p className="text-sm text-zinc-400">
                Browse HERU-verified service providers. Add them to your tournament — you'll confirm bookings after publishing.
              </p>
            </div>

            {approvedServices.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <Briefcase className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">No approved service providers available yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {approvedServices.map(svc => {
                  const isAdded = bookedServices.some(b => b.id === svc.id);
                  return (
                    <div key={svc.id} className={`rounded-xl border p-4 transition-all ${isAdded ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900 border-zinc-800'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{svc.title}</p>
                          <p className="text-zinc-500 text-xs capitalize">{svc.category}</p>
                        </div>
                        <span className="text-white font-black text-sm shrink-0">EGP {Number(svc.price).toLocaleString()}</span>
                      </div>
                      {svc.description && (
                        <p className="text-zinc-400 text-xs line-clamp-2 mb-3">{svc.description}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdded) setBookedServices(bs => bs.filter(b => b.id !== svc.id));
                          else setBookedServices(bs => [...bs, svc]);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isAdded
                            ? 'bg-purple-500/20 text-purple-300 hover:bg-red-500/20 hover:text-red-300'
                            : 'bg-white/5 text-zinc-300 hover:bg-purple-500/20 hover:text-purple-300'
                        }`}
                      >
                        {isAdded ? <><X className="w-3.5 h-3.5" /> Remove</> : <><Plus className="w-3.5 h-3.5" /> Add</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {bookedServices.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-3">Selected Services ({bookedServices.length})</p>
                <div className="space-y-2">
                  {bookedServices.map(svc => (
                    <div key={svc.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="text-zinc-300">{svc.title}</span>
                      <span className="text-white font-semibold">EGP {Number(svc.price).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-sm font-bold">
                    <span className="text-zinc-400">Estimated Total</span>
                    <span className="text-purple-400">EGP {bookedServices.reduce((s, b) => s + Number(b.price), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Publish */}
        {step === 4 && (
          <div className="space-y-5">
            {/* Summary */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-3">
              <h2 className="text-lg font-bold text-white mb-3">Review & Publish</h2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-zinc-800/60 rounded-lg">
                  <p className="text-zinc-500 text-xs mb-0.5">Tournament</p>
                  <p className="text-white font-semibold truncate">{form.name || '—'}</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-lg">
                  <p className="text-zinc-500 text-xs mb-0.5">Game</p>
                  <p className="text-white font-semibold">{form.game || '—'}</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-lg">
                  <p className="text-zinc-500 text-xs mb-0.5">Format</p>
                  <p className="text-white font-semibold">{form.format}</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-lg">
                  <p className="text-zinc-500 text-xs mb-0.5">Teams / Players</p>
                  <p className="text-white font-semibold">{form.max_teams} {form.participant_type === 'team' ? 'teams' : 'players'}</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-lg">
                  <p className="text-zinc-500 text-xs mb-0.5">Prize Pool</p>
                  <p className="text-white font-semibold">{formatEGP(form.prizepool_total)}</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-lg">
                  <p className="text-zinc-500 text-xs mb-0.5">Entry Fee</p>
                  <p className="text-white font-semibold">
                    {Number(form.entry_fee) > 0 ? formatEGP(form.entry_fee) : 'Free'}
                  </p>
                </div>
              </div>
            </div>

            {/* Sponsorship Radar */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-white font-bold text-sm">List on Sponsorship Radar</h3>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Make this tournament visible to brands on HERU RADAR so they can buy sponsorship packages.
                    You must be a verified organizer to enable this.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => set('sponsorship_enabled', !form.sponsorship_enabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${form.sponsorship_enabled ? 'bg-purple-600' : 'bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.sponsorship_enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {form.sponsorship_enabled && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <p className="text-xs text-yellow-400">
                    Your organizer account must be verified to appear on the radar.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-600 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {saving && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}

            {step < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-600 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button
                  onClick={handlePublish}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Publish
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
