// src/pages/LessonDetailPage.jsx
// Mobile-first: Video + Dars info + Quiz bloki.
// Qulfli bo'lsa: Coin sarflab ochish yoki Shop-ga yo'naltirish.

import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lock, Coins, CheckCircle2, Trophy, ClipboardList, ChevronRight, FileText, Download, Info, MessageCircle, Target, Paperclip, BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
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
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'comments' | 'quiz'
  const [isUnlocking, setIsUnlocking] = useState(false)

  const { data: playlist = [], isLoading: playlistLoading } = useQuery({
    queryKey: ['playlist', lesson?.course_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, order_index, is_free, price')
        .eq('course_id', lesson.course_id)
        .eq('is_published', true)
        .order('order_index', { ascending: true })
      if (error) throw error
      return data || []
    },
    enabled: !!lesson?.course_id
  })

  const { canWatch, loading: accessLoading, unlockWithCoins } = useAccess(lesson)
  const { quizzes } = useQuizzes(canWatch ? lessonId : null)
  
  const { data: bestScore = null } = useQuery({
    queryKey: ['bestScore', lessonId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('score, total')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('score', { ascending: false })
        .limit(1)
      if (error) throw error
      return data && data.length > 0 ? data[0] : null
    },
    enabled: !!user && !!canWatch
  })

  if (loading || accessLoading) {
    return (
      <div style={{ padding: '24px 16px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ height: 38, width: 200, borderRadius: 100, background: '#FFFFFF', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(241,245,249,0.8) 50%, transparent 100%)', animation: 'shimmer 1.5s infinite linear' }} />
        </div>
        <div className="lesson-grid" style={{ gap: 24 }}>
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
    
    setIsUnlocking(true)
    const { success, error } = await unlockWithCoins()
    setIsUnlocking(false)
    
    if (success) {
      toast.success("Dars muvaffaqiyatli ochildi!")
      if (setProfile) setProfile(prev => ({ ...prev, coins: prev.coins - unlockCost }))
    } else {
      toast.error("Xatolik: " + error)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingBottom: 100 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>

        {/* ── Navigator (Pill) ── */}
        <div style={{ display: 'flex', marginBottom: 24 }}>
          <motion.div
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'white',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              padding: '6px 6px 6px 12px', borderRadius: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 600 }}>Kurs:</span>
            <button
              onClick={() => navigate(`/courses/${lesson.course_id}`)}
              style={{
                background: 'rgba(0,0,0,0.04)', border: 'none',
                color: '#0F172A', fontWeight: 800, fontSize: '0.8125rem',
                padding: '8px 16px', borderRadius: 100,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              Orqaga qaytish
            </button>
          </motion.div>
        </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Main Grid: Video + Playlist */}
        <div className="lesson-grid" style={{ alignItems: 'start' }}>
          
          {/* Left Column: Video & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ borderRadius: 32, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.05)' }}>
              {canWatch ? (
                <VideoPlayer videoId={lesson.youtube_video_id} lessonId={lesson.id} lessonTitle={lesson.title} />
              ) : (
                <LockScreen lesson={lesson} profile={profile} onUnlock={handleUnlock} onShop={() => navigate('/shop')} isUnlocking={isUnlocking} />
              )}
            </div>

            {/* Tab Bar */}
            <div style={{ 
              display: 'flex',
              overflowX: 'auto',
              background: '#F1F5F9', 
              borderRadius: 24, padding: 4, 
              border: '1px solid rgba(0,0,0,0.05)',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {[
                { id: 'info',      label: "Ma'lumot",    icon: <Info size={15} strokeWidth={2.5} /> },
                { id: 'materials', label: 'Materiallar', icon: <Paperclip size={15} strokeWidth={2.5} /> },
                { id: 'quiz',      label: 'Quiz',        icon: <Target size={15} strokeWidth={2.5} /> },
                { id: 'comments',  label: 'Izohlar',     icon: <MessageCircle size={15} strokeWidth={2.5} /> }
              ].map((tab) => {
                const isActive = activeTab === tab.id
                // Logic based hiding
                if (tab.id === 'quiz' && (!canWatch || quizzes.length === 0)) return null
                if (tab.id === 'materials' && (!canWatch || !lesson.materials || lesson.materials.length === 0)) return null

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: '1 0 auto',
                      padding: '10px 16px', borderRadius: 20, border: 'none',
                      background: isActive ? 'white' : 'transparent',
                      color: isActive ? '#3461FF' : '#64748B',
                      fontWeight: 800, fontSize: '0.8125rem',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                      cursor: 'pointer', transition: 'all 0.2s',
                      WebkitTapHighlightColor: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 6, whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.6, transition: 'opacity 0.2s' }}>{tab.icon}</span>
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
                    background: 'white', 
                    borderRadius: 24, padding: '24px',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 800, letterSpacing: '0.06em',
                        color: lesson.is_free ? '#10B981' : '#3461FF',
                        background: lesson.is_free ? 'rgba(16,185,129,0.08)' : 'rgba(52,97,255,0.08)',
                        padding: '4px 12px', borderRadius: 100
                      }}>
                        {lesson.is_free ? 'BEPUL' : `${lesson.coin_price ?? 5} COIN`}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>DARS #{lesson.order_index}</span>
                    </div>
                    <h1 className="outfit-font" style={{ 
                      margin: '0 0 16px', fontSize: 'clamp(1.5rem, 5vw, 2.125rem)', fontWeight: 900, color: '#0F172A', 
                      letterSpacing: '-0.03em', lineHeight: 1.15, wordBreak: 'break-word', overflowWrap: 'anywhere' 
                    }}>
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

                {activeTab === 'materials' && canWatch && lesson.materials?.length > 0 && (
                  <div style={{ 
                    background: 'white', 
                    borderRadius: 24, padding: '24px',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <h2 className="outfit-font" style={{ margin: '0 0 20px', fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 900, color: '#0F172A' }}>
                      Yuklab olish uchun fayllar
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {lesson.materials.map((mat, i) => (
                        <a 
                          key={i} 
                          href={mat.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: '#F8FAFC', 
                            padding: 'clamp(14px, 3vw, 18px)', 
                            borderRadius: 20, border: '1px solid rgba(0,0,0,0.04)',
                            textDecoration: 'none', color: 'inherit',
                            transition: 'all 0.2s ease',
                            minWidth: 0,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.transform = 'none' }}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3461FF', flexShrink: 0 }}>
                            <FileText size={20} strokeWidth={2.5} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ margin: '0 0 2px', fontSize: 'clamp(0.875rem, 3.5vw, 1rem)', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {mat.title}
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Dars materiali</p>
                          </div>
                          <div style={{ width: 36, height: 36, background: 'white', color: '#475569', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(0,0,0,0.05)' }}>
                            <Download size={16} strokeWidth={2.5} />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Playlist Sidebar */}
          <aside className="lesson-sidebar" style={{ 
            background: 'white', 
            borderRadius: 24, padding: 20,
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <h3 className="outfit-font" style={{ margin: '0 0 20px', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A' }}>
              Darslar ro'yxati
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {playlistLoading ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Yuklanmoqda...</p>
              ) : playlist.map((item) => {
                const isActive = item.id === lessonId
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/lessons/${item.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', maxWidth: '100%', padding: '12px', borderRadius: 16, border: 'none',
                      background: isActive ? 'rgba(52,97,255,0.08)' : 'transparent',
                      color: isActive ? '#3461FF' : '#475569',
                      cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left',
                    }}
                  >
                    <div style={{ 
                      width: 28, height: 28, borderRadius: 8, 
                      background: isActive ? '#3461FF' : 'rgba(0,0,0,0.05)',
                      color: isActive ? 'white' : '#94A3B8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                    }}>
                      {item.order_index}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 800 : 700, flex: 1, wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
                      {item.title}
                    </span>
                    {!item.is_free && !isActive && <Lock size={14} style={{ opacity: 0.4 }} />}
                  </button>
                )
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
)
}

// ── Lock Screen ──────────────────────────────────────
function LockScreen({ lesson, profile, onUnlock, onShop, isUnlocking }) {
  const unlockCost = lesson.coin_price ?? 5
  const hasEnough = profile && profile.coins >= unlockCost
  const thumbnailUrl = lesson.youtube_video_id ? `https://img.youtube.com/vi/${lesson.youtube_video_id}/hqdefault.jpg` : ''

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16/9',
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      padding: 'clamp(12px, 3vw, 24px)'
    }}>
      {/* Background Image with Blur */}
      {thumbnailUrl && (
        <div style={{
          position: 'absolute', inset: -20,
          backgroundImage: `url(${thumbnailUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.6) saturate(1.2)',
          zIndex: 1
        }} />
      )}
      
      {/* Subtle Dark Overlay to ensure readability */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(15,23,42,0.6), rgba(15,23,42,0.3))',
        zIndex: 2
      }} />

      {/* Glassmorphic Card Content (Ultra Compact) */}
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          borderRadius: 16, 
          padding: '12px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          gap: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)', 
          width: 'min(90%, 260px)', textAlign: 'center'
        }}
      >
        <div style={{ 
          width: 32, height: 32, borderRadius: '50%', 
          background: 'rgba(52, 97, 255, 0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Lock size={14} color="#3461FF" />
        </div>

        <div>
           <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 4, 
            background: 'rgba(245, 158, 11, 0.1)', color: '#D97706',
            padding: '4px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800,
            textTransform: 'uppercase', marginBottom: 2
          }}>
            <Coins size={12} fill="currentColor" /> {unlockCost} COIN
          </div>
        </div>

        <div style={{ width: '100%' }}>
          {hasEnough ? (
            <motion.button 
              whileTap={{ scale: 0.97 }}
              disabled={isUnlocking}
              onClick={onUnlock} 
              style={{
                width: '100%', background: '#3461FF', color: 'white',
                border: 'none', borderRadius: 10, 
                padding: '8px 12px', fontWeight: 700,
                fontSize: '0.8125rem', cursor: isUnlocking ? 'wait' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {isUnlocking ? 'Ochilmoqda...' : `Ochish`}
            </motion.button>
          ) : (
            <motion.button 
              whileTap={{ scale: 0.97 }}
              onClick={onShop} 
              style={{
                width: '100%', background: '#F59E0B', color: 'white',
                border: 'none', borderRadius: 10, 
                padding: '8px 12px', fontWeight: 700,
                fontSize: '0.8125rem', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              Do'konga o'tish
            </motion.button>
          )}
        </div>

        {profile && (
          <div style={{ 
            fontSize: '0.625rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: 3,
            color: hasEnough ? '#10B981' : '#EF4444' 
          }}>
            <span style={{ color: '#94A3B8' }}>Balansingiz:</span> 
            <span style={{ color: '#0F172A', display: 'flex', alignItems: 'center', gap: 2 }}>
              {profile.coins} <Coins size={8} fill="currentColor" />
            </span>
          </div>
        )}
      </motion.div>
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
        background: 'white', 
        borderRadius: 32, padding: 'clamp(24px, 6vw, 32px)',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 10px 40px rgba(15,23,42,0.04)',
        position: 'relative', overflow: 'hidden',
        maxWidth: 600
      }}
    >
      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(52,97,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: 56, height: 56, borderRadius: 18, 
          background: 'rgba(52,97,255,0.08)', color: '#3461FF', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 8px 20px rgba(52,97,255,0.1)',
          border: '1px solid rgba(52,97,255,0.1)'
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
          background: '#F8FAFC', 
          borderRadius: 20, padding: '16px 20px', marginBottom: 28,
          border: '1px solid rgba(0,0,0,0.04)',
          position: 'relative', zIndex: 1
        }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: '50%', 
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.03)'
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
          background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)', 
          color: 'white', fontWeight: 800, fontSize: '1rem',
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 8px 24px rgba(29,78,216,0.25)',
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
