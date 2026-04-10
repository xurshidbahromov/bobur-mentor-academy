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
import BottomTabNav from './components/layout/BottomTabNav'
import Footer from './components/layout/Footer'
import AppRoutes from './routes'

// ── Route zones ──────────────────────────────────────
const PUBLIC_ROUTES  = ['/', '/about']
const AUTH_ROUTES    = ['/login', '/signup']
const AUTH_APP_PREFIXES = ['/dashboard', '/lessons', '/shop', '/profile']

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
      // Logged in: kick off landing/auth pages → dashboard
      if (PUBLIC_ROUTES.includes(path) || AUTH_ROUTES.includes(path)) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [user, loading, location.pathname])

  return null
}

// ── App Shell ──────────────────────────────────────────
function AppShell() {
  const location  = useLocation()
  const { isTelegram } = useTelegram()
  const { user } = useAuth()
  const path = location.pathname

  const isPublicPage  = PUBLIC_ROUTES.includes(path)
  const isAuthPage    = AUTH_ROUTES.includes(path)
  const isAuthAppPage = isAuthAppRoute(path)
  const isAdminPage   = path.startsWith('/admin')

  // ── Auth / Login / Signup pages — fullscreen no shell ──
  if (isAuthPage) {
    return <AppRoutes />
  }

  // ── Admin pages — handled by AdminLayout ──
  if (isAdminPage) {
    return <AppRoutes />
  }

  // ── Authenticated app zone — BottomTabNav ──
  if (isAuthAppPage) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <AppRoutes />
        </main>
        <BottomTabNav />
      </div>
    )
  }

  // ── Public zone (Landing, About) — PublicNavbar + optional Footer ──
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      {!isTelegram && <Footer />}
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
          <Toaster position="top-center" richColors />
          <AppShell />
        </AuthProvider>
      </TelegramProvider>
    </BrowserRouter>
  )
}
