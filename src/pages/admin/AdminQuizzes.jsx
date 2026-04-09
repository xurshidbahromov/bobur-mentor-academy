import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, HelpCircle, CheckCircle2, Search, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [lessons, setLessons] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedLesson, setSelectedLesson] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    lesson_id: '',
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a',
    explanation: '',
    order_index: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [quizzesRes, lessonsRes, coursesRes] = await Promise.all([
      supabase.from('quizzes').select('*, lessons(title, course_id)').order('order_index', { ascending: true }),
      supabase.from('lessons').select('id, title, course_id').order('order_index'),
      supabase.from('courses').select('id, title').order('title')
    ])
    
    if (!quizzesRes.error) setQuizzes(quizzesRes.data || [])
    if (!lessonsRes.error) setLessons(lessonsRes.data || [])
    if (!coursesRes.error) setCourses(coursesRes.data || [])
    
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.lesson_id) {
      toast.error("Iltimos, darsni tanlang")
      return
    }

    if (editingQuiz) {
      const { error } = await supabase.from('quizzes').update(formData).eq('id', editingQuiz.id)
      if (error) toast.error(error.message)
      else {
        toast.success("Test yangilandi")
        closeModal()
        fetchData()
      }
    } else {
      const { error } = await supabase.from('quizzes').insert([formData])
      if (error) toast.error(error.message)
      else {
        toast.success("Test qo'shildi")
        closeModal()
        fetchData()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Ushbu testni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success("Test o'chirildi")
      fetchData()
    }
  }

  const openModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz)
      setFormData({
        lesson_id: quiz.lesson_id,
        question: quiz.question,
        option_a: quiz.option_a,
        option_b: quiz.option_b,
        option_c: quiz.option_c || '',
        option_d: quiz.option_d || '',
        correct_option: quiz.correct_option,
        explanation: quiz.explanation || '',
        order_index: quiz.order_index
      })
    } else {
      setEditingQuiz(null)
      setFormData({
        lesson_id: selectedLesson !== 'all' ? selectedLesson : (lessons[0]?.id || ''),
        question: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'a',
        explanation: '',
        order_index: 0
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingQuiz(null)
  }

  const filteredQuizzes = quizzes.filter(q => {
    const lessonMatch = selectedLesson === 'all' || q.lesson_id === selectedLesson
    const courseMatch = selectedCourse === 'all' || q.lessons?.course_id === selectedCourse
    return lessonMatch && courseMatch
  })

  const availableLessons = selectedCourse === 'all' 
    ? lessons 
    : lessons.filter(l => l.course_id === selectedCourse)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Quiz Boshqaruvi</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Darslar uchun test savollarini yaratish va boshqarish.</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ background: '#3461FF', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={20} /> Savol Qo'shish
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>KURSNI FILTRLASH</label>
          <select 
            value={selectedCourse} 
            onChange={e => { setSelectedCourse(e.target.value); setSelectedLesson('all'); }}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
          >
            <option value="all">Barcha kurslar</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>DARSNI FILTRLASH</label>
          <select 
            value={selectedLesson} 
            onChange={e => setSelectedLesson(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
          >
            <option value="all">Barcha darslar</option>
            {availableLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </div>
      </div>

      {/* Quiz List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Yuklanmoqda...</div>
        ) : filteredQuizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: '#1E293B', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', color: '#64748B' }}>
            <HelpCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>Testlar topilmadi. Savol qo'shish tugmasini bosing.</p>
          </div>
        ) : filteredQuizzes.map((quiz, i) => (
          <motion.div 
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: '#1E293B', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3461FF', background: 'rgba(52, 97, 255, 0.1)', padding: '4px 10px', borderRadius: '8px', marginBottom: '12px', display: 'inline-block' }}>
                  {quiz.lessons?.title}
                </span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4 }}>{quiz.question}</h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openModal(quiz)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Edit2 size={18} /></button>
                <button onClick={() => handleDelete(quiz.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}><Trash2 size={18} /></button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {['a', 'b', 'c', 'd'].map(opt => {
                const val = quiz[`option_${opt}`]
                if (!val) return null
                const isCorrect = quiz.correct_option === opt
                return (
                  <div key={opt} style={{ 
                    padding: '12px 16px', borderRadius: '12px', background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.02)', 
                    border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                    display: 'flex', alignItems: 'center', gap: 10
                  }}>
                    <span style={{ fontWeight: 800, color: isCorrect ? '#10B981' : '#64748B', textTransform: 'uppercase' }}>{opt}:</span>
                    <span style={{ fontSize: '0.9375rem', color: isCorrect ? 'white' : '#CBD5E1' }}>{val}</span>
                    {isCorrect && <CheckCircle2 size={16} color="#10B981" style={{ marginLeft: 'auto' }} />}
                  </div>
                )
              })}
            </div>
            {quiz.explanation && (
              <div style={{ fontSize: '0.875rem', color: '#94A3B8', fontStyle: 'italic', padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <strong>Izoh:</strong> {quiz.explanation}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ background: '#1E293B', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '700px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ mt: 0, mb: '24px' }}>{editingQuiz ? "Savolni Tahrirlash" : "Yangi Savol Qo'shish"}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Darsni tanlang</label>
                  <select required value={formData.lesson_id} onChange={e => setFormData({...formData, lesson_id: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                    <option value="">Darsni tanlang...</option>
                    {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Savol Matni</label>
                  <textarea required rows={2} value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {['a', 'b', 'c', 'd'].map(opt => (
                    <div key={opt}>
                      <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8', textTransform: 'uppercase' }}>Variant {opt}</label>
                      <input required={opt < 'c'} type="text" value={formData[`option_${opt}`]} onChange={e => setFormData({...formData, [`option_${opt}`]: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>To'g'ri Javob</label>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {['a', 'b', 'c', 'd'].map(opt => (
                        <button key={opt} type="button" onClick={() => setFormData({...formData, correct_option: opt})} style={{ 
                          flex: 1, padding: '12px', borderRadius: '10px', textTransform: 'uppercase', fontWeight: 800, cursor: 'pointer',
                          background: formData.correct_option === opt ? '#10B981' : '#0F172A',
                          border: `1px solid ${formData.correct_option === opt ? '#10B981' : 'rgba(255,255,255,0.1)'}`,
                          color: 'white', transition: 'all 0.2s'
                        }}>{opt}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Tartib (Order)</label>
                    <input type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>To'g'ri javob uchun izoh (ixtiyoriy)</label>
                  <textarea rows={2} value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: '12px' }}>
                  <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{editingQuiz ? "Saqlash" : "Yaratish"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
