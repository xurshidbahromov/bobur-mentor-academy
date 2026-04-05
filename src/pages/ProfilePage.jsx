import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flame, Coins, BookOpen, Target, LogOut,
  Lock, Check, ShoppingBag, ArrowRight, Star, Trophy
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useStreak } from '../hooks/useStreak'

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
          <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, color: '#92400E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kunlik Streak</p>
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
          {streak === 0 ? "Bugun kiring va streakni boshlang" : `${7 - filled} kun qoldi mukofotga`}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#D97706', fontSize: '0.8125rem', fontWeight: 700 }}>
          <Trophy size={13} strokeWidth={2} /> {longest} kun
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
          <p style={{ margin: '0 0 4px', fontSize: '0.7rem', fontWeight: 700, color: '#065F46', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coin balansi</p>
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

// ════════════════════════════════════════════════════════════════
// COIN SHOP
// ════════════════════════════════════════════════════════════════
const PACKAGES = [
  { coins: 50,  price: '9 900',  label: 'Starter', color: '#6366F1', popular: false },
  { coins: 200, price: '34 900', label: 'Popular',  color: '#3461FF', popular: true  },
  { coins: 500, price: '74 900', label: 'Pro',      color: '#8B5CF6', popular: false },
]

function CoinShop() {
  return (
    <div style={{ background: 'white', border: '1.5px solid rgba(100,120,255,0.1)', borderRadius: 20, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ShoppingBag size={20} color="#D97706" strokeWidth={1.75} />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>Coin sotib olish</p>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8125rem' }}>Click • Payme</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PACKAGES.map(pkg => (
          <motion.button key={pkg.coins}
            whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => alert(`Tez orada! ${pkg.coins} coin = ${pkg.price} so'm`)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
              border: pkg.popular ? `1.5px solid ${pkg.color}30` : '1.5px solid rgba(100,120,255,0.08)',
              background: pkg.popular ? `${pkg.color}06` : 'transparent',
              position: 'relative',
            }}
          >
            {pkg.popular && (
              <span style={{ position: 'absolute', top: -1, right: 12, background: pkg.color, color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: '0 0 6px 6px', letterSpacing: '0.06em' }}>
                POPULAR
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: `${pkg.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={18} color={pkg.color} strokeWidth={1.75} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{pkg.coins} Coin</p>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>{pkg.label}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ margin: 0, fontWeight: 900, color: pkg.color, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{pkg.price} so'm</p>
              <ArrowRight size={16} color={pkg.color} strokeWidth={2.5} />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// PROFILE PAGE
// ════════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { profile, loading, canClaim, claiming, justClaimed, claimDailyReward } = useStreak()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #3461FF', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20, padding: 24, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(148,163,184,0.08)', border: '1.5px solid rgba(148,163,184,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock size={34} color="#94A3B8" strokeWidth={1.5} />
        </div>
        <div>
          <h2 style={{ margin: '0 0 8px', color: '#0F172A', letterSpacing: '-0.03em', fontSize: '1.375rem' }}>Profil uchun kirish kerak</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9375rem' }}>Hisobingizga kiring va statistikangizni koring</p>
        </div>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '13px 28px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #3461FF, #214CE5)', color: 'white', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 16px rgba(52,97,255,0.3)' }}>
            Tizimga kirish
          </motion.button>
        </Link>
      </div>
    )
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const name = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 20px 64px' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid white', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #3461FF, #214CE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'white', boxShadow: '0 3px 14px rgba(52,97,255,0.28)' }}>
                {name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: '50%', background: '#10B981', border: '2px solid white' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: '0 0 3px', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>{user.email}</p>
          </div>

          <motion.button onClick={handleSignOut} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 11, border: '1.5px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)', color: '#DC2626', fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}
          >
            <LogOut size={15} strokeWidth={2} /> Chiqish
          </motion.button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[
            { icon: <BookOpen size={20} color="#3461FF" strokeWidth={1.75} />, label: 'Tugatilgan darslar', value: '0', bg: 'rgba(52,97,255,0.08)' },
            { icon: <Target size={20} color="#8B5CF6" strokeWidth={1.75} />,   label: 'Yechilgan testlar',  value: '0', bg: 'rgba(139,92,246,0.08)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1.5px solid rgba(100,120,255,0.1)', borderRadius: 18, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.025em' }}>{s.value}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Streak ── */}
        <div style={{ marginBottom: 10 }}>
          <StreakCard streak={profile?.streak_count || 0} longest={profile?.longest_streak || 0} />
        </div>

        {/* ── Coins ── */}
        <div style={{ marginBottom: 10 }}>
          <CoinCard coins={profile?.coins || 0} canClaim={canClaim} claiming={claiming} justClaimed={justClaimed} onClaim={claimDailyReward} />
        </div>

        {/* ── Shop ── */}
        <div style={{ marginBottom: 20 }}>
          <CoinShop />
        </div>

        {/* ── CTA ── */}
        <Link to="/courses" style={{ textDecoration: 'none', display: 'block' }}>
          <motion.div whileHover={{ scale: 1.01 }}
            style={{ background: 'linear-gradient(135deg, #3461FF, #214CE5)', borderRadius: 18, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 6px 20px rgba(52,97,255,0.25)', cursor: 'pointer' }}
          >
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Davom eting</p>
              <p style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Barcha darslarni ko'rish</p>
            </div>
            <ArrowRight size={22} color="white" strokeWidth={2.5} />
          </motion.div>
        </Link>

      </motion.div>
    </div>
  )
}
