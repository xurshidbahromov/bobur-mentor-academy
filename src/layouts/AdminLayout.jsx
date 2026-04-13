// src/layouts/AdminLayout.jsx
// Fully responsive admin shell:
// Desktop → fixed sidebar (collapsible 280 / 72px)
// Mobile  → hidden sidebar, slides in as overlay with backdrop

import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, HelpCircle, Users,
  LogOut, ChevronRight, Menu, X, Target,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const MENU = [
  { name: 'Statistika',       path: '/admin/dashboard',        icon: LayoutDashboard },
  { name: 'Dars Boshqaruvi',  path: '/admin/content',          icon: BookOpen        },
  { name: 'Umumiy Testlar',   path: '/admin/general-quizzes',  icon: Target          },
  { name: 'Foydalanuvchilar', path: '/admin/users',            icon: Users           },
]

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

export default function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // Desktop: sidebar collapsed/expanded; Mobile: sidebar hidden/shown as overlay
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [location.pathname])

  const handleSignOut = async () => { await signOut(); navigate('/') }

  // sidebar width on desktop
  const sidebarW = sidebarOpen ? 280 : 72

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', color: '#F8FAFC' }}>

      {/* ══ DESKTOP SIDEBAR ══════════════════════════════════ */}
      {!isMobile && (
        <aside
          style={{
            width: sidebarW,
            background: '#1E293B',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column',
            position: 'fixed', top: 0, left: 0, bottom: 0,
            zIndex: 100, overflow: 'hidden',
            transition: 'width 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          <SidebarContents
            open={sidebarOpen}
            location={location}
            profile={profile}
            onSignOut={handleSignOut}
          />
        </aside>
      )}

      {/* ══ MOBILE SIDEBAR OVERLAY ═══════════════════════════ */}
      <AnimatePresence>
        {isMobile && mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', zIndex: 200 }}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: 280, background: '#1E293B',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column',
                zIndex: 201, overflow: 'hidden',
              }}
            >
              <SidebarContents
                open={true}
                location={location}
                profile={profile}
                onSignOut={handleSignOut}
                onClose={() => setMobileSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══ MAIN CONTENT ═════════════════════════════════════ */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : sidebarW,
        transition: 'margin-left 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        minWidth: 0,
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Top Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0 24px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left: hamburger */}
          <button
            onClick={() => isMobile ? setMobileSidebarOpen(true) : setSidebarOpen(s => !s)}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', padding: 8, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Menu size={20} />
          </button>

          {/* Center: page name on mobile */}
          {isMobile && (
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              {MENU.find(m => m.path === location.pathname)?.name || 'Admin'}
            </span>
          )}

          {/* Right: go to site */}
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}>
            ← Saytga
          </Link>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: isMobile ? '20px 16px 40px' : '32px 40px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Reusable sidebar body ────────────────────────────────
function SidebarContents({ open, location, profile, onSignOut, onClose }) {
  return (
    <>
      {/* Logo + close (mobile) */}
      <div style={{ padding: '20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontWeight: 900, fontSize: '0.875rem' }}>BM</span>
          </div>
          {open && <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>BMA Admin</span>}
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {open && (
          <p style={{ margin: '0 0 8px 4px', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Menyu</p>
        )}
        {MENU.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              title={!open ? item.name : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: `12px ${open ? 14 : 0}px`,
                justifyContent: open ? 'flex-start' : 'center',
                borderRadius: 12, textDecoration: 'none',
                color: isActive ? 'white' : '#94A3B8',
                background: isActive ? '#3461FF' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <item.icon size={20} style={{ flexShrink: 0 }} />
              {open && <span style={{ flex: 1 }}>{item.name}</span>}
              {open && isActive && <ChevronRight size={16} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer: user + signout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, padding: '8px 4px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#334155', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontWeight: 800, fontSize: '0.875rem', color: '#94A3B8' }}>{(profile?.full_name || 'A')[0]}</span>
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.full_name || 'Admin'}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Boshqaruvchi</p>
            </div>
          </div>
        )}
        <button
          onClick={onSignOut}
          title={!open ? 'Chiqish' : undefined}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 10,
            border: '1px solid rgba(239,68,68,0.2)',
            background: 'rgba(239,68,68,0.05)',
            color: '#EF4444',
            display: 'flex', alignItems: 'center',
            justifyContent: open ? 'flex-start' : 'center',
            gap: 10, cursor: 'pointer', fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          <LogOut size={18} />
          {open && <span>Chiqish</span>}
        </button>
      </div>
    </>
  )
}
