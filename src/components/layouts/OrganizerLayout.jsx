import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getOrganizerSession, clearOrganizerSession } from '@/lib/auth-guards';
import AnimatedBackground from '@/components/shared/AnimatedBackground';
import HeruLogo from '@/components/shared/HeruLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, Trophy, Wrench, User,
  Menu, X, LogOut, Settings, Building2, ChevronRight, Radar, CreditCard, Plus, Eye, Star, Lock, Check, Users,
  Gamepad2, Palette, Video, MapPin, Award, ChevronLeft, Save, Send, DollarSign, Zap, AlertCircle, Clock
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import GameCard from '@/components/ui/GameCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import EmbeddedTournamentManage from '@/components/tournament/EmbeddedTournamentManage';
import EmbeddedCoOrganizerView from '@/components/tournament/EmbeddedCoOrganizerView';
import EmbeddedRadar from '@/components/radar/EmbeddedRadar';
import OrganizerSettings from '@/components/organizer/OrganizerSettingsTab';
import OrganizerProfile from '@/components/organizer/OrganizerProfileTab';
import { Bill, GamerProfile, MarketplaceItem, OrganizerProfile as OrganizerProfileAPI, SponsorshipRadar, Team, Tournament, TournamentOrder, apiCall } from '@/api/heruClient'
import { useAuth } from '@/lib/AuthContext'


const TABS = [
  { id: 'tournaments', label: 'My Tournaments', icon: Trophy },
  { id: 'builder', label: 'Tournament Builder', icon: Plus },
  { id: 'radar', label: 'My Sponsorships', icon: Radar },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'profile', label: 'My Profile', icon: User },
];

const navSections = [
  {
    title: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/organizer/dashboard' },
      { icon: Radar, label: 'Sponsorship Radar', href: '/organizer/radar', highlight: true },
    ]
  },
  {
    title: 'Tournaments',
    items: [
      { icon: Trophy, label: 'My Tournaments', path: '/organizer/tournaments' },
      { icon: Wrench, label: 'Build Tournament', path: '/organizer/tournaments/new' },
    ]
  },
  {
    title: 'Account',
    items: [
      { icon: User, label: 'My Profile', path: '/organizer/profile' },
    ]
  },
];

