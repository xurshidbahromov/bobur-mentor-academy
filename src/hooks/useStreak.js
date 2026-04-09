// src/hooks/useStreak.js
// Streak + Coin claim logic
// -- On mount: updates streak (if new day) and checks claim availability
// -- Uses global profile from AuthContext to keep coin count in sync across app

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

export function useStreak() {
  const { user, profile, setProfile } = useAuth()
  const [claiming, setClaiming]       = useState(false)
  const [canClaim, setCanClaim]       = useState(false)
  const [justClaimed, setJustClaimed] = useState(false)
  const checkedRef = useRef(false) // prevent multiple streak checks per session

  // ── Check & update streak once on mount ───────────────────────
  useEffect(() => {
    if (!user || !profile || checkedRef.current) return
    checkedRef.current = true

    const today     = new Date().toISOString().split('T')[0]
    const lastClaim = profile.last_claimed_date
    const lastVisit = profile.last_visit_date

    // 1. Update canClaim
    setCanClaim(lastClaim !== today)

    // 2. Update streak if new day
    if (lastVisit === today) return // already visited today

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().split('T')[0]

    const newStreak  = lastVisit === yStr ? (profile.streak_count || 0) + 1 : 1
    const newLongest = Math.max(newStreak, profile.longest_streak || 0)

    supabase
      .from('profiles')
      .update({
        streak_count:    newStreak,
        longest_streak:  newLongest,
        last_visit_date: today,
        updated_at:      new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user, profile])

  // Reset checkedRef if user changes
  useEffect(() => { checkedRef.current = false }, [user])

  // ── Claim daily reward ────────────────────────────────────────
  const claimDailyReward = async () => {
    if (!user || !canClaim || claiming) return
    setClaiming(true)
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('profiles')
      .update({
        coins:             (profile?.coins || 0) + 1,
        last_claimed_date: today,
        updated_at:        new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (data) {
      setProfile(data)   // <-- updates AuthContext.profile → Navbar coin re-renders instantly
      setCanClaim(false)
      setJustClaimed(true)

      // 🎉 Gamification!
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3461FF']
      })
      
      toast.success("Muborak bo'lsin!", {
        description: "+1 Coin balansingizga qo'shildi! ✨",
        duration: 4000
      })

      setTimeout(() => setJustClaimed(false), 3000)
    } else {
      toast.error("Xatolik yuz berdi", {
        description: "Coinni olishda muammo paydo bo'ldi. Qaytadan urinib ko'ring."
      })
    }
    setClaiming(false)
  }

  return {
    profile,       // same as useAuth().profile (global, always fresh)
    loading: !profile && !!user,
    canClaim,
    claiming,
    justClaimed,
    claimDailyReward,
  }
}
