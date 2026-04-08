import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import PageNotFound from './lib/PageNotFound'
import { AuthProvider } from '@/lib/AuthContext'
import { RequireGamer, RequireOrganizer, RequireStaff } from '@/lib/auth-guards'

// Auth pages
import AuthChoice from './pages/AuthChoice'
import GamerAuthLogin from './pages/auth/GamerAuthLogin'
import GamerAuthRegister from './pages/auth/GamerAuthRegister'
import OrganizerAuthLogin from './pages/auth/OrganizerAuthLogin'
import OrganizerAuthRegister from './pages/auth/OrganizerAuthRegister'
import StaffLogin from './pages/StaffLogin'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Public pages
import Home from './pages/Home'
import Tournaments from './pages/Tournaments'
import TournamentPublic from './pages/TournamentPublic'
import Teams from './pages/Teams'
import TeamProfile from './pages/TeamProfile'
import OrganizerPublicProfile from './pages/OrganizerPublicProfile'
import GamerDetail from './pages/GamerDetail'
import BecomeTalent from './pages/BecomeTalent'
import RadarDetailPage from './pages/RadarDetailPage'
import SharedBillPage from './pages/SharedBillPage'

// Gamer pages
import GamerHome from './pages/GamerHome'
import GamerProfile from './pages/GamerProfile'
import GamerProfileView from './pages/GamerProfileView'
import CreateTeam from './pages/CreateTeam'
import TeamDetails from './pages/TeamDetails'
import GigRequests from './pages/GigRequests'
import GigDetailPage from './pages/GigDetailPage'
import MyOrders from './pages/MyOrders'
import GamerOrderDetail from './pages/GamerOrderDetail'
import GamerNotifications from './pages/GamerNotifications'
import Marketplace from './pages/Marketplace'
import Cart from './pages/Cart'
import TournamentDetails from './pages/TournamentDetails'
import Arena from './pages/gamer/Arena'
import GamerBilling from './pages/GamerBilling'

// Organizer pages
import OrganizerLayout from '@/components/layouts/OrganizerLayout'
import OrganizerDashboard from './pages/OrganizerDashboard'
import OrganizerTournaments from './pages/OrganizerTournaments'
import TournamentBuilder from './pages/TournamentBuilder'
import OrgTournamentManage from './pages/organizer/TournamentManage'
import CoOrganizerView from './pages/organizer/CoOrganizerView'
import OrganizerSettings from './pages/OrganizerSettings'
import OrganizerTeams from './pages/OrganizerTeams'
import OrganizerMessages from './pages/OrganizerMessages'
import SponsorshipRadar from './pages/SponsorshipRadar'
import BillDetail from './pages/BillDetail'
import OrganizerBilling from './pages/organizer/OrganizerBilling'
import CoOrganizedTournaments from './pages/organizer/CoOrganizedTournaments'
import PaymentMethod from './pages/organizer/PaymentMethod'

