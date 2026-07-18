// src/pages/admin/AdminCRMStudents.jsx
// CRM — Guruh ichidagi o'quvchilar + ota-ona statusi

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, UserPlus, Users, Phone, Trash2,
  CheckCircle2, Clock, X, Loader2, Pencil,
  MessageCircle, GraduationCap, AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { Send } from 'lucide-react'

function formatUzbekPhone(value) {
  if (!value) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('998')) digits = digits.slice(3)
  
  if (!digits && value.length < 5) return ''

  let res = '+998 '
  if (digits.length > 0) res += '(' + digits.substring(0, 2)
  if (digits.length >= 3) res += ') ' + digits.substring(2, 5)
  if (digits.length >= 6) res += '-' + digits.substring(5, 7)
  if (digits.length >= 8) res += '-' + digits.substring(7, 9)
  
  return res
}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#1E293B', borderRadius: 28, padding: 36, width: '100%', maxWidth: 480, border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AdminCRMStudents() {
  const { groupId } = useParams()
  const navigate = useNavigate()

  const [group, setGroup]           = useState(null)
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [modalOpen, setModalOpen]   = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const [form, setForm] = useState({ full_name: '', phone: '', parent_phone: '', notes: '' })

  useEffect(() => {
    fetchGroup()
    fetchStudents()
  }, [groupId])

  async function fetchGroup() {
    const { data } = await supabase.from('crm_groups').select('*').eq('id', groupId).single()
    setGroup(data)
  }

  async function fetchStudents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_students')
      .select(`*, crm_parents(phone, telegram_chat_id, is_verified)`)
      .eq('group_id', groupId)
      .order('full_name')

    if (error) toast.error("O'quvchilarni yuklashda xatolik")
    else setStudents(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditTarget(null)
    setForm({ full_name: '', phone: '', parent_phone: '', notes: '' })
    setModalOpen(true)
  }

  function openEdit(s) {
    setEditTarget(s)
    setForm({
      full_name: s.full_name,
      phone: formatUzbekPhone(s.phone || ''),
      parent_phone: formatUzbekPhone(s.crm_parents?.phone || ''),
      notes: s.notes || '',
    })
    setModalOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error("Ism kiritilishi shart"); return }
    setSaving(true)

    let cleanPhone = form.phone.replace(/\D/g, '')
    if (cleanPhone === '998') cleanPhone = ''
    else if (cleanPhone) cleanPhone = '+' + cleanPhone

    let cleanParentPhone = form.parent_phone.replace(/\D/g, '')
    if (cleanParentPhone === '998') cleanParentPhone = ''
    else if (cleanParentPhone) cleanParentPhone = '+' + cleanParentPhone

    try {
      if (editTarget) {
        // Update student
        const { error } = await supabase.from('crm_students')
          .update({ full_name: form.full_name.trim(), phone: cleanPhone || null, notes: form.notes || null })
          .eq('id', editTarget.id)
        if (error) throw error

        // Update or insert parent
        if (cleanParentPhone) {
          const existing = editTarget.crm_parents
          if (existing) {
            // if phone changed, maybe reset verification? For now just update phone.
            await supabase.from('crm_parents').update({ phone: cleanParentPhone }).eq('student_id', editTarget.id)
          } else {
            // Auto-link if phone already verified for another child
            const { data: existingChat } = await supabase.from('crm_parents')
              .select('telegram_chat_id')
              .eq('phone', cleanParentPhone)
              .not('telegram_chat_id', 'is', null)
              .limit(1)
              .maybeSingle()

            await supabase.from('crm_parents').insert({ 
              student_id: editTarget.id, 
              phone: cleanParentPhone,
              telegram_chat_id: existingChat?.telegram_chat_id || null,
              is_verified: !!existingChat?.telegram_chat_id
            })
          }
        }
        toast.success("O'quvchi yangilandi")
      } else {
        // Insert student
        const { data: student, error } = await supabase
          .from('crm_students')
          .insert({ group_id: groupId, full_name: form.full_name.trim(), phone: cleanPhone || null, notes: form.notes || null })
          .select()
          .single()
        if (error) throw error

        // Insert parent if phone given
        if (cleanParentPhone && student) {
          // Auto-link if phone already verified for another child
          const { data: existingChat } = await supabase.from('crm_parents')
            .select('telegram_chat_id')
            .eq('phone', cleanParentPhone)
            .not('telegram_chat_id', 'is', null)
            .limit(1)
            .maybeSingle()

          await supabase.from('crm_parents').insert({ 
            student_id: student.id, 
            phone: cleanParentPhone,
            telegram_chat_id: existingChat?.telegram_chat_id || null,
            is_verified: !!existingChat?.telegram_chat_id
          })
        }
        toast.success("O'quvchi qo'shildi! 🎉")
      }

      setModalOpen(false)
      fetchStudents()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(s) {
    if (!confirm(`"${s.full_name}" o'quvchisini o'chirasizmi?`)) return
    const { error } = await supabase.from('crm_students').delete().eq('id', s.id)
    if (error) toast.error(error.message)
    else { toast.success("O'quvchi o'chirildi"); fetchStudents() }
  }

  const verifiedCount = students.filter(s => s.crm_parents?.is_verified).length

  return (
    <div>
      {/* Back + Header */}
      <div style={{ marginBottom: 36 }}>
        <button onClick={() => navigate('/admin/crm/groups')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 600, marginBottom: 24, fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Guruhlarga qaytish
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(52,97,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GraduationCap size={22} color="#3461FF" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>
                  {group?.name || 'Guruh'}
                </h1>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.875rem' }}>
                  {group?.schedule_days?.join(', ')} {group?.start_time && `· ${group.start_time}`}
                </p>
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px', borderRadius: 14, background: '#3461FF', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(52,97,255,0.3)' }}>
            <UserPlus size={18} /> O'quvchi qo'shish
          </motion.button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
          <StatChip icon={<Users size={18} />} label="Jami o'quvchilar" value={students.length} color="#3461FF" />
          <StatChip icon={<CheckCircle2 size={18} />} label="Bot ulangan" value={verifiedCount} color="#10B981" />
          <StatChip icon={<Clock size={18} />} label="Kutilmoqda" value={students.length - verifiedCount} color="#F59E0B" />
        </div>
      </div>

      {/* Students list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ background: '#1E293B', borderRadius: 18, padding: 20, height: 80, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="skeleton-loader" style={{ height: 16, width: '40%', borderRadius: 8, marginBottom: 10, background: '#334155' }} />
              <div className="skeleton-loader" style={{ height: 12, width: '25%', borderRadius: 6, background: '#334155' }} />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 28, border: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Users size={40} color="#64748B" />
          </div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '1.25rem' }}>Guruhda o'quvchilar yo'q</h3>
          <p style={{ color: '#94A3B8', marginBottom: 24 }}>Birinchi o'quvchini qo'shing.</p>
          <button onClick={openCreate}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: '#3461FF', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(52,97,255,0.3)' }}>
            <UserPlus size={18} /> O'quvchi qo'shish
          </button>
        </motion.div>
      ) : (
        <div style={{ background: '#1E293B', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '18px 24px', fontWeight: 600 }}>O'quvchi</th>
                  <th style={{ padding: '18px 24px', fontWeight: 600 }}>O'quvchi raqami</th>
                  <th style={{ padding: '18px 24px', fontWeight: 600 }}>Ota-ona raqami</th>
                  <th style={{ padding: '18px 24px', fontWeight: 600 }}>Bot holati</th>
                  <th style={{ padding: '18px 24px', fontWeight: 600, textAlign: 'right' }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const parent = s.crm_parents
                  const isVerified = parent?.is_verified
                  const hasParent = !!parent
                  return (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: `hsl(${(i * 47) % 360}, 60%, 25%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0, border: `2px solid hsl(${(i * 47) % 360}, 60%, 45%)` }}>
                            {s.full_name[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>{s.full_name}</div>
                            {s.notes && <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 2 }}>{s.notes}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {s.phone
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: '0.875rem' }}><Phone size={14} />{formatUzbekPhone(s.phone)}</div>
                          : <span style={{ color: '#334155', fontSize: '0.875rem' }}>—</span>}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {hasParent
                          ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: '0.875rem' }}><Phone size={14} />{formatUzbekPhone(parent.phone)}</div>
                          : <span style={{ color: '#334155', fontSize: '0.875rem' }}>Kiritilmagan</span>}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {isVerified ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '6px 14px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700 }}>
                            <CheckCircle2 size={14} /> Bot ulangan
                          </span>
                        ) : hasParent ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '6px 14px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700 }}>
                              <Clock size={14} /> Kutilmoqda
                            </span>
                            <button 
                              onClick={() => {
                                const cleanPhone = parent.phone.replace(/[^0-9]/g, '')
                                const text = encodeURIComponent(`Assalomu alaykum! Bobur Mentor Academy markazidan yozyapmiz. Farzandingiz davomatini kuzatib borish uchun ushbu botga kiring va raqamingizni tasdiqlang: @BoburMentorBot`)
                                window.open(`https://t.me/+${cleanPhone}?text=${text}`, '_blank')
                              }}
                              title="Telegram orqali bot linkini yuborish"
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: 'rgba(52,97,255,0.1)', border: 'none', color: '#3461FF', cursor: 'pointer', transition: 'all 0.2s' }}>
                              <Send size={14} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', color: '#475569', padding: '6px 14px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>
                            <AlertCircle size={14} /> Raqam yo'q
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button onClick={() => openEdit(s)}
                            style={{ padding: '10px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94A3B8', cursor: 'pointer', transition: 'background 0.2s' }}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(s)}
                            style={{ padding: '10px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: 'none', color: '#EF4444', cursor: 'pointer', transition: 'background 0.2s' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
            {editTarget ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}
          </h2>
          <button onClick={() => setModalOpen(false)}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94A3B8', padding: 8, borderRadius: 10, cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <Field label="Ism Familiya *">
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Abdulloh Karimov" required style={inputStyle} />
          </Field>

          <Field label="O'quvchi telefon raqami">
            <input value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: formatUzbekPhone(e.target.value) }))}
              onFocus={() => { if (!form.phone) setForm(f => ({ ...f, phone: '+998 ' })) }}
              placeholder="+998 (90) 000-00-00" type="tel" style={inputStyle} />
          </Field>

          <Field label="Ota-ona telefon raqami">
            <input value={form.parent_phone} 
              onChange={e => setForm(f => ({ ...f, parent_phone: formatUzbekPhone(e.target.value) }))}
              onFocus={() => { if (!form.parent_phone) setForm(f => ({ ...f, parent_phone: '+998 ' })) }}
              placeholder="+998 (90) 000-00-00" type="tel" style={inputStyle} />
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#475569' }}>
              Ota-ona shu raqam bilan Telegram botda ro'yxatdan o'tadi
            </p>
          </Field>

          <Field label="Izoh (ixtiyoriy)">
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Qo'shimcha ma'lumot..." style={inputStyle} />
          </Field>

          <button type="submit" disabled={saving}
            style={{ marginTop: 8, width: '100%', padding: '16px', borderRadius: 14, background: '#3461FF', color: 'white', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: saving ? 0.7 : 1, boxShadow: '0 8px 24px rgba(52,97,255,0.3)' }}>
            {saving ? <><Loader2 size={18} className="spin" /> Saqlanmoqda...</> : (editTarget ? 'Saqlash' : "O'quvchi qo'shish")}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function StatChip({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#1E293B', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${color === '#10B981' ? '16,185,129' : color === '#F59E0B' ? '245,158,11' : '52,97,255'},0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>{value}</div>
      </div>
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
