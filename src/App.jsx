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

    signInWithTelegram(tgUser).then(({ error }) => {
      if (error) {
        // Show visible error inside Telegram WebView
        alert(`TMA Login xatosi:\n${error?.message || JSON.stringify(error)}`)
      }
    })
  }, [isTelegram, tgUser, user, loading])

  // DEBUG overlay — remove after fixing
  if (isTelegram && !user && !loading) {
    return (
      <div style={{
        position: 'fixed', top: 10, left: 10, right: 10, zIndex: 9999,
        background: '#1e293b', color: '#f1f5f9', borderRadius: 12,
        padding: '12px 16px', fontSize: 13, fontFamily: 'monospace',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
        <div style={{ color: '#94a3b8', marginBottom: 4 }}>🔍 TMA Debug</div>
        <div>isTelegram: <b style={{ color: '#10b981' }}>{String(isTelegram)}</b></div>
        <div>tgUser: <b style={{ color: tgUser ? '#10b981' : '#ef4444' }}>{tgUser ? `id=${tgUser.id}` : 'null'}</b></div>
        <div>auth loading: <b>{String(loading)}</b></div>
        <div>user: <b style={{ color: user ? '#10b981' : '#ef4444' }}>{user ? user.email : 'null'}</b></div>
      </div>
    )
  }

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
