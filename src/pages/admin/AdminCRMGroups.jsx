// src/pages/admin/AdminCRMGroups.jsx
// CRM — Guruhlar boshqaruvi (ro'yxat + yaratish + o'chirish)

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UsersRound, Plus, ChevronRight, Pencil, Trash2,
  Clock, CalendarDays, X, Loader2, Users
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'

const DAYS = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']

const STATUS_COLORS = {
  active:   { bg: 'rgba(16,185,129,0.1)',  color: '#10B981', label: 'Faol' },
  inactive: { bg: 'rgba(239,68,68,0.1)',   color: '#EF4444', label: 'Nofaol' },
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        className="admin-modal-overlay"
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <motion.div
          className="admin-modal-content"
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#1E293B', padding: 'clamp(20px, 5vw, 36px)', width: '100%', maxWidth: 520, border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AdminCRMGroups() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [groups, setGroups]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editTarget, setEditTarget] = useState(null) // null = new, obj = edit

  // Form state
  const [form, setForm] = useState({
    name: '', description: '', schedule_days: [], start_time: '', end_time: ''
  })

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_groups')
      .select(`*, crm_students(count)`)
      .order('created_at', { ascending: false })

    if (error) toast.error('Guruhlarni yuklashda xatolik')
    else setGroups(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditTarget(null)
    setForm({ name: '', description: '', schedule_days: [], start_time: '', end_time: '' })
    setModalOpen(true)
  }

  function openEdit(g) {
    setEditTarget(g)
    setForm({
      name: g.name,
      description: g.description || '',
      schedule_days: g.schedule_days || [],
      start_time: g.start_time || '',
      end_time: g.end_time || '',
    })
    setModalOpen(true)
  }

  function toggleDay(day) {
    setForm(f => ({
      ...f,
      schedule_days: f.schedule_days.includes(day)
        ? f.schedule_days.filter(d => d !== day)
        : [...f.schedule_days, day]
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Guruh nomini kiriting'); return }
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      schedule_days: form.schedule_days,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      created_by: user?.id,
    }

    let error
    if (editTarget) {
      ;({ error } = await supabase.from('crm_groups').update(payload).eq('id', editTarget.id))
    } else {
      ;({ error } = await supabase.from('crm_groups').insert(payload))
    }

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(editTarget ? 'Guruh yangilandi' : 'Yangi guruh yaratildi!')
      setModalOpen(false)
      fetchGroups()
    }
    setSaving(false)
  }

  async function handleDelete(g) {
    if (!confirm(`"${g.name}" guruhini o'chirasizmi? Barcha o'quvchilar ham o'chadi!`)) return
    const { error } = await supabase.from('crm_groups').delete().eq('id', g.id)
    if (error) toast.error(error.message)
    else { toast.success("Guruh o'chirildi"); fetchGroups() }
  }

  async function toggleActive(g) {
    const { error } = await supabase.from('crm_groups').update({ is_active: !g.is_active }).eq('id', g.id)
    if (error) toast.error(error.message)
    else fetchGroups()
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UsersRound size={22} color="#3461FF" />
            </div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>CRM — Guruhlar</h1>
          </div>
          <p style={{ margin: 0, color: '#94A3B8' }}>O'quvchilar guruhlarini boshqaring, davomat yozing.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 16, background: '#3461FF', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(52,97,255,0.3)' }}
        >
          <Plus size={20} /> Yangi Guruh
        </motion.button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: '#1E293B', borderRadius: 24, padding: 28, border: '1px solid rgba(255,255,255,0.05)', height: 200 }}>
              <div className="skeleton-loader" style={{ height: 20, width: '60%', borderRadius: 8, marginBottom: 12, background: '#334155' }} />
              <div className="skeleton-loader" style={{ height: 14, width: '40%', borderRadius: 6, background: '#334155' }} />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 32, border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <UsersRound size={40} color="#64748B" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '1.25rem' }}>Hali guruhlar yo'q</h3>
          <p style={{ color: '#94A3B8', marginBottom: 28, maxWidth: 300, lineHeight: 1.5 }}>Birinchi guruhni yarating va o'quvchilarni qo'shing.</p>
          <button onClick={openCreate}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: '#3461FF', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(52,97,255,0.3)' }}>
            <Plus size={18} /> Guruh yaratish
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {groups.map((g, i) => {
            const sc = g.is_active ? STATUS_COLORS.active : STATUS_COLORS.inactive
            const studentCount = g.crm_students?.[0]?.count ?? 0
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ background: '#1E293B', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', cursor: 'pointer', position: 'relative', display: 'flex', flexDirection: 'column' }}
                onClick={() => navigate(`/admin/crm/groups/${g.id}`)}
              >
                {/* Top accent bar */}
                <div style={{ height: 4, background: g.is_active ? '#3461FF' : '#475569', width: '100%' }} />

                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color, padding: '4px 10px', borderRadius: 8, marginBottom: 10, display: 'inline-block' }}>
                        {sc.label}
                      </span>
                      <h3 style={{ margin: '6px 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{g.name}</h3>
                      {g.description && <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#94A3B8', lineHeight: 1.5 }}>{g.description}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginLeft: 12 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(g)}
                        style={{ padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(g)}
                        style={{ padding: 8, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div style={{ display: 'grid', gap: 12, background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, marginBottom: 20, flex: 1 }}>
                    {g.schedule_days?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CalendarDays size={16} color="#94A3B8" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#CBD5E1', fontWeight: 500 }}>
                          {g.schedule_days.join(', ')}
                        </span>
                      </div>
                    )}
                    {g.start_time && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={16} color="#94A3B8" />
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#CBD5E1', fontWeight: 500 }}>
                          {g.start_time}{g.end_time ? ` — ${g.end_time}` : ''}
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={16} color="#94A3B8" />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: '#CBD5E1', fontWeight: 500 }}>{studentCount} ta o'quvchi</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#3461FF', fontWeight: 600 }}>O'quvchilarni ko'rish</span>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,97,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={16} color="#3461FF" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800 }}>
            {editTarget ? 'Guruhni tahrirlash' : 'Yangi guruh'}
          </h2>
          <button onClick={() => setModalOpen(false)}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', padding: 8, borderRadius: 10, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <Field label="Guruh nomi *">
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Masalan: 1-guruh | Kechki" required style={inputStyle} />
          </Field>

          <Field label="Izoh (ixtiyoriy)">
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Qisqacha tavsif..." style={inputStyle} />
          </Field>

          <Field label="Dars kunlari">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DAYS.map(day => {
                const selected = form.schedule_days.includes(day)
                return (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    style={{ padding: '7px 14px', borderRadius: 10, border: `1px solid ${selected ? '#3461FF' : 'rgba(255,255,255,0.08)'}`, background: selected ? 'rgba(52,97,255,0.15)' : 'transparent', color: selected ? '#60A5FA' : '#94A3B8', fontWeight: selected ? 700 : 500, cursor: 'pointer', fontSize: '0.8125rem', transition: 'all 0.15s' }}>
                    {day}
                  </button>
                )
              })}
            </div>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Boshlanish vaqti">
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Tugash vaqti">
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={inputStyle} />
            </Field>
          </div>

          <button type="submit" disabled={saving}
            style={{ marginTop: 8, width: '100%', padding: '16px', borderRadius: 14, background: '#3461FF', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: saving ? 0.7 : 1, boxShadow: '0 8px 24px rgba(52,97,255,0.3)' }}>
            {saving ? <><Loader2 size={18} className="spin" /> Saqlanmoqda...</> : (editTarget ? 'Saqlash' : 'Guruh yaratish')}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', marginBottom: 8, fontSize: '0.8125rem', fontWeight: 700, color: '#94A3B8' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '14px 18px', borderRadius: 14,
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  color: 'white', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
}