export default function OrganizerLayout({ children, user, profile, isDashboard = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [activeTab, setActiveTab] = useState('tournaments');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      const session = getOrganizerSession();
      if (!session) {
        if (mounted) navigate('/auth/organizer/login', { replace: true });
        return;
      }
      
      try {
        const user = await apiCall('/auth/me');
        if (!mounted) return;
        if (user && user.role === 'user' && !user.organizer_id) {
          navigate('/dashboard/gamer', { replace: true });
          return;
        }
        setSessionData(session);
      } catch {
        if (mounted) navigate('/auth/organizer/login', { replace: true });
      }
    };
    
    checkAuth();
    return () => { mounted = false; };
  }, [navigate]);

  const { data: profileData } = useQuery({
    queryKey: ['organizer-profile-layout', sessionData?.profileId],
    queryFn: async () => {
      if (!sessionData?.profileId) return null;
      const profiles = await OrganizerProfileAPI.list();
      return profiles.find(p => p.id === sessionData.profileId) || null;
    },
    enabled: !!sessionData?.profileId,
  });

  const { data: myTournaments = [] } = useQuery({
    queryKey: ['org-tournaments', sessionData?.userId],
    queryFn: () => Tournament.list({ organizer_id: sessionData.userId }, '-created_date'),
    enabled: !!sessionData?.userId,
  });

  const { data: coOrgTournaments = [] } = useQuery({
    queryKey: ['org-co-tournaments', sessionData?.profileId],
    queryFn: async () => {
      if (!sessionData?.profileId || !myTournaments) return [];
      const allT = await Tournament.list('-created_date');
      return allT.filter(t =>
        t.co_organizers?.some(co => co.organizer_id === sessionData.profileId)
        && !myTournaments.find(m => m.id === t.id)
      );
    },
    enabled: !!sessionData?.profileId && myTournaments !== undefined,
  });

  const { data: tournamentOrders = [] } = useQuery({
    queryKey: ['org-billing-orders', sessionData?.userId, sessionData?.profileId],
    queryFn: () => TournamentOrder.list('-created_date'),
    enabled: !!sessionData,
  });

  const isActive = (path) => location.pathname.includes(path.toLowerCase()) || 
    location.pathname.includes(path.replace(/([A-Z])/g, '-$1').toLowerCase().slice(1));

  const handleLogout = () => {
    clearOrganizerSession();
    navigate('/auth/organizer/login');
  };

  const profileDisplay = profileData || profile;

  return (
    <div className="min-h-screen flex">
      <AnimatedBackground />
      
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40
        bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/50
        transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
          <Link to={'/organizer/dashboard'} className="flex items-center gap-3">
            <HeruLogo className="h-8" />
            {sidebarOpen && (
              <span className="text-red-500 font-bold text-sm">ORGANIZER</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-gray-500 hover:text-white"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Brand Info */}
        {sidebarOpen && profileDisplay && (
          <div className="p-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-zinc-800 flex items-center justify-center overflow-hidden">
                {profileDisplay.brand_logo ? (
                  <img src={profileDisplay.brand_logo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold truncate">{profileDisplay.brand_name || 'Your Brand'}</p>
                <p className="text-gray-500 text-xs truncate">{sessionData?.email || user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {isDashboard ? (
            TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium text-sm">{tab.label}</span>}
              </button>
            ))
          ) : (
            navSections.map((section) => (
              <div key={section.title}>
                {sidebarOpen && (
                  <p className="text-gray-600 text-xs font-bold uppercase tracking-wider px-4 mb-1">
                    {section.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.path || item.href}
                      to={item.href || item.path}
                      className={`
                        flex items-center gap-3 px-4 py-2.5 rounded-xl
                        transition-all duration-200
                        ${isActive(item.path || '')
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : item.highlight
                          ? 'text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/20'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                      {sidebarOpen && item.highlight && <span className="ml-auto text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">NEW</span>}
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-zinc-800/50 space-y-1">
          <Link
            to={'/organizer-settings'}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <HeruLogo className="h-7" />
          </div>
          <span className="text-red-500 font-bold text-xs px-2 py-1 border border-red-500/30 rounded">
            ORGANIZER
          </span>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-zinc-800"
            >
              <nav className="p-4 space-y-1">
                {isDashboard ? (
                  <>
                    {TABS.map(tab => (
                      <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === tab.id ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        <tab.icon className="w-5 h-5" />{tab.label}
                      </button>
                    ))}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400">
                      <LogOut className="w-5 h-5" />Logout
                    </button>
                  </>
                ) : (
                  <>
                    {navSections.map((section) => (
                      <div key={section.title}>
                        <p className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1 px-1">{section.title}</p>
                        <div className="space-y-0.5">
                          {section.items.map((item) => (
                            <Link
                              key={item.path || item.href}
                              to={item.href || item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl
                                ${isActive(item.path || '')
                                  ? 'bg-red-500/20 text-red-400'
                                  : item.highlight
                                  ? 'text-yellow-400 hover:bg-yellow-500/10'
                                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                              `}
                            >
                              <item.icon className="w-5 h-5" />
                              {item.label}
                              {item.highlight && <span className="ml-auto text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">NEW</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-zinc-800 pt-2 mt-2">
                      <Link
                        to={'/organizer-settings'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white"
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main
        className="flex-1 min-h-screen pt-16 lg:pt-0"
        style={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarOpen ? '16rem' : '5rem') : 0 }}
      >
        <div className="p-6 lg:p-8">
          {isDashboard ? (
            <>
              {activeTab === 'tournaments' && <TournamentsTab session={sessionData} profile={profileDisplay} myTournaments={myTournaments} coOrgTournaments={coOrgTournaments} user={sessionData} />}
              {activeTab === 'builder' && <TournamentBuilderTab session={sessionData} />}
              {activeTab === 'radar' && <EmbeddedRadar session={sessionData} profile={profileDisplay} />}
              {activeTab === 'billing' && <BillingTab session={sessionData} profile={profileDisplay} />}
              {activeTab === 'profile' && <OrganizerProfile session={sessionData} profile={profileDisplay} />}
            </>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}

/* ─── TOURNAMENTS TAB ─────────────────────────────────── */
function TournamentsTab({ session, myTournaments, coOrgTournaments, profile }) {
  const [embeddedPage, setEmbeddedPage] = React.useState(null);
  
  if (embeddedPage === 'list') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">MY <span className="text-red-500">TOURNAMENTS</span></h1>
          <Link to={'/organizer/tournaments/new'}>
            <GlowButton><Plus className="w-4 h-4" /> Create Tournament</GlowButton>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">My Tournaments ({myTournaments.length})</h2>
          {myTournaments.length === 0 ? (
            <FloatingPanel className="p-12 text-center">
              <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No tournaments yet</p>
              <Link to={'/organizer/tournaments/new'}><GlowButton><Plus className="w-4 h-4" /> Create Your First</GlowButton></Link>
            </FloatingPanel>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {myTournaments.map(t => (
                <div key={t.id} onClick={() => setEmbeddedPage(`manage-${t.id}`)}>
                  <TournamentCard tournament={t} isMain={true} />
                </div>
              ))}
            </div>
          )}
        </div>

        {coOrgTournaments.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" /> My Sponsored Tournaments ({coOrgTournaments.length})
            </h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {coOrgTournaments.map(t => (
                <div key={t.id} onClick={() => setEmbeddedPage(`coorg-${t.id}`)}>
                  <TournamentCard tournament={t} isMain={false} coOrgId={session?.profileId} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (embeddedPage?.startsWith('manage-')) {
    const tId = embeddedPage.replace('manage-', '');
    return <EmbeddedTournamentManage id={tId} onBack={() => setEmbeddedPage('list')} user={session} profile={profile} />;
  }
  
  if (embeddedPage?.startsWith('coorg-')) {
    const tId = embeddedPage.replace('coorg-', '');
    return <EmbeddedCoOrganizerView id={tId} onBack={() => setEmbeddedPage('list')} user={session} profile={profile} />;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-white">MY <span className="text-red-500">TOURNAMENTS</span></h1>
        <Link to={'/organizer/tournaments/new'}>
          <GlowButton><Plus className="w-4 h-4" /> Create Tournament</GlowButton>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-white mb-4">My Tournaments ({myTournaments.length})</h2>
        {myTournaments.length === 0 ? (
          <FloatingPanel className="p-12 text-center">
            <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No tournaments yet</p>
            <Link to={'/organizer/tournaments/new'}><GlowButton><Plus className="w-4 h-4" /> Create Your First</GlowButton></Link>
          </FloatingPanel>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {myTournaments.map(t => (
              <div key={t.id} onClick={() => setEmbeddedPage(`manage-${t.id}`)}>
                <TournamentCard tournament={t} isMain={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      {coOrgTournaments.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> My Sponsored Tournaments ({coOrgTournaments.length})
          </h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {coOrgTournaments.map(t => (
              <div key={t.id} onClick={() => setEmbeddedPage(`coorg-${t.id}`)}>
                <TournamentCard tournament={t} isMain={false} coOrgId={session?.profileId} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TournamentCard({ tournament: t, isMain, coOrgId }) {
  const coOrg = t.co_organizers?.find(c => c.organizer_id === coOrgId);
  const hasAccess = coOrg?.access_granted;
  const statusColors = { draft: 'bg-zinc-700 text-gray-300', published: 'bg-blue-500/20 text-blue-400', live: 'bg-green-500/20 text-green-400', completed: 'bg-gray-600/20 text-gray-400' };

  return (
    <GameCard className="overflow-hidden">
      <div className="h-28 bg-zinc-800 relative overflow-hidden">
        {t.tournament_image && <img src={t.tournament_image} className="w-full h-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${statusColors[t.status]}`}>{t.status?.toUpperCase()}</span>
          {t.tournament_type === 'shared' ? (
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-blue-500/20 text-blue-400">SHARED</span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded font-bold bg-zinc-600/50 text-gray-300">SOLO</span>
          )}
          {!isMain && <span className="text-xs px-2 py-0.5 rounded font-bold bg-yellow-500/20 text-yellow-400">SPONSOR</span>}
        </div>
      </div>
      <div className="p-4">
        <p className="text-white font-bold truncate mb-1">{t.name}</p>
        <p className="text-gray-400 text-sm mb-1">{t.game}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-gray-500 text-xs">{t.teams?.length || 0}/{t.max_teams || '∞'} teams</span>
          {isMain ? (
            <Link to={`/tournament/${t.id}/manage`}>
              <GlowButton size="sm">Manage</GlowButton>
            </Link>
          ) : (
            <Link to={`/tournament/${t.id}/co-organizer`}>
              <GlowButton size="sm" variant={hasAccess ? "secondary" : "ghost"}>
                {hasAccess ? 'Access' : 'Pending'} →
              </GlowButton>
            </Link>
          )}
        </div>
      </div>
    </GameCard>
  );
}

/* ─── TOURNAMENT BUILDER TAB ───────────────────────────── */
function TournamentBuilderTab({ session }) {
  const [currentStage, setCurrentStage] = React.useState(0);
  const [tournament, setTournament] = React.useState({
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
    venue_items: [],
    total_cost: 0,
    prizepool_total: 0,
    status: 'draft',
    tournament_type: 'solo',
  });
  const [commitmentPercent, setCommitmentPercent] = React.useState(33);
  const [commitmentConfirmed, setCommitmentConfirmed] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['organizer-profile-builder', session?.profileId],
    queryFn: async () => {
      if (!session?.profileId) return null;
      const profiles = await OrganizerProfileAPI.list();
      return profiles.find(p => p.id === session.profileId) || null;
    },
    enabled: !!session?.profileId,
  });

  const { data: allTeams = [] } = useQuery({
    queryKey: ['all-teams-builder'],
    queryFn: () => Team.list('-created_date'),
  });

  const { data: marketplaceItems = [] } = useQuery({
    queryKey: ['marketplace-items-builder'],
    queryFn: () => MarketplaceItem.list({ is_active: true }),
  });

  const { data: talents = [] } = useQuery({
    queryKey: ['talents-builder'],
    queryFn: async () => {
      const profiles = await GamerProfile.list({ is_talent: true });
      return profiles;
    },
  });

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

  const brandingItems = marketplaceItems.filter(i => i.category === 'branding');
  const productionItems = marketplaceItems.filter(i => i.category === 'production');
  const venueItems = marketplaceItems.filter(i => i.category === 'venue');
  const prizepoolItems = marketplaceItems.filter(i => i.category === 'prizepool');

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

  const calculateTotalCost = () => calculateItemsSubtotal() + (tournament.prizepool_total || 0);

  const requiredCategories = ['live_talent', 'production'];
  const requiredItems = marketplaceItems.filter(i => requiredCategories.includes(i.category));
  const requiredItemIds = requiredItems.map(i => i.id);
  const allRequiredSelected = requiredItemIds.length > 0 && requiredItemIds.every(id =>
    tournament.branding_items?.includes(id) || tournament.production_items?.includes(id)
  );

  const sharedBrandingReady = commitmentConfirmed && allRequiredSelected;
  const isBrandingStage = STAGES[currentStage]?.id === 'branding';
  const canProceedFromBranding = tournament.tournament_type === 'solo' || sharedBrandingReady;

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
          talent_type: talent.talent_type || 'Talent',
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

  const saveTournamentMutation = useMutation({
    mutationFn: async () => {
      const data = { ...tournament, organizer_id: session?.userId, total_cost: calculateTotalCost() };
      return Tournament.create(data);
    },
    onSuccess: (result) => {
      if (result?.id) {
        queryClient.invalidateQueries(['org-tournaments']);
        alert('✅ Tournament saved as draft!');
        setTournament({
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
          venue_items: [],
          total_cost: 0,
          prizepool_total: 0,
          status: 'draft',
          tournament_type: 'solo',
        });
        setCurrentStage(0);
      }
    }
  });

  const publishTournamentMutation = useMutation({
    mutationFn: async () => {
      const totalCost = calculateTotalCost();
      const itemsSubtotal = calculateItemsSubtotal();
      const mainContribution = Math.round(totalCost * (commitmentPercent / 100));

      const dataToSave = {
        ...tournament,
        organizer_id: session?.userId,
        main_organizer_id: session?.userId,
        total_cost: totalCost,
        organizer_contribution: mainContribution,
        main_organizer_percent: commitmentPercent,
        status: tournament.tournament_type === 'shared' ? 'draft' : 'published',
      };

      const created = await Tournament.create(dataToSave);
      const tId = created.id;

      const orderItems = [];
      tournament.branding_items?.forEach(id => {
        const item = marketplaceItems.find(i => i.id === id);
        if (item) orderItems.push({ item_id: id, title: item.title, price: item.price, quantity: 1, category: 'branding', status: 'pending', assigned_to: 'main_organizer' });
      });
      tournament.production_items?.forEach(id => {
        const item = marketplaceItems.find(i => i.id === id);
        if (item) orderItems.push({ item_id: id, title: item.title, price: item.price, quantity: 1, category: 'production', status: 'pending', assigned_to: 'main_organizer' });
      });
      tournament.talents?.forEach(t => {
        orderItems.push({ item_id: t.user_id, title: `Talent: ${t.talent_type}`, price: t.price, quantity: 1, category: 'talent', status: 'pending', assigned_to: 'main_organizer' });
      });
      tournament.prizepool_items?.forEach(id => {
        const item = marketplaceItems.find(i => i.id === id);
        if (item) orderItems.push({ item_id: id, title: item.title, price: item.price, quantity: 1, category: 'prizepool', status: 'pending', assigned_to: 'main_organizer' });
      });
      tournament.venue_items?.forEach(id => {
        const item = marketplaceItems.find(i => i.id === id);
        if (item) orderItems.push({ item_id: id, title: item.title, price: item.price, quantity: 1, category: 'venue', status: 'pending', assigned_to: 'main_organizer' });
      });

      await TournamentOrder.create({
        tournament_id: tId,
        tournament_name: tournament.name,
        tournament_type: tournament.tournament_type,
        main_organizer_id: session?.userId,
        main_organizer_brand: profile?.brand_name || '',
        items: orderItems,
        subtotal_items: itemsSubtotal,
        prizepool_amount: tournament.prizepool_total || 0,
        grand_total: totalCost,
        main_organizer_owes: mainContribution,
        fulfillment_status: 'pending_payment',
      });

      if (tournament.tournament_type === 'shared') {
        const orderBreakdown = orderItems.map(i => ({
          item_id: i.item_id,
          title: i.title,
          price: i.price,
          category: i.category,
          paid_by: 'organizer',
        }));

        await SponsorshipRadar.create({
          tournament_id: tId,
          tournament_name: tournament.name,
          main_organizer_id: session?.userId,
          main_organizer_brand: { name: profile?.brand_name, logo: profile?.brand_logo, primary_color: profile?.primary_color },
          game: tournament.game,
          schedule: tournament.schedule,
          description: tournament.description,
          total_cost: totalCost,
          prizepool_amount: tournament.prizepool_total || 0,
          main_organizer_contribution: mainContribution,
          main_organizer_percent: commitmentPercent,
          amount_still_needed: totalCost - mainContribution,
          funding_percent: commitmentPercent,
          status: 'open',
          co_organizers: [],
          order_breakdown: orderBreakdown,
          chat: [],
        });

        await Tournament.update(tId, {
          sponsorship_radar_id: Math.random().toString(),
          on_radar: true,
          radar_funding_percent: commitmentPercent,
        });
      }

      queryClient.invalidateQueries(['org-tournaments']);
    },
    onSuccess: () => {
      alert('✅ Tournament published!');
      setTournament({
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
        venue_items: [],
        total_cost: 0,
        prizepool_total: 0,
        status: 'draft',
        tournament_type: 'solo',
      });
      setCurrentStage(0);
    }
  });

  const renderStageContent = () => {
    const stage = STAGES[currentStage];
    switch (stage.id) {
      case 'game':
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm text-gray-400 block mb-2">Tournament Name *</label>
              <Input value={tournament.name} onChange={(e) => setTournament({ ...tournament, name: e.target.value })} placeholder="e.g. HERU Championship 2024" className="bg-zinc-800 border-zinc-700 text-white text-lg" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Game *</label>
              <Select value={tournament.game} onValueChange={(v) => setTournament({ ...tournament, game: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Select game" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {GAMES.map(game => (<SelectItem key={game} value={game}>{game}</SelectItem>))}
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
                    {FORMATS.map(format => (<SelectItem key={format} value={format}>{format}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Max Teams *</label>
                <Input type="number" value={tournament.max_teams} onChange={(e) => setTournament({ ...tournament, max_teams: parseInt(e.target.value) })} min={2} className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Schedule</label>
              <Input type="datetime-local" value={tournament.schedule} onChange={(e) => setTournament({ ...tournament, schedule: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Description</label>
              <Textarea value={tournament.description} onChange={(e) => setTournament({ ...tournament, description: e.target.value })} placeholder="Describe your tournament..." className="bg-zinc-800 border-zinc-700 text-white" rows={4} />
            </div>
          </div>
        );
      case 'branding':
        const totalCost = calculateTotalCost();
        const commitAmount = Math.round(totalCost * (commitmentPercent / 100));
        return (
          <div className="space-y-6">
            <FloatingPanel className="p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Brand Settings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Brand Name</label>
                  <Input value={tournament.organizer_brand?.name || ''} onChange={(e) => setTournament({ ...tournament, organizer_brand: { ...tournament.organizer_brand, name: e.target.value } })} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Logo URL</label>
                  <Input value={tournament.organizer_brand?.logo || ''} onChange={(e) => setTournament({ ...tournament, organizer_brand: { ...tournament.organizer_brand, logo: e.target.value } })} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </div>
            </FloatingPanel>
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-4">Brand Exposure Packages</h3>
              <p className="text-gray-400 text-sm mb-4">Get maximum exposure with professional branding packages</p>
              <div className="grid md:grid-cols-2 gap-4">
                {brandingItems.map(item => (
                  <GameCard key={item.id} className={`p-4 cursor-pointer ${tournament.branding_items?.includes(item.id) ? 'border-red-500' : ''}`} onClick={() => toggleMarketplaceItem(item.id, 'branding')}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold">{item.title}</h4>
                      {tournament.branding_items?.includes(item.id) && <Check className="w-5 h-5 text-green-400" />}
                    </div>
                    <p className="text-gray-500 text-sm mb-2">{item.description}</p>
                    <p className="text-red-400 font-bold">EGP {item.price}</p>
                  </GameCard>
                ))}
              </div>
            </FloatingPanel>
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-2">Tournament Type & Funding</h3>
              <p className="text-gray-400 text-sm mb-4">How will this tournament be funded?</p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <GameCard className={`p-4 cursor-pointer ${tournament.tournament_type === 'solo' ? 'border-green-500' : ''}`} onClick={() => { setTournament({ ...tournament, tournament_type: 'solo', on_radar: false }); setCommitmentConfirmed(false); }}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold flex items-center gap-2"><Trophy className="w-4 h-4 text-green-400" /> Solo</h4>
                    {tournament.tournament_type === 'solo' && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  <p className="text-gray-500 text-sm">Fully self-funded tournament.</p>
                </GameCard>
                <GameCard className={`p-4 cursor-pointer ${tournament.tournament_type === 'shared' ? 'border-yellow-500' : ''}`} onClick={() => setTournament({ ...tournament, tournament_type: 'shared', on_radar: true })}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Shared</h4>
                    {tournament.tournament_type === 'shared' && <Check className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <p className="text-gray-500 text-sm">Split costs with co-organizers.</p>
                </GameCard>
              </div>
              {tournament.tournament_type === 'shared' && (
                <div className="space-y-4 border-t border-zinc-800 pt-4">
                  <div className={`p-4 rounded-xl border ${commitmentConfirmed ? 'border-green-500/40 bg-green-500/5' : 'border-yellow-500/30 bg-yellow-500/5'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {commitmentConfirmed ? <Check className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-yellow-400" />}
                      <h4 className="text-white font-bold">Commit Your Share</h4>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">Minimum <span className="text-yellow-300 font-bold">33%</span></p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-400 text-sm">Your commitment: <span className="text-white font-bold">{commitmentPercent}%</span></span>
                      <span className="text-yellow-400 font-bold">EGP {commitAmount.toLocaleString()}</span>
                    </div>
                    <input type="range" min={33} max={100} value={commitmentPercent} onChange={(e) => { setCommitmentPercent(parseInt(e.target.value)); setCommitmentConfirmed(false); }} className="w-full accent-yellow-400 mb-3" disabled={commitmentConfirmed} />
                    {!commitmentConfirmed ? (
                      <GlowButton className="w-full" onClick={() => setCommitmentConfirmed(true)}>
                        <Check className="w-4 h-4" /> Commit
                      </GlowButton>
                    ) : (
                      <div className="flex items-center gap-2 text-green-400 text-sm"><Check className="w-4 h-4" /> Confirmed</div>
                    )}
                  </div>
                </div>
              )}
            </FloatingPanel>
          </div>
        );
      case 'teams':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Invite Teams</h3>
                <p className="text-gray-400 text-sm">Selected: {tournament.invited_teams?.length || 0} / {tournament.max_teams}</p>
              </div>
              <GlowButton variant="secondary" size="sm" onClick={selectAllTeams}>
                Select All {tournament.game} Teams
              </GlowButton>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTeams.filter(t => !tournament.game || t.games?.includes(tournament.game)).map(team => (
                <GameCard key={team.id} className={`p-4 cursor-pointer ${tournament.invited_teams?.includes(team.id) ? 'border-red-500' : ''}`} onClick={() => tournament.invited_teams?.includes(team.id) ? removeTeamInvite(team.id) : addTeamInvite(team.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {team.logo ? <img src={team.logo} alt="" className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{team.name}</p>
                        {tournament.invited_teams?.includes(team.id) && <Check className="w-4 h-4 text-green-400" />}
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
                <GameCard key={talent.id} className={`p-4 cursor-pointer ${tournament.talents?.find(t => t.user_id === talent.user_id) ? 'border-red-500' : ''}`} onClick={() => tournament.talents?.find(t => t.user_id === talent.user_id) ? removeTalent(talent.user_id) : addTalent(talent)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
                      {talent.avatar ? <img src={talent.avatar} alt="" className="w-full h-full object-cover" /> : <Star className="w-6 h-6 text-yellow-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">{talent.username}</p>
                        {tournament.talents?.find(t => t.user_id === talent.user_id) && <Check className="w-4 h-4 text-green-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">★ {talent.rating || 'New'}</span>
                    <span className="text-red-400 font-bold">EGP {talent.price || 0}/event</span>
                  </div>
                </GameCard>
              ))}
            </div>
          </div>
        );
      case 'production':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Production Services</h3>
              <p className="text-gray-400 text-sm">Stream overlays, graphics, and production elements</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {productionItems.map(item => (
                <GameCard key={item.id} className={`p-4 cursor-pointer ${tournament.production_items?.includes(item.id) ? 'border-red-500' : ''}`} onClick={() => toggleMarketplaceItem(item.id, 'production')}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold">{item.title}</h4>
                    {tournament.production_items?.includes(item.id) && <Check className="w-5 h-5 text-green-400" />}
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{item.description}</p>
                  <p className="text-red-400 font-bold">EGP {item.price}</p>
                </GameCard>
              ))}
            </div>
          </div>
        );
      case 'venue':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Switch checked={tournament.is_offline} onCheckedChange={(checked) => setTournament({ ...tournament, is_offline: checked })} />
              <label className="text-white">Offline/LAN tournament</label>
            </div>
            {tournament.is_offline && (
              <>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Venue Name</label>
                  <Input value={tournament.venue} onChange={(e) => setTournament({ ...tournament, venue: e.target.value })} placeholder="e.g. LA Convention Center" className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Venue Packages</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {venueItems.map(item => (
                      <GameCard key={item.id} className={`p-4 cursor-pointer ${tournament.venue_items?.includes(item.id) ? 'border-red-500' : ''}`} onClick={() => toggleMarketplaceItem(item.id, 'venue')}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-bold">{item.title}</h4>
                          {tournament.venue_items?.includes(item.id) && <Check className="w-5 h-5 text-green-400" />}
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
            <FloatingPanel className="p-6" glowBorder>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Cash Prize Pool
              </h3>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Prize Pool Amount (EGP)</label>
                <Input type="number" value={tournament.prizepool_total || ''} onChange={(e) => setTournament({ ...tournament, prizepool_total: parseFloat(e.target.value) || 0 })} placeholder="5000" className="bg-zinc-800 border-zinc-700 text-white" />
              </div>
            </FloatingPanel>
            <div>
              <h3 className="text-lg font-bold text-white">Physical Prizes</h3>
              <p className="text-gray-400 text-sm mb-4">Add prizes for tournament winners</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prizepoolItems.map(item => {
                const count = tournament.prizepool_items?.filter(id => id === item.id).length || 0;
                return (
                  <GameCard key={item.id} className={`p-4 cursor-pointer ${count > 0 ? 'border-red-500' : ''}`} onClick={() => setTournament(prev => ({ ...prev, prizepool_items: [...(prev.prizepool_items || []), item.id] }))}>
                    <div className="aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden relative">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <Award className="w-8 h-8 text-zinc-600" />}
                      {count > 0 && <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">x{count}</div>}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold truncate">{item.title}</h4>
                      {count > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); const items = [...(tournament.prizepool_items || [])]; const idx = items.lastIndexOf(item.id); if (idx > -1) items.splice(idx, 1); setTournament(prev => ({ ...prev, prizepool_items: items })); }} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                      )}
                    </div>
                    <p className="text-red-400 font-bold">EGP {item.price}</p>
                  </GameCard>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">TOURNAMENT <span className="text-red-500">BUILDER</span></h1>
        <div className="flex gap-2">
          <GlowButton variant="ghost" onClick={() => saveTournamentMutation.mutate()}>
            <Save className="w-4 h-4" /> Save Draft
          </GlowButton>
          <GlowButton onClick={() => publishTournamentMutation.mutate()} disabled={!tournament.name || !tournament.game}>
            <Send className="w-4 h-4" /> Publish
          </GlowButton>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {STAGES.map((stage, i) => (
          <button key={stage.id} onClick={() => setCurrentStage(i)} className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${i === currentStage ? 'bg-red-500/20 text-red-400 border border-red-500/50' : i < currentStage ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800/50 text-gray-500 hover:bg-zinc-800'}`}>
            <stage.icon className="w-4 h-4" />
            {stage.label}
            {i < currentStage && <Check className="w-4 h-4" />}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <FloatingPanel className="p-6">
            {renderStageContent()}
          </FloatingPanel>
          <div className="flex justify-between mt-6">
            <GlowButton variant="ghost" onClick={() => setCurrentStage(Math.max(0, currentStage - 1))} disabled={currentStage === 0}>
              <ChevronLeft className="w-4 h-4" /> Previous
            </GlowButton>
            <div className="relative group">
              <GlowButton onClick={() => setCurrentStage(Math.min(STAGES.length - 1, currentStage + 1))} disabled={currentStage === STAGES.length - 1 || (isBrandingStage && !canProceedFromBranding)}>
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

        <div>
          <FloatingPanel className="p-5 sticky top-4" glowBorder>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
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
                  <span className="text-white">EGP {tournament.branding_items.reduce((sum, id) => { const item = marketplaceItems.find(i => i.id === id); return sum + (item?.price || 0); }, 0)}</span>
                </div>
              )}
              {tournament.production_items?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Production ({tournament.production_items.length})</span>
                  <span className="text-white">EGP {tournament.production_items.reduce((sum, id) => { const item = marketplaceItems.find(i => i.id === id); return sum + (item?.price || 0); }, 0)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-zinc-800 mt-4 pt-4">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-400">Total</span>
                <span className="text-green-400">EGP {calculateTotalCost().toLocaleString()}</span>
              </div>
            </div>
          </FloatingPanel>
        </div>
      </div>
    </div>
  );
}



/* ─── BILLING TAB ─────────────────────────────────────── */
function BillingTab({ session, profile }) {
  const [paymentForm, setPaymentForm] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '', address: '' });
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data: allBills = [] } = useQuery({
    queryKey: ['organizer-bills', session?.userId],
    queryFn: async () => {
      const bills = await Bill.list('-created_date');
      return bills.filter(b => b.payer_id === session?.userId);
    },
    enabled: !!session?.userId,
  });

  const soloTournamentBills = allBills.filter(b => b.bill_type === 'organizer' && !b.shared_tournament);
  const sharedMainBills = allBills.filter(b => b.bill_type === 'organizer' && b.shared_tournament);
  const coOrgBills = allBills.filter(b => b.bill_type === 'co_organizer');

  const handleMarkPaid = async (billId, amount) => {
    await Bill.update(billId, {
      payment_status: 'paid',
      paid_amount: amount,
      paid_date: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries(['organizer-bills']);
    alert('✓ Payment confirmed (test mode)');
  };

  const handleMarkPaidCoOrg = async (billId, amount) => {
    await Bill.update(billId, {
      payment_status: 'paid',
      paid_amount: amount,
      paid_date: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries(['organizer-bills']);
    alert('✓ Co-organizer payment confirmed (test mode)');
  };

  const saveCard = () => { setSaved(true); setPaymentForm(false); setTimeout(() => setSaved(false), 4000); };

  const statusBadge = (s) => {
    const map = { draft: 'bg-zinc-700 text-gray-300', pending_payment: 'bg-yellow-500/20 text-yellow-400', in_fulfillment: 'bg-blue-500/20 text-blue-400', fulfilled: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400' };
    return <span className={`text-xs px-2 py-0.5 rounded font-medium ${map[s] || 'bg-zinc-700 text-gray-400'}`}>{s?.replace(/_/g, ' ').toUpperCase()}</span>;
  };

  const billStatusColors = {
    unpaid: 'bg-red-500/20 text-red-400',
    partial: 'bg-yellow-500/20 text-yellow-400',
    paid: 'bg-green-500/20 text-green-400',
    overdue: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-white">BILLING</h1>

      {saved && (
        <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 text-green-400 flex items-center gap-2">
          <Check className="w-5 h-5" /> Payment method saved (test mode)
        </div>
      )}

      {/* Solo Tournament Bills */}
      <FloatingPanel className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-400" /> Solo Tournament Bills
        </h2>
        {soloTournamentBills.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No solo tournament bills</p>
        ) : (
          <div className="space-y-4">
            {soloTournamentBills.map(bill => (
              <div key={bill.id} className="bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/70 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-white font-bold">{bill.tournament_name}</p>
                    <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-0.5 rounded inline-block mt-1">Solo</span>
                  </div>
                  <p className="text-white font-black text-xl">EGP {(bill.grand_total || 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${bill.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {bill.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                  </span>
                  <span className="text-gray-400 text-sm">{bill.items?.length || 0} items</span>
                </div>
                <div className="flex gap-3">
                  <Link to={`/bill/${bill.bill_number}`} className="flex-1">
                    <GlowButton variant="ghost" className="w-full text-sm">View Bill</GlowButton>
                  </Link>
                  {bill.payment_status !== 'paid' && (
                    <GlowButton className="text-sm" onClick={() => handleMarkPaid(bill.id, bill.grand_total)}>
                      Pay EGP {(bill.grand_total || 0).toLocaleString()}
                    </GlowButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FloatingPanel>

      {/* Shared Tournament Bills (Main) */}
      <FloatingPanel className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" /> Shared Tournament Bills (Main Organizer)
        </h2>
        {sharedMainBills.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No shared tournament bills as main organizer</p>
        ) : (
          <div className="space-y-4">
            {sharedMainBills.map(bill => (
                <div key={bill.id} className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-white font-bold">{bill.tournament_name}</p>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded inline-block mt-1">Shared</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-black text-xl">EGP {(bill.grand_total || 0).toLocaleString()}</p>
                      <p className="text-gray-400 text-xs mt-1">100% of tournament cost shown</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded ${bill.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {bill.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/bill/${bill.bill_number}`} className="flex-1">
                      <GlowButton variant="ghost" className="w-full text-sm">View Shared Bill</GlowButton>
                    </Link>
                    {bill.payment_status !== 'paid' && (
                      <GlowButton className="text-sm" onClick={() => handleMarkPaid(bill.id, bill.grand_total)}>
                        Pay My Share
                      </GlowButton>
                    )}
                  </div>
                </div>
            ))}
          </div>
        )}
      </FloatingPanel>

      {/* Co-Organizer Bills */}
      <FloatingPanel className="p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-cyan-400" /> Co-Organizer Sponsorships
        </h2>
        {coOrgBills.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No co-organizer sponsorships</p>
        ) : (
          <div className="space-y-4">
            {coOrgBills.map(bill => (
              <div key={bill.id} className="bg-zinc-800/50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-white font-bold">{bill.tournament_name}</p>
                    <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded inline-block mt-1">Co-Organizer</span>
                  </div>
                  <p className="text-white font-black text-xl">EGP {(bill.grand_total || 0).toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${bill.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {bill.payment_status === 'paid' ? '✓ Paid' : 'Unpaid'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Link to={`/bill/${bill.bill_number}`} className="flex-1">
                    <GlowButton variant="ghost" className="w-full text-sm">View Bill</GlowButton>
                  </Link>
                  {bill.payment_status !== 'paid' && (
                    <GlowButton className="text-sm" onClick={() => handleMarkPaidCoOrg(bill.id, bill.grand_total)}>
                      Confirm & Pay
                    </GlowButton>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </FloatingPanel>

      {allBills.length > 0 && (
        <FloatingPanel className="p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Bill History ({allBills.length})
          </h2>
          <div className="space-y-3">
            {allBills.map(bill => (
              <Link key={bill.id} to={`/bill/${bill.bill_number}`}>
                <div className="bg-zinc-800/50 rounded-xl p-4 hover:bg-zinc-800/70 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-bold">{bill.bill_number}</p>
                      <p className="text-gray-400 text-sm">{bill.tournament_name}</p>
                      <p className="text-gray-500 text-xs mt-1">Issued: {format(new Date(bill.issued_at), 'MMM dd, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">EGP {bill.grand_total?.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded block mt-2 ${billStatusColors[bill.payment_status]}`}>
                        {bill.payment_status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </FloatingPanel>
      )}

      <FloatingPanel className="p-6">
         <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
           <CreditCard className="w-5 h-5 text-red-500" /> Payment Methods
         </h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">Manage your payment methods</p>
          <GlowButton variant="ghost" size="sm" onClick={() => setPaymentForm(!paymentForm)}>
            <Plus className="w-4 h-4" /> Add Payment Method
          </GlowButton>
        </div>
        {paymentForm && (
          <div className="bg-zinc-800/50 rounded-xl p-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Card Number</label>
                <Input value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} placeholder="1234 5678 9012 3456" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Expiry</label>
                <Input value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} placeholder="MM/YY" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">CVV</label>
                <Input value={cardData.cvv} onChange={e => setCardData({...cardData, cvv: e.target.value})} placeholder="123" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Cardholder Name</label>
                <Input value={cardData.name} onChange={e => setCardData({...cardData, name: e.target.value})} placeholder="John Doe" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Billing Address</label>
                <Input value={cardData.address} onChange={e => setCardData({...cardData, address: e.target.value})} placeholder="123 Street, City, Country" className="bg-zinc-900 border-zinc-700 text-white" />
              </div>
            </div>
            <GlowButton className="w-full" onClick={saveCard}>Save Payment Method</GlowButton>
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-2">
              <Lock className="w-3 h-3" /> 🔒 Paymob Integration — Coming Soon
            </div>
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}