import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, CheckCircle2, Flame, LogOut,
  ArrowRight, Trophy, ShieldCheck, Coins, ChevronRight,
  MoreVertical, Calendar as CalendarIcon, Sparkles, Check, ArrowUpRight, Clock, Zap
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function ProfilePage() {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [extStats, setExtStats] = useState({
    lessonsDone: 0,
    quizAvg: 0,
    activityDays: [],
    performanceScore: 0
  })

  // Daily Reward State
  const [claimedDaily, setClaimedDaily] = useState(false)

  // Initialization & Data Fetch
  useEffect(() => {
    if (!user) return

    // Quick init of claimed status from local storage
    const today = new Date().toISOString().split('T')[0]
    if (localStorage.getItem(`bma_daily_${user.id}_${today}`)) {
      setClaimedDaily(true)
    }
    const fetchStats = async () => {
      // 1. Lessons completed
      const { count: lCount } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)

      // 2. Quiz performance
      const { data: qData } = await supabase
        .from('quiz_attempts')
        .select('score, total')
        .eq('user_id', user.id)

      let avg = 0
      if (qData && qData.length > 0) {
        const sum = qData.reduce((acc, q) => acc + (q.score / (q.total || 1)), 0)
        avg = Math.round((sum / qData.length) * 100)
      }

      // 3. Activity (last 30 days)
      const { data: qActs } = await supabase.from('quiz_attempts').select('created_at').eq('user_id', user.id)
      const { data: lActs } = await supabase.from('lesson_progress').select('updated_at').eq('user_id', user.id)
      
      const dates = new Set()
      qActs?.forEach(d => dates.add(new Date(d.created_at).toISOString().split('T')[0]))
      lActs?.forEach(d => dates.add(new Date(d.updated_at).toISOString().split('T')[0]))

      setExtStats({
        lessonsDone: lCount || 0,
        quizAvg: avg,
        activityDays: Array.from(dates),
        performanceScore: Math.min(Math.round(((lCount || 0) * 10 + avg) / 2), 100)
      })
    }
    fetchStats()
  }, [user])

  const handleSignOut = async () => {
    localStorage.removeItem('bma_tg_autologin')
    await signOut()
    navigate('/')
  }

  const handleClaimReward = async () => {
    if (claimedDaily || !user) return
    
    // Optimistic UI updates
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(`bma_daily_${user.id}_${today}`, 'true')
    setClaimedDaily(true)
    
    // AuthContext'da setProfile yo'q bo'lsa, profile'ni fetch qilish qiyinroq
    // Ammo oddiy user o'zgaruvchisi orqali xavolani berib o'tishimiz mumkin
    const newCoins = (profile?.coins || 0) + 1
    
    // DB background sync
    supabase.from('profiles').update({ coins: newCoins }).eq('id', user.id).then()
    
    toast.success("Ajoyib! 🎉", { description: "Sizga mukofot tariqasida 1 ta Coin berildi!" })

    // Confetti
    if (window.confetti) {
      const duration = 2400
      const end = Date.now() + duration
      const colors = ['#3461FF', '#8B5CF6', '#F59E0B', '#10B981']

      ;(function frame() {
        window.confetti({
          particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors, gravity: 0.6
        })
        window.confetti({
          particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors, gravity: 0.6
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      })()
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '32px 16px' }}>
        <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
        {[120, 80, 200, 160].map((h, i) => (
          <div key={i} style={{
            height: h, borderRadius: 24, background: '#F8FAFC',
            marginBottom: 14, position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear'
            }} />
          </div>
        ))}
      </div>
    )
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'O\'quvchi'
  const email = user?.email || ''
  const coins = profile?.coins ?? 0
  const streak = profile?.streak_count ?? 0

  const STATS = [
    { 
      label: 'Darslar', value: extStats.lessonsDone, icon: <BookOpen size={18} color="#059669" />, 
      bg: '#D1FAE5', labelColor: '#064E3B', iconBg: 'white',
      accentColor: '#059669'
    },
    { 
      label: 'Quizlar', value: extStats.quizAvg + '%', icon: <CheckCircle2 size={18} color="#D97706" />, 
      bg: '#FEF3C7', labelColor: '#78350F', iconBg: 'white',
      accentColor: '#D97706'
    },
    { 
      label: 'Streak', value: streak, icon: <Flame size={18} color="#7C3AED" />, 
      bg: '#EDE9FE', labelColor: '#4C1D95', iconBg: 'white',
      accentColor: '#7C3AED'
    },
    { 
      label: 'Coinlar', value: coins.toLocaleString(), icon: <Coins size={18} color="#EA580C" />, 
      bg: '#FFEDD5', labelColor: '#7C2D12', iconBg: 'white',
      accentColor: '#EA580C'
    },
  ]

  const MENU_GROUPS = [
    {
      items: [
        ...(isAdmin ? [{
          to: '/admin', icon: <ShieldCheck size={18} color="#3461FF" />,
          iconBg: 'rgba(52,97,255,0.1)', label: 'Admin Panel', labelColor: '#3461FF', bold: true,
        }] : []),
        {
          to: '/leaderboard', icon: <Trophy size={18} color="#F59E0B" />,
          iconBg: 'rgba(245,158,11,0.09)', label: 'Kuchlilar doskasi',
        },
        {
          to: '/about', icon: <span style={{ color: '#3461FF', fontWeight: 900, fontSize: '15px', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>i</span>,
          iconBg: 'rgba(52,97,255,0.07)', label: 'Biz haqimizda',
        },
      ],
    },
  ]

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 100px' }}>
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Avatar Hero Card ── */}
        <motion.div variants={item} className="card-glow-hover" style={{
          background: 'rgba(255, 255, 255, 0.78)', 
          backdropFilter: 'blur(24px) saturate(2)', 
          WebkitBackdropFilter: 'blur(24px) saturate(2)', 
          borderRadius: 28,
          border: '1px solid var(--border-medium)',
          boxShadow: '0 8px 32px rgba(15,23,42,0.05)',
          padding: '32px 24px', marginBottom: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle gradient orb background */}
          <div style={{
            position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
            width: 220, height: 180, borderRadius: '50%',
            background: avatarUrl
              ? 'radial-gradient(circle, rgba(52,97,255,0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(52,97,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative', marginBottom: 16,
              padding: 4, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(52,97,255,0.15), rgba(139,92,246,0.1))',
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} style={{
                width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
                border: '3px solid white', display: 'block',
              }} />
            ) : (
              <div style={{
                width: 88, height: 88, borderRadius: '50%',
                background: '#F1F5F9', border: '3px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.25rem', fontWeight: 900, color: '#475569',
              }}>
                {name[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {/* Online dot */}
            <div style={{
              position: 'absolute', bottom: 6, right: 6,
              width: 16, height: 16, borderRadius: '50%',
              background: '#10B981', border: '3px solid white',
            }} />
          </motion.div>

          {/* Name */}
          <h1 className="outfit-font" style={{
            margin: '0 0 4px', fontSize: '1.625rem', fontWeight: 900,
            color: '#0F172A', letterSpacing: '-0.03em'
          }}>
            {name}
          </h1>

          {/* Email */}
          <p style={{ margin: '0 0 10px', color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>
            {email}
          </p>

          {/* Admin badge */}
          {isAdmin && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#EFF6FF', color: '#3461FF',
              padding: '4px 12px', borderRadius: 100,
              fontSize: '0.8125rem', fontWeight: 700,
              border: '1px solid rgba(52,97,255,0.15)',
            }}>
              <ShieldCheck size={12} /> Admin
            </span>
          )}
        </motion.div>

        {/* ── Daily Reward Box (Permanent Home) ── */}
        <motion.div variants={item} className="card-glow-hover glow-amber" style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
          background: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(24px) saturate(2.2)',
          WebkitBackdropFilter: 'blur(24px) saturate(2.2)',
          border: '1.2px solid var(--border-medium)',
          borderRadius: 24, padding: '20px 24px',
          boxShadow: '0 12px 32px rgba(15,23,42,0.05)',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 200px' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: claimedDaily ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: claimedDaily ? 'none' : 'inset 0 2px 4px rgba(255,255,255,0.4)',
              border: claimedDaily ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(245,158,11,0.3)'
            }}>
              {claimedDaily ? (
                <CheckCircle2 color="#10B981" size={26} strokeWidth={2.5} />
              ) : (
                <Zap color="#F59E0B" size={26} fill="#F59E0B" />
              )}
            </div>
            <div>
              <p className="outfit-font" style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.0625rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                {claimedDaily ? "Kunlik mukofotingiz olindi" : "Kunlik mukofot mavjud!"}
              </p>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
                {claimedDaily ? "Ertaga qaytib keling, biz sizni kutamiz!" : "Hoziroq olib coinlar sonini ko'paytiring"}
              </p>
            </div>
          </div>

          <motion.button
            whileTap={!claimedDaily ? { scale: 0.95 } : {}}
            onClick={handleClaimReward}
            disabled={claimedDaily}
            style={{
              padding: '12px 24px', borderRadius: 14, border: 'none', cursor: claimedDaily ? 'default' : 'pointer',
              background: claimedDaily ? 'rgba(15,23,42,0.04)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: claimedDaily ? '#94A3B8' : 'white',
              fontWeight: 800, fontSize: '0.9375rem', fontFamily: 'inherit',
              boxShadow: claimedDaily ? 'none' : '0 6px 16px rgba(245,158,11,0.3)',
              WebkitTapHighlightColor: 'transparent', flex: '1 1 auto', minWidth: 120,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {claimedDaily ? "Olindi" : "Olish"}
          </motion.button>
        </motion.div>

        {/* ── Progress Section ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 16,
          marginBottom: 16
        }}>
          {/* Row 1: Gauge & Calendar */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16
          }}>
            {/* Progress Gauge */}
            <motion.div variants={item} className="card-glow-hover glow-purple" style={{
              background: 'rgba(255, 255, 255, 0.85)', 
              backdropFilter: 'blur(30px) saturate(2)',
              WebkitBackdropFilter: 'blur(30px) saturate(2)',
              borderRadius: 32, padding: '24px',
              display: 'flex', flexDirection: 'column',
              border: '1.2px solid var(--border-medium)',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.05)',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative background tint */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(139, 92, 246, 0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)' }}>
                    <Sparkles size={16} color="#8B5CF6" />
                  </div>
                  <span className="outfit-font" style={{ fontWeight: 800, color: '#4C1D95', fontSize: '1.1875rem', letterSpacing: '-0.01em' }}>Progress</span>
                </div>
                <button style={{ background: 'none', border: 'none', color: '#8B5CF6', cursor: 'pointer', opacity: 0.6 }}>
                  <MoreVertical size={20} />
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px 0', position: 'relative', zIndex: 1 }}>
                 <div style={{ position: 'relative', width: 220, height: 140 }}>
                    <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none" stroke="rgba(139, 92, 246, 0.08)" strokeWidth="10" strokeLinecap="round"
                      />
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: extStats.performanceScore / 100 }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        d="M 10 50 A 40 40 0 0 1 90 50"
                        fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#3461FF" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 15 }}>
                       <span className="outfit-font" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1E1B4B', lineHeight: 1, letterSpacing: '-0.04em' }}>{extStats.performanceScore * 2}</span>
                       <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#8B5CF6', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Score</span>
                    </div>
                 </div>
              </div>
            </motion.div>

            {/* Activity Calendar */}
            <motion.div variants={item} className="card-glow-hover glow-green" style={{
              background: 'rgba(255, 255, 255, 0.85)', 
              backdropFilter: 'blur(30px) saturate(2)',
              WebkitBackdropFilter: 'blur(30px) saturate(2)',
              borderRadius: 32, padding: '24px',
              border: '1.2px solid var(--border-medium)',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.05)',
              display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Decorative background tint */}
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(16, 185, 129, 0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, position: 'relative', zIndex: 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)' }}>
                  <CalendarIcon size={16} color="#10B981" />
                </div>
                <span className="outfit-font" style={{ fontWeight: 800, color: '#064E3B', fontSize: '1.1875rem', letterSpacing: '-0.01em' }}>Aktivlik</span>
              </div>
              
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, padding: '4px', position: 'relative', zIndex: 1 }}>
                {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#10B981', opacity: 0.5 }}>{day}</div>
                ))}
                {(() => {
                  const now = new Date()
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
                  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
                  const padding = (firstDay + 6) % 7 
                  
                  return (
                    <>
                      {Array.from({ length: padding }).map((_, i) => <div key={`p-${i}`} />)}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1
                        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const isActive = extStats.activityDays.includes(dateStr)
                        const isToday = day === now.getDate()

                        return (
                          <div key={day} style={{
                            aspectRatio: '1', borderRadius: '50%', 
                            background: isActive ? '#10B981' : (isToday ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.5)'),
                            color: isActive ? 'white' : '#064E3B',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 800,
                            boxShadow: isToday ? '0 0 0 2px #10B981' : 'none',
                            transition: 'all 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
                            cursor: 'default'
                          }}>
                            {day}
                          </div>
                        )
                      })}
                    </>
                  )
                })()}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats Grid (Premium) ── */}
        <motion.div variants={item} style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 16, 
          marginBottom: 16 
        }}>
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(24px) saturate(2)',
                WebkitBackdropFilter: 'blur(24px) saturate(2)',
                borderRadius: 28, padding: '24px',
                display: 'flex', flexDirection: 'column', gap: 20,
                position: 'relative', overflow: 'hidden',
                border: '1.2px solid var(--border-medium)',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.05)'
              }}
            >
              {/* Subtle background color tint */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: s.bg, opacity: 0.15, borderRadius: '50%', filter: 'blur(34px)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                  border: '1px solid rgba(15, 23, 42, 0.03)'
                }}>
                  {s.icon}
                </div>
                <span style={{ fontWeight: 800, color: '#64748B', fontSize: '0.875rem', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                  {s.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <span className="outfit-font" style={{ 
                  fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', 
                  letterSpacing: '-0.04em', lineHeight: 1 
                }}>
                  {s.value}
                </span>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
                  border: '1px solid rgba(15, 23, 42, 0.04)',
                  cursor: 'pointer'
                }}>
                  <ArrowUpRight size={20} color={s.accentColor} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Menu Groups ── */}
        {MENU_GROUPS.map((group, gi) => (
          <motion.div key={gi} className="card-glow-hover" style={{
            background: 'rgba(255, 255, 255, 0.85)', borderRadius: 24,
            backdropFilter: 'blur(32px) saturate(2)',
            WebkitBackdropFilter: 'blur(32px) saturate(2)',
            border: '1.2px solid var(--border-medium)',
            overflow: 'hidden', marginBottom: 12,
            boxShadow: '0 8px 32px rgba(15,23,42,0.05)',
          }}>
            {group.items.map((m, j) => (
              <Link
                key={j}
                to={m.to}
                style={{
                  padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                  textDecoration: 'none',
                  borderBottom: j < group.items.length - 1 ? '1px solid rgba(100,120,255,0.08)' : 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,97,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 11, background: m.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {m.icon}
                </div>
                <p style={{
                  margin: 0, flex: 1,
                  fontWeight: m.bold ? 800 : 600,
                  color: m.labelColor || '#334155',
                  fontSize: '0.9375rem',
                }}>
                  {m.label}
                </p>
                <ChevronRight size={18} color={m.labelColor || '#CBD5E1'} />
              </Link>
            ))}
          </motion.div>
        ))}

        {/* ── Sign Out ── */}
        <motion.div variants={item}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="card-glow-hover glow-red"
            style={{
              background: 'rgba(255, 255, 255, 0.85)', borderRadius: 24,
              backdropFilter: 'blur(32px) saturate(2)',
              WebkitBackdropFilter: 'blur(32px) saturate(2)',
              border: '1.2px solid var(--border-medium)',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 8px 32px rgba(239,68,68,0.08)',
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'rgba(239,68,68,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LogOut size={18} color="#EF4444" />
            </div>
            <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#EF4444', fontSize: '0.9375rem' }}>
              Tizimdan chiqish
            </p>
          </motion.div>
        </motion.div>



      </motion.div>
    </div>
  )
}
