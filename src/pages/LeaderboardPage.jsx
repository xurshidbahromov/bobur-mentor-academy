import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaders() {
      // Fetch top 100 users ordered by coin amount and then by longest streak
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, coins, streak_count')
        .order('coins', { ascending: false })
        .order('longest_streak', { ascending: false })
        .limit(100)
      
      if (!error && data) {
        setLeaders(data)
      }
      setLoading(false)
    }

    fetchLeaders()
  }, [])

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '80px 20px 100px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        
        {/* ── Header ── */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1E1E2F, #09090E)', 
          borderRadius: 24, 
          padding: '32px 24px', 
          color: 'white', 
          boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}>
          <Trophy size={140} color="rgba(255,255,255,0.05)" style={{ position: 'absolute', right: -20, top: -20, transform: 'rotate(15deg)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trophy size={32} color="#F59E0B" />
            </div>
            <h1 style={{ margin: '0 0 8px', fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em' }}>Kuchlilar Doskasi</h1>
            <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9375rem' }}>Top 100 o'quvchilar ro'yxati</p>
          </div>
        </div>

        {/* ── List ── */}
        <div style={{ background: 'white', border: '1.5px solid rgba(148,163,184,0.15)', borderRadius: 24, padding: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Yuklanmoqda...</div>
          ) : leaders.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Hozircha hech kim yo'q</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {leaders.map((user, index) => {
                const isTop3 = index < 3
                const rankColor = index === 0 ? '#F59E0B' : index === 1 ? '#94A3B8' : index === 2 ? '#B45309' : '#64748B'
                
                return (
                  <div key={user.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: 14, 
                    padding: '12px 16px', borderRadius: 16,
                    background: index === 0 ? 'rgba(245,158,11,0.05)' : 'transparent',
                    border: index === 0 ? '1px solid rgba(245,158,11,0.2)' : '1px solid transparent',
                  }}>
                    {/* Rank */}
                    <div style={{ 
                      width: 28, height: 28, borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isTop3 ? `${rankColor}15` : 'transparent',
                      color: rankColor, fontWeight: 800, fontSize: isTop3 ? '1rem' : '0.9375rem'
                    }}>
                      {index === 0 ? <Medal size={20} /> : index + 1}
                    </div>

                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F1F5F9', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: '#94A3B8', fontWeight: 800, fontSize: '1.125rem' }}>
                          {(user.full_name || 'U')[0].toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user.full_name || 'Anonymous User'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem', color: '#64748B' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" /> {user.coins} Coin
                        </span>
                        <span>•</span>
                        <span>🔥 {user.streak_count} kun</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  )
}
