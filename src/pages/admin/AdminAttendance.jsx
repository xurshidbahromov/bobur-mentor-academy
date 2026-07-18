// src/pages/admin/AdminAttendance.jsx
// CRM — Davomat belgilash: guruh + sana tanlash, har bir o'quvchiga status berish,
// tasdiqlash va ota-onalarga Telegram orqali xabar yuborish.

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, ChevronDown, CheckCircle2, XCircle, Clock,
  FileText, Send, Loader2, AlertCircle, Users, BarChart3, Calendar
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const STATUS_CONFIG = {
  present: { label: 'Keldi',    emoji: '✅', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.4)',  color: '#10B981', icon: CheckCircle2 },
  absent:  { label: 'Kelmadi',  emoji: '❌', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.4)',   color: '#EF4444', icon: XCircle },
  late:    { label: 'Kech keldi',emoji: '⏰', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)',  color: '#F59E0B', icon: Clock },
  excused: { label: 'Sababli',  emoji: '📝', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)',  color: '#8B5CF6', icon: FileText },
}

export default function AdminAttendance() {
  const [groups, setGroups]               = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedDate, setSelectedDate]   = useState(today())
  const [students, setStudents]           = useState([])
  const [attendance, setAttendance]       = useState({}) // { studentId: status }
  const [notes, setNotes]                 = useState({})  // { studentId: note }
  const [loading, setLoading]             = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [confirmed, setConfirmed]         = useState(false) // whether this date already saved
  const [groupOpen, setGroupOpen]         = useState(false)

  // Load groups on mount
  useEffect(() => {
    supabase.from('crm_groups').select('id, name, schedule_days, start_time').eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setGroups(data) })
  }, [])

  // Load students + existing attendance when group or date changes
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
      // If all students have attendance already, mark as confirmed
      if (studs && att.length >= studs.length) setConfirmed(true)
    } else {
      // Default: mark everyone as present
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
    if (!selectedGroup) { toast.error("Guruhni tanlang"); return }
    const unmarked = students.filter(s => !attendance[s.id])
    if (unmarked.length > 0) { toast.error(`${unmarked.length} ta o'quvchiga status berilmagan`); return }

    setSubmitting(true)

    try {
      // Upsert attendance records
      const records = students.map(s => ({
        student_id:  s.id,
        group_id:    selectedGroup.id,
        lesson_date: selectedDate,
        status:      attendance[s.id],
        note:        notes[s.id] || null,
        notified_at: null,
      }))

      const { error } = await supabase
        .from('crm_attendance')
        .upsert(records, { onConflict: 'student_id,lesson_date' })

      if (error) throw error

      // Notify parents via Edge Function (if available)
      try {
        await supabase.functions.invoke('notify-parents', {
          body: { group_id: selectedGroup.id, lesson_date: selectedDate }
        })
        toast.success(`✅ Davomat saqlandi! Ota-onalarga xabar yuborildi.`)
      } catch {
        // Edge function may not be deployed yet — graceful fallback
        toast.success(`✅ Davomat saqlandi!`)
        toast.info(`💡 Bot xabarnomasi sozlanmagan. Bot o'rnatilgach ishlaydi.`)
      }

      setConfirmed(true)
    } catch (err) {
      toast.error(err.message || 'Xatolik yuz berdi')
    } finally {
      setSubmitting(false)
    }
  }

  // Summary counts
  const summary = Object.values(attendance).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <style>{`
        @media (max-width: 640px) {
          .hide-on-mobile { display: none !important; }
          .controls-wrapper { flex-direction: column !important; align-items: stretch !important; justify-content: stretch !important; }
          .status-buttons { width: 100%; display: grid !important; grid-template-columns: 1fr 1fr; }
          .note-input { width: 100% !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={22} color="#3461FF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>Davomat</h1>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem' }}>Guruh va sanani tanlang, statuslarni belgilang.</p>
          </div>
        </div>
      </div>

      {/* Controls: Group picker + Date picker */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        {/* Group Dropdown */}
        <div style={{ position: 'relative', minWidth: 240, flex: 1 }}>
          <button onClick={() => setGroupOpen(o => !o)}
            style={{ width: '100%', padding: '14px 18px', borderRadius: 14, background: '#1E293B', border: `1px solid ${selectedGroup ? 'rgba(52,97,255,0.5)' : 'rgba(255,255,255,0.08)'}`, color: selectedGroup ? 'white' : '#64748B', fontWeight: selectedGroup ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontSize: '0.9375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={16} color={selectedGroup ? '#3461FF' : '#475569'} />
              {selectedGroup ? selectedGroup.name : 'Guruhni tanlang'}
            </div>
            <ChevronDown size={16} style={{ transform: groupOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
          </button>

          <AnimatePresence>
            {groupOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', zIndex: 100, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                {groups.map(g => (
                  <button key={g.id} onClick={() => { setSelectedGroup(g); setGroupOpen(false) }}
                    style={{ width: '100%', padding: '14px 18px', background: selectedGroup?.id === g.id ? 'rgba(52,97,255,0.15)' : 'transparent', border: 'none', color: selectedGroup?.id === g.id ? '#60A5FA' : 'white', textAlign: 'left', cursor: 'pointer', fontWeight: selectedGroup?.id === g.id ? 700 : 500, fontSize: '0.9375rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontWeight: 700 }}>{g.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 2 }}>{g.schedule_days?.join(', ')} {g.start_time && `· ${g.start_time}`}</div>
                  </button>
                ))}
                {groups.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>Hozircha guruhlar yo'q</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1E293B', padding: '12px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', flex: 1, minWidth: 200 }}>
          <Calendar size={16} color="#64748B" />
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.9375rem', outline: 'none', cursor: 'pointer', fontWeight: 600, width: '100%' }} />
        </div>
      </div>

      {/* Main Panel */}
      {!selectedGroup ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 28, border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <BarChart3 size={40} color="#64748B" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '1.25rem' }}>Guruh tanlanmagan</h3>
          <p style={{ color: '#94A3B8' }}>Yuqoridan guruh va sanani tanlang</p>
        </motion.div>
      ) : loading ? (
        <div style={{ background: '#1E293B', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.05)' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.03)' }}>
              <div className="skeleton-loader" style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton-loader" style={{ height: 14, width: '35%', borderRadius: 8, marginBottom: 8, background: '#334155' }} />
                <div className="skeleton-loader" style={{ height: 10, width: '20%', borderRadius: 6, background: '#334155' }} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4].map(j => <div key={j} className="skeleton-loader" style={{ width: 80, height: 36, borderRadius: 10, background: '#334155' }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 28, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Users size={40} color="#64748B" />
          </div>
          <p style={{ color: '#94A3B8', fontSize: '1.1rem', fontWeight: 600 }}>Bu guruhda o'quvchilar yo'q</p>
        </div>
      ) : (
        <>
          {/* Summary + quick actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '6px 14px', borderRadius: 100 }}>
                  <span style={{ fontSize: '0.85rem' }}>{cfg.emoji}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: cfg.color }}>{summary[key] || 0}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => markAll('present')}
                style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', fontWeight: 700, cursor: 'pointer', fontSize: '0.8125rem' }}>
                Hammasini ✅
              </button>
              <button onClick={() => markAll('absent')}
                style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.8125rem' }}>
                Hammasini ❌
              </button>
            </div>
          </div>

          {/* Already confirmed banner */}
          {confirmed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', marginBottom: 20 }}>
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>Bu dars davomati allaqachon saqlangan. O'zgartirishlar kiritib qayta saqlashingiz mumkin.</span>
            </motion.div>
          )}

          {/* Student rows */}
          <div style={{ background: '#1E293B', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 24 }}>
            {students.map((s, i) => {
              const current = attendance[s.id]
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    flexWrap: 'wrap', gap: 16,
                    background: 'rgba(255,255,255,0.01)'
                  }}
                >
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 220, flex: 1 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `hsl(${(i * 47) % 360}, 55%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.125rem', flexShrink: 0, border: `1px solid hsl(${(i * 47) % 360}, 55%, 40%)` }}>
                      {s.full_name[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>#{i + 1}</div>
                    </div>
                  </div>

                  {/* Controls Wrapper */}
                  <div className="controls-wrapper" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 2, justifyContent: 'flex-end' }}>
                    {/* Status buttons */}
                    <div className="status-buttons" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 14 }}>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const isActive = current === key
                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStatus(s.id, key)}
                            style={{
                              padding: '8px 12px', borderRadius: 10, cursor: 'pointer', fontWeight: isActive ? 600 : 500,
                              background: isActive ? cfg.bg : 'transparent',
                              border: `1px solid ${isActive ? cfg.border : 'transparent'}`,
                              color: isActive ? cfg.color : '#94A3B8',
                              fontSize: '0.8125rem', transition: 'all 0.2s ease',
                              display: 'flex', alignItems: 'center', gap: 6,
                              justifyContent: 'center'
                            }}
                          >
                            <cfg.icon size={16} /> <span className="hide-on-mobile">{cfg.label}</span>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Note input (shown when absent/excused) */}
                    {(current === 'absent' || current === 'excused' || current === 'late') && (
                      <motion.input
                        className="note-input"
                        initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 140 }}
                        value={notes[s.id] || ''}
                        onChange={e => setNote(s.id, e.target.value)}
                        placeholder="Izoh yozing..."
                        style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.8125rem', outline: 'none', transition: 'all 0.2s', width: 140 }}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '20px', borderRadius: 18, background: confirmed ? '#0F172A' : '#3461FF',
              border: confirmed ? '2px solid rgba(52,97,255,0.4)' : 'none',
              color: 'white', fontWeight: 800, fontSize: '1.0625rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              boxShadow: confirmed ? 'none' : '0 12px 32px rgba(52,97,255,0.35)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? <><Loader2 size={20} className="spin" /> Saqlanmoqda...</>
              : confirmed
              ? <><Send size={20} /> Davomatni yangilash va xabar yuborish</>
              : <><Send size={20} /> Tasdiqlash va ota-onalarga xabar yuborish</>
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