// Staff pages
import StaffLayout from '@/components/layouts/StaffLayout'
import StaffDashboard from './pages/StaffDashboard'
import StaffTournaments from './pages/StaffTournaments'
import StaffTournamentDetail from './pages/StaffTournamentDetail'
import StaffUsers from './pages/StaffUsers'
import StaffUserDetail from './pages/StaffUserDetail'
import StaffMessages from './pages/StaffMessages'
import StaffApprovals from './pages/StaffApprovals'
import StaffOrders from './pages/StaffOrders'
import StaffOrderDetail from './pages/StaffOrderDetail'
import StaffMarketplace from './pages/StaffMarketplace'
import StaffRadarPanel from './pages/StaffRadarPanel'
import StaffBilling from './pages/StaffBilling'
import StaffTournamentOrders from './pages/StaffTournamentOrders'
import StaffOrganizers from './pages/StaffOrganizers'
import StaffRevenue from './pages/staff/StaffRevenue'
import StaffSettings from './pages/StaffSettings'
import StaffAuditTrail from './pages/StaffAuditTrail'

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
            <Route path="/talents" element={<BecomeTalent />} />
            <Route path="/radar" element={<SponsorshipRadar />} />
            <Route path="/radar/:radar_id" element={<RadarDetailPage />} />

            {/* ============ AUTH ZONE ============ */}
            <Route path="/auth" element={<AuthChoice />} />
            <Route path="/auth/gamer/login" element={<GamerAuthLogin />} />
            <Route path="/auth/gamer/register" element={<GamerAuthRegister />} />
            <Route path="/auth/organizer/login" element={<OrganizerAuthLogin />} />
            <Route path="/auth/organizer/register" element={<OrganizerAuthRegister />} />
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
            <Route path="/gamer/profile/talent" element={<RequireGamer><BecomeTalent /></RequireGamer>} />
            <Route path="/gamer/profile/:slug" element={<GamerProfileView />} />
            <Route path="/gamer/teams" element={<RequireGamer><Teams /></RequireGamer>} />
            <Route path="/gamer/teams/create" element={<RequireGamer><CreateTeam /></RequireGamer>} />
            <Route path="/gamer/teams/:id" element={<RequireGamer><TeamDetails /></RequireGamer>} />
            <Route path="/gamer/gigs" element={<RequireGamer><GigRequests /></RequireGamer>} />
            <Route path="/gamer/gigs/:gig_id" element={<RequireGamer><GigDetailPage /></RequireGamer>} />
            <Route path="/gamer/orders" element={<RequireGamer><MyOrders /></RequireGamer>} />
            <Route path="/gamer/orders/:id" element={<RequireGamer><GamerOrderDetail /></RequireGamer>} />
            <Route path="/gamer/notifications" element={<RequireGamer><GamerNotifications /></RequireGamer>} />
            <Route path="/gamer/marketplace" element={<RequireGamer><Marketplace /></RequireGamer>} />
            <Route path="/gamer/cart" element={<RequireGamer><Cart /></RequireGamer>} />
            <Route path="/gamer/:id" element={<GamerProfileView />} />

            {/* ============ ORGANIZER ZONE ============ */}
            <Route path="/organizer/dashboard" element={<RequireOrganizer><OrganizerLayout><OrganizerDashboard /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments" element={<RequireOrganizer><OrganizerLayout><OrganizerTournaments /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/new" element={<RequireOrganizer><OrganizerLayout><TournamentBuilder /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/new/:id" element={<RequireOrganizer><OrganizerLayout><TournamentBuilder /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/teams" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="teams" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/brackets" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="brackets" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/chat" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="chat" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/manage/settings" element={<RequireOrganizer><OrganizerLayout><OrgTournamentManage defaultTab="report" /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/tournaments/:id/view" element={<RequireOrganizer><OrganizerLayout><CoOrganizerView /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/radar" element={<RequireOrganizer><OrganizerLayout><SponsorshipRadar /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/radar/:radar_id" element={<RequireOrganizer><OrganizerLayout><RadarDetailPage /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/billing" element={<RequireOrganizer><OrganizerLayout><OrganizerBilling /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/billing/payment-method" element={<RequireOrganizer><OrganizerLayout><PaymentMethod /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/billing/:bill_number" element={<RequireOrganizer><OrganizerLayout><BillDetail /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/sponsored" element={<RequireOrganizer><OrganizerLayout><CoOrganizedTournaments /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/teams" element={<RequireOrganizer><OrganizerLayout><OrganizerTeams /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/messages" element={<RequireOrganizer><OrganizerLayout><OrganizerMessages /></OrganizerLayout></RequireOrganizer>} />
            <Route path="/organizer/profile" element={<RequireOrganizer><OrganizerLayout><OrganizerSettings /></OrganizerLayout></RequireOrganizer>} />

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
            <Route path="/staff/marketplace" element={<RequireStaff><StaffLayout><StaffMarketplace /></StaffLayout></RequireStaff>} />
            <Route path="/staff/marketplace/new" element={<RequireStaff><StaffLayout><StaffMarketplace /></StaffLayout></RequireStaff>} />
            <Route path="/staff/marketplace/:id" element={<RequireStaff><StaffLayout><StaffMarketplace /></StaffLayout></RequireStaff>} />
            <Route path="/staff/orders/gamer/:id" element={<RequireStaff><StaffLayout><StaffOrderDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/orders/tournament/:id" element={<RequireStaff><StaffLayout><StaffOrderDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/radar" element={<RequireStaff><StaffLayout><StaffRadarPanel /></StaffLayout></RequireStaff>} />
            <Route path="/staff/billing" element={<RequireStaff><StaffLayout><StaffBilling /></StaffLayout></RequireStaff>} />
            <Route path="/staff/billing/:bill_number" element={<RequireStaff><StaffLayout><BillDetail /></StaffLayout></RequireStaff>} />
            <Route path="/staff/tournament-orders" element={<RequireStaff><StaffLayout><StaffTournamentOrders /></StaffLayout></RequireStaff>} />
            <Route path="/staff/organizers" element={<RequireStaff><StaffLayout><StaffOrganizers /></StaffLayout></RequireStaff>} />
            <Route path="/staff/revenue" element={<RequireStaff><StaffLayout><StaffRevenue /></StaffLayout></RequireStaff>} />
            <Route path="/staff/settings" element={<RequireStaff><StaffLayout><StaffSettings /></StaffLayout></RequireStaff>} />
            <Route path="/staff/audit" element={<RequireStaff><StaffLayout><StaffAuditTrail /></StaffLayout></RequireStaff>} />

            {/* ============ SHARED PAGES ============ */}
            <Route path="/bill/:bill_number" element={<SharedBillPage />} />
            <Route path="/gigs/:gig_id" element={<GigDetailPage />} />

            {/* ============ LEGACY REDIRECTS ============ */}
            <Route path="/dashboard/gamer" element={<Navigate to="/gamer/home" replace />} />
            <Route path="/dashboard/organizer/*" element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="/dashboard/staff/*" element={<Navigate to="/staff/dashboard" replace />} />
            <Route path="/GamerLogin" element={<Navigate to="/auth/gamer/login" replace />} />
            <Route path="/GamerSignup" element={<Navigate to="/auth/gamer/register" replace />} />
            <Route path="/OrganizerLogin" element={<Navigate to="/auth/organizer/login" replace />} />
            <Route path="/StaffLogin" element={<Navigate to="/admin" replace />} />
            <Route path="/marketplace" element={<Navigate to="/gamer/marketplace" replace />} />

            {/* 404 */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
