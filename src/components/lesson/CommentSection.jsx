import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, MessageCircle, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'sonner'

export default function CommentSection({ courseId, lessonId = null, showLessonTag = false }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [courseId, lessonId])

  const fetchComments = async () => {
    setLoading(true)
    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (full_name, avatar_url),
        lessons:lesson_id (title)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })

    if (lessonId) {
      query = query.eq('lesson_id', lessonId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
    } else {
      setComments(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Izoh qoldirish uchun tizimga kiring')
      return
    }
    if (!content.trim()) return

    setIsSubmitting(true)
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        content: content.trim()
      })
      .select(`
        *,
        profiles:user_id (full_name, avatar_url),
        lessons:lesson_id (title)
      `)
      .single()

    if (error) {
      toast.error('Izoh yuborishda xatolik yuz berdi')
      console.error(error)
    } else {
      setComments([data, ...comments])
      setContent('')
      toast.success('Izohingiz qabul qilindi')
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      toast.error('O\'chirishda xatolik')
    } else {
      setComments(comments.filter(c => c.id !== id))
      toast.success('O\'chirildi')
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString('uz-UZ', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <MessageCircle size={24} color="var(--color-primary)" />
        <h3 className="outfit-font" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Izohlar {comments.length > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '1.125rem', fontWeight: 600 }}>({comments.length})</span>}
        </h3>
      </div>

      {/* Input Box */}
      {user ? (
        <form 
          onSubmit={handleSubmit}
          style={{ 
            background: 'rgba(255, 255, 255, 0.7)', 
            backdropFilter: 'blur(16px)',
            borderRadius: 24, padding: 16,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: '0 8px 32px rgba(15,23,42,0.04)',
            marginBottom: 32,
            display: 'flex', gap: 12
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
            <img 
              src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
              alt="Avatar" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Fikringizni yozing..."
              style={{
                width: '100%', minHeight: 44, maxHeight: 120,
                background: 'transparent', border: 'none',
                padding: '10px 0', fontSize: '0.9375rem', fontWeight: 500,
                color: '#0F172A', resize: 'none', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={isSubmitting || !content.trim()}
                style={{
                  background: content.trim() ? 'var(--color-primary)' : 'rgba(15,23,42,0.05)',
                  color: content.trim() ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 100, padding: '8px 16px',
                  fontWeight: 800, fontSize: '0.875rem',
                  cursor: content.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s', WebkitTapHighlightColor: 'transparent'
                }}
              >
                {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.5)', borderRadius: 24, padding: '24px',
          textAlign: 'center', border: '1px dashed #CBD5E1', marginBottom: 32
        }}>
          <p style={{ margin: 0, color: '#64748B', fontWeight: 600 }}>Izoh qoldirish uchun tizimga kiring.</p>
        </div>
      )}

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="spinner" style={{ border: '3px solid rgba(0,0,0,0.05)', borderTop: '3px solid var(--color-primary)', borderRadius: '50%', width: 24, height: 24, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '64px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(32px) saturate(2)',
            WebkitBackdropFilter: 'blur(32px) saturate(2)',
            borderRadius: 28,
            border: '1px solid rgba(255,255,255,0.6)',
          }}>
            <div style={{ 
              width: 56, height: 56, borderRadius: '50%', 
              background: 'rgba(52,97,255,0.08)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              marginBottom: 14 
            }}>
              <MessageCircle size={24} color="#3461FF" strokeWidth={2} />
            </div>
            <p className="outfit-font" style={{ margin: '0 0 6px', fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>
              Hali izohlar yo'q
            </p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>
              Birinchi bo'lib fikr bildiring!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {comments.map((comment, idx) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.6)', 
                  backdropFilter: 'blur(12px)',
                  borderRadius: 24, padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.02)',
                  display: 'flex', gap: 14,
                  position: 'relative'
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', overflow: 'hidden', flexShrink: 0 }}>
                  <img 
                    src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9375rem' }}>{comment.profiles?.full_name || 'Talaba'}</span>
                      {showLessonTag && comment.lessons?.title && (
                        <span style={{ 
                          fontSize: '0.6875rem', fontWeight: 800, color: 'var(--color-primary)', 
                          background: 'rgba(52,97,255,0.08)', padding: '2px 8px', borderRadius: 6,
                          textTransform: 'uppercase', letterSpacing: '0.02em'
                        }}>
                          {comment.lessons.title}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94A3B8' }}>
                      <Clock size={12} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{formatDate(comment.created_at)}</span>
                      {user?.id === comment.user_id && (
                        <button 
                          onClick={() => handleDelete(comment.id)}
                          style={{ 
                            background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                            color: '#EF4444', opacity: 0.6, transition: 'opacity 0.2s'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.9375rem', lineHeight: 1.55, fontWeight: 500 }}>
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
