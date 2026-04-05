// src/context/AuthContext.jsx
// Single source of truth for authentication state.
// Supports: email/password, Google OAuth, and Telegram Mini App auto-login.

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Standard auth ──────────────────────────────────────────────
  const signUp = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/courses` },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // ── Telegram Mini App auto-login ───────────────────────────────
  // Uses synthetic email pattern: tg_{id}@tg.local
  // User never sees a login form inside Telegram.
  const signInWithTelegram = async (tgUser) => {
    if (!tgUser?.id) return { error: 'No Telegram user' }

    const email    = `tg_${tgUser.id}@tg.local`
    const password = `tg_${tgUser.id}_secure`
    const fullName = [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ')

    // Try sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email, password,
    })

    if (!signInError) {
      // Already registered — update profile name if missing
      if (fullName) {
        await supabase.from('profiles').update({
          full_name:  fullName,
          avatar_url: tgUser.photoUrl || null,
          updated_at: new Date().toISOString(),
        }).eq('id', signInData.user.id).is('full_name', null)
      }
      return { data: signInData, error: null }
    }

    // First time — sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name:  fullName,
          avatar_url: tgUser.photoUrl || null,
          telegram_id: tgUser.id,
        },
      },
    })

    return { data: signUpData, error: signUpError }
  }

  const value = {
    user, session, loading,
    signIn, signUp, signOut,
    signInWithGoogle, signInWithTelegram,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}
