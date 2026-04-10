// src/components/layout/PublicBottomNav.jsx
// Mehmonlar uchun (Landing / About) mobildagi pastki navigatsiya.

import { NavLink } from 'react-router-dom'
import { useTelegram } from '../../context/TelegramProvider'
import { motion } from 'framer-motion'
import { Home, Info, LogIn } from 'lucide-react'

const TABS = [
  { to: '/', label: "Asosiy", Icon: Home },
  { to: '/about', label: "Biz haqimizda", Icon: Info },
  { to: '/login', label: "Kirish", Icon: LogIn },
]

export default function PublicBottomNav() {
  const { isTelegram } = useTelegram()
  const safeArea = isTelegram ? 'max(16px, env(safe-area-inset-bottom, 16px))' : '16px'

  return (
    <>
      <nav className="public-bottom-nav" style={{
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
                WebkitTapHighlightColor: 'transparent',
              }}>
                <div style={{ position: 'relative' }}>
                  {isActive && (
                    <motion.div
                      layoutId="pub-tab-pill"
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
                    <Icon size={24} strokeWidth={isActive ? 2.2 : 1.7} />
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
          .public-bottom-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .public-zone-wrapper { padding-bottom: calc(80px + env(safe-area-inset-bottom, 16px)) !important; }
        }
      `}</style>
    </>
  )
}
