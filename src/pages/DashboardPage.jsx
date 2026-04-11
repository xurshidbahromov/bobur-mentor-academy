// src/pages/DashboardPage.jsx
// Auth zone home: kurslar ro'yxati + darslar accordion + coin balansi.
// "CoursesPage" va "CourseDetailPage" endi bu yerga integratsiya qilingan.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { supabase } from '../lib/supabase'
import { Coins, Lock, Play, ChevronDown, BookOpen, CheckCircle2, Flame, Search, AlertCircle, MessageCircle, ArrowRight, Gift, Bell } from 'lucide-react'
import { toast } from 'sonner'

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

function CourseCard({ course, onNavigate }) {
  // Placeholder progress (can be replaced with real user progress calculation)
  const progressPct = 0 

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onNavigate(`/courses/${course.id}`)}
      style={{
        position: 'relative', width: '100%', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(20px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
        border: '1px solid rgba(255, 255, 255, 0.5)', 
        cursor: 'pointer',
        padding: '24px', textAlign: 'left', WebkitTapHighlightColor: 'transparent',
        display: 'flex', flexDirection: 'column', gap: 16,
        borderRadius: 28, boxShadow: '0 8px 32px rgba(15,23,42,0.04)',
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
      <div style={{ position: 'relative', zIndex: 1 }}>
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
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>0 izoh</span>
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
  const [claimedDaily, setClaimedDaily] = useState(false)

  const handleClaimReward = async () => {
    if (claimedDaily) return
    setClaimedDaily(true)
    
    // Add coins roughly by local state, later adapt to real DB if needed
    if (setProfile) {
      setProfile(prev => ({ ...prev, coins: (prev?.coins || 0) + 1 }))
    }
    
    toast.success("Ajoyib!", { description: "Sizga 1 ta Coin berildi. O'qishda davom eting!" })

    const triggerConfetti = () => {
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }

    if (!window.confetti) {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
      script.onload = triggerConfetti
      document.head.appendChild(script)
    } else {
      triggerConfetti()
    }
  }

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
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 40px' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
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
            <button style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', border: '1px solid rgba(15,23,42,0.04)', boxShadow: '0 4px 12px rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <Bell size={20} color="#0F172A" />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 className="outfit-font" style={{ margin: 0, fontSize: '2.5rem', color: '#0F172A', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            Darslar
          </h1>

          <motion.div
            initial={false} animate={{ width: isSearchOpen ? 240 : 44 }}
            className="glass-card"
            style={{
              height: 44, borderRadius: 100, background: 'rgba(52,97,255,0.04)',
              border: isSearchOpen ? '1px solid rgba(52,97,255,0.15)' : '1px solid rgba(52,97,255,0.08)',
              display: 'flex', alignItems: 'center', padding: isSearchOpen ? '0 16px 0 12px' : '0',
              justifyContent: isSearchOpen ? 'flex-start' : 'center',
              overflow: 'hidden', cursor: isSearchOpen ? 'text' : 'pointer'
            }}
            onClick={() => !isSearchOpen && setIsSearchOpen(true)}
          >
            <button onClick={(e) => { e.stopPropagation(); setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchTerm('') }} style={{ background:'none', border:'none', padding:0, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#3461FF', flexShrink: 0, width: isSearchOpen ? 24 : 44, height: 44 }}>
              <Search size={20} strokeWidth={2.5} />
            </button>
            {isSearchOpen && (
              <input
                 autoFocus
                 placeholder="Kurs qidirish..."
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 style={{ border:'none', outline:'none', background:'transparent', marginLeft:10, width:'100%', fontSize:'0.9375rem', fontWeight:600, color: '#0F172A' }}
              />
            )}
          </motion.div>
        </div>

        {/* Daily Reward Box */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          background: 'rgba(255, 255, 255, 0.5)', 
          backdropFilter: 'blur(24px) saturate(2)',
          WebkitBackdropFilter: 'blur(24px) saturate(2)',
          border: '1px solid rgba(52,97,255,0.14)',
          borderRadius: 24, padding: '20px 24px',
          marginBottom: 32, boxShadow: '0 12px 32px rgba(52,97,255,0.06)',
          flexWrap: 'wrap',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative glass glow */}
          <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, background: 'rgba(52,97,255,0.08)', borderRadius: '50%', filter: 'blur(40px)' }} />

          <div style={{ flex: '1 1 200px' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.1875rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              {claimedDaily ? 'Mukofot olindi!' : 'Bugungi mukofotingiz tayyor!'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B', fontWeight: 500 }}>
              {claimedDaily ? 'Ertaga yana kiring va tanga yig\'ing.' : 'Quyidagi tugmani bosib, 1 ta coin (tanga) oling va bilimlarga investitsiya qiling.'}
            </p>
          </div>
          <motion.button
            whileTap={claimedDaily ? {} : { scale: 0.95 }}
            onClick={handleClaimReward}
            disabled={claimedDaily}
            style={{
              padding: '12px 24px', borderRadius: 100, border: 'none',
              background: claimedDaily ? 'rgba(15,23,42,0.05)' : '#3461FF',
              color: claimedDaily ? '#94A3B8' : 'white',
              fontWeight: 800, fontSize: '0.9375rem', cursor: claimedDaily ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, width: 'max-content',
              boxShadow: claimedDaily ? 'none' : '0 4px 16px rgba(52,97,255,0.2)'
            }}
          >
            {claimedDaily ? <CheckCircle2 size={18} /> : <Gift size={18} />}
            {claimedDaily ? 'Olindi' : 'Olish (+1)'}
          </motion.button>
        </div>
      </motion.div>

      {/* ── Courses Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20,
        alignItems: 'start'
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
            <AlertCircle size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              {searchTerm ? `"${searchTerm}" bo'yicha kurs topilmadi.` : "Hozircha kurslar mavjud emas."}
            </p>
          </div>
        ) : filtered.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
