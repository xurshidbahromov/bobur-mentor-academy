// src/App.jsx
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TelegramProvider, useTelegram } from './context/TelegramProvider'
import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AppRoutes from './routes'

const AUTH_ROUTES = ['/login', '/signup']

// ── Auto-login for Telegram users ──────────────────────────────
// Runs once on mount: if inside Telegram and not yet logged in,
// silently signs in with the Telegram user's synthetic credentials.
function TelegramAutoLogin() {
  const { tgUser, isTelegram } = useTelegram()
  const { user, loading, signInWithTelegram } = useAuth()

  useEffect(() => {
    if (!isTelegram || loading || user || !tgUser) return
    signInWithTelegram(tgUser)
  }, [isTelegram, tgUser, user, loading])

  return null
}

// ── App Shell ──────────────────────────────────────────────────
function AppShell() {
  const location = useLocation()
  const { isTelegram } = useTelegram()
  const isAuthPage = AUTH_ROUTES.includes(location.pathname)

  // Inside Telegram: no auth pages needed (auto-login handles it)
  // Hide navbar/footer inside Telegram — mobile bottom nav handles nav
  if (isAuthPage && !isTelegram) {
    return <AppRoutes />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
      {!isTelegram && <Navbar />}
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      {!isTelegram && <Footer />}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <TelegramProvider>
        <AuthProvider>
          <TelegramAutoLogin />
          <AppShell />
        </AuthProvider>
      </TelegramProvider>
    </BrowserRouter>
  )
}
