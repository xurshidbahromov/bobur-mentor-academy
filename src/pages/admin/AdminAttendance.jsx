// src/pages/admin/AdminAttendance.jsx
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
  present: { label: 'Keldi',     color: '#10B981', activeBg: 'rgba(16,185,129,0.16)',  border: 'rgba(16,185,129,0.35)',  Icon: CheckCircle2 },
  absent:  { label: 'Kelmadi',  color: '#EF4444', activeBg: 'rgba(239,68,68,0.14)',    border: 'rgba(239,68,68,0.35)',   Icon: XCircle },
  late:    { label: 'Kech',     color: '#F59E0B', activeBg: 'rgba(245,158,11,0.14)',   border: 'rgba(245,158,11,0.35)',  Icon: Clock },
  excused: { label: 'Sababli',  color: '#8B5CF6', activeBg: 'rgba(139,92,246,0.14)',  border: 'rgba(139,92,246,0.35)', Icon: FileText },
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
    setLoading(true); setConfirmed(false)
    const [{ data: studs }, { data: att }] = await Promise.all([
      supabase.from('crm_students').select('*').eq('group_id', selectedGroup.id).order('full_name'),
      supabase.from('crm_attendance').select('*').eq('group_id', selectedGroup.id).eq('lesson_date', selectedDate),
    ])
    setStudents(studs || [])
    if (att && att.length > 0) {
      const attMap = {}, noteMap = {}
      att.forEach(a => { attMap[a.student_id] = a.status; if (a.note) noteMap[a.student_id] = a.note })
      setAttendance(attMap); setNotes(noteMap)
      if (studs && att.length >= studs.length) setConfirmed(true)
    } else {
      const defaults = {}
      ;(studs || []).forEach(s => { defaults[s.id] = 'present' })
      setAttendance(defaults); setNotes({})
    }
    setLoading(false)
  }

  function setStatus(id, status) { setAttendance(p => ({ ...p, [id]: status })) }
  function setNote(id, note)     { setNotes(p => ({ ...p, [id]: note })) }
  function markAll(status)       { const a = {}; students.forEach(s => { a[s.id] = status }); setAttendance(a) }

  async function handleSubmit() {
    if (!selectedGroup) { toast.error('Guruhni tanlang'); return }
    const unmarked = students.filter(s => !attendance[s.id])
    if (unmarked.length > 0) { toast.error(`${unmarked.length} ta o'quvchiga status berilmagan`); return }
    setSubmitting(true)
    try {
      const records = students.map(s => ({
        student_id: s.id, group_id: selectedGroup.id,
        lesson_date: selectedDate, status: attendance[s.id],
        note: notes[s.id] || null, notified_at: null,
      }))
      const { error } = await supabase.from('crm_attendance').upsert(records, { onConflict: 'student_id,lesson_date' })
      if (error) throw error
      try {
        await supabase.functions.invoke('notify-parents', { body: { group_id: selectedGroup.id, lesson_date: selectedDate } })
        toast.success('Davomat saqlandi va ota-onalarga xabar yuborildi.')
      } catch { toast.success('Davomat saqlandi.') }
      setConfirmed(true)
    } catch (err) { toast.error(err.message || 'Xatolik yuz berdi') }
    finally { setSubmitting(false) }
  }

  const summary = Object.values(attendance).reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc }, {})

  return (
    <div>
      <style>{`
        /* Date input: hide native icon, style consistently */
        .att-date-input::-webkit-calendar-picker-indicator {
          opacity: 0; width: 0; position: absolute;
        }
        .att-date-input {
          -webkit-appearance: none; appearance: none;
          background: transparent; border: none;
          color: white; font-size: 0.875rem;
          font-weight: 600; outline: none; cursor: pointer;
          font-family: inherit; min-width: 0; width: 100%;
        }
        .att-status-btn { transition: background 0.15s, border-color 0.15s, color 0.15s; white-space: nowrap; }
        .att-status-btn:hover { filter: brightness(1.1); }
        .att-group-item:hover { background: rgba(255,255,255,0.04) !important; }
        .att-note-in { transition: opacity 0.2s; }
        .att-note-in::placeholder { color: #475569; }

        /* Mobile responsive overrides */
        @media (max-width: 600px) {
          .att-header-title { font-size: 1.5rem !important; }
          .att-controls-row { flex-direction: column !important; }
          .att-bar { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .att-student-row { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .att-status-wrap { width: 100% !important; }
          .att-status-btn { padding: 7px 9px !important; font-size: 0.75rem !important; }
          .att-note-in { width: 100% !important; box-sizing: border-box !important; }
          .att-submit-btn { font-size: 0.875rem !important; padding: 15px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarCheck size={22} color="#3461FF" />
          </div>
          <div>
            <h1 className="att-header-title" style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>Davomat</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.825rem', marginTop: 2 }}>Guruh va sanani tanlang, statuslarni belgilang</p>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="att-controls-row" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>

        {/* Group Dropdown */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            onClick={() => setGroupOpen(o => !o)}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              background: '#1E293B',
              border: `1px solid ${selectedGroup ? 'rgba(52,97,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
              color: selectedGroup ? 'white' : '#64748B',
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8, fontSize: '0.875rem', textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Users size={15} color={selectedGroup ? '#3461FF' : '#475569'} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedGroup ? selectedGroup.name : 'Guruhni tanlang'}
              </span>
            </div>
            <ChevronDown size={14} color="#64748B" style={{ flexShrink: 0, transform: groupOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          <AnimatePresence>
            {groupOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1A2436', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', zIndex: 200, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
              >
                {groups.map(g => (
                  <button key={g.id} className="att-group-item" onClick={() => { setSelectedGroup(g); setGroupOpen(false) }}
                    style={{
                      width: '100%', padding: '11px 14px',
                      background: selectedGroup?.id === g.id ? 'rgba(52,97,255,0.12)' : 'transparent',
                      border: 'none', color: selectedGroup?.id === g.id ? '#60A5FA' : '#CBD5E1',
                      textAlign: 'left', cursor: 'pointer', fontWeight: selectedGroup?.id === g.id ? 700 : 500,
                      fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{g.name}</div>
                    {g.schedule_days && <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: 2 }}>{g.schedule_days.join(', ')}{g.start_time && ` · ${g.start_time}`}</div>}
                  </button>
                ))}
                {groups.length === 0 && <div style={{ padding: 18, textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>Guruhlar yo'q</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Picker — custom styled, no browser icon shown */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 9,
          background: '#1E293B', padding: '12px 14px',
          borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)',
          cursor: 'pointer', flexShrink: 0, position: 'relative', overflow: 'hidden',
        }}>
          <Calendar size={15} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            className="att-date-input"
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          />
        </label>
      </div>

      {/* Empty states */}
      {!selectedGroup ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
          <BarChart3 size={36} color="#334155" style={{ marginBottom: 14 }} />
          <p style={{ color: '#475569', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Guruh tanlanmagan</p>
        </motion.div>
      ) : loading ? (
        <div style={{ background: '#1E293B', borderRadius: 20, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#0F172A', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 11, width: '32%', borderRadius: 6, background: '#0F172A', marginBottom: 7 }} />
                <div style={{ height: 9, width: '18%', borderRadius: 5, background: '#0F172A' }} />
              </div>
              <div style={{ display: 'flex', gap: 5 }}>
                {[1,2,3,4].map(j => <div key={j} style={{ width: 64, height: 32, borderRadius: 7, background: '#0F172A' }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
          <Users size={32} color="#334155" style={{ marginBottom: 14 }} />
          <p style={{ color: '#475569', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Bu guruhda o'quvchilar yo'q</p>
        </div>
      ) : (
        <>
          {/* Summary + mark all bar */}
          <div className="att-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = summary[key] || 0
                if (count === 0) return null
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.activeBg, border: `1px solid ${cfg.border}`, padding: '4px 11px', borderRadius: 7 }}>
                    <cfg.Icon size={12} color={cfg.color} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>{count}</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 7 }}>
              <button onClick={() => markAll('present')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <CheckCheck size={13} /> Hammasini keldi
              </button>
              <button onClick={() => markAll('absent')}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <X size={13} /> Kelmadi
              </button>
            </div>
          </div>

          {/* Confirmed banner */}
          {confirmed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 14 }}>
              <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0 }} />
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.825rem' }}>Bu dars davomati saqlangan. O'zgartirib qayta saqlashingiz mumkin.</span>
            </motion.div>
          )}

          {/* Student rows */}
          <div style={{ background: '#1E293B', borderRadius: 18, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 18 }}>
            {students.map((s, i) => {
              const current = attendance[s.id]
              return (
                <motion.div
                  key={s.id}
                  className="att-student-row"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '13px 16px', gap: 12,
                    borderBottom: i < students.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}
                >
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto', minWidth: 140 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: `hsl(${(i * 47) % 360}, 50%, 20%)`,
                      border: `1px solid hsl(${(i * 47) % 360}, 50%, 34%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.875rem', flexShrink: 0, color: 'white',
                    }}>
                      {s.full_name[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'white', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.69rem', color: '#475569', marginTop: 1 }}>#{i + 1}</div>
                    </div>
                  </div>

                  {/* Status + note */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <div className="att-status-wrap" style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.2)', padding: 4, borderRadius: 10, flexShrink: 0 }}>
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const isActive = current === key
                        return (
                          <button key={key} className="att-status-btn" onClick={() => setStatus(s.id, key)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 4,
                              padding: '7px 10px', borderRadius: 7, cursor: 'pointer',
                              background: isActive ? cfg.activeBg : 'transparent',
                              border: `1px solid ${isActive ? cfg.border : 'transparent'}`,
                              color: isActive ? cfg.color : '#64748B',
                              fontWeight: isActive ? 600 : 500, fontSize: '0.8rem',
                            }}>
                            <cfg.Icon size={13} />
                            <span>{cfg.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {(current === 'absent' || current === 'excused' || current === 'late') && (
                      <motion.input
                        className="att-note-in"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        value={notes[s.id] || ''}
                        onChange={e => setNote(s.id, e.target.value)}
                        placeholder="Izoh..."
                        style={{
                          padding: '7px 11px', borderRadius: 8,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: 'white', fontSize: '0.8rem', outline: 'none',
                          width: 120, minWidth: 80, flexShrink: 1,
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Submit */}
          <motion.button
            className="att-submit-btn"
            whileHover={{ scale: 1.004 }}
            whileTap={{ scale: 0.996 }}
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '16px', borderRadius: 13,
              background: confirmed ? 'rgba(52,97,255,0.1)' : '#3461FF',
              border: confirmed ? '1px solid rgba(52,97,255,0.35)' : 'none',
              color: confirmed ? '#60A5FA' : 'white',
              fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              boxShadow: confirmed ? 'none' : '0 6px 20px rgba(52,97,255,0.28)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting
              ? <><Loader2 size={17} className="spin" /> Saqlanmoqda...</>
              : <><Send size={16} /> {confirmed ? 'Davomatni yangilash va xabar yuborish' : 'Tasdiqlash va ota-onalarga xabar yuborish'}</>
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
