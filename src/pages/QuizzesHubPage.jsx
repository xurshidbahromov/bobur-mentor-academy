import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Play, BookOpen, Lock, Sparkles, Brain, Lightbulb } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

// ── Animation Variants ───────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
})

// ── Skeleton components ──────────────────────────────────────
function SkeletonBlock({ height = 20, width = '100%', radius = 12, mb = 0, bg = 'rgba(0,0,0,0.06)' }) {
  return <div className="skeleton-loader" style={{ height, width, borderRadius: radius, marginBottom: mb, background: bg }} />
}

function HubSkeleton() {
  return (
    <>
      <div className="hub-hero" style={{ paddingBottom: 160 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', width: '100%', padding: '0 24px' }}>
          <SkeletonBlock height={40} width="60%" radius={12} mb={16} bg="rgba(255,255,255,0.1)" />
          <SkeletonBlock height={20} width="80%" radius={8} mb={8} bg="rgba(255,255,255,0.05)" />
          <SkeletonBlock height={20} width="70%" radius={8} mb={32} bg="rgba(255,255,255,0.05)" />
          <SkeletonBlock height={50} width={180} radius={100} bg="rgba(255,255,255,0.15)" />
        </div>
      </div>
      <div className="hub-container">
        <div className="hub-content">
          <SkeletonBlock height={30} width={240} radius={8} mb={24} />
          <div className="lessons-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <SkeletonBlock key={i} height={80} radius={24} bg="rgba(255,255,255,0.8)" />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
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
    <>
      <style>{`
        .hub-page-wrapper { width: 100%; padding-bottom: 60px; }
        .hub-container { max-width: 1040px; margin: 0 auto; }
        
        .hub-hero {
          background: linear-gradient(145deg, #0F172A 0%, #134E4A 50%, #064E3B 100%);
          position: relative;
          overflow: hidden;
          padding: 60px 0 200px;
          border-radius: 0 0 40px 40px;
          margin-bottom: -130px;
          box-shadow: 0 20px 50px rgba(4,78,59,0.15);
        }
        
        @media (max-width: 768px) {
          .hub-hero {
            padding: 40px 0 200px;
            border-radius: 0 0 32px 32px;
            margin-bottom: -130px;
          }
        }

        .hub-hero-title {
          margin: 0 0 16px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1.05;
          font-size: clamp(2.5rem, 7vw, 3.5rem);
        }

        .hub-content { padding: 0 24px; position: relative; zIndex: 2; }
        @media (max-width: 768px) { .hub-content { padding: 0 16px; } }

        .lessons-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .lessons-grid {
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            align-items: stretch;
          }
        }
      `}</style>

      <div className="hub-page-wrapper">
        {loading ? (
          <HubSkeleton />
        ) : (
          <>
            {/* ── FULL WIDTH HERO ── */}
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hub-hero"
            >
              {/* Ambient Glows */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Decorative floating icons */}
              {[
                { top: '15%', right: '12%', size: 48, delay: 0 },
                { top: '55%', right: '25%', size: 28, delay: 0.4 },
                { top: '35%', left: '8%', size: 36, delay: 0.2 },
                { bottom: '25%', left: '20%', size: 22, delay: 0.6 },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -12, 0], rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5 + i * 0.5, delay: c.delay, ease: 'easeInOut' }}
                  style={{ position: 'absolute', opacity: 0.1, pointerEvents: 'none', ...c }}
                >
                  <Brain size={c.size} color="white" strokeWidth={1.5} />
                </motion.div>
              ))}

              <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 800 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Lightbulb size={14} color="#A78BFA" />
                      <span style={{ color: '#DDD6FE', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tafakkur maydoni</span>
                    </div>
                  </div>

                  <h1 className="outfit-font hub-hero-title">
                    Umumiy Test
                  </h1>
                  
                  <p style={{ margin: '0 0 32px', fontSize: '1.05rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, maxWidth: 500, fontWeight: 500 }}>
                    Aralash mavzulardagi barcha savollar bazasi. Har safar kutilmagan tushunchalardan random chiqadi. Miya faoliyatingizni to'liq ishga soling!
                  </p>
                  
                  <motion.button
                    whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/quiz/general')}
                    style={{
                      background: 'white', color: '#1E1B4B', border: 'none', padding: '16px 36px',
                      borderRadius: 100, fontWeight: 800, fontSize: '1.0625rem', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: 'inherit',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Target size={20} strokeWidth={2.5} /> Boshlash
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* ── 1040px CONSTRAINED CONTENT ── */}
            <div className="hub-container">
              <div className="hub-content">
              {courses.length > 0 ? (
                <>
                  <motion.div {...fadeUp(0.1)} style={{ maxWidth: 1040, margin: '0 auto' }}>
                    <h2 className="outfit-font" style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 900, color: 'white', display: 'flex', alignItems: 'center', gap: 12 }}>
                      Mavzulashtirilgan Testlar
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                      {courses.map((course, ci) => (
                        <div key={course.id}>
                          {/* Course title badge */}
                          <motion.div {...fadeUp(0.15 + ci * 0.1)} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ci === 0 ? '#34D399' : '#10B981', flexShrink: 0, boxShadow: ci === 0 ? '0 0 12px rgba(52,211,153,0.5)' : '0 0 12px rgba(16,185,129,0.5)' }} />
                            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: ci === 0 ? 'rgba(255,255,255,0.95)' : '#1E293B' }}>
                              {course.title}
                            </h3>
                          </motion.div>

                          {/* Lessons Grid (Glass cards) */}
                          <div className="lessons-grid">
                            {lessonsWithQuizzes[course.id].map((lesson, li) => {
                              const canAccess = lesson.is_free || unlockedLessonIds.has(lesson.id)

                              return (
                                <motion.div
                                  key={lesson.id}
                                  {...fadeUp(0.2 + (li * 0.05))}
                                  whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(15,23,42,0.08)' }}
                                  whileTap={canAccess ? { scale: 0.98 } : { scale: 0.99 }}
                                  onClick={() => {
                                    if (!canAccess) {
                                      toast.info('Dars qulflangan', { description: 'Bu testni ishlash uchun avval Kurslar bo\'limidan darsni qulfdan chiqaring.' })
                                      return
                                    }
                                    navigate(`/quiz/${lesson.id}`)
                                  }}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.65)', // Glassmorphism
                                    backdropFilter: 'blur(32px) saturate(2)',
                                    WebkitBackdropFilter: 'blur(32px) saturate(2)',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                    padding: '24px',
                                    borderRadius: 32,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 8px 32px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,1)',
                                    cursor: canAccess ? 'pointer' : 'not-allowed',
                                    opacity: canAccess ? 1 : 0.75, // Slightly dim if locked
                                    WebkitTapHighlightColor: 'transparent',
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                      <div style={{
                                        background: canAccess ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' : '#F1F5F9',
                                        width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: canAccess ? '#3461FF' : '#64748B',
                                      }}>
                                        {canAccess ? <BookOpen size={20} /> : <Lock size={20} />}
                                      </div>
                                      
                                      <span style={{ background: canAccess ? 'white' : '#F8FAFC', padding: '4px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, color: canAccess ? '#10B981' : '#94A3B8', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                        {lesson.quizCount} savol
                                      </span>
                                    </div>
                                    <h4 style={{
                                      margin: '0', fontSize: '1.0625rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4
                                    }}>
                                      {lesson.title}
                                    </h4>
                                  </div>

                                  <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(15,23,42,0.06)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>
                                        {canAccess ? "Boshlashga tayyor" : "Qulflangan"}
                                      </span>
                                      <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: canAccess ? '#3461FF' : '#E2E8F0', color: canAccess ? 'white' : '#94A3B8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: canAccess ? '0 4px 12px rgba(52,97,255,0.3)' : 'none'
                                      }}>
                                        {canAccess ? <Play size={14} fill="currentColor" style={{ marginLeft: 2 }} /> : <Lock size={14} />}
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              ) : (
                /* Empty state */
                <motion.div {...fadeUp()} style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(32px)', borderRadius: 32, textAlign: 'center', border: '1px solid white', boxShadow: '0 8px 32px rgba(15,23,42,0.05)' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: '#EFF6FF', color: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <BookOpen size={28} />
                  </div>
                  <h3 className="outfit-font" style={{ margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>Testlar tayyorlanmoqda</h3>
                  <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>Hozircha darslarga bog'langan testlar yaratilmagan.</p>
                </motion.div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  </>
  )
}
