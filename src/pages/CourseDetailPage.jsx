import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Lock, Coins, MessageCircle, Info, BookOpen } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/lesson/CommentSection'

// ── Lesson Row Component ─────────────────────────────────────
function LessonCard({ lesson, isUnlocked, onNavigate }) {
  // Haqiqatdan ochilganmi yo'qmi (bazadan) tekshiramiz
  const canAccess = lesson.is_free || isUnlocked

  // Narxni xavfsiz ifodalash uchun (qulflangan bo'lsa)
  const price = lesson.coin_price ?? lesson.price ?? 5

  const handleClick = () => {
    // Hammasi bo'lib bitta joyda navigate qiladi.
    // Qulflangan bo'lsa ham ichkariga (`LessonDetailPage`ga) kirishi kerak, 
    // u yerdagi yangi LockScreen qolganini eplaydi!
    onNavigate(`/lessons/${lesson.id}`)
  }

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', maxWidth: '100%', padding: '16px', borderRadius: 20,
        background: 'white',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        cursor: 'pointer', transition: 'all 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative'
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.03)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
      }}>
        {canAccess ? <Play size={18} color="#3461FF" fill="#3461FF" /> : <Lock size={18} color="#94A3B8" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="outfit-font" style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0F172A', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.4, letterSpacing: '-0.01em' }}>
          {lesson.order_index}. {lesson.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {lesson.is_free ? (
            <span style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bepul</span>
          ) : canAccess ? (
            <span style={{ fontSize: '0.6875rem', color: '#3461FF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Davom etish</span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>Premium dars</span>
          )}
        </div>
      </div>
      {!canAccess && (
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          color: '#475569', fontWeight: 700, fontSize: '0.875rem',
        }}>
          {price} <Coins size={14} fill="#F59E0B" color="#F59E0B" />
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth() // AuthContext dan user obyektini olamiz

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('videos') // 'videos' | 'comments'
  const [unlockedLessonIds, setUnlockedLessonIds] = useState(new Set()) // Bazadagi ruxsatlar

  useEffect(() => {
    async function loadData() {
      const promises = [
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).eq('is_published', true).order('order_index')
      ]

      if (user) {
        // User qaysi darslarni sotib olganini tortamiz
        promises.push(
          supabase.from('user_access').select('lesson_id').eq('user_id', user.id)
        )
      }

      const results = await Promise.all(promises)
      const courseRes = results[0]
      const lessonsRes = results[1]
      const accessRes = user ? results[2] : null

      if (courseRes.data) setCourse(courseRes.data)
      if (lessonsRes.data) setLessons(lessonsRes.data)
      if (accessRes && accessRes.data) {
        setUnlockedLessonIds(new Set(accessRes.data.map(d => d.lesson_id)))
      }

      setLoading(false)
    }
    loadData()
  }, [courseId, user])

  if (loading) {
    return (
      <div style={{ padding: '20px 24px 80px', maxWidth: 1040, margin: '0 auto' }}>
        {/* Back button skeleton */}
        <div className="skeleton-loader" style={{ height: 36, width: 120, borderRadius: 100, marginBottom: 32 }} />
        {/* Hero banner skeleton */}
        <div className="skeleton-loader" style={{ height: 240, borderRadius: 28, marginBottom: 32 }} />
        {/* Lessons list skeleton */}
        <div className="skeleton-loader" style={{ height: 24, width: 180, borderRadius: 8, marginBottom: 20 }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-loader" style={{ height: 72, borderRadius: 20, marginBottom: 12 }} />
        ))}
      </div>
    )
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>
        <h2>Kurs topilmadi</h2>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: '#3461FF', color: 'white', marginTop: 16 }}>Orqaga</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: 100 }}>
      {/* ── Floating Navigator (Pill) ── */}
      <div style={{ 
        position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', pointerEvents: 'none'
      }}>
        <motion.button
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate('/dashboard')}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            color: '#0F172A', fontWeight: 800, fontSize: '0.875rem',
            padding: '10px 20px 10px 16px', borderRadius: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            cursor: 'pointer', transition: 'all 0.2s',
            WebkitTapHighlightColor: 'transparent'
          }}
          whileHover={{ scale: 1.05, background: 'rgba(255, 255, 255, 0.9)' }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} strokeWidth={3} /> Orqaga
        </motion.button>
      </div>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '100px 24px 40px' }}>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            background: 'white', borderRadius: 32, padding: '40px 32px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.03)',
            marginBottom: 32
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
             <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#3461FF', background: 'rgba(52,97,255,0.08)', padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em' }}>O'quv Rejasi</span>
          </div>
          <h1 className="outfit-font" style={{ margin: '0 0 16px', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1.15 }}>
            {course.title}
          </h1>
          {course.description && (
            <p style={{ margin: 0, fontSize: '1.0625rem', color: '#44546F', lineHeight: 1.6, fontWeight: 500, maxWidth: 800 }}>
              {course.description}
            </p>
          )}
        </motion.div>

        {/* Tabs Island */}
        <div style={{
          display: 'flex', background: '#EDF1F7', borderRadius: 100, padding: 4, marginBottom: 32,
          maxWidth: 320, border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {['videos', 'comments'].map((tab) => {
            const isActive = activeTab === tab
            const label = tab === 'videos' ? 'Videolar' : 'Izohlar'
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '10px', borderRadius: 100, border: 'none',
                  background: isActive ? 'white' : 'transparent',
                  color: isActive ? '#3461FF' : '#64748B',
                  fontWeight: 800, fontSize: '0.875rem',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                  WebkitTapHighlightColor: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'videos' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
                {lessons.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', color: '#94A3B8', background: 'rgba(255,255,255,0.5)', borderRadius: 32, border: '1px dashed #CBD5E1' }}>
                    <Info size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>Bu kursda darslar mavjud emas.</p>
                  </div>
                ) : (
                  lessons.map(lesson => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      isUnlocked={unlockedLessonIds.has(lesson.id)}
                      onNavigate={navigate}
                    />
                  ))
                )}
              </div>
            ) : (
              <CommentSection courseId={courseId} showLessonTag={true} />
            )}
          </motion.div>
        </AnimatePresence>

      </main>
    </div>
  )
}
