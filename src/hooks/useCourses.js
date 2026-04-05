// src/hooks/useCourses.js
// Fetches published courses from Supabase
// Only returns is_published = true courses — spec requirement

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useCourses — fetches all published courses
 * @returns {{ courses: array, loading: boolean, error: string|null }}
 */
export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })

      if (error) setError(error.message)
      else setCourses(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { courses, loading, error }
}

/**
 * useCourse — fetches a single published course by ID
 * @param {string} courseId
 */
export function useCourse(courseId) {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courseId) return
    const fetch = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('is_published', true)
        .maybeSingle()

      if (error) setError(error.message)
      else setCourse(data)
      setLoading(false)
    }
    fetch()
  }, [courseId])

  return { course, loading, error }
}
