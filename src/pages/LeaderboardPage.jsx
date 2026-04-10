// src/pages/LeaderboardPage.jsx
// Top 50 o'quvchilar reytingi — coins & streak asosida.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Flame, Coins, Crown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─── Coloured avatar fallback ──────────────────────
const AVATAR_COLORS = [
  ['#3461FF', '#214CE5'], ['#8B5CF6', '#7C3AED'],
  ['#10B981', '#059669'], ['#F59E0B', '#D97706'],
  ['#EF4444', '#DC2626'], ['#06B6D4', '#0891B2'],
]

function Avatar({ user, size = 44 }) {
  const initial = (user.full_name || 'U')[0].toUpperCase()
  const [c1, c2] = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length]

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url} alt={user.full_name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 900,
      fontSize: size >= 52 ? '1.375rem' : size >= 40 ? '1.125rem' : '0.875rem',
    }}>
      {initial}
    </div>
  )
}

// ─── Top-3 Podium ──────────────────────────────────
const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_HEIGHTS = [90, 64, 52]   // visual podium heights
const PODIUM_ORDER   = [1, 0, 2]      // display order: 2nd, 1st, 3rd

function PodiumCard({ user, rank, isSelf, tab }) {
  const isFirst = rank === 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + rank * 0.08 }}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        background: isSelf ? 'rgba(52,97,255,0.06)' : 'transparent',
        border: isSelf ? '2px solid rgba(52,97,255,0.18)' : '2px solid transparent',
        borderRadius: 18, padding: isFirst ? '16px 8px' : '12px 8px',
      }}
    >
      {isFirst && <Crown size={16} color="#F59E0B" />}
      <div style={{
        padding: isFirst ? 3 : 2, borderRadius: '50%',
        background: rank === 0
          ? 'linear-gradient(135deg, #F59E0B, #D97706)'
          : rank === 1
          ? 'linear-gradient(135deg, #94A3B8, #64748B)'
          : 'linear-gradient(135deg, #B45309, #92400E)',
      }}>
        <Avatar user={user} size={isFirst ? 60 : 48} />
      </div>
      <p style={{ margin: 0, fontSize: '1.25rem' }}>{MEDALS[rank]}</p>
      <p style={{
        margin: 0, fontWeight: 800, fontSize: '0.875rem', color: '#0F172A',
        textAlign: 'center', lineHeight: 1.2,
        maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {user.full_name?.split(' ')[0] || 'O\'quvchi'}
      </p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        background: tab === 'streak' ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.1)',
        borderRadius: 20, padding: '3px 10px',
      }}>
        {tab === 'streak'
          ? <><Flame size={12} color="#F59E0B" /><span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#92400E' }}>{user.streak_count}</span></>
          : <><Coins size={12} color="#F59E0B" /><span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#92400E' }}>{user.coins?.toLocaleString()}</span></>
        }
      </div>
    </motion.div>
  )
}

// ─── Row for rank 4+ ──────────────────────────────
function LeaderRow({ user, rank, isSelf, tab }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min((rank - 3) * 0.03 + 0.4, 0.8) }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 14,
        background: isSelf ? 'rgba(52,97,255,0.06)' : 'transparent',
        border: isSelf ? '1.5px solid rgba(52,97,255,0.18)' : '1.5px solid transparent',
      }}
    >
      {/* Rank number */}
      <span style={{
        width: 28, textAlign: 'center', fontWeight: 800,
        fontSize: '0.9375rem', flexShrink: 0,
        color: rank < 10 ? '#3461FF' : '#CBD5E1',
      }}>
        {rank + 1}
      </span>

      <Avatar user={user} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 2px', fontWeight: 700, fontSize: '0.9375rem',
          color: isSelf ? '#3461FF' : '#0F172A',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user.full_name || 'O\'quvchi'}
          {isSelf && <span style={{ marginLeft: 6, fontSize: '0.75rem', fontWeight: 600, color: '#3461FF' }}>(Siz)</span>}
        </p>
        {user.streak_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Flame size={11} color="#F59E0B" />
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
              {user.streak_count} kun streak
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
        {tab === 'streak'
          ? <><Flame size={14} color="#F59E0B" /><span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>{user.streak_count}</span></>
          : <><Coins size={14} color="#F59E0B" /><span style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>{user.coins?.toLocaleString()}</span></>
        }
      </div>
    </motion.div>
  )
}

