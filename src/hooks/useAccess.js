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

  useEffect(() => {
    setLoading(true)
    fetchAccess()
  }, [lesson?.id, user?.id])

  const canWatch = lesson?.is_free || hasAccessRecord

  return { canWatch, loading, refetch: fetchAccess }
}
