// src/context/AuthContext.jsx
// Single source of truth for authentication state.
// Supports: email/password, Google OAuth, and Telegram Mini App auto-login.

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
  }

  useEffect(() => {
    // 1. Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfile(session.user.id).finally(() => setLoading(false))
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Standard auth ──────────────────────────────────────────────
  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (data?.user) {
      // Immediately save the full name to the profile
      if (fullName) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      }
      // Need a bit of delay since trigger handles profile creation
      setTimeout(() => processReferral(), 2000)
    }
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // ── Telegram Mini App auto-login ───────────────────────────────
  // Strategy: try signIn → if fails (new user) → signUp
  // Email format: tg_{telegram_id}@tgapp.io
  // Password: tg_{telegram_id}_tma (deterministic, never shown to user)
  const signInWithTelegram = async (tgUser) => {
    if (!tgUser?.id) return { error: 'No Telegram user' }

    const email    = `tg_${tgUser.id}@tgapp.io`
    const password = `tg_${tgUser.id}_tma_secret`
    const fullName = [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ') || tgUser.username || 'Telegram User'

    // 1. Try to sign in (existing user — no email confirmation needed)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email, password,
    })

    if (!signInError && signInData?.user) {
      // Set flag for future auto-logins
      localStorage.setItem('bma_tg_autologin', 'true')
      
      // Update profile with latest Telegram data
      await supabase.from('profiles').upsert({
        id:         signInData.user.id,
        full_name:  fullName,
        avatar_url: tgUser.photoUrl || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      return { data: signInData, error: null }
    }

    // 2. New user — sign up
    // Note: Supabase email confirmation must be DISABLED for this to work.
    // Go to: Supabase → Authentication → Settings → disable "Enable email confirmations"
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: null,
        data: {
          full_name:   fullName,
          avatar_url:  tgUser.photoUrl  || null,
          telegram_id: String(tgUser.id),
          username:    tgUser.username  || '',
        },
      },
    })

    if (signUpError) return { data: null, error: signUpError }

    // After signup, sign in immediately (bypass email confirmation)
    const { data: finalData, error: finalError } = await supabase.auth.signInWithPassword({
      email, password,
    })

    if (finalData?.user) {
      localStorage.setItem('bma_tg_autologin', 'true')
      await processReferral()
    }

    return { data: finalData, error: finalError }
  }

  // Helper to process referral code
  const processReferral = async () => {
    try {
      let refCode = new URLSearchParams(window.location.search).get('ref')
      if (!refCode) {
        const tgParam = window?.Telegram?.WebApp?.initDataUnsafe?.start_param
        if (tgParam && tgParam.startsWith('ref_')) {
          refCode = tgParam.replace('ref_', '')
        }
      }
      
      // Basic UUID validation before calling RPC
      if (refCode && refCode.length === 36) {
        const { error } = await supabase.rpc('handle_referral', { p_referred_by_id: refCode })
        if (error) console.error("Referral error:", error)
      }
    } catch (err) {
      console.error("Referral processing error:", err)
    }
  }

  const value = {
    user, session, loading, profile, setProfile,
    isAdmin: profile?.role === 'admin',
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
