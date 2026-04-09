import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'
import { useCourses } from '../hooks/useCourses'
import { Coins, Flame, ChevronRight, PlayCircle, BookOpen, Check, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ════════════════════════════════════════════════════════════════
// STREAK CARD
// ════════════════════════════════════════════════════════════════
function StreakCard({ streak, longest }) {
  const filled = streak % 7 || (streak > 0 ? 7 : 0)

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)',
      border: '1.5px solid rgba(245,158,11,0.2)',
      borderRadius: 20, padding: '22px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -32, right: -32, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, color: '#92400E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Olov davri</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#D97706', lineHeight: 1, letterSpacing: '-0.03em' }}>{streak}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#B45309' }}>kun</span>
          </div>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={26} color="#F59E0B" strokeWidth={1.75} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < filled ? '#F59E0B' : 'rgba(217,119,6,0.12)', transition: 'background 0.3s ease' }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', color: '#B45309', fontWeight: 500 }}>
          {streak === 0 ? "Bugun kiring va boshlang" : `${7 - filled} kun qoldi bonusga`}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: '0.8125rem', fontWeight: 700 }}>
          <Trophy size={13} strokeWidth={2} /> MAX: {longest} kun
        </span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// COIN CARD
// ════════════════════════════════════════════════════════════════
function CoinCard({ coins, canClaim, claiming, justClaimed, onClaim }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
      border: '1.5px solid rgba(16,185,129,0.2)',
      borderRadius: 20, padding: '22px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -32, left: -32, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, color: '#065F46', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sizning balans</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#059669', lineHeight: 1, letterSpacing: '-0.03em' }}>{coins}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#065F46' }}>coin</span>
          </div>
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Coins size={26} color="#10B981" strokeWidth={1.75} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {justClaimed ? (
          <motion.div key="ok"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', borderRadius: 14, background: 'rgba(16,185,129,0.1)', color: '#059669', fontWeight: 700, fontSize: '0.9375rem' }}
          >
            <Check size={16} strokeWidth={3} /> +1 Coin qo'shildi!
          </motion.div>
        ) : (
          <motion.button key="btn"
            onClick={onClaim} disabled={!canClaim || claiming}
            whileHover={canClaim ? { scale: 1.02 } : {}}
            whileTap={canClaim ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{
              width: '100%', padding: '13px', borderRadius: 14, border: 'none',
              background: canClaim ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(16,185,129,0.08)',
              color: canClaim ? 'white' : '#6EE7B7',
              fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit',
              cursor: canClaim ? 'pointer' : 'not-allowed',
              boxShadow: canClaim ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
            }}
          >
            {claiming ? 'Yuklanmoqda...' : canClaim ? 'Bugungi coinni olish (+1)' : 'Bugun olindi — ertaga qaytib keling'}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// Apple-inspired frosted glass card
const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: 'white',
    border: '1.5px solid rgba(100,120,255,0.1)',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    ...style
  }}>
    {children}
  </div>
)

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const { canClaim, claiming, justClaimed, claimDailyReward } = useStreak()
  const { courses, loading: coursesLoading } = useCourses()
  const navigate = useNavigate()

  // For display purposes, we take the top 2 courses
  const topCourses = courses.slice(0, 2)

  // Wait until user is fully loaded to prevent flash
  if (!user || !profile) return null

  return (
    <div style={{
      maxWidth: '620px',
      margin: '0 auto',
      padding: '76px 20px 100px 20px', // padded for top nav & bottom tab
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        
        {/* ── Greeting Section ── */}
        <section style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden',
            border: '2px solid rgba(52,97,255,0.2)', flexShrink: 0
          }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3461FF, #214CE5)', color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '2px' }}>Hush kelibsiz qahramon,</p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {profile?.full_name || user?.email?.split('@')[0] || 'O\'quvchi'}
            </h1>
          </div>
        </section>

        {/* ── Stats & Rewards Section ── */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          <CoinCard coins={profile.coins} canClaim={canClaim} claiming={claiming} justClaimed={justClaimed} onClaim={claimDailyReward} />
          <StreakCard streak={profile.streak_count} longest={profile.longest_streak} />
        </section>

        {/* ── Continue Learning ── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Davom etish</h2>
            <Link to="/courses" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              Barchasi <ChevronRight size={16} style={{ marginTop: '2px' }} />
            </Link>
          </div>

          {coursesLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="skeleton-loader" style={{ height: '100px', borderRadius: '16px' }} />
              <div className="skeleton-loader" style={{ height: '100px', borderRadius: '16px' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topCourses.map(course => (
                <GlassCard key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '14px', background: 'rgba(52,97,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <PlayCircle size={28} color="var(--color-primary)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {course.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={14} /> {course.lesson_count || 0} dars
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/courses/${course.id}`)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #3461FF, #214CE5)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(52,97,255,0.3)'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

      </motion.div>
    </div>
  )
}
