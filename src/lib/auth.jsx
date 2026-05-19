import { createContext, useContext, useEffect, useState } from 'react'
import {
  supabase,
  isSupabaseConfigured,
  getSession,
  onAuthChange,
  signInWithGoogle as sbSignInGoogle,
  signInWithMagicLink as sbSignInMagic,
  signOut as sbSignOut,
  getProfile
} from './supabase'

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  configured: false,
  signInWithGoogle: async () => {},
  signInWithMagicLink: async () => ({ error: new Error('Auth not configured') }),
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const configured = isSupabaseConfigured()

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    let sub = null
    let mounted = true

    getSession()?.then(({ data }) => {
      if (!mounted) return
      setUser(data?.session?.user || null)
      setLoading(false)
    })

    const result = onAuthChange((u) => {
      if (!mounted) return
      setUser(u)
    })
    sub = result?.data?.subscription

    return () => {
      mounted = false
      sub?.unsubscribe?.()
    }
  }, [configured])

  // Pull profile row when user changes.
  useEffect(() => {
    if (!configured || !user) {
      setProfile(null)
      return
    }
    let cancelled = false
    getProfile(user.id)?.then(({ data }) => {
      if (!cancelled) setProfile(data || null)
    })
    return () => { cancelled = true }
  }, [user, configured])

  const refreshProfile = async () => {
    if (!configured || !user) return
    const { data } = (await getProfile(user.id)) || {}
    setProfile(data || null)
  }

  const value = {
    user,
    profile,
    loading,
    configured,
    refreshProfile,
    signInWithGoogle: () => sbSignInGoogle(),
    signInWithMagicLink: (email) => sbSignInMagic(email),
    signOut: () => sbSignOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
