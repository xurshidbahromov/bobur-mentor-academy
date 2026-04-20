// src/components/layout/BottomTabNav.jsx
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, ShoppingBag, Target, Trophy, User } from 'lucide-react'
import { useTelegram } from '../../context/TelegramProvider'

const TABS = [
  { to: '/dashboard', label: "Darslar", Icon: Home },
  { to: '/shop', label: "Do'kon", Icon: ShoppingBag },
  { to: '/quizzes', label: "Testlar", Icon: Target },
  { to: '/leaderboard', label: "Reyting", Icon: Trophy },
  { to: '/profile', label: "Profil", Icon: User },
]

export default function BottomTabNav() {
  const { isTelegram } = useTelegram()
  const safeArea = isTelegram ? 'max(16px, env(safe-area-inset-bottom, 16px))' : '16px'

  return (
    <>
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed',
        bottom: safeArea,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '440px',
        background: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(30px) saturate(2)',
        WebkitBackdropFilter: 'blur(30px) saturate(2)',
        border: '1px solid rgba(255, 255, 255, 0.35)',
        borderRadius: '100px',
        padding: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 500,
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
      }}>
        {TABS.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                layout
                whileTap={{ scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
                style={{
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  padding: isActive ? '0 18px' : '0 12px',
                  borderRadius: '100px',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(52, 97, 255, 0.12)' : 'none',
                  color: isActive ? '#3461FF' : '#64748B',
                  position: 'relative',
                  overflow: 'hidden',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  
                  <AnimatePresence mode="popLayout">
                    {isActive && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Animated Indicator dot for inactive tabs on hover could go here, but let's keep it clean */}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}

