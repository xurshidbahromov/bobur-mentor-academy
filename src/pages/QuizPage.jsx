// src/pages/QuizPage.jsx
// Minimalist & Professional Quiz Page — Duolingo-inspired animations

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight, HelpCircle, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ── Constants ────────────────────────────────────────────────
const SECONDS_PER_QUESTION = 60

// ── Minimal Timer ───────────────────────────────────────────
function MinimalTimer({ seconds }) {
  const color = seconds <= 10 ? '#EF4444' : '#64748B'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: seconds <= 10 ? 'pulse 1s infinite' : 'none' }} />
      <span style={{ fontWeight: 800, fontSize: '1rem', color, fontFamily: 'monospace', width: 20 }}>{seconds}</span>
      <style>{`@keyframes pulse{0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}`}</style>
    </div>
  )
}

// ── Floating particles on correct answer ─────────────────────
function CorrectParticles() {
  const particles = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(80 + Math.random() * 100),
    rotate: (Math.random() - 0.5) * 360,
    scale: 0.5 + Math.random() * 0.8,
    color: ['#22C55E', '#86EFAC', '#3461FF', '#FCD34D', '#F472B6'][i % 5],
    delay: i * 0.05,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 'inherit' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: p.scale, rotate: p.rotate }}
          transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: '50%', bottom: '50%',
            width: 10, height: 10, borderRadius: 3,
            background: p.color,
          }}
        />
      ))}
    </div>
  )
}

