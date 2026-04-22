// src/hooks/useLessons.js
// Fetches published lessons from Supabase
// Only returns is_published = true lessons — spec requirement

import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'

/**
 * useLessons — fetches all published lessons for a course, ordered by order_index
 * @param {string} courseId
 */
export function useLessons(courseId) {
  const { data: lessons = [], isLoading: loading, error } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!courseId
  })

  return { lessons, loading, error: error?.message }
}

/**
 * useLesson — fetches a single published lesson by ID
 * @param {string} lessonId
 */
export function useLesson(lessonId) {
  const { data: lesson = null, isLoading: loading, error } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('is_published', true)
        .maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!lessonId
  })

  return { lesson, loading, error: error?.message }
}

/**
 * useQuizzes — fetches quiz questions for a lesson, ordered by order_index
 * Only called when canWatch = true (quiz is hidden for locked lessons)
 * @param {string} lessonId
 */
export function useQuizzes(lessonId) {
  const { data: quizzes = [], isLoading: loading } = useQuery({
    queryKey: ['quizzes', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!lessonId
  })

  return { quizzes, loading }
}
