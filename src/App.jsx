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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      refetchOnWindowFocus: false, // Don't aggressively refetch
      retry: 1
    },
  },
})

import PublicNavbar from './components/layout/PublicNavbar'
import AuthSidebar from './components/layout/AuthSidebar'
import BottomTabNav from './components/layout/BottomTabNav'
import PublicBottomNav from './components/layout/PublicBottomNav'
import Footer from './components/layout/Footer'
import AppRoutes from './routes'
import NotificationListener from './components/NotificationListener'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// ── Route zones ──────────────────────────────────────
const PUBLIC_ROUTES = ['/']  // only '/' auto-redirects logged-in users
const AUTH_ROUTES = ['/login', '/signup']
const AUTH_APP_PREFIXES = ['/dashboard', '/courses', '/lessons', '/shop', '/profile', '/leaderboard', '/quiz', '/quizzes']

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

function AppShell() {
  const location = useLocation()
  const { isTelegram } = useTelegram()
  const { user, loading } = useAuth()
  const path = location.pathname

  // ── Global Initial Loading State (Premium Education Splash Screen) ──
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', width: '100%',
        background: '#ffffff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Minimalist soft glow from center */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,97,255,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Elegant Book Animation Loop */}
        <div style={{ position: 'relative', width: 90, height: 70, perspective: 1000, marginBottom: 24 }}>
          {/* Main Book Cover Background */}
          <div style={{
            position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)',
            width: 80, height: 50, background: '#F8FAFC',
            borderRadius: 6, border: '2px solid rgba(52,97,255,0.1)',
            boxShadow: '0 8px 24px rgba(52,97,255,0.08)'
          }} />

          {/* Left Solid Pages */}
          <div style={{
            position: 'absolute', right: '50%', top: 14,
            width: 36, height: 42, background: 'white',
            borderRadius: '4px 0 0 4px', border: '1px solid #E2E8F0',
            borderRight: 'none',
            boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.02)'
          }} />

          {/* Right Solid Pages */}
          <div style={{
            position: 'absolute', left: '50%', top: 14,
            width: 36, height: 42, background: 'white',
            borderRadius: '0 4px 4px 0', border: '1px solid #E2E8F0',
            borderLeft: 'none',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.02)'
          }} />

          {/* Center Spine Crease */}
          <div style={{
            position: 'absolute', left: '50%', top: 10, transform: 'translateX(-50%)',
            width: 4, height: 50, background: 'rgba(52,97,255,0.1)',
            borderRadius: 2
          }} />

          {/* Flipping Pages */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute', left: '50%', top: 14,
                width: 36, height: 42, background: 'none',
                transformOrigin: '0% 50%',
                transformStyle: 'preserve-3d',
                animation: `flipPage 2.4s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                zIndex: 10 - i
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, background: 'white',
                borderRadius: '0 4px 4px 0', border: '1px solid #E2E8F0',
                borderLeft: '1px solid #CBD5E1',
                backfaceVisibility: 'hidden',
                backgroundImage: 'linear-gradient(transparent 90%, #F1F5F9 10%)',
                backgroundSize: '100% 8px',
              }} />
              <div style={{
                position: 'absolute', inset: 0, background: '#F8FAFC',
                borderRadius: '4px 0 0 4px', border: '1px solid #E2E8F0',
                borderRight: '1px solid #CBD5E1',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }} />
            </div>
          ))}
        </div>

        {/* Text Area */}
        <h2 className="outfit-font" style={{
          fontSize: '1.25rem', fontWeight: 800, color: '#0F172A',
          margin: '0 0 4px', letterSpacing: '-0.02em',
        }}>
          Bobur Mentor
        </h2>
        <p style={{
          margin: 0, color: '#64748B', fontSize: '0.875rem', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 2
        }}>
          Darslar ochilmoqda
          <span style={{ animation: 'blinkDot 1.4s infinite 0s' }}>.</span>
          <span style={{ animation: 'blinkDot 1.4s infinite 0.2s' }}>.</span>
          <span style={{ animation: 'blinkDot 1.4s infinite 0.4s' }}>.</span>
        </p>

        <style>{`
          @keyframes flipPage {
            0% { transform: rotateY(0deg); }
            50% { transform: rotateY(-180deg); }
            100% { transform: rotateY(0deg); }
          }
          @keyframes blinkDot {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  const isPublicPage = PUBLIC_ROUTES.includes(path)
  const isAuthPage = AUTH_ROUTES.includes(path)
  const isAuthAppPage = isAuthAppRoute(path)
  const isAdminPage = path.startsWith('/admin')
  const isQuizPage = path === '/quiz' || path.startsWith('/quiz/')  // fullscreen — no sidebar

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
      <>
        <div className="auth-layout" style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', 
          position: 'relative'
        }}>
          {/* Subtle Light Aura Orbs — isolation:isolate prevents filter from breaking fixed children */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden', isolation: 'isolate' }}>
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.07) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'floatOrb 20s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'floatOrbReverse 25s ease-in-out infinite' }} />
          </div>
          
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', minHeight: '100vh' }}>
            <AuthSidebar />
            {/* Main content area — naturally scrolls with body */}
            <div className="auth-main-content" style={{ flex: 1, minWidth: 0 }}>
              <main>
                <AppRoutes />
              </main>
            </div>
          </div>
        </div>
        {/* BottomTabNav OUTSIDE auth-layout — avoids filter/transform ancestors breaking position:fixed */}
        <BottomTabNav />
      </>
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TelegramProvider>
          <AuthProvider>
            <TelegramAutoLogin />
            <SmartRedirect />
            <NotificationListener />
            <Analytics />
            <SpeedInsights />
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
    </QueryClientProvider>
  )
}
