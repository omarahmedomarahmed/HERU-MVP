import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import NotFound from './pages/public/NotFound'
import { AuthProvider } from '@/lib/AuthContext'
import { RequireGamer, RequireOrganizer, RequireSponsor, RequireProvider, RequireStaff } from '@/lib/auth-guards'

// Auth pages
import AuthChoice from './pages/public/AuthChoice'
import GamerAuthLogin from './pages/auth/GamerAuthLogin'
import GamerAuthRegister from './pages/auth/GamerAuthRegister'
import OrganizerAuthLogin from './pages/auth/OrganizerAuthLogin'
import OrganizerAuthRegister from './pages/auth/OrganizerAuthRegister'
import SponsorAuthLogin from './pages/auth/SponsorAuthLogin'
import SponsorAuthRegister from './pages/auth/SponsorAuthRegister'
import ProviderAuthLogin from './pages/auth/ProviderAuthLogin'
import ProviderAuthRegister from './pages/auth/ProviderAuthRegister'
import StaffLogin from './pages/staff/StaffLogin'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Public pages
import Home from './pages/public/Home'
import Tournaments from './pages/public/Tournaments'
import TournamentPublic from './pages/public/TournamentPublic'
import Teams from './pages/public/Teams'
import TeamProfile from './pages/public/TeamProfile'
import OrganizerPublicProfile from './pages/public/OrganizerPublicProfile'
import GamerDetail from './pages/gamer/GamerDetail'
import ProviderPublicProfile from './pages/provider/ProviderPublicProfile'
import ForGamers from './pages/public/ForGamers'
import ForOrganizers from './pages/public/ForOrganizers'
import ForSponsors from './pages/public/ForSponsors'
import ForProviders from './pages/public/ForProviders'

// Public discovery pages
import Coaches from './pages/public/Coaches'
import CoachProfile from './pages/public/CoachProfile'
import Leaderboards from './pages/public/Leaderboards'
import Influencers from './pages/public/Influencers'

// Gamer pages
import GamerHome from './pages/gamer/GamerHome'
import GamerProfile from './pages/gamer/GamerProfile'
import GamerProfileView from './pages/gamer/GamerProfileView'
import CreateTeam from './pages/gamer/CreateTeam'
import TeamDetails from './pages/gamer/TeamDetails'
import MyOrders from './pages/gamer/MyOrders'
import GamerOrderDetail from './pages/gamer/GamerOrderDetail'
import GamerNotifications from './pages/gamer/GamerNotifications'
import TournamentDetails from './pages/gamer/TournamentDetails'
import Arena from './pages/gamer/Arena'
import GamerBilling from './pages/gamer/GamerBilling'
import BillDetail from './pages/gamer/BillDetail'
import ConnectedAccounts from './pages/gamer/ConnectedAccounts'
import GamerBookings from './pages/gamer/GamerBookings'
import GamerFriends from './pages/gamer/GamerFriends'
import GamerMessages from './pages/gamer/GamerMessages'
import GamerTournamentBuilder from './pages/gamer/GamerTournamentBuilder'

// Organizer pages
import OrganizerLayout from '@/components/layouts/OrganizerLayout'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import OrganizerTournaments from './pages/organizer/OrganizerTournaments'
import TournamentBuilder from './pages/organizer/TournamentBuilder'
import OrgTournamentManage from './pages/organizer/TournamentManage'
import OrganizerProfile from './pages/organizer/OrganizerProfile'
import OrganizerTeams from './pages/organizer/OrganizerTeams'
import OrganizerMessages from './pages/organizer/OrganizerMessages'

import OrganizerRadar from './pages/organizer/OrganizerRadar'
import OrganizerVerification from './pages/organizer/OrganizerVerification'
import OrganizerBilling from './pages/organizer/OrganizerBilling'
import OrganizerIncome from './pages/organizer/OrganizerIncome'
import PaymentMethod from './pages/organizer/PaymentMethod'
import TournamentSummaryReport from './pages/organizer/TournamentSummaryReport'
import TournamentReportBuilder from './pages/organizer/TournamentReportBuilder'


