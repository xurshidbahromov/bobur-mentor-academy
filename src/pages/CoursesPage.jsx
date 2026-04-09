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
      padding: `${isTelegram ? '110px' : '90px'} 24px 100px`, 
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.03), transparent 40%), radial-gradient(circle at bottom left, rgba(52, 97, 255, 0.03), transparent 40%)'
    }}>
      
      {/* ── Premium Header Section ── */}
      <div style={{ marginBottom: '60px', position: 'relative' }}>
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
            color: 'var(--text-primary)',
            lineHeight: 1,
            marginBottom: '24px'
          }}
        >
          Bizning <br />
          <span style={{
            background: 'linear-gradient(135deg, #3461FF 0%, #8B5CF6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Kurslarimiz.
          </span>
        </motion.h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '32px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '520px', lineHeight: 1.6, margin: 0 }}
          >
            Matematikadan eng sara video darslar va amaliy mashg'ulotlar to'plami. O'zingizga mos yo'nalishni tanlang.
          </motion.p>
        </div>
      </div>

      {/* ── Search Island ── */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ 
          marginBottom: '56px',
          position: 'sticky',
          top: isTelegram ? '74px' : '84px',
          zIndex: 100,
          background: 'rgba(255,255,255,0.01)',
          padding: '4px 0'
        }}
      >
        <div style={{
          position: 'relative',
          maxWidth: '600px',
          margin: '0 auto',
          borderRadius: '24px',
          padding: '2px', // for gradient border effect
          background: isFocused 
            ? 'linear-gradient(135deg, #3461FF, #8B5CF6)' 
            : 'rgba(52, 97, 255, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          boxShadow: isFocused 
            ? '0 20px 40px rgba(52, 97, 255, 0.15), 0 0 0 4px rgba(52, 97, 255, 0.05)' 
            : '0 4px 20px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '22px',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 8px 4px 20px',
            gap: '12px',
            height: '64px'
          }}>
            <Search size={22} color={isFocused ? '#3461FF' : '#94A3B8'} style={{ transition: 'color 0.3s' }} />
            <input 
              type="text"
              placeholder="Qaysi mavzuni o'rganamiz? (Masalan: Funksiya)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '1.0625rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
                outline: 'none',
                height: '100%'
              }}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm('')}
                  style={{ 
                    padding: '8px',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B'
                  }}
                >
                  <X size={18} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

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
