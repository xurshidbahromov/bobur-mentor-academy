import { useState } from 'react'
import { useCourses } from '../hooks/useCourses'
import { FolderOpen, Search, X } from 'lucide-react'
import CourseCard from '../components/course/CourseCard'
import { motion, AnimatePresence } from 'framer-motion'

import { useTelegram } from '../context/TelegramProvider'

export default function CoursesPage() {
  const { courses, loading, error } = useCourses()
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { isTelegram } = useTelegram()

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: `${isTelegram ? '120px' : '100px'} 24px 100px`, 
      minHeight: '100vh',
    }}>
      
      {/* ── Compact Header & Search ── */}
      <div style={{ marginBottom: '64px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              margin: 0
            }}
          >
            Darslar <br />
            <span style={{ color: 'var(--color-primary)' }}>Katalogi</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '500px', lineHeight: 1.6, margin: 0 }}
          >
            Matematikadan sara darlarni o'rganing va darajangizni oshiring.
          </motion.p>
        </div>

        {/* ── Minimalist Search Bar ── */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ maxWidth: '420px', position: 'relative' }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            border: `1.5px solid ${isFocused ? 'rgba(52, 97, 255, 0.5)' : 'rgba(0,0,0,0.06)'}`,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: '12px',
            height: '54px',
            transition: 'all 0.3s ease',
            boxShadow: isFocused ? '0 8px 30px rgba(52, 97, 255, 0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}>
            <Search size={18} color={isFocused ? 'var(--color-primary)' : '#94A3B8'} />
            <input 
              type="text"
              placeholder="Qidiruv..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                style={{ 
                  background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
                  color: '#94A3B8', display: 'flex'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-loader" style={{
              aspectRatio: '4/5', borderRadius: 'var(--radius-card)'
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-error)' }}>
          <p>Xatolik yuz berdi: {error}</p>
        </div>
      ) : courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '100px 24px',
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: 'var(--shadow-glass)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderOpen size={36} color="var(--color-primary)" />
          </div>
          <h3 style={{ color: 'var(--text-secondary)' }}>Hozircha darslar mavjud emas</h3>
          <p style={{ color: 'var(--text-muted)' }}>Tez orada yangi darslar qo'shiladi.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
            <AnimatePresence mode="popLayout">
              {filteredCourses.map(course => (
                <motion.div
                  layout
                  key={course.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredCourses.length === 0 && searchTerm && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}
            >
              <Search size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p style={{ fontSize: '1.125rem' }}>"{searchTerm}" bo'yicha hech qanday kurs topilmadi.</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
