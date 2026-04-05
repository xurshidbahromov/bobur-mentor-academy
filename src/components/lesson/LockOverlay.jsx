import Button from '../ui/Button'
import { Lock, Coins } from 'lucide-react'

export default function LockOverlay({ 
  lesson, 
  user, 
  onLoginClick, 
  onUnlockClick 
}) {
  if (!lesson) return null

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      background: 'var(--color-lock)',
      border: '1px solid var(--border-soft)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '40px 24px',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Visual background hint */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: 'radial-gradient(circle at center, var(--text-muted) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div style={{ 
        width: '80px', 
        height: '80px', 
        borderRadius: 'var(--radius-full)', 
        background: 'var(--bg-elevated)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-soft)',
        zIndex: 1,
        boxShadow: 'var(--shadow-soft)'
      }}>
        <Lock size={32} />
      </div>

      <div style={{ zIndex: 1 }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '1.5rem' }}>
          Dars qulflangan
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
          Ushbu darsni davom ettirish uchun uni tangalar (coins) orqali ochishingiz kerak.
        </p>
        {lesson.price ? (
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            marginTop: '16px', 
            color: 'white', 
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            padding: '8px 24px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700, 
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}>
            <Coins size={20} />
            {lesson.price}
          </div>
        ) : null}
      </div>

      <div style={{ zIndex: 1, marginTop: '8px' }}>
        {!user ? (
          <Button variant="primary" size="lg" onClick={onLoginClick}>
            Ochish uchun kiring
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={onUnlockClick}>
            Tanga orqali ochish
          </Button>
        )}
      </div>
    </div>
  )
}
