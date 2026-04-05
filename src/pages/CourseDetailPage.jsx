import { useParams, Link } from 'react-router-dom'
import { useCourse } from '../hooks/useCourses'
import { useLessons } from '../hooks/useLessons'
import LessonRow from '../components/lesson/LessonRow'
import { ArrowLeft, GraduationCap, BookOpen, Clock } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const { course, loading: courseLoading } = useCourse(courseId)
  const { lessons, loading: lessonsLoading } = useLessons(courseId)

  if (courseLoading) return (
    <div style={pageStyle}>
      <div className="skeleton-loader" style={{ width: 80, height: 20, borderRadius: 6, marginBottom: 32 }} />
      <div className="skeleton-loader" style={{ height: 260, borderRadius: 'var(--radius-card)', marginBottom: 40 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-loader" style={{ height: 74, borderRadius: 'var(--radius-md)' }} />)}
      </div>
    </div>
  )

  if (!course) return (
    <div style={pageStyle}>
      <h2 style={{ color: 'var(--color-error)' }}>Kurs topilmadi</h2>
      <Link to="/courses" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
        <ArrowLeft size={16} /> Darslarga qaytish
      </Link>
    </div>
  )

  const freeLessons = lessons.filter(l => l.is_free).length

  return (
    <div style={pageStyle}>

      {/* Back link */}
      <Link to="/courses" style={{
        color: 'var(--text-muted)', fontSize: '0.9375rem', textDecoration: 'none',
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        marginBottom: '40px', padding: '8px 16px',
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1px solid var(--border-glass)',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-soft)'
      }}>
        <ArrowLeft size={16} /> Barcha darslar
      </Link>

      {/* Hero banner */}
      <div style={{
        position: 'relative',
        marginBottom: '56px',
        padding: 'clamp(40px, 6vw, 64px) clamp(32px, 5vw, 56px)',
        background: 'linear-gradient(140deg, #3461FF 0%, #1e3a8a 100%)',
        borderRadius: '32px',
        color: 'white',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 70% at 90% -20%, rgba(255,255,255,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <GraduationCap size={180} color="white" style={{ position: 'absolute', right: '-20px', bottom: '-30px', opacity: 0.07, transform: 'rotate(12deg)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Badge style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
            Matematik kurs
          </Badge>
          <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.25rem)', marginBottom: '16px', color: 'white', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
            {course.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.125rem', maxWidth: '600px', lineHeight: 1.65, marginBottom: '32px' }}>
            {course.description}
          </p>

          {/* Course meta chips */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { icon: <BookOpen size={14} />, text: `${lessons.length} ta dars` },
              { icon: <GraduationCap size={14} />, text: `${freeLessons} ta bepul` },
              { icon: <Clock size={14} />, text: 'O\'z sur\'atda o\'rganing' },
            ].map(({ icon, text }) => (
              <div key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                fontSize: '0.8125rem', fontWeight: 600, color: 'white'
              }}>
                {icon} {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>
          Darslar ro'yxati
        </h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
          {lessons.length} ta mavzu
        </span>
      </div>

      {lessonsLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-loader" style={{ height: 74, borderRadius: 'var(--radius-md)' }} />)}
        </div>
      ) : lessons.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '56px', background: 'var(--bg-glass)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Hozircha darslar mavjud emas</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {lessons.map((lesson, idx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              index={idx}
              isUnlocked={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const pageStyle = {
  maxWidth: '920px',
  margin: '0 auto',
  padding: '72px 24px 120px'
}
