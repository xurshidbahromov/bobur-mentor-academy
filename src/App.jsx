// src/App.jsx
import { BrowserRouter, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TelegramProvider, useTelegram } from './context/TelegramProvider'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AppRoutes from './routes'

const AUTH_ROUTES = ['/login', '/signup']

// ── Telegram Auto-login ────────────────────────────────────────
// When opened inside Telegram, silently signs in with Telegram credentials.
function TelegramAutoLogin() {
  const { tgUser, isTelegram } = useTelegram()
  const { user, loading, signInWithTelegram } = useAuth()

  useEffect(() => {
    // 1. Only run if in Telegram and not already logged in
    if (!isTelegram || loading || user || !tgUser) return

    // 2. ONLY auto-login if they have successfully logged in before on this device
    const shouldAutoLogin = localStorage.getItem('bma_tg_autologin') === 'true'
    if (!shouldAutoLogin) return

    signInWithTelegram(tgUser).then(({ error }) => {
      if (error) console.error("TMA Auto-login error:", error)
    })
  }, [isTelegram, tgUser, user, loading])

  return null
}

// ── TMA Smart Redirect ─────────────────────────────────────────
// Inside Telegram:
//   - Not logged in → go to /login
//   - Logged in on landing page → go to /courses (dashboard)
function TMARedirect() {
  const { isTelegram, isReady } = useTelegram()
  const { user, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isTelegram || !isReady || loading) return

    if (!user) {
      // Not logged in → show login
      if (!AUTH_ROUTES.includes(location.pathname)) {
        navigate('/login', { replace: true })
      }
    } else {
      // Logged in on landing or auth pages → go to dashboard
      if (location.pathname === '/' || AUTH_ROUTES.includes(location.pathname)) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isTelegram, isReady, user, loading, location.pathname])

  return null
}

// ── App Shell ──────────────────────────────────────────────────
function AppShell() {
  const location = useLocation()
  const { isTelegram } = useTelegram()
  const isAuthPage = AUTH_ROUTES.includes(location.pathname)

  // Auth pages in non-TMA mode: fullscreen, no nav/footer
  if (isAuthPage && !isTelegram) {
    return <AppRoutes />
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-base)'
    }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      {!isTelegram && <Footer />}
    </div>
  )
}

import { Toaster } from 'sonner'

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <TelegramProvider>
        <AuthProvider>
          <TelegramAutoLogin />
          <TMARedirect />
          <Toaster position="top-center" richColors />
          <AppShell />
        </AuthProvider>
      </TelegramProvider>
    </BrowserRouter>
  )
}
