// src/pages/DashboardPage.jsx
// Auth zone home: kurslar ro'yxati + darslar accordion + coin balansi.
// "CoursesPage" va "CourseDetailPage" endi bu yerga integratsiya qilingan.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { supabase } from '../lib/supabase'
import { Coins, Lock, Play, ChevronDown, BookOpen, CheckCircle2, Flame, Search, AlertCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────

function CoinBadge({ coins }) {
  return (
    <Link to="/shop" style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
        color: 'white', padding: '6px 14px', borderRadius: 100,
        fontWeight: 700, fontSize: '0.9375rem',
        boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
        cursor: 'pointer',
      }}>
        <Coins size={16} />
        <span>{coins ?? 0}</span>
      </div>
    </Link>
  )
}

function LessonRow({ lesson, userCoins, onNavigate }) {
  const isLocked = !lesson.is_free && (userCoins < (lesson.price || 0))
  const canAccess = lesson.is_free || !isLocked

  const handleClick = () => {
    if (canAccess) {
      onNavigate(`/lessons/${lesson.id}`)
    } else {
      onNavigate('/shop')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 14,
        background: canAccess ? 'white' : 'rgba(255,255,255,0.6)',
        border: '1.5px solid rgba(100,120,255,0.08)',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
      }}
      whileHover={{ y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Play / Lock icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: canAccess ? 'rgba(52,97,255,0.08)' : 'rgba(100,116,139,0.08)',
      }}>
        {canAccess
          ? <Play size={18} color="#3461FF" fill="#3461FF" />
          : <Lock size={18} color="#94A3B8" />
        }
      </div>

      {/* Title & meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: 0, fontWeight: 600,
          fontSize: '0.9375rem', lineHeight: 1.35,
          color: canAccess ? '#0F172A' : '#94A3B8',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          #{lesson.order_index} {lesson.title}
        </p>
        {!lesson.is_free && (
          <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: canAccess ? '#10B981' : '#EF4444', fontWeight: 700 }}>
            {canAccess ? 'Ochilgan' : `${lesson.price} coin kerak`}
          </p>
        )}
        {lesson.is_free && (
          <p style={{ margin: '3px 0 0', fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>Bepul</p>
        )}
      </div>

      {/* Right badge */}
      {!canAccess && (
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(245,158,11,0.1)', color: '#D97706',
          padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
        }}>
          <Coins size={12} /> {lesson.price}
        </div>
      )}
    </motion.div>
  )
}

function CourseCard({ course, userCoins, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [lessons, setLessons] = useState([])
  const [lessonLoading, setLessonLoading] = useState(false)

  const fetchLessons = async () => {
    if (lessons.length > 0) { setIsOpen(v => !v); return }
    setLessonLoading(true)
    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', course.id)
      .eq('is_published', true)
      .order('order_index', { ascending: true })
    setLessons(data || [])
    setLessonLoading(false)
    setIsOpen(true)
  }

  const toggle = () => {
    if (isOpen) setIsOpen(false)
    else fetchLessons()
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      border: '1.5px solid rgba(100,120,255,0.1)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      overflow: 'hidden',
    }}>
      {/* Course header — tap to expand */}
      <button
        onClick={toggle}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '20px', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: 'rgba(52,97,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={22} color="#3461FF" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              margin: 0, fontWeight: 800, fontSize: '1.0625rem',
              color: '#0F172A', letterSpacing: '-0.02em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {course.title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
              {course.lesson_count} dars
            </p>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ flexShrink: 0, color: '#94A3B8' }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </div>

        {course.description && (
          <p style={{ margin: '12px 0 0', fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55, textAlign: 'left' }}>
            {course.description}
          </p>
        )}
      </button>

      {/* Lessons accordion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 16px 16px',
              borderTop: '1px solid rgba(100,120,255,0.06)',
              display: 'flex', flexDirection: 'column', gap: 8,
              paddingTop: 12,
            }}>
              {lessonLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '0.875rem' }}>
                  Darslar yuklanmoqda...
                </div>
              ) : lessons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '0.875rem' }}>
                  Hozircha darslar yo'q
                </div>
              ) : lessons.map(lesson => (
                <LessonRow key={lesson.id} lesson={lesson} userCoins={userCoins} onNavigate={onNavigate} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { isTelegram } = useTelegram()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
      setCourses(data || [])
      setLoading(false)
    }
    fetchCourses()
  }, [])

  const coins = profile?.coins ?? 0
  const name = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'O\'quvchi'
  const firstName = name.split(' ')[0]
  const streak = profile?.streak_count ?? 0

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px 32px' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
              Salom, {firstName}! 👋
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#64748B' }}>
              Bugun nima o'rganamiz?
            </p>
          </div>
          <CoinBadge coins={coins} />
        </div>

        {/* Streak mini-banner */}
        {streak > 0 && (
          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 12, padding: '10px 14px',
          }}>
            <Flame size={18} color="#F59E0B" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#92400E' }}>
              {streak} kunlik streak davom etmoqda! Bugun ham o'rganing.
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Search ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'white', border: '1.5px solid rgba(100,120,255,0.12)',
          borderRadius: 14, padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          <Search size={18} color="#94A3B8" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Kurs qidirish..."
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '0.9375rem', color: '#0F172A', fontFamily: 'inherit',
            }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, fontSize: 18, lineHeight: 1 }}>×</button>
          )}
        </div>
      </motion.div>

      {/* ── Courses ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? (
          // Skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{
              height: 96, borderRadius: 20, background: 'white',
              border: '1.5px solid rgba(100,120,255,0.08)',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <AlertCircle size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              {searchTerm ? `"${searchTerm}" bo'yicha kurs topilmadi.` : "Hozircha kurslar mavjud emas."}
            </p>
          </div>
        ) : filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <CourseCard course={course} userCoins={coins} onNavigate={navigate} />
          </motion.div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
