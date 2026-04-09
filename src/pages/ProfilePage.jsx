import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Target, LogOut, Lock, ArrowRight, LifeBuoy, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
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
          <h2 style={{ margin: '0 0 8px', color: '#0F172A', letterSpacing: '-0.03em', fontSize: '1.375rem', fontWeight: 800 }}>Profil yopiq</h2>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9375rem' }}>Hisobingizga kiring va sozlamalarni boshqaring</p>
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
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '80px 20px 100px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid white', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #3461FF, #214CE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'white', boxShadow: '0 3px 14px rgba(52,97,255,0.28)' }}>
                {name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 1, right: 1, width: 14, height: 14, borderRadius: '50%', background: '#10B981', border: '2px solid white' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: '0 0 4px', fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>{user.email}</p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
          {[
            { icon: <BookOpen size={20} color="#3461FF" strokeWidth={1.75} />, label: 'Tugatilgan darslar', value: '0', bg: 'rgba(52,97,255,0.08)' },
            { icon: <Target size={20} color="#8B5CF6" strokeWidth={1.75} />,   label: 'Yechilgan testlar',  value: '0', bg: 'rgba(139,92,246,0.08)' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', border: '1.5px solid rgba(100,120,255,0.1)', borderRadius: 18, padding: '16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, letterSpacing: '-0.025em', paddingBottom: '4px' }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Settings & Actions ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid rgba(100,120,255,0.1)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: 24 }}>
          {/* Settings */}
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1.5px solid rgba(100,120,255,0.08)', cursor: 'pointer' }} onClick={() => alert('Sozlamalar tez orada...')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(100,116,139,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={18} color="#475569" />
            </div>
            <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#334155' }}>Sozlamalar</p>
            <ArrowRight size={18} color="#94A3B8" />
          </div>

          {/* Support */}
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1.5px solid rgba(100,120,255,0.08)', cursor: 'pointer' }} onClick={() => alert('Qo\'llab-quvvatlash tez orada...')}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LifeBuoy size={18} color="#10B981" />
            </div>
            <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#334155' }}>Qo'llab-quvvatlash</p>
            <ArrowRight size={18} color="#94A3B8" />
          </div>

          {/* Logout */}
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', background: 'rgba(239,68,68,0.02)' }} onClick={handleSignOut}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} color="#EF4444" />
            </div>
            <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#EF4444' }}>Tizimdan chiqish</p>
          </div>
        </div>

      </motion.div>
    </div>
  )
}
