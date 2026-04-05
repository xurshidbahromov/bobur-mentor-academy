// src/hooks/useLessons.js
// Fetches published lessons from Supabase
// Only returns is_published = true lessons — spec requirement

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useLessons — fetches all published lessons for a course, ordered by order_index
 * @param {string} courseId
 */
export function useLessons(courseId) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courseId) return
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('order_index', { ascending: true })

      if (error) setError(error.message)
      else setLessons(data || [])
      setLoading(false)
    }
    fetch()
  }, [courseId])

  return { lessons, loading, error }
}

/**
 * useLesson — fetches a single published lesson by ID
 * @param {string} lessonId
 */
export function useLesson(lessonId) {
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!lessonId) return
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .eq('is_published', true)
        .maybeSingle()

      if (error) setError(error.message)
      else setLesson(data)
      setLoading(false)
    }
    fetch()
  }, [lessonId])

  return { lesson, loading, error }
}

/**
 * useQuizzes — fetches quiz questions for a lesson, ordered by order_index
 * Only called when canWatch = true (quiz is hidden for locked lessons)
 * @param {string} lessonId
 */
export function useQuizzes(lessonId) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lessonId) return
    const fetch = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true })

      setQuizzes(data || [])
      setLoading(false)
    }
    fetch()
  }, [lessonId])

  return { quizzes, loading }
}
