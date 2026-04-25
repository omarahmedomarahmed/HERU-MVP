import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { apiCall } from '@/api/heruClient';
import { Wrench, ArrowRight, CheckCircle, Lock, Zap, Trophy, Users, Building2, Gamepad2, Copy, Link2, ArrowLeft, Loader2 } from 'lucide-react';

const EVENT_TYPES = [
  {
    id: 'corporate_tournament',
    icon: Trophy,
    title: 'Corporate Gaming Tournament',
    subtitle: 'Structured esports competition for your team',
    description: 'Teams compete in gaming challenges that promote collaboration, communication, and strategic thinking. Fully managed by HERU with leaderboards and brackets.',
    color: 'yellow',
  },
  {
    id: 'team_outing',
    icon: Users,
    title: 'Gaming Team Outing',
    subtitle: 'Casual engagement event for all skill levels',
    description: 'Accessible to all employees regardless of age or gaming experience. Inclusive gaming atmosphere with friendly competition and memorable moments.',
    color: 'purple',
  },
];

const GAMES = ['FIFA','Rocket League','PUBG Mobile','Valorant','Call of Duty','Tekken','Chess Rush','Among Us','Fall Guys','Custom Game'];
const FORMATS = ['Single Elimination','Round Robin','Swiss System','Battle Royale','King of the Hill'];
const SIZES = [8,16,32,64];

const STEPS = ['Event Type','Details','Format','Invite'];

