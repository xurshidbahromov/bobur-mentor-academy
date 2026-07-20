// src/pages/admin/AdminTopicQuizzes.jsx
// Mavzulashgan testlar boshqaruvi: To'plamlar + Savollar CRUD
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Edit2, Trash2, Search, Clock, Target, Loader2,
  Image as ImageIcon, ChevronLeft, BookOpen, Eye, EyeOff,
  HelpCircle, ArrowRight, CheckCircle2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import MathRenderer from '../../components/ui/MathRenderer'
import MathTextInput from '../../components/ui/MathTextInput'
import { PRESET_ICON_NAMES, TopicIcon } from '../../utils/topicIcons'

const INP = {
  width: '100%', padding: '13px 15px', borderRadius: 12,
  background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)',
  color: 'white', fontSize: '0.9375rem', outline: 'none', boxSizing: 'border-box',
}

// ─── Set Form Modal ───────────────────────────────────────────
function SetModal({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    title:        item?.title        || '',
    description:  item?.description  || '',
    icon_emoji:   item?.icon_emoji   || 'BookOpen',
    is_published: item?.is_published ?? false,
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error("Sarlavha kiriting"); return }
    setSaving(true)
    try {
      if (item) {
        const { error } = await supabase.from('topic_quiz_sets').update(form).eq('id', item.id)
        if (error) throw error
        toast.success("To'plam yangilandi")
      } else {
        const { error } = await supabase.from('topic_quiz_sets').insert([form])
        if (error) throw error
        toast.success("To'plam yaratildi")
      }
      onSave()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div className="admin-modal-content" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: '#1E293B', width: '100%', maxWidth: 500, padding: 'clamp(20px, 5vw, 32px)', border: '1px solid rgba(255,255,255,0.09)' }}>

        {/* Header with live icon preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(52,97,255,0.12)', border: '1px solid rgba(52,97,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TopicIcon name={form.icon_emoji} size={26} color="#60A5FA" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
              {item ? "To'plamni tahrirlash" : "Yangi to'plam"}
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', marginTop: 3 }}>
              {item ? "Mavjud to'plamni tahrirlang" : "Yangi mavzulashgan test to'plami yarating"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Title */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>Sarlavha *</label>
            <input required value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              placeholder="Masalan: Algebra asoslari" style={INP} />
          </div>

          {/* Premium icon grid */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>
              Belgi
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 6 }}>
              {PRESET_ICON_NAMES.map(em => (
                <button key={em} type="button" onClick={() => setForm(f => ({...f, icon_emoji: em}))}
                  style={{
                    aspectRatio: '1', borderRadius: 12,
                    border: `2px solid ${form.icon_emoji === em ? 'rgba(52,97,255,0.6)' : 'rgba(255,255,255,0.05)'}`,
                    background: form.icon_emoji === em ? 'rgba(52,97,255,0.12)' : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                  <TopicIcon name={em} size={20} color={form.icon_emoji === em ? '#60A5FA' : '#94A3B8'} strokeWidth={form.icon_emoji === em ? 2.5 : 2} />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>
              Tavsif <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.72rem' }}>(ixtiyoriy)</span>
            </label>
            <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="Bu to'plam haqida qisqacha..." rows={2}
              style={{ ...INP, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Publish toggle */}
          <button type="button" onClick={() => setForm(f => ({...f, is_published: !f.is_published}))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: `1px solid ${form.is_published ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: form.is_published ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.is_published ? <Eye size={17} color="#10B981" /> : <EyeOff size={17} color="#475569" />}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: form.is_published ? '#10B981' : '#CBD5E1', fontSize: '0.875rem' }}>
                  {form.is_published ? 'Nashr etilgan' : 'Qoralama'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: 1 }}>
                  {form.is_published ? "O'quvchilar ko'ra oladi" : "Faqat admin ko'radi"}
                </div>
              </div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 100, background: form.is_published ? '#10B981' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: form.is_published ? 23 : 3, transition: 'left 0.25s', boxShadow: '0 2px 6px rgba(0,0,0,0.35)' }} />
            </div>
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: 13, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: '#94A3B8', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
              Bekor qilish
            </button>
            <button type="submit" disabled={saving}
              style={{ flex: 2, padding: 13, borderRadius: 12, background: '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(52,97,255,0.25)', opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={16} className="spin" /> : null}
              {item ? 'Saqlash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}


// ─── Question Form Modal ──────────────────────────────────────
function QuestionModal({ setId, item, onClose, onSave }) {
  const [form, setForm] = useState({
    question: item?.question || '',
    option_a: item?.option_a || '', option_b: item?.option_b || '',
    option_c: item?.option_c || '', option_d: item?.option_d || '',
    correct_option: item?.correct_option || 'a',
    explanation: item?.explanation || '',
    time_limit: item?.time_limit ?? 60,
    image_url: item?.image_url || '',
    order_index: item?.order_index ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `topic-questions/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('quizzes').upload(path, file, { cacheControl: '3600', upsert: false })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('quizzes').getPublicUrl(path)
      setForm(f => ({...f, image_url: publicUrl}))
      toast.success("Rasm yuklandi")
    } catch (err) { toast.error(err.message) }
    finally { setUploading(false); if (e.target) e.target.value = '' }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, set_id: setId }
      if (item) {
        const { error } = await supabase.from('topic_quiz_questions').update(payload).eq('id', item.id)
        if (error) throw error
        toast.success("Savol yangilandi")
      } else {
        const { error } = await supabase.from('topic_quiz_questions').insert([payload])
        if (error) throw error
        toast.success("Savol qo'shildi")
      }
      onSave()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div className="admin-modal-content" initial={{ opacity: 0, scale: 0.95, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: '#1E293B', width: '100%', maxWidth: 640, padding: 'clamp(20px, 5vw, 32px)', border: '1px solid rgba(255,255,255,0.09)' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: '1.375rem', fontWeight: 800 }}>
          {item ? "Savolni tahrirlash" : "Yangi savol qo'shish"}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6, display: 'block' }}>Savol matni *</label>
            <MathTextInput required rows={2} placeholder="Savol matni..." value={form.question} onChange={v => setForm(f => ({...f, question: v}))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['a','b','c','d'].map(opt => (
              <div key={opt}>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: 4, display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                  Variant {opt.toUpperCase()} {opt === 'a' || opt === 'b' ? '*' : '(ixtiyoriy)'}
                </label>
                <MathTextInput
                  required={opt === 'a' || opt === 'b'}
                  placeholder={`Variant ${opt.toUpperCase()}`}
                  value={form[`option_${opt}`]}
                  onChange={v => setForm(f => ({...f, [`option_${opt}`]: v}))}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6, display: 'block' }}>To'g'ri javob *</label>
              <select value={form.correct_option} onChange={e => setForm(f => ({...f, correct_option: e.target.value}))}
                style={{ ...INP, WebkitAppearance: 'none' }}>
                {['a','b','c','d'].map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6, display: 'block' }}>Vaqt (sekund)</label>
              <input type="number" value={form.time_limit} onChange={e => setForm(f => ({...f, time_limit: +e.target.value}))}
                style={INP} min={10} max={300} />
            </div>
          </div>
          {/* Image */}
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6, display: 'block' }}>Rasm (ixtiyoriy)</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))}
                placeholder="Rasm URL" style={{ ...INP, flex: 1 }} />
              <label style={{ background: '#334155', color: 'white', padding: '0 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                {uploading ? <Loader2 size={16} className="spin" /> : <ImageIcon size={16} />}
                {uploading ? "..." : "Yuklash"}
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
              </label>
            </div>
            {form.image_url && (
              <div style={{ position: 'relative', width: 'fit-content', marginTop: 8 }}>
                <img src={form.image_url} alt="preview" style={{ height: 90, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
                <button type="button" onClick={() => setForm(f => ({...f, image_url: ''}))}
                  style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: 6, display: 'block' }}>Tushuntirish (ixtiyoriy)</label>
            <textarea value={form.explanation} onChange={e => setForm(f => ({...f, explanation: e.target.value}))}
              placeholder="Nima uchun bu javob to'g'ri?" rows={2} style={{ ...INP, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 13, borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Bekor</button>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: 13, borderRadius: 12, background: '#3461FF', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {saving ? <Loader2 size={16} className="spin" /> : null}
              {item ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminTopicQuizzes() {
  // View: 'sets' | 'questions'
  const [view, setView] = useState('sets')
  const [selectedSet, setSelectedSet] = useState(null)

  const [sets, setSets] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [setModal, setSetModal] = useState(false)
  const [editingSet, setEditingSet] = useState(null)
  const [qModal, setQModal] = useState(false)
  const [editingQ, setEditingQ] = useState(null)

  useEffect(() => { fetchSets() }, [])
  useEffect(() => { if (selectedSet) fetchQuestions(selectedSet.id) }, [selectedSet])

  async function fetchSets() {
    setLoading(true)
    const { data } = await supabase.from('topic_quiz_sets').select('*').order('order_index').order('created_at', { ascending: false })
    setSets(data || [])
    setLoading(false)
  }

  async function fetchQuestions(setId) {
    setLoading(true)
    const { data } = await supabase.from('topic_quiz_questions').select('*').eq('set_id', setId).order('order_index').order('created_at')
    setQuestions(data || [])
    setLoading(false)
  }

  async function deleteSet(id) {
    if (!confirm("Bu to'plamni va barcha savollarini o'chirasizmi?")) return
    const { error } = await supabase.from('topic_quiz_sets').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("To'plam o'chirildi"); fetchSets() }
  }

  async function deleteQ(id) {
    if (!confirm("Bu savolni o'chirasizmi?")) return
    const { error } = await supabase.from('topic_quiz_questions').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success("Savol o'chirildi"); fetchQuestions(selectedSet.id) }
  }

  async function togglePublish(set) {
    const { error } = await supabase.from('topic_quiz_sets').update({ is_published: !set.is_published }).eq('id', set.id)
    if (error) toast.error(error.message)
    else { toast.success(set.is_published ? "Qoralamaga o'tkazildi" : "Nashr etildi"); fetchSets() }
  }

  // ── Sets view ──────────────────────────────────────────────
  if (view === 'sets') {
    const filtered = sets.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    return (
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Mavzulashgan Testlar</h1>
            <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '0.825rem' }}>Mustaqil test to'plamlari yarating — darssiz ham</p>
          </div>
          <button onClick={() => { setEditingSet(null); setSetModal(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3461FF', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            <Plus size={18} /> Yangi to'plam
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="To'plamlar bo'yicha qidirish..."
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)', color: 'white', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }} />
        </div>

        {/* Sets list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 80, background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.07)', color: '#475569', minHeight: 240 }}>
            <BookOpen size={40} color="#334155" style={{ marginBottom: 14, opacity: 0.6 }} />
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>To'plamlar yo'q — birinchi to'plamni yarating!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(set => (
              <motion.div key={set.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: '#1E293B', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {/* Icon */}
                <div style={{ width: 46, height: 46, borderRadius: 13, background: 'rgba(52,97,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TopicIcon name={set.icon_emoji} size={22} color="#60A5FA" />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>{set.title}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: set.is_published ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.1)', color: set.is_published ? '#10B981' : '#F59E0B', border: `1px solid ${set.is_published ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
                      {set.is_published ? 'Nashr' : 'Qoralama'}
                    </span>
                  </div>
                  {set.description && <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{set.description}</p>}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap' }}>
                  <button onClick={() => { setSelectedSet(set); setView('questions') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 9, background: 'rgba(52,97,255,0.1)', border: '1px solid rgba(52,97,255,0.2)', color: '#60A5FA', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}>
                    <HelpCircle size={14} /> Savollar
                    <ArrowRight size={13} />
                  </button>
                  <button onClick={() => togglePublish(set)} title={set.is_published ? "Qoralamaga o'tkazish" : "Nashr etish"}
                    style={{ padding: '8px 10px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: set.is_published ? '#10B981' : '#64748B', cursor: 'pointer' }}>
                    {set.is_published ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => { setEditingSet(set); setSetModal(true) }}
                    style={{ padding: '8px 10px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#60A5FA', cursor: 'pointer' }}>
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => deleteSet(set.id)}
                    style={{ padding: '8px 10px', borderRadius: 9, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modals */}
        <AnimatePresence>
          {setModal && <SetModal item={editingSet} onClose={() => setSetModal(false)} onSave={() => { setSetModal(false); fetchSets() }} />}
        </AnimatePresence>
      </div>
    )
  }

  // ── Questions view ─────────────────────────────────────────
  const filteredQ = questions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()))
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { setView('sets'); setSearch(''); setSelectedSet(null) }}
            style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(52,97,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TopicIcon name={selectedSet.icon_emoji} size={22} color="#60A5FA" />
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{selectedSet.title}</h1>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: selectedSet.is_published ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.1)', color: selectedSet.is_published ? '#10B981' : '#F59E0B' }}>
                {selectedSet.is_published ? 'Nashr' : 'Qoralama'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', color: '#64748B', fontSize: '0.8rem' }}>{questions.length} ta savol</p>
          </div>
        </div>
        <button onClick={() => { setEditingQ(null); setQModal(true) }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#3461FF', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          <Plus size={18} /> Savol qo'shish
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Savollar bo'yicha qidirish..."
          style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, background: '#1E293B', border: '1px solid rgba(255,255,255,0.06)', color: 'white', outline: 'none', fontSize: '0.875rem', boxSizing: 'border-box' }} />
      </div>

      {/* Questions */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 72, background: '#1E293B', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)' }} />)}
        </div>
      ) : filteredQ.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px', background: '#1E293B', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.07)', color: '#475569', minHeight: 240 }}>
          <HelpCircle size={40} color="#334155" style={{ marginBottom: 14, opacity: 0.6 }} />
          <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Savollar yo'q — birinchi savolni qo'shing!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {filteredQ.map((q, i) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              style={{ background: '#1E293B', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: '14px 17px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(52,97,255,0.1)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', color: '#F1F5F9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <MathRenderer math={q.question} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: '0.775rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={11} /> {q.correct_option.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.775rem', color: '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {q.time_limit}s
                  </span>
                  {q.image_url && <span style={{ fontSize: '0.775rem', color: '#8B5CF6', fontWeight: 600 }}>🖼 Rasmli</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
                <button onClick={() => { setEditingQ(q); setQModal(true) }}
                  style={{ padding: '7px 9px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#60A5FA', cursor: 'pointer' }}>
                  <Edit2 size={14} />
                </button>
                <button onClick={() => deleteQ(q.id)}
                  style={{ padding: '7px 9px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#EF4444', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {qModal && (
          <QuestionModal setId={selectedSet.id} item={editingQ}
            onClose={() => setQModal(false)}
            onSave={() => { setQModal(false); fetchQuestions(selectedSet.id) }} />
        )}
      </AnimatePresence>
    </div>
  )
}
