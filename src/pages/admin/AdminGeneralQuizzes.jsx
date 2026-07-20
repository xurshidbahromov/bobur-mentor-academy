import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Clock, Target, Loader2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import MathRenderer from '../../components/ui/MathRenderer'
import MathTextInput from '../../components/ui/MathTextInput'

export default function AdminGeneralQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [quizForm, setQuizForm] = useState({ 
    question: '', option_a: '', option_b: '', option_c: '', option_d: '', 
    correct_option: 'a', explanation: '', time_limit: 600, image_url: ''
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  async function fetchQuizzes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('is_general', true)
      .order('created_at', { ascending: false })
      
    if (error) {
      if (error.code === '42703') { // Unknown column error code
         toast.error("Baza qismida is_general ustuni topilmadi. Avval SQL ni ishlating!")
      } else {
         toast.error("Xatolik: " + error.message)
      }
    } else {
      setQuizzes(data || [])
    }
    setLoading(false)
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return
      
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `general-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
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

  const openModal = (quiz = null) => {
    if (quiz) {
      setEditingItem(quiz)
      setQuizForm({ 
        question: quiz.question, option_a: quiz.option_a, option_b: quiz.option_b, 
        option_c: quiz.option_c || '', option_d: quiz.option_d || '', 
        correct_option: quiz.correct_option, explanation: quiz.explanation || '',
        time_limit: quiz.time_limit || 600, image_url: quiz.image_url || ''
      })
    } else {
      setEditingItem(null)
      setQuizForm({ question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', time_limit: 600, image_url: '' })
    }
    setIsModalOpen(true)
  }

  const saveQuiz = async (e) => {
    e.preventDefault()
    const payload = { ...quizForm, is_general: true, lesson_id: null }
    
    if (editingItem) {
      const { error } = await supabase.from('quizzes').update(payload).eq('id', editingItem.id)
      if (error) toast.error(error.message)
      else { toast.success("Umumiy savol yangilandi"); setIsModalOpen(false); fetchQuizzes() }
    } else {
      const { error } = await supabase.from('quizzes').insert([payload])
      if (error) toast.error(error.message)
      else { toast.success("Yangi umumiy savol yaratildi"); setIsModalOpen(false); fetchQuizzes() }
    }
  }

  const deleteQuiz = async (id) => {
    if (!confirm("Ushbu yagona savolni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('quizzes').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Savol o'chirildi"); fetchQuizzes() }
  }

  const filteredQuizzes = quizzes.filter(q => q.question.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800 }}>Umumiy Testlar (General Quizzes)</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Darslarga bog'liq bo'lmagan, aralash tushuvchi testlar bazasi.</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
        >
          <Plus size={20} /> Yangi Umumiy Savol
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input 
          type="text" placeholder="Savol bo'yicha qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: 'white', outline: 'none', fontSize: '1rem' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ background: '#1E293B', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="skeleton-loader" style={{ width: 36, height: 36, borderRadius: 10, background: '#334155', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-loader" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 8, background: '#334155' }} />
                <div className="skeleton-loader" style={{ height: 12, width: '30%', borderRadius: 6, background: '#334155' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="skeleton-loader" style={{ width: 34, height: 34, borderRadius: 8, background: '#334155' }} />
                <div className="skeleton-loader" style={{ width: 34, height: 34, borderRadius: 8, background: '#334155' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredQuizzes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#1E293B', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.07)', color: '#64748B' }}>
              Hozircha testlar yo'q yoki qidiruvga topilmadi.
            </div>
          ) : (
            filteredQuizzes.map(quiz => (
              <div key={quiz.id} style={{ background: '#1E293B', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Target size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', color: '#F8FAFC', fontWeight: 600, wordBreak: 'break-word', lineHeight: 1.5 }}>
                    <MathRenderer math={quiz.question} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>To'g'ri javob: <span style={{ textTransform: 'uppercase', color: '#10B981', fontWeight: 800 }}>{quiz.correct_option}</span></span>
                    <span style={{ fontSize: '0.8125rem', color: '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {quiz.time_limit}s
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openModal(quiz)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={() => deleteQuiz(quiz.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div className="admin-modal-content" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#1E293B', width: '100%', maxWidth: 600, padding: 'clamp(20px, 5vw, 32px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 800 }}>
                {editingItem ? "Umumiy Savolni Tahrirlash" : "Yangi Umumiy Savol Qo'shish"}
              </h2>
              
              <form onSubmit={saveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: '0.875rem', marginBottom: 8, display: 'block', color: '#94A3B8' }}>Savol matni</label>
                  <MathTextInput required rows={2} placeholder="Savol matni (formula uchun π tugmasini bosing)" value={quizForm.question} onChange={val => setQuizForm({...quizForm, question: val})} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Vaqti (sekund)</label>
                    <input required type="number" placeholder="Vaqti (sekund)" value={quizForm.time_limit} onChange={e => setQuizForm({...quizForm, time_limit: parseInt(e.target.value)})} style={modalInputStyle} />
                  </div>
                  <div />

                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant A</label>
                    <MathTextInput required placeholder="Variant A" value={quizForm.option_a} onChange={val => setQuizForm({...quizForm, option_a: val})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant B</label>
                    <MathTextInput required placeholder="Variant B" value={quizForm.option_b} onChange={val => setQuizForm({...quizForm, option_b: val})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant C (ixtiyoriy)</label>
                    <MathTextInput placeholder="Variant C" value={quizForm.option_c} onChange={val => setQuizForm({...quizForm, option_c: val})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant D (ixtiyoriy)</label>
                    <MathTextInput placeholder="Variant D" value={quizForm.option_d} onChange={val => setQuizForm({...quizForm, option_d: val})} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', marginBottom: 8, display: 'block', color: '#94A3B8' }}>To'g'ri javobni belgilang</label>
                  <select value={quizForm.correct_option} onChange={e => setQuizForm({...quizForm, correct_option: e.target.value})} style={{...modalInputStyle, WebkitAppearance: 'none'}}>
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input placeholder="Savol rasmi URL (ixtiyoriy, chizmalar uchun)" value={quizForm.image_url} onChange={e => setQuizForm({...quizForm, image_url: e.target.value})} style={{ ...modalInputStyle, flex: 1 }} />
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
                        type="button"
                        onClick={() => setQuizForm({ ...quizForm, image_url: '' })}
                        style={{ position: 'absolute', top: -10, right: -10, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <textarea placeholder="Tushuntirish (ixtiyoriy)" value={quizForm.explanation} onChange={e => setQuizForm({...quizForm, explanation: e.target.value})} rows={2} style={modalInputStyle} />

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: 14, borderRadius: 12, background: '#10B981', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{editingItem ? "Saqlash" : "Yaratish"}</button>
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
