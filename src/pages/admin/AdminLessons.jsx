import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Video, Lock, Unlock, Eye, EyeOff, Search, ChevronDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminLessons() {
  const [lessons, setLessons] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({ 
    course_id: '', 
    title: '', 
    youtube_video_id: '', 
    price: 0, 
    order_index: 0, 
    is_free: false, 
    is_published: false 
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [lessonsRes, coursesRes] = await Promise.all([
      supabase.from('lessons').select('*, courses(title)').order('order_index', { ascending: true }),
      supabase.from('courses').select('id, title').order('title')
    ])
    
    if (lessonsRes.error) toast.error("Darslarni yuklashda xatolik")
    else setLessons(lessonsRes.data || [])
    
    if (coursesRes.error) toast.error("Kurslarni yuklashda xatolik")
    else {
      setCourses(coursesRes.data || [])
      if (coursesRes.data?.length > 0 && !formData.course_id) {
        setFormData(prev => ({ ...prev, course_id: coursesRes.data[0].id }))
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingLesson) {
      const { error } = await supabase.from('lessons').update(formData).eq('id', editingLesson.id)
      if (error) toast.error(error.message)
      else {
        toast.success("Dars yangilandi")
        closeModal()
        fetchData()
      }
    } else {
      const { error } = await supabase.from('lessons').insert([formData])
      if (error) toast.error(error.message)
      else {
        toast.success("Dars yaratildi")
        closeModal()
        fetchData()
      }
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Haqiqatdan ham ushbu darsni o'chirmoqchimisiz?")) return
    const { error } = await supabase.from('lessons').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success("Dars o'chirildi")
      fetchData()
    }
  }

  const openModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson)
      setFormData({
        course_id: lesson.course_id,
        title: lesson.title,
        youtube_video_id: lesson.youtube_video_id || '',
        price: lesson.price || 0,
        order_index: lesson.order_index || 0,
        is_free: lesson.is_free,
        is_published: lesson.is_published
      })
    } else {
      setEditingLesson(null)
      setFormData({
        course_id: courses[0]?.id || '',
        title: '',
        youtube_video_id: '',
        price: 0,
        order_index: (lessons.length > 0 ? Math.max(...lessons.map(l => l.order_index)) + 1 : 1),
        is_free: false,
        is_published: false
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingLesson(null)
  }

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.courses?.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Darslar Boshqaruvi</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Barcha video darslarni tartibga solish va narxlarni belgilash.</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ background: '#3461FF', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Plus size={20} /> Dars Qo'shish
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input 
          type="text"
          placeholder="Dars yoki kurs nomi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
        />
      </div>

      <div style={{ background: '#1E293B', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.875rem' }}>
              <th style={{ padding: '20px' }}>Tartib / Dars</th>
              <th style={{ padding: '20px' }}>Kurs</th>
              <th style={{ padding: '20px' }}>Narx</th>
              <th style={{ padding: '20px' }}>Holat</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Yuklanmoqda...</td></tr>
            ) : filteredLessons.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Darslar topilmadi.</td></tr>
            ) : filteredLessons.map((lesson) => (
              <tr key={lesson.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ color: '#64748B', fontWeight: 700 }}>#{lesson.order_index}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{lesson.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>ID: {lesson.youtube_video_id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <span style={{ fontSize: '0.875rem', color: '#F8FAFC' }}>{lesson.courses?.title}</span>
                </td>
                <td style={{ padding: '20px' }}>
                  {lesson.is_free ? (
                    <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.875rem' }}>Bepul</span>
                  ) : (
                    <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.875rem' }}>{lesson.price} coin</span>
                  )}
                </td>
                <td style={{ padding: '20px' }}>
                  {lesson.is_published ? (
                    <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}><Eye size={14} /> Online</span>
                  ) : (
                    <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}><EyeOff size={14} /> Draft</span>
                  )}
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button onClick={() => openModal(lesson)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(lesson.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ background: '#1E293B', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', maxHeight: '90vh' }}>
              <h2 style={{ mt: 0, mb: '24px' }}>{editingLesson ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish"}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Dars Nomi</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Kursni tanlang</label>
                  <select value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>YouTube Video ID</label>
                  <input required type="text" value={formData.youtube_video_id} onChange={e => setFormData({...formData, youtube_video_id: e.target.value})} placeholder="e.g. dQw4w9WgXcQ" style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Tartib (Order)</label>
                  <input type="number" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Narxi (Coins)</label>
                  <input type="number" disabled={formData.is_free} value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', opacity: formData.is_free ? 0.5 : 1 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.is_free} onChange={e => setFormData({...formData, is_free: e.target.checked, price: e.target.checked ? 0 : formData.price})} /> Bepul dars
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} /> Chop etish
                  </label>
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: '12px' }}>
                  <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{editingLesson ? "Saqlash" : "Yaratish"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
