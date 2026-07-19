// src/pages/admin/AdminAttendance.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarCheck, ChevronDown, CheckCircle2, XCircle, Clock,
  FileText, Send, Loader2, Users, BarChart3, Calendar,
  BookOpen, BookX, MoreVertical, CheckCheck, X as XIcon
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

const ATT = {
  present: { label: 'Keldi',    color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', Icon: CheckCircle2 },
  absent:  { label: 'Kelmadi', color: '#EF4444', bg: 'rgba(239,68,68,0.14)',  border: 'rgba(239,68,68,0.35)',  Icon: XCircle },
  late:    { label: 'Kech',    color: '#F59E0B', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.35)', Icon: Clock },
  excused: { label: 'Sababli', color: '#8B5CF6', bg: 'rgba(139,92,246,0.14)', border: 'rgba(139,92,246,0.35)', Icon: FileText },
}

function useClickOutside(ref, cb) {
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) cb() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [cb])
}

// ─── Mark-All Dropdown ────────────────────────────────────────────
function MarkAllMenu({ onMarkAll, onMarkAllHw }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const items = [
    { label: 'Hammasini keldi',         icon: CheckCircle2, color: '#10B981', action: () => { onMarkAll('present'); setOpen(false) } },
    { label: 'Hammasini kelmadi',       icon: XCircle,      color: '#EF4444', action: () => { onMarkAll('absent');  setOpen(false) } },
    { label: 'Hammasini dars qildi',    icon: BookOpen,     color: '#10B981', action: () => { onMarkAllHw(true);   setOpen(false) } },
    { label: 'Hammasini dars qilmadi',  icon: BookX,        color: '#EF4444', action: () => { onMarkAllHw(false);  setOpen(false) } },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: open ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#94A3B8' }}>
        <MoreVertical size={17} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -6 }} transition={{ duration: 0.15 }}
            style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#1A2436', borderRadius: 14, border: '1px solid rgba(255,255,255,0.09)', zIndex: 300, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)', minWidth: 220 }}>
            {items.map((item, i) => (
              <button key={i} onClick={item.action}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'transparent', border: 'none', color: '#CBD5E1', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <item.icon size={15} color={item.color} />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Student Card ────────────────────────────────────────────────
function StudentCard({ student, index, attStatus, attNote, hwStatus, hwNote, onAtt, onAttNote, onHw, onHwNote }) {
  const cfg = ATT[attStatus]
  const needAttNote = attStatus === 'absent' || attStatus === 'late' || attStatus === 'excused'
  const hwToggled   = hwStatus !== undefined && hwStatus !== null

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Student name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `hsl(${(index * 47) % 360}, 50%, 20%)`, border: `1px solid hsl(${(index * 47) % 360}, 50%, 34%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white', flexShrink: 0 }}>
          {student.full_name[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>{student.full_name}</div>
          <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: 1 }}>#{index + 1}</div>
        </div>
        {/* Current status badge */}
        {cfg && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '4px 10px', borderRadius: 8, flexShrink: 0 }}>
            <cfg.Icon size={12} color={cfg.color} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

      {/* Attendance row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Davomat</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {Object.entries(ATT).map(([key, c]) => {
            const active = attStatus === key
            return (
              <button key={key} onClick={() => onAtt(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.07)'}`, background: active ? c.bg : 'rgba(255,255,255,0.03)', color: active ? c.color : '#64748B', fontWeight: active ? 700 : 500, fontSize: '0.825rem', transition: 'all 0.15s' }}>
                <c.Icon size={13} />
                {c.label}
              </button>
            )
          })}
        </div>
        {/* Attendance note */}
        <AnimatePresence>
          {needAttNote && (
            <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              value={attNote || ''} onChange={e => onAttNote(e.target.value)}
              placeholder="Izoh (ixtiyoriy)..."
              style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.825rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          )}
        </AnimatePresence>
      </div>

      {/* Homework row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vazifa</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <button onClick={() => onHw(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${hwStatus === true ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.07)'}`, background: hwStatus === true ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: hwStatus === true ? '#10B981' : '#64748B', fontWeight: hwStatus === true ? 700 : 500, fontSize: '0.825rem', transition: 'all 0.15s' }}>
            <BookOpen size={13} /> Dars qildi
          </button>
          <button onClick={() => onHw(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${hwStatus === false ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.07)'}`, background: hwStatus === false ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.03)', color: hwStatus === false ? '#EF4444' : '#64748B', fontWeight: hwStatus === false ? 700 : 500, fontSize: '0.825rem', transition: 'all 0.15s' }}>
            <BookX size={13} /> Qilmadi
          </button>
          {hwToggled && (
            <button onClick={() => onHw(null)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px 10px', borderRadius: 9, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)', color: '#64748B', transition: 'all 0.15s', flexShrink: 0 }}>
              <XIcon size={13} />
            </button>
          )}
        </div>
        {/* Homework note */}
        <AnimatePresence>
          {hwToggled && (
            <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              value={hwNote || ''} onChange={e => onHwNote(e.target.value)}
              placeholder="Izoh (ixtiyoriy)..."
              style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '0.825rem', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────
export default function AdminAttendance() {
  const [groups, setGroups]             = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [selectedDate, setSelectedDate] = useState(today())
  const [students, setStudents]         = useState([])
  const [attendance, setAttendance]     = useState({})
  const [attNotes, setAttNotes]         = useState({})
  const [homework, setHomework]         = useState({})
  const [hwNotes, setHwNotes]           = useState({})
  const [loading, setLoading]           = useState(false)
  const [submitting, setSubmitting]     = useState(false)
  const [confirmed, setConfirmed]       = useState(false)
  const [groupOpen, setGroupOpen]       = useState(false)
  const groupRef = useRef(null)
  useClickOutside(groupRef, () => setGroupOpen(false))

  useEffect(() => {
    supabase.from('crm_groups').select('id, name, schedule_days, start_time').eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setGroups(data) })
  }, [])

  useEffect(() => { if (selectedGroup) loadData() }, [selectedGroup, selectedDate])

  async function loadData() {
    setLoading(true); setConfirmed(false)
    const [{ data: studs }, { data: att }, { data: hw }] = await Promise.all([
      supabase.from('crm_students').select('*').eq('group_id', selectedGroup.id).order('full_name'),
      supabase.from('crm_attendance').select('*').eq('group_id', selectedGroup.id).eq('lesson_date', selectedDate),
      supabase.from('crm_homework').select('*').eq('group_id', selectedGroup.id).eq('lesson_date', selectedDate),
    ])
    setStudents(studs || [])
    if (att?.length > 0) {
      const am = {}, nm = {}
      att.forEach(a => { am[a.student_id] = a.status; if (a.note) nm[a.student_id] = a.note })
      setAttendance(am); setAttNotes(nm)
      if (studs && att.length >= studs.length) setConfirmed(true)
    } else {
      const def = {}; (studs||[]).forEach(s => { def[s.id] = 'present' })
      setAttendance(def); setAttNotes({})
    }
    if (hw?.length > 0) {
      const hm = {}, hn = {}
      hw.forEach(h => { hm[h.student_id] = h.done; if (h.note) hn[h.student_id] = h.note })
      setHomework(hm); setHwNotes(hn)
    } else { setHomework({}); setHwNotes({}) }
    setLoading(false)
  }

  function markAll(status)  { const a = {}; students.forEach(s => { a[s.id] = status }); setAttendance(a) }
  function markAllHw(done)  { const h = {}; students.forEach(s => { h[s.id] = done  }); setHomework(h)   }

  async function handleSubmit() {
    if (!selectedGroup) { toast.error('Guruhni tanlang'); return }
    const unmarked = students.filter(s => !attendance[s.id])
    if (unmarked.length > 0) { toast.error(`${unmarked.length} ta o'quvchiga status berilmagan`); return }
    setSubmitting(true)
    try {
      const attRecs = students.map(s => ({ student_id: s.id, group_id: selectedGroup.id, lesson_date: selectedDate, status: attendance[s.id], note: attNotes[s.id] || null, notified_at: null }))
      const { error: e1 } = await supabase.from('crm_attendance').upsert(attRecs, { onConflict: 'student_id,lesson_date' })
      if (e1) throw e1

      const hwStudents = students.filter(s => homework[s.id] !== undefined && homework[s.id] !== null)
      if (hwStudents.length > 0) {
        const hwRecs = hwStudents.map(s => ({ student_id: s.id, group_id: selectedGroup.id, lesson_date: selectedDate, done: homework[s.id], note: hwNotes[s.id] || null }))
        const { error: e2 } = await supabase.from('crm_homework').upsert(hwRecs, { onConflict: 'student_id,lesson_date' })
        if (e2) throw e2
      }

      try {
        await supabase.functions.invoke('notify-parents', { body: { group_id: selectedGroup.id, lesson_date: selectedDate } })
        toast.success('Davomat saqlandi va ota-onalarga xabar yuborildi.')
      } catch { toast.success('Davomat saqlandi.') }
      setConfirmed(true)
    } catch (err) { toast.error(err.message || 'Xatolik yuz berdi') }
    finally { setSubmitting(false) }
  }

  // Summary counts
  const attCounts = Object.values(attendance).reduce((a, s) => { a[s] = (a[s]||0)+1; return a }, {})
  const hwDone    = Object.values(homework).filter(v => v === true).length
  const hwNotDone = Object.values(homework).filter(v => v === false).length

  return (
    <div>
      <style>{`
        .att-date-in::-webkit-calendar-picker-indicator { opacity: 0; width: 0; position: absolute; }
        .att-date-in { -webkit-appearance: none; appearance: none; background: transparent; border: none; color: white; font-size: 0.875rem; font-weight: 600; outline: none; cursor: pointer; font-family: inherit; min-width: 0; width: 100%; }
        @media (max-width: 640px) {
          .att-hdr h1 { font-size: 1.5rem !important; }
          .att-ctrl { flex-direction: column !important; }
        }
      `}</style>

      {/* Header */}
      <div className="att-hdr" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CalendarCheck size={22} color="#3461FF" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>Davomat</h1>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.825rem', marginTop: 2 }}>Guruh va sanani tanlang, statuslarni belgilang</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="att-ctrl" style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {/* Group */}
        <div ref={groupRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button onClick={() => setGroupOpen(o => !o)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, background: '#1E293B', border: `1px solid ${selectedGroup ? 'rgba(52,97,255,0.4)' : 'rgba(255,255,255,0.07)'}`, color: selectedGroup ? 'white' : '#64748B', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Users size={15} color={selectedGroup ? '#3461FF' : '#475569'} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedGroup ? selectedGroup.name : 'Guruhni tanlang'}</span>
            </div>
            <ChevronDown size={14} color="#64748B" style={{ flexShrink: 0, transform: groupOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          <AnimatePresence>
            {groupOpen && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#1A2436', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', zIndex: 200, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                {groups.map(g => (
                  <button key={g.id} onClick={() => { setSelectedGroup(g); setGroupOpen(false) }}
                    style={{ width: '100%', padding: '11px 14px', background: selectedGroup?.id === g.id ? 'rgba(52,97,255,0.12)' : 'transparent', border: 'none', color: selectedGroup?.id === g.id ? '#60A5FA' : '#CBD5E1', textAlign: 'left', cursor: 'pointer', fontWeight: selectedGroup?.id === g.id ? 700 : 500, fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => { if (selectedGroup?.id !== g.id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                    onMouseLeave={e => { if (selectedGroup?.id !== g.id) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ fontWeight: 600 }}>{g.name}</div>
                    {g.schedule_days && <div style={{ fontSize: '0.725rem', color: '#64748B', marginTop: 2 }}>{g.schedule_days.join(', ')}{g.start_time && ` · ${g.start_time}`}</div>}
                  </button>
                ))}
                {groups.length === 0 && <div style={{ padding: 18, textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>Guruhlar yo'q</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#1E293B', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', flexShrink: 0 }}>
          <Calendar size={15} color="#64748B" style={{ flexShrink: 0 }} />
          <input className="att-date-in" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </label>
      </div>

      {/* Empty states */}
      {!selectedGroup ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '64px 20px', background: '#1E293B', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
          <BarChart3 size={36} color="#334155" style={{ marginBottom: 14 }} />
          <p style={{ color: '#475569', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Guruh tanlanmagan</p>
        </motion.div>
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 148, background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }} />)}
        </div>
      ) : students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#1E293B', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
          <Users size={32} color="#334155" style={{ marginBottom: 14 }} />
          <p style={{ color: '#475569', fontWeight: 600, margin: 0, fontSize: '0.9rem' }}>Bu guruhda o'quvchilar yo'q</p>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
            {/* Chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.entries(ATT).map(([key, cfg]) => {
                const count = attCounts[key] || 0
                if (!count) return null
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '4px 10px', borderRadius: 7 }}>
                    <cfg.Icon size={12} color={cfg.color} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cfg.color }}>{count}</span>
                  </div>
                )
              })}
              {(hwDone > 0 || hwNotDone > 0) && <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />}
              {hwDone > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', padding: '4px 10px', borderRadius: 7 }}>
                  <BookOpen size={12} color="#10B981" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981' }}>{hwDone}</span>
                </div>
              )}
              {hwNotDone > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 10px', borderRadius: 7 }}>
                  <BookX size={12} color="#EF4444" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#EF4444' }}>{hwNotDone}</span>
                </div>
              )}
            </div>
            {/* 3-dot menu */}
            <MarkAllMenu onMarkAll={markAll} onMarkAllHw={markAllHw} />
          </div>

          {/* Confirmed banner */}
          {confirmed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 11, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
              <CheckCircle2 size={15} color="#10B981" style={{ flexShrink: 0 }} />
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: '0.825rem' }}>Bu dars davomati saqlangan. O'zgartirib qayta saqlashingiz mumkin.</span>
            </motion.div>
          )}

          {/* Student cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12, marginBottom: 20 }}>
            {students.map((s, i) => (
              <StudentCard key={s.id} student={s} index={i}
                attStatus={attendance[s.id]}   attNote={attNotes[s.id]}
                hwStatus={homework[s.id]}       hwNote={hwNotes[s.id]}
                onAtt={st  => setAttendance(p  => ({ ...p, [s.id]: st  }))}
                onAttNote={n => setAttNotes(p  => ({ ...p, [s.id]: n   }))}
                onHw={done => setHomework(p   => ({ ...p, [s.id]: done }))}
                onHwNote={n => setHwNotes(p   => ({ ...p, [s.id]: n   }))}
              />
            ))}
          </div>

          {/* Submit */}
          <motion.button whileHover={{ scale: 1.004 }} whileTap={{ scale: 0.996 }} onClick={handleSubmit} disabled={submitting}
            style={{ width: '100%', padding: '16px', borderRadius: 13, background: confirmed ? 'rgba(52,97,255,0.1)' : '#3461FF', border: confirmed ? '1px solid rgba(52,97,255,0.35)' : 'none', color: confirmed ? '#60A5FA' : 'white', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: confirmed ? 'none' : '0 6px 20px rgba(52,97,255,0.28)', opacity: submitting ? 0.7 : 1 }}>
            {submitting
              ? <><Loader2 size={17} className="spin" /> Saqlanmoqda...</>
              : <><Send size={16} /> {confirmed ? 'Davomatni yangilash va xabar yuborish' : 'Tasdiqlash va ota-onalarga xabar yuborish'}</>}
          </motion.button>
        </>
      )}
    </div>
  )
}

function today() { return new Date().toISOString().split('T')[0] }
