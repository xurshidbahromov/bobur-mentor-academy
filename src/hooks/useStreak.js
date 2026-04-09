// src/hooks/useStreak.js
// Streak + Coin claim logic
// -- On mount: updates streak (if new day) and checks claim availability
// -- Returns streak data and claimDailyReward() function

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function useStreak() {
  const { user, profile, setProfile } = useAuth()
  const [loading, setLoading]       = useState(true)
  const [claiming, setClaiming]     = useState(false)
  const [canClaim, setCanClaim]     = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)

  // ── Fetch profile ─────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    // It's fetched by AuthContext, so we just run checkStreak if profile is there
    if (profile) {
      // Small delay or check to ensure we only check once
      checkStreak(profile)
    }
    setLoading(false)
  }, [user, profile])

  // ── Streak logic ──────────────────────────────────────────────
  const checkStreak = async (p) => {
    const today    = new Date().toISOString().split('T')[0]   // "2025-04-05"
    const lastVisit = p.last_visit_date
    const lastClaim = p.last_claimed_date

    // Can claim if not yet claimed today
    setCanClaim(lastClaim !== today)

    if (lastVisit === today) return  // already updated today

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]

    let newStreak = lastVisit === yStr
      ? (p.streak_count || 0) + 1   // consecutive day
      : 1                            // streak broken

    const newLongest = Math.max(newStreak, p.longest_streak || 0)

    const { data } = await supabase
      .from('profiles')
      .update({
        streak_count: newStreak,
        longest_streak: newLongest,
        last_visit_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', p.id)
      .select()
      .single()

    if (data) setProfile(data)
  }

  // ── Claim daily reward ────────────────────────────────────────
  const claimDailyReward = async () => {
    if (!user || !canClaim || claiming) return
    setClaiming(true)
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('profiles')
      .update({
        coins: (profile?.coins || 0) + 1,
        last_claimed_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (data) {
      setProfile(data)
      setCanClaim(false)
      setJustClaimed(true)
      setTimeout(() => setJustClaimed(false), 3000)
    }
    setClaiming(false)
  }

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return {
    profile,
    loading,
    canClaim,
    claiming,
    justClaimed,
    claimDailyReward,
    refetch: fetchProfile,
  }
}