// Sponsor pages
import SponsorLayout from '@/components/layouts/SponsorLayout'
import SponsorDashboard from './pages/sponsor/SponsorDashboard'
import SponsorRadar from './pages/sponsor/SponsorRadar'
import SponsorPackageDetail from './pages/sponsor/SponsorPackageDetail'
import SponsorMySponsorships from './pages/sponsor/SponsorMySponsorships'
import SponsorSubscription from './pages/sponsor/SponsorSubscription'
import SponsorInternalBuilder from './pages/sponsor/SponsorInternalBuilder'
import SponsorProfile from './pages/sponsor/SponsorProfile'
import SponsorManagedServices from './pages/sponsor/SponsorManagedServices'
import SponsorManagedServiceNew from './pages/sponsor/SponsorManagedServiceNew'
import SponsorManagedServiceDetail from './pages/sponsor/SponsorManagedServiceDetail'
import SponsorInfluencers from './pages/sponsor/SponsorInfluencers'
import SponsorBilling from './pages/sponsor/SponsorBilling'

// Provider pages
import ProviderLayout from '@/components/layouts/ProviderLayout'
import ProviderDashboard from './pages/provider/ProviderDashboard'
import ProviderServices from './pages/provider/ProviderServices'
import ProviderServiceNew from './pages/provider/ProviderServiceNew'
import ProviderBookings from './pages/provider/ProviderBookings'
import ProviderBookingDetail from './pages/provider/ProviderBookingDetail'
import ProviderProfile from './pages/provider/ProviderProfile'
import ProviderIncome from './pages/provider/ProviderIncome'
import ProviderPortfolio from './pages/provider/ProviderPortfolio'

// Staff pages
import StaffLayout from '@/components/layouts/StaffLayout'
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffTournaments from './pages/staff/StaffTournaments'
import StaffTournamentDetail from './pages/staff/StaffTournamentDetail'
import StaffUsers from './pages/staff/StaffUsers'
import StaffUserDetail from './pages/staff/StaffUserDetail'
import StaffMessages from './pages/staff/StaffMessages'
import StaffApprovals from './pages/staff/StaffApprovals'
import StaffOrders from './pages/staff/StaffOrders'
import StaffOrderDetail from './pages/staff/StaffOrderDetail'
import StaffMarketplace from './pages/staff/StaffMarketplace'
import StaffRadarPanel from './pages/staff/StaffRadarPanel'
import StaffBilling from './pages/staff/StaffBilling'
import StaffTournamentOrders from './pages/staff/StaffTournamentOrders'
import StaffOrganizers from './pages/staff/StaffOrganizers'
import StaffRevenue from './pages/staff/StaffRevenue'
import StaffSettings from './pages/staff/StaffSettings'
import StaffCMS from './pages/staff/StaffCMS'
import StaffAnalytics from './pages/staff/StaffAnalytics'
import StaffPlatformControl from './pages/staff/StaffPlatformControl'
import StaffManagedProjects from './pages/staff/StaffManagedProjects'
import StaffBadges from './pages/staff/StaffBadges'

