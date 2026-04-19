import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, BookOpen, Video, Coins, Flame, TrendingUp, ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const [timeframe, setTimeframe] = useState('weekly') // 'weekly', 'monthly', 'yearly'

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

      {/* Revenue Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px', marginBottom: '48px' }}>
        <div style={{ background: '#1E293B', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px' }}>Daromad Dinamikasi</h2>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.875rem' }}>Barcha kurslardan tushgan jami daromad</p>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px' }}>
              {['weekly', 'monthly', 'yearly'].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: timeframe === t ? '#3461FF' : 'transparent',
                    color: timeframe === t ? 'white' : '#64748B',
                    fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s'
                  }}
                >
                  {t === 'weekly' ? 'Hafta' : t === 'monthly' ? 'Oy' : 'Yil'}
                </button>
              ))}
            </div>
          </div>

          {/* Simple SVG Chart */}
          <div style={{ height: '240px', width: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {(stats?.[`revenue_${timeframe}`] || []).map((val, i, arr) => {
              const max = Math.max(...arr, 1000)
              const height = (val / max) * 100
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '100%', height: `${height}%`, background: 'linear-gradient(to top, #3461FF, #8B5CF6)', borderRadius: '6px 6px 2px 2px', minHeight: '4px', opacity: 0.8 + (height / 500) }} />
                  <span style={{ fontSize: '10px', color: '#475569', fontWeight: 600 }}>{i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#1E293B', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(16,185,129,0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#94A3B8', fontWeight: 500 }}>Jami Tushum</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 800 }}>{stats?.total_revenue?.toLocaleString() || 0} UZS</p>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: '0.8125rem', fontWeight: 700 }}>
              <ArrowUpRight size={16} /> +24% o'tgan oyga nisbatan
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #3461FF, #8B5CF6)', padding: '32px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.125rem', fontWeight: 800 }}>Tezkor Harakat</h3>
            <p style={{ margin: '0 0 20px', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>Yangi kurs yoki dars qo'shish.</p>
            <button style={{ background: 'white', color: '#3461FF', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer', fontSize: '0.875rem' }}>
              Boshlash
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Stats Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={{ background: '#1E293B', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '24px' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame color="#F59E0B" size={20} />
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Faol O'quvchilar</h2>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px' }}>{stats?.active_streaks || 0}</p>
          <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.5 }}>Hozirda kamida 1 kunlik olovga (streak) ega o'quvchilar soni.</p>
        </div>
      </div>
    </div>
  )
}
