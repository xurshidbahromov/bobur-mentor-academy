import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({ title: '', description: '', is_published: false })

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) toast.error("Kurslarni yuklashda xatolik: " + error.message)
    else setCourses(data || [])
    setLoading(false)
  }

  const handleTogglePublish = async (course) => {
    const { error } = await supabase
      .from('courses')
      .update({ is_published: !course.is_published })
      .eq('id', course.id)
    
    if (error) toast.error("Xatolik: " + error.message)
    else {
      toast.success(course.is_published ? "Kurs yashirildi" : "Kurs chop etildi")
      fetchCourses()
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Haqiqatdan ham ushbu kursni o'chirmoqchimisiz? Barcha darslar ham o'chib ketishi mumkin.")) return
    
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) toast.error("O'chirishda xatolik: " + error.message)
    else {
      toast.success("Kurs o'chirildi")
      fetchCourses()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { title, description, is_published } = formData
    
    if (editingCourse) {
      const { error } = await supabase
        .from('courses')
        .update({ title, description, is_published })
        .eq('id', editingCourse.id)
      
      if (error) toast.error(error.message)
      else {
        toast.success("Kurs yangilandi")
        closeModal()
        fetchCourses()
      }
    } else {
      const { error } = await supabase
        .from('courses')
        .insert([{ title, description, is_published }])
      
      if (error) toast.error(error.message)
      else {
        toast.success("Yangi kurs yaratildi")
        closeModal()
        fetchCourses()
      }
    }
  }

  const openModal = (course = null) => {
    if (course) {
      setEditingCourse(course)
      setFormData({ title: course.title, description: course.description || '', is_published: course.is_published })
    } else {
      setEditingCourse(null)
      setFormData({ title: '', description: '', is_published: false })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
  }

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Kurslar Boshqaruvi</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Platformadagi barcha kurslarni ko'rish va tahrirlash.</p>
        </div>
        <button 
          onClick={() => openModal()}
          style={{ 
            background: '#3461FF', color: 'white', border: 'none', padding: '12px 24px', 
            borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 
          }}
        >
          <Plus size={20} /> Kurs Qo'shish
        </button>
      </div>

      {/* Filter / Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input 
          type="text"
          placeholder="Kurs nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px',
            background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)',
            color: 'white', outline: 'none'
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#1E293B', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.875rem' }}>
              <th style={{ padding: '20px' }}>Kurs Nomi</th>
              <th style={{ padding: '20px' }}>Darslar</th>
              <th style={{ padding: '20px' }}>Holat</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Yuklanmoqda...</td></tr>
            ) : filteredCourses.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Kurslar topilmadi.</td></tr>
            ) : filteredCourses.map((course) => (
              <tr key={course.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 600 }}>{course.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {course.description || "Tavsif yo'q"}
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <span style={{ background: 'rgba(52, 97, 255, 0.1)', color: '#3461FF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {course.lesson_count} dars
                  </span>
                </td>
                <td style={{ padding: '20px' }}>
                  {course.is_published ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: '0.875rem', fontWeight: 600 }}>
                      <Eye size={16} /> Online
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>
                      <EyeOff size={16} /> Draft
                    </span>
                  )}
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button 
                      onClick={() => handleTogglePublish(course)}
                      title={course.is_published ? "Yashirish" : "Chop etish"}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      {course.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      onClick={() => openModal(course)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(course.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ background: '#1E293B', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <h2 style={{ mt: 0, mb: '24px' }}>{editingCourse ? "Kursni Tahrirlash" : "Yangi Kurs Qo'shish"}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Kurs Nomi</label>
                  <input 
                    required
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94A3B8' }}>Tavsif</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input 
                    type="checkbox" 
                    id="is_published"
                    checked={formData.is_published}
                    onChange={e => setFormData({...formData, is_published: e.target.checked})}
                    style={{ width: 18, height: 18, cursor: 'pointer' }}
                  />
                  <label htmlFor="is_published" style={{ cursor: 'pointer', fontSize: '0.875rem' }}>Hozirroq chop etish (Online)</label>
                </div>
                
                <div style={{ display: 'flex', gap: 12, marginTop: '12px' }}>
                  <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer' }}>Bekor qilish</button>
                  <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                    {editingCourse ? "Saqlash" : "Yaratish"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
