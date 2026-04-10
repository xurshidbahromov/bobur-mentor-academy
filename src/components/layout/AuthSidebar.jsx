// src/components/layout/AuthSidebar.jsx
// Desktop/Tablet uchun chap yon menyu (Dashboard).

import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, ShoppingBag, User, Trophy, LogOut, ShieldCheck, Coins } from 'lucide-react'

export default function AuthSidebar() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    localStorage.removeItem('bma_tg_autologin')
    await signOut()
    navigate('/')
  }

  const name = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'O\'quvchi'

  const links = [
    { to: '/dashboard', label: 'Darslar', icon: <BookOpen size={20} /> },
    { to: '/leaderboard', label: 'Reyting', icon: <Trophy size={20} /> },
    { to: '/shop', label: "Do'kon", icon: <ShoppingBag size={20} /> },
    { to: '/profile', label: 'Profil', icon: <User size={20} /> },
  ]
  if (isAdmin) {
    links.push({ to: '/admin', label: 'Admin Panel', icon: <ShieldCheck size={20} /> })
  }

  return (
    <>
      <aside className="auth-desktop-sidebar" style={{
        width: 280,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'white',
        borderRight: '1.5px solid rgba(100,120,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 24px',
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 40 }}>
          <img src="/logo.svg" alt="BMA" width="38" height="38" style={{ objectFit: 'contain' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Bobur<span style={{ fontWeight: 400, color: '#64748B' }}> Mentor</span>
          </span>
        </Link>

        {/* User Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 20px rgba(15,23,42,0.15)'
        }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 80, height: 80, background: 'rgba(52,97,255,0.2)', filter: 'blur(20px)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0, overflow: 'hidden'
            }}>
              {(user?.user_metadata?.avatar_url || profile?.avatar_url) ? (
                <img src={user.user_metadata?.avatar_url || profile?.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#3461FF', fontSize: '1.25rem', fontWeight: 900 }}>{name[0].toUpperCase()}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', color: 'white', fontWeight: 700, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontSize: '0.8125rem', fontWeight: 700 }}>
                <Coins size={14} /> {profile?.coins ?? 0} coin
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 12 }}>
            Menyu
          </p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 12,
                textDecoration: 'none',
                color: isActive ? '#3461FF' : '#475569',
                background: isActive ? 'rgba(52,97,255,0.08)' : 'transparent',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.9375rem',
                transition: 'all 0.2s',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ color: isActive ? '#3461FF' : '#94A3B8', transition: 'color 0.2s' }}>
                    {link.icon}
                  </div>
                  {link.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid rgba(100,120,255,0.1)' }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(239,68,68,0.05)', color: '#EF4444',
              border: 'none', fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer',
              transition: 'background 0.2s', textAlign: 'left'
            }}
          >
            <LogOut size={20} />
            Chiqish
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 767px) {
          .auth-desktop-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
