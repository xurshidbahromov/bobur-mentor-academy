import { Link } from 'react-router-dom'
import { Layers, ArrowRight } from 'lucide-react'
import Badge from '../ui/Badge'

export default function CourseCard({ course }) {
  if (!course) return null

  const subjects = ['Algebra', 'Geometriya', 'Trigonometriya', 'Analiz', 'Arifmetika']
  const subject = subjects[Math.abs((course.title || '').charCodeAt(0)) % subjects.length]
  const accent = '#3461FF' // Unified brand color as requested

  return (
    <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex' }}>
      <div
        className="course-card"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px) saturate(2)',
          WebkitBackdropFilter: 'blur(20px) saturate(2)',
          border: '1.2px solid var(--border-medium)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.05)',
          transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s cubic-bezier(0.22,1,0.36,1)',
          cursor: 'pointer'
        }}
      >
        <style>{`
          .course-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-elevated);
          }
          .course-card:active {
            transform: scale(0.985);
            transition: transform 0.1s ease;
          }
          .course-card:hover .course-thumb-icon {
            transform: scale(1.1) rotate(-5deg);
          }
        `}</style>

        {/* Thumbnail */}
        <div style={{
          width: '100%', aspectRatio: '16/9',
          background: `linear-gradient(140deg, ${accent}18 0%, ${accent}08 100%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`, filter: 'blur(20px)' }} />
          <div className="course-thumb-icon" style={{ color: accent, transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
            <Layers size={52} strokeWidth={1.5} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Badge variant="primary" style={{ marginBottom: '14px', alignSelf: 'flex-start', background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
            {subject}
          </Badge>
          <h3 style={{
            color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 700,
            lineHeight: 1.35, marginBottom: '10px', letterSpacing: '-0.01em',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {course.title}
          </h3>
          <p style={{
            fontSize: '0.9375rem', color: 'var(--text-secondary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: 1.6, flex: 1
          }}>
            {course.description}
          </p>

          {/* Footer */}
          <div style={{
            marginTop: '20px', paddingTop: '16px',
            borderTop: '1px solid var(--border-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {course.lesson_count || 0} ta dars
            </span>
            <span style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Boshlash <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
