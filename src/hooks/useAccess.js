// src/hooks/useAccess.js
// Checks whether the current user can watch a specific lesson.
// Encapsulates the access decision logic defined in the architecture spec.

import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
  const queryClient = useQueryClient()

  const { data: hasAccessRecord = false, isLoading: loading, refetch } = useQuery({
    queryKey: ['access', lesson?.id, user?.id],
    queryFn: async () => {
      if (!lesson || !user || lesson.is_free) return false

      const { data } = await supabase
        .from('user_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle()

      return !!data
    },
    enabled: !!lesson && !!user && !lesson.is_free,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })

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

    // Success! Invalidate access query to trigger refetch
    queryClient.invalidateQueries({ queryKey: ['access', lesson.id, user.id] })
    return { success: true }
  }

  const canWatch = lesson?.is_free || hasAccessRecord

  return { canWatch, loading, refetch, unlockWithCoins }
}
