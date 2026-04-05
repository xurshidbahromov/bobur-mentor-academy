// src/App.jsx
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AppRoutes from './routes'

const AUTH_ROUTES = ['/login', '/signup']

function AppShell() {
  const location = useLocation()
  const isAuthPage = AUTH_ROUTES.includes(location.pathname)

  if (isAuthPage) {
    // Auth pages: fullscreen, no navbar/footer
    return <AppRoutes />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
