import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { apiCall } from '@/api/heruClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)            // Supabase auth user
  const [userProfile, setUserProfile] = useState(null) // user_profiles row (normalized)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // -------------------------------------------------------------------
  // Fetch the user profile and normalize the response so `role` is
  // always available at the top level.
  //
  // Backend /auth/me returns: { user: { id, email, role, ... }, gamer_profile: {...} }
  // We normalize to:          { role, full_name, is_verified, user: {...}, gamer_profile: {...} }
  // -------------------------------------------------------------------
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUserProfile(null)
      return null
    }
    try {
      const data = await apiCall('/auth/me')
      // Normalize: pull role/full_name up from nested user object
      const profile = {
        ...data,
        role: data?.user?.role || data?.role || null,
        full_name: data?.user?.full_name || data?.full_name || '',
        is_verified: data?.user?.is_verified || false,
      }
      setUserProfile(profile)
      return profile
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      setUserProfile(null)
      return null
    }
  }, [])

  // -------------------------------------------------------------------
  // Initialise: check existing session and subscribe to auth changes
  // -------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          if (session?.user) {
            setUser(session.user)
            await fetchUserProfile(session.user)
          }
          setLoading(false)
        }
      } catch (err) {
        console.error('Session init error:', err)
        if (isMounted) setLoading(false)
      }
    }

    init()

    // Listen for sign-in / sign-out / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          await fetchUserProfile(session?.user ?? null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setUserProfile(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  // -------------------------------------------------------------------
  // Auth actions
  // -------------------------------------------------------------------

  /**
   * Login with email + password via Supabase Auth.
   * Returns { user, profile } on success.
   */
  const login = async (email, password) => {
    setAuthError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(error.message)
      throw error
    }
    setUser(data.user)
    const profile = await fetchUserProfile(data.user)
    return { user: data.user, profile }
  }

  /**
   * Register a new user via the backend.
   * Backend creates auth user + user_profiles + role-specific profile.
   * @param {string} email
   * @param {string} password
   * @param {'gamer'|'organizer'} role
   * @param {object} profileData - extra fields (full_name, brand_name, etc.)
   */
  const register = async (email, password, role = 'gamer', profileData = {}) => {
    setAuthError(null)

    // Call backend registration which creates auth user + profiles
    const endpoint = role === 'organizer' ? '/auth/register/organizer' : '/auth/register/gamer'
    const result = await apiCall(endpoint, {
      method: 'POST',
      body: { email, password, ...profileData },
    }).catch(err => {
      setAuthError(err.message)
      throw err
    })

    // If backend returned a session, set it client-side
    if (result?.session?.access_token) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      })
    } else {
      // Fall back to signing in client-side
      await supabase.auth.signInWithPassword({ email, password })
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUser(session.user)
      const profile = await fetchUserProfile(session.user)
      return { user: session.user, profile }
    }

    return { user: result?.user, profile: { role } }
  }

  /**
   * Sign out from Supabase Auth and clear local state.
   */
  const logout = async () => {
    // Clear staff token if present
    localStorage.removeItem('heru_staff_token')
    localStorage.removeItem('heru_staff_expires')

    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  /**
   * Staff login — authenticates with email + password via backend,
   * stores the returned staff session token locally.
   * Returns { user, staff_session }.
   */
  const staffLogin = async (email, password) => {
    setAuthError(null)
    try {
      const result = await apiCall('/auth/staff/login', {
        method: 'POST',
        body: { email, password },
      })

      // Store staff session token
      localStorage.setItem('heru_staff_token', result.staff_session.session_token)
      localStorage.setItem('heru_staff_expires', result.staff_session.expires_at)

      if (result.user) {
        setUser(result.user)
        setUserProfile({ ...result.user, role: 'admin' })
      }

      return result
    } catch (err) {
      setAuthError(err.message || 'Staff login failed')
      throw err
    }
  }

  // -------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------
  const isAuthenticated = !!user
  const role = userProfile?.role || null
  const isGamer = role === 'gamer'
  const isOrganizer = role === 'organizer'
  const isAdmin = role === 'admin'

  const value = {
    // State
    user,
    userProfile,
    loading,
    authError,
    isAuthenticated,
    role,
    isGamer,
    isOrganizer,
    isAdmin,

    // Actions
    login,
    register,
    logout,
    staffLogin,
    fetchUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
