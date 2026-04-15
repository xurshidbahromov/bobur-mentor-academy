// src/pages/LessonDetailPage.jsx
// Mobile-first: Video + Dars info + Quiz bloki.
// Qulfli bo'lsa: Coin sarflab ochish yoki Shop-ga yo'naltirish.

import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, Coins, CheckCircle2, Trophy, ClipboardList, ChevronRight } from 'lucide-react'
import { useLesson, useQuizzes } from '../hooks/useLessons'
import { useAccess } from '../hooks/useAccess'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import VideoPlayer from '../components/lesson/VideoPlayer'
import CommentSection from '../components/lesson/CommentSection'
import { toast } from 'sonner'

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { lesson, loading } = useLesson(lessonId)
  const { user, profile, setProfile } = useAuth()

  // 2. Fetch all lessons in the course for the playlist
  const [playlist, setPlaylist] = useState([])
  const [playlistLoading, setPlaylistLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'comments' | 'quiz'

  useEffect(() => {
    if (lesson?.course_id) {
      supabase
        .from('lessons')
        .select('id, title, order_index, is_free, price')
        .eq('course_id', lesson.course_id)
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .then(({ data }) => {
          setPlaylist(data || [])
          setPlaylistLoading(false)
        })
    }
  }, [lesson?.course_id])

  const { canWatch, loading: accessLoading, unlockWithCoins } = useAccess(lesson)
  const { quizzes } = useQuizzes(canWatch ? lessonId : null)
  const [bestScore, setBestScore] = useState(null)

  // Load best previous score
  useEffect(() => {
    if (!user || !canWatch) return
    supabase
      .from('quiz_attempts')
      .select('score, total')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .order('score', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setBestScore(data[0])
      })
  }, [user, canWatch, lessonId])

  if (loading || accessLoading) {
    return (
      <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ height: 38, width: 200, borderRadius: 100, background: '#FFFFFF', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(241,245,249,0.8) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite linear' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24 }}>
          <div style={{ height: 500, borderRadius: 24, background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(241,245,249,0.8) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite linear' }} />
          </div>
          <div style={{ height: 500, borderRadius: 24, background: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(241,245,249,0.8) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite linear' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      <p style={{ color: '#64748B' }}>Dars topilmadi</p>
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: 16, background: 'none', border: 'none', color: '#3461FF', fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}>
        ← Bosh sahifaga qaytish
      </button>
    </div>
  )

  const handleUnlock = async () => {
    if (!user) { navigate('/login'); return }
    const unlockCost = lesson.coin_price ?? 5
    if (!profile || profile.coins < unlockCost) {
      toast.error("Coin yetarli emas! Do'konga o'ting.")
      navigate('/shop')
      return
    }
    const { success, error } = await unlockWithCoins()
    if (success) {
      toast.success("Dars ochildi!")
      if (setProfile) setProfile(prev => ({ ...prev, coins: prev.coins - unlockCost }))
    } else {
      toast.error("Xatolik: " + error)
    }
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 80px' }}>

      {/* ── Breadcrumbs ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.875rem', fontWeight: 600, color: '#94A3B8' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 'inherit', cursor: 'pointer', padding: 0 }}>Dashboard</button>
        <span>/</span>
        <button onClick={() => navigate(`/courses/${lesson.course_id}`)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Kurs</button>
        <span>/</span>
        <span style={{ color: '#475569' }}>Dars #{lesson.order_index}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Main Grid: Video + Playlist */}
        <div className="lesson-grid" style={{ alignItems: 'start' }}>
          
          {/* Left Column: Video & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ borderRadius: 32, overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: '#000' }}>
              {canWatch ? (
                <VideoPlayer videoId={lesson.youtube_video_id} lessonId={lesson.id} />
              ) : (
                <LockScreen lesson={lesson} profile={profile} onUnlock={handleUnlock} onShop={() => navigate('/shop')} />
              )}
            </div>

            {/* Glassy Tab Bar */}
            <div style={{ 
              display: 'flex', flexWrap: 'wrap', background: 'rgba(255, 255, 255, 0.7)', 
              backdropFilter: 'blur(16px)',
              borderRadius: 24, padding: 4, 
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 8px 32px rgba(15,23,42,0.03)',
              maxWidth: 480
            }}>
              {[
                { id: 'info', label: 'Ma\'lumot' },
                { id: 'comments', label: 'Izohlar' },
                { id: 'quiz', label: 'Quiz' }
              ].map((tab) => {
                const isActive = activeTab === tab.id
                // Don't show quiz tab if no quizzes
                if (tab.id === 'quiz' && (!canWatch || quizzes.length === 0)) return null

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: '1 1 auto', minWidth: 100, padding: '10px', borderRadius: 20, border: 'none',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? '#0F172A' : '#64748B',
                      fontWeight: 800, fontSize: '0.875rem',
                      boxShadow: isActive ? '0 4px 12px rgba(15,23,42,0.08)' : 'none',
                      cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                      WebkitTapHighlightColor: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tabbed Content Area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === 'info' && (
                  <div style={{ 
                    background: 'rgba(255, 255, 255, 0.7)', 
                    backdropFilter: 'blur(16px)',
                    borderRadius: 32, padding: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 8px 32px rgba(15,23,42,0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.06em',
                        color: lesson.is_free ? '#10B981' : '#3461FF',
                        background: lesson.is_free ? 'rgba(16,185,129,0.08)' : 'rgba(52,97,255,0.08)',
                        padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(0,0,0,0.03)'
                      }}>
                        {lesson.is_free ? 'BEPUL' : `${lesson.coin_price ?? 5} COIN`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>DARS #{lesson.order_index}</span>
                    </div>
                    <h1 className="outfit-font" style={{ margin: '0 0 16px', fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                      {lesson.title}
                    </h1>
                    {lesson.description && (
                      <p style={{ margin: 0, color: '#475569', lineHeight: 1.6, fontSize: '1rem', fontWeight: 500 }}>{lesson.description}</p>
                    )}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <CommentSection courseId={lesson.course_id} lessonId={lesson.id} />
                )}

                {activeTab === 'quiz' && (
                  <QuizStartCard
                    quizzes={quizzes}
                    bestScore={bestScore}
                    onStart={() => navigate(`/quiz/${lessonId}`)}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Playlist Sidebar */}
          <aside className="lesson-sidebar" style={{ 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(20px)',
            borderRadius: 32, padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 12px 40px rgba(15,23,42,0.04)'
          }}>
            <h3 className="outfit-font" style={{ margin: '0 0 20px', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
              Darslar ro'yxati
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {playlistLoading ? (
                <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Yuklanmoqda...</p>
              ) : playlist.map((item) => {
                const isActive = item.id === lessonId
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/lessons/${item.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', padding: '12px', borderRadius: 16, border: 'none',
                      background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                      color: isActive ? 'white' : '#475569',
                      cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                      boxShadow: isActive ? '0 8px 20px rgba(52,97,255,0.2)' : 'none'
                    }}
                  >
                    <div style={{ 
                      width: 28, height: 28, borderRadius: 8, 
                      background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                    }}>
                      {item.order_index}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                    {!item.is_free && !isActive && <Lock size={14} style={{ opacity: 0.5 }} />}
                  </button>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// ── Lock Screen ──────────────────────────────────────
function LockScreen({ lesson, profile, onUnlock, onShop }) {
  const unlockCost = lesson.coin_price ?? 5
  const hasEnough = profile && profile.coins >= unlockCost

  return (
    <div style={{
      aspectRatio: '16/9',
      background: 'linear-gradient(135deg, #0F172A, #1E293B)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 24,
    }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock size={28} color="white" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: '0 0 6px', color: 'white', fontWeight: 700, fontSize: '1.125rem' }}>Bu dars qulflangan</p>
        <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.875rem' }}>{unlockCost} coin sarflab oching</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {hasEnough ? (
          <button onClick={onUnlock} style={{
            background: 'linear-gradient(135deg, #3461FF, #214CE5)', color: 'white',
            border: 'none', borderRadius: 14, padding: '13px 28px', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Coins size={18} /> {unlockCost} coin bilan ochish
          </button>
        ) : (
          <>
            <button onClick={onShop} style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white',
              border: 'none', borderRadius: 14, padding: '13px 28px', fontWeight: 700,
              fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Coins size={18} /> Coin sotib olish
            </button>
          </>
        )}
      </div>
      {!hasEnough && profile && (
        <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: 0 }}>
          Balansingiz: {profile.coins} coin ({unlockCost - profile.coins} coin yetmaydi)
        </p>
      )}
    </div>
  )
}

// ── Quiz Start Card (Minimalist) ─────────────────────────────
function QuizStartCard({ quizzes, bestScore, onStart }) {
  const pct = bestScore ? Math.round((bestScore.score / bestScore.total) * 100) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        borderRadius: 32, padding: '32px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 12px 40px rgba(15,23,42,0.06)',
        position: 'relative', overflow: 'hidden',
        maxWidth: 600
      }}
    >
      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(52,97,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: 56, height: 56, borderRadius: 18, 
          background: 'white', color: '#2563EB', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(37,99,235,0.1)',
          border: '1px solid rgba(37,99,235,0.05)'
        }}>
          <ClipboardList size={26} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="outfit-font" style={{ margin: '0 0 2px', fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Bilimni tekshirish
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>
            {quizzes.length} ta savol · Har biriga 60s
          </p>
        </div>
      </div>

      {bestScore && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'rgba(255, 255, 255, 0.5)', 
          borderRadius: 20, padding: '16px 20px', marginBottom: 28,
          border: '1px solid rgba(15,23,42,0.04)',
          position: 'relative', zIndex: 1
        }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: '50%', 
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(245,158,11,0.15)'
          }}>
            <Trophy size={20} color="#F59E0B" fill="#F59E0B" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Eng yaxshi natija
            </p>
            <p className="outfit-font" style={{ margin: 0, color: '#0F172A', fontWeight: 900, fontSize: '1.125rem' }}>
              {bestScore.score}/{bestScore.total} 
              <span style={{ marginLeft: 8, color: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444', fontWeight: 800 }}>
                ({pct}%)
              </span>
            </p>
          </div>
          <CheckCircle2 size={22} color={pct >= 70 ? '#10B981' : '#F59E0B'} strokeWidth={3} />
        </div>
      )}

      <motion.button
        onClick={onStart}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', padding: '18px', borderRadius: 18, border: 'none',
          background: 'linear-gradient(135deg, #1E293B, #0F172A)', 
          color: 'white', fontWeight: 800, fontSize: '1rem',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
          WebkitTapHighlightColor: 'transparent',
          position: 'relative', zIndex: 1
        }}
      >
        {bestScore ? 'Qayta topshirish' : 'Testni boshlash'}
        <ChevronRight size={18} strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  )
}
