import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Send, History, CheckCircle2, AlertCircle, Info, Search, Trash2, ShieldCheck, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState('send') // 'send' or 'history'
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [targetType, setTargetType] = useState('all') 
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async () => {
    setLoadingHistory(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setHistory(data)
    setLoadingHistory(false)
  }

  useEffect(() => {
    if (activeTab === 'history') fetchHistory()
  }, [activeTab])

  const handleBroadcast = async (e) => {
    e.preventDefault()
    if (!title || !message) {
      toast.error('Sarlavha va xabar to\'ldirilishi shart')
      return
    }

    setSending(true)
    try {
      let query = supabase.from('profiles').select('id')

      const { data: users, error: userError } = await query
      if (userError) throw userError

      if (!users?.length) {
        toast.error('Belgilangan guruhda foydalanuvchilar topilmadi')
        return
      }

      // 2. Bulk insert notifications
      const notifs = users.map(u => ({
        user_id: u.id,
        title,
        message,
        is_read: false
      }))

      const { error: insertError } = await supabase.from('notifications').insert(notifs)
      if (insertError) throw insertError

      toast.success(`${users.length} ta foydalanuvchiga xabar yuborildi!`)
      setTitle('')
      setMessage('')
      
      // Optionally switch to history
      // setActiveTab('history')
    } catch (err) {
      console.error(err)
      toast.error('Xabar yuborishda xatolik yuz berdi')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ color: 'white' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800 }}>Xabarnomalar Markazi</h1>
        <p style={{ margin: 0, color: '#94A3B8' }}>Foydalanuvchilarga ommaviy xabarlar yuboring va xabarlar tarixini kuzating.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, padding: 6, background: '#1E293B', borderRadius: 16, width: 'fit-content' }}>
        <button
          onClick={() => setActiveTab('send')}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: activeTab === 'send' ? '#3461FF' : 'transparent',
            color: activeTab === 'send' ? 'white' : '#94A3B8',
            fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <Send size={18} /> Xabar Yuborish
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: activeTab === 'history' ? '#3461FF' : 'transparent',
            color: activeTab === 'history' ? 'white' : '#94A3B8',
            fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 8
          }}
        >
          <History size={18} /> Tarix
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'send' ? (
          <motion.div
            key="send"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ 
                background: '#1E293B', 
                padding: 40, 
                borderRadius: 32, 
                border: '1px solid rgba(255,255,255,0.05)',
                maxWidth: 700
            }}
          >
            <form onSubmit={handleBroadcast}>
              <div style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 16, background: 'rgba(52,97,255,0.05)', border: '1px solid rgba(52,97,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Users size={20} color="#3461FF" />
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'white' }}>Barcha foydalanuvchilar</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748B' }}>Xabar platformadagi barcha faol o'quvchilarga yuboriladi</p>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 10, fontSize: '0.875rem', fontWeight: 700, color: '#94A3B8' }}>Xabar Sarlavhasi</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Masalan: Yangi kurs qo'shildi!"
                  style={{
                    width: '100%', padding: '16px 20px', borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', fontSize: '1rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', marginBottom: 10, fontSize: '0.875rem', fontWeight: 700, color: '#94A3B8' }}>Xabar Matni</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                  placeholder="Xabarning to'liq matnini kiriting..."
                  style={{
                    width: '100%', padding: '16px 20px', borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white', fontSize: '1rem', outline: 'none', resize: 'none'
                  }}
                />
              </div>

              <button
                disabled={sending}
                style={{
                  width: '100%', padding: '18px', borderRadius: 16,
                  background: '#3461FF', color: 'white', border: 'none',
                  fontSize: '1rem', fontWeight: 800, cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(52,97,255,0.3)',
                  opacity: sending ? 0.7 : 1, transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12
                }}
              >
                {sending ? 'Yuborilmoqda...' : <><Bell size={20} /> Ommaviy Xabar Yuborish</>}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {loadingHistory ? (
                <div style={{ padding: 100, textAlign: 'center' }}>Yuklanmoqda...</div>
            ) : history.length === 0 ? (
                <div style={{ padding: 100, textAlign: 'center', background: '#1E293B', borderRadius: 32, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: '#94A3B8' }}>Hozircha xabarlar yuborilmagan.</p>
                </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {history.map(n => (
                  <div 
                    key={n.id}
                    style={{
                       background: '#1E293B',
                       padding: '20px 24px',
                       borderRadius: 24,
                       border: '1px solid rgba(255,255,255,0.05)',
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center'
                    }}
                  >
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <span style={{ fontSize: '1rem', fontWeight: 700 }}>{n.title}</span>
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, background: n.is_read ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: n.is_read ? '#10B981' : '#F59E0B' }}>
                                {n.is_read ? 'O\'qilgan' : 'O\'qilmagan'}
                            </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#94A3B8' }}>{n.message}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569' }}>{new Date(n.created_at).toLocaleDateString()}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>ID: {n.user_id?.split('-')[0]}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