function StepDot({ step, current, label }) {
  const done = step < current;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${done ? 'bg-yellow-500 text-black' : step === current ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-400' : 'bg-white/5 border border-white/10 text-gray-600'}`}>
        {done ? <CheckCircle className="w-4 h-4" /> : step + 1}
      </div>
      <span className={`text-[10px] font-medium ${step === current ? 'text-yellow-400' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
}

export default function SponsorInternalBuilder() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    event_type: '', company_name: '', event_name: '', participant_count: 16,
    game: '', format: 'Single Elimination', venue_type: 'online',
    date: '', notes: '',
  });
  const [createdEvent, setCreatedEvent] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['sponsor-subscription', user?.id],
    queryFn: () => apiCall('/subscriptions/me').then(d => d?.subscription || d).catch(() => null),
    enabled: !!user?.id,
  });

  const plan = subscription?.plan || 'free';
  const hasAccess = plan !== 'free';

  const createMutation = useMutation({
    mutationFn: () => apiCall('/tournaments', {
      method: 'POST',
      body: {
        name: form.event_name || `${form.company_name} Internal Event`,
        game: form.game,
        format: form.format,
        max_teams: form.participant_count,
        tournament_type: 'internal',
        is_internal: true,
        sponsor_id: user?.id,
        company_name: form.company_name,
        internal_event_type: form.event_type,
        venue_type: form.venue_type,
        schedule: form.date,
        notes: form.notes,
        status: 'draft',
        sponsorship_enabled: false,
      },
    }),
    onSuccess: (data) => {
      const tournament = data?.tournament || data;
      setCreatedEvent(tournament);
      setStep(3);
    },
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: typeof v === 'string' || typeof v === 'number' ? v : v.target?.value }));

  const inviteLink = createdEvent ? `${window.location.origin}/internal/${createdEvent.id}?invite=true` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-yellow-400" /></div>;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-10">
          <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Subscribers Only</h1>
          <p className="text-gray-400 mb-2">The Internal Campaign Builder is available on any paid plan.</p>
          <p className="text-gray-500 text-sm mb-8">Build your own branded corporate gaming events, invite your team, and manage the full experience — powered by HERU.</p>
        </div>

        <div className="bg-zinc-900 border border-yellow-500/20 rounded-2xl p-6 mb-6">
          <div className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">Why Gaming Team Building?</div>
          <p className="text-gray-300 text-sm mb-4">Traditional team building is no longer sufficient. By using gaming as a universal language, our gamified solutions promote collaboration, communication, and performance — in a way everyone wants to participate.</p>
          <div className="space-y-2">
            {['Built inclusive by design — accessible to all employees','Structured challenges that naturally require team collaboration','Friendly competition with leaderboards','Fully digital, powered by HERU Event Xperience'].map(f => (
              <div key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                <CheckCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" /> {f}
              </div>
            ))}
          </div>
        </div>

        <Link to="/sponsor/subscription" className="flex items-center justify-center gap-2 py-3.5 px-8 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition shadow-lg shadow-yellow-500/20 w-full">
          <Zap className="w-4 h-4" /> View Plans & Subscribe
        </Link>
        <p className="text-xs text-gray-600 mt-4 text-center">Currently on: <span className="text-gray-400 capitalize">{plan}</span> plan</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Wrench className="w-5 h-5 text-yellow-400" />
          <h1 className="text-xl font-bold text-white">Internal Campaign Builder</h1>
          <span className="text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full capitalize">{plan}</span>
        </div>
        <p className="text-gray-400 text-sm">Create a private gaming event for your company — invite-only, not visible to public gamers</p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <StepDot step={i} current={step} label={label} />
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-yellow-500' : 'bg-white/10'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Event Type */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-white font-bold text-lg mb-4">What type of event are you creating?</h2>
          {EVENT_TYPES.map(t => (
            <button key={t.id} onClick={() => { set('event_type')(t.id); setStep(1); }}
              className={`w-full text-left p-5 rounded-2xl border transition-all hover:border-yellow-500/50 ${form.event_type === t.id ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <t.icon className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-0.5">{t.title}</h3>
                  <p className="text-yellow-400/80 text-xs font-medium mb-2">{t.subtitle}</p>
                  <p className="text-gray-400 text-sm">{t.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0 mt-1 ml-auto" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setStep(0)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
            <h2 className="text-white font-bold text-lg">Event Details</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Company Name *</label>
              <input value={form.company_name} onChange={set('company_name')} placeholder="Acme Corp" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Event Name</label>
              <input value={form.event_name} onChange={set('event_name')} placeholder="Acme Gaming Cup 2026" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Event Date</label>
              <input type="date" value={form.date} onChange={set('date')} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Number of Participants</label>
              <div className="flex gap-2">
                {SIZES.map(n => (
                  <button key={n} type="button" onClick={() => set('participant_count')(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${form.participant_count === n ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Venue Type</label>
            <div className="flex gap-3">
              {[['online','Online / Remote'],['company_venue','Company Venue'],['heru_venue','HERU Venue']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => set('venue_type')(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${form.venue_type === v ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Special Notes (optional)</label>
            <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Dietary requirements, special requests, custom rules..." className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500 resize-none" />
          </div>
          <button onClick={() => setStep(2)} disabled={!form.company_name}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
            Next: Choose Format <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Format */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white"><ArrowLeft className="w-4 h-4" /></button>
            <h2 className="text-white font-bold text-lg">Game & Format</h2>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Choose a Game</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GAMES.map(g => (
                <button key={g} type="button" onClick={() => set('game')(g)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors border ${form.game === g ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  <Gamepad2 className="w-3.5 h-3.5 inline mr-1.5" />{g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Tournament Format</label>
            <div className="space-y-2">
              {FORMATS.map(f => (
                <button key={f} type="button" onClick={() => set('format')(f)}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors border text-left ${form.format === f ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 text-sm text-gray-300">
            <div className="flex items-center gap-2 mb-2 text-yellow-400 font-semibold text-xs uppercase tracking-wider"><Building2 className="w-3.5 h-3.5" />Corporate Gaming Toolkit</div>
            By nature, gaming is a team experience relying on communication, creativity, and strategic thinking. Our gamified framework promotes team collaboration, leadership, and alignment — making it more than just play.
          </div>

          <button onClick={() => createMutation.mutate()} disabled={!form.game || createMutation.isPending}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
            {createMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Zap className="w-4 h-4" /> Create Event & Get Invite Link</>}
          </button>
          {createMutation.isError && <p className="text-red-400 text-sm text-center">Failed to create event. Please try again.</p>}
        </div>
      )}

      {/* Step 3: Invite Link */}
      {step === 3 && createdEvent && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Event Created!</h2>
          <p className="text-gray-400 text-sm mb-6">{form.event_name || `${form.company_name} Internal Event`} is ready. Share the invite link with your team.</p>

          <div className="bg-zinc-900 border border-white/10 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1 justify-center"><Lock className="w-3 h-3" /> Invite-only — not visible to public gamers</p>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <Link2 className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span className="text-gray-300 text-xs flex-1 truncate font-mono">{inviteLink}</span>
              <button onClick={copyLink} className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors flex-shrink-0 flex items-center gap-1">
                <Copy className="w-3.5 h-3.5" />{copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/sponsor/sponsorships" className="py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition text-sm flex items-center justify-center gap-2">
              View My Events
            </Link>
            <button onClick={() => { setStep(0); setCreatedEvent(null); setForm({ event_type: '', company_name: '', event_name: '', participant_count: 16, game: '', format: 'Single Elimination', venue_type: 'online', date: '', notes: '' }); }}
              className="py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition text-sm flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" /> Build Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
