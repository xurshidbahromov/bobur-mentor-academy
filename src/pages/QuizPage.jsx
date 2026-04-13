// src/pages/QuizPage.jsx
// Minimalist & Professional Quiz Page.
// Focus: Clarity, Whitespace, and Soft Muted Colors.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, HelpCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ── Constants ────────────────────────────────────────────────
const SECONDS_PER_QUESTION = 60

// ── Minimal Timer ───────────────────────────────────────────
function MinimalTimer({ seconds }) {
  const color = seconds <= 10 ? '#EF4444' : '#64748B'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 10 }}>
      {/* Icon */}
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: seconds <= 10 ? 'pulse 1s infinite' : 'none' }} />
      <span style={{ fontWeight: 800, fontSize: '1rem', color, fontFamily: 'monospace', width: 20 }}>{seconds}</span>
      <style>{`@keyframes pulse{0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}`}</style>
    </div>
  )
}

// ── Option Button (Architectural Minimalism) ─────────────────
function OptionBtn({ opt, value, selected, submitted, correct, onClick }) {
  const isCorrect = submitted && opt === correct
  const isWrong   = submitted && opt === selected && opt !== correct
  
  let bg     = 'white'
  let border = 'rgba(0,0,0,0.08)'
  let color  = '#1E293B'
  let shadow = '0 1px 3px rgba(0,0,0,0.02)'

  if (submitted) {
    if (isCorrect) {
      bg = '#F0FDF4'; border = '#22C55E'; color = '#166534'
    } else if (isWrong) {
      bg = '#FEF2F2'; border = '#EF4444'; color = '#991B1B'
    }
  } else if (opt === selected) {
    border = '#2563EB'; bg = '#EFF6FF'; color = '#1E40AF'; shadow = '0 4px 12px rgba(37,99,235,0.1)'
  }

  return (
    <motion.button
      whileTap={submitted ? {} : { scale: 0.985 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: bg, border: `1.5px solid ${border}`,
        borderRadius: 14, padding: '16px 20px',
        cursor: submitted ? 'default' : 'pointer',
        textAlign: 'left', width: '100%',
        boxShadow: shadow,
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <span style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: submitted ? 'transparent' : 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.875rem', 
        color: submitted ? (isCorrect ? '#166534' : isWrong ? '#991B1B' : '#64748B') : (opt === selected ? '#1E40AF' : '#64748B'),
      }}>
        {opt.toUpperCase()}
      </span>
      <span style={{ flex: 1, fontWeight: 500, fontSize: '1rem', color, lineHeight: 1.5 }}>
        {value}
      </span>
      {isCorrect && <CheckCircle2 size={20} color="#22C55E" />}
      {isWrong   && <XCircle size={20} color="#EF4444" />}
    </motion.button>
  )
}

