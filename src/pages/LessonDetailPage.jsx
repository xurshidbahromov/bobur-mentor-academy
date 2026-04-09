import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLesson, useQuizzes, useLessons } from '../hooks/useLessons'
import { useAccess } from '../hooks/useAccess'
import { useAuth } from '../context/AuthContext'
import VideoPlayer from '../components/lesson/VideoPlayer'
import LockOverlay from '../components/lesson/LockOverlay'
import QuizBlock from '../components/quiz/QuizBlock'
import LessonRow from '../components/lesson/LessonRow'
import Badge from '../components/ui/Badge'
import { ArrowLeft, PlayCircle } from 'lucide-react'

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { lesson, loading } = useLesson(lessonId)
  const { user, profile, setProfile } = useAuth()
  
  const { canWatch, loading: accessLoading, refetch, unlockWithCoins } = useAccess(lesson)
  const { quizzes } = useQuizzes(canWatch ? lessonId : null)

  // Fetch all lessons for the sidebar queue
  const { lessons: courseLessons, loading: lessonsLoading } = useLessons(lesson?.course_id)

  if (loading || accessLoading) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }} className="page-enter">
      <div style={{ height: '600px', background: 'var(--color-lock)', borderRadius: 'var(--radius-card)', animation: 'pulse 1.5s infinite' }} />
    </div>
  )

  if (!lesson) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '64px 24px' }} className="page-enter">
      <h2 style={{ color: 'var(--color-error)' }}>Dars topilmadi</h2>
      <Link to="/courses" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
        <ArrowLeft size={16} /> Darslarga qaytish
      </Link>
    </div>
  )

  const handleUnlock = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!profile || profile.coins < lesson.coin_price) {
      alert("Balansingizda yetarli coin mavjud emas! Har kuni kirib coin ishlashingiz yoki sotib olishingiz mumkin.")
      return
    }

    const confirmUnlock = window.confirm(`Ushbu darsni ${lesson.coin_price} coin evaziga qulfdan chiqarasizmi?`)
    if (!confirmUnlock) return

    const { success, error } = await unlockWithCoins()
    if (success) {
      // Optimistically update global UI state
      if (setProfile) {
        setProfile(prev => ({ ...prev, coins: prev.coins - lesson.coin_price }))
      }
    } else {
      alert("Xatolik yuz berdi: " + error)
    }
  }

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', paddingBottom: '100px' }} className="page-enter">
      {/* Top Bar for Theatre Mode */}
      <div style={{ 
        padding: '24px 32px', 
        borderBottom: '1px solid var(--border-soft)',
        background: 'var(--bg-surface)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link 
            to={`/courses/${lesson.course_id}`} 
            style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.9375rem', 
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={18} /> Kursga qaytish
          </Link>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Dars {lesson.order_index}
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1400px', 
        margin: '32px auto 0', 
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 380px',
        gap: '32px',
        alignItems: 'start'
      }} className="lesson-grid">

        <style>
          {`
            @media (max-width: 1024px) {
              .lesson-grid { grid-template-columns: 1fr !important; }
            }
          `}
        </style>

        {/* LEFT COLUMN: Video & Details */}
        <div>
          {/* Video / Lock Area */}
          <div style={{ marginBottom: '24px', boxShadow: 'var(--shadow-elevated)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            {canWatch ? (
              <VideoPlayer videoId={lesson.youtube_video_id} lessonId={lesson.id} />
            ) : (
              <LockOverlay 
                lesson={lesson} 
                user={user} 
                onLoginClick={() => navigate('/login', { state: { from: `/lessons/${lessonId}` } })}
                onUnlockClick={handleUnlock}
              />
            )}
          </div>

          <div style={{ padding: '8px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
                {lesson.title}
              </h1>
              <Badge variant={lesson.is_free ? 'success' : (canWatch ? 'primary' : 'default')}>
                {lesson.is_free ? 'Bepul' : (canWatch ? 'Ochiq' : 'Qulflangan')}
              </Badge>
            </div>
            {lesson.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '800px' }}>
                {lesson.description}
              </p>
            )}
          </div>

          {/* Quiz Section */}
          {canWatch && quizzes.length > 0 && (
            <div style={{ marginTop: '64px', background: 'var(--bg-surface)', padding: '40px', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-soft)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <PlayCircle size={28} color="var(--color-primary)" />
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Biliimni tekshirish (Quiz)</h2>
              </div>
              <QuizBlock quizzes={quizzes} />
            </div>
          )}

          {canWatch && quizzes.length === 0 && (
            <div style={{ marginTop: '48px', padding: '32px', textAlign: 'center', border: '1px dashed var(--border-soft)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Ushbu dars uchun testlar biriktirilmagan.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Curriculum Sidebar */}
        <div style={{ 
          background: 'var(--bg-surface)', 
          borderRadius: 'var(--radius-card)', 
          border: '1px solid var(--border-soft)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 120px)',
          position: 'sticky',
          top: '96px'
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg-glass)', zIndex: 10 }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Darslar ro'yxati</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {courseLessons?.length || 0} ta mavzu
            </div>
          </div>
          
          <div style={{ overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lessonsLoading ? (
               <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ animation: 'pulse 1.5s infinite', color: 'var(--color-lock)' }}>Yuklanmoqda...</div>
               </div>
            ) : (
              courseLessons?.map((cLesson, idx) => (
                <LessonRow 
                  key={cLesson.id} 
                  lesson={cLesson} 
                  index={idx} 
                  isUnlocked={cLesson.is_free || (cLesson.id === lesson.id && canWatch)} 
                  // Note: ideally we check access for all lessons but keeping it simple for mvp
                />
              ))
            )}
          </div>
        </div>

      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.3; }
            100% { opacity: 0.6; }
          }
          /* Custom Scrollbar for sidebar */
          ::-webkit-scrollbar {
            width: 6px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: var(--border-medium);
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
          }
        `}
      </style>
    </div>
  )
}
