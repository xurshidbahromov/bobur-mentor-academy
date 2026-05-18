import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, CheckCircle2, Flame, LogOut,
  ArrowRight, Trophy, ShieldCheck, Coins, ChevronRight,
  MoreVertical, Calendar as CalendarIcon, Sparkles, Check, ArrowUpRight, Clock, Zap, Crown, Shield,
  Edit3, X
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { useStreak } from '../hooks/useStreak'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Profile Edit States
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const AVATAR_PRESETS = [
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Sally',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Bella',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Oscar',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Lily',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Ruby',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Max'
  ]

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Ism bo'sh bo'lishi mumkin emas!")
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim(),
          avatar_url: editAvatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success("Profil muvaffaqiyatli saqlandi! ✨")
      setIsEditing(false)
    } catch (err) {
      toast.error("Xatolik yuz berdi. Qaytadan urunib ko'ring.")
    } finally {
      setIsSaving(false)
    }
  }

  // 1. Daily Reward Hook
  const { canClaim, claimDailyReward } = useStreak()

  // 1. Fetch Stats & Activity with React Query
  const { data: extStats = { lessonsDone: 0, quizAvg: 0, activityDays: [], level: 1, xp: 0 }, isLoading: statsLoading } = useQuery({
    queryKey: ['profile-stats', user?.id],
    queryFn: async () => {
      if (!user) return null

      const [lRes, qRes, qActs, lActs, dActs] = await Promise.all([
        supabase.from('lesson_progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_completed', true),
        supabase.from('quiz_attempts').select('score, total').eq('user_id', user.id),
        supabase.from('quiz_attempts').select('created_at').eq('user_id', user.id),
        supabase.from('lesson_progress').select('updated_at').eq('user_id', user.id),
        supabase.from('daily_quiz_attempts').select('created_at').eq('user_id', user.id).not('score', 'is', null),
      ])

      let avg = 0
      if (qRes.data && qRes.data.length > 0) {
        const sum = qRes.data.reduce((acc, q) => acc + (q.score / (q.total || 1)), 0)
        avg = Math.round((sum / qRes.data.length) * 100)
      }

      const dates = new Set()
      const toLocalDateStr = (utcString) => {
        const d = new Date(utcString)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      }

      qActs.data?.forEach(d => dates.add(toLocalDateStr(d.created_at)))
      lActs.data?.forEach(d => dates.add(toLocalDateStr(d.updated_at)))
      dActs.data?.forEach(d => dates.add(toLocalDateStr(d.created_at)))

      return {
        lessonsDone: lRes.count || 0,
        quizAvg: avg,
        activityDays: Array.from(dates)
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const loading = authLoading || statsLoading

  const handleSignOut = async () => {
    localStorage.removeItem('bma_tg_autologin')
    await signOut()
    navigate('/')
  }

  const handleClaimReward = async () => {
    await claimDailyReward()
  }

  if (loading) {
    return (
    <div style={{ padding: '32px 16px' }}>
      {[120, 80, 200, 160].map((h, i) => (
        <div key={i} className="skeleton-loader" style={{
          height: h, borderRadius: 24,
          marginBottom: 14
        }} />
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
  
  const ratingScore = profile?.rating_score ?? 0
  const currentLevel = Math.floor(ratingScore / 100) + 1
  const xpInCurrentLevel = ratingScore % 100

  const STATS = [
    {
      label: 'Darslar', value: extStats.lessonsDone, icon: <BookOpen size={18} color="#059669" />,
      bg: '#D1FAE5', labelColor: '#064E3B', iconBg: 'white',
      accentColor: '#059669'
    },
    {
      label: 'Reyting XP', value: ratingScore.toLocaleString(), icon: <Sparkles size={18} color="#D97706" />,
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
    <>
      <style>{`
        .profile-page-wrapper { width: 100%; padding-bottom: 60px; background: #F8FAFC; min-height: 100vh; }
        .profile-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 2; }
        
        .profile-hero {
          background: linear-gradient(145deg, #0F172A 0%, #1e3a8a 50%, #172554 100%);
          position: relative;
          overflow: hidden;
          padding: 60px 0 140px;
          border-radius: 0 0 40px 40px;
          margin-bottom: -80px;
          box-shadow: 0 20px 40px rgba(15,23,42,0.1);
        }
        
        @media (max-width: 768px) {
          .profile-hero {
            padding: 40px 0 120px;
            border-radius: 0 0 32px 32px;
            margin-bottom: -60px;
          }
        }
        
        .profile-hero-title {
          margin: 0 0 10px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1.1;
          font-size: clamp(2.25rem, 7vw, 3.75rem);
        }
        
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }
        
        .bento-item {
          padding: 28px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .bento-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        }

        .col-span-4 { grid-column: span 12; }
        .col-span-8 { grid-column: span 12; }
        .col-span-6 { grid-column: span 12; }
        .col-span-12 { grid-column: span 12; }

        @media (min-width: 900px) {
          .col-span-4 { grid-column: span 4; }
          .col-span-8 { grid-column: span 8; }
          .col-span-6 { grid-column: span 6; }
        }

        @media (max-width: 768px) {
          .profile-container { padding: 24px 16px; }
          .bento-grid { gap: 16px; }
          .bento-item { padding: 20px; border-radius: 24px; border-width: 3px; }
        }
      `}</style>

      <div className="profile-page-wrapper">
        
        {/* ── FULL WIDTH HERO BANNER ── */}
        <div className="profile-hero">
          {/* Ambient Glows */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          
          {/* Floating Icons */}
          {[
            { top: '15%', right: '12%', size: 48, delay: 0 },
            { top: '55%', right: '25%', size: 28, delay: 0.4 },
            { top: '25%', left: '8%', size: 36, delay: 0.2 },
          ].map((c, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.5, delay: c.delay, ease: 'easeInOut' }}
              style={{ position: 'absolute', opacity: 0.12, pointerEvents: 'none', ...c }}
            >
              <Shield size={c.size} color="white" />
            </motion.div>
          ))}

          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={14} color="#60A5FA" />
                  <span style={{ color: '#DBEAFE', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Profil Markazi</span>
                </div>
              </div>
              <h1 className="outfit-font profile-hero-title">
                Mening Profilim
              </h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 500 }}>
                Platformadagi shaxsiy yutuqlaringiz va holatingiz
              </p>
            </div>
          </div>
        </div>

        <div className="profile-container">
          <motion.div variants={container} initial="hidden" animate="show" className="bento-grid">

            {/* ── BENTO: Avatar & Info (Col 4) ── */}
            <motion.div variants={item} className="bento-item col-span-4 glass-card-premium card-glow-hover glow-sky" style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center',
              marginTop: -60, // OVERLAP EFFECT
              zIndex: 10, background: 'rgba(255, 255, 255, 0.95)'
            }}>
              {/* Edit Button */}
              <button
                onClick={() => {
                  setEditName(name)
                  setEditAvatar(avatarUrl || '')
                  setIsEditing(true)
                }}
                style={{
                  position: 'absolute', top: 16, right: 16, border: 'none', background: 'rgba(52,97,255,0.08)',
                  borderRadius: 12, padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'background 0.2s', color: '#3461FF'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,97,255,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,97,255,0.08)'}
                title="Profilni tahrirlash"
              >
                <Edit3 size={16} />
              </button>
              <div style={{
                position: 'relative', marginBottom: 20, padding: 6, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(52,97,255,0.1), rgba(139,92,246,0.1))',
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} loading="lazy" style={{
                    width: 100, height: 100, borderRadius: '50%', objectFit: 'cover',
                    border: '4px solid white', display: 'block', backgroundColor: '#F8FAFC'
                  }} />
                ) : (
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: '#F1F5F9', border: '4px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', fontWeight: 900, color: '#475569',
                  }}>
                    {name[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {/* Online Indicator */}
                <div style={{
                  position: 'absolute', bottom: 8, right: 8, width: 18, height: 18,
                  borderRadius: '50%', background: '#10B981', border: '3px solid white',
                }} />
              </div>

              <h2 className="outfit-font" style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
                {name}
              </h2>
              <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.9375rem', fontWeight: 500 }}>
                {email}
              </p>

              {isAdmin && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EFF6FF',
                  color: '#3461FF', padding: '6px 14px', borderRadius: 100, fontSize: '0.8125rem', fontWeight: 700,
                }}>
                  <ShieldCheck size={14} /> Administrator
                </div>
              )}
            </motion.div>

            {/* ── BENTO: Level Ring & XP (Col 8) ── */}
            <motion.div variants={item} className="bento-item col-span-8 glass-card-premium card-glow-hover glow-purple" style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} color="#8B5CF6" />
                  </div>
                  <div>
                    <h3 className="outfit-font" style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>Akademik Daraja</h3>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem', fontWeight: 500 }}>Platformadagi umumiy reytingingiz</p>
                  </div>
                </div>
                
                <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: 20 }}>
                  Testlar ishlash, darslarni yakunlash va kunlik mukofotlarni yig'ish orqali o'z darajangizni oshiring. Keyingi darajaga o'tish uchun <b>{100 - xpInCurrentLevel} XP</b> qoldi.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1, height: 8, borderRadius: 100, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${xpInCurrentLevel}%`, borderRadius: 100, background: 'linear-gradient(90deg, #8B5CF6, #3461FF)', transition: 'width 1s ease-out' }} />
                  </div>
                  <span style={{ fontWeight: 800, color: '#8B5CF6', fontSize: '0.875rem' }}>{xpInCurrentLevel} / 100 XP</span>
                </div>
              </div>

              {/* High-Performance SVG Ring */}
              <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0, margin: '0 auto' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                  <motion.circle
                    initial={{ strokeDasharray: "0 264" }}
                    animate={{ strokeDasharray: `${(xpInCurrentLevel / 100) * 264} 264` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r="42" fill="none" stroke="url(#ringGradient)" strokeWidth="12" strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3461FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="outfit-font" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.04em' }}>{currentLevel}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Level</span>
                </div>
              </div>

            </motion.div>

            {/* ── BENTO: Daily Reward (Col 12) ── */}
            <motion.div variants={item} className="bento-item col-span-12 glass-card-premium card-glow-hover glow-amber" style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: canClaim ? '#F59E0B' : '#E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {canClaim ? <Zap color="white" size={24} fill="white" /> : <CheckCircle2 color="#94A3B8" size={24} />}
                </div>
                <div>
                  <h3 className="outfit-font" style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                    {canClaim ? "Kunlik mukofot kutmoqda!" : "Bugungi mukofot olingan"}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B', fontWeight: 500 }}>
                    {canClaim ? "Coinlaringizni hoziroq yig'ib oling." : "Ertaga qaytib keling, ketma-ketlikni buzmang!"}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClaimReward}
                disabled={!canClaim}
                style={{
                  padding: '12px 28px', borderRadius: 100, border: 'none',
                  background: canClaim ? '#F59E0B' : '#F1F5F9',
                  color: canClaim ? 'white' : '#94A3B8',
                  fontWeight: 800, fontSize: '0.9375rem', cursor: canClaim ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                  boxShadow: canClaim ? '0 8px 20px rgba(245,158,11,0.3)' : 'none'
                }}
              >
                {canClaim ? "Olish" : "Olindi"}
              </button>
            </motion.div>

            {/* ── BENTO: Stats Grid (Col 6) ── */}
            <motion.div variants={item} className="col-span-6" style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'inherit'
            }}>
              {STATS.map((s, i) => {
                let glowClass = 'glow-sky'
                if (i === 0) glowClass = 'glow-green'
                if (i === 1) glowClass = 'glow-sky'
                if (i === 2) glowClass = 'glow-purple'
                if (i === 3) glowClass = 'glow-red'
                
                return (
                <div key={i} className={`bento-item glass-card-premium card-glow-hover ${glowClass}`} style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.icon}
                    </div>
                    <span style={{ fontWeight: 700, color: '#64748B', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, fontFamily: '"Outfit", sans-serif' }}>
                    {s.value}
                  </div>
                </div>
              )})}
            </motion.div>

            {/* ── BENTO: Activity Calendar (Col 6) ── */}
            <motion.div variants={item} className="bento-item col-span-6 glass-card-premium card-glow-hover glow-green" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalendarIcon size={18} color="#10B981" />
                  </div>
                  <h3 className="outfit-font" style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>Aktivlik</h3>
                </div>
                <span style={{ background: '#F1F5F9', color: '#475569', padding: '4px 12px', borderRadius: 100, fontSize: '0.8125rem', fontWeight: 700 }}>
                  {["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"][new Date().getMonth()]}
                </span>
              </div>

              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map(day => (
                  <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>{day}</div>
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
                            background: isActive ? '#10B981' : (isToday ? '#F1F5F9' : 'transparent'),
                            color: isActive ? 'white' : (isToday ? '#10B981' : '#94A3B8'),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.8125rem', fontWeight: isActive || isToday ? 800 : 500,
                            border: isToday && !isActive ? '2px dashed #10B981' : 'none'
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

            {/* ── BENTO: Menu Actions (Col 12) ── */}
            <motion.div variants={item} className="bento-item col-span-12 glass-card-premium card-glow-hover glow-sky" style={{ padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {MENU_GROUPS[0].items.map((m, j) => (
                  <Link
                    key={j}
                    to={m.to}
                    style={{
                      padding: '16px', display: 'flex', alignItems: 'center', gap: 16,
                      textDecoration: 'none', borderRadius: 16,
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: m.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.icon}
                    </div>
                    <span style={{ flex: 1, fontWeight: m.bold ? 800 : 600, color: m.labelColor || '#0F172A', fontSize: '1rem' }}>
                      {m.label}
                    </span>
                    <ChevronRight size={20} color="#94A3B8" />
                  </Link>
                ))}
                
                <div style={{ height: 1, background: '#F1F5F9', margin: '8px 16px' }} />

                <button
                  onClick={handleSignOut}
                  style={{
                    padding: '16px', display: 'flex', alignItems: 'center', gap: 16,
                    border: 'none', background: 'transparent', width: '100%', textAlign: 'left',
                    borderRadius: 16, cursor: 'pointer', transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LogOut size={20} color="#EF4444" />
                  </div>
                  <span style={{ flex: 1, fontWeight: 700, color: '#EF4444', fontSize: '1rem' }}>
                    Tizimdan chiqish
                  </span>
                </button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)',
            padding: 16
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              style={{
                background: 'white', borderRadius: 28, border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 24px 60px rgba(15,23,42,0.15)', maxWidth: 460, width: '100%',
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="outfit-font" style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#0F172A' }}>
                  Profilni tahrirlash
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
                {/* Name field */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    To'liq ism
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Ismingizni kiriting"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #E2E8F0',
                      fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A', outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Avatar presets */}
                <div>
                  <label style={{ display: 'block', margin: '0 0 10px', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Avatar tanlang
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                    {AVATAR_PRESETS.map((url, idx) => {
                      const isSelected = editAvatar === url
                      return (
                        <button
                          key={idx}
                          onClick={() => setEditAvatar(url)}
                          style={{
                            padding: 4, borderRadius: '50%', border: isSelected ? '3px solid #3461FF' : '3px solid transparent',
                            background: isSelected ? '#EFF6FF' : 'transparent', cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box'
                          }}
                        >
                          <img src={url} alt={`Preset ${idx}`} style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', objectFit: 'cover' }} />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E2E8F0',
                    background: 'white', color: '#64748B', fontWeight: 800, fontSize: '0.9375rem', cursor: 'pointer'
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg,#3461FF 0%,#8B5CF6 100%)', color: 'white',
                    fontWeight: 800, fontSize: '0.9375rem', cursor: isSaving ? 'default' : 'pointer',
                    opacity: isSaving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
