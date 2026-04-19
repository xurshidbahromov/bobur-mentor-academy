// src/pages/DashboardPage.jsx
// Auth zone home: kurslar ro'yxati + darslar accordion + coin balansi.
// "CoursesPage" va "CourseDetailPage" endi bu yerga integratsiya qilingan.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { supabase } from '../lib/supabase'
import { Coins, Lock, Play, ChevronDown, BookOpen, CheckCircle2, Flame, Search, AlertCircle, MessageCircle, ArrowRight, Gift, Bell, X, Target, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useUnreadNotifications } from '../context/useUnreadNotifications'
import { useStreak } from '../hooks/useStreak'

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

function CourseCard({ course, index, onNavigate }) {
  const { user } = useAuth()
  const glowClass = '' // Standardized look for all cards as requested

  const [commentCount, setCommentCount] = useState(0)
  const [progressPct, setProgressPct] = useState(0)

  useEffect(() => {
    async function fetchCourseStats() {
      // Fetch comment count
      const { count: cCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)
      if (cCount !== null) setCommentCount(cCount)

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
      className={`card-glow-hover ${glowClass}`}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onNavigate(`/courses/${course.id}`)}
      style={{
        position: 'relative', width: '100%', height: '100%',
        background: 'rgba(255, 255, 255, 0.78)', 
        backdropFilter: 'blur(24px) saturate(2)',
        WebkitBackdropFilter: 'blur(24px) saturate(2)',
        border: '1px solid var(--border-medium)', 
        cursor: 'pointer',
        padding: '24px', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
        display: 'flex', flexDirection: 'column', gap: 16,
        borderRadius: 28, boxShadow: '0 8px 32px rgba(15,23,42,0.05)',
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

      {/* Course Info (Top part) */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <h3 style={{
          margin: '0 0 6px', fontWeight: 800, fontSize: '1.25rem',
          color: '#0F172A', letterSpacing: '-0.02em',
        }}>
          {course.title}
        </h3>
        {course.description && (
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B', lineHeight: 1.55 }}>
            {course.description}
          </p>
        )}
      </div>

      {/* Bottom actions (Left: comments, Right: Progress Arrow) */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 16, borderTop: '1px solid rgba(15,23,42,0.06)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
          <MessageCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{commentCount} izoh</span>
        </div>

        <div style={{ position: 'relative', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
            <circle cx="22" cy="22" r="19" fill="none" stroke="#F1F5F9" strokeWidth="2.5" />
            <circle cx="22" cy="22" r="19" fill="none" stroke="#3461FF" strokeWidth="3" 
              strokeDasharray={`${2 * Math.PI * 19 * (progressPct / 100)} ${2 * Math.PI * 19}`} strokeLinecap="round" 
              style={{ transition: 'stroke-dasharray 0.5s ease' }} 
            />
          </svg>
          <ArrowRight size={20} color="#3461FF" />
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
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const { canClaim, claimDailyReward } = useStreak()
  const [dbNotifications, setDbNotifications] = useState([])
  const unreadCount = useUnreadNotifications()

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
  }, [user])

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
  const name = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'O\'quvchi'
  const firstName = name.split(' ')[0]
  const streak = profile?.streak_count ?? 0

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 40px' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 24 }}>
        <AnimatePresence>
          {!isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginBottom: 28 }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Avatar with Glassy Ring */}
                <div style={{ 
                  width: 64, height: 64, borderRadius: '50%', 
                  background: 'white', flexShrink: 0, 
                  padding: 4, 
                  boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                  border: '1px solid var(--border-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    overflow: 'hidden', background: '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--color-primary)', fontWeight: 800, fontSize: '1.75rem'
                  }}>
                    {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                      <img 
                        src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                        alt="Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      firstName[0]?.toUpperCase()
                    )}
                  </div>
                  {/* Active dot */}
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#10B981', border: '3px solid white' }} />
                </div>
                
                {/* Greeting */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ 
                    margin: 0, fontSize: '0.8125rem', fontWeight: 700, 
                    color: 'var(--text-muted)', letterSpacing: '-0.01em' 
                  }}>
                    Assalomu alaykum,
                  </span>
                  <h2 className="outfit-font" style={{ 
                    margin: 0, fontSize: 'min(7vw, 1.75rem)', color: '#0F172A', 
                    fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1
                  }}>
                    {firstName}
                  </h2>
                </div>
              </div>
              
              {/* Right Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CoinBadge coins={coins} />
                
                <div style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                    style={{ position: 'relative', width: 44, height: 44, borderRadius: '50%', background: unreadCount > 0 ? 'rgba(52,97,255,0.06)' : 'white', border: unreadCount > 0 ? '1px solid rgba(52,97,255,0.15)' : '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 12px rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className={unreadCount > 0 ? 'bell-ring' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell size={20} color={unreadCount > 0 ? '#3461FF' : '#0F172A'} />
                    </div>
                    {/* Unread Indicator */}
                    {unreadCount > 0 && (
                      <div style={{ position: 'absolute', top: 8, right: 8, width: 9, height: 9, background: '#EF4444', borderRadius: '50%', border: '2px solid white', animation: 'pulse-dot 1.8s ease-in-out infinite' }} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <>
                        {/* Invisible overlay for click-outside to close */}
                        <div 
                          style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                          onClick={() => setIsNotificationsOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          style={{
                            position: 'absolute', top: 54, right: 0, width: 300,
                            background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px) saturate(2.5)',
                            WebkitBackdropFilter: 'blur(24px) saturate(2.5)',
                            border: '1px solid rgba(52,97,255,0.15)', borderRadius: 24, padding: '20px 16px',
                            boxShadow: '0 12px 40px rgba(15,23,42,0.08)', zIndex: 100,
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
                                      {new Date(n.created_at).toLocaleString('uz-UZ', { hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'short' })}
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', height: 44 }}>
          {/* Title */}
          <motion.h1 
            initial={false}
            animate={{ opacity: isSearchOpen ? 0 : 1 }}
            className="outfit-font" 
            style={{ margin: 0, fontSize: '2.5rem', color: '#0F172A', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, pointerEvents: isSearchOpen ? 'none' : 'auto' }}
          >
            Darslar
          </motion.h1>

          {/* Expandable Search */}
          <motion.div
            initial={false} 
            animate={{ 
              width: isSearchOpen ? '100%' : 44,
              backgroundColor: isSearchOpen ? 'rgba(255,255,255,0.95)' : 'rgba(52,97,255,0.04)',
              borderColor: isSearchOpen ? 'rgba(52,97,255,0.15)' : 'rgba(52,97,255,0.08)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass-card"
            style={{
              position: 'absolute', right: 0, top: 0,
              height: 44, borderRadius: 100, 
              overflow: 'hidden', cursor: isSearchOpen ? 'text' : 'pointer',
              zIndex: 10,
              backdropFilter: isSearchOpen ? 'blur(24px)' : 'none'
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
              <Search size={20} strokeWidth={2.5} color="#3461FF" style={{ display: 'block' }} />
            </div>

            {/* Input stretches fully, taking space but avoiding Lupa and X */}
            <input
               id="dash-search"
               placeholder="Kurs qidirish..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{ 
                 position: 'absolute', left: 0, top: 0,
                 border:'none', outline:'none', background:'transparent', 
                 width: '100%', height: '100%', 
                 paddingLeft: 44, 
                 paddingRight: isSearchOpen ? 44 : 0, 
                 fontSize:'0.9375rem', fontWeight: 600, color: '#0F172A', 
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
                  style={{ position: 'absolute', right: 6, top: 6, background:'rgba(15,23,42,0.05)', border:'none', width: 32, height: 32, borderRadius: '50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748B' }}
                >
                  <X size={16} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
            
          </motion.div>
        </div>

        {/* Daily Reward Box */}
        <AnimatePresence>
          {!isSearchOpen && canClaim && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
            >
              <div className="card-glow-hover" style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
                background: 'rgba(255, 255, 255, 0.78)', 
                backdropFilter: 'blur(32px) saturate(2)',
                WebkitBackdropFilter: 'blur(32px) saturate(2)',
                border: '1px solid var(--border-medium)',
                borderRadius: 24, padding: '20px 24px',
                boxShadow: '0 12px 32px rgba(15,23,42,0.05)',
                flexWrap: 'wrap',
                position: 'relative', overflow: 'hidden'
              }}>
                {/* Decorative glass glow */}
                <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, background: 'rgba(52,97,255,0.08)', borderRadius: '50%', filter: 'blur(40px)' }} />

                <div style={{ flex: '1 1 200px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.1875rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!canClaim ? 'Mukofot olindi!' : 'Bugungi mukofotingiz tayyor!'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B', fontWeight: 500 }}>
                    {!canClaim ? 'Ertaga yana kiring va tanga yig\'ing.' : 'Quyidagi tugmani bosib, 1 ta coin (tanga) oling va bilimlarga investitsiya qiling.'}
                  </p>
                </div>
                <motion.button
                  whileTap={!canClaim ? {} : { scale: 0.95 }}
                  onClick={handleClaimReward}
                  disabled={!canClaim}
                  style={{
                    padding: '12px 24px', borderRadius: 100, border: 'none',
                    background: !canClaim ? 'rgba(15,23,42,0.05)' : '#3461FF',
                    color: !canClaim ? '#94A3B8' : 'white',
                    fontWeight: 800, fontSize: '0.9375rem', cursor: !canClaim ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, width: 'max-content',
                    boxShadow: !canClaim ? 'none' : '0 4px 16px rgba(52,97,255,0.2)'
                  }}
                >
                  {!canClaim ? <CheckCircle2 size={18} /> : <Gift size={18} />}
                  {!canClaim ? 'Olindi' : 'Olish (+1)'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Quiz Hub Banner ── */}
      <AnimatePresence>
        {!isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: 32 }}
          >
            <div 
              onClick={() => navigate('/quizzes')}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: 28, padding: '24px 28px', color: 'white', position: 'relative', overflow: 'hidden',
                boxShadow: '0 16px 32px rgba(16, 185, 129, 0.25)', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              {/* Decorative Background */}
              <div style={{ position: 'absolute', top: -30, right: -10, opacity: 0.15, transform: 'rotate(15deg)' }}><Target size={180} /></div>
              
              <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 100, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yangi</div>
                  <h3 className="outfit-font" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Testlar Markazi</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.4, maxWidth: '85%' }}>
                  Darslarga va Umumiy mavzularga oid random qiziqarli savollarni yechib bilimingizni charxlang!
                </p>
              </div>

              <div style={{ 
                width: 48, height: 48, borderRadius: '50%', background: 'white', color: '#059669', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
              }}>
                <Play size={20} fill="currentColor" style={{ marginLeft: 3 }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Courses Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
        gap: 20,
        alignItems: 'stretch'
      }}>
        {loading ? (
          // Soft Premium Skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{
              height: 180, borderRadius: 28, background: '#FFFFFF',
              border: '1px solid rgba(15,23,42,0.04)',
              boxShadow: '0 8px 30px rgba(15,23,42,0.02)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, rgba(241,245,249,0) 0%, rgba(241,245,249,0.8) 50%, rgba(241,245,249,0) 100%)',
                backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite linear'
              }} />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '80px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(32px) saturate(2)',
            WebkitBackdropFilter: 'blur(32px) saturate(2)',
            borderRadius: 32,
            border: '1px solid rgba(255,255,255,0.6)',
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
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: '100%' }}
          >
            <CourseCard course={course} index={i} userCoins={coins} onNavigate={navigate} />
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
