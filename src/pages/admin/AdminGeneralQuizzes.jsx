import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Search, Clock, Target } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminGeneralQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [quizForm, setQuizForm] = useState({ 
    question: '', option_a: '', option_b: '', option_c: '', option_d: '', 
    correct_option: 'a', explanation: '', time_limit: 600 
  })

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

  const openModal = (quiz = null) => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Umumiy Testlar (General Quizzes)</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Darslarga bog'liq bo'lmagan, aralash tushuvchi testlar bazasi.</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ background: '#10B981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
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
        <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.875rem' }}>
                <th style={{ padding: '20px' }}>Savol</th>
                <th style={{ padding: '20px' }}>Vaqti</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="skeleton-loader" style={{ width: 36, height: 36, borderRadius: 10, background: '#334155', flexShrink: 0 }} />
                      <div>
                        <div className="skeleton-loader" style={{ height: 15, width: 260, borderRadius: 6, marginBottom: 8, background: '#334155' }} />
                        <div className="skeleton-loader" style={{ height: 12, width: 100, borderRadius: 6, background: '#334155' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div className="skeleton-loader" style={{ height: 16, width: 50, borderRadius: 6, background: '#334155' }} />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <div className="skeleton-loader" style={{ width: 34, height: 34, borderRadius: 8, background: '#334155' }} />
                      <div className="skeleton-loader" style={{ width: 34, height: 34, borderRadius: 8, background: '#334155' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.875rem' }}>
                <th style={{ padding: '20px' }}>Savol</th>
                <th style={{ padding: '20px' }}>Vaqti</th>
                <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Hozircha testlar yo'q yoki qidiruvga topilmadi.</td></tr>
              ) : (
                filteredQuizzes.map(quiz => (
                  <tr key={quiz.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Target size={18} />
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px', fontSize: '1rem', color: '#F8FAFC' }}>{quiz.question}</p>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B' }}>To'g'ri javob: <span style={{ textTransform: 'uppercase', color: '#10B981', fontWeight: 800 }}>{quiz.correct_option}</span></p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px', color: '#F59E0B', fontWeight: 700, fontSize: '0.9375rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> {quiz.time_limit}s</div>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                       <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                          <button onClick={() => openModal(quiz)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                          <button onClick={() => deleteQuiz(quiz.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
                {editingItem ? "Umumiy Savolni Tahrirlash" : "Yangi Umumiy Savol Qo'shish"}
              </h2>
              
              <form onSubmit={saveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <textarea required placeholder="Savol matni" value={quizForm.question} onChange={e => setQuizForm({...quizForm, question: e.target.value})} rows={2} style={modalInputStyle} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Vaqti (sekund)</label>
                    <input required type="number" placeholder="Vaqti (sekund)" value={quizForm.time_limit} onChange={e => setQuizForm({...quizForm, time_limit: parseInt(e.target.value)})} style={modalInputStyle} />
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
