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
  const checkedRef = useRef(false)

  // 1. Automatic Streak Management on mount (Visit)
  useEffect(() => {
    if (!user || !profile || checkedRef.current) return
    checkedRef.current = true

    const today = getUzDate()
    const yesterday = getUzDate(-1)
    const lastVisit = profile.last_visit_date || ''
    const lastClaim = profile.last_claimed_date || ''

    // A. Visual Claim Availability
    setCanClaim(lastClaim !== today)

    // B. Automatic Streak Update
    if (lastVisit === today) return // Already visited today, no changes needed

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
  }, [user, profile])

  useEffect(() => { checkedRef.current = false }, [user])

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
