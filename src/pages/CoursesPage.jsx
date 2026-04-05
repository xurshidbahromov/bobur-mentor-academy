import { useCourses } from '../hooks/useCourses'
import { FolderOpen } from 'lucide-react'
import CourseCard from '../components/course/CourseCard'

export default function CoursesPage() {
  const { courses, loading, error } = useCourses()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', minHeight: '100vh' }}>
      
      {/* Premium flush-left header */}
      <div style={{ marginBottom: '64px' }}>
        <h1 style={{
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 900,
          letterSpacing: '-0.045em',
          color: 'var(--text-primary)',
          lineHeight: 1.05,
          marginBottom: '20px'
        }}>
          Darslar.<br />
          <span style={{
            background: 'linear-gradient(135deg, var(--color-primary), #8B5CF6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            O'sish vaqti.
          </span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '580px', lineHeight: 1.65 }}>
          Matematika ekotizimimizdan o'zingizga mos yo'nalishni tanlang va professional darajaga chiqing.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-loader" style={{
              aspectRatio: '4/5', borderRadius: 'var(--radius-card)'
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-error)' }}>
          <p>Xatolik yuz berdi: {error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '100px 24px',
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={36} color="var(--color-primary)" />
          </div>
          <h3 style={{ color: 'var(--text-secondary)' }}>Hozircha darslar mavjud emas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Tez orada yangi darslar qo'shiladi.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
