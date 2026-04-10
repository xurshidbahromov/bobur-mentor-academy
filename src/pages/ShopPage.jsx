// src/pages/ShopPage.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, MessageCircle, Zap, Star, Rocket, Crown, Gift, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

const PACKAGES = [
  {
    id: 'starter', icon: Zap, color: '#3461FF', bg: 'rgba(52,97,255,0.08)',
    name: 'Starter', coins: 100, price: '5 000', perCoin: '50 so\'m/coin',
  },
  {
    id: 'standard', icon: Star, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',
    name: 'Standard', coins: 300, price: '12 000', perCoin: '40 so\'m/coin',
    badge: 'Mashhur',
  },
  {
    id: 'pro', icon: Rocket, color: '#06B6D4', bg: 'rgba(6,182,212,0.1)',
    name: 'Pro', coins: 600, price: '21 000', perCoin: '35 so\'m/coin',
    popular: true, badge: 'Eng ko\'p tanlanadi',
  },
  {
    id: 'premium', icon: Crown, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',
    name: 'Premium', coins: 1200, price: '36 000', perCoin: '30 so\'m/coin',
    badge: 'Tejamkor',
  },
  {
    id: 'ultimate', icon: Gift, color: '#10B981', bg: 'rgba(16,185,129,0.1)',
    name: 'Ultimate', coins: 2500, price: '62 500', perCoin: '25 so\'m/coin',
    badge: 'Eng foydali',
  },
]

const STEPS = [
  '"Sotib olish" tugmasini bosing',
  'Telegram orqali bizga murojaat qiling',
  'To\'lovni amalga oshiring (karta yoki naqd)',
  'Coinlar 5–10 daqiqa ichida hisobingizga tushadi',
]

