// src/pages/LessonDetailPage.jsx
// Mobile-first: Video + Dars info + Quiz bloki.
// Qulfli bo'lsa: Coin sarflab ochish yoki Shop-ga yo'naltirish.

import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Coins, CheckCircle2, Trophy, ClipboardList, ChevronRight } from 'lucide-react'
import { useLesson, useQuizzes } from '../hooks/useLessons'
import { useAccess } from '../hooks/useAccess'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import VideoPlayer from '../components/lesson/VideoPlayer'
import { toast } from 'sonner'

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { lesson, loading } = useLesson(lessonId)
  const { user, profile, setProfile } = useAuth()
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
      <div style={{ padding: '24px 16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: i === 1 ? 220 : 60, borderRadius: 16, background: '#E2E8F0', marginBottom: 12, opacity: 1 - i * 0.2 }} />
        ))}
      </div>
    )
  }

  if (!lesson) return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      <p style={{ color: '#64748B' }}>Dars topilmadi</p>
      <button onClick={() => navigate('/dashboard')} style={{ marginTop: 16, background: 'none', border: 'none', color: '#3461FF', fontWeight: 600, cursor: 'pointer', fontSize: '0.9375rem' }}>
        ← Darslarga qaytish
      </button>
    </div>
  )

  const handleUnlock = async () => {
    if (!user) { navigate('/login'); return }
    if (!profile || profile.coins < lesson.price) {
      toast.error("Coin yetarli emas! Do'konga o'ting.")
      navigate('/shop')
      return
    }
    const { success, error } = await unlockWithCoins()
    if (success) {
      toast.success("Dars ochildi!")
      if (setProfile) setProfile(prev => ({ ...prev, coins: prev.coins - lesson.price }))
    } else {
      toast.error("Xatolik: " + error)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', paddingBottom: 32 }}>

      {/* ── Back button ── */}
      <div style={{ padding: '16px 16px 0' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#64748B', fontWeight: 600, fontSize: '0.9375rem',
            padding: '8px 0', WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ArrowLeft size={18} /> Darslarga qaytish
        </button>
      </div>

      {/* ── Video or Lock ── */}
      <div style={{ margin: '12px 0 0' }}>
        {canWatch ? (
          <VideoPlayer videoId={lesson.youtube_video_id} lessonId={lesson.id} />
        ) : (
          <LockScreen lesson={lesson} profile={profile} onUnlock={handleUnlock} onShop={() => navigate('/shop')} />
        )}
      </div>

      {/* ── Lesson info ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em',
            color: lesson.is_free ? '#10B981' : '#3461FF',
            background: lesson.is_free ? 'rgba(16,185,129,0.08)' : 'rgba(52,97,255,0.08)',
            padding: '3px 10px', borderRadius: 8,
          }}>
            {lesson.is_free ? 'Bepul' : `${lesson.price} coin`}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>Dars #{lesson.order_index}</span>
        </div>
        <h1 style={{ margin: '0 0 10px', fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.3 }}>
          {lesson.title}
        </h1>
        {lesson.description && (
          <p style={{ margin: 0, color: '#64748B', lineHeight: 1.65, fontSize: '0.9375rem' }}>{lesson.description}</p>
        )}
      </div>

      {/* ── Quiz section ── */}
      {canWatch && quizzes.length > 0 && (
        <div style={{ margin: '28px 16px 0' }}>
          <QuizStartCard
            quizzes={quizzes}
            bestScore={bestScore}
            onStart={() => navigate(`/quiz/${lessonId}`)}
          />
        </div>
      )}

    </div>
  )
}

// ── Lock Screen ──────────────────────────────────────
function LockScreen({ lesson, profile, onUnlock, onShop }) {
  const hasEnough = profile && profile.coins >= lesson.price

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
        <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.875rem' }}>{lesson.price} coin sarflab oching</p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {hasEnough ? (
          <button onClick={onUnlock} style={{
            background: 'linear-gradient(135deg, #3461FF, #214CE5)', color: 'white',
            border: 'none', borderRadius: 14, padding: '13px 28px', fontWeight: 700,
            fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Coins size={18} /> {lesson.price} coin bilan ochish
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
          Balansingiz: {profile.coins} coin ({lesson.price - profile.coins} coin yetmaydi)
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
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'white', borderRadius: 24, padding: '24px',
        border: '1.5px solid #F1F5F9',
        boxShadow: '0 4px 20px rgba(15,23,42,0.04)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ClipboardList size={24} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 2px', fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
            Bilimni tekshirish
          </h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>
            {quizzes.length} ta savol · Har biriga 60s
          </p>
        </div>
      </div>

      {bestScore && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#F8FAFC', borderRadius: 16, padding: '14px 16px', marginBottom: 20,
          border: '1px solid #F1F5F9',
        }}>
          <Trophy size={20} color="#F59E0B" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Eng yaxshi natija
            </p>
            <p style={{ margin: 0, color: '#1E293B', fontWeight: 800, fontSize: '1rem' }}>
              {bestScore.score}/{bestScore.total} to'g'ri
              <span style={{ marginLeft: 8, color: pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
                ({pct}%)
              </span>
            </p>
          </div>
          <CheckCircle2 size={20} color={pct >= 70 ? '#10B981' : '#F59E0B'} />
        </div>
      )}

      <button
        onClick={onStart}
        style={{
          width: '100%', padding: '16px', borderRadius: 16, border: 'none',
          background: '#1E293B', color: 'white', fontWeight: 800, fontSize: '1rem',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 12px rgba(30,41,59,0.15)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {bestScore ? 'Qayta topshirish' : 'Testni boshlash'}
        <ChevronRight size={18} />
      </button>
    </motion.div>
  )
}
