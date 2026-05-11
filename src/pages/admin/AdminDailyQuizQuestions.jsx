import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, ArrowLeft, Loader2, Image as ImageIcon, Target } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import MathRenderer from '../../components/ui/MathRenderer'
import MathTextInput from '../../components/ui/MathTextInput'

export default function AdminDailyQuizQuestions() {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  
  const [qForm, setQForm] = useState({ 
    text: '', option_a: '', option_b: '', option_c: '', option_d: '', 
    correct_option: 'a', explanation: '', image_url: ''
  })
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  async function fetchQuiz() {
    setLoading(true)
    const { data, error } = await supabase
      .from('daily_quizzes')
      .select('*')
      .eq('id', quizId)
      .single()
      
    if (error) {
      toast.error("Xatolik: " + error.message)
      navigate('/admin/daily-quizzes')
    } else {
      setQuiz(data)
      setQuestions(data.questions || [])
    }
    setLoading(false)
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
        .from('quizzes')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        toast.error("Rasm yuklashda xatolik: " + uploadError.message)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('quizzes')
          .getPublicUrl(filePath)
        
        setQForm(prev => ({ ...prev, image_url: publicUrl }))
        toast.success("Rasm muvaffaqiyatli yuklandi")
      }
    } catch (err) {
      toast.error("Xatolik yuz berdi: " + err.message)
    } finally {
      setIsUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const openModal = (index = null) => {
    if (index !== null) {
      setEditingIndex(index)
      const q = questions[index]
      setQForm({ 
        text: q.text, option_a: q.option_a, option_b: q.option_b, 
        option_c: q.option_c || '', option_d: q.option_d || '', 
        correct_option: q.correct_option, explanation: q.explanation || '',
        image_url: q.image_url || ''
      })
    } else {
      setEditingIndex(null)
      setQForm({ text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', explanation: '', image_url: '' })
    }
    setIsModalOpen(true)
  }

  const saveQuestion = async (e) => {
    e.preventDefault()
    
    // Add unique ID to question if it's new
    const payload = { 
      ...qForm, 
      id: editingIndex !== null ? questions[editingIndex].id : Math.random().toString(36).substr(2, 9)
    }

    let newQuestions = [...questions]
    if (editingIndex !== null) {
      newQuestions[editingIndex] = payload
    } else {
      newQuestions.push(payload)
    }

    // Update DB
    const { error } = await supabase
      .from('daily_quizzes')
      .update({ questions: newQuestions })
      .eq('id', quizId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editingIndex !== null ? "Savol yangilandi" : "Yangi savol qo'shildi")
      setQuestions(newQuestions)
      setIsModalOpen(false)
    }
  }

  const deleteQuestion = async (index) => {
    if (!confirm("Ushbu savolni o'chirmoqchimisiz?")) return
    
    const newQuestions = questions.filter((_, i) => i !== index)
    
    const { error } = await supabase
      .from('daily_quizzes')
      .update({ questions: newQuestions })
      .eq('id', quizId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Savol o'chirildi")
      setQuestions(newQuestions)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '32px' }}>
        <button 
          onClick={() => navigate('/admin/daily-quizzes')}
          style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>{quiz?.title || "Yuklanmoqda..."}</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>{quiz?.quiz_date} kungi test savollari</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={20} /> Yangi Savol Qo'shish
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.875rem' }}>
                <th style={{ padding: '20px', width: 50 }}>№</th>
                <th style={{ padding: '20px' }}>Savol matni</th>
                <th style={{ padding: '20px' }}>To'g'ri javob</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Hozircha savollar yo'q.</td></tr>
              ) : (
                questions.map((q, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px', color: '#64748B', fontWeight: 700 }}>{index + 1}</td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        {q.image_url && (
                          <img src={q.image_url} alt="Savol rasmi" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
                        )}
                        <div>
                          <div style={{ margin: '0 0 4px', fontSize: '1rem', color: '#F8FAFC', fontWeight: 600 }}>
                            <MathRenderer math={q.text} />
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94A3B8' }}>{q.option_a} | {q.option_b} ...</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ textTransform: 'uppercase', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: 100 }}>
                        {q.correct_option}
                      </span>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button onClick={() => openModal(index)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                          <button onClick={() => deleteQuestion(index)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#1E293B', width: '100%', maxWidth: 600, borderRadius: 24, padding: 32, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}>
              <h2 style={{ margin: '0 0 24px', fontSize: '1.5rem', fontWeight: 800 }}>
                {editingIndex !== null ? "Savolni Tahrirlash" : "Yangi Savol Qo'shish"}
              </h2>
              
              <form onSubmit={saveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: '0.875rem', marginBottom: 8, display: 'block', color: '#94A3B8' }}>Savol matni</label>
                  <MathTextInput required rows={2} placeholder="Savol matni (formula uchun π tugmasini bosing)" value={qForm.text} onChange={val => setQForm({...qForm, text: val})} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant A</label>
                    <MathTextInput required placeholder="Variant A" value={qForm.option_a} onChange={val => setQForm({...qForm, option_a: val})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant B</label>
                    <MathTextInput required placeholder="Variant B" value={qForm.option_b} onChange={val => setQForm({...qForm, option_b: val})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant C (ixtiyoriy)</label>
                    <MathTextInput placeholder="Variant C" value={qForm.option_c} onChange={val => setQForm({...qForm, option_c: val})} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block' }}>Variant D (ixtiyoriy)</label>
                    <MathTextInput placeholder="Variant D" value={qForm.option_d} onChange={val => setQForm({...qForm, option_d: val})} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', marginBottom: 8, display: 'block', color: '#94A3B8' }}>To'g'ri javobni belgilang</label>
                  <select value={qForm.correct_option} onChange={e => setQForm({...qForm, correct_option: e.target.value})} style={{...modalInputStyle, WebkitAppearance: 'none'}}>
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input placeholder="Savol rasmi URL (ixtiyoriy, chizmalar uchun)" value={qForm.image_url} onChange={e => setQForm({...qForm, image_url: e.target.value})} style={{ ...modalInputStyle, flex: 1 }} />
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
                  {qForm.image_url && (
                    <div style={{ position: 'relative', width: 'fit-content' }}>
                      <img src={qForm.image_url} alt="Preview" style={{ height: 100, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
                      <button 
                        type="button"
                        onClick={() => setQForm({ ...qForm, image_url: '' })}
                        style={{ position: 'absolute', top: -10, right: -10, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                <textarea placeholder="Tushuntirish (ixtiyoriy)" value={qForm.explanation} onChange={e => setQForm({...qForm, explanation: e.target.value})} rows={2} style={modalInputStyle} />

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: 14, borderRadius: 12, background: '#10B981', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{editingIndex !== null ? "Saqlash" : "Yaratish"}</button>
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