import StaffAuditTrail from './pages/staff/StaffAuditTrail'
import StaffGamers from './pages/staff/StaffGamers'
import StaffTeams from './pages/staff/StaffTeams'
import StaffTournamentBuilder from './pages/staff/StaffTournamentBuilder'

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <Routes>
            {/* ============ PUBLIC ZONE ============ */}
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentPublic />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamProfile />} />
            <Route path="/organizer/:id" element={<OrganizerPublicProfile />} />

            <Route path="/coaches" element={<Coaches />} />
            <Route path="/coaches/:id" element={<CoachProfile />} />
            <Route path="/leaderboards" element={<Leaderboards />} />
            <Route path="/influencers" element={<Influencers />} />
            <Route path="/for-gamers" element={<ForGamers />} />
            <Route path="/for-organizers" element={<ForOrganizers />} />
            <Route path="/for-sponsors" element={<ForSponsors />} />
            <Route path="/for-providers" element={<ForProviders />} />
            <Route path="/providers/:id" element={<ProviderPublicProfile />} />
            <Route path="/gamer/:id" element={<GamerProfileView />} />

            {/* ============ AUTH ZONE ============ */}
            <Route path="/auth" element={<AuthChoice />} />
            <Route path="/auth/gamer/login" element={<GamerAuthLogin />} />
            <Route path="/auth/gamer/register" element={<GamerAuthRegister />} />
            <Route path="/auth/organizer/login" element={<OrganizerAuthLogin />} />
            <Route path="/auth/organizer/register" element={<OrganizerAuthRegister />} />
            <Route path="/auth/sponsor/login" element={<SponsorAuthLogin />} />
            <Route path="/auth/sponsor/register" element={<SponsorAuthRegister />} />
            <Route path="/auth/provider/login" element={<ProviderAuthLogin />} />
            <Route path="/auth/provider/register" element={<ProviderAuthRegister />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<StaffLogin />} />

            {/* ============ GAMER ZONE ============ */}
            <Route path="/gamer/home" element={<RequireGamer><GamerHome /></RequireGamer>} />
            <Route path="/gamer/arena" element={<RequireGamer><Arena /></RequireGamer>} />
            <Route path="/gamer/arena/:id" element={<RequireGamer><Arena /></RequireGamer>} />
            <Route path="/gamer/billing" element={<RequireGamer><GamerBilling /></RequireGamer>} />
            <Route path="/gamer/tournaments" element={<RequireGamer><Tournaments /></RequireGamer>} />
            <Route path="/gamer/tournaments/:id" element={<RequireGamer><TournamentDetails /></RequireGamer>} />
            <Route path="/gamer/profile" element={<RequireGamer><GamerProfile /></RequireGamer>} />
            <Route path="/gamer/profile/:slug" element={<GamerProfileView />} />
            <Route path="/gamer/teams" element={<RequireGamer><Teams /></RequireGamer>} />
            <Route path="/gamer/teams/create" element={<RequireGamer><CreateTeam /></RequireGamer>} />
            <Route path="/gamer/teams/:id" element={<RequireGamer><TeamDetails /></RequireGamer>} />
            <Route path="/gamer/orders" element={<RequireGamer><MyOrders /></RequireGamer>} />
            <Route path="/gamer/orders/:id" element={<RequireGamer><GamerOrderDetail /></RequireGamer>} />
            <Route path="/gamer/notifications" element={<RequireGamer><GamerNotifications /></RequireGamer>} />
            <Route path="/gamer/connect" element={<RequireGamer><ConnectedAccounts /></RequireGamer>} />
            <Route path="/gamer/connected-accounts" element={<RequireGamer><ConnectedAccounts /></RequireGamer>} />
            <Route path="/gamer/build" element={<RequireGamer><GamerTournamentBuilder /></RequireGamer>} />
            <Route path="/gamer/bookings" element={<RequireGamer><GamerBookings /></RequireGamer>} />
            <Route path="/gamer/friends" element={<RequireGamer><GamerFriends /></RequireGamer>} />
            <Route path="/gamer/messages" element={<RequireGamer><GamerMessages /></RequireGamer>} />

            {/* ============ ORGANIZER ZONE ============ */}
            <Route path="/organizer/dashboard" element={<RequireOrganizer><OrganizerLayout><OrganizerDashboard /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments" element={<RequireOrganizer><OrganizerLayout><OrganizerTournaments /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/new" element={<RequireOrganizer><OrganizerLayout><TournamentBuilder /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/new/:id" element={<RequireOrganizer><OrganizerLayout><TournamentBuilder /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/report" element={<RequireOrganizer><OrganizerLayout><TournamentSummaryReport /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/report/build" element={<RequireOrganizer><OrganizerLayout><TournamentReportBuilder /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/teams" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="teams" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/brackets" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="brackets" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/chat" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="chat" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/settings" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="report" /></OrganizerLayout></RequireOrganizer>} />

            <Route path="/organizer/income" element={<RequireOrganizer><OrganizerLayout><OrganizerIncome /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/billing" element={<RequireOrganizer><OrganizerLayout><OrganizerBilling /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/billing/payment-method" element={<RequireOrganizer><OrganizerLayout><PaymentMethod /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/billing/:bill_number" element={<RequireOrganizer><OrganizerLayout><BillDetail /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/teams" element={<RequireOrganizer><OrganizerLayout><OrganizerTeams /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/messages" element={<RequireOrganizer><OrganizerLayout><OrganizerMessages /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/profile" element={<RequireOrganizer><OrganizerLayout><OrganizerProfile /></OrganizerLayout></RequireOrganizer>} />

            <Route path="/organizer/radar" element={<RequireOrganizer><OrganizerRadar /></RequireOrganizer>} />

            <Route path="/organizer/verification" element={<RequireOrganizer><OrganizerVerification /></RequireOrganizer>} />

            {/* ============ SPONSOR ZONE ============ */}
            <Route path="/sponsor/dashboard" element={<RequireSponsor><SponsorLayout><SponsorDashboard /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/radar" element={<RequireSponsor><SponsorLayout><SponsorRadar /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/radar/:tournament_id/package/:package_id" element={<RequireSponsor><SponsorLayout><SponsorPackageDetail /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/sponsorships" element={<RequireSponsor><SponsorLayout><SponsorMySponsorships /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/subscription" element={<RequireSponsor><SponsorLayout><SponsorSubscription /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/builder" element={<RequireSponsor><SponsorLayout><SponsorInternalBuilder /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/profile" element={<RequireSponsor><SponsorLayout><SponsorProfile /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/managed-services" element={<RequireSponsor><SponsorLayout><SponsorManagedServices /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/managed-services/new" element={<RequireSponsor><SponsorLayout><SponsorManagedServiceNew /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/managed-services/:id" element={<RequireSponsor><SponsorLayout><SponsorManagedServiceDetail /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/influencers" element={<RequireSponsor><SponsorLayout><SponsorInfluencers /></SponsorLayout></RequireSponsor>} />
            <Route path="/sponsor/billing" element={<RequireSponsor><SponsorLayout><SponsorBilling /></SponsorLayout></RequireSponsor>} />

            {/* ============ SERVICE PROVIDER ZONE ============ */}
            <Route path="/provider/dashboard" element={<RequireProvider><ProviderLayout><ProviderDashboard /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/services" element={<RequireProvider><ProviderLayout><ProviderServices /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/services/new" element={<RequireProvider><ProviderLayout><ProviderServiceNew /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/bookings" element={<RequireProvider><ProviderLayout><ProviderBookings /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/bookings/:id" element={<RequireProvider><ProviderLayout><ProviderBookingDetail /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/profile" element={<RequireProvider><ProviderLayout><ProviderProfile /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/portfolio" element={<RequireProvider><ProviderLayout><ProviderPortfolio /></ProviderLayout></RequireProvider>} />
            <Route path="/provider/income" element={<RequireProvider><ProviderLayout><ProviderIncome /></ProviderLayout></RequireProvider>} />

            {/* ============ STAFF ZONE ============ */}
            <Route path="/staff/dashboard" element={<RequireStaff><StaffLayout><StaffDashboard /></StaffLayout></RequireStaff>} />
            <Route path="/staff/tournaments" element={<RequireStaff><StaffLayout><StaffTournaments /></StaffLayout></RequireStaff>} />
            <Route path="/staff/tournaments/:id" element={<RequireStaff><StaffLayout><StaffTournamentDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/users" element={<RequireStaff><StaffLayout><StaffUsers /></StaffLayout></RequireStaff>} />
            <Route path="/staff/users/:id" element={<RequireStaff><StaffLayout><StaffUserDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/messages" element={<RequireStaff><StaffLayout><StaffMessages /></StaffLayout></RequireStaff>} />
            <Route path="/staff/approvals" element={<RequireStaff><StaffLayout><StaffApprovals /></StaffLayout></RequireStaff>} />
            <Route path="/staff/orders" element={<RequireStaff><StaffLayout><StaffOrders /></StaffLayout></RequireStaff>} />
            <Route path="/staff/orders/:id" element={<RequireStaff><StaffLayout><StaffOrderDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/orders/gamer/:id" element={<RequireStaff><StaffLayout><StaffOrderDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/orders/tournament/:id" element={<RequireStaff><StaffLayout><StaffOrderDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/services" element={<RequireStaff><StaffLayout><StaffMarketplace /></StaffLayout></RequireStaff>} />
            <Route path="/staff/radar" element={<RequireStaff><StaffLayout><StaffRadarPanel /></StaffLayout></RequireStaff>} />
            <Route path="/staff/billing" element={<RequireStaff><StaffLayout><StaffBilling /></StaffLayout></RequireStaff>} />
            <Route path="/staff/billing/:bill_number" element={<RequireStaff><StaffLayout><BillDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/tournament-orders" element={<RequireStaff><StaffLayout><StaffTournamentOrders /></StaffLayout></RequireStaff>} />
            <Route path="/staff/organizers" element={<RequireStaff><StaffLayout><StaffOrganizers /></StaffLayout></RequireStaff>} />
            <Route path="/staff/revenue" element={<RequireStaff><StaffLayout><StaffRevenue /></StaffLayout></RequireStaff>} />
            <Route path="/staff/settings" element={<RequireStaff><StaffLayout><StaffSettings /></StaffLayout></RequireStaff>} />
            <Route path="/staff/badges" element={<RequireStaff><StaffLayout><StaffBadges /></StaffLayout></RequireStaff>} />

            <Route path="/staff/audit" element={<RequireStaff><StaffLayout><StaffAuditTrail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/gamers" element={<RequireStaff><StaffLayout><StaffGamers /></StaffLayout></RequireStaff>} />
            <Route path="/staff/teams" element={<RequireStaff><StaffLayout><StaffTeams /></StaffLayout></RequireStaff>} />
            <Route path="/staff/tournament-builder" element={<RequireStaff><StaffLayout><StaffTournamentBuilder /></StaffLayout></RequireStaff>} />
            <Route path="/staff/analytics" element={<RequireStaff><StaffLayout><StaffAnalytics /></StaffLayout></RequireStaff>} />
            <Route path="/staff/cms" element={<RequireStaff><StaffLayout><StaffCMS /></StaffLayout></RequireStaff>} />
            <Route path="/staff/platform-control" element={<RequireStaff><StaffLayout><StaffPlatformControl /></StaffLayout></RequireStaff>} />
            <Route path="/staff/managed-projects" element={<RequireStaff><StaffLayout><StaffManagedProjects /></StaffLayout></RequireStaff>} />

            {/* ============ SHARED PAGES ============ */}
            <Route path="/bill/:bill_number" element={<BillDetail />} />

            {/* ============ LEGACY REDIRECTS ============ */}
            <Route path="/dashboard/gamer" element={<Navigate to="/gamer/home" replace />} />
            <Route path="/dashboard/organizer/*" element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="/dashboard/staff/*" element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="/GamerLogin" element={<Navigate to="/auth/gamer/login" replace />} />
            <Route path="/GamerSignup" element={<Navigate to="/auth/gamer/register" replace />} />
            <Route path="/OrganizerLogin" element={<Navigate to="/auth/organizer/login" replace />} />
            <Route path="/StaffLogin" element={<Navigate to="/admin" replace />} />
            <Route path="/staff/gigs" element={<Navigate to="/staff/services" replace />} />
            <Route path="/staff/marketplace" element={<Navigate to="/staff/services" replace />} />
            <Route path="/staff/marketplace/new" element={<Navigate to="/staff/services" replace />} />
            <Route path="/staff/marketplace/:id" element={<Navigate to="/staff/services" replace />} />
            <Route path="/gamer/connect" element={<Navigate to="/gamer/profile?tab=connect" replace />} />
            <Route path="/radar/:radar_id" element={<Navigate to="/radar" replace />} />
            <Route path="/talents" element={<Navigate to="/auth" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
