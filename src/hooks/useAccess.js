// src/hooks/useAccess.js
// Checks whether the current user can watch a specific lesson.
// Encapsulates the access decision logic defined in the architecture spec.

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

/**
 * useAccess — determines if the current user can watch a lesson
 *
 * Access rules:
 *   1. lesson.is_free === true  →  canWatch = true (no auth needed)
 *   2. user is logged in AND has a user_access row  →  canWatch = true
 *   3. Otherwise  →  canWatch = false
 *
 * @param {object} lesson - lesson object (must include is_free and id)
 * @returns {{ canWatch: boolean, loading: boolean, refetch: function }}
 */
export function useAccess(lesson) {
  const { user } = useAuth()
  const [hasAccessRecord, setHasAccessRecord] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAccess = async () => {
    if (!lesson) { setLoading(false); return }

    // Free lessons — no DB check needed
    if (lesson.is_free) {
      setHasAccessRecord(false)   // irrelevant, but reset
      setLoading(false)
      return
    }

    // Not logged in — can't have access
    if (!user) {
      setHasAccessRecord(false)
      setLoading(false)
      return
    }

    // Check user_access table
    const { data } = await supabase
      .from('user_access')
      .select('id')
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .maybeSingle()

    setHasAccessRecord(!!data)
    setLoading(false)
  }

  const unlockWithCoins = async () => {
    if (!user || !lesson) return { success: false, error: 'User or lesson missing' }
    
    // Call RPC to securely deduct coins and grant access
    const { data, error } = await supabase.rpc('unlock_lesson_with_coins', {
      p_lesson_id: lesson.id
    })

    if (error) {
      console.error('Unlock error:', error)
      return { success: false, error: error.message }
    }

    // Success! Refresh local access state
    setHasAccessRecord(true)
    return { success: true }
  }

  useEffect(() => {
    setLoading(true)
    fetchAccess()
  }, [lesson?.id, user?.id])

  const canWatch = lesson?.is_free || hasAccessRecord

  return { canWatch, loading, refetch: fetchAccess, unlockWithCoins }
}
