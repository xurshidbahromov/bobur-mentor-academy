import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Layers, ArrowRight } from 'lucide-react'
import Badge from '../ui/Badge'

function CourseCard({ course }) {
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
          background: '#FFFFFF',
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
            transform: translateY(-2px);
            box-shadow: var(--shadow-elevated);
            border-color: ${accent}40;
          }
          .course-card:active {
            transform: scale(0.985);
          }
          .course-card-icon {
            transition: transform 0.3s ease;
          }
          .course-card:hover .course-card-icon {
            transform: scale(1.08) rotate(-5deg);
          }
        `}</style>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${accent}20`
            }}>
              <Layers size={20} color={accent} className="course-card-icon" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Badge variant="primary" style={{ marginBottom: '6px', background: `${accent}12`, color: accent, border: 'none', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 700 }}>
                {subject}
              </Badge>
              <h3 style={{
                margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 700,
                lineHeight: 1.3, letterSpacing: '-0.01em',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {course.title}
              </h3>
            </div>
          </div>
          
          <p style={{
            margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', lineHeight: 1.5, flex: 1
          }}>
            {course.description}
          </p>

          <div style={{
            paddingTop: '12px',
            borderTop: '1px solid var(--border-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
              {course.lesson_count || 0} ta dars
            </span>
            <span style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Boshlash <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(CourseCard)
