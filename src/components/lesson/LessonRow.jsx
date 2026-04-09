// src/components/lesson/LessonRow.jsx
// Apple-style list item — glass, minimal, no excessive hover

import { Link } from 'react-router-dom'
import { CheckCircle2, Play, Lock, Coins } from 'lucide-react'

export default function LessonRow({ lesson, index, isUnlocked = false, isWatched = false }) {
  if (!lesson) return null

  const state = lesson.is_free ? 'free' : (isUnlocked ? 'unlocked' : 'locked')
  const isAccessible = state !== 'locked'

  const iconBg = isWatched
    ? 'rgba(16, 185, 129, 0.12)'
    : isAccessible
    ? 'rgba(52, 97, 255, 0.1)'
    : 'rgba(148, 163, 184, 0.12)'

  const iconColor = isWatched
    ? 'var(--color-success)'
    : isAccessible
    ? 'var(--color-primary)'
    : 'var(--text-muted)'

  const Icon = isWatched
    ? <CheckCircle2 size={17} strokeWidth={2.5} />
    : state === 'locked'
    ? <Lock size={15} strokeWidth={2} />
    : <Play size={15} fill="currentColor" />

  return (
    <Link
      to={`/lessons/${lesson.id}`}
      className="lesson-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 20px',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        borderRadius: '20px',
        border: '1px solid var(--border-glass)',
        textDecoration: 'none',
        boxShadow: 'var(--shadow-soft)',
        transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s ease',
        cursor: 'pointer'
      }}
    >
      <style>{`
        .lesson-row:hover { transform: translateY(-2px); box-shadow: var(--shadow-elevated); }
        .lesson-row:active { transform: scale(0.985); }
      `}</style>

      {/* Order number */}
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', minWidth: '22px', fontWeight: 700, textAlign: 'center' }}>
        {index + 1}
      </span>

      {/* Status icon */}
      <div style={{
        width: 36, height: 36, borderRadius: '11px',
        background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: iconColor, flexShrink: 0
      }}>
        {Icon}
      </div>

      {/* Title */}
      <span style={{
        flex: 1, color: isWatched ? 'var(--text-muted)' : 'var(--text-primary)',
        fontWeight: isWatched ? 400 : 600,
        fontSize: '0.9375rem', lineHeight: 1.4,
        textDecoration: isWatched ? 'line-through' : 'none',
        textDecorationColor: 'var(--border-strong)'
      }}>
        {lesson.title}
      </span>

      {/* Right badge */}
      {state === 'locked' && (lesson.coin_price > 0) ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '5px 12px', borderRadius: 'var(--radius-full)',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          color: '#d97706', fontSize: '0.8125rem', fontWeight: 700
        }}>
          <Coins size={13} /> {lesson.coin_price}
        </div>
      ) : state === 'free' ? (
        <div style={{
          padding: '5px 12px', borderRadius: 'var(--radius-full)',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--color-accent)', fontSize: '0.8125rem', fontWeight: 600
        }}>
          Bepul
        </div>
      ) : null}
    </Link>
  )
}
