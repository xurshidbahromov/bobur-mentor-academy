// src/pages/NotFoundPage.jsx

import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '24px',
      gap: '16px',
    }}>
      <h1 style={{ color: 'var(--text-muted)', fontSize: '5rem', fontWeight: 700, lineHeight: 1 }}>404</h1>
      <h2 style={{ color: 'var(--text-primary)' }}>Sahifa topilmadi</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Siz qidirayotgan sahifa mavjud emas.</p>
      <Link to="/" style={{
        marginTop: '8px',
        background: 'var(--color-primary)',
        color: 'white',
        padding: '10px 24px',
        borderRadius: 'var(--radius-btn)',
        fontWeight: 600,
        textDecoration: 'none',
      }}>
        Bosh sahifaga qaytish
      </Link>
    </div>
  )
}
