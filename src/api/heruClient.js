import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQuery(filters) {
  if (!filters || typeof filters !== 'object') return ''
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  })
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' }

  // Attach Supabase JWT if a session exists
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  // Attach staff token when present (staff routes need it)
  const staffToken = localStorage.getItem('heru_staff_token')
  if (staffToken) {
    headers['X-Staff-Token'] = staffToken
  }

  return headers
}

async function apiCall(endpoint, options = {}) {
  const { method = 'GET', body, headers: extraHeaders = {} } = options
  const authHeaders = await getAuthHeaders()

  const fetchOptions = {
    method,
    headers: { ...authHeaders, ...extraHeaders },
  }

  if (body !== undefined && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, fetchOptions)

  // Handle 204 No Content
  if (response.status === 204) return null

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `API error ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

// ---------------------------------------------------------------------------
// Standard CRUD factory — builds the common list/get/create/update/delete set
// ---------------------------------------------------------------------------

function createEntity(basePath) {
  return {
    list:   (filters) => apiCall(`${basePath}${buildQuery(filters)}`),
    get:    (id)      => apiCall(`${basePath}/${id}`),
    create: (data)    => apiCall(basePath, { method: 'POST', body: data }),
    update: (id, data) => apiCall(`${basePath}/${id}`, { method: 'PUT', body: data }),
    delete: (id)      => apiCall(`${basePath}/${id}`, { method: 'DELETE' }),
  }
}

// ---------------------------------------------------------------------------
// Entity helpers — standard CRUD factory pattern
// ---------------------------------------------------------------------------

export const Tournament = {
  ...createEntity('/tournaments'),
  publish:          (id)          => apiCall(`/tournaments/${id}/publish`, { method: 'POST' }),
  updateBrackets:   (id, data)    => apiCall(`/tournaments/${id}/brackets`, { method: 'PUT', body: data }),
  sendChat:         (id, msg)     => apiCall(`/tournaments/${id}/chat`, { method: 'POST', body: msg }),
  sendGeneralChat:  (id, msg)     => apiCall(`/tournaments/${id}/general-chat`, { method: 'POST', body: msg }),
  sendSupportChat:  (id, msg)     => apiCall(`/tournaments/${id}/support-chat`, { method: 'POST', body: msg }),
  joinRequest:      (id, data)    => apiCall(`/tournaments/${id}/join-request`, { method: 'POST', body: data }),
  handleJoinRequest:(id, reqId, data) => apiCall(`/tournaments/${id}/join-request/${reqId}`, { method: 'PUT', body: data }),
  inviteTeam:       (id, data)    => apiCall(`/tournaments/${id}/invite-team`, { method: 'POST', body: data }),
  acceptInvite:     (id, data)    => apiCall(`/tournaments/${id}/accept-invite`, { method: 'POST', body: data }),
  invitePlayer:     (id, data)    => apiCall(`/tournaments/${id}/invite-player`, { method: 'POST', body: data }),
  joinAsPlayer:     (id, data)    => apiCall(`/tournaments/${id}/join-player`, { method: 'POST', body: data }),
  removeTeam:       (id, teamId)  => apiCall(`/tournaments/${id}/teams/${teamId}`, { method: 'DELETE' }),
  addTalent:        (id, data)    => apiCall(`/tournaments/${id}/talents`, { method: 'POST', body: data }),
  removeTalent:     (id, talentId)=> apiCall(`/tournaments/${id}/talents/${talentId}`, { method: 'DELETE' }),
  updateMatchScore: (id, matchId, data) => apiCall(`/tournaments/${id}/brackets/${matchId}`, { method: 'PUT', body: data }),
  announceWinner:   (id, data)   => apiCall(`/tournaments/${id}/announce-winner`, { method: 'POST', body: data }),
  updateSignupPage: (id, data)   => apiCall(`/tournaments/${id}/signup-page`, { method: 'PUT', body: data }),
  getTeamChat:      (id, teamId) => apiCall(`/tournaments/${id}/team-chat/${teamId}`),
  sendTeamChat:     (id, teamId, msg) => apiCall(`/tournaments/${id}/team-chat/${teamId}`, { method: 'POST', body: msg }),
  // Match records
  getMatches:       (id)          => apiCall(`/tournaments/${id}/matches`),
  getMatch:         (id, matchId) => apiCall(`/tournaments/${id}/matches/${matchId}`),
  createMatch:      (id, data)    => apiCall(`/tournaments/${id}/matches`, { method: 'POST', body: data }),
  updateMatch:      (id, matchId, data) => apiCall(`/tournaments/${id}/matches/${matchId}`, { method: 'PUT', body: data }),
  submitMatchResult:(id, matchId, data) => apiCall(`/tournaments/${id}/matches/${matchId}/submit`, { method: 'POST', body: data }),
  reportAbuse:      (id, matchId, data) => apiCall(`/tournaments/${id}/matches/${matchId}/report-abuse`, { method: 'POST', body: data }),
}

export const Team = {
  ...createEntity('/teams'),
  joinRequest:      (id, data)    => apiCall(`/teams/${id}/join-request`, { method: 'POST', body: data }),
  handleJoinRequest:(id, reqId, data) => apiCall(`/teams/${id}/join-request/${reqId}`, { method: 'PUT', body: data }),
  inviteMember:     (id, data)    => apiCall(`/teams/${id}/invite`, { method: 'POST', body: data }),
  removeMember:     (id, memberId)=> apiCall(`/teams/${id}/members/${memberId}`, { method: 'DELETE' }),
}

export const GamerProfile = {
  ...createEntity('/gamers'),
  me:               ()            => apiCall('/gamers/me'),
  updateMe:         (data)        => apiCall('/gamers/me', { method: 'PUT', body: data }),
  stats:            (id)          => apiCall(`/gamers/${id}/stats`),
  achievements:     (id)          => apiCall(`/gamers/${id}/achievements`),
}

export const OrganizerProfile = {
  ...createEntity('/organizers'),
  me:               ()            => apiCall('/organizers/me'),
  updateMe:         (data)        => apiCall('/organizers/me', { method: 'PUT', body: data }),
}

// ---------------------------------------------------------------------------
// Platform Pivot — new 4-stakeholder entities
// ---------------------------------------------------------------------------

export const Service = {
  ...createEntity('/services'),
  mine:             ()            => apiCall('/services/mine'),
  approve:          (id)          => apiCall(`/services/${id}/approve`, { method: 'PUT' }),
}

export const ServiceBooking = {
  ...createEntity('/service-bookings'),
  accept:           (id)          => apiCall(`/service-bookings/${id}/accept`, { method: 'PUT' }),
  reject:           (id, data)    => apiCall(`/service-bookings/${id}/reject`, { method: 'PUT', body: data }),
  complete:         (id)          => apiCall(`/service-bookings/${id}/complete`, { method: 'PUT' }),
  release:          (id)          => apiCall(`/service-bookings/${id}/release`, { method: 'PUT' }),
  sendChat:         (id, msg)     => apiCall(`/service-bookings/${id}/chat`, { method: 'POST', body: msg }),
  addFile:          (id, data)    => apiCall(`/service-bookings/${id}/files`, { method: 'POST', body: data }),
}

export const SponsorshipPackage = {
  ...createEntity('/sponsorship-packages'),
}

export const Sponsorship = {
  ...createEntity('/sponsorships'),
  pay:              (id, data)    => apiCall(`/sponsorships/${id}/pay`, { method: 'PUT', body: data }),
}

export const Subscription = {
  me:               ()            => apiCall('/subscriptions/me'),
  create:           (data)        => apiCall('/subscriptions', { method: 'POST', body: data }),
  cancel:           ()            => apiCall('/subscriptions/cancel', { method: 'PUT' }),
}

export const SponsorProfile = {
  me:               ()            => apiCall('/sponsors/me'),
  updateMe:         (data)        => apiCall('/sponsors/me', { method: 'PUT', body: data }),
}

export const Provider = {
  ...createEntity('/providers'),
  me:               ()            => apiCall('/providers/me'),
  updateMe:         (data)        => apiCall('/providers/me', { method: 'PUT', body: data }),
}

export const Review = {
  ...createEntity('/reviews'),
}

export const OrganizerVerification = {
  me:               ()            => apiCall('/organizer-verifications/me'),
  submit:           (data)        => apiCall('/organizer-verifications', { method: 'POST', body: data }),
  review:           (id, data)    => apiCall(`/organizer-verifications/${id}`, { method: 'PUT', body: data }),
}

export const ManagedService = {
  ...createEntity('/managed-services'),
  approve:          (id)          => apiCall(`/managed-services/${id}/approve`, { method: 'PUT' }),
  assign:           (id, data)    => apiCall(`/managed-services/${id}/assign`, { method: 'PUT', body: data }),
  submitProposal:   (id, data)    => apiCall(`/managed-services/${id}/proposal`, { method: 'PUT', body: data }),
  complete:         (id, data)    => apiCall(`/managed-services/${id}/complete`, { method: 'PUT', body: data }),
  sendChat:         (id, msg)     => apiCall(`/managed-services/${id}/chat`, { method: 'POST', body: msg }),
}

export const Coaching = {
  list:             (filters)     => apiCall(`/coaches${buildQuery(filters)}`),
  get:              (id)          => apiCall(`/coaches/${id}`),
  sessions:         ()            => apiCall('/coaching-sessions'),
  book:             (data)        => apiCall('/coaching-sessions', { method: 'POST', body: data }),
  complete:         (id)          => apiCall(`/coaching-sessions/${id}/complete`, { method: 'PUT' }),
}

export const Friend = {
  list:             ()            => apiCall('/friends'),
  requests:         ()            => apiCall('/friends/requests'),
  sendRequest:      (data)        => apiCall('/friends/request', { method: 'POST', body: data }),
  accept:           (id)          => apiCall(`/friends/${id}/accept`, { method: 'PUT' }),
  block:            (id)          => apiCall(`/friends/${id}/block`, { method: 'PUT' }),
  remove:           (id)          => apiCall(`/friends/${id}`, { method: 'DELETE' }),
}

export const DirectMessage = {
  conversations:    ()            => apiCall('/direct-messages'),
  thread:           (convId)      => apiCall(`/direct-messages/${convId}`),
  send:             (data)        => apiCall('/direct-messages', { method: 'POST', body: data }),
  markRead:         (id)          => apiCall(`/direct-messages/${id}/read`, { method: 'PUT' }),
}

export const Leaderboard = {
  list:             (filters)     => apiCall(`/leaderboards${buildQuery(filters)}`),
  me:               ()            => apiCall('/leaderboards/me'),
}

export const Report = {
  submit:           (data)        => apiCall('/reports', { method: 'POST', body: data }),
  list:             (filters)     => apiCall(`/reports${buildQuery(filters)}`),
  update:           (id, data)    => apiCall(`/reports/${id}`, { method: 'PUT', body: data }),
}

export const Order = {
  ...createEntity('/orders'),
  sendSupportChat:  (id, msg)     => apiCall(`/orders/${id}/support-chat`, { method: 'POST', body: msg }),
}

export const TournamentOrder = {
  ...createEntity('/tournament-orders'),
  sendInternalChat: (id, msg)     => apiCall(`/tournament-orders/${id}/internal-chat`, { method: 'POST', body: msg }),
  updateFulfillment:(id, data)    => apiCall(`/tournament-orders/${id}/fulfillment`, { method: 'PUT', body: data }),
}


export const Bill = {
  ...createEntity('/bills'),
  getByNumber:      (num)         => apiCall(`/bills/number/${num}`),
  markPaid:         (id, data)    => apiCall(`/bills/${id}/pay`, { method: 'PUT', body: data }),
}

export const BillingSnapshot = {
  ...createEntity('/billing-snapshots'),
}

export const ApprovalRequest = {
  ...createEntity('/approvals'),
  approve:          (id, data)    => apiCall(`/approvals/${id}/approve`, { method: 'PUT', body: data }),
  reject:           (id, data)    => apiCall(`/approvals/${id}/reject`, { method: 'PUT', body: data }),
}

export const AppSettings = {
  list:             ()            => apiCall('/settings'),
  get:              (key)         => apiCall(`/settings/${key}`),
  update:           (key, data)   => apiCall(`/settings/${key}`, { method: 'PUT', body: data }),
}

export const Staff = {
  dashboard:        ()            => apiCall('/staff/dashboard'),
  revenue:          (filters)     => apiCall(`/staff/revenue${buildQuery(filters)}`),
  users:            (filters)     => apiCall(`/staff/users${buildQuery(filters)}`),
  getUser:          (id)          => apiCall(`/staff/users/${id}`),
  updateUser:       (id, data)    => apiCall(`/staff/users/${id}`, { method: 'PUT', body: data }),
  organizers:       (filters)     => apiCall(`/staff/organizers${buildQuery(filters)}`),
  messages:         (filters)     => apiCall(`/staff/messages${buildQuery(filters)}`),
  accessKeys:       ()            => apiCall('/staff/access-keys'),
  createAccessKey:  (data)        => apiCall('/staff/access-keys', { method: 'POST', body: data }),
  deactivateKey:    (id)          => apiCall(`/staff/access-keys/${id}/deactivate`, { method: 'POST' }),
  audit:            (filters)     => apiCall(`/staff/audit${buildQuery(filters)}`),
  // Staff tournament/billing/radar controls
  updateTournament: (id, data)    => apiCall(`/staff/tournaments/${id}`, { method: 'PUT', body: data }),
  updateTournamentStatus: (id, data) => apiCall(`/staff/tournaments/${id}/status`, { method: 'PUT', body: data }),
  allBills:         (filters)     => apiCall(`/staff/bills/all${buildQuery(filters)}`),
  updateBill:       (id, data)    => apiCall(`/staff/bills/${id}`, { method: 'PUT', body: data }),
  // Gamers
  gamers:           (filters)     => apiCall(`/staff/gamers${buildQuery(filters)}`),
  updateGamer:      (id, data)    => apiCall(`/staff/gamers/${id}`, { method: 'PUT', body: data }),
  // Teams
  teams:            (filters)     => apiCall(`/staff/teams${buildQuery(filters)}`),
  updateTeam:       (id, data)    => apiCall(`/staff/teams/${id}`, { method: 'PUT', body: data }),
  deleteTeam:       (id)          => apiCall(`/staff/teams/${id}`, { method: 'DELETE' }),
  // Organizer profiles
  updateOrganizer:  (id, data)    => apiCall(`/staff/organizers/${id}`, { method: 'PUT', body: data }),
  // Tournament CRUD
  deleteTournament: (id)          => apiCall(`/staff/tournaments/${id}`, { method: 'DELETE' }),
  buildOnBehalf:    (data)        => apiCall('/staff/tournaments/build-on-behalf', { method: 'POST', body: data }),
  // Users
  deleteUser:       (id)          => apiCall(`/staff/users/${id}`, { method: 'DELETE' }),
  // Bills
  createBill:       (data)        => apiCall('/staff/bills', { method: 'POST', body: data }),
  deleteBill:       (id)          => apiCall(`/staff/bills/${id}`, { method: 'DELETE' }),
  // Orders
  allOrders:        (filters)     => apiCall(`/staff/orders${buildQuery(filters)}`),
  updateOrder:      (id, data)    => apiCall(`/staff/orders/${id}`, { method: 'PUT', body: data }),
  // Tournament orders
  allTournamentOrders: (filters)  => apiCall(`/staff/tournament-orders${buildQuery(filters)}`),
  updateTournamentOrder: (id, data) => apiCall(`/staff/tournament-orders/${id}`, { method: 'PUT', body: data }),
  // Approvals
  allApprovals:     (filters)     => apiCall(`/staff/approvals${buildQuery(filters)}`),
  updateApproval:   (id, data)    => apiCall(`/staff/approvals/${id}`, { method: 'PUT', body: data }),
  // Sessions
  sessions:         ()            => apiCall('/staff/sessions'),
  terminateSession: (id)          => apiCall(`/staff/sessions/${id}`, { method: 'DELETE' }),
  // App settings
  appSettings:      ()            => apiCall('/staff/app-settings'),
  updateAppSetting: (key, data)   => apiCall(`/staff/app-settings/${key}`, { method: 'PUT', body: data }),
}

export const TournamentReport = {
  ...createEntity('/tournament-reports'),
}

export const Deliverable = {
  ...createEntity('/deliverables'),
}

export const OrganizerPageConfig = {
  get:      (orgId) => apiCall(`/organizer-pages/${orgId}`),
  updateMe: (data)  => apiCall('/organizer-pages/me', { method: 'PUT', body: data }),
}

export const Achievement = {
  list:             ()       => apiCall('/achievements'),
  userAchievements: (userId) => apiCall(`/achievements/user/${userId}`),
  check:            (userId) => apiCall(`/achievements/check/${userId}`, { method: 'POST' }),
  grant:            (data)   => apiCall('/achievements/grant', { method: 'POST', body: data }),
}

export const TeamMember = {
  list:       (teamId)                      => apiCall(`/teams/${teamId}/members`),
  updateRole: (teamId, userId, role, customRole) =>
    apiCall(`/teams/${teamId}/members/${userId}/role`, { method: 'PUT', body: { role, custom_role: customRole } }),
}

export const Connect = {
  status:              ()         => apiCall('/connect/status'),
  discordAuthUrl:      ()         => apiCall('/connect/discord/auth-url').then(d => d.url),
  disconnectDiscord:   ()         => apiCall('/connect/discord', { method: 'DELETE' }),
  botInstallUrl:       ()         => apiCall('/connect/bot-install-url').then(d => d.url),
  riotAccounts:        ()         => apiCall('/connect/riot/accounts'),
  publicRiotAccounts:  (userId)   => apiCall(`/connect/riot/public/${userId}`),
  publicDiscord:       (userId)   => apiCall(`/connect/discord/public/${userId}`),
  publicRiotBatch:     (userIds)  => apiCall('/connect/riot/public-batch', { method: 'POST', body: { user_ids: userIds } }),
  linkRiot:            (data)     => apiCall('/connect/riot/link', { method: 'POST', body: data }),
  removeRiot:          (id)       => apiCall(`/connect/riot/${id}`, { method: 'DELETE' }),
  syncRiot:            (id)       => apiCall(`/connect/riot/${id}/sync`, { method: 'POST' }),
  updateRiot:          (id, data) => apiCall(`/connect/riot/${id}`, { method: 'PATCH', body: data }),
}


export const Badge = {
  list:                ()         => apiCall('/badges'),
  userBadges:          (userId)   => apiCall(`/badges/user/${userId}`),
  // Staff
  create:              (data)     => apiCall('/badges', { method: 'POST', body: data }),
  update:              (id, data) => apiCall(`/badges/${id}`, { method: 'PUT', body: data }),
  award:               (data)     => apiCall('/badges/award', { method: 'POST', body: data }),
  revoke:              (userId, badgeId) => apiCall(`/badges/award/${userId}/${badgeId}`, { method: 'DELETE' }),
  // Organizer
  createCustom:        (data)     => apiCall('/badges/organizer', { method: 'POST', body: data }),
  myCustomBadges:      ()         => apiCall('/badges/organizer/mine'),
  awardToTournament:   (data)     => apiCall('/badges/organizer/award-tournament', { method: 'POST', body: data }),
}

export const Venue = {
  list:         ()         => apiCall('/venues'),
  submit:       (data)     => apiCall('/venues', { method: 'POST', body: data }),
  update:       (id, data) => apiCall(`/venues/${id}`, { method: 'PUT', body: data }),
  // Staff
  staffAll:     (filters)  => apiCall(`/venues/staff/all${buildQuery(filters)}`),
  review:       (id, data) => apiCall(`/venues/staff/${id}/review`, { method: 'PUT', body: data }),
}

// ---------------------------------------------------------------------------
// Raw API call export for custom one-off requests
// ---------------------------------------------------------------------------
export { apiCall, buildQuery, API_URL }
