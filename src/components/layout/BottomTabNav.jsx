// src/components/layout/BottomTabNav.jsx
// Dashboard zone uchun pastki navigatsiya.
// Web + Telegram Mini App da bir xil ko'rinadi.
// Mobile-first, touch-friendly (≥48px tap area).

import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTelegram } from '../../context/TelegramProvider'
import { motion } from 'framer-motion'

// ── Icons ──
const IcoHome = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.55 5.45 21 6 21H9M19 10L21 12M19 10V20C19 20.55 18.55 21 18 21H15M9 21V15C9 14.45 9.45 14 10 14H14C14.55 14 15 14.45 15 15V21M9 21H15" />
  </svg>
)

const IcoShop = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const IcoProfile = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IcoTrophy = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
    <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
    <path d="M6 2h12v7a6 6 0 0 1-12 0V2Z" />
    <path d="M12 17v4" />
    <path d="M8 21h8" />
  </svg>
)

const TABS = [
  { to: '/dashboard',   label: "Darslar",  Icon: IcoHome    },
  { to: '/shop',        label: "Do'kon",   Icon: IcoShop    },
  { to: '/leaderboard', label: "Reyting",  Icon: IcoTrophy  },
  { to: '/profile',     label: "Profil",   Icon: IcoProfile },
]

export default function BottomTabNav() {
  const { isTelegram } = useTelegram()
  const { profile } = useAuth()

  const safeArea = isTelegram ? 'max(16px, env(safe-area-inset-bottom, 16px))' : '16px'

  return (
    <>
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: safeArea,
        left: 20, right: 20,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255,255,255,0.8)',
        borderRadius: 28,
        padding: '6px 8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 200,
        boxShadow: '0 14px 34px rgba(52,97,255,0.18), 0 4px 14px rgba(0,0,0,0.06)',
      }}>
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none', flex: 1 }}>
            {({ isActive }) => (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                minHeight: 56,
                justifyContent: 'center',
                // Touch feedback via CSS active state
                WebkitTapHighlightColor: 'transparent',
              }}>
                {/* Pill background (active) */}
                <div style={{ position: 'relative' }}>
                  {isActive && (
                    <motion.div
                      layoutId="tab-pill"
                      style={{
                        position: 'absolute',
                        inset: '-8px -16px',
                        background: 'rgba(52,97,255,0.1)',
                        borderRadius: 16,
                        zIndex: 0,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div style={{
                    position: 'relative', zIndex: 1,
                    color: isActive ? '#3461FF' : '#94A3B8',
                    transition: 'color 0.2s',
                  }}>
                    <Icon active={isActive} />
                  </div>
                </div>

                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#3461FF' : '#94A3B8',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s, font-weight 0.2s',
                }}>
                  {label}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Hide on desktop, show only on mobile */}
      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}
