import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { isStaffAuthenticated } from '@/lib/staffAuth'

export function RequireGamer({ children }) {
  const { isAuthenticated, isGamer, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isAuthenticated || !isGamer) {
    return <Navigate to="/auth/gamer/login" state={{ from: location }} replace />
  }
  return children
}

export function RequireOrganizer({ children }) {
  const { isAuthenticated, isOrganizer, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isAuthenticated || !isOrganizer) {
    return <Navigate to="/auth/organizer/login" state={{ from: location }} replace />
  }
  return children
}

export function RequireSponsor({ children }) {
  const { isAuthenticated, isSponsor, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isAuthenticated || !isSponsor) {
    return <Navigate to="/auth/sponsor/login" state={{ from: location }} replace />
  }
  return children
}

export function RequireProvider({ children }) {
  const { isAuthenticated, isProvider, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isAuthenticated || !isProvider) {
    return <Navigate to="/auth/provider/login" state={{ from: location }} replace />
  }
  return children
}

export function RequireStaff({ children }) {
  const { loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!isStaffAuthenticated()) {
    return <Navigate to="/admin" state={{ from: location }} replace />
  }
  return children
}

const STAFF_TOKEN_KEY = 'heru_staff_token'
const STAFF_EXPIRES_KEY = 'heru_staff_expires'

export function checkStaffSession() {
  try {
    const token = localStorage.getItem(STAFF_TOKEN_KEY)
    if (!token) return false
    const expiresAt = localStorage.getItem(STAFF_EXPIRES_KEY)
    if (!expiresAt) return false
    return new Date(expiresAt) > new Date()
  } catch { return false }
}

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
  } catch { return null }
}

export function clearStaffSession() {
  localStorage.removeItem(STAFF_TOKEN_KEY)
  localStorage.removeItem(STAFF_EXPIRES_KEY)
}

export function checkOrganizerSession() {
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!sbKey) return false
    const raw = localStorage.getItem(sbKey)
    if (!raw) return false
    const session = JSON.parse(raw)
    return !!(session?.access_token || session?.currentSession?.access_token)
  } catch { return false }
}

export function getOrganizerSession() {
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (!sbKey) return null
    const raw = localStorage.getItem(sbKey)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.access_token) return parsed
    if (parsed?.currentSession) return parsed.currentSession
    return parsed
  } catch { return null }
}

export function clearOrganizerSession() {
  try {
    const keys = Object.keys(localStorage)
    const sbKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
    if (sbKey) localStorage.removeItem(sbKey)
  } catch {}
}
