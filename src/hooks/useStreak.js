// src/hooks/useStreak.js
// Streak + Coin claim logic (UTC+5 Uzbekistan Time)
// -- On mount: checks and visually resets streak if missed yesterday
// -- Uses global profile from AuthContext to keep data in sync
// -- Strictly tied to Reward Claiming

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

/**
 * Helper to get Uzbekistan (UTC+5) date string YYYY-MM-DD
 */
export const getUzDate = (offsetDays = 0) => {
  const now = new Date()
  // Add 5 hours for UTC+5, then offsetDays
  const uzDate = new Date(now.getTime() + (5 * 60 * 60 * 1000) + (offsetDays * 24 * 60 * 60 * 1000))
  return uzDate.toISOString().split('T')[0]
}

export function useStreak() {
  const { user, profile, setProfile } = useAuth()
  const [claiming, setClaiming]       = useState(false)
  const [canClaim, setCanClaim]       = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  
  // Track which userId we've already processed streak for (not just mounted)
  const streakCheckedForRef = useRef(null) // stores userId that was processed

  // 1. Automatic Streak Management on mount (Visit)
  useEffect(() => {
    // Must have both user and profile loaded
    if (!user || !profile) return
    // Only run once per user session (not per render)
    if (streakCheckedForRef.current === user.id) return
    streakCheckedForRef.current = user.id

    const today = getUzDate()
    const yesterday = getUzDate(-1)
    const lastVisit = profile.last_visit_date || ''
    const lastClaim = profile.last_claimed_date || ''

    // A. Visual Claim Availability
    setCanClaim(lastClaim !== today)

    // B. Automatic Streak Update — skip if already visited today
    if (lastVisit === today) return

    const isConsecutive = lastVisit === yesterday
    const newStreak = isConsecutive ? (profile.streak_count || 0) + 1 : 1
    const newLongest = Math.max(newStreak, profile.longest_streak || 0)

    // Sync visit and streak to DB
    supabase
      .from('profiles')
      .update({
        streak_count: newStreak,
        longest_streak: newLongest,
        last_visit_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
      .then(({ data }) => {
        if (data && setProfile) setProfile(data)
      })
  }, [user?.id, profile?.id]) // Depend on IDs only — avoids re-running on every profile field update

  // Reset when user logs out
  useEffect(() => {
    if (!user) streakCheckedForRef.current = null
  }, [user])

  // 2. Manual Claim Function (Coins only)
  const claimDailyReward = async () => {
    if (!user || !profile || claiming) return
    
    const today = getUzDate()
    if (profile.last_claimed_date === today) {
      toast.error("Bugun allaqachon mukofot olgansiz!")
      setCanClaim(false)
      return
    }

    setClaiming(true)
    const newCoins = (profile.coins || 0) + 1

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          coins: newCoins,
          last_claimed_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        if (setProfile) setProfile(data)
        setCanClaim(false)
        setJustClaimed(true)

        // Visual FX
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#3461FF']
        })

        toast.success("Muborak bo'lsin! 🎁", {
          description: "1 ta Coin balansingizga qo'shildi!",
          duration: 4000
        })

        setTimeout(() => setJustClaimed(false), 3000)
      }
    } catch (err) {
      console.error("Claim Reward Error:", err)
      toast.error("Xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setClaiming(false)
    }
  }

  return {
    canClaim,
    claiming,
    justClaimed,
    claimDailyReward,
    streak: profile?.streak_count || 0,
    coins: profile?.coins || 0
  }
}
