// src/components/layout/PublicNavbar.jsx
// Faqat Landing va About sahifalari uchun — sodda, toza navbar.
// Auth zone sahifalarida ishlatilmaydi.

import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useTelegram } from '../../context/TelegramProvider'

export default function PublicNavbar() {
  const { isTelegram } = useTelegram()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  // Telegram Mini App da faqat logo ko'rsatiladi
  if (isTelegram) {
    return (
      <header style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        background: 'rgba(238,242,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(100,120,255,0.08)',
      }}>
        <Logo />
      </header>
    )
  }

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '68px',
        background: 'rgba(238,242,255,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(100,120,255,0.08)',
        display: 'flex',
        alignItems: 'center',
      }}>
        <nav style={{
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Logo />

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="pub-desktop-links">
            <NavItem to="/" exact label="Asosiy" active={location.pathname === '/'} />
            <NavItem to="/about" label="Biz haqimizda" active={location.pathname === '/about'} />
          </div>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="pub-desktop-cta">
            <Link to="/login" style={{
              textDecoration: 'none',
              color: 'var(--color-primary, #3461FF)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              padding: '8px 18px',
              borderRadius: 12,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,97,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Kirish
            </Link>
            <Link to="/signup" style={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9375rem',
              padding: '10px 22px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #3461FF, #214CE5)',
              boxShadow: '0 4px 14px rgba(52,97,255,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(52,97,255,0.38)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(52,97,255,0.3)' }}
            >
              Boshlash →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="pub-mobile-burger"
            onClick={() => setMenuOpen(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#334155', padding: 8, borderRadius: 10,
              display: 'none',
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99,
          background: 'rgba(238,242,255,0.97)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(100,120,255,0.1)',
          padding: '16px 20px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <MobileNavItem to="/" label="Asosiy" onClick={() => setMenuOpen(false)} />
          <MobileNavItem to="/about" label="Biz haqimizda" onClick={() => setMenuOpen(false)} />
          <div style={{ height: 1, background: 'rgba(100,120,255,0.08)', margin: '12px 0' }} />
          <Link to="/login" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none', color: '#334155', fontWeight: 600, fontSize: '1rem',
            padding: '14px 16px', borderRadius: 14, textAlign: 'center',
            background: 'rgba(100,120,255,0.06)',
          }}>Kirish</Link>
          <Link to="/signup" onClick={() => setMenuOpen(false)} style={{
            textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: '1rem',
            padding: '14px 16px', borderRadius: 14, textAlign: 'center', marginTop: 8,
            background: 'linear-gradient(135deg, #3461FF, #214CE5)',
            boxShadow: '0 4px 14px rgba(52,97,255,0.3)',
          }}>Boshlash →</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .pub-desktop-links { display: none !important; }
          .pub-desktop-cta { display: none !important; }
          .pub-mobile-burger { display: flex !important; }
        }
        @media (min-width: 768px) {
          .pub-mobile-burger { display: none !important; }
        }
      `}</style>
    </>
  )
}

function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
      <img src="/logo.svg" alt="BMA" width={36} height={36} style={{ objectFit: 'contain' }} />
      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
        Bobur<span style={{ fontWeight: 400, color: '#64748B' }}> Mentor</span>
      </span>
    </Link>
  )
}

function NavItem({ to, label, active, exact }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none',
      color: active ? '#3461FF' : '#475569',
      fontWeight: active ? 600 : 500,
      fontSize: '0.9375rem',
      padding: '8px 16px',
      borderRadius: 12,
      background: active ? 'rgba(52,97,255,0.08)' : 'transparent',
      transition: 'all 0.15s',
    }}>
      {label}
    </Link>
  )
}

function MobileNavItem({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      textDecoration: 'none', color: '#334155', fontWeight: 600,
      fontSize: '1rem', padding: '14px 16px', borderRadius: 14,
      transition: 'background 0.15s',
    }}>
      {label}
    </Link>
  )
}
