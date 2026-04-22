// src/pages/LeaderboardPage.jsx
// Top 50 o'quvchilar reytingi — coins & streak asosida.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Coins, Crown, Star, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─── Minimalist avatar fallback ──────────────────────
function Avatar({ user, size = 44 }) {
  const initial = (user.full_name || 'U')[0].toUpperCase()

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: '#F1F5F9', border: '1px solid rgba(15,23,42,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#475569', fontWeight: 800, overflow: 'hidden',
      fontSize: size >= 52 ? '1.375rem' : size >= 40 ? '1.125rem' : '0.875rem',
    }}>
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initial
      )}
    </div>
  )
}

// ─── Top-3 Podium ──────────────────────────────────
const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_HEIGHTS = [90, 64, 52]   // visual podium heights
const PODIUM_ORDER = [1, 0, 2]      // display order: 2nd, 1st, 3rd

function PodiumCard({ user, rank, isSelf, tab }) {
  const isFirst = rank === 0

  // Assign glow color based on rank: Gold (amber), Silver (sky), Bronze (redish/orange)
  let glowClass = ''
  if (rank === 0) glowClass = 'glow-amber'
  else if (rank === 1) glowClass = 'glow-sky'
  else if (rank === 2) glowClass = 'glow-red' // acting as bronze here

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
      transition={{ delay: 0.15 + rank * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`card-glow-hover ${glowClass}`}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: isFirst ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(32px) saturate(2)',
        WebkitBackdropFilter: 'blur(32px) saturate(2)',
        border: isFirst ? '1.8px solid #FDE68A' : '1px solid var(--border-medium)',
        boxShadow: isFirst ? '0 16px 40px rgba(245,158,11,0.1)' : '0 8px 32px rgba(15,23,42,0.05)',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        borderBottomLeftRadius: isFirst ? 24 : 16, borderBottomRightRadius: isFirst ? 24 : 16,
        padding: isFirst ? '18px 8px' : '12px 6px',
        zIndex: isFirst ? 10 : 1, position: 'relative',
        marginTop: isFirst ? -24 : 0, maxWidth: '33.33%', cursor: 'pointer'
      }}
    >
      {isFirst && (
        <motion.div animate={{ y: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
          <Crown size={20} color="#F59E0B" style={{ filter: 'drop-shadow(0 2px 8px rgba(245,158,11,0.4))' }} />
        </motion.div>
      )}
      <div style={{
        padding: isFirst ? 4 : 2, borderRadius: '50%',
        background: rank === 0
          ? 'linear-gradient(135deg, #F59E0B, #D97706)'
          : rank === 1
            ? 'linear-gradient(135deg, #94A3B8, #64748B)'
            : 'linear-gradient(135deg, #B45309, #92400E)',
        boxShadow: isFirst ? '0 4px 16px rgba(245,158,11,0.3)' : 'none'
      }}>
        <Avatar user={user} size={isFirst ? 50 : 40} />
      </div>
      <p style={{ margin: 0, fontSize: isFirst ? '1.25rem' : '1rem' }}>{MEDALS[rank]}</p>
      <p className="outfit-font" style={{
        margin: 0, fontWeight: 800, fontSize: isFirst ? '0.9375rem' : '0.8125rem', color: '#0F172A',
        textAlign: 'center', lineHeight: 1.2,
        width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {user.full_name?.split(' ')[0] || 'O\'quvchi'}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: isFirst ? 'rgba(245,158,11,0.1)' : 'rgba(15,23,42,0.04)',
        borderRadius: 100, padding: '4px 10px', marginTop: 4
      }}>
        {tab === 'streak'
          ? <><Flame size={12} color={isFirst ? '#D97706' : '#64748B'} /><span className="outfit-font" style={{ fontWeight: 800, fontSize: '0.8125rem', color: isFirst ? '#92400E' : '#334155' }}>{user.streak_count}</span></>
          : <><Coins size={12} color={isFirst ? '#D97706' : '#64748B'} /><span className="outfit-font" style={{ fontWeight: 800, fontSize: '0.8125rem', color: isFirst ? '#92400E' : '#334155' }}>{user.coins?.toLocaleString()}</span></>
        }
      </div>
    </motion.div>
  )
}

