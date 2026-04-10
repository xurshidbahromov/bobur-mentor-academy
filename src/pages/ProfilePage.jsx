// src/pages/ProfilePage.jsx
// Auth zone: Avatar, stats, settings va chiqish.
// Admin uchun Admin Panel havolasi ham ko'rinadi.

import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { BookOpen, CheckCircle2, Flame, LogOut, Settings, ArrowRight, LifeBuoy, Trophy, ShieldCheck } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    localStorage.removeItem('bma_tg_autologin')
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 16px' }}>
        {[80, 48, 100].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 16, background: '#E2E8F0', marginBottom: 12 }} />
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

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 40px' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

        {/* ── Avatar & Name ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid white', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg, #3461FF, #214CE5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.625rem', fontWeight: 900, color: 'white', boxShadow: '0 4px 16px rgba(52,97,255,0.28)' }}>
                {name[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#10B981', border: '2px solid white' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: '0 0 3px', fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.025em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
            {isAdmin && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, background: 'rgba(52,97,255,0.1)', color: '#3461FF', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700 }}>
                <ShieldCheck size={11} /> Admin
              </span>
            )}
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { icon: <BookOpen size={18} color="#3461FF" />, bg: 'rgba(52,97,255,0.08)', value: '0', label: 'Darslar' },
            { icon: <CheckCircle2 size={18} color="#8B5CF6" />, bg: 'rgba(139,92,246,0.08)', value: '0', label: 'Quizlar' },
            { icon: <Flame size={18} color="#F59E0B" />, bg: 'rgba(245,158,11,0.08)', value: profile?.streak_count ?? 0, label: 'Streak' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white', border: '1.5px solid rgba(100,120,255,0.08)',
              borderRadius: 16, padding: '14px 10px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                {s.icon}
              </div>
              <p style={{ margin: '0 0 2px', fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.02em' }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Menu Items ── */}
        <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid rgba(100,120,255,0.08)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          {/* Admin link (conditional) */}
          {isAdmin && (
            <MenuItem
              to="/admin"
              icon={<ShieldCheck size={18} color="#3461FF" />}
              iconBg="rgba(52,97,255,0.12)"
              label="Admin Panel"
              labelColor="#3461FF"
              bold
              borderBottom
            />
          )}

          <MenuItem
            to="/leaderboard"
            icon={<Trophy size={18} color="#F59E0B" />}
            iconBg="rgba(245,158,11,0.1)"
            label="Kuchlilar doskasi"
            borderBottom
          />

          <MenuItem
            to="/about"
            icon={<span style={{ color: '#3461FF', fontWeight: 800, fontSize: '16px', fontFamily: 'serif', fontStyle: 'italic' }}>i</span>}
            iconBg="rgba(52,97,255,0.08)"
            label="Biz haqimizda"
            borderBottom
          />

          <div
            style={{
              padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', background: 'rgba(239,68,68,0.02)',
              WebkitTapHighlightColor: 'transparent',
            }}
            onClick={handleSignOut}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={18} color="#EF4444" />
            </div>
            <p style={{ margin: 0, flex: 1, fontWeight: 700, color: '#EF4444', fontSize: '0.9375rem' }}>Tizimdan chiqish</p>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

function MenuItem({ to, icon, iconBg, label, labelColor, bold, borderBottom }) {
  return (
    <Link to={to} style={{
      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
      textDecoration: 'none',
      borderBottom: borderBottom ? '1px solid rgba(100,120,255,0.06)' : 'none',
      WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <p style={{ margin: 0, flex: 1, fontWeight: bold ? 800 : 700, color: labelColor || '#334155', fontSize: '0.9375rem' }}>{label}</p>
      <ArrowRight size={18} color={labelColor || '#94A3B8'} />
    </Link>
  )
}
