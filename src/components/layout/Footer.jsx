// src/components/layout/Footer.jsx
// Minimal, clean footer — not cluttered

import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid var(--border-soft)',
      padding: '32px 24px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          © {year} Bobur Mentor Academy
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link to="/courses" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
            Kurslar
          </Link>
        </div>
      </div>
    </footer>
  )
}