export default function ShopPage() {
  const { profile } = useAuth()
  const coins = profile?.coins ?? 0
  const [customCoins, setCustomCoins] = useState('')

  const handleBuy = (pkg) => {
    const text = encodeURIComponent(
      `Assalomu alaykum! "${pkg.name}" paketni xohlayman — ${pkg.coins} coin (${pkg.price} so'm).`
    )
    window.open(`https://t.me/BMASupport?text=${text}`, '_blank')
  }

  const handleCustomBuy = () => {
    const amount = parseInt(customCoins)
    if (!amount || amount < 10) {
      toast.error('Kamida 10 coin kiriting!')
      return
    }
    const estimatedPrice = (amount * 35).toLocaleString()
    const text = encodeURIComponent(
      `Assalomu alaykum! ${amount} coin sotib olmoqchiman (~${estimatedPrice} so'm).`
    )
    window.open(`https://t.me/BMASupport?text=${text}`, '_blank')
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <h1 className="outfit-font" style={{ margin: '0 0 6px', fontSize: '1.625rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
          Coinlar Do'koni 🪙
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '0.9375rem' }}>
          Qulfli darslarni ochish uchun coin sotib oling
        </p>
      </motion.div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1e3a8a 100%)',
          borderRadius: 20, padding: '20px 24px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 8px 32px rgba(15,23,42,0.2)',
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Coins size={26} color="#F59E0B" />
        </div>
        <div>
          <p style={{ margin: '0 0 2px', color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', fontWeight: 600 }}>
            Hozirgi balansingiz
          </p>
          <p style={{ margin: 0, color: 'white', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {coins.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#F59E0B' }}>coin</span>
          </p>
        </div>
      </motion.div>

      {/* Section label */}
      <p style={{ margin: '0 0 14px', fontWeight: 700, fontSize: '0.75rem', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Paketlar
      </p>

      {/* Packages grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 28 }}>
        {PACKAGES.map((pkg, i) => {
          const IconComp = pkg.icon
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'white',
                border: pkg.popular ? `2px solid ${pkg.color}` : '1.5px solid rgba(100,120,255,0.1)',
                borderRadius: 20, padding: '18px',
                boxShadow: pkg.popular ? `0 8px 28px ${pkg.color}25` : '0 2px 12px rgba(0,0,0,0.04)',
                position: 'relative', cursor: 'pointer',
              }}
              onClick={() => handleBuy(pkg)}
            >
              {/* Badge */}
              {pkg.badge && (
                <div style={{
                  position: 'absolute', top: -10, right: 14,
                  background: pkg.popular ? pkg.color : '#64748B',
                  color: 'white', fontSize: '0.625rem', fontWeight: 800,
                  padding: '3px 10px', borderRadius: 8, letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {pkg.badge}
                </div>
              )}

              {/* Icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: pkg.bg, color: pkg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={22} />
                </div>
                <div>
                  <p style={{ margin: '0 0 1px', fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A' }}>{pkg.name}</p>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 500 }}>{pkg.perCoin}</p>
                </div>
              </div>

              {/* Coin amount */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 14 }}>
                <Coins size={15} color={pkg.color} style={{ flexShrink: 0, marginBottom: 1 }} />
                <span style={{ fontWeight: 900, fontSize: '1.75rem', color: pkg.color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {pkg.coins.toLocaleString()}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>coin</span>
              </div>

              {/* Buy button */}
              <button
                style={{
                  width: '100%',
                  background: pkg.popular
                    ? `linear-gradient(135deg, ${pkg.color}, ${pkg.color}cc)`
                    : `${pkg.color}15`,
                  color: pkg.popular ? 'white' : pkg.color,
                  border: pkg.popular ? 'none' : `1.5px solid ${pkg.color}40`,
                  borderRadius: 12, padding: '11px 16px',
                  fontWeight: 700, fontSize: '0.9375rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: pkg.popular ? `0 4px 14px ${pkg.color}40` : 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span>{pkg.price} so'm</span>
                <ArrowRight size={16} />
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* Custom amount */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{
          background: 'white', border: '1.5px solid rgba(100,120,255,0.12)',
          borderRadius: 20, padding: '20px', marginBottom: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        }}
      >
        <p style={{ margin: '0 0 3px', fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
          O'zingiz miqdor kiriting
        </p>
        <p style={{ margin: '0 0 14px', color: '#94A3B8', fontSize: '0.8125rem' }}>
          1 coin ≈ 35 so'm (taxminiy narx)
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 10,
            border: '1.5px solid rgba(100,120,255,0.18)', borderRadius: 14,
            padding: '0 14px', height: 52, background: '#F8FAFC',
          }}>
            <Coins size={18} color="#F59E0B" />
            <input
              type="number" min="10"
              placeholder="Masalan: 250"
              value={customCoins}
              onChange={e => setCustomCoins(e.target.value)}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '1rem', fontWeight: 700, color: '#0F172A', fontFamily: 'inherit',
              }}
            />
            {customCoins && (
              <span style={{ color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                ≈{(parseInt(customCoins || 0) * 35).toLocaleString()} so'm
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleCustomBuy}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3461FF, #214CE5)',
              color: 'white', border: 'none', borderRadius: 14,
              padding: '15px 20px', fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(52,97,255,0.3)',
              WebkitTapHighlightColor: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <MessageCircle size={18} />
            Telegram orqali buyurtma berish
          </motion.button>
        </div>
      </motion.div>

      {/* How to buy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
        style={{
          background: 'rgba(52,97,255,0.04)', border: '1px solid rgba(52,97,255,0.12)',
          borderRadius: 16, padding: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <MessageCircle size={20} color="#3461FF" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 12px', fontWeight: 700, color: '#0F172A', fontSize: '0.9375rem' }}>
              Qanday sotib olish mumkin?
            </p>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: i < STEPS.length - 1 ? 10 : 0 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'rgba(52,97,255,0.12)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
                }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#3461FF' }}>{i + 1}</span>
                </div>
                <span style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.55 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  )
}