// ─── Skeleton loader ──────────────────────────────
function SkeletonRows() {
  return (
    <>
      <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{
          height: 62, borderRadius: 14, background: '#E2E8F0',
          margin: '0 4px 6px', opacity: 1 - i * 0.1,
          animation: 'shimmer 1.4s infinite',
        }} />
      ))}
    </>
  )
}

// ─── Main component ────────────────────────────────
export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaders, setLeaders]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('coins') // 'coins' | 'streak'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLeaders([])

    const col = tab === 'coins' ? 'coins' : 'streak_count'
    supabase
      .from('profiles')
      .select('id, full_name, avatar_url, coins, streak_count')
      .order(col, { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setLeaders(data)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [tab])

  const top3   = leaders.slice(0, 3)
  const rest   = leaders.slice(3)
  const myRank = user ? leaders.findIndex(l => l.id === user.id) : -1

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 80px' }}>

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20 }}>
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1e3a8a 100%)',
          borderRadius: 24, padding: '24px',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(15,23,42,0.22)',
        }}>
          <Trophy size={110} color="rgba(255,255,255,0.04)"
            style={{ position: 'absolute', right: -10, top: -10, transform: 'rotate(15deg)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: myRank >= 0 ? 14 : 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Trophy size={24} color="#F59E0B" />
              </div>
              <div>
                <h1 className="outfit-font" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>
                  Kuchlilar Doskasi
                </h1>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem' }}>
                  Top 50 o'quvchilar reytingi
                </p>
              </div>
            </div>

            {myRank >= 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, padding: '8px 14px',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Sizning o'rningiz:</span>
                <span style={{ color: '#F59E0B', fontWeight: 800, fontSize: '1rem' }}>#{myRank + 1}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{
          display: 'flex', gap: 0, marginBottom: 20,
          background: 'white', borderRadius: 16, padding: 4,
          border: '1.5px solid rgba(100,120,255,0.1)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {[
          { key: 'coins',  icon: <Coins  size={16} />, label: 'Coinlar' },
          { key: 'streak', icon: <Flame  size={16} />, label: 'Streak'  },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '11px', borderRadius: 12,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 700, fontSize: '0.9375rem',
              background: tab === t.key ? 'linear-gradient(135deg, #3461FF, #214CE5)' : 'transparent',
              color: tab === t.key ? 'white' : '#64748B',
              transition: 'all 0.2s',
              boxShadow: tab === t.key ? '0 4px 12px rgba(52,97,255,0.3)' : 'none',
              WebkitTapHighlightColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </motion.div>

      {/* Podium — only if at least 3 users */}
      {!loading && top3.length === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: 'white', borderRadius: 24, padding: '20px 12px 16px',
            border: '1.5px solid rgba(100,120,255,0.08)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            marginBottom: 14,
            display: 'flex', alignItems: 'flex-end', gap: 6,
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
        background: 'white', borderRadius: 24, padding: '8px',
        border: '1.5px solid rgba(100,120,255,0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}>
        {loading ? (
          <SkeletonRows />
        ) : leaders.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94A3B8' }}>
            <Trophy size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>Hozircha hech kim yo'q</p>
          </div>
        ) : (
          <>
            {/* If podium shown, only render ranks 4+ in list */}
            {top3.length < 3
              ? leaders.map((u, i) => <LeaderRow key={u.id} user={u} rank={i} isSelf={u.id === user?.id} tab={tab} />)
              : rest.map((u,    i) => <LeaderRow key={u.id} user={u} rank={i + 3} isSelf={u.id === user?.id} tab={tab} />)
            }
          </>
        )}
      </div>

    </div>
  )
}