function LeaderRow({ user, rank, isSelf, tab }) {
  const glowClasses = ['', 'glow-purple', 'glow-green', 'glow-amber', 'glow-sky']
  const glowClass = glowClasses[rank % glowClasses.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: Math.min((rank - 3) * 0.05 + 0.3, 0.8), duration: 0.4, ease: "easeOut" }}
      className={`card-glow-hover ${glowClass}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', borderRadius: 20,
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(24px) saturate(2)',
        WebkitBackdropFilter: 'blur(24px) saturate(2)',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 4px 12px rgba(15,23,42,0.04)',
        marginBottom: 8,
        position: 'relative', cursor: 'pointer'
      }}
    >
      <span style={{
        width: 24, textAlign: 'center', fontWeight: 800,
        fontSize: '0.9375rem', flexShrink: 0,
        color: '#94A3B8',
      }}>
        {rank + 1}
      </span>

      <Avatar user={user} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="outfit-font" style={{
          margin: '0 0 2px', fontWeight: 700, fontSize: '0.9375rem',
          color: '#0F172A',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user.full_name || 'O\'quvchi'}
          {isSelf && <span style={{ marginLeft: 6, fontSize: '0.625rem', fontWeight: 800, color: 'white', background: '#3461FF', padding: '2px 6px', borderRadius: 100 }} >Siz</span>}
        </p>
        {user.streak_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Flame size={12} color="#F59E0B" />
            <span style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
              {user.streak_count} kun streak
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, background: '#F8FAFC', padding: '6px 10px', borderRadius: 100 }}>
        {tab === 'streak'
          ? <><Flame size={14} color="#F59E0B" /><span className="outfit-font" style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>{user.streak_count}</span></>
          : <><Coins size={14} color="#F59E0B" /><span className="outfit-font" style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>{user.coins?.toLocaleString()}</span></>
        }
      </div>
    </motion.div>
  )
}

// ─── Skeleton loader ──────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="skeleton-loader" style={{
          height: 64, borderRadius: 16, marginBottom: 12,
          border: '1px solid rgba(15,23,42,0.03)',
        }} />
      ))}
    </>
  )
}

function PodiumSkeleton() {
  const heights = [140, 180, 120]
  const order = [1, 0, 2]
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'center', marginBottom: 20, paddingTop: 20 }}>
      {order.map((rank, i) => (
        <div key={rank} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="skeleton-loader" style={{ width: 52, height: 52, borderRadius: '50%' }} />
          <div className="skeleton-loader" style={{ height: heights[i], width: '100%', borderRadius: '16px 16px 0 0' }} />
        </div>
      ))}
    </div>
  )
}

// ─── Main component ────────────────────────────────
export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('coins') // 'coins' | 'streak'
  const [myRank, setMyRank] = useState(-1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const col = tab === 'coins' ? 'coins' : 'streak_count'
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, coins, streak_count')
      .order(col, { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          setLeaders(data)
          if (user) setMyRank(data.findIndex(l => l.id === user.id))
        }
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [tab, user])

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  return (
    <>
      <style>{`
        .leader-page-wrapper { width: 100%; padding-bottom: 80px; }
        .leader-container { max-width: 1040px; margin: 0 auto; }
        
        .leader-hero {
          background: linear-gradient(145deg, #1E1B4B 0%, #78350F 50%, #D97706 100%);
          position: relative;
          overflow: hidden;
          padding: 60px 0 160px;
          border-radius: 0 0 40px 40px;
          margin-bottom: -120px;
          box-shadow: 0 20px 40px rgba(15,23,42,0.15);
        }
        
        @media (max-width: 768px) {
          .leader-hero {
            padding: 40px 0 140px;
            border-radius: 0 0 32px 32px;
            margin-bottom: -80px;
          }
        }
        
        .leader-content { padding: 0 24px; position: relative; zIndex: 2; }
        @media (max-width: 768px) { .leader-content { padding: 0 16px; } }
      `}</style>

      <div className="leader-page-wrapper">

        {/* ── FULL WIDTH HERO ── */}
        <div className="leader-hero">
          <div style={{ position: 'absolute', top: -50, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(253,230,138,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Floating Icons (Matching pattern: One icon type per page) */}
          {[
            { top: '15%', right: '10%', size: 48, delay: 0 },
            { top: '55%', right: '25%', size: 28, delay: 0.4 },
            { top: '25%', left: '8%', size: 36, delay: 0.2 },
            { bottom: '25%', left: '20%', size: 22, delay: 0.6 },
          ].map((c, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.5, delay: c.delay, ease: 'easeInOut' }}
              style={{ position: 'absolute', opacity: 0.12, pointerEvents: 'none', ...c }}
            >
              <Trophy size={c.size} color="white" />
            </motion.div>
          ))}

          <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Trophy size={14} color="#FDE68A" />
                      <span style={{ color: '#FEF3C7', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Global Peshqadamlar</span>
                    </div>
                  </div>
                  <h1 className="outfit-font" style={{ margin: '0 0 8px', fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                    Reyting
                  </h1>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontWeight: 500 }}>
                    Top 50 o'quvchilar ro'yxati
                  </p>
                </div>

                {myRank >= 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(24px) saturate(2)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 100, padding: '10px 24px',
                    boxShadow: '0 8px 32px rgba(15,23,42,0.1)',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem', fontWeight: 600 }}>Sizning o'rningiz:</span>
                    <span style={{ color: 'white', fontWeight: 900, fontSize: '1.25rem' }}>#{myRank + 1}</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Segmented Control (Apple style) ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex', marginBottom: 20,
                background: 'rgba(0,0,0,0.15)', borderRadius: 100, padding: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: 400
              }}
            >
              {[
                { key: 'coins', icon: <Coins size={16} />, label: 'Coinlar' },
                { key: 'streak', icon: <Flame size={16} />, label: 'Streak' },
              ].map(t => {
                const isActive = tab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    style={{
                      flex: 1, padding: '10px 12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontWeight: isActive ? 800 : 600, fontSize: '0.9375rem', position: 'relative',
                      background: 'transparent', color: isActive ? '#78350F' : 'rgba(255,255,255,0.6)',
                      WebkitTapHighlightColor: 'transparent', transition: 'color 0.3s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 1
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="leaderboardTab"
                        style={{ position: 'absolute', inset: 0, background: '#FDE68A', borderRadius: 100, boxShadow: '0 2px 8px rgba(15,23,42,0.15)' }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t.icon} {t.label}
                    </span>
                  </button>
                )
              })}
            </motion.div>

          </div>
        </div>

        {/* ── CONTENT (Overlapping Hero) ── */}
        <div className="leader-container">
          <div className="leader-content">

            {/* Podium — only if at least 3 users */}
            {loading ? (
              <PodiumSkeleton />
            ) : !loading && top3.length === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: 'transparent',
                  marginBottom: 20, paddingTop: 20,
                  display: 'flex', alignItems: 'flex-end', gap: 12, justifyContent: 'center'
                }}
              >
                {PODIUM_ORDER.map(rank => (
                  <PodiumCard
                    key={rank}
                    user={top3[rank]}
                    rank={rank}
                    isSelf={top3[rank]?.id === user?.id}
                    tab={tab}
                  />
                ))}
              </motion.div>
            )}

            {/* List */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(32px) saturate(2)',
              WebkitBackdropFilter: 'blur(32px) saturate(2)',
              borderRadius: 32, padding: '20px',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.05)',
            }}>
              {loading ? (
                <SkeletonRows />
              ) : leaders.length === 0 ? (
                <div style={{
                  padding: '80px 20px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16
                  }}>
                    <Trophy size={28} color="#F59E0B" />
                  </div>
                  <p className="outfit-font" style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                    Hali hech kim yo'q
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: '#64748B' }}>
                    Birinchi bo'lib reyting listiga kiring!
                  </p>
                </div>
              ) : (
                <>
                  {/* If podium shown, only render ranks 4+ in list */}
                  {top3.length < 3
                    ? leaders.map((u, i) => <LeaderRow key={u.id} user={u} rank={i} isSelf={u.id === user?.id} tab={tab} />)
                    : rest.map((u, i) => <LeaderRow key={u.id} user={u} rank={i + 3} isSelf={u.id === user?.id} tab={tab} />)
                  }
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
