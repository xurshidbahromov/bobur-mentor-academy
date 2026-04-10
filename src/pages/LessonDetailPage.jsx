// src/pages/LessonDetailPage.jsx
// Mobile-first: Video + Dars info + Quiz bloki.
// Qulfli bo'lsa: Coin sarflab ochish yoki Shop-ga yo'naltirish.

import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Coins, CheckCircle2, XCircle } from 'lucide-react'
import { useLesson, useQuizzes } from '../hooks/useLessons'
import { useAccess } from '../hooks/useAccess'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/lesson/VideoPlayer'
import { toast } from 'sonner'

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { lesson, loading } = useLesson(lessonId)
  const { user, profile, setProfile } = useAuth()
  const { canWatch, loading: accessLoading, unlockWithCoins } = useAccess(lesson)
  const { quizzes } = useQuizzes(canWatch ? lessonId : null)

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="#8B5CF6" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
              Bilimni tekshirish
            </h2>
            <span style={{ marginLeft: 'auto', fontSize: '0.8125rem', fontWeight: 700, color: '#8B5CF6', background: 'rgba(139,92,246,0.08)', padding: '3px 10px', borderRadius: 8 }}>
              {quizzes.length} ta savol
            </span>
          </div>
          <QuizSection quizzes={quizzes} />
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

// ── Quiz Section ─────────────────────────────────────
function QuizSection({ quizzes }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = quizzes[current]
  const options = ['a', 'b', 'c', 'd'].filter(o => q[`option_${o}`])
  const isCorrect = selected === q.correct_option

  const handleSubmit = () => {
    if (!selected) return
    if (!submitted) {
      setSubmitted(true)
      if (isCorrect) setScore(s => s + 1)
    } else {
      if (current + 1 < quizzes.length) {
        setCurrent(c => c + 1)
        setSelected(null)
        setSubmitted(false)
      } else {
        setDone(true)
      }
    }
  }

  if (done) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{
        background: 'white', borderRadius: 20, padding: 28, textAlign: 'center',
        border: '1.5px solid rgba(100,120,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>
        {score === quizzes.length ? '🏆' : score > quizzes.length / 2 ? '🎉' : '📚'}
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '1.375rem', fontWeight: 800, color: '#0F172A' }}>
        {score}/{quizzes.length} to'g'ri!
      </h3>
      <p style={{ color: '#64748B', margin: '0 0 20px' }}>
        {score === quizzes.length ? 'Mukammal natija! Barcha savollar to\'g\'ri.' : 'Yaxshi harakat! Bilimni mustahkamlay boring.'}
      </p>
      <button onClick={() => { setCurrent(0); setSelected(null); setSubmitted(false); setScore(0); setDone(false) }}
        style={{
          background: 'linear-gradient(135deg, #3461FF, #214CE5)', color: 'white',
          border: 'none', borderRadius: 14, padding: '12px 28px', fontWeight: 700,
          fontSize: '0.9375rem', cursor: 'pointer',
        }}>
        Qayta boshlash
      </button>
    </motion.div>
  )

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 20, border: '1.5px solid rgba(100,120,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94A3B8' }}>{current + 1} / {quizzes.length}</span>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#F1F5F9', margin: '0 12px' }}>
          <div style={{ height: '100%', borderRadius: 2, background: '#3461FF', width: `${((current + 1) / quizzes.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#10B981' }}>{score} ✓</span>
      </div>

      <p style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', lineHeight: 1.5, margin: '0 0 16px' }}>{q.question}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {options.map(opt => {
          const val = q[`option_${opt}`]
          let bg = 'rgba(100,120,255,0.04)'
          let border = 'rgba(100,120,255,0.12)'
          let color = '#334155'
          if (submitted) {
            if (opt === q.correct_option) { bg = 'rgba(16,185,129,0.08)'; border = '#10B981'; color = '#0F172A' }
            else if (opt === selected) { bg = 'rgba(239,68,68,0.06)'; border = '#EF4444'; color = '#EF4444' }
          } else if (opt === selected) {
            bg = 'rgba(52,97,255,0.08)'; border = '#3461FF'; color = '#3461FF'
          }
          return (
            <button key={opt} onClick={() => !submitted && setSelected(opt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: bg, border: `1.5px solid ${border}`,
                borderRadius: 12, padding: '12px 14px', cursor: submitted ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all 0.15s', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ width: 24, height: 24, borderRadius: 8, background: `${border}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8125rem', color: border, flexShrink: 0 }}>
                {opt.toUpperCase()}
              </span>
              <span style={{ fontWeight: 500, fontSize: '0.9375rem', color, flex: 1 }}>{val}</span>
              {submitted && opt === q.correct_option && <CheckCircle2 size={18} color="#10B981" />}
              {submitted && opt === selected && opt !== q.correct_option && <XCircle size={18} color="#EF4444" />}
            </button>
          )
        })}
      </div>

      {submitted && q.explanation && (
        <div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: '0.875rem', color: '#6D28D9', lineHeight: 1.55 }}>
          <strong>Izoh:</strong> {q.explanation}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selected}
        style={{
          width: '100%', padding: '14px', borderRadius: 14, border: 'none',
          background: selected ? 'linear-gradient(135deg, #3461FF, #214CE5)' : '#E2E8F0',
          color: selected ? 'white' : '#94A3B8', fontWeight: 700, fontSize: '1rem',
          cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {!submitted ? 'Javobni tekshirish' : current + 1 < quizzes.length ? 'Keyingi savol →' : 'Natijani ko\'rish →'}
      </button>
    </div>
  )
}