// ── Result Statistics (Clean) ───────────────────────────────
function ResultCard({ score, total, timeSpent, onRetry, onBack, quizzes, answers }) {
  const pct = Math.round((score / total) * 100)
  const mins = Math.floor(timeSpent / 60)
  const secs = timeSpent % 60

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'white', border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 32, padding: '40px 32px', textAlign: 'center',
          boxShadow: '0 20px 60px rgba(15,23,42,0.08)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'inline-flex', padding: 20, borderRadius: 24, background: '#F8FAFC', color: '#6366F1', marginBottom: 24 }}>
          <Trophy size={48} />
        </div>
        <h2 className="outfit-font" style={{ margin: '0 0 8px', fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em' }}>
          {pct}% Muvaffaqiyat
        </h2>
        <p style={{ margin: '0 0 32px', color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>
          Siz {total} tadan {score} ta savolga to'g'ri javob berdingiz.
        </p>

        {/* Minimal metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ padding: '16px', borderRadius: 18, background: '#F8FAFC', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{score}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ball</p>
          </div>
          <div style={{ padding: '16px', borderRadius: 18, background: '#F8FAFC', textAlign: 'center' }}>
            <p style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{mins}:{String(secs).padStart(2,'0')}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ketgan vaqt</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onBack} style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer' }}>
            Darsga qaytish
          </button>
          <button onClick={onRetry} style={{ flex: 1, padding: '16px', borderRadius: 16, background: '#1E293B', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <RotateCcw size={18} /> Qayta urinish
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════
export default function QuizPage() {
  const { lessonId } = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [lesson,  setLesson]  = useState(null)
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [phase,     setPhase]     = useState('intro') 
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [answers,   setAnswers]   = useState({})
  const [score,     setScore]     = useState(0)

  const [timeLeft,    setTimeLeft]  = useState(SECONDS_PER_QUESTION)
  const [timeSpent,   setTimeSpent] = useState(0)
  const timerRef      = useRef(null)
  const startTimeRef  = useRef(null)
  const savedRef      = useRef(false)

  const isGeneral = lessonId === 'general'

  useEffect(() => {
    async function load() {
      if (isGeneral) {
        // Umumiy quizlar: is_general = true
        const { data: q } = await supabase
          .from('quizzes')
          .select('*')
          .eq('is_general', true)
          .order('created_at')
        // Random tartib
        const shuffled = (q || []).sort(() => Math.random() - 0.5)
        setLesson({ title: 'Umumiy Test (Random)' })
        setQuizzes(shuffled)
      } else {
        const [{ data: l }, { data: q }] = await Promise.all([
          supabase.from('lessons').select('id, title').eq('id', lessonId).single(),
          supabase.from('quizzes').select('*').eq('lesson_id', lessonId).order('order_index'),
        ])
        setLesson(l)
        setQuizzes(q || [])
      }
      setLoading(false)
    }
    load()
  }, [lessonId, isGeneral])

  const saveAttempt = useCallback(async (finAnswers, finScore, spent, completed = true) => {
    if (savedRef.current || !user) return
    savedRef.current = true
    await supabase.from('quiz_attempts').insert({
      user_id: user.id, lesson_id: lessonId, score: finScore, total: quizzes.length,
      time_spent_sec: spent, answers: finAnswers, completed
    })
  }, [user, lessonId, quizzes.length])

  const finishQuiz = useCallback((sc, ans) => {
    const spent = Math.floor((Date.now() - startTimeRef.current) / 1000)
    setTimeSpent(spent)
    saveAttempt(ans, sc, spent, true)
    setPhase('result')
  }, [saveAttempt])

  const nextStep = () => {
    if (current + 1 < quizzes.length) {
      setCurrent(c => c + 1)
      setSelected(null)
      setSubmitted(false)
      setTimeLeft(SECONDS_PER_QUESTION)
    } else {
      finishQuiz(score, answers)
    }
  }

  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time out — mark as submitted with no answer and move on
          nextStep()
          return SECONDS_PER_QUESTION
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, current, score, answers, quizzes.length])

  const handleConfirm = () => {
    if (!selected || submitted) return
    const q = quizzes[current]
    const correct = selected === q.correct_option
    const newScore = correct ? score + 1 : score
    const newAnswers = { ...answers, [q.id]: selected }
    setSubmitted(true)
    setScore(newScore)
    setAnswers(newAnswers)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header skeleton */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #F1F5F9' }}>
        <div className="skeleton-loader" style={{ width: 28, height: 28, borderRadius: 8 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton-loader" style={{ height: 11, width: 40, borderRadius: 6, marginBottom: 6 }} />
          <div className="skeleton-loader" style={{ height: 16, width: 200, borderRadius: 8 }} />
        </div>
      </div>
      {/* Body skeleton */}
      <div style={{ padding: '40px 20px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div className="skeleton-loader" style={{ width: 88, height: 88, borderRadius: 28 }} />
        <div className="skeleton-loader" style={{ height: 32, width: '70%', borderRadius: 12 }} />
        <div className="skeleton-loader" style={{ height: 18, width: '90%', borderRadius: 8 }} />
        <div className="skeleton-loader" style={{ height: 18, width: '60%', borderRadius: 8 }} />
        <div className="skeleton-loader" style={{ height: 56, width: '100%', borderRadius: 18, marginTop: 16 }} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── Top Header ── */}
      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: 'rgba(248,250,252,0.8)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
        <button onClick={() => isGeneral ? navigate('/quizzes') : navigate(`/lessons/${lessonId}`)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quiz</p>
          <h1 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson?.title}</h1>
        </div>
        {phase === 'quiz' && <MinimalTimer seconds={timeLeft} />}
      </header>

      <main style={{ flex: 1, padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', width: '100%' }}>

        {/* ── Progress bar ── */}
        {phase === 'quiz' && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B' }}>Savol {current + 1} / {quizzes.length}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563EB' }}>{Math.round(((current + 1) / quizzes.length) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2 }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${((current + 1) / quizzes.length) * 100}%` }} style={{ height: '100%', background: '#2563EB', borderRadius: 2 }} />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* INTRO */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ padding: 24, borderRadius: 28, background: '#EFF6FF', color: '#2563EB', display: 'inline-flex', alignSelf: 'center', marginBottom: 24 }}>
                <HelpCircle size={40} />
              </div>
              <h2 className="outfit-font" style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: '0 0 12px' }}>Testga tayyormisiz?</h2>
              <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: 40, fontSize: '1rem' }}>
                Ushbu dars bo'yicha bilimlaringizni tekshiring.<br />Jami <strong>{quizzes.length} ta savol</strong>. Har biriga 60 soniya vaqt.
              </p>
              <button 
                onClick={() => { startTimeRef.current = Date.now(); setPhase('quiz') }} 
                style={{ width: '100%', padding: '18px', borderRadius: 18, background: '#1E293B', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.0625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Boshladik <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {/* QUIZ */}
          {phase === 'quiz' && (
            <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.45, marginBottom: 24 }}>{quizzes[current].question}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {['a', 'b', 'c', 'd'].filter(o => quizzes[current][`option_${o}`]).map(opt => (
                  <OptionBtn 
                    key={opt} opt={opt} value={quizzes[current][`option_${opt}`]}
                    selected={selected} submitted={submitted} correct={quizzes[current].correct_option}
                    onClick={() => !submitted && setSelected(opt)}
                  />
                ))}
              </div>

              {submitted && quizzes[current].explanation && (
                <div style={{ padding: '16px', borderRadius: 16, background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: 24, fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0F172A' }}>Izoh:</strong> {quizzes[current].explanation}
                </div>
              )}

              <div style={{ marginTop: 'auto' }}>
                {!submitted ? (
                  <button 
                    disabled={!selected} onClick={handleConfirm}
                    style={{ width: '100%', padding: '18px', borderRadius: 18, background: selected ? '#1E293B' : '#E2E8F0', color: selected ? 'white' : '#94A3B8', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: selected ? 'pointer' : 'not-allowed', transition: '0.2s' }}
                  >
                    Tekshirish
                  </button>
                ) : (
                  <button 
                    onClick={nextStep}
                    style={{ width: '100%', padding: '18px', borderRadius: 18, background: '#2563EB', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {current + 1 < quizzes.length ? 'Keyingi savol' : 'Natijani ko\'rish'} <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && (
            <ResultCard 
              score={score} total={quizzes.length} timeSpent={timeSpent}
              onRetry={() => { savedRef.current = false; setPhase('intro'); setScore(0); setCurrent(0); setSelected(null); setSubmitted(false) }}
              onBack={() => isGeneral ? navigate('/quizzes') : navigate(`/lessons/${lessonId}`)}
            />
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
