// src/pages/admin/AdminAttendance.jsx
// CRM — Davomat belgilash: guruh + sana tanlash, har bir o'quvchiga status berish,
// tasdiqlash va ota-onalarga Telegram orqali xabar yuborish.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, ChevronDown, CheckCircle2, XCircle, Clock,
  FileText, Send, Loader2, Users, BarChart3, Calendar,
  CheckCheck, X
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  present: {
    label: 'Keldi',
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.3)',
    activeBg: 'rgba(16,185,129,0.18)',
    color: '#10B981',
    Icon: CheckCircle2,
  },
  absent: {
    label: 'Kelmadi',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.3)',
    activeBg: 'rgba(239,68,68,0.16)',
    color: '#EF4444',
    Icon: XCircle,
  },
  late: {
    label: 'Kech keldi',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.3)',
    activeBg: 'rgba(245,158,11,0.16)',
    color: '#F59E0B',
    Icon: Clock,
  },
  excused: {
    label: 'Sababli',
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.3)',
    activeBg: 'rgba(139,92,246,0.16)',
    color: '#8B5CF6',
    Icon: FileText,
  },
}

export default function AdminAttendance() {
  const [groups, setGroups]               = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedDate, setSelectedDate]   = useState(today())
  const [students, setStudents]           = useState([])
  const [attendance, setAttendance]       = useState({})
  const [notes, setNotes]                 = useState({})
  const [loading, setLoading]             = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [confirmed, setConfirmed]         = useState(false)
  const [groupOpen, setGroupOpen]         = useState(false)

  useEffect(() => {
    supabase.from('crm_groups').select('id, name, schedule_days, start_time').eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setGroups(data) })
  }, [])

  useEffect(() => {
    if (!selectedGroup) return
    loadStudentsAndAttendance()
  }, [selectedGroup, selectedDate])

  async function loadStudentsAndAttendance() {
    setLoading(true)
    setConfirmed(false)
    const [{ data: studs }, { data: att }] = await Promise.all([
      supabase.from('crm_students').select('*').eq('group_id', selectedGroup.id).order('full_name'),
      supabase.from('crm_attendance').select('*').eq('group_id', selectedGroup.id).eq('lesson_date', selectedDate),
    ])
    setStudents(studs || [])
    if (att && att.length > 0) {
      const attMap = {}
      const noteMap = {}
      att.forEach(a => {
        attMap[a.student_id] = a.status
        if (a.note) noteMap[a.student_id] = a.note
      })
      setAttendance(attMap)
      setNotes(noteMap)
      if (studs && att.length >= studs.length) setConfirmed(true)
    } else {
      const defaults = {}
      ;(studs || []).forEach(s => { defaults[s.id] = 'present' })
      setAttendance(defaults)
      setNotes({})
    }
    setLoading(false)
  }

  function setStatus(studentId, status) {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  function setNote(studentId, note) {
    setNotes(prev => ({ ...prev, [studentId]: note }))
  }

  function markAll(status) {
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setAttendance(all)
  }

  async function handleSubmit() {
    if (!selectedGroup) { toast.error('Guruhni tanlang'); return }
    const unmarked = students.filter(s => !attendance[s.id])
    if (unmarked.length > 0) { toast.error(`${unmarked.length} ta o'quvchiga status berilmagan`); return }
    setSubmitting(true)
    try {
      const records = students.map(s => ({
        student_id:  s.id,
        group_id:    selectedGroup.id,
        lesson_date: selectedDate,
        status:      attendance[s.id],
        note:        notes[s.id] || null,
        notified_at: null,
      }))
      const { error } = await supabase.from('crm_attendance').upsert(records, { onConflict: 'student_id,lesson_date' })
      if (error) throw error
      try {
        await supabase.functions.invoke('notify-parents', {
          body: { group_id: selectedGroup.id, lesson_date: selectedDate }
        })
        toast.success('Davomat saqlandi va ota-onalarga xabar yuborildi.')
      } catch {
        toast.success('Davomat saqlandi.')
      }
      setConfirmed(true)
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  const summary = Object.values(attendance).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <style>{`
        .att-status-btn { transition: background 0.18s, border-color 0.18s, color 0.18s; }
        .att-status-btn:hover { opacity: 0.85; }
        .att-note-in::placeholder { color: #475569; }
        .att-group-item:hover { background: rgba(255,255,255,0.04) !important; }
        @media (max-width: 640px) {
          .att-controls { flex-direction: column !important; }
          .att-status-wrap { gap: 4px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={22} color="#3461FF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>Davomat</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.85rem', marginTop: 2 }}>Guruh va sanani tanlang, statuslarni belgilang</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="att-controls" style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        {/* Group Dropdown */}
        <div style={{ position: 'relative', minWidth: 220, flex: 1 }}>
          <button
            onClick={() => setGroupOpen(o => !o)}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 12,
              background: '#1E293B',
              border: `1px solid ${selectedGroup ? 'rgba(52,97,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: selectedGroup ? 'white' : '#64748B',
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 10, fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Users size={15} color={selectedGroup ? '#3461FF' : '#475569'} />
              {selectedGroup ? selectedGroup.name : 'Guruhni tanlang'}
            </div>
            <ChevronDown size={15} color="#64748B" style={{ transform: groupOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          <AnimatePresence>
            {groupOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1A2436', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', zIndex: 100, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
              >
                {groups.map(g => (
                  <button key={g.id} className="att-group-item" onClick={() => { setSelectedGroup(g); setGroupOpen(false) }}
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: selectedGroup?.id === g.id ? 'rgba(52,97,255,0.12)' : 'transparent',
                      border: 'none', color: selectedGroup?.id === g.id ? '#60A5FA' : '#CBD5E1',
                      textAlign: 'left', cursor: 'pointer', fontWeight: selectedGroup?.id === g.id ? 700 : 500,
                      fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{g.name}</div>
                    {g.schedule_days && <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>{g.schedule_days.join(', ')}{g.start_time && ` · ${g.start_time}`}</div>}
                  </button>
                ))}
                {groups.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: '0.875rem' }}>Guruhlar yo'q</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#1E293B', padding: '13px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', flex: '0 0 auto' }}>
          <Calendar size={15} color="#64748B" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', fontWeight: 600 }} />
        </div>
      </div>

      {/* Empty / Loading States */}
      {!selectedGroup ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '64px 20px', background: '#1E293B', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <BarChart3 size={32} color="#334155" />
          </div>
          <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>Guruh tanlanmagan</p>
        </motion.div>
      ) : loading ? (
        <div style={{ background: '#1E293B', borderRadius: 20, padding: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1E293B', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 12, width: '30%', borderRadius: 6, background: '#1E293B', marginBottom: 8 }} />
                <div style={{ height: 10, width: '20%', borderRadius: 6, background: '#1E293B' }} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[1,2,3,4].map(j => <div key={j} style={{ width: 76, height: 34, borderRadius: 8, background: '#1E293B' }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 280 }}>
          <Users size={36} color="#334155" style={{ marginBottom: 16 }} />
          <p style={{ color: '#475569', fontWeight: 600, margin: 0 }}>Bu guruhda o'quvchilar yo'q</p>
        </div>
      ) : (
        <>
          {/* Summary bar + mark all */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            {/* Summary chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = summary[key] || 0
                if (count === 0) return null
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '5px 12px', borderRadius: 8 }}>
                    <cfg.Icon size={13} color={cfg.color} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: cfg.color }}>{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Mark all buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => markAll('present')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}>
                <CheckCheck size={14} /> Hammasini keldi
              </button>
              <button onClick={() => markAll('absent')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.8125rem' }}>
                <X size={14} /> Hammasini kelmadi
              </button>
            </div>
          </div>

          {/* Confirmed banner */}
          {confirmed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>Bu dars davomati saqlangan. O'zgartirib qayta saqlashingiz mumkin.</span>
            </motion.div>
          )}

          {/* Student rows */}
          <div style={{ background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 20 }}>
            {students.map((s, i) => {
              const current = attendance[s.id]
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '14px 18px',
                    borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    flexWrap: 'wrap', gap: 14,
                  }}
                >
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '1 1 180px', minWidth: 160 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: `hsl(${(i * 47) % 360}, 50%, 20%)`,
                      border: `1px solid hsl(${(i * 47) % 360}, 50%, 35%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.9375rem', flexShrink: 0, color: 'white',
                    }}>
                      {s.full_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 2 }}>#{i + 1}</div>
                    </div>
                  </div>

                  {/* Status buttons + note */}
                  <div className="att-controls" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '2 1 auto', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="att-status-wrap" style={{ display: 'flex', gap: 5, background: 'rgba(0,0,0,0.18)', padding: 5, borderRadius: 11 }}>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const isActive = current === key
                        return (
                          <button
                            key={key}
                            className="att-status-btn"
                            onClick={() => setStatus(s.id, key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '7px 11px', borderRadius: 8, cursor: 'pointer',
                              background: isActive ? cfg.activeBg : 'transparent',
                              border: `1px solid ${isActive ? cfg.border : 'transparent'}`,
                              color: isActive ? cfg.color : '#64748B',
                              fontWeight: isActive ? 600 : 500,
                              fontSize: '0.8rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <cfg.Icon size={14} />
                            <span>{cfg.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Note input */}
                    {(current === 'absent' || current === 'excused' || current === 'late') && (
                      <motion.input
                        className="att-note-in"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        value={notes[s.id] || ''}
                        onChange={e => setNote(s.id, e.target.value)}
                        placeholder="Izoh..."
                        style={{
                          padding: '8px 12px', borderRadius: 9,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'white', fontSize: '0.8rem', outline: 'none',
                          width: 130, minWidth: 100,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '17px', borderRadius: 14,
              background: confirmed ? 'rgba(52,97,255,0.1)' : '#3461FF',
              border: confirmed ? '1px solid rgba(52,97,255,0.35)' : 'none',
              color: confirmed ? '#60A5FA' : 'white',
              fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: confirmed ? 'none' : '0 8px 24px rgba(52,97,255,0.28)',
              opacity: submitting ? 0.7 : 1,
              letterSpacing: '0.01em',
            }}
          >
            {submitting
              ? <><Loader2 size={18} className="spin" /> Saqlanmoqda...</>
              : <><Send size={17} /> {confirmed ? 'Davomatni yangilash va xabar yuborish' : 'Tasdiqlash va ota-onalarga xabar yuborish'}</>
            }
          </motion.button>
        </>
      )}
    </div>
  )
}

function today() {
  return new Date().toISOString().split('T')[0]
}
