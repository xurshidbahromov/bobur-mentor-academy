import { motion } from 'framer-motion'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  HelpCircle, 
  Users, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { signOut, profile } = useAuth()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const menuItems = [
    { name: 'Statistika', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Dars Boshqaruvi', path: '/admin/content', icon: BookOpen },
    { name: 'Foydalanuvchilar', path: '/admin/users', icon: Users },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F172A', color: '#F8FAFC' }}>
      
      {/* ── Sidebar ── */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        style={{
          background: '#1E293B',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 1000,
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#3461FF', flexShrink: 0 }} />
          {isSidebarOpen && <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>BMA Admin</span>}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: isActive ? 'white' : '#94A3B8',
                  background: isActive ? '#3461FF' : 'transparent',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span style={{ fontWeight: 600 }}>{item.name}</span>}
                {isActive && isSidebarOpen && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </Link>
            )
          })}
        </nav>

        {/* Footer / User */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {isSidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155', overflow: 'hidden' }}>
                {profile?.avatar_url && <img src={profile.avatar_url} alt="admin" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'Admin'}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8' }}>Boshqaruvchi</p>
              </div>
            </div>
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155', margin: '0 auto 16px' }} />
          )}
          
          <button 
            onClick={signOut}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 10,
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              gap: 10,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Chiqish</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <main style={{ 
        flex: 1, 
        marginLeft: isSidebarOpen ? 280 : 80, 
        transition: 'margin-left 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        padding: '32px 40px'
      }}>
        {/* Top Header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ background: '#1E293B', border: 'none', color: 'white', padding: 8, borderRadius: 8, cursor: 'pointer' }}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
             <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Asosiy saytga o'tish</Link>
          </div>
        </header>

        {/* Content Outlet */}
        <Outlet />
      </main>
    </div>
  )
}
