import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, ChevronDown, ChevronRight, Video, HelpCircle, BookOpen, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminContent() {
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState({})
  const [quizzes, setQuizzes] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // UI State
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [expandedLesson, setExpandedLesson] = useState(null)

  // Modals
  const [modalType, setModalType] = useState(null) // 'course', 'lesson', 'quiz'
  const [editingItem, setEditingItem] = useState(null)
  const [parentId, setParentId] = useState(null) // For lessons (courseId) and quizzes (lessonId)

  // Form states
  const [courseForm, setCourseForm] = useState({ title: '', description: '', is_published: false })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', youtube_video_id: '', is_free: false, is_published: false })
  const [quizForm, setQuizForm] = useState({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', time_limit: 600 })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    // Fetch courses
    const { data: cData, error: cErr } = await supabase.from('courses').select('*').order('created_at', { ascending: false })
    if (cErr) { toast.error("Xatolik: " + cErr.message); setLoading(false); return }
    
    // Fetch lessons
    const { data: lData, error: lErr } = await supabase.from('lessons').select('*').order('order_index', { ascending: true })
    if (lErr) { toast.error("Xatolik: " + lErr.message); setLoading(false); return }
    
    // Fetch quizzes
    const { data: qData, error: qErr } = await supabase.from('quizzes').select('*').order('order_index', { ascending: true })
    if (qErr) { toast.error("Xatolik: " + qErr.message); setLoading(false); return }

    setCourses(cData || [])

    // Map lessons to courses
    const lessonsMap = {}
    lData?.forEach(l => {
      if (!lessonsMap[l.course_id]) lessonsMap[l.course_id] = []
      lessonsMap[l.course_id].push(l)
    })
    setLessons(lessonsMap)

    // Map quizzes to lessons
    const quizzesMap = {}
    qData?.forEach(q => {
      if (!quizzesMap[q.lesson_id]) quizzesMap[q.lesson_id] = []
      quizzesMap[q.lesson_id].push(q)
    })
    setQuizzes(quizzesMap)

    setLoading(false)
  }

  // ── COURSES ─────────────────────────────────────────────────────────────
  const openCourseModal = (course = null) => {
    if (course) {
      setEditingItem(course)
      setCourseForm({ title: course.title, description: course.description || '', is_published: course.is_published })
    } else {
      setEditingItem(null)
      setCourseForm({ title: '', description: '', is_published: false })
    }
    setModalType('course')
  }

  const saveCourse = async (e) => {
    e.preventDefault()
    if (editingItem) {
      const { error } = await supabase.from('courses').update(courseForm).eq('id', editingItem.id)
      if (error) toast.error(error.message)
      else { toast.success("Mavzu yangilandi"); setModalType(null); fetchData() }
    } else {
      const { error } = await supabase.from('courses').insert([courseForm])
      if (error) toast.error(error.message)
      else { toast.success("Yangi mavzu yaratildi"); setModalType(null); fetchData() }
    }
  }

  const deleteCourse = async (id) => {
    if (!confirm("O'chiramanmi? Barcha darslar o'chib ketadi!")) return
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Mavzu o'chirildi"); fetchData() }
  }

  // ── LESSONS ─────────────────────────────────────────────────────────────
  const openLessonModal = (courseId, lesson = null) => {
    setParentId(courseId)
    if (lesson) {
      setEditingItem(lesson)
      setLessonForm({ 
        title: lesson.title, description: lesson.description || '', 
        youtube_video_id: lesson.youtube_video_id || '', is_free: lesson.is_free, is_published: lesson.is_published 
      })
    } else {
      setEditingItem(null)
      setLessonForm({ title: '', description: '', youtube_video_id: '', is_free: false, is_published: false })
    }
    setModalType('lesson')
  }

  const saveLesson = async (e) => {
    e.preventDefault()
    if (editingItem) {
      const { error } = await supabase.from('lessons').update(lessonForm).eq('id', editingItem.id)
      if (error) toast.error(error.message)
      else { toast.success("Dars yangilandi"); setModalType(null); fetchData() }
    } else {
      const { error } = await supabase.from('lessons').insert([{ ...lessonForm, course_id: parentId }])
      if (error) toast.error(error.message)
      else { toast.success("Yangi dars yaratildi"); setModalType(null); fetchData() }
    }
  }

  const deleteLesson = async (id) => {
    if (!confirm("O'chiramanmi? Barcha testlar o'chib ketadi!")) return
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Dars o'chirildi"); fetchData() }
  }

  // ── QUIZZES ─────────────────────────────────────────────────────────────
  const openQuizModal = (lessonId, quiz = null) => {
    setParentId(lessonId)
    if (quiz) {
      setEditingItem(quiz)
      setQuizForm({ 
        question: quiz.question, option_a: quiz.option_a, option_b: quiz.option_b, 
        option_c: quiz.option_c || '', option_d: quiz.option_d || '', 
        correct_option: quiz.correct_option, explanation: quiz.explanation || '',
        time_limit: quiz.time_limit || 600
      })
    } else {
      setEditingItem(null)
      setQuizForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', time_limit: 600 })
    }
    setModalType('quiz')
  }

  const saveQuiz = async (e) => {
    e.preventDefault()
    // Agar time_limit DB da xatolik bersa (chunki columns yo'q bo'lishi mumkin), vaqtinchalik ignor qilishimiz kerak bo'ladi.
    // Xurshid akaga SQL da ALTER table qildirtirish kerak
    const payload = { ...quizForm }
    
    if (editingItem) {
      const { error } = await supabase.from('quizzes').update(payload).eq('id', editingItem.id)
      if (error) toast.error("Xatolik (Agar column haqida xato bo'lsa, SQL ni yurgizing): " + error.message)
      else { toast.success("Savol yangilandi"); setModalType(null); fetchData() }
    } else {
      const { error } = await supabase.from('quizzes').insert([{ ...payload, lesson_id: parentId }])
      if (error) toast.error("Xatolik (Agar column haqida xato bo'lsa, SQL ni yurgizing): " + error.message)
      else { toast.success("Yangi savol yaratildi"); setModalType(null); fetchData() }
    }
  }

  const deleteQuiz = async (id) => {
    if (!confirm("Ushbu savolni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Savol o'chirildi"); fetchData() }
  }

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Dars Boshqaruvi</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Mavzular, Darslar va Quizzes ni bir joydan boshqaring.</p>
        </div>
        <button 
          onClick={() => openCourseModal()}
          style={{ background: '#3461FF', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={20} /> Yangi Mavzu (Kurs)
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input 
          type="text" placeholder="Mavzular bo'yicha qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '1rem' }}
        />
      </div>

      {loading ? (
        <div style={{ color: '#64748B', textAlign: 'center', padding: 40 }}>Yuklanmoqda...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredCourses.map(course => (
            <div key={course.id} style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {/* COURSE HEADER */}
              <div 
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: expandedCourse === course.id ? 'rgba(255,255,255,0.02)' : 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(52,97,255,0.1)', color: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {course.title}
                      {!course.is_published && <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, color: '#94A3B8', fontWeight: 600 }}>Draft</span>}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B' }}>{(lessons[course.id] || []).length} ta dars</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={(e) => { e.stopPropagation(); openCourseModal(course) }} style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#3461FF', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={(e) => { e.stopPropagation(); deleteCourse(course.id) }} style={{ padding: 8, background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  {expandedCourse === course.id ? <ChevronDown color="#94A3B8" /> : <ChevronRight color="#94A3B8" />}
                </div>
              </div>

              {/* COURSE LESSONS BODY */}
              <AnimatePresence>
                {expandedCourse === course.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 24px 24px 72px' }}>
                      <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '0 0 16px' }} />
                      
                      {(lessons[course.id] || []).map(lesson => (
                        <div key={lesson.id} style={{ background: '#0F172A', borderRadius: 16, padding: '16px', marginBottom: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                          <div 
                            onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <Video size={18} color="#8B5CF6" />
                              <div>
                                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{lesson.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>
                                  {lesson.youtube_video_id ? 'Video biriktirilgan' : 'Video yoq'} • {(quizzes[lesson.id] || []).length} ta savol
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <button onClick={(e) => { e.stopPropagation(); openLessonModal(course.id, lesson) }} style={{ padding: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#94A3B8', cursor: 'pointer' }}><Edit2 size={14} /></button>
                              <button onClick={(e) => { e.stopPropagation(); deleteLesson(lesson.id) }} style={{ padding: 6, background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6, color: '#EF4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                            </div>
                          </div>

                          {/* QUIZZES ACCORDION */}
                          <AnimatePresence>
                            {expandedLesson === lesson.id && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ marginTop: 16, padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h5 style={{ margin: 0, color: '#94A3B8', fontSize: '0.875rem' }}>Dars Savollari (Quizzes)</h5>
                                    <button onClick={() => openQuizModal(lesson.id)} style={{ background: '#10B981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                      <Plus size={14} /> Savol
                                    </button>
                                  </div>
                                  
                                  {(quizzes[lesson.id] || []).length === 0 ? (
                                    <p style={{ color: '#64748B', fontSize: '0.8125rem', margin: 0 }}>Ushbu dars uchun hali savollar kiritilmagan.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {(quizzes[lesson.id] || []).map((quiz, idx) => (
                                        <div key={quiz.id} style={{ padding: '12px', background: '#1E293B', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <div style={{ WebkitLineClamp: 1, textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '0.875rem', paddingRight: 16 }}>
                                            <span style={{ color: '#3461FF', fontWeight: 700, marginRight: 6 }}>{idx + 1}.</span> {quiz.question}
                                            {quiz.time_limit && <span style={{ marginLeft: 10, color: '#F59E0B', fontSize: '0.75rem' }}><Clock size={10} style={{display:'inline', marginRight:2}}/> {quiz.time_limit}s</span>}
                                          </div>
                                          <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => openQuizModal(lesson.id, quiz)} style={{ background:'transparent', border:'none', color:'#94A3B8', cursor:'pointer' }}><Edit2 size={14}/></button>
                                            <button onClick={() => deleteQuiz(quiz.id)} style={{ background:'transparent', border:'none', color:'#EF4444', cursor:'pointer' }}><Trash2 size={14}/></button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      ))}

                      <button 
                        onClick={() => openLessonModal(course.id)}
                        style={{ width: '100%', background: 'rgba(52,97,255,0.1)', color: '#3461FF', border: '1px dashed rgba(52,97,255,0.3)', padding: '12px', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                      >
                        <Plus size={18} /> Yangi Dars Qo'shish
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALS ── */}
      <AnimatePresence>
        {modalType && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#1E293B', width: '100%', maxWidth: modalType === 'quiz' ? 600 : 500, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 800 }}>
                {modalType === 'course' ? (editingItem ? "Mavzuni Tahrirlash" : "Yangi Mavzu Qo'shish") :
                 modalType === 'lesson' ? (editingItem ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish") :
                 (editingItem ? "Savolni Tahrirlash" : "Yangi Savol Qo'shish")}
              </h2>
              
              <form onSubmit={modalType === 'course' ? saveCourse : modalType === 'lesson' ? saveLesson : saveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* COURSE FORM */}
                {modalType === 'course' && (
                  <>
                    <input required placeholder="Mavzu Nomi" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} style={modalInputStyle} />
                    <textarea placeholder="Mavzu haqida ma'lumot (ixtiyoriy)" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} rows={3} style={modalInputStyle} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm({...courseForm, is_published: e.target.checked})} style={{ width: 18, height: 18 }} />
                      Chop etish (Online)
                    </label>
                  </>
                )}

                {/* LESSON FORM */}
                {modalType === 'lesson' && (
                  <>
                    <input required placeholder="Dars Nomi" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} style={modalInputStyle} />
                    <input placeholder="YouTube Video ID (masalan: dQw4w9WgXcQ)" value={lessonForm.youtube_video_id} onChange={e => setLessonForm({...lessonForm, youtube_video_id: e.target.value})} style={modalInputStyle} />
                    <textarea placeholder="Dars ta'rifi" value={lessonForm.description} onChange={e => setLessonForm({...lessonForm, description: e.target.value})} rows={3} style={modalInputStyle} />
                    <div style={{ display: 'flex', gap: 20 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="checkbox" checked={lessonForm.is_free} onChange={e => setLessonForm({...lessonForm, is_free: e.target.checked})} style={{ width: 18, height: 18 }} />
                        Bepul Dars
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.875rem' }}>
                        <input type="checkbox" checked={lessonForm.is_published} onChange={e => setLessonForm({...lessonForm, is_published: e.target.checked})} style={{ width: 18, height: 18 }} />
                        Chop etish (Online)
                      </label>
                    </div>
                  </>
                )}

                {/* QUIZ FORM */}
                {modalType === 'quiz' && (
                  <>
                    <textarea required placeholder="Savol matni" value={quizForm.question} onChange={e => setQuizForm({...quizForm, question: e.target.value})} rows={2} style={modalInputStyle} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Vaqti (sekund)</label>
                        <input required type="number" placeholder="Vaqti (sekund)" value={quizForm.time_limit} onChange={e => setQuizForm({...quizForm, time_limit: e.target.value})} style={modalInputStyle} />
                      </div>
                      <div />
                      <input required placeholder="Variant A" value={quizForm.option_a} onChange={e => setQuizForm({...quizForm, option_a: e.target.value})} style={modalInputStyle} />
                      <input required placeholder="Variant B" value={quizForm.option_b} onChange={e => setQuizForm({...quizForm, option_b: e.target.value})} style={modalInputStyle} />
                      <input placeholder="Variant C (ixtiyoriy)" value={quizForm.option_c} onChange={e => setQuizForm({...quizForm, option_c: e.target.value})} style={modalInputStyle} />
                      <input placeholder="Variant D (ixtiyoriy)" value={quizForm.option_d} onChange={e => setQuizForm({...quizForm, option_d: e.target.value})} style={modalInputStyle} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.875rem', marginBottom: 8, display: 'block', color: '#94A3B8' }}>To'g'ri javobni belgilang</label>
                      <select value={quizForm.correct_option} onChange={e => setQuizForm({...quizForm, correct_option: e.target.value})} style={{...modalInputStyle, WebkitAppearance: 'none'}}>
                        <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                      </select>
                    </div>

                    <textarea placeholder="Tushuntirish (ixtiyoriy)" value={quizForm.explanation} onChange={e => setQuizForm({...quizForm, explanation: e.target.value})} rows={2} style={modalInputStyle} />
                  </>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setModalType(null)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: 14, borderRadius: 12, background: '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

const modalInputStyle = { width: '100%', padding: '14px 16px', borderRadius: '12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '1rem', outline: 'none' }
