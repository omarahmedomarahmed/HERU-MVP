/**
 * Auth guard utilities for HERU.gg
 *
 * This module provides:
 *   1. React component guards (RequireGamer, RequireOrganizer, RequireStaff)
 *      for use in React Router route definitions.
 *   2. Legacy function-based helpers (getOrganizerSession, getStaffSession, etc.)
 *      that remain available for existing page components during the migration
 *      away from the old Base44/sessionStorage pattern.
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { isStaffAuthenticated } from '@/lib/staffAuth'

// ---------------------------------------------------------------------------
// React component guards — wrap route elements for declarative protection
// ---------------------------------------------------------------------------

/**
 * Protects /gamer/* routes.
 * Redirects unauthenticated or non-gamer users to /auth/gamer/login.
 *
 * Usage:
 *   <Route path="/gamer/*" element={<RequireGamer><GamerLayout /></RequireGamer>} />
 */
export function RequireGamer({ children }) {
  const { isAuthenticated, isGamer, loading } = useAuth()
  const location = useLocation()

  if (loading) return null // or a loading spinner

  if (!isAuthenticated || !isGamer) {
    return <Navigate to="/auth/gamer/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * Protects /organizer/* routes.
 * Redirects unauthenticated or non-organizer users to /auth/organizer/login.
 *
 * Usage:
 *   <Route path="/organizer/*" element={<RequireOrganizer><OrganizerLayout /></RequireOrganizer>} />
 */
export function RequireOrganizer({ children }) {
  const { isAuthenticated, isOrganizer, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isAuthenticated || !isOrganizer) {
    return <Navigate to="/auth/organizer/login" state={{ from: location }} replace />
  }

  return children
}

/**
 * Protects /staff/* routes.
 * Redirects to /admin if there is no valid staff session token.
 *
 * Usage:
 *   <Route path="/staff/*" element={<RequireStaff><StaffLayout /></RequireStaff>} />
 */
export function RequireStaff({ children }) {
  const { loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!isStaffAuthenticated()) {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }

  return children
}

// ---------------------------------------------------------------------------
// Legacy function-based helpers
// ---------------------------------------------------------------------------
// These mirror the old sessionStorage-based API so that existing page
// components (OrganizerLayout, StaffDashboardNew, etc.) continue to work
// without immediate refactoring.  They now read from localStorage (matching
// the staffAuth.js token storage) and from the Supabase session.
// ---------------------------------------------------------------------------

const STAFF_TOKEN_KEY = 'heru_staff_token'
const STAFF_EXPIRES_KEY = 'heru_staff_expires'

/**
 * Check whether a staff session exists and is not expired.
 * @returns {boolean}
 */
export function checkStaffSession() {
  try {
    const token = localStorage.getItem(STAFF_TOKEN_KEY)
    if (!token) return false
    const expiresAt = localStorage.getItem(STAFF_EXPIRES_KEY)
    if (!expiresAt) return false
    return new Date(expiresAt) > new Date()
  } catch {
    return false
  }
}

/**
 * Get the staff session data or null if expired / missing.
 * @returns {{ token: string, expiresAt: string } | null}
 */
export function getStaffSession() {
  try {
    const token = localStorage.getItem(STAFF_TOKEN_KEY)
    if (!token) return null
    const expiresAt = localStorage.getItem(STAFF_EXPIRES_KEY)
    if (!expiresAt || new Date(expiresAt) <= new Date()) {
      clearStaffSession()
      return null
    }
    return { token, expiresAt }
  } catch {
    return null
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
 * Check whether an organizer session exists (Supabase-backed).
 * This is a synchronous best-effort check — it looks at the Supabase
 * session cookie/token stored by supabase-js in localStorage.
 * @returns {boolean}
 */
export function checkOrganizerSession() {
  // supabase-js stores sessions in localStorage automatically.
  // We do a best-effort sync check here; the real guard is RequireOrganizer.
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!sbKey) return false
    const raw = localStorage.getItem(sbKey)
    if (!raw) return false
    const session = JSON.parse(raw)
    return !!(session?.access_token || session?.currentSession?.access_token)
  } catch {
    return false
  }
}

/**
 * Get organizer session data (best-effort sync access to Supabase session).
 * Returns the parsed session object or null.
 * @returns {object|null}
 */
export function getOrganizerSession() {
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!sbKey) return null
    const raw = localStorage.getItem(sbKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // supabase-js v2 stores { access_token, refresh_token, user, ... }
    if (parsed?.access_token) return parsed
    if (parsed?.currentSession) return parsed.currentSession
    return parsed
  } catch {
    return null
  }
}

/**
 * Clear organizer session — signs out from Supabase.
 * Note: prefer calling logout() from useAuth() instead for a full cleanup.
 */
export function clearOrganizerSession() {
  // Best-effort sync removal; real sign-out should use supabase.auth.signOut()
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (sbKey) localStorage.removeItem(sbKey)
  } catch {
    // ignore
  }
}
