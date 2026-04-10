// src/components/layout/PublicNavbar.jsx
// Landing va About sahifalari uchun — eski navbar dizayniga mos.

import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTelegram } from '../../context/TelegramProvider'
import { Coins } from 'lucide-react'
import Button from '../ui/Button'

export default function PublicNavbar() {
  const { user, profile, loading } = useAuth()
  const { isTelegram } = useTelegram()
  const navigate = useNavigate()

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
    fontWeight: isActive ? 600 : 500,
    textDecoration: 'none',
    fontSize: '0.9375rem',
    transition: 'color var(--transition-base)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    background: isActive ? 'var(--color-primary-dim)' : 'transparent',
  })

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '72px',
      background: 'rgba(238, 242, 255, 0.85)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      borderBottom: '1px solid var(--border-glass)',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 1px 0 rgba(100,120,255,0.06)'
    }}>
      <nav style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img src="/logo.svg" alt="Bobur Mentor" width="40" height="40" style={{ objectFit: 'contain' }} />
          <span className="outfit-font" style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
            Bobur<span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}> Mentor</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'none' }} className="pub-desktop-links">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <NavLink to="/" end style={navLinkStyle}>Asosiy</NavLink>
            <NavLink to="/about" style={navLinkStyle}>Biz haqimizda</NavLink>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logged-in: Avatar + Coins */}
          {!loading && user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '2px solid rgba(52,97,255,0.2)',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #3461FF, #214CE5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(52,97,255,0.2)',
                }}>
                  {(user?.user_metadata?.avatar_url || profile?.avatar_url) ? (
                    <img src={user.user_metadata?.avatar_url || profile?.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 800 }}>
                      {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>

              <Link to="/shop" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white', padding: '4px 12px 4px 8px',
                  borderRadius: 'var(--radius-full)', fontWeight: 700,
                  fontSize: '0.9375rem',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer'
                }}>
                  <Coins size={15} />
                  <span>{profile?.coins ?? 0}</span>
                </div>
              </Link>
            </div>
          )}

          {/* Guest: Login + Signup buttons (desktop only) */}
          <div style={{ display: 'none' }} className="pub-desktop-cta">
            {!loading && !user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Tizimga kirish
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                  Boshlash
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .pub-desktop-links { display: flex !important; }
          .pub-desktop-cta { display: flex !important; }
        }
        @media (max-width: 767px) {
          .pub-desktop-links { display: none !important; }
          .pub-desktop-cta { display: none !important; }
        }
      `}</style>
    </header>
  )
}
