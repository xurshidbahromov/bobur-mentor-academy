import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Coins, Flame, Calendar, MoreVertical, CreditCard } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'

export default function AdminUsers() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) toast.error("Foydalanuvchilarni yuklashda xatolik")
    else setProfiles(data || [])
    setLoading(false)
  }

  const handleAdjustCoins = async (profileId, currentCoins) => {
    const amountStr = prompt("Coin miqdorini o'zgartirish (masalan: +100 yoki -50):")
    if (!amountStr) return

    const amount = parseInt(amountStr)
    if (isNaN(amount)) {
      toast.error("Noto'g'ri miqdor")
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ coins: currentCoins + amount })
      .eq('id', profileId)
    
    if (error) toast.error(error.message)
    else {
      toast.success("Coinlar yangilandi")
      fetchUsers()
    }
  }

  const filteredUsers = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>Foydalanuvchilar</h1>
        <p style={{ margin: '4px 0 0', color: '#94A3B8' }}>Platformadagi barcha o'quvchilar ro'yxati va ularning balansi.</p>
      </div>

      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
        <input 
          type="text"
          placeholder="Ism bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: '12px', background: '#1E293B', border: '1px solid rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
        />
      </div>

      <div style={{ background: '#1E293B', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '0.875rem' }}>
              <th style={{ padding: '20px' }}>O'quvchi</th>
              <th style={{ padding: '20px' }}>Balans</th>
              <th style={{ padding: '20px' }}>Streak</th>
              <th style={{ padding: '20px' }}>Ro'yxatdan o'tdi</th>
              <th style={{ padding: '20px', textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Yuklanmoqda...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Foydalanuvchilar topilmadi.</td></tr>
            ) : filteredUsers.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155', overflow: 'hidden' }}>
                      {p.avatar_url ? <img src={p.avatar_url} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} color="#64748B" style={{ margin: '10px' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.full_name || 'Ismsiz User'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.role === 'admin' ? '🛡 Admin' : '🎓 Talaba'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#F59E0B', fontWeight: 700 }}>
                    <Coins size={16} /> {p.coins.toLocaleString()}
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EF4444', fontWeight: 700 }}>
                    <Flame size={16} /> {p.streak_count} kun
                  </div>
                </td>
                <td style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} /> {new Date(p.created_at).toLocaleDateString('uz-UZ')}
                  </div>
                </td>
                <td style={{ padding: '20px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleAdjustCoins(p.id, p.coins)}
                    title="Balansni tahrirlash"
                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#3461FF', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}
                  >
                    <CreditCard size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
