import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { apiCall } from '@/api/heruClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)            // Supabase auth user
  const [userProfile, setUserProfile] = useState(null) // user_profiles row
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // -------------------------------------------------------------------
  // Fetch the user_profiles row for the authenticated user
  // -------------------------------------------------------------------
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUserProfile(null)
      return null
    }
    try {
      const profile = await apiCall(`/auth/me`)
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
   * Register a new user.
   * @param {string} email
   * @param {string} password
   * @param {'gamer'|'organizer'} role
   * @param {object} profileData - extra fields for gamer_profiles / organizer_profiles
   */
  const register = async (email, password, role = 'gamer', profileData = {}) => {
    setAuthError(null)

    // 1. Create the Supabase Auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: profileData.full_name || '' },
      },
    })

    if (error) {
      setAuthError(error.message)
      throw error
    }

    // 2. Create user_profiles + role-specific profile via backend
    //    The backend will use the service-role key so RLS is bypassed.
    try {
      await apiCall('/auth/register-profile', {
        method: 'POST',
        body: { role, ...profileData },
      })
    } catch (profileErr) {
      console.error('Profile creation failed:', profileErr)
      // Auth user was still created; profile can be retried later
    }

    setUser(data.user)
    const profile = await fetchUserProfile(data.user)
    return { user: data.user, profile }
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
   * Staff login — validates email + access key via backend,
   * stores the returned staff session token locally.
   * Returns { staffSession, profile }.
   */
  const staffLogin = async (email, accessKey) => {
    setAuthError(null)
    try {
      const result = await apiCall('/auth/staff/login', {
        method: 'POST',
        body: { email, access_key: accessKey },
      })

      // Store staff session token
      localStorage.setItem('heru_staff_token', result.session_token)
      localStorage.setItem('heru_staff_expires', result.expires_at)

      // If the staff member also has a Supabase session, fetch profile
      if (result.user) {
        setUser(result.user)
        setUserProfile(result.profile || null)
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
