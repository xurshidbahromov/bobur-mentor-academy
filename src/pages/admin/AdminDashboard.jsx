import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Video, Coins, Flame, TrendingUp, ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data, error } = await supabase.rpc('get_admin_stats')
      if (!error && data) {
        setStats(data)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <div className="skeleton-loader" style={{ height: 36, width: 280, borderRadius: 10, marginBottom: 10 }} />
        <div className="skeleton-loader" style={{ height: 20, width: 380, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 48 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: '#1E293B', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="skeleton-loader" style={{ width: 48, height: 48, borderRadius: 12, background: '#334155' }} />
              <div className="skeleton-loader" style={{ width: 60, height: 24, borderRadius: 100, background: '#334155' }} />
            </div>
            <div className="skeleton-loader" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 10, background: '#334155' }} />
            <div className="skeleton-loader" style={{ height: 32, width: '40%', borderRadius: 8, background: '#334155' }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#1E293B', padding: 32, borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="skeleton-loader" style={{ height: 24, width: 180, borderRadius: 8, marginBottom: 16, background: '#334155' }} />
          <div className="skeleton-loader" style={{ height: 48, width: 120, borderRadius: 10, marginBottom: 12, background: '#334155' }} />
          <div className="skeleton-loader" style={{ height: 16, width: '70%', borderRadius: 6, background: '#334155' }} />
        </div>
        <div className="skeleton-loader" style={{ height: 180, borderRadius: 24, background: '#334155' }} />
      </div>
    </div>
  )

  const statCards = [
    { label: 'Jami Foydalanuvchilar', value: stats?.total_users || 0, icon: Users, color: '#3461FF', trend: '+12%' },
    { label: 'Jami Kurslar', value: stats?.total_courses || 0, icon: BookOpen, color: '#8B5CF6', trend: '+2' },
    { label: 'Jami Darslar', value: stats?.total_lessons || 0, icon: Video, color: '#F59E0B', trend: '+5' },
    { label: 'Muanovadagi Coinlar', value: stats?.total_coins_in_circulation || 0, icon: Coins, color: '#10B981', trend: '+850' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontWeight: 800 }}>Xush kelibsiz, Admin!</h1>
        <p style={{ margin: 0, color: '#94A3B8' }}>Bugun platformadagi asosiy ko'rsatkichlar bilan tanishing.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: '#1E293B',
              padding: '24px',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: '0.875rem', fontWeight: 700 }}>
                {card.trend} <ArrowUpRight size={14} />
              </div>
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#94A3B8', fontWeight: 500 }}>{card.label}</h3>
            <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800 }}>{card.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#1E293B', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '24px' }}>
            <Flame color="#F59E0B" />
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Faol O'quvchilar</h2>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px' }}>{stats?.active_streaks || 0}</p>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.875rem' }}>Hozirda kamida 1 kunlik olovga (streak) ega o'quvchilar soni.</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #3461FF, #8B5CF6)', padding: '32px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
          <TrendingUp size={140} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 16px', fontWeight: 700 }}>Yangi Kurs qo'shish</h2>
          <p style={{ margin: '0 0 24px', color: 'rgba(255,255,255,0.8)', maxWidth: '280px' }}>Platformaga yangi darslar va video kontentlarni joylashtirishni boshlang.</p>
          <button style={{ 
            background: 'white', color: '#3461FF', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' 
          }}>
            Kurs Yaratish
          </button>
        </div>
      </div>
    </div>
  )
}
