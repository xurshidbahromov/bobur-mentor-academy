import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Play, BookOpen, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

// ── Shimmer skeleton block ─────────────────────────────
function SkeletonBlock({ height = 20, width = '100%', radius = 12, mb = 0 }) {
  return <div className="skeleton-loader" style={{ height, width, borderRadius: radius, marginBottom: mb }} />
}

// ── Full page skeleton ─────────────────────────────────
function HubSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero skeleton */}
      <SkeletonBlock height={200} radius={28} />

      {/* Section title */}
      <SkeletonBlock height={28} width={220} radius={10} />

      {/* Lesson card skeletons in auto grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <SkeletonBlock key={i} height={70} radius={20} />
        ))}
      </div>
    </div>
  )
}

export default function QuizzesHubPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [lessonsWithQuizzes, setLessonsWithQuizzes] = useState({})
  const [loading, setLoading] = useState(true)
  const [unlockedLessonIds, setUnlockedLessonIds] = useState(new Set())

  useEffect(() => {
    async function fetchMap() {
      const { data: cData } = await supabase
        .from('courses').select('id, title').eq('is_published', true).order('created_at', { ascending: false })
      const { data: lData } = await supabase
        .from('lessons').select('id, course_id, title, is_free').eq('is_published', true).order('order_index', { ascending: true })
      const { data: qData } = await supabase
        .from('quizzes').select('id, lesson_id').not('lesson_id', 'is', null)

      let unlockedSet = new Set()
      if (user) {
        const { data: accessData } = await supabase.from('user_access').select('lesson_id').eq('user_id', user.id)
        if (accessData) unlockedSet = new Set(accessData.map(a => a.lesson_id))
      }

      const map = {}
      if (lData && qData) {
        lData.forEach(l => {
          const count = qData.filter(q => q.lesson_id === l.id).length
          if (count > 0) {
            if (!map[l.course_id]) map[l.course_id] = []
            map[l.course_id].push({ ...l, quizCount: count })
          }
        })
      }

      setUnlockedLessonIds(unlockedSet)
      setCourses((cData || []).filter(c => map[c.id] && map[c.id].length > 0))
      setLessonsWithQuizzes(map)
      setLoading(false)
    }
    fetchMap()
  }, [user])

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 110px' }}>

      {loading ? (
        <HubSkeleton />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* ── Hero: Umumiy Test ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: 28, padding: '28px 32px',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(16, 185, 129, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
            }}
          >
            {/* Decorative icon */}
            <div style={{ position: 'absolute', top: -20, right: 24, opacity: 0.12, color: 'white', pointerEvents: 'none' }}>
              <Target size={160} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <h1 className="outfit-font" style={{ margin: '0 0 10px', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
                Umumiy Test
              </h1>
              <p style={{ margin: '0 0 24px', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, maxWidth: 460 }}>
                Aralash mavzulardagi barcha savollar bazasi. Har safar qirqilmagan yerdan random chiqadi. O'zingizni sinab ko'ring!
              </p>
              <button
                onClick={() => navigate('/quiz/general')}
                style={{
                  background: 'white', color: '#059669', border: 'none', padding: '13px 28px',
                  borderRadius: 100, fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Play size={18} fill="currentColor" /> Boshlash
              </button>
            </div>
          </motion.div>

          {/* ── Mavzulashtirilgan Testlar ── */}
          {courses.length > 0 && (
            <div>
              <h2 className="outfit-font" style={{ margin: '0 0 24px', fontSize: '1.375rem', fontWeight: 800, color: '#0F172A' }}>
                Mavzulashtirilgan Testlar
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {courses.map((course, ci) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.08 }}
                  >
                    {/* Course title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3461FF', flexShrink: 0 }} />
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>
                        {course.title}
                      </h3>
                    </div>

                    {/* Lesson cards — auto-fill grid: 1 col on mobile, 2+ on desktop */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: 12,
                    }}>
                      {lessonsWithQuizzes[course.id].map(lesson => {
                        const canAccess = lesson.is_free || unlockedLessonIds.has(lesson.id)

                        return (
                        <motion.div
                          key={lesson.id}
                          whileTap={canAccess ? { scale: 0.97 } : { scale: 0.99 }}
                          onClick={() => {
                            if (!canAccess) {
                              toast.info('Dars qulflangan', { description: 'Bu testni ishlash uchun avval Kurslar bo\'limidan darsni qulfdan chiqaring.' })
                              return
                            }
                            navigate(`/quiz/${lesson.id}`)
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.78)',
                            padding: '16px 20px',
                            borderRadius: 20,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 8px 32px rgba(15,23,42,0.05)',
                            border: '1px solid var(--border-medium)',
                            cursor: canAccess ? 'pointer' : 'not-allowed',
                            opacity: canAccess ? 1 : 0.65,
                            WebkitTapHighlightColor: 'transparent',
                            backdropFilter: 'blur(24px) saturate(2)',
                            WebkitBackdropFilter: 'blur(24px) saturate(2)',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                            <h4 style={{
                              margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {lesson.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <BookOpen size={12} /> {lesson.quizCount} ta savol
                            </p>
                          </div>
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                            background: canAccess ? 'rgba(52,97,255,0.08)' : 'rgba(100,116,139,0.08)', 
                            color: canAccess ? '#3461FF' : '#64748B',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {canAccess ? <Play size={16} fill="currentColor" style={{ marginLeft: 2 }} /> : <Lock size={16} />}
                          </div>
                        </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {courses.length === 0 && (
            <div style={{ padding: 40, background: 'white', borderRadius: 24, textAlign: 'center', color: '#64748B', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
              Hozircha darslarga bog'langan testlar yaratilmagan.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
