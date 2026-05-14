// src/pages/QuizPage.jsx
// Premium Unified Quiz Engine — Supports Lessons, General & Daily Quizzes
// Standardized on a single, high-performance architecture.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle2, XCircle, Trophy, RotateCcw, 
  ChevronRight, HelpCircle, Star, Clock, Target, Loader2, Coins, Flame, Play, Sparkles
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import MathRenderer from '../components/ui/MathRenderer'

// ── Constants ────────────────────────────────────────────────
const SECONDS_PER_QUESTION = 60

// ── Components ──────────────────────────────────────────────
function MinimalTimer({ seconds }) {
  const color = seconds <= 10 ? '#EF4444' : '#64748B'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, animation: seconds <= 10 ? 'pulse 1s infinite' : 'none' }} />
      <span style={{ fontWeight: 800, fontSize: '1rem', color, fontFamily: 'monospace', width: 22 }}>{seconds}</span>
      <style>{`@keyframes pulse{0%{opacity:1}50%{opacity:0.4}100%{opacity:1}}`}</style>
    </div>
  )
}

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
          style={{ position: 'absolute', left: '50%', bottom: '50%', width: 10, height: 10, borderRadius: 3, background: p.color }}
        />
      ))}
    </div>
  )
}

function OptionBtn({ opt, value, selected, submitted, correct, onClick }) {
  const isCorrect = submitted && opt === correct
  const isWrong = submitted && opt === selected && opt !== correct
  const controls = useAnimation()
  const hasShaken = useRef(false)

  useEffect(() => {
    if (isWrong && !hasShaken.current) {
      hasShaken.current = true
      controls.start({ x: [0, -10, 10, -8, 8, -4, 4, 0], transition: { duration: 0.45, ease: 'easeInOut' } })
    }
  }, [isWrong, controls])

  let bg = 'white', border = 'rgba(15,23,42,0.08)', color = '#1E293B', shadow = '0 2px 8px rgba(15,23,42,0.02)'

  if (submitted) {
    if (isCorrect) {
      bg = '#F0FDF4'; border = '#22C55E'; color = '#166534'; shadow = '0 4px 16px rgba(34,197,94,0.15)'
    } else if (isWrong) {
      bg = '#FEF2F2'; border = '#EF4444'; color = '#991B1B'; shadow = '0 4px 16px rgba(239,68,68,0.12)'
    }
  } else if (opt === selected) {
    border = '#3461FF'; bg = '#F5F7FF'; color = '#3461FF'; shadow = '0 8px 24px rgba(52,97,255,0.12)'
  }

  return (
    <motion.button
      animate={controls}
      initial={false}
      whileTap={submitted ? {} : { scale: 0.98 }}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: bg, border: `2px solid ${border}`,
        borderRadius: 20, padding: '20px 24px',
        cursor: submitted ? 'default' : 'pointer',
        textAlign: 'left', width: '100%',
        boxShadow: shadow, transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative', overflow: 'hidden', outline: 'none'
      }}
    >
      <span style={{
        width: 36, height: 36, borderRadius: 12, flexShrink: 0,
        background: isCorrect ? '#22C55E' : isWrong ? '#EF4444' : (opt === selected ? '#3461FF' : 'rgba(15,23,42,0.05)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 900, fontSize: '0.9375rem',
        color: isCorrect || isWrong || opt === selected ? 'white' : '#64748B',
        position: 'relative', zIndex: 1, transition: 'all 0.2s'
      }}>{opt.toUpperCase()}</span>
      <div style={{ flex: 1, fontWeight: 700, fontSize: '1.125rem', color, lineHeight: 1.5, position: 'relative', zIndex: 1 }}>
        <MathRenderer math={value} />
      </div>
      <AnimatePresence>
        {(isCorrect || isWrong) && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ position: 'relative', zIndex: 2 }}>
            {isCorrect ? <CheckCircle2 size={24} color="#22C55E" strokeWidth={3} /> : <XCircle size={24} color="#EF4444" strokeWidth={3} />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

function FeedbackBanner({ isCorrect }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', borderRadius: 20, marginBottom: 20,
          background: isCorrect ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${isCorrect ? '#22C55E' : '#EF4444'}`,
        }}
      >
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: isCorrect ? '#22C55E' : '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isCorrect ? <CheckCircle2 size={20} color="white" /> : <XCircle size={20} color="white" />}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 900, fontSize: '1rem', color: isCorrect ? '#166534' : '#991B1B' }}>
            {isCorrect ? 'Ajoyib! To\'g\'ri javob!' : 'Xato javob!'}
          </p>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: isCorrect ? '#10B981' : '#F87171', fontWeight: 600 }}>
            {isCorrect ? 'Bilimingizni oshirishda davom eting' : 'Keyingi savolga diqqat qiling'}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function ResultCard({ score, total, timeSpent, isDaily, onRetry, onBack, onAnalyze }) {
  const pct = Math.round((score / total) * 100)
  const mins = Math.floor(timeSpent / 60), secs = timeSpent % 60
  const gradeColor = pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
  const gradeText = pct >= 80 ? 'Ajoyib natija!' : pct >= 50 ? 'Yaxshi harakat!' : 'Yana urinib ko\'ring'
  const stars = pct >= 80 ? 3 : pct >= 50 ? 2 : 1

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} style={{ background: 'white', border: '1px solid rgba(15,23,42,0.08)', borderRadius: 40, padding: '56px 40px', textAlign: 'center', boxShadow: '0 32px 100px rgba(15,23,42,0.1)', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, background: gradeColor, opacity: 0.1, filter: 'blur(70px)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <motion.div key={i} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: i * 0.12 }}><Star size={i === 2 ? 64 : 48} color={i <= stars ? '#FCD34D' : '#E2E8F0'} fill={i <= stars ? '#FCD34D' : '#E2E8F0'} style={{ transform: i === 2 ? 'translateY(-12px)' : 'none', filter: i <= stars ? 'drop-shadow(0 8px 16px rgba(252,211,77,0.4))' : 'none' }} /></motion.div>
          ))}
        </div>

        {isDaily && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 8, 
              background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', 
              padding: '8px 20px', borderRadius: 100, marginBottom: 24,
              boxShadow: '0 8px 24px rgba(245,158,11,0.2)',
              border: '1px solid rgba(255,255,255,0.4)'
            }}
          >
            <Sparkles size={16} color="#92400E" fill="#92400E" />
            <span style={{ fontWeight: 900, fontSize: '0.9375rem', color: '#92400E' }}>+{score} XP YUTDINGIZ!</span>
          </motion.div>
        )}
        
        <h2 className="outfit-font" style={{ margin: '0 0 8px', fontSize: '4.5rem', fontWeight: 900, color: gradeColor, letterSpacing: '-0.05em', lineHeight: 1 }}>{pct}%</h2>
        <p style={{ margin: '0 0 8px', fontWeight: 900, fontSize: '1.5rem', color: '#0F172A' }}>{gradeText}</p>
        <p style={{ margin: '0 0 40px', color: '#64748B', fontSize: '1.125rem', fontWeight: 600 }}>{total} tadan <strong style={{ color: '#0F172A' }}>{score} ta</strong> to'g'ri javob</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
          <div style={{ padding: '24px', borderRadius: 28, background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.03)' }}><p style={{ margin: '0 0 4px', fontSize: '2.25rem', fontWeight: 900, color: '#0F172A' }}>{score}</p><p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>To'g'ri</p></div>
          <div style={{ padding: '24px', borderRadius: 28, background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.03)' }}><p style={{ margin: '0 0 4px', fontSize: '2.25rem', fontWeight: 900, color: '#0F172A' }}>{mins}:{String(secs).padStart(2, '0')}</p><p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Vaqt</p></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onAnalyze} style={{ padding: '18px', borderRadius: 22, background: '#EFF6FF', color: '#3461FF', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>Tahlilni Ko'rish</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onBack} style={{ padding: '18px', borderRadius: 22, background: '#1E293B', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Tayyor</motion.button>
        </div>
        {!isDaily && (
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onRetry} style={{ width: '100%', padding: '18px', borderRadius: 22, background: '#F1F5F9', color: '#475569', border: 'none', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>Qayta yechish</motion.button>
        )}
      </motion.div>
    </div>
  )
}

// ── Unified Quiz Page ──────────────────────────────────────
export default function QuizPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { lessonId } = useParams()
  const queryClient = useQueryClient()
  
  const isDaily = lessonId?.startsWith('daily-')
  const actualId = isDaily ? lessonId.replace('daily-', '') : lessonId
  const isGeneral = lessonId === 'general'

  const { data: quizData, isLoading: loading } = useQuery({
    queryKey: ['quiz', lessonId, actualId, isDaily],
    queryFn: async () => {
      if (isDaily) {
        const { data, error } = await supabase.from('daily_quizzes').select('*').eq('id', actualId).single()
        if (error) throw error
        if (!data.is_active) throw new Error("Ushbu test hozirda faol emas.")
        const { data: attempt } = await supabase.from('daily_quiz_attempts').select('*').eq('user_id', user.id).eq('daily_quiz_id', actualId).maybeSingle()
        return { lesson: { title: data.title }, quizzes: data.questions || [], isDaily: true, originalQuiz: data, existingAttempt: attempt }
      } else if (isGeneral) {
        const { data, error } = await supabase.from('quizzes').select('*').eq('is_general', true)
        if (error) throw error
        return { lesson: { title: 'Umumiy Test' }, allQuizzes: (data || []).sort(() => Math.random() - 0.5) }
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
    enabled: !!user,
  })

  const [quizzes, setQuizzes] = useState([])
  const [lesson, setLesson] = useState(null)
  const [allQuizzes, setAllQuizzes] = useState([])
  const [dailyAttempt, setDailyAttempt] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [userCoins, setUserCoins] = useState(0)

  useEffect(() => {
    if (quizData) {
      setLesson(quizData.lesson)
      if (isDaily) {
        setQuizzes(quizData.quizzes)
        setDailyAttempt(quizData.existingAttempt)
        if (quizData.existingAttempt?.completed_at) {
          setPhase('result'); setScore(quizData.existingAttempt.score); setTimeSpent(Math.floor((quizData.existingAttempt.time_taken_ms || quizData.existingAttempt.time_ms || 0) / 1000))
        }
      } else if (isGeneral) {
        setAllQuizzes(quizData.allQuizzes)
      } else {
        setQuizzes(quizData.quizzes)
      }
    }
  }, [quizData, isDaily, isGeneral])

  const [phase, setPhase] = useState('intro')
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(0)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [countChoice, setCountChoice] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION)
  const [timeSpent, setTimeSpent] = useState(0)
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const savedRef = useRef(false)

  const startDailyQuiz = async () => {
    const qData = quizData.originalQuiz
    if (!qData) return
    setIsSubmitting(true)
    try {
      if (qData.entry_fee_coins > 0) {
        const { data: profile } = await supabase.from('profiles').select('coins').eq('id', user.id).single()
        if ((profile?.coins || 0) < qData.entry_fee_coins) { toast.error("Coin yetarli emas!"); navigate('/quizzes'); return }
        const { data: success, error: rpcErr } = await supabase.rpc('pay_daily_quiz_fee', { p_user_id: user.id, p_fee: qData.entry_fee_coins })
        if (rpcErr || !success) throw new Error("To'lovda xatolik!")
      }
      const { data: newAttempt, error: iErr } = await supabase.from('daily_quiz_attempts').insert({ user_id: user.id, daily_quiz_id: actualId, total_questions: qData.questions.length }).select().single()
      if (iErr) {
        if (iErr.code === '23505') throw new Error("Siz ushbu testni allaqachon boshlagansiz!")
        throw iErr
      }
      setDailyAttempt(newAttempt); setShowPaymentModal(false); startTimeRef.current = Date.now(); setPhase('quiz'); toast.success("Vaqt ketdi! Omad!")
    } catch (err) { toast.error(err.message) } finally { setIsSubmitting(false) }
  }

  const saveAttempt = useCallback(async (finAnswers, finScore, spent, completed = true) => {
    if (savedRef.current || !user) return
    savedRef.current = true
    if (isDaily) {
      await supabase.rpc('finish_daily_quiz_attempt', { p_attempt_id: dailyAttempt.id, p_score: finScore, p_time_ms: spent * 1000 })
    } else {
      await supabase.from('quiz_attempts').insert({ user_id: user.id, lesson_id: lessonId, score: finScore, total: quizzes.length, time_spent_sec: spent, answers: finAnswers, completed })
    }
    // Real-time update for Hub, Dashboard, Profile and Leaderboard
    queryClient.invalidateQueries({ queryKey: ['quizzes-hub', user?.id] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-daily-quiz', user?.id] })
    queryClient.invalidateQueries({ queryKey: ['profile-stats', user?.id] })
    queryClient.invalidateQueries({ queryKey: ['leaderboard', 'rating'] })
    queryClient.invalidateQueries({ queryKey: ['leaderboard', 'streak'] })
    queryClient.invalidateQueries({ queryKey: ['leaderboard', 'daily'] })
  }, [user, lessonId, quizzes.length, isDaily, dailyAttempt, queryClient])

  const finishQuiz = useCallback((sc, ans) => {
    const spent = Math.floor((Date.now() - startTimeRef.current) / 1000)
    setTimeSpent(spent); saveAttempt(ans, sc, spent, true); setPhase('result')
  }, [saveAttempt])

  const nextStep = () => {
    if (current + 1 < quizzes.length) {
      setCurrent(c => c + 1); setSelected(null); setSubmitted(false); setIsCorrect(false); setShowParticles(false); setTimeLeft(SECONDS_PER_QUESTION)
    } else { finishQuiz(score, answers) }
  }

  useEffect(() => {
    if (phase !== 'quiz') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { nextStep(); return SECONDS_PER_QUESTION } return t - 1 })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase, current, quizzes.length])

  const handleConfirm = () => {
    if (!selected || submitted) return
    const q = quizzes[current]
    const correct = selected === q.correct_option
    const newScore = correct ? score + 1 : score
    const newAnswers = { ...answers, [q.id || current]: selected }
    setSubmitted(true); setIsCorrect(correct); setScore(newScore); setAnswers(newAnswers)
    if (correct) { setShowParticles(true); setTimeout(() => setShowParticles(false), 1000) }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={40} className="animate-spin" color="#3461FF" /></div>

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#1E293B', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: 'rgba(248,250,252,0.98)', zIndex: 10, borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
        <button onClick={() => navigate('/quizzes')} style={{ background: 'rgba(15,23,42,0.05)', border: 'none', color: '#1E293B', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><ArrowLeft size={20} /></button>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quiz Session</p>
          <h1 className="outfit-font" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 900, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson?.title}</h1>
        </div>
        {phase === 'quiz' && <MinimalTimer seconds={timeLeft} />}
      </header>

      <main style={{ flex: 1, padding: '24px 20px 60px', display: 'flex', flexDirection: 'column', maxWidth: 640, margin: '0 auto', width: '100%' }}>
        {phase === 'quiz' && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 900, color: '#64748B' }}>Savol {current + 1} / {quizzes.length}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 900, color: '#3461FF' }}>{Math.round(((current + 1) / quizzes.length) * 100)}%</span>
            </div>
            <div style={{ height: 8, background: '#E2E8F0', borderRadius: 100, overflow: 'hidden' }}><motion.div initial={false} animate={{ width: `${((current + 1) / quizzes.length) * 100}%` }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} style={{ height: '100%', background: 'linear-gradient(90deg, #3461FF, #8B5CF6)', borderRadius: 100 }} /></div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ width: 100, height: 100, borderRadius: 36, background: '#EFF6FF', color: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 28, boxShadow: '0 20px 40px rgba(52,97,255,0.1)' }}><HelpCircle size={48} strokeWidth={2.5} /></div>
              <h2 className="outfit-font" style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 16px', letterSpacing: '-0.02em' }}>Testga tayyormisiz?</h2>
              
              {isGeneral ? (
                <>
                  <p style={{ color: '#64748B', marginBottom: 32, fontSize: '1.0625rem', fontWeight: 500, lineHeight: 1.6 }}>Bazada <strong>{allQuizzes.length} ta</strong> tasodifiy savol bor. Nechta savolni yechishni istaysiz?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 36 }}>
                    {[10, 30, 60, allQuizzes.length].filter((v, i, arr) => arr.indexOf(v) === i).map(n => (
                      <motion.button key={n} whileTap={{ scale: 0.96 }} onClick={() => setCountChoice(n)} style={{ padding: '18px', borderRadius: 20, border: `2.3px solid ${countChoice === n ? '#3461FF' : '#E2E8F0'}`, background: countChoice === n ? '#F5F7FF' : 'white', color: countChoice === n ? '#3461FF' : '#64748B', fontWeight: 900, fontSize: '1.0625rem', cursor: 'pointer', transition: 'all 0.2s' }}>{n === allQuizzes.length ? `Hammasi (${n})` : `${n} ta`}</motion.button>
                    ))}
                  </div>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => { setQuizzes(allQuizzes.slice(0, countChoice)); startTimeRef.current = Date.now(); setPhase('quiz') }} style={{ width: '100%', padding: '20px', borderRadius: 24, background: '#1E293B', color: 'white', border: 'none', fontWeight: 900, fontSize: '1.125rem', cursor: 'pointer', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }}>Testni Boshlash</motion.button>
                </>
              ) : (
                <>
                  <p style={{ color: '#64748B', marginBottom: 40, fontSize: '1.0625rem', fontWeight: 500, lineHeight: 1.6 }}>
                    {isDaily ? `Bugun uchun maxsus ${quizzes.length} ta savol tayyorlangan.` : `Ushbu dars bo'yicha ${quizzes.length} ta savol tayyorlangan.`}
                    {isDaily && quizData.originalQuiz.entry_fee_coins > 0 && <><br/>Kirish narxi: {quizData.originalQuiz.entry_fee_coins} Coin</>}
                    <br/>Har bir savolga 60 soniyadan vaqt beriladi.
                  </p>
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} 
                    onClick={() => {
                      if (dailyAttempt) {
                        // Already started - just resume
                        startTimeRef.current = Date.now()
                        setPhase('quiz')
                      } else if (isDaily && quizData.originalQuiz.entry_fee_coins > 0) {
                        setShowPaymentModal(true)
                      } else if (isDaily) {
                        startDailyQuiz()
                      } else { 
                        startTimeRef.current = Date.now()
                        setPhase('quiz') 
                      }
                    }} 
                    style={{ width: '100%', padding: '20px', borderRadius: 24, background: '#1E293B', color: 'white', border: 'none', fontWeight: 900, fontSize: '1.125rem', cursor: 'pointer', boxShadow: '0 12px 30px rgba(15,23,42,0.15)' }}>
                    {dailyAttempt ? 'Davom ettirish' : 'Boshladik'}
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div key={current} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', damping: 25 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {quizzes[current].image_url && (
                <motion.button whileTap={{ scale: 0.99 }} onClick={() => setZoomedImage(quizzes[current].image_url)} style={{ width: '100%', marginBottom: 28, borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(15,23,42,0.06)', background: 'white', cursor: 'pointer', outline: 'none' }}>
                  <img src={quizzes[current].image_url} alt="Diagram" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </motion.button>
              )}
              <div className="outfit-font" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, marginBottom: 32, letterSpacing: '-0.01em' }}>
                <MathRenderer math={quizzes[current].question || quizzes[current].text} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                {['a', 'b', 'c', 'd'].filter(o => quizzes[current][`option_${o}`]).map(opt => (
                  <OptionBtn key={opt} opt={opt} value={quizzes[current][`option_${opt}`]} selected={selected} submitted={submitted} correct={quizzes[current].correct_option} onClick={() => !submitted && setSelected(opt)} />
                ))}
              </div>
              {submitted && <FeedbackBanner isCorrect={isCorrect} />}
              {submitted && quizzes[current].explanation && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '20px', borderRadius: 20, background: '#F8FAFC', border: '1px solid rgba(15,23,42,0.06)', marginBottom: 20, fontSize: '0.9375rem', color: '#475569', lineHeight: 1.6 }}><strong style={{ color: '#0F172A', fontWeight: 800 }}>Tushuntirish:</strong><br/>{quizzes[current].explanation}</motion.div>}
              <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                {!submitted ? (
                  <motion.button whileTap={selected ? { scale: 0.98 } : {}} disabled={!selected} onClick={handleConfirm} style={{ width: '100%', padding: '20px', borderRadius: 24, background: selected ? '#1E293B' : '#E2E8F0', color: selected ? 'white' : '#94A3B8', border: 'none', fontWeight: 900, fontSize: '1.125rem', cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}>Tekshirish</motion.button>
                ) : (
                  <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }} onClick={nextStep} style={{ width: '100%', padding: '20px', borderRadius: 24, background: '#3461FF', color: 'white', border: 'none', fontWeight: 900, fontSize: '1.125rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 12px 30px rgba(52,97,255,0.3)' }}>{current + 1 < quizzes.length ? 'Keyingi savol' : 'Natijani ko\'rish'} <ChevronRight size={22} strokeWidth={2.5} /></motion.button>
                )}
              </div>
            </motion.div>
          )}

          {phase === 'result' && (
            <ResultCard score={score} total={quizzes.length} timeSpent={timeSpent} isDaily={isDaily} onAnalyze={() => setPhase('analysis')} onRetry={() => { savedRef.current = false; setPhase('intro'); setScore(0); setCurrent(0); setSelected(null); setSubmitted(false) }} onBack={() => navigate('/leaderboard')} />
          )}

          {phase === 'analysis' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}><h2 className="outfit-font" style={{ fontWeight: 900, fontSize: '1.75rem', margin: 0 }}>Test Tahlili</h2><button onClick={() => setPhase('result')} style={{ background: '#F1F5F9', border: 'none', padding: '12px 20px', borderRadius: 14, fontWeight: 800, color: '#475569', cursor: 'pointer' }}>Orqaga</button></div>
              {quizzes.map((q, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 28, padding: '28px', marginBottom: 24, border: '1px solid rgba(15,23,42,0.06)', boxShadow: '0 12px 32px rgba(15,23,42,0.03)' }}>
                  <div className="outfit-font" style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 20, color: '#0F172A', display: 'flex', gap: 8 }}>
                    <span>{i+1}.</span> <MathRenderer math={q.question || q.text} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {['a', 'b', 'c', 'd'].filter(o => q[`option_${o}`]).map(opt => {
                      const isCorrect = q.correct_option === opt
                      const isUser = answers[q.id || i] === opt
                      return (
                        <div key={opt} style={{ padding: '16px 20px', borderRadius: 16, background: isCorrect ? '#F0FDF4' : (isUser ? '#FEF2F2' : '#F8FAFC'), border: `2px solid ${isCorrect ? '#22C55E' : (isUser ? '#EF4444' : 'rgba(15,23,42,0.04)')}`, color: isCorrect ? '#166534' : (isUser ? '#991B1B' : '#475569'), fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: isCorrect ? '#22C55E' : (isUser ? '#EF4444' : 'rgba(0,0,0,0.05)'), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8125rem', fontWeight: 900, flexShrink: 0 }}>{opt.toUpperCase()}</div>
                          <div style={{ flex: 1 }}><MathRenderer math={q[`option_${opt}`]} /></div>
                        </div>
                      )
                    })}
                  </div>
                  {q.explanation && <div style={{ marginTop: 24, padding: '16px', borderRadius: 16, background: '#F0F9FF', border: '1px solid rgba(52,97,255,0.1)', fontSize: '0.9375rem', color: '#1E40AF' }}><strong>Tushuntirish:</strong><br/>{q.explanation}</div>}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showPaymentModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', padding: 40, borderRadius: 40, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}>
              <div style={{ width: 80, height: 80, borderRadius: 32, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><Coins size={40} color="#F59E0B" /></div>
              <h3 className="outfit-font" style={{ margin: '0 0 12px', fontWeight: 900, fontSize: '1.5rem' }}>Premium Test</h3>
              <p style={{ color: '#64748B', marginBottom: 32, fontSize: '1rem', lineHeight: 1.6 }}>Ushbu kunlik testga kirish uchun balansingizdan <strong>{quizData.originalQuiz.entry_fee_coins} Coin</strong> yechiladi.</p>
              <div style={{ display: 'flex', gap: 14 }}>
                <button onClick={() => setShowPaymentModal(false)} style={{ flex: 1, padding: '18px', borderRadius: 22, background: '#F1F5F9', border: 'none', fontWeight: 800, color: '#475569', cursor: 'pointer' }}>Bekor qilish</button>
                <button onClick={startDailyQuiz} disabled={isSubmitting} style={{ flex: 2, padding: '18px', borderRadius: 22, background: '#F59E0B', color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 8px 20px rgba(245,158,11,0.3)' }}>{isSubmitting ? 'To\'lanmoqda...' : 'To\'lash va Boshlash'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zoomedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setZoomedImage(null)} style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={zoomedImage} alt="Zoomed" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
