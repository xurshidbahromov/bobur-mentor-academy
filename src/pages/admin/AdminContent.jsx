import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, ChevronRight, ChevronLeft,
  Video, HelpCircle, BookOpen, Clock, Search, Eye, EyeOff, Loader2, Image as ImageIcon
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

// ── Shared input style ──────────────────────────────────
const inp = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
}

// ── Skeleton for dark admin bg ──────────────────────────
function DarkSkeleton({ h = 60, r = 16, mb = 12 }) {
  return <div className="skeleton-loader" style={{ height: h, borderRadius: r, marginBottom: mb, background: '#334155' }} />
}

// ── Slide page animation ────────────────────────────────
const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: dir => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function AdminContent() {
  const [courses, setCourses] = useState([])
  const [lessons, setLessons] = useState({})
  const [quizzes, setQuizzes] = useState({})
  const [loading, setLoading] = useState(true)

  // drilldown state
  const [view, setView] = useState('courses')   // 'courses' | 'lessons' | 'quizzes'
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [selCourse, setSelCourse] = useState(null)
  const [selLesson, setSelLesson] = useState(null)

  // search
  const [searchTerm, setSearchTerm] = useState('')

  // modal
  const [modalType, setModalType] = useState(null)
  const [editingItem, setEditingItem] = useState(null)

  // forms
  const [courseForm, setCourseForm] = useState({ title: '', description: '', is_published: false })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', youtube_video_id: '', is_free: false, is_published: false, coin_price: 5 })
  const [quizForm, setQuizForm] = useState({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', time_limit: 60, image_url: '' })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const [{ data: cData }, { data: lData }, { data: qData }] = await Promise.all([
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('lessons').select('*').order('order_index', { ascending: true }),
      supabase.from('quizzes').select('*').order('order_index', { ascending: true }),
    ])
    setCourses(cData || [])
    const lm = {}; lData?.forEach(l => { if (!lm[l.course_id]) lm[l.course_id] = []; lm[l.course_id].push(l) })
    setLessons(lm)
    const qm = {}; qData?.forEach(q => { if (!qm[q.lesson_id]) qm[q.lesson_id] = []; qm[q.lesson_id].push(q) })
    setQuizzes(qm)
    setLoading(false)
  }

  // ── navigation helpers ──
  function enterLessons(course) {
    setSelCourse(course); setDirection(1); setView('lessons'); setSearchTerm('')
  }
  function enterQuizzes(lesson) {
    setSelLesson(lesson); setDirection(1); setView('quizzes'); setSearchTerm('')
  }
  function goBack() {
    setDirection(-1)
    if (view === 'quizzes') setView('lessons')
    else { setView('courses'); setSelCourse(null) }
    setSearchTerm('')
  }

  // ── CRUD ────────────────────────────────────────────
  async function saveCourse(e) {
    e.preventDefault()
    const op = editingItem
      ? supabase.from('courses').update(courseForm).eq('id', editingItem.id)
      : supabase.from('courses').insert([courseForm])
    const { error } = await op
    if (error) toast.error(error.message)
    else { toast.success(editingItem ? 'Mavzu yangilandi' : 'Mavzu yaratildi'); closeModal(); fetchData() }
  }
  async function deleteCourse(id) {
    if (!confirm("O'chiramanmi? Barcha darslar o'chib ketadi!")) return
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Mavzu o'chirildi"); fetchData() }
  }
  async function saveLesson(e) {
    e.preventDefault()
    
    // YouTube ID extraction logic
    let vid = lessonForm.youtube_video_id
    if (vid && (vid.includes('youtube.com') || vid.includes('youtu.be'))) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = vid.match(regExp)
      if (match && match[2].length === 11) vid = match[2]
    }

    const payload = { ...lessonForm, youtube_video_id: vid }
    const op = editingItem
      ? supabase.from('lessons').update(payload).eq('id', editingItem.id)
      : supabase.from('lessons').insert([{ ...payload, course_id: selCourse.id }])
    const { error } = await op
    if (error) toast.error(error.message)
    else { toast.success(editingItem ? 'Dars yangilandi' : 'Dars yaratildi'); closeModal(); fetchData() }
  }
  async function deleteLesson(id) {
    if (!confirm("O'chiramanmi? Barcha testlar o'chib ketadi!")) return
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Dars o'chirildi"); fetchData() }
  }
  async function saveQuiz(e) {
    e.preventDefault()
    const op = editingItem
      ? supabase.from('quizzes').update(quizForm).eq('id', editingItem.id)
      : supabase.from('quizzes').insert([{ ...quizForm, lesson_id: selLesson.id }])
    const { error } = await op
    if (error) toast.error(error.message)
    else { toast.success(editingItem ? 'Savol yangilandi' : 'Savol yaratildi'); closeModal(); fetchData() }
  }
  async function deleteQuiz(id) {
    if (!confirm("Savolni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Savol o'chirildi"); fetchData() }
  }

  // ── modal openers ──
  function openCourseModal(c = null) {
    setEditingItem(c)
    setCourseForm(c ? { title: c.title, description: c.description || '', is_published: c.is_published } : { title: '', description: '', is_published: false })
    setModalType('course')
  }
  function openLessonModal(l = null) {
    setEditingItem(l)
    setLessonForm(l ? { title: l.title, description: l.description || '', youtube_video_id: l.youtube_video_id || '', is_free: l.is_free, is_published: l.is_published, coin_price: l.coin_price ?? 5 } : { title: '', description: '', youtube_video_id: '', is_free: false, is_published: false, coin_price: 5 })
    setModalType('lesson')
  }
  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `question-images/${fileName}`

      const { data, error: uploadError } = await supabase.storage
        .from('quizzes')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error("Supabase Storage Error:", uploadError)
        toast.error("Rasm yuklashda xatolik: " + uploadError.message)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('quizzes')
          .getPublicUrl(filePath)
        
        setQuizForm(prev => ({ ...prev, image_url: publicUrl }))
        toast.success("Rasm muvaffaqiyatli yuklandi")
      }
    } catch (err) {
      console.error("Upload Catch Error:", err)
      toast.error("Xatolik yuz berdi: " + err.message)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = '' // Allow selecting the same file again
    }
  }

  function openQuizModal(q = null) {
    setEditingItem(q)
    setQuizForm(q ? { question: q.question, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c || '', option_d: q.option_d || '', correct_option: q.correct_option, explanation: q.explanation || '', time_limit: q.time_limit || 60, image_url: q.image_url || '' } : { question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', time_limit: 60, image_url: '' })
    setModalType('quiz')
  }
  function closeModal() { setModalType(null); setEditingItem(null) }

  // ── filtered data ──
  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredLessons = (selCourse ? lessons[selCourse.id] || [] : []).filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredQuizzes = (selLesson ? quizzes[selLesson.id] || [] : []).filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()))

  // ── breadcrumb ──
  const breadcrumb = [
    { label: 'Mavzular', action: view !== 'courses' ? () => { setDirection(-1); setView('courses'); setSelCourse(null); setSelLesson(null); setSearchTerm('') } : null },
    ...(selCourse ? [{ label: selCourse.title, action: view === 'quizzes' ? () => { setDirection(-1); setView('lessons'); setSelLesson(null); setSearchTerm('') } : null }] : []),
    ...(selLesson ? [{ label: selLesson.title, action: null }] : []),
  ]

  return (
    <div>

      {/* ── Page header with breadcrumb ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          {breadcrumb.map((b, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <ChevronRight size={14} color="#475569" />}
              <button
                onClick={b.action || undefined}
                style={{ background: 'none', border: 'none', padding: 0, cursor: b.action ? 'pointer' : 'default', fontWeight: b.action ? 600 : 800, fontSize: '0.875rem', color: b.action ? '#64748B' : 'white', transition: 'color 0.2s', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {b.label}
              </button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>
              {view === 'courses' ? 'Dars Boshqaruvi' : view === 'lessons' ? selCourse?.title : selLesson?.title}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.875rem' }}>
              {view === 'courses' ? 'Mavzularni va darslarni boshqaring.' : view === 'lessons' ? `${filteredLessons.length} ta dars` : `${filteredQuizzes.length} ta savol`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {view !== 'courses' && (
              <button onClick={goBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                <ChevronLeft size={16} /> Orqaga
              </button>
            )}
            <button
              onClick={() => view === 'courses' ? openCourseModal() : view === 'lessons' ? openLessonModal() : openQuizModal()}
              style={{ background: view === 'quizzes' ? '#10B981' : '#3461FF', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9375rem' }}
            >
              <Plus size={18} />
              {view === 'courses' ? 'Yangi Mavzu' : view === 'lessons' ? 'Yangi Dars' : 'Yangi Savol'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input
          type="text"
          placeholder={view === 'courses' ? "Mavzu qidirish..." : view === 'lessons' ? "Dars qidirish..." : "Savol qidirish..."}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ ...inp, paddingLeft: 44, borderRadius: 16, background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)' }}
        />
      </div>

      {/* ── Animated view area ── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction}>
          {loading ? (
            <motion.div key="skeleton" initial="enter" animate="center" exit="exit" variants={slideVariants} custom={direction} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {[1, 2, 3, 4].map(i => <DarkSkeleton key={i} h={72} />)}
            </motion.div>
          ) : view === 'courses' ? (
            <motion.div key="courses" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {filteredCourses.length === 0 ? (
                <EmptyState text="Mavzular topilmadi" sub="Yangi mavzu yarating." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredCourses.map(course => (
                    <CourseRow
                      key={course.id}
                      course={course}
                      lessonCount={(lessons[course.id] || []).length}
                      onEnter={() => enterLessons(course)}
                      onEdit={e => { e.stopPropagation(); openCourseModal(course) }}
                      onDelete={e => { e.stopPropagation(); deleteCourse(course.id) }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : view === 'lessons' ? (
            <motion.div key="lessons" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {filteredLessons.length === 0 ? (
                <EmptyState text="Darslar topilmadi" sub="Yangi dars qo'shish uchun yuqoridagi tugmani bosing." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {filteredLessons.map(lesson => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      quizCount={(quizzes[lesson.id] || []).length}
                      onEnter={() => enterQuizzes(lesson)}
                      onEdit={e => { e.stopPropagation(); openLessonModal(lesson) }}
                      onDelete={e => { e.stopPropagation(); deleteLesson(lesson.id) }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="quizzes" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
              {filteredQuizzes.length === 0 ? (
                <EmptyState text="Savollar topilmadi" sub="Yangi savol qo'shing." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredQuizzes.map((quiz, idx) => (
                    <QuizRow
                      key={quiz.id}
                      quiz={quiz}
                      idx={idx}
                      onEdit={() => openQuizModal(quiz)}
                      onDelete={() => deleteQuiz(quiz.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {modalType && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.22 }}
              style={{ background: '#1E293B', width: '100%', maxWidth: modalType === 'quiz' ? 600 : 500, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <h2 style={{ margin: '0 0 24px', fontSize: '1.375rem', fontWeight: 800 }}>
                {modalType === 'course' ? (editingItem ? 'Mavzuni Tahrirlash' : "Yangi Mavzu Qo'shish") :
                 modalType === 'lesson' ? (editingItem ? 'Darsni Tahrirlash' : "Yangi Dars Qo'shish") :
                 (editingItem ? 'Savolni Tahrirlash' : "Yangi Savol Qo'shish")}
              </h2>

              <form
                onSubmit={modalType === 'course' ? saveCourse : modalType === 'lesson' ? saveLesson : saveQuiz}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {/* COURSE FORM */}
                {modalType === 'course' && <>
                  <input required placeholder="Mavzu Nomi *" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} style={inp} />
                  <textarea placeholder="Tavsif (ixtiyoriy)" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} rows={3} style={inp} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#CBD5E1' }}>
                    <input type="checkbox" checked={courseForm.is_published} onChange={e => setCourseForm({ ...courseForm, is_published: e.target.checked })} style={{ width: 18, height: 18 }} />
                    Chop etish (Online)
                  </label>
                </>}

                {/* LESSON FORM */}
                {modalType === 'lesson' && <>
                  <input required placeholder="Dars Nomi *" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} style={inp} />
                  <input placeholder="YouTube Link yoki ID (masalan: dQw4w9WgXcQ)" value={lessonForm.youtube_video_id} onChange={e => setLessonForm({ ...lessonForm, youtube_video_id: e.target.value })} style={inp} />
                  <textarea placeholder="Dars ta'rifi" value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} rows={3} style={inp} />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#CBD5E1' }}>
                        <input type="checkbox" checked={lessonForm.is_free} onChange={e => setLessonForm({ ...lessonForm, is_free: e.target.checked })} style={{ width: 18, height: 18 }} />
                        Bepul Dars (Ochiq)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#CBD5E1' }}>
                        <input type="checkbox" checked={lessonForm.is_published} onChange={e => setLessonForm({ ...lessonForm, is_published: e.target.checked })} style={{ width: 18, height: 18 }} />
                        Chop etish (Online)
                      </label>
                    </div>
                    
                    {/* Coin Price Field */}
                    <AnimatePresence>
                      {!lessonForm.is_free && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'rgba(255,193,7,0.1)', padding: 12, borderRadius: 12, border: '1px solid rgba(255,193,7,0.3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FBC02D' }}>Ochish narxi (Coin)</label>
                          <input type="number" required min="1" placeholder="Masalan: 5" value={lessonForm.coin_price} onChange={e => setLessonForm({ ...lessonForm, coin_price: Number(e.target.value) })} style={{ ...inp, background: 'rgba(0,0,0,0.2)', border: 'none', padding: '10px 14px' }} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>}

                {/* QUIZ FORM */}
                {modalType === 'quiz' && <>
                  <textarea required placeholder="Savol matni *" value={quizForm.question} onChange={e => setQuizForm({ ...quizForm, question: e.target.value })} rows={2} style={inp} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <input required placeholder="Variant A *" value={quizForm.option_a} onChange={e => setQuizForm({ ...quizForm, option_a: e.target.value })} style={inp} />
                    <input required placeholder="Variant B *" value={quizForm.option_b} onChange={e => setQuizForm({ ...quizForm, option_b: e.target.value })} style={inp} />
                    <input placeholder="Variant C" value={quizForm.option_c} onChange={e => setQuizForm({ ...quizForm, option_c: e.target.value })} style={inp} />
                    <input placeholder="Variant D" value={quizForm.option_d} onChange={e => setQuizForm({ ...quizForm, option_d: e.target.value })} style={inp} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 6 }}>To'g'ri javob</label>
                      <select value={quizForm.correct_option} onChange={e => setQuizForm({ ...quizForm, correct_option: e.target.value })} style={{ ...inp, WebkitAppearance: 'none' }}>
                        <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: 6 }}>Vaqt (sekund)</label>
                      <input type="number" value={quizForm.time_limit} onChange={e => setQuizForm({ ...quizForm, time_limit: Number(e.target.value) })} style={inp} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <input placeholder="Savol rasmi URL (ixtiyoriy, chizmalar uchun)" value={quizForm.image_url} onChange={e => setQuizForm({ ...quizForm, image_url: e.target.value })} style={{ ...inp, flex: 1 }} />
                      <label style={{ 
                        background: '#334155', color: 'white', padding: '0 16px', borderRadius: 12, 
                        display: 'flex', alignItems: 'center', gap: 8, cursor: isUploading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                        {isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                        <input type="file" onChange={handleImageUpload} disabled={isUploading} hidden accept="image/*" />
                      </label>
                    </div>
                    {quizForm.image_url && (
                      <div style={{ position: 'relative', width: 'fit-content' }}>
                        <img src={quizForm.image_url} alt="Preview" style={{ height: 100, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <button 
                          onClick={() => setQuizForm({ ...quizForm, image_url: '' })}
                          style={{ position: 'absolute', top: -10, right: -10, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <textarea placeholder="Izoh (ixtiyoriy)" value={quizForm.explanation} onChange={e => setQuizForm({ ...quizForm, explanation: e.target.value })} rows={2} style={inp} />
                </>}

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={closeModal} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bekor</button>
                  <button type="submit" style={{ flex: 1, padding: 14, borderRadius: 12, background: modalType === 'quiz' ? '#10B981' : '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Row components ──────────────────────────────────────
function CourseRow({ course, lessonCount, onEnter, onEdit, onDelete }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onEnter}
      style={{ background: '#1E293B', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(52,97,255,0.12)', color: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <BookOpen size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</h3>
          {!course.is_published && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: 100, color: '#94A3B8', fontWeight: 600, flexShrink: 0 }}>Draft</span>}
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>{lessonCount} ta dars</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onEdit} style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#3461FF', cursor: 'pointer' }}><Edit2 size={15} /></button>
        <button onClick={onDelete} style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
        <ChevronRight size={18} color="#475569" />
      </div>
    </motion.div>
  )
}

function LessonRow({ lesson, quizCount, onEnter, onEdit, onDelete }) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onEnter}
      style={{ background: '#1E293B', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Video size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</h3>
          {lesson.is_free && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(16,185,129,0.15)', borderRadius: 100, color: '#10B981', fontWeight: 700, flexShrink: 0 }}>Bepul</span>}
          {!lesson.is_published && <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(255,255,255,0.08)', borderRadius: 100, color: '#94A3B8', fontWeight: 600, flexShrink: 0 }}>Draft</span>}
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>
          {lesson.youtube_video_id ? '▶ Video bor' : '— Video yo\'q'} · {quizCount} ta savol
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onEdit} style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#8B5CF6', cursor: 'pointer' }}><Edit2 size={15} /></button>
        <button onClick={onDelete} style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
        <ChevronRight size={18} color="#475569" />
      </div>
    </motion.div>
  )
}

function QuizRow({ quiz, idx, onEdit, onDelete }) {
  return (
    <div style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>{idx + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 3px', fontSize: '0.9375rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.question}</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#10B981', fontWeight: 700 }}>✓ {quiz.correct_option?.toUpperCase()}</span>
          {quiz.time_limit && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {quiz.time_limit}s</span>}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onEdit} style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#94A3B8', cursor: 'pointer' }}><Edit2 size={15} /></button>
        <button onClick={onDelete} style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
      </div>
    </div>
  )
}

function EmptyState({ text, sub }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94A3B8' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📂</div>
      <p style={{ fontWeight: 700, fontSize: '1rem', color: 'white', margin: '0 0 6px' }}>{text}</p>
      <p style={{ margin: 0, fontSize: '0.875rem' }}>{sub}</p>
    </div>
  )
}
