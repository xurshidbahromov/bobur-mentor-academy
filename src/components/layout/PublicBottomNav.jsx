// src/components/layout/PublicBottomNav.jsx
// Mehmonlar uchun (Landing / About) mobildagi pastki navigatsiya.
import { NavLink } from 'react-router-dom'
import { useTelegram } from '../../context/TelegramProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Info, LogIn } from 'lucide-react'

const TABS = [
  { to: '/', label: "Asosiy", Icon: Home },
  { to: '/about', label: "Biz haqimizda", Icon: Info },
  { to: '/login', label: "Kirish", Icon: LogIn, isPrimary: true },
]

export default function PublicBottomNav() {
  const { isTelegram } = useTelegram()
  const safeArea = isTelegram ? 'max(16px, env(safe-area-inset-bottom, 16px))' : '16px'

  return (
    <>
      <nav className="public-bottom-nav" style={{
        position: 'fixed',
        bottom: safeArea,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '420px',
        background: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        borderRadius: '100px',
        padding: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 500,
        boxShadow: '0 12px 40px rgba(52, 97, 255, 0.14)',
      }}>
        {TABS.map(({ to, label, Icon, isPrimary }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none', display: 'flex' }}>
            {({ isActive }) => {
              // Primary (Kirish) tab is always "open" (shows label and has background)
              const showLabel = isActive || isPrimary
              const hasBg = isActive || isPrimary

              return (
                <motion.div
                  layout
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                  style={{
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    padding: showLabel ? '0 18px' : '0 12px',
                    borderRadius: '100px',
                    background: hasBg ? '#FFFFFF' : 'transparent',
                    boxShadow: hasBg ? '0 4px 15px rgba(52, 97, 255, 0.12)' : 'none',
                    color: isActive ? '#3461FF' : '#64748B',
                    position: 'relative',
                    overflow: 'hidden',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    
                    <AnimatePresence mode="popLayout" initial={false}>
                      {showLabel && (
                        <motion.span
                          initial={isPrimary ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            letterSpacing: '-0.01em',
                            color: isActive ? '#3461FF' : (isPrimary ? '#0F172A' : '#64748B')
                          }}
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )
            }}
          </NavLink>
        ))}
      </nav>

      {/* Hide on desktop, show only on mobile */}
      <style>{`
        @media (min-width: 768px) {
          .public-bottom-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .public-zone-wrapper { padding-bottom: calc(90px + env(safe-area-inset-bottom, 16px)) !important; }
        }
      `}</style>
    </>
  )
}
