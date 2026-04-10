// src/components/layout/Footer.jsx
// Minimal footer, faqat public zone (Landing, About) uchun.

import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{
      borderTop: '1px solid rgba(100,120,255,0.08)',
      padding: '28px 24px',
      background: 'white',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
      }}>
        <span className="outfit-font" style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
          © {year} Bobur Mentor Academy
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/about" style={{ color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none' }}>Biz haqimizda</Link>
          <Link to="/login" style={{ color: '#94A3B8', fontSize: '0.875rem', textDecoration: 'none' }}>Kirish</Link>
        </div>
      </div>
    </footer>
  )
}
