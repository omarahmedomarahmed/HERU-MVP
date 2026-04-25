import { apiCall } from '@/api/heruClient'

const STAFF_TOKEN_KEY = 'heru_staff_token'
const STAFF_EXPIRES_KEY = 'heru_staff_expires'

/**
 * Get the staff session token from localStorage.
 * @returns {string|null}
 */
export function getStaffToken() {
  return localStorage.getItem(STAFF_TOKEN_KEY)
}

/**
 * Store a staff session token.
 * @param {string} token
 * @param {string} expiresAt - ISO date string
 */
export function setStaffToken(token, expiresAt) {
  localStorage.setItem(STAFF_TOKEN_KEY, token)
  if (expiresAt) {
    localStorage.setItem(STAFF_EXPIRES_KEY, expiresAt)
  }
}

/**
 * Clear staff session from localStorage.
 */
export function clearStaffSession() {
  localStorage.removeItem(STAFF_TOKEN_KEY)
  localStorage.removeItem(STAFF_EXPIRES_KEY)
}

/**
 * Check whether a staff token exists and has not expired (client-side only).
 * @returns {boolean}
 */
export function isStaffAuthenticated() {
  const token = getStaffToken()
  if (!token) return false

  const expiresAt = localStorage.getItem(STAFF_EXPIRES_KEY)
  if (!expiresAt) return false

  return new Date(expiresAt) > new Date()
}

/**
 * Validate the current staff session against the backend.
 * Returns the session object on success, null on failure.
 * @returns {Promise<object|null>}
 */
export async function validateStaffSession() {
  const token = getStaffToken()
  if (!token) return null

  try {
    const result = await apiCall('/auth/staff/validate', {
      method: 'POST',
      body: { session_token: token },
    })
    return result
  } catch (err) {
    console.error('Staff session validation failed:', err)
    // If validation fails, clear stale token
    clearStaffSession()
    return null
  }
}

/**
 * Verify staff access — checks client-side expiry first, then optionally
 * validates with the backend.
 * @param {boolean} serverCheck - if true, also validates with the backend
 * @returns {Promise<boolean>}
 */
export async function verifyStaffAccess(serverCheck = false) {
  if (!isStaffAuthenticated()) return false
  if (!serverCheck) return true
  const session = await validateStaffSession()
  return !!session
}

/**
 * Logout staff member — invalidate session on backend and clear local storage.
 * @param {Function} navigate - React Router navigate function
 */
export async function logoutStaff(navigate) {
  const token = getStaffToken()

  if (token) {
    try {
      await apiCall('/auth/staff/logout', {
        method: 'POST',
        body: { session_token: token },
      })
    } catch (err) {
      console.warn('Could not invalidate staff session on server:', err)
    }
  }

  clearStaffSession()

  if (navigate) {
    navigate('/', { replace: true })
  }
}
