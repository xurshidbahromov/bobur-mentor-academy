import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Edit2, Trash2, Search, Calendar, Coins as CoinsIcon, 
  Target, Loader2, Save, X, Eye, EyeOff, List, ChevronRight, 
  ChevronLeft, ArrowLeft, Image as ImageIcon, Clock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import MathTextInput from '../../components/ui/MathTextInput'
import MathRenderer from '../../components/ui/MathRenderer'

// ── Shared Styles ──────────────────────────────────────
const inp = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
}

const slideVariants = {
  enter: dir => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: dir => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

// ── Skeleton Loader ─────────────────────────────────────
function DarkSkeleton({ h = 80, r = 20, mb = 12 }) {
  return (
    <div style={{ 
      height: h, borderRadius: r, marginBottom: mb, 
      background: 'linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s infinite linear',
      border: '1px solid rgba(255,255,255,0.03)'
    }} />
  )
}

export default function AdminDailyQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Drilldown state
  const [view, setView] = useState('list') // 'list' | 'editor'
  const [direction, setDirection] = useState(1)
  const [selQuiz, setSelQuiz] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Forms - Metadata
  const [quizForm, setQuizForm] = useState({ 
    title: '', quiz_date: '', entry_fee_coins: 0, is_active: true
  })

  // Forms - Questions
  const [questions, setQuestions] = useState([])
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null)
  const [qForm, setQForm] = useState({ 
    text: '', option_a: '', option_b: '', option_c: '', option_d: '', 
    correct_option: 'a', explanation: '', image_url: ''
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    setLoading(true)

    const { data, error } = await supabase
      .from('daily_quizzes')
      .select('*')
      .order('quiz_date', { ascending: false })
      
    if (error) {
      toast.error("Xatolik: " + error.message)
    } else {
      setQuizzes(data || [])
      if (selQuiz) {
        const updated = data.find(q => q.id === selQuiz.id)
        if (updated) {
          setSelQuiz(updated)
          setQuestions(updated.questions || [])
        }
      }
    }
    setLoading(false)
  }

  // --- Navigation ---
  const enterEditor = (quiz = null) => {
    setDirection(1)
    if (quiz) {
      setSelQuiz(quiz)
      setQuestions(quiz.questions || [])
      setQuizForm({ 
        title: quiz.title, 
        quiz_date: quiz.quiz_date, 
        entry_fee_coins: quiz.entry_fee_coins, 
        is_active: quiz.is_active 
      })
    } else {
      setSelQuiz(null)
      setQuestions([])
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setQuizForm({ 
        title: '', 
        quiz_date: tomorrow.toISOString().split('T')[0], 
        entry_fee_coins: 0, 
        is_active: true 
      })
    }
    setView('editor')
  }

  const goBack = () => {
    setDirection(-1)
    setView('list')
    setSelQuiz(null)
    setSearchTerm('')
  }

  // --- Automation Helpers ---
  const broadcastDailyNotification = async (quizTitle) => {
    try {
      const { data: users } = await supabase.from('profiles').select('id')
      if (!users?.length) return

      const notifs = users.map(u => ({
        user_id: u.id,
        title: "Yangi Kunlik Test! 🔥",
        message: `Bugun uchun "${quizTitle}" mavzusida yangi test tayyor. Bilimingizni sinab ko'ring va XP yig'ing!`,
        is_read: false
      }))

      await supabase.from('notifications').insert(notifs)
    } catch (err) {
      console.error("Notification Error:", err)
    }
  }


  // --- Quiz CRUD ---
  const saveQuizMetadata = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    
    try {
      if (selQuiz) {
        // Update existing
        const { error } = await supabase.from('daily_quizzes')
          .update({ ...quizForm, questions }).eq('id', selQuiz.id)
        
        if (error) throw error

        if (quizForm.is_active) {
          // If today's quiz is activated → deactivate only past-date quizzes
          const today = new Date().toISOString().split('T')[0]
          if (quizForm.quiz_date === today) {
            await supabase
              .from('daily_quizzes')
              .update({ is_active: false })
              .lt('quiz_date', today)
              .neq('id', selQuiz.id)
          }
          await broadcastDailyNotification(quizForm.title)
        }
        
        toast.success("Muvaffaqiyatli saqlandi")
      } else {
        // Create new
        const { data, error } = await supabase.from('daily_quizzes')
          .insert([{ ...quizForm, questions }]).select()
        
        if (error) throw error

        if (quizForm.is_active) {
          // If today's quiz is activated → deactivate only past-date quizzes
          const today = new Date().toISOString().split('T')[0]
          if (quizForm.quiz_date === today) {
            await supabase
              .from('daily_quizzes')
              .update({ is_active: false })
              .lt('quiz_date', today)
              .neq('id', data[0].id)
          }
          await broadcastDailyNotification(quizForm.title)
        }
        
        toast.success("Yangi test yaratildi")
        setSelQuiz(data[0])
      }
      fetchQuizzes()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteQuiz = async (id) => {
    if (!confirm("Ushbu testni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('daily_quizzes').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Test o'chirildi"); fetchQuizzes() }
  }

  const toggleActive = async (quiz) => {
    const newStatus = !quiz.is_active
    setLoading(true)
    
    try {
      const { error } = await supabase.from('daily_quizzes')
        .update({ is_active: newStatus }).eq('id', quiz.id)
      
      if (error) throw error

      if (newStatus) {
        // If activating today's quiz → deactivate only past-date quizzes
        const today = new Date().toISOString().split('T')[0]
        if (quiz.quiz_date === today) {
          await supabase
            .from('daily_quizzes')
            .update({ is_active: false })
            .lt('quiz_date', today)
            .neq('id', quiz.id)
        }
        await broadcastDailyNotification(quiz.title)
        toast.success("Test faollashtirildi va xabarnoma yuborildi")
      } else {
        toast.success("Test nofaol qilindi")
      }
      
      fetchQuizzes()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Question CRUD ---
  const openQuestionModal = (index = null) => {
    if (index !== null) {
      setEditingQuestionIndex(index)
      const q = questions[index]
      setQForm({ 
        text: q.text, option_a: q.option_a, option_b: q.option_b, 
        option_c: q.option_c || '', option_d: q.option_d || '', 
        correct_option: q.correct_option, explanation: q.explanation || '',
        image_url: q.image_url || ''
      })
    } else {
      setEditingQuestionIndex(null)
      setQForm({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', image_url: '' })
    }
    setIsQuestionModalOpen(true)
  }

  const saveQuestion = async (e) => {
    e.preventDefault()
    const payload = { 
      ...qForm, 
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex].id : Math.random().toString(36).substr(2, 9)
    }

    let newQuestions = [...questions]
    if (editingQuestionIndex !== null) {
      newQuestions[editingQuestionIndex] = payload
    } else {
      newQuestions.push(payload)
    }

    setQuestions(newQuestions)
    setIsQuestionModalOpen(false)
    
    // Auto-save if quiz already exists
    if (selQuiz) {
      const { error } = await supabase.from('daily_quizzes')
        .update({ questions: newQuestions }).eq('id', selQuiz.id)
      if (error) toast.error("DB saqlashda xato: " + error.message)
    }
  }

  const deleteQuestion = async (index) => {
    if (!confirm("Savolni o'chirmoqchimisiz?")) return
    const newQuestions = questions.filter((_, i) => i !== index)
    setQuestions(newQuestions)
    if (selQuiz) {
      await supabase.from('daily_quizzes').update({ questions: newQuestions }).eq('id', selQuiz.id)
    }
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `daily-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `question-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('quizzes').upload(filePath, file)

      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('quizzes').getPublicUrl(filePath)
      setQForm(prev => ({ ...prev, image_url: publicUrl }))
      toast.success("Rasm yuklandi")
    } catch (err) {
      toast.error("Xatolik: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const filteredQuizzes = quizzes.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* ── BREADCRUMBS & HEADER ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <button 
            onClick={view === 'editor' ? goBack : undefined}
            style={{ background: 'none', border: 'none', padding: 0, cursor: view === 'editor' ? 'pointer' : 'default', fontWeight: view === 'editor' ? 600 : 800, fontSize: '0.875rem', color: view === 'editor' ? '#64748B' : 'white' }}
          >
            Kunlik Testlar
          </button>
          {view === 'editor' && (
            <>
              <ChevronRight size={14} color="#475569" />
              <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>
                {selQuiz ? selQuiz.title : "Yangi Test"}
              </span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? '1.75rem' : '2.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
              {view === 'list' ? 'Kunlik Testlar' : (selQuiz ? 'Testni Tahrirlash' : 'Yangi Kunlik Test')}
            </h1>
            <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.875rem' }}>
              {view === 'list' ? 'Har kuni faqat 1 marta yechiladigan testlar boshqaruvi.' : 'Test ma\'lumotlari va savollarni kiriting.'}
            </p>
          </div>
          {view === 'list' ? (
            <button 
              onClick={() => enterEditor()}
              style={{ width: isMobile ? '100%' : 'auto', background: '#3461FF', color: 'white', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px rgba(52,97,255,0.25)' }}
            >
              <Plus size={20} /> Yangi Test
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12, width: isMobile ? '100%' : 'auto' }}>
              <button onClick={goBack} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '14px', fontWeight: 600, cursor: 'pointer' }}>Bekor</button>
              <button onClick={() => saveQuizMetadata()} style={{ flex: 2, background: '#3461FF', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 20px rgba(52,97,255,0.25)' }}>
                <Save size={18} /> Saqlash
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {view === 'list' ? (
          <motion.div key="list" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type="text" placeholder="Sarlavha bo'yicha qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...inp, paddingLeft: 48, borderRadius: 16, background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)' }}
              />
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <style>{`
                  @keyframes skeleton-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                  }
                `}</style>
                {[1, 2, 3, 4, 5].map(i => <DarkSkeleton key={i} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredQuizzes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60, background: '#1E293B', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)', color: '#64748B' }}>Hozircha testlar yo'q.</div>
                ) : (
                  filteredQuizzes.map(quiz => (
                    <QuizRow key={quiz.id} quiz={quiz} isMobile={isMobile} onEnter={() => enterEditor(quiz)} onToggle={() => toggleActive(quiz)} onDelete={() => deleteQuiz(quiz.id)} />
                  ))
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="editor" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '350px 1fr', gap: 32, alignItems: 'start' }}>
              
              {/* LEFT: Metadata Form (Nested/Inline) */}
              <div style={{ background: '#1E293B', borderRadius: 24, padding: 28, border: '1px solid rgba(255,255,255,0.05)', position: isMobile ? 'static' : 'sticky', top: 20 }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '1.125rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <List size={20} color="#3461FF" /> Asosiy Ma'lumotlar
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: 8, display: 'block', fontWeight: 600 }}>Test Sarlavhasi</label>
                    <input value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})} style={inp} placeholder="Masalan: Matematika" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: 8, display: 'block', fontWeight: 600 }}>Sana</label>
                    <input type="date" value={quizForm.quiz_date} onChange={e => setQuizForm({...quizForm, quiz_date: e.target.value})} style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: 8, display: 'block', fontWeight: 600 }}>Narxi (Coin)</label>
                    <input type="number" value={quizForm.entry_fee_coins} onChange={e => setQuizForm({...quizForm, entry_fee_coins: parseInt(e.target.value) || 0})} style={inp} placeholder="0 = Bepul" />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <input type="checkbox" checked={quizForm.is_active} onChange={e => setQuizForm({...quizForm, is_active: e.target.checked})} style={{ width: 20, height: 20 }} />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'white' }}>Platformada ko'rsatish</span>
                  </label>
                </div>
              </div>

              {/* RIGHT: Questions List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Savollar ({questions.length})</h3>
                  <button 
                    onClick={() => openQuestionModal()}
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', padding: '8px 16px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem' }}
                  >
                    <Plus size={16} /> Savol Qo'shish
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {questions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.05)', color: '#64748B' }}>Hozircha savollar qo'shilmagan.</div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={idx} style={{ background: '#1E293B', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)', padding: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(52,97,255,0.1)', color: '#3461FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>{idx + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <div style={{ margin: '0 0 4px', fontSize: '0.9375rem', fontWeight: 600, color: 'white', wordBreak: 'break-word', lineHeight: 1.5 }}>
                             <MathRenderer math={q.text} />
                           </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '0.8125rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: 6 }}>Variant {q.correct_option.toUpperCase()}</span>
                            {q.image_url && <span style={{ fontSize: '0.8125rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}><ImageIcon size={12} /> Rasm bor</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openQuestionModal(idx)} style={{ padding: 8, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, color: '#3461FF', cursor: 'pointer' }}><Edit2 size={16} /></button>
                          <button onClick={() => deleteQuestion(idx)} style={{ padding: 8, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8, color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUESTION MODAL */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#1E293B', width: '100%', maxWidth: 600, borderRadius: 28, padding: 32, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 900 }}>{editingQuestionIndex !== null ? "Savolni Tahrirlash" : "Yangi Savol"}</h2>

              <form onSubmit={saveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: 6, display: 'block', fontWeight: 600 }}>Savol matni</label>
                  <MathTextInput required rows={3} placeholder="Savol matni (formula uchun π tugmasini bosing)" value={qForm.text} onChange={val => setQForm({...qForm, text: val})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <MathTextInput required placeholder="Variant A" value={qForm.option_a} onChange={val => setQForm({...qForm, option_a: val})} />
                  <MathTextInput required placeholder="Variant B" value={qForm.option_b} onChange={val => setQForm({...qForm, option_b: val})} />
                  <MathTextInput placeholder="Variant C (ixtiyoriy)" value={qForm.option_c} onChange={val => setQForm({...qForm, option_c: val})} />
                  <MathTextInput placeholder="Variant D (ixtiyoriy)" value={qForm.option_d} onChange={val => setQForm({...qForm, option_d: val})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.8125rem', color: '#94A3B8', marginBottom: 6, display: 'block' }}>To'g'ri javob</label>
                    <select value={qForm.correct_option} onChange={e => setQForm({...qForm, correct_option: e.target.value})} style={{...inp, WebkitAppearance: 'none'}}>
                      <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                     <label style={{ 
                        background: '#334155', color: 'white', padding: '14px', borderRadius: 12, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: isUploading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                        {isUploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                        <input type="file" onChange={handleImageUpload} disabled={isUploading} hidden accept="image/*" />
                      </label>
                  </div>
                </div>
                {qForm.image_url && (
                  <div style={{ position: 'relative', width: 'fit-content' }}>
                    <img src={qForm.image_url} alt="Preview" style={{ height: 100, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
                    <button type="button" onClick={() => setQForm({ ...qForm, image_url: '' })} style={{ position: 'absolute', top: -10, right: -10, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                )}
                <textarea placeholder="Tushuntirish (ixtiyoriy)" value={qForm.explanation} onChange={e => setQForm({...qForm, explanation: e.target.value})} rows={2} style={inp} />
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button type="button" onClick={() => setIsQuestionModalOpen(false)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: 14, borderRadius: 12, background: '#10B981', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuizRow({ quiz, onEnter, onToggle, onDelete, isMobile }) {
  const qCount = quiz.questions?.length || 0;
  const today = new Date().toISOString().split('T')[0];
  const isToday = quiz.quiz_date === today;
  const isPast = quiz.quiz_date < today;
  const isFuture = quiz.quiz_date > today;
  
  return (
    <motion.div
      whileHover={{ x: 2 }}
      onClick={onEnter}
      style={{ 
        background: '#1E293B',
        borderRadius: 20, 
        border: `1px solid ${isToday ? 'rgba(52,97,255,0.2)' : 'rgba(255,255,255,0.05)'}`,
        borderLeft: isPast ? '3px solid rgba(100,116,139,0.4)' : isToday ? '3px solid #3461FF' : '1px solid rgba(255,255,255,0.05)',
        padding: '20px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', 
        gap: 16, cursor: 'pointer', flexDirection: isMobile ? 'column' : 'row',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: isToday ? 'rgba(52,97,255,0.15)' : 'rgba(255,255,255,0.05)', color: isToday ? '#3461FF' : '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Target size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</h3>
            {isToday && <span style={{ fontSize: '0.7rem', background: '#3461FF', padding: '2px 8px', borderRadius: 100, color: 'white', fontWeight: 700 }}>Bugun</span>}
            {isPast && <span style={{ fontSize: '0.7rem', background: 'rgba(100,116,139,0.2)', padding: '2px 8px', borderRadius: 100, color: '#64748B', fontWeight: 700 }}>O'tgan</span>}
            {isFuture && <span style={{ fontSize: '0.7rem', background: 'rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: 100, color: '#F59E0B', fontWeight: 700 }}>Rejalashtirilgan</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748B', fontSize: '0.875rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {quiz.quiz_date}</span>
            <span style={{ display: isMobile ? 'none' : 'inline' }}>•</span>
            <span>{qCount} ta savol</span>
            <span style={{ display: isMobile ? 'none' : 'inline' }}>•</span>
            <span style={{ color: quiz.entry_fee_coins > 0 ? '#F59E0B' : '#10B981', fontWeight: 700 }}>{quiz.entry_fee_coins > 0 ? `${quiz.entry_fee_coins} Coin` : 'Bepul'}</span>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 12 : 0, paddingTop: isMobile ? 12 : 0, borderTop: isMobile ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={e => { e.stopPropagation(); onToggle() }}
            title={isPast && !quiz.is_active ? "O'tgan kunlik test — qayta faollashtirish" : ''}
            style={{ 
              background: quiz.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: quiz.is_active ? '#10B981' : '#64748B', 
              padding: '8px 12px', borderRadius: 10, 
              cursor: 'pointer', 
              display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', fontWeight: 700,
            }}
          >
            {quiz.is_active ? <Eye size={14} /> : <EyeOff size={14} />} {!isMobile && (quiz.is_active ? 'Faol' : 'Nofaol')}
          </button>
          <button 
            onClick={e => { e.stopPropagation(); onDelete() }}
            style={{ padding: 10, background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 12, color: '#EF4444', cursor: 'pointer' }}
          >
            <Trash2 size={18} />
          </button>
        </div>
        {!isMobile && <ChevronRight size={20} color="#475569" />}
      </div>
    </motion.div>
  )
}
