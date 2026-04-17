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
  applyTalent:      (data)        => apiCall('/gamers/talent-application', { method: 'POST', body: data }),
  stats:            (id)          => apiCall(`/gamers/${id}/stats`),
  achievements:     (id)          => apiCall(`/gamers/${id}/achievements`),
}

export const OrganizerProfile = {
  ...createEntity('/organizers'),
  me:               ()            => apiCall('/organizers/me'),
  updateMe:         (data)        => apiCall('/organizers/me', { method: 'PUT', body: data }),
}

export const MarketplaceItem = {
  ...createEntity('/marketplace'),
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

export const SponsorshipRadar = {
  ...createEntity('/radar'),
  commit:           (id, data)    => apiCall(`/radar/${id}/commit`, { method: 'POST', body: data }),
  sendChat:         (id, msg)     => apiCall(`/radar/${id}/chat`, { method: 'POST', body: msg }),
  recordView:       (id)          => apiCall(`/radar/${id}/view`, { method: 'POST' }),
}

export const GigRequest = {
  ...createEntity('/gigs'),
  accept:           (id)          => apiCall(`/gigs/${id}/accept`, { method: 'POST' }),
  reject:           (id, data)    => apiCall(`/gigs/${id}/reject`, { method: 'POST', body: data }),
  complete:         (id)          => apiCall(`/gigs/${id}/complete`, { method: 'POST' }),
  sendChat:         (id, msg)     => apiCall(`/gigs/${id}/chat`, { method: 'POST', body: msg }),
  uploadFile:       (id, data)    => apiCall(`/gigs/${id}/files`, { method: 'POST', body: data }),
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
  setMarketplaceRequired: (id, data) => apiCall(`/staff/marketplace/${id}/required`, { method: 'PUT', body: data }),
  allRadar:         (filters)     => apiCall(`/staff/radar${buildQuery(filters)}`),
  updateRadar:      (id, data)    => apiCall(`/staff/radar/${id}`, { method: 'PUT', body: data }),
  radarViews:       ()            => apiCall('/staff/radar-views'),
  // Gamers
  gamers:           (filters)     => apiCall(`/staff/gamers${buildQuery(filters)}`),
  updateGamer:      (id, data)    => apiCall(`/staff/gamers/${id}`, { method: 'PUT', body: data }),
  // Teams
  teams:            (filters)     => apiCall(`/staff/teams${buildQuery(filters)}`),
  updateTeam:       (id, data)    => apiCall(`/staff/teams/${id}`, { method: 'PUT', body: data }),
  deleteTeam:       (id)          => apiCall(`/staff/teams/${id}`, { method: 'DELETE' }),
  // Gigs
  gigs:             (filters)     => apiCall(`/staff/gigs${buildQuery(filters)}`),
  updateGig:        (id, data)    => apiCall(`/staff/gigs/${id}`, { method: 'PUT', body: data }),
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
  status:            ()         => apiCall('/connect/status'),
  discordAuthUrl:    ()         => apiCall('/connect/discord/auth-url').then(d => d.url),
  disconnectDiscord: ()         => apiCall('/connect/discord', { method: 'DELETE' }),
  botInstallUrl:     ()         => apiCall('/connect/bot-install-url').then(d => d.url),
  riotAccounts:      ()         => apiCall('/connect/riot/accounts'),
  linkRiot:          (data)     => apiCall('/connect/riot/link', { method: 'POST', body: data }),
  removeRiot:        (id)       => apiCall(`/connect/riot/${id}`, { method: 'DELETE' }),
  syncRiot:          (id)       => apiCall(`/connect/riot/${id}/sync`, { method: 'POST' }),
  updateRiot:        (id, data) => apiCall(`/connect/riot/${id}`, { method: 'PATCH', body: data }),
}

export const AiAgent = {
  sendMessage:    (data)          => apiCall('/ai-agent/message', { method: 'POST', body: data }),
  getSession:     ()              => apiCall('/ai-agent/session'),
  clearSession:   ()              => apiCall('/ai-agent/session', { method: 'DELETE' }),
}

// ---------------------------------------------------------------------------
// Raw API call export for custom one-off requests
// ---------------------------------------------------------------------------
export { apiCall, buildQuery, API_URL }
