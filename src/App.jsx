// src/App.jsx
// Two-zone architecture:
//   PUBLIC ZONE  (/  /about /login /signup)  → PublicNavbar + optional Footer
//   AUTH ZONE    (/dashboard /lessons /shop /profile) → BottomTabNav only

import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TelegramProvider, useTelegram } from './context/TelegramProvider'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

import PublicNavbar from './components/layout/PublicNavbar'
import AuthSidebar from './components/layout/AuthSidebar'
import BottomTabNav from './components/layout/BottomTabNav'
import PublicBottomNav from './components/layout/PublicBottomNav'
import Footer from './components/layout/Footer'
import AppRoutes from './routes'

// ── Route zones ──────────────────────────────────────
const PUBLIC_ROUTES = ['/']  // only '/' auto-redirects logged-in users
const AUTH_ROUTES = ['/login', '/signup']
const AUTH_APP_PREFIXES = ['/dashboard', '/courses', '/lessons', '/shop', '/profile', '/leaderboard', '/quiz']

function isAuthAppRoute(pathname) {
  return AUTH_APP_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))
}

// ── Telegram Auto-login ───────────────────────────────
// Sadece localStorage'da flag varsa otomatik giriş
function TelegramAutoLogin() {
  const { tgUser, isTelegram } = useTelegram()
  const { user, loading, signInWithTelegram } = useAuth()

  useEffect(() => {
    if (!isTelegram || loading || user || !tgUser) return
    const shouldAutoLogin = localStorage.getItem('bma_tg_autologin') === 'true'
    if (!shouldAutoLogin) return
    signInWithTelegram(tgUser).then(({ error }) => {
      if (error) console.error('TMA Auto-login error:', error)
    })
  }, [isTelegram, tgUser, user, loading])

  return null
}

// ── Smart Redirect ─────────────────────────────────────
// Handles redirect after login/logout
function SmartRedirect() {
  const { isTelegram, isReady } = useTelegram()
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    const path = location.pathname

    if (!user) {
      // Not logged in: kick out of auth zone
      if (isAuthAppRoute(path)) {
        navigate('/login', { replace: true })
      }
    } else {
      // Logged in: redirect away from landing & login pages (but NOT /about)
      if (path === '/' || AUTH_ROUTES.includes(path)) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, loading, location.pathname])

  return null
}

// ── App Shell ──────────────────────────────────────────
function AppShell() {
  const location = useLocation()
  const { isTelegram } = useTelegram()
  const { user } = useAuth()
  const path = location.pathname

  const isPublicPage = PUBLIC_ROUTES.includes(path)
  const isAuthPage = AUTH_ROUTES.includes(path)
  const isAuthAppPage = isAuthAppRoute(path)
  const isAdminPage = path.startsWith('/admin')
  const isQuizPage = path.startsWith('/quiz')  // fullscreen — no sidebar

  // ── Auth / Login / Signup pages — fullscreen no shell ──
  if (isAuthPage) {
    return <AppRoutes />
  }

  // ── Admin pages — handled by AdminLayout ──
  if (isAdminPage) {
    return <AppRoutes />
  }

  // ── Quiz pages — fullscreen, no shell ──
  if (isQuizPage) {
    return <AppRoutes />
  }

  // ── Authenticated app zone — BottomTabNav ──
  // Also render /about inside auth shell when user is already logged in
  if (isAuthAppPage || (path === '/about' && user)) {
    return (
      <div className="auth-layout" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle Light Aura Orbs for the Dashboard */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.07) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'floatOrbReverse 25s ease-in-out infinite' }} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100vh' }}>
          <AuthSidebar />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
            <main style={{ flex: 1 }}>
              <AppRoutes />
            </main>
            <BottomTabNav />
          </div>
        </div>
      </div>
    )
  }

  // ── Public zone (Landing, About) — PublicNavbar + optional Footer ──
  return (
    <div className="public-zone-wrapper" style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      {!isTelegram && <Footer />}
      <PublicBottomNav />
    </div>
  )
}

// ── Root ───────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <TelegramProvider>
        <AuthProvider>
          <TelegramAutoLogin />
          <SmartRedirect />
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                borderRadius: '20px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1.5px solid rgba(255,255,255,0.8)',
                boxShadow: '0 14px 34px rgba(0,0,0,0.08)',
                fontWeight: 600,
                fontSize: '0.9375rem'
              }
            }}
          />
          <AppShell />
        </AuthProvider>
      </TelegramProvider>
    </BrowserRouter>
  )
}