// ── Option Button ─────────────────────────────────────────────
function OptionBtn({ opt, value, selected, submitted, correct, onClick }) {
  const isCorrect = submitted && opt === correct
  const isWrong   = submitted && opt === selected && opt !== correct
  const controls  = useAnimation()
  const hasShaken = useRef(false)

  // Shake on wrong answer (once)
  useEffect(() => {
    if (isWrong && !hasShaken.current) {
      hasShaken.current = true
      controls.start({
        x: [0, -10, 10, -8, 8, -4, 4, 0],
        transition: { duration: 0.45, ease: 'easeInOut' }
      })
    }
  }, [isWrong])

  let bg     = 'white'
  let border = 'rgba(0,0,0,0.08)'
  let color  = '#1E293B'
  let shadow = '0 1px 3px rgba(0,0,0,0.02)'

  if (submitted) {
    if (isCorrect) {
      bg = '#F0FDF4'; border = '#22C55E'; color = '#166534'; shadow = '0 4px 16px rgba(34,197,94,0.15)'
    } else if (isWrong) {
      bg = '#FEF2F2'; border = '#EF4444'; color = '#991B1B'; shadow = '0 4px 16px rgba(239,68,68,0.12)'
    }
  } else if (opt === selected) {
    border = '#2563EB'; bg = '#EFF6FF'; color = '#1E40AF'; shadow = '0 4px 12px rgba(37,99,235,0.1)'
  }

  return (
    <motion.button
      animate={controls}
      initial={false}
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
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.25s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Correct answer: green sweep */}
      {isCorrect && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
            transformOrigin: 'left',
          }}
        />
      )}

      <span style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: isCorrect ? 'rgba(34,197,94,0.12)' : isWrong ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.875rem',
        color: isCorrect ? '#166534' : isWrong ? '#991B1B' : (opt === selected ? '#1E40AF' : '#64748B'),
        transition: 'all 0.25s',
        position: 'relative', zIndex: 1,
      }}>
        {opt.toUpperCase()}
      </span>

      <span style={{ flex: 1, fontWeight: 500, fontSize: '1rem', color, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
        {value}
      </span>

      <AnimatePresence>
        {isCorrect && (
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
            <CheckCircle2 size={20} color="#22C55E" />
          </motion.div>
        )}
        {isWrong && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
            <XCircle size={20} color="#EF4444" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ── Feedback banner ────────────────────────────────────────────
function FeedbackBanner({ isCorrect }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 16, marginBottom: 16,
          background: isCorrect ? '#F0FDF4' : '#FEF2F2',
          border: `1.5px solid ${isCorrect ? '#86EFAC' : '#FCA5A5'}`,
        }}
      >
        {isCorrect
          ? <CheckCircle2 size={22} color="#22C55E" />
          : <XCircle size={22} color="#EF4444" />}
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: '0.9375rem', color: isCorrect ? '#166534' : '#991B1B' }}>
            {isCorrect ? 'Ajoyib! To\'g\'ri javob!' : 'Xato javob!'}
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: isCorrect ? '#4ADE80' : '#F87171', fontWeight: 600 }}>
            {isCorrect ? 'Shunday davom eting!' : 'Keyingi savolga o\'ting'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Result Statistics ───────────────────────────────────────
function ResultCard({ score, total, timeSpent, onRetry, onBack }) {
  const pct  = Math.round((score / total) * 100)
  const mins = Math.floor(timeSpent / 60)
  const secs = timeSpent % 60

  // Grade color
  const gradeColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  const gradeText  = pct >= 80 ? 'Ajoyib natija!' : pct >= 50 ? 'Yaxshi harakat!' : 'Yana urinib ko\'ring'

  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: 'rgba(255, 255, 255, 1)', 
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 36, padding: '48px 32px', textAlign: 'center',
          boxShadow: '0 24px 80px rgba(15,23,42,0.08)', marginBottom: 24,
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Glow behind the trophy */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)',
          width: 300, height: 300, borderRadius: '50%', background: gradeColor,
          opacity: 0.1, filter: 'blur(60px)', pointerEvents: 'none'
        }} />

        {/* Stars row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, delay: i * 0.12 }}
              style={{ position: 'relative' }}
            >
              <Star
                size={i === 2 ? 56 : 44}
                color={i <= stars ? '#FCD34D' : '#E2E8F0'}
                fill={i <= stars ? '#FCD34D' : '#E2E8F0'}
                style={{ filter: i <= stars ? 'drop-shadow(0 4px 12px rgba(252,211,77,0.4))' : 'none', transform: i === 2 ? 'translateY(-10px)' : 'none' }}
              />
            </motion.div>
          ))}
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="outfit-font"
          style={{ margin: '0 0 8px', fontSize: '3rem', fontWeight: 900, color: gradeColor, letterSpacing: '-0.04em', lineHeight: 1 }}
        >
          {pct}%
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}
        >
          {gradeText}
        </motion.p>
        <p style={{ margin: '0 0 32px', color: '#64748B', fontSize: '1rem', fontWeight: 500 }}>
          {total} tadan <strong style={{ color: '#0F172A', fontWeight: 700 }}>{score} ta</strong> to'g'ri javob topdingiz
        </p>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 36 }}>
          <div style={{ padding: '20px', borderRadius: 24, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.03)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>{score}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>To'g'ri</p>
          </div>
          <div style={{ padding: '20px', borderRadius: 24, background: '#F8FAFC', border: '1px solid rgba(0,0,0,0.03)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>{mins}:{String(secs).padStart(2,'0')}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vaqt</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
            onClick={onBack} 
            style={{ flex: 1, padding: '18px', borderRadius: 20, background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Darsga qaytish
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(30,41,59,0.2)' }} whileTap={{ scale: 0.96 }}
            onClick={onRetry} 
            style={{ flex: 1, padding: '18px', borderRadius: 20, background: '#1E293B', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            <RotateCcw size={18} strokeWidth={2.5} /> Qayta
          </motion.button>
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
  const isGeneral = lessonId === 'general'

  const { data: quizData, isLoading: loading } = useQuery({
    queryKey: ['quiz', lessonId],
    queryFn: async () => {
      if (isGeneral) {
        const { data: q, error } = await supabase
          .from('quizzes').select('*').eq('is_general', true).order('created_at')
        if (error) throw error
        return { lesson: { title: 'Umumiy Test' }, allQuizzes: (q || []).sort(() => Math.random() - 0.5) }
      } else {
        const [{ data: l, error: lErr }, { data: q, error: qErr }] = await Promise.all([
          supabase.from('lessons').select('id, title').eq('id', lessonId).single(),
          supabase.from('quizzes').select('*').eq('lesson_id', lessonId).order('order_index'),
        ])
        if (lErr) throw lErr
        if (qErr) throw qErr
        return { lesson: l, quizzes: q || [] }
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  // Local state for quiz progress (derived from query data)
  const [quizzes, setQuizzes] = useState([])
  const [lesson, setLesson] = useState(null)
  const [allQuizzes, setAllQuizzes] = useState([])

  useEffect(() => {
    if (quizData) {
      setLesson(quizData.lesson)
      if (isGeneral) {
        setAllQuizzes(quizData.allQuizzes)
      } else {
        setQuizzes(quizData.quizzes)
      }
    }
  }, [quizData, isGeneral])

  const [phase,     setPhase]     = useState('intro')
  const [current,   setCurrent]   = useState(0)
  const [selected,  setSelected]  = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [answers,   setAnswers]   = useState({})
  const [score,     setScore]     = useState(0)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [countChoice, setCountChoice] = useState(10) // General quiz: how many questions

  const [timeLeft,    setTimeLeft]  = useState(SECONDS_PER_QUESTION)
  const [timeSpent,   setTimeSpent] = useState(0)
  const timerRef      = useRef(null)
  const startTimeRef  = useRef(null)
  const savedRef      = useRef(false)

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
      setIsCorrect(false)
      setShowParticles(false)
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
    setIsCorrect(correct)
    setScore(newScore)
    setAnswers(newAnswers)
    if (correct) {
      setShowParticles(true)
      setTimeout(() => setShowParticles(false), 1000)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 11, width: 40, borderRadius: 6, marginBottom: 6, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
          <div style={{ height: 16, width: 200, borderRadius: 8, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        </div>
      </div>
      <div style={{ padding: '40px 20px', maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 88, height: 88, borderRadius: 28, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: 32, width: '70%', borderRadius: 12, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: 18, width: '90%', borderRadius: 8, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: 18, width: '60%', borderRadius: 8, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
        <div style={{ height: 56, width: '100%', borderRadius: 18, marginTop: 16, background: '#F1F5F9', animation: 'pulse 1.5s infinite ease-in-out' }} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Header ── */}
      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: 'rgba(248,250,252,0.98)', zIndex: 10, borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
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
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#64748B' }}>Savol {current + 1} / {quizzes.length}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#2563EB' }}>{Math.round(((current + 1) / quizzes.length) * 100)}%</span>
            </div>
            <div style={{ height: 5, background: '#E2E8F0', borderRadius: 3 }}>
              <motion.div
                initial={false}
                animate={{ width: `${((current + 1) / quizzes.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #2563EB, #8B5CF6)', borderRadius: 3 }}
              />
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

              {isGeneral ? (
                // ── General Quiz: Count Selector ──
                <>
                  <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: 24, fontSize: '1rem' }}>
                    Bazada <strong style={{ color: '#0F172A' }}>{allQuizzes.length} ta</strong> umumiy savol bor.<br />Nechta savoldan iborat test yechmoqchisiz?
                  </p>

                  {/* Count options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                    {[10, 30, 60, allQuizzes.length].filter((v, i, arr) => arr.indexOf(v) === i).map(n => (
                      <motion.button
                        key={n}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setCountChoice(n)}
                        style={{
                          padding: '16px 12px',
                          borderRadius: 16,
                          border: `2px solid ${countChoice === n ? '#2563EB' : '#E2E8F0'}`,
                          background: countChoice === n ? '#EFF6FF' : 'white',
                          color: countChoice === n ? '#2563EB' : '#64748B',
                          fontWeight: 800,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          transition: 'all 0.18s',
                        }}
                      >
                        {n === allQuizzes.length ? `Hammasi (${n})` : `${n} ta`}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      const picked = allQuizzes.slice(0, countChoice)
                      setQuizzes(picked)
                      startTimeRef.current = Date.now()
                      setPhase('quiz')
                    }}
                    style={{ width: '100%', padding: '18px', borderRadius: 18, background: '#1E293B', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.0625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    {countChoice} ta savol boshlash <ChevronRight size={20} />
                  </motion.button>
                </>
              ) : (
                // ── Lesson-specific Quiz ──
                <>
                  <p style={{ color: '#64748B', lineHeight: 1.6, marginBottom: 40, fontSize: '1rem' }}>
                    Ushbu dars bo'yicha bilimlaringizni tekshiring.<br />Jami <strong>{quizzes.length} ta savol</strong>. Har biriga 60 soniya vaqt.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => { startTimeRef.current = Date.now(); setPhase('quiz') }}
                    style={{ width: '100%', padding: '18px', borderRadius: 18, background: '#1E293B', color: 'white', border: 'none', fontWeight: 800, fontSize: '1.0625rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    Boshladik <ChevronRight size={20} />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {/* QUIZ */}
          {phase === 'quiz' && (
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {quizzes[current].image_url && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setZoomedImage(quizzes[current].image_url)}
                  style={{ display: 'block', width: '100%', padding: 0, marginBottom: 20, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', background: 'white', cursor: 'pointer', position: 'relative', outline: 'none' }}
                >
                  <img src={quizzes[current].image_url} alt="Question diagram" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.7)', color: 'white', padding: '6px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600 }}>
                    Kattalashtirish
                  </div>
                </motion.button>
              )}

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.45, marginBottom: 24 }}>
                {quizzes[current].question}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {['a', 'b', 'c', 'd'].filter(o => quizzes[current][`option_${o}`]).map(opt => (
                  <OptionBtn
                    key={opt} opt={opt} value={quizzes[current][`option_${opt}`]}
                    selected={selected} submitted={submitted} correct={quizzes[current].correct_option}
                    onClick={() => !submitted && setSelected(opt)}
                  />
                ))}
              </div>

              {/* Feedback banner */}
              {submitted && (
                <div style={{ position: 'relative' }}>
                  {showParticles && <CorrectParticles />}
                  <FeedbackBanner isCorrect={isCorrect} />
                </div>
              )}

              {/* Explanation */}
              {submitted && quizzes[current].explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '14px 18px', borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: 16, fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}
                >
                  <strong style={{ color: '#0F172A' }}>Izoh:</strong> {quizzes[current].explanation}
                </motion.div>
              )}

              <div style={{ marginTop: 'auto' }}>
                {!submitted ? (
                  <motion.button
                    disabled={!selected}
                    onClick={handleConfirm}
                    whileTap={selected ? { scale: 0.97 } : {}}
                    style={{ width: '100%', padding: '18px', borderRadius: 18, background: selected ? '#1E293B' : '#E2E8F0', color: selected ? 'white' : '#94A3B8', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: selected ? 'pointer' : 'not-allowed', transition: 'background 0.25s, color 0.25s' }}
                  >
                    Tekshirish
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={nextStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ width: '100%', padding: '18px', borderRadius: 18, background: '#2563EB', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(37,99,235,0.25)' }}
                  >
                    {current + 1 < quizzes.length ? 'Keyingi savol' : 'Natijani ko\'rish'} <ChevronRight size={20} />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && (
            <ResultCard
              score={score} total={quizzes.length} timeSpent={timeSpent}
              onRetry={() => {
                savedRef.current = false
                // Re-shuffle for general quizzes
                if (isGeneral) {
                  const reshuffled = [...allQuizzes].sort(() => Math.random() - 0.5)
                  setAllQuizzes(reshuffled)
                  setQuizzes([]) // reset visible quizzes, user picks again
                }
                setPhase('intro'); setScore(0); setCurrent(0); setSelected(null); setSubmitted(false); setIsCorrect(false)
              }}
              onBack={() => isGeneral ? navigate('/quizzes') : navigate(`/lessons/${lessonId}`)}
            />
          )}

        </AnimatePresence>
      </main>

      {/* ── Image Lightbox ── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedImage(null)}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24, cursor: 'zoom-out'
            }}
          >
            <button
              onClick={() => setZoomedImage(null)}
              style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <XCircle size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={zoomedImage}
              alt="Zoomed"
              style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
