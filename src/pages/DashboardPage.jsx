// src/pages/DashboardPage.jsx
// Auth zone home: kurslar ro'yxati + darslar accordion + coin balansi.
// "CoursesPage" va "CourseDetailPage" endi bu yerga integratsiya qilingan.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import { Coins, Lock, Play, ChevronDown, BookOpen, CheckCircle2, Flame, Search, AlertCircle, MessageCircle, ArrowRight, Gift, Bell, X, Target, Info, Sparkles, GraduationCap, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useUnreadNotifications } from '../context/useUnreadNotifications'
import { useStreak } from '../hooks/useStreak'

// ─────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────




function CourseCard({ course, index, onNavigate }) {
  const { user } = useAuth()
  const glowClass = '' // Standardized look for all cards as requested

  const [commentCount, setCommentCount] = useState(0)
  const [commentAvatars, setCommentAvatars] = useState([])
  const [progressPct, setProgressPct] = useState(0)

  useEffect(() => {
    async function fetchCourseStats() {
      // Fetch comment count and latest 3 avatars
      const { data: commentsData, count: cCount } = await supabase
        .from('comments')
        .select('id, profiles(avatar_url)', { count: 'exact' })
        .eq('course_id', course.id)
        .order('created_at', { ascending: false })
        .limit(3)

      if (cCount !== null) setCommentCount(cCount)
      if (commentsData) {
        setCommentAvatars(commentsData.map(c => c.profiles?.avatar_url).filter(Boolean))
      }

      // Fetch Progress
      if (user) {
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', course.id)
          .eq('is_published', true)

        if (lessonsData && lessonsData.length > 0) {
          const lessonIds = lessonsData.map(l => l.id)
          const { count: pCount } = await supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .in('lesson_id', lessonIds)
            .eq('user_id', user.id)
            .eq('is_completed', true)

          if (pCount) {
            const pct = Math.round((pCount / lessonIds.length) * 100)
            setProgressPct(pct > 100 ? 100 : pct)
          }
        }
      }
    }
    fetchCourseStats()
  }, [course.id, user])

  return (
    <motion.button
      className={`glass-card-premium card-glow-hover ${glowClass}`}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onNavigate(`/courses/${course.id}`)}
      style={{
        position: 'relative', width: '100%', height: '100%',
        cursor: 'pointer',
        padding: '16px', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
        display: 'flex', flexDirection: 'column', gap: 12,
        overflow: 'hidden'
      }}
    >
      {/* Absolute Large Background Sticker */}
      <div style={{
        position: 'absolute', top: -20, right: -20, opacity: 0.03,
        transform: 'rotate(15deg)', pointerEvents: 'none', zIndex: 0
      }}>
        <BookOpen size={180} />
      </div>

      {/* Top icon and title side-by-side */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(52, 97, 255, 0.08)', border: '1px solid rgba(52, 97, 255, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            {course.icon_url ? (
              <img src={course.icon_url} alt="" loading="lazy" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            ) : (
              <BookOpen size={20} color="#3461FF" />
            )}
          </div>
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="outfit-font" style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {course.title}
            </h3>
          </div>
        </div>
        
        {course.description && (
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.8rem', lineHeight: 1.5, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.description}
          </p>
        )}
      </div>

      {/* Bottom actions (Left: comments, Right: Progress Arrow) */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Rounded Separator Line */}
        <div style={{ height: 2, width: '100%', background: 'rgba(255, 255, 255, 0.47)', borderRadius: 100, marginBottom: 16 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
            <MessageCircle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{commentCount} izoh</span>

            {commentAvatars.length > 0 && (
              <div style={{ display: 'flex', marginLeft: 4 }}>
                {commentAvatars.map((url, i) => (
                  <img key={i} src={url} alt="avatar" loading="lazy" style={{
                    width: 20, height: 20, borderRadius: '50%',
                    border: '2px solid white', marginLeft: i > 0 ? -8 : 0,
                    objectFit: 'cover'
                  }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3461FF', borderRadius: '50%', boxShadow: '0 4px 12px rgba(52,97,255,0.2)' }}>
            <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
              <circle cx="19" cy="19" r="17" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
              <circle cx="19" cy="19" r="17" fill="none" stroke="white" strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 17 * (progressPct / 100)} ${2 * Math.PI * 17}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <ArrowRight size={18} color="white" />
          </div>
        </div>
      </div>
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────
// Main Dashboard Page
// ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile, setProfile } = useAuth()
  const { isTelegram } = useTelegram()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { canClaim, claimDailyReward } = useStreak()
  const [dbNotifications, setDbNotifications] = useState([])
  const unreadCount = useUnreadNotifications()

  // Use React Query for courses
  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data || []
    }
  })

  // Fetch Daily Quiz for banner
  const { data: dailyData } = useQuery({
    queryKey: ['dashboard-daily-quiz', user?.id],
    queryFn: async () => {
      const d = new Date()
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const { data: qData, error: qErr } = await supabase.from('daily_quizzes').select('*').eq('is_active', true).order('quiz_date', { ascending: false }).limit(1)
      const quiz = qData?.[0] || null
      let attempt = null;
      if (user && quiz) {
        const { data: attData } = await supabase.from('daily_quiz_attempts').select('id, score, total_questions').eq('user_id', user.id).eq('daily_quiz_id', quiz.id).limit(1)
        attempt = attData?.[0] || null
      }
      return { quiz, attempt }
    },
    staleTime: 0
  })

  useEffect(() => {
    if (isNotificationsOpen && user?.id) {
      supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6)
        .then(({ data }) => {
          setDbNotifications(data || [])
          if (data?.some(n => !n.is_read)) {
            supabase.rpc('mark_notifications_read').then(() => {
              window.dispatchEvent(new CustomEvent('bma:new-notification'))
            })
          }
        })
    }
  }, [isNotificationsOpen, user?.id])


  const handleClaimReward = async () => {
    await claimDailyReward()
  }

  const coins = profile?.coins ?? 0
  const xp = profile?.rating_score ?? 0
  const name = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'O\'quvchi'
  const firstName = name.split(' ')[0]
  const streak = profile?.streak_count ?? 0

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <style>{`
        .dash-page-wrapper { width: 100%; padding-bottom: 60px; }
        .dash-container { max-width: 1040px; margin: 0 auto; position: relative; z-index: 20; }
        .dash-hero {
          background: linear-gradient(135deg, #0F172A 0%, #262364ff 25%, #3c2f52ff 55%, #153283ff 80%, #025886ff 100%);
          position: relative; z-index: 10;
          padding: 28px 0 80px;
          border-radius: 0 0 24px 24px;
          margin-bottom: -48px;
          box-shadow: 0 15px 30px rgba(13,13,43,0.2);
        }
        .dash-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.08); }
        .dash-topbar-left { display:flex; align-items:center; gap:10px; }
        .dash-topbar-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
        .dash-avatar-ring {
          width:44px; height:44px; border-radius:50%; background:white;
          flex-shrink:0; padding:2.5px; position:relative;
          box-shadow: 0 3px 12px rgba(15,23,42,0.2);
          display:flex; align-items:center; justify-content:center;
        }
        .dash-avatar-inner {
          width:100%; height:100%; border-radius:50%; overflow:hidden;
          background:#F1F5F9; display:flex; align-items:center;
          justify-content:center; color:#3461FF; font-weight:800; font-size:1.125rem;
        }
        .dash-greeting p { margin:0; font-size:0.8125rem; font-weight:700; color:rgba(255,255,255,0.6); }
        .dash-greeting h2 { margin:0; font-size:1.375rem; font-weight:900; color:white; letter-spacing:-0.03em; line-height:1; }
        .dash-stats-pill {
          display:inline-flex; align-items:center;
          background:rgba(255,255,255,0.95); border:1px solid rgba(255,255,255,0.8);
          border-radius:100px; padding:3px; gap:3px;
          backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
        }
        .dash-stat-chip {
          display:flex; align-items:center; gap:5px;
          padding:4px 10px; border-radius:100px;
          font-size:0.8125rem; font-weight:800; color:white;
          text-decoration:none; white-space:nowrap;
        }
        .dash-stat-xp  { background:linear-gradient(135deg,#3461FF,#254EDC); box-shadow:0 3px 10px rgba(52,97,255,0.4); }
        .dash-stat-coin{ background:linear-gradient(135deg,#F59E0B,#D97706); box-shadow:0 3px 10px rgba(245,158,11,0.4); }
        .dash-bell {
          width:38px; height:38px; border-radius:50%; position:relative;
          background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; -webkit-tap-highlight-color:transparent;
        }
        .dash-section-bar { display:flex; align-items:center; justify-content:space-between; position:relative; height:44px; margin-bottom:20px; }
        .dash-section-title { margin:0; font-weight:900; color:white; letter-spacing:-0.04em; line-height:1.05; font-size:clamp(1.75rem,5vw,2.5rem); }
        .dash-quick-row { display:flex; gap:8px; margin-top:14px; overflow-x:auto; padding-bottom:2px; -webkit-overflow-scrolling:touch; }
        .dash-quick-row::-webkit-scrollbar { display:none; }
        .dash-quick-chip {
          display:inline-flex; align-items:center; gap:6px; flex-shrink:0;
          background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2);
          border-radius:100px; padding:6px 12px 6px 8px;
          cursor:pointer; color:white; white-space:nowrap;
        }
        @media (max-width: 640px) {
          .dash-hero { padding:14px 0 60px; border-radius:0 0 18px 18px; margin-bottom:-32px; }
          .dash-topbar { margin-bottom:16px; padding-bottom:16px; }
          .dash-avatar-ring { width:36px; height:36px; padding:2px; }
          .dash-avatar-inner { font-size:1rem; }
          .dash-greeting h2 { font-size:1rem; }
          .dash-stat-chip { padding:3px 7px; font-size:0.625rem; gap:3px; }
          .dash-stats-pill { padding:2px; gap:2px; }
          .dash-bell { width:32px; height:32px; }
          .dash-quick-chip { padding:5px 10px 5px 8px; font-size:0.75rem; }
        }
        .dash-content { padding:0 20px; }
        @media (max-width: 768px) { .dash-content { padding:0 14px; } }
      `}</style>

      <div className="dash-page-wrapper">
        {/* ── FULL WIDTH MESH HERO ── */}
        <div className="dash-hero">
          {/* Clipped background glow layer — separate from content so notification panel can overflow */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '0 0 24px 24px', zIndex: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: -80, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)' }} />
            <div style={{ position: 'absolute', bottom: -60, left: -80, width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 65%)' }} />
            <div style={{ position: 'absolute', top: '30%', right: '20%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 65%)' }} />

            {/* Floating Icons (Matching pattern: One icon type per page) */}
            {[
              { top: '15%', right: '10%', size: 48, delay: 0 },
              { top: '65%', right: '25%', size: 28, delay: 0.4 },
              { top: '25%', left: '8%', size: 36, delay: 0.2 },
              { bottom: '20%', left: '20%', size: 22, delay: 0.6 },
            ].map((c, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4 + i * 0.5, delay: c.delay, ease: 'easeInOut' }}
                style={{ position: 'absolute', opacity: 0.12, pointerEvents: 'none', ...c }}
              >
                <BookOpen size={c.size} color="white" />
              </motion.div>
            ))}
          </div>

          <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

            {/* ── Topbar ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <AnimatePresence>
                {!isSearchOpen && (
                  <motion.div
                    className="dash-topbar"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    {/* LEFT */}
                    <div className="dash-topbar-left">
                      <Link to="/profile" style={{ textDecoration: 'none' }}>
                        <div className="dash-avatar-ring">
                          <div className="dash-avatar-inner">
                            {profile?.avatar_url || user?.user_metadata?.avatar_url
                              ? <img src={profile?.avatar_url || user?.user_metadata?.avatar_url} alt="avatar" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : firstName[0]?.toUpperCase()
                            }
                          </div>
                          <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#10B981', border: '2.5px solid white' }} />
                        </div>
                      </Link>
                      <div className="dash-greeting">
                        <p>Assalomu alaykum,</p>
                        <h2 className="outfit-font">{firstName}</h2>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="dash-topbar-right">
                      <div className="dash-stats-pill">
                        <Link to="/leaderboard" className="dash-stat-chip dash-stat-xp">
                          <Sparkles size={13} /> {xp ?? 0}
                        </Link>
                        <Link to="/shop" className="dash-stat-chip dash-stat-coin">
                          <Coins size={13} /> {coins ?? 0}
                        </Link>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <button className="dash-bell" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
                          <div className={unreadCount > 0 ? 'bell-ring' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={19} color="white" />
                          </div>
                          {unreadCount > 0 && <div style={{ position: 'absolute', top: 7, right: 7, width: 9, height: 9, background: '#EF4444', borderRadius: '50%', border: '2px solid white', animation: 'pulse-dot 1.8s ease-in-out infinite' }} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="dash-section-bar">
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <motion.h1
                    initial={false}
                    animate={{ opacity: isSearchOpen ? 0 : 1 }}
                    className="outfit-font dash-section-title"
                    style={{ pointerEvents: isSearchOpen ? 'none' : 'auto' }}
                  >
                    Darslar
                  </motion.h1>
                  <motion.p
                    initial={false}
                    animate={{ opacity: isSearchOpen ? 0 : 1 }}
                    style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(0.8125rem, 2.5vw, 1rem)', fontWeight: 500, pointerEvents: isSearchOpen ? 'none' : 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    O'quv dasturlari va darslar
                  </motion.p>
                </div>

                {/* Expandable Search */}
                <motion.div
                  initial={false}
                  animate={{
                    width: isSearchOpen ? '100%' : 44,
                    backgroundColor: isSearchOpen ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.12)',
                    borderColor: isSearchOpen ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.2)'
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="glass-card"
                  style={{
                    position: 'absolute', right: 0, top: 0,
                    height: 44, borderRadius: 100,
                    overflow: 'hidden', cursor: isSearchOpen ? 'text' : 'pointer',
                    zIndex: 10,
                    backdropFilter: isSearchOpen ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: isSearchOpen ? 'blur(20px)' : 'none'
                  }}
                  onClick={() => {
                    if (!isSearchOpen) {
                      setIsSearchOpen(true)
                      setTimeout(() => document.getElementById('dash-search')?.focus(), 100)
                    }
                  }}
                >
                  {/* Lupa strictly positioned on the far left ALWAYS */}
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <Search size={20} strokeWidth={2.5} color={isSearchOpen ? '#0F172A' : 'white'} style={{ display: 'block', transition: 'color 0.2s' }} />
                  </div>

                  {/* Input stretches fully, taking space but avoiding Lupa and X */}
                  <input
                    id="dash-search"
                    placeholder="Kurs qidirish..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      position: 'absolute', left: 0, top: 0,
                      border: 'none', outline: 'none', background: 'transparent',
                      width: '100%', height: '100%',
                      paddingLeft: 44,
                      paddingRight: isSearchOpen ? 44 : 0,
                      fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A',
                      opacity: isSearchOpen ? 1 : 0, transition: 'opacity 0.2s',
                      pointerEvents: isSearchOpen ? 'auto' : 'none',
                      borderRadius: 0, WebkitAppearance: 'none'
                    }}
                  />

                  {/* X clear button */}
                  <AnimatePresence>
                    {isSearchOpen && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => { e.stopPropagation(); setIsSearchOpen(false); setSearchTerm(''); }}
                        style={{ position: 'absolute', right: 6, top: 6, background: 'rgba(15,23,42,0.05)', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}
                      >
                        <X size={16} strokeWidth={3} />
                      </motion.button>
                    )}
                  </AnimatePresence>

                </motion.div>
              </div>
            </motion.div>

            {/* ── Quick Access ── */}
            <AnimatePresence>
              {!isSearchOpen && (
                <motion.div
                  className="dash-quick-row"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {/* DTM Calculator quick chip */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dtm')}
                    className="dash-quick-chip"
                    style={{
                      background: 'linear-gradient(135deg, rgba(52,97,255,0.25) 0%, rgba(139,92,246,0.25) 100%)',
                      border: '1px solid rgba(139,92,246,0.45)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#3461FF,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <GraduationCap size={14} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>DTM Kalkulator</span>
                    <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 900, color: 'white',
                      background: 'linear-gradient(135deg,#F59E0B,#EF4444)',
                      padding: '2px 7px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em'
                    }}>Yangi</span>
                  </motion.button>

                  {/* Daily Test */}
                  {dailyData?.quiz && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => dailyData.attempt ? navigate('/leaderboard') : navigate(`/quiz/daily-${dailyData.quiz.id}`)} className="dash-quick-chip" style={{ background: 'rgba(52,97,255,0.2)', border: '1px solid rgba(52,97,255,0.4)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Flame size={14} color="white" /></div>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Kunlik Test</span>
                      <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                        {dailyData.attempt ? `Natija: ${dailyData.attempt.score}` : (dailyData.quiz.entry_fee_coins > 0 ? `${dailyData.quiz.entry_fee_coins} Coin` : 'Bepul')}
                      </span>
                    </motion.button>
                  )}

                  {/* Testlar Markazi */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/quizzes')} className="dash-quick-chip">
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Target size={14} color="white" /></div>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Testlar Markazi</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ── CONTENT (overlapping hero) ── */}
        <div className="dash-container">
          <div className="dash-content">

            {/* Daily Reward Box */}
            <AnimatePresence>
              {!isSearchOpen && canClaim && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
                >
                  <div className="card-glow-hover" style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12,
                    background: '#F8FAFC',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 16, padding: '14px 18px',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.05)',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, background: 'rgba(52,97,255,0.08)', borderRadius: '50%', filter: 'blur(40px)' }} />
                    <div style={{ flex: '1 1 200px' }}>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {!canClaim ? 'Mukofot olindi!' : 'Bugungi mukofotingiz tayyor!'}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
                        {!canClaim ? 'Ertaga yana kiring va tanga yig\'ing.' : 'Quyidagi tugmani bosib, 1 ta coin (tanga) oling va bilimlarga investitsiya qiling.'}
                      </p>
                    </div>
                    <motion.button
                      whileTap={!canClaim ? {} : { scale: 0.95 }}
                      onClick={handleClaimReward}
                      disabled={!canClaim}
                      style={{
                        padding: '9px 18px', borderRadius: 100, border: 'none',
                        background: !canClaim ? 'rgba(15,23,42,0.05)' : '#3461FF',
                        color: !canClaim ? '#94A3B8' : 'white',
                        fontWeight: 800, fontSize: '0.875rem', cursor: !canClaim ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, width: 'max-content',
                        boxShadow: !canClaim ? 'none' : '0 4px 16px rgba(52,97,255,0.2)'
                      }}
                    >
                      {!canClaim ? <CheckCircle2 size={16} /> : <Gift size={16} />}
                      {!canClaim ? 'Olindi' : 'Olish (+1)'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* ── Courses Grid ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
              gap: 16,
              alignItems: 'stretch'
            }}>
              {loading ? (
                // Soft Premium Skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{
                    height: 180, borderRadius: 28, background: '#F1F5F9',
                    border: '1px solid rgba(15,23,42,0.04)',
                    position: 'relative', overflow: 'hidden',
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }} />
                ))
              ) : filtered.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '80px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  borderRadius: 32,
                  border: '1px solid rgba(15,23,42,0.05)',
                  boxShadow: '0 12px 40px rgba(15,23,42,0.03)'
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(52,97,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <AlertCircle size={28} color="#3461FF" />
                  </div>
                  <p className="outfit-font" style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    {searchTerm ? "Hech narsa topilmadi" : "Kurslar mavjud emas"}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
                    {searchTerm ? `"${searchTerm}" so'rovi bo'yicha hech qanday dars topilmadi.` : "Tez orada yangi darslar qo'shiladi."}
                  </p>
                </div>
              ) : filtered.map((course, i) => (
                <div key={course.id} style={{ height: '100%' }}>
                  <CourseCard course={course} index={i} userCoins={coins} onNavigate={navigate} />
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Global Notifications Level (Above Hero and Content) */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <>
              {/* Invisible overlay for click-outside to close */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={() => setIsNotificationsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                style={{
                  position: 'fixed', top: 100, right: 16, width: 300,
                  background: '#FFFFFF',
                  border: '1px solid rgba(52,97,255,0.15)', borderRadius: 24, padding: '20px 16px',
                  boxShadow: '0 12px 40px rgba(15,23,42,0.15)', zIndex: 9999,
                  maxHeight: 400, overflowY: 'auto'
                }}
              >
                <h4 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 800, color: '#0F172A', paddingLeft: 4 }}>Bildirishnomalar</h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {dbNotifications.length === 0 ? (
                    <p style={{ margin: '10px 0', fontSize: '0.875rem', color: '#64748B', textAlign: 'center' }}>Hozircha xabarlar yo'q.</p>
                  ) : (
                    dbNotifications.map(n => {
                      let IconNode = <Info size={16} color="#3461FF" />;
                      let bgNode = 'rgba(52,97,255,0.1)';
                      if (n.type === 'success') { IconNode = <CheckCircle2 size={16} color="#10B981" />; bgNode = 'rgba(16,185,129,0.1)'; }
                      if (n.type === 'warning') { IconNode = <AlertCircle size={16} color="#F59E0B" />; bgNode = 'rgba(245,158,11,0.1)'; }
                      if (n.type === 'error') { IconNode = <AlertCircle size={16} color="#EF4444" />; bgNode = 'rgba(239,68,68,0.1)'; }

                      return (
                        <div key={n.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '0 4px', opacity: n.is_read ? 0.7 : 1 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: bgNode, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {IconNode}
                          </div>
                          <div>
                            <p style={{ margin: '0 0 2px', fontSize: '0.875rem', fontWeight: n.is_read ? 600 : 700, color: '#0F172A', lineHeight: 1.3 }}>{n.title}</p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', lineHeight: 1.4, fontWeight: 500 }}>{n.message}</p>
                            <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 500, marginTop: 4, display: 'block' }}>
                              {new Date(n.created_at).toLocaleString('uz-UZ', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <style>{`
        @keyframes pulse {
          0%   { opacity: 1; }
          50%  { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
      </div>
    </>
  )
}
