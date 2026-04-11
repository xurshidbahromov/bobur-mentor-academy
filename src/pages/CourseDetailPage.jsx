import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Lock, Coins, MessageCircle, Info } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import CommentSection from '../components/lesson/CommentSection'

// ── Lesson Row Component ─────────────────────────────────────
function LessonCard({ lesson, userCoins, onNavigate }) {
  const isLocked = !lesson.is_free && (userCoins < (lesson.price || 0))
  const canAccess = lesson.is_free || !isLocked

  const handleClick = () => {
    if (canAccess) onNavigate(`/lessons/${lesson.id}`)
    else onNavigate('/shop')
  }

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '16px', borderRadius: 20,
        background: canAccess ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${canAccess ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
        cursor: 'pointer', transition: 'all 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative', overflow: 'hidden'
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: canAccess ? 'rgba(52, 97, 255, 0.08)' : 'rgba(100, 116, 139, 0.06)',
        border: `1px solid ${canAccess ? 'rgba(52, 97, 255, 0.1)' : 'rgba(100, 116, 139, 0.1)'}`
      }}>
        {canAccess ? <Play size={18} color="#3461FF" fill="#3461FF" /> : <Lock size={18} color="#94A3B8" />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="outfit-font" style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: canAccess ? '#0F172A' : '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
          {lesson.order_index}. {lesson.title}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          {!lesson.is_free && (
            <span style={{ fontSize: '0.6875rem', color: canAccess ? '#10B981' : '#EF4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {canAccess ? 'Ochilgan' : `${lesson.price} COIN`}
            </span>
          )}
          {lesson.is_free && (
            <span style={{ fontSize: '0.6875rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bepul</span>
          )}
        </div>
      </div>
      {!canAccess && (
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(245, 158, 11, 0.1)', color: '#D97706',
          padding: '6px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 800,
          border: '1px solid rgba(245, 158, 11, 0.15)'
        }}>
          <Coins size={12} strokeWidth={2.5} /> {lesson.price}
        </div>
      )}
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { profile } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('videos') // 'videos' | 'comments'

  const coins = profile?.coins || 0

  useEffect(() => {
    async function loadData() {
      const [courseRes, lessonsRes] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).eq('is_published', true).order('order_index')
      ])
      if (courseRes.data) setCourse(courseRes.data)
      if (lessonsRes.data) setLessons(lessonsRes.data)
      setLoading(false)
    }
    loadData()
  }, [courseId])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#3461FF', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
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
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      {/* ── Header (Sticky, Pill back button) ── */}
      <header style={{ 
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)',
        padding: '16px 20px', borderBottom: '1px solid rgba(15,23,42,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: 1040, display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(52,97,255,0.08)', border: '1px solid rgba(52,97,255,0.12)', cursor: 'pointer',
              color: '#3461FF', fontWeight: 700, fontSize: '0.9375rem',
              padding: '8px 16px 8px 12px', borderRadius: 100,
              WebkitTapHighlightColor: 'transparent', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(52,97,255,0.04)'
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Orqaga
          </button>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* Course Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 32 }}>
          <h1 className="outfit-font" style={{ margin: '0 0 12px', fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            {course.title}
          </h1>
          {course.description && (
            <p style={{ margin: 0, fontSize: '1rem', color: '#64748B', lineHeight: 1.6, fontWeight: 500, maxWidth: 600 }}>
              {course.description}
            </p>
          )}
        </motion.div>

        {/* Glassy Pill Tabs */}
        <div style={{ 
          display: 'flex', background: 'rgba(15,23,42,0.04)', borderRadius: 100, padding: 4, marginBottom: 32,
          maxWidth: 400, border: '1px solid rgba(15,23,42,0.03)'
        }}>
          {['videos', 'comments'].map((tab) => {
            const isActive = activeTab === tab
            const label = tab === 'videos' ? 'Videolar' : 'Izohlar'
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 100, border: 'none',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#0F172A' : '#64748B',
                  fontWeight: 800, fontSize: '0.9375rem',
                  boxShadow: isActive ? '0 4px 12px rgba(15,23,42,0.08)' : 'none',
                  cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {lessons.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', color: '#94A3B8', background: 'rgba(255,255,255,0.5)', borderRadius: 32, border: '1px dashed #CBD5E1' }}>
                    <Info size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '1.125rem' }}>Bu kursda darslar mavjud emas.</p>
                  </div>
                ) : (
                  lessons.map(lesson => (
                    <LessonCard key={lesson.id} lesson={lesson} userCoins={coins} onNavigate={navigate} />
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
