import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || '/api'
const AuthContext = createContext(null)

async function authFetch(endpoint, options = {}) {
  const { method = 'GET', body } = options
  const headers = { 'Content-Type': 'application/json' }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const staffToken = localStorage.getItem('heru_staff_token')
  if (staffToken) {
    headers['X-Staff-Token'] = staffToken
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const fetchingRef = useRef(false)

  const fetchUserProfile = useCallback(async () => {
    if (fetchingRef.current) return null
    fetchingRef.current = true
    try {
      const data = await authFetch('/auth/me')
      const profile = {
        ...data,
        role: data?.user?.role || data?.role || null,
        full_name: data?.user?.full_name || data?.full_name || '',
        is_verified: data?.user?.is_verified || false,
      }
      setUserProfile(profile)
      return profile
    } catch (err) {
      console.error('[AuthContext] fetchUserProfile failed:', err.message)
      setUserProfile(null)
      return null
    } finally {
      fetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (!mounted) return

        if (error || (session && !session.user)) {
          await supabase.auth.signOut().catch(() => {})
          if (mounted) setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          await fetchUserProfile()
        }
      } catch (err) {
        console.warn('[AuthContext] init error, clearing session:', err.message)
        await supabase.auth.signOut().catch(() => {})
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 5000)

    init().finally(() => clearTimeout(timeout))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setUser(null)
          setUserProfile(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            setUser(session.user)
          } else {
            setUser(null)
            setUserProfile(null)
            setLoading(false)
          }
        }
      }
    )

    return () => { mounted = false; subscription.unsubscribe() }
  }, [fetchUserProfile])

  const login = async (email, password) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }
    setUser(data.user)
    const profile = await fetchUserProfile()
    if (!profile) {
      const fallback = {
        role: data.user?.user_metadata?.role || 'gamer',
        full_name: data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || '',
      }
      setUserProfile(fallback)
      return { user: data.user, profile: fallback }
    }
    return { user: data.user, profile }
  }

  const register = async (email, password, role = 'gamer', profileData = {}) => {
    setAuthError(null)
    const roleEndpointMap = {
      organizer: '/auth/register/organizer',
      sponsor: '/auth/register/sponsor',
      service_provider: '/auth/register/provider',
    }
    const endpoint = roleEndpointMap[role] || '/auth/register/gamer'
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...profileData }),
    })
    const result = await res.json()
    if (!res.ok) {
      const msg = result.error || 'Registration failed'
      setAuthError(msg)
      throw new Error(msg)
    }
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      return { user: result.user, profile: { role }, needsSignIn: true }
    }
    setUser(signInData.user)
    const profile = await fetchUserProfile()
    return { user: signInData.user, profile: profile || { role } }
  }

  const staffLogin = async (email, password, access_key) => {
    setAuthError(null)
    try {
      const res = await fetch(`${API_URL}/auth/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, access_key }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Staff login failed')
      localStorage.setItem('heru_staff_token', result.staff_session.session_token)
      localStorage.setItem('heru_staff_expires', result.staff_session.expires_at)
      await supabase.auth.signInWithPassword({ email, password }).catch(() => {})
      const staffUser = result.user || { email, role: 'admin' }
      setUser(staffUser)
      setUserProfile({ ...staffUser, role: 'admin' })
      return result
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }

  const logout = async () => {
    localStorage.removeItem('heru_staff_token')
    localStorage.removeItem('heru_staff_expires')
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const isAuthenticated = !!user
  const role = userProfile?.role || null

  const getDashboardPath = () => {
    if (role === 'admin') return '/staff/dashboard'
    if (role === 'organizer') return '/organizer/dashboard'
    if (role === 'sponsor') return '/sponsor/dashboard'
    if (role === 'service_provider') return '/provider/dashboard'
    return '/gamer/home'
  }

  const value = {
    user, userProfile, loading, authError, isAuthenticated, role,
    isGamer: role === 'gamer',
    isOrganizer: role === 'organizer',
    isSponsor: role === 'sponsor',
    isProvider: role === 'service_provider',
    isAdmin: role === 'admin',
    getDashboardPath, login, register, logout, staffLogin, fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
