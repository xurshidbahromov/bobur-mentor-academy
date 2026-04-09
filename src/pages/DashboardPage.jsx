import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'
import { useCourses } from '../hooks/useCourses'
import { Coins, Flame, ChevronRight, PlayCircle, BookOpen } from 'lucide-react'

// Apple-inspired frosted glass card
const GlassCard = ({ children, style = {} }) => (
  <div style={{
    background: 'var(--bg-glass)',
    backdropFilter: 'var(--blur-glass)',
    WebkitBackdropFilter: 'var(--blur-glass)',
    border: '1px solid var(--border-glass)',
    borderRadius: '20px',
    padding: '20px',
    boxShadow: 'var(--shadow-glass)',
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

  return (
    <div style={{
      maxWidth: '100%',
      margin: '0 auto',
      padding: '76px 20px 100px 20px', // padded for top nav & bottom tab
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* ── Greeting Section ── */}
      <section style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--bg-glass)',
          border: '2px solid var(--color-primary-dim)',
          flexShrink: 0
        }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)' }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Hush kelibsiz qahramon,</p>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {profile?.full_name || user?.email?.split('@')[0] || 'O\'quvchi'}
          </h1>
        </div>
      </section>

      {/* ── Stats & Rewards Section ── */}
      <section style={{ display: 'flex', gap: '16px' }}>
        {/* Streak Card */}
        <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="#f59e0b" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Olov davri</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{profile?.streak_count || 0}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>kun</span>
          </div>
        </GlassCard>

        {/* Coins Card */}
        <GlassCard style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(250, 204, 21, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} color="#facc15" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Coinlar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{profile?.coins || 0}</span>
          </div>
        </GlassCard>
      </section>

      {/* Daily Reward Button */}
      {canClaim ? (
        <button
          onClick={claimDailyReward}
          disabled={claiming}
          className="btn-primary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', animation: 'pulse 2s infinite' }}
        >
          {claiming ? 'Olinmoqda...' : 'Kunlik coiningizni oling'} <Coins size={18} />
        </button>
      ) : justClaimed ? (
        <div style={{
          width: '100%', padding: '16px', borderRadius: '14px', background: 'rgba(52, 211, 153, 0.1)',
          color: '#10b981', textAlign: 'center', fontWeight: 600, border: '1px solid rgba(52, 211, 153, 0.2)'
        }}>
          Ajoyib! Siz +1 coin oldingiz 🎉
        </div>
      ) : null}

      {/* ── Continue Learning ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Davom etish</h2>
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
                  width: '64px',
                  height: '64px',
                  borderRadius: '14px',
                  background: 'var(--color-primary-dim)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <PlayCircle size={28} color="var(--color-primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookOpen size={14} /> {course.lesson_count || 0} dars
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/courses/${course.id}`)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
