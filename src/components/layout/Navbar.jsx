import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useTelegram } from '../../context/TelegramProvider'
import { Coins } from 'lucide-react'
import { useStreak } from '../../hooks/useStreak'
import Button from '../ui/Button'

// Premium SVG Nav Icons
const IcoHome = ({ active }) => active ? (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M10.707 2.293a1 1 0 0 1 1.414 0l7.071 7.071A1 1 0 0 1 19 11h-1v9a1 1 0 0 1-1 1h-4v-5H11v5H7a1 1 0 0 1-1-1v-9H5a1 1 0 0 1-.707-1.707l7.414-7.414z"/></svg>
) : (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21M9 21H15"/></svg>
)

const IcoCourses = ({ active }) => active ? (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5zM8 13h8v1.5H8V13zm0 3h5v1.5H8V16z"/></svg>
) : (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
)

const IcoProfile = ({ active }) => active ? (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
) : (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)

export default function Navbar() {
  const { user, profile, loading, signOut } = useAuth()
  const { streakData } = useStreak()
  const { t } = useTranslation()
  const { isTelegram } = useTelegram()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

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

  const mobileLinkStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '0.6875rem',
    fontWeight: isActive ? 700 : 500,
    transition: 'all 0.2s ease',
  })

  return (
    <>
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
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 110 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <img src="/favicon.svg" alt="Bobur Mentor" width={36} height={36} style={{ objectFit: 'contain', display: 'block' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Bobur Mentor
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'none' }} className="desktop-only">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NavLink to="/" end style={navLinkStyle}>Asosiy</NavLink>
              <NavLink to="/courses" style={navLinkStyle}>Darslar</NavLink>
              <NavLink to="/about" style={navLinkStyle}>Biz haqimizda</NavLink>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Profile avatar + Coin badge */}
            {!loading && user && (
              <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Avatar */}
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '2px solid rgba(52,97,255,0.2)',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #3461FF, #214CE5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(52,97,255,0.2)',
                }}>
                  {(user?.user_metadata?.avatar_url) ? (
                    <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 800 }}>
                      {(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Coin badge */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px', 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                  color: 'white', 
                  padding: '4px 12px 4px 8px', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}>
                  <Coins size={15} />
                  <span>{profile?.coins ?? 0}</span>
                </div>
              </Link>
            )}

            {/* Desktop Auth Buttons — only for guests */}
            <div style={{ display: 'none' }} className="desktop-only">
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
      </header>

      {/* Mobile Bottom Navigation (Mini App Style) */}
      <nav className={`mobile-bottom-nav ${isTelegram ? 'tma-mode' : ''}`}>
        <NavLink to="/" end style={mobileLinkStyle}>
          {({ isActive }) => (
            <>
              <div style={{ 
                width: '48px', height: '32px', borderRadius: '16px', 
                background: isActive ? 'var(--color-primary-dim)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                <IcoHome active={isActive} />
              </div>
              <span>Asosiy</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/courses" style={mobileLinkStyle}>
          {({ isActive }) => (
            <>
              <div style={{ 
                width: '48px', height: '32px', borderRadius: '16px', 
                background: isActive ? 'var(--color-primary-dim)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                <IcoCourses active={isActive} />
              </div>
              <span>Darslar</span>
            </>
          )}
        </NavLink>

        <NavLink to="/profile" style={mobileLinkStyle}>
          {({ isActive }) => (
            <>
              <div style={{ 
                width: '48px', height: '32px', borderRadius: '16px', 
                background: isActive ? 'var(--color-primary-dim)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                <IcoProfile active={isActive} />
              </div>
              <span>Profil</span>
            </>
          )}
        </NavLink>
      </nav>

      <style>
        {`
          @media (min-width: 768px) {
            .desktop-only { display: flex !important; }
            .mobile-bottom-nav:not(.tma-mode) { display: none !important; }
          }
          @media (max-width: 767px) {
            .desktop-only { display: none !important; }
            .mobile-bottom-nav { 
              display: flex; 
              position: fixed; 
              bottom: 0; 
              left: 0; 
              right: 0; 
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(30px);
              -webkit-backdrop-filter: blur(30px);
              border-top: 1px solid var(--border-soft);
              padding: 16px 24px 28px;
              justify-content: space-around;
              z-index: 200;
              box-shadow: 0 -4px 32px rgba(0,0,0,0.04);
              border-radius: 36px 36px 0 0;
            }
            body { padding-bottom: 100px; } /* Ensure bottom nav doesn't cover content */
          }
          .tma-mode {
            display: flex !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(255, 255, 255, 0.95);
            color: #0f172a;
            border-top: 1px solid var(--border-soft);
            padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 24px));
            justify-content: space-around;
            z-index: 200;
            box-shadow: 0 -4px 32px rgba(0,0,0,0.04);
            /* native app tab bar usually does not have big top radius, keep it subtle */
            border-radius: 20px 20px 0 0;
          }
          :root:has(.tma-mode) body {
            padding-bottom: calc(100px + env(safe-area-inset-bottom, 24px));
          }
        `}
      </style>
    </>
  )
}
