// src/pages/ShopPage.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, MessageCircle, Zap, Star, Rocket, Crown, Gift, ArrowRight, Sparkles } from 'lucide-react'
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
    id: 'pro', icon: Rocket, color: '#0EA5E9', bg: 'rgba(14,165,233,0.1)',
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
  { emoji: '👇', text: '"Sotib olish" tugmasini bosing' },
  { emoji: '💬', text: 'Telegram orqali bizga murojaat qiling' },
  { emoji: '💳', text: 'To\'lovni amalga oshiring (karta yoki naqd)' },
  { emoji: '⚡', text: 'Coinlar 5–10 daqiqa ichida hisobingizga tushadi' },
]

export default function ShopPage() {
  const { profile } = useAuth()
  const coins = profile?.coins ?? 0
  const [customCoins, setCustomCoins] = useState('')
  const [selected, setSelected] = useState(null)

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

  const estimatedPrice = customCoins ? (parseInt(customCoins || 0) * 35).toLocaleString() : null

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 100px' }}>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 32 }}
      >
        <h1 className="outfit-font" style={{
          margin: '0 0 6px', fontSize: '2.5rem', fontWeight: 900,
          color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1,
        }}>
          Do'kon 🛍️
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '0.9375rem', fontWeight: 500 }}>
          Qulfli darslarni ochish uchun coin sotib oling
        </p>
      </motion.div>

      {/* ── Balance Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px) saturate(2)',
          WebkitBackdropFilter: 'blur(20px) saturate(2)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: 24, padding: '24px',
          marginBottom: 36,
          display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: '0 8px 32px rgba(245,158,11,0.08)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* subtle BG glow */}
        <div style={{
          position: 'absolute', right: -40, top: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: 60, height: 60, borderRadius: 18, flexShrink: 0,
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          border: '1px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
        }}>
          <Coins size={28} color="#D97706" />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ margin: '0 0 2px', color: '#64748B', fontSize: '0.875rem', fontWeight: 600 }}>
            Hozirgi balansingiz
          </p>
          <p className="outfit-font" style={{
            margin: 0, color: '#0F172A', fontSize: '2.25rem',
            fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            {coins.toLocaleString()}
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#D97706', marginLeft: 8 }}>coin</span>
          </p>
        </div>
      </motion.div>

      {/* ── Section Label ── */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}
        style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.75rem', color: '#94A3B8', letterSpacing: '0.1em', textTransform: 'uppercase' }}
      >
        Paketlar
      </motion.p>

      {/* ── Packages Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 36 }}>
        {PACKAGES.map((pkg, i) => {
          const IconComp = pkg.icon
          const isPopular = pkg.popular
          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, boxShadow: isPopular ? `0 16px 40px ${pkg.color}30` : '0 8px 24px rgba(15,23,42,0.08)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleBuy(pkg)}
              style={{
                background: isPopular ? `rgba(255, 255, 255, 0.8)` : 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isPopular ? `1.5px solid ${pkg.color}60` : '1px solid rgba(255, 255, 255, 0.5)',
                borderRadius: 20, padding: '20px',
                boxShadow: isPopular ? `0 8px 32px ${pkg.color}15` : '0 4px 20px rgba(15,23,42,0.04)',
                position: 'relative', cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Popular glow ring */}
              {isPopular && (
                <div style={{
                  position: 'absolute', inset: -1, borderRadius: 21,
                  background: `linear-gradient(135deg, ${pkg.color}60, transparent, ${pkg.color}30)`,
                  zIndex: -1,
                }} />
              )}

              {/* Badge */}
              {pkg.badge && (
                <div style={{
                  position: 'absolute', top: -10, right: 14,
                  background: isPopular ? pkg.color : '#E2E8F0',
                  color: isPopular ? 'white' : '#475569',
                  fontSize: '0.6rem', fontWeight: 800,
                  padding: '3px 10px', borderRadius: 100,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  {isPopular && <Sparkles size={8} style={{ display: 'inline', marginRight: 3 }} />}
                  {pkg.badge}
                </div>
              )}

              {/* Icon + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: pkg.bg, color: pkg.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  boxShadow: isPopular ? `0 4px 12px ${pkg.color}30` : 'none',
                }}>
                  <IconComp size={22} />
                </div>
                <div>
                  <p className="outfit-font" style={{ margin: '0 0 1px', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{pkg.name}</p>
                  <p style={{ margin: 0, fontSize: '0.6875rem', color: '#94A3B8', fontWeight: 500 }}>{pkg.perCoin}</p>
                </div>
              </div>

              {/* Coin amount */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                <span className="outfit-font" style={{
                  fontWeight: 900, fontSize: '2rem', color: pkg.color,
                  letterSpacing: '-0.04em', lineHeight: 1,
                }}>
                  {pkg.coins.toLocaleString()}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>coin</span>
              </div>

              {/* Buy button */}
              <div style={{
                width: '100%',
                background: isPopular ? pkg.color : `${pkg.color}0f`,
                color: isPopular ? 'white' : pkg.color,
                border: isPopular ? 'none' : `1px solid ${pkg.color}30`,
                borderRadius: 12, padding: '11px 16px',
                fontWeight: 700, fontSize: '0.9375rem',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: isPopular ? `0 4px 14px ${pkg.color}40` : 'none',
              }}>
                <span>{pkg.price} so'm</span>
                <ArrowRight size={16} />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Custom Amount ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: 24, padding: '24px', marginBottom: 24,
          boxShadow: '0 8px 24px rgba(15,23,42,0.03)',
        }}
      >
        <p className="outfit-font" style={{ margin: '0 0 4px', fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>
          O'zingiz miqdor kiriting
        </p>
        <p style={{ margin: '0 0 18px', color: '#64748B', fontSize: '0.875rem' }}>
          1 coin ≈ 35 so'm (taxminiy narx)
        </p>

        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          border: '1.5px solid rgba(15,23,42,0.08)', borderRadius: 16,
          padding: '0 16px', height: 56, background: '#F8FAFC',
          marginBottom: 12,
        }}>
          <Coins size={20} color="#D97706" />
          <input
            type="number" min="10"
            placeholder="Masalan: 250"
            value={customCoins}
            onChange={e => setCustomCoins(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: '1.0625rem', fontWeight: 700, color: '#0F172A', fontFamily: 'inherit',
            }}
          />
          <AnimatePresence mode="wait">
            {customCoins && (
              <motion.span
                key={estimatedPrice}
                initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.25 }}
                style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}
              >
                ≈ {estimatedPrice} so'm
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleCustomBuy}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #3461FF, #214CE5)',
            color: 'white', border: 'none', borderRadius: 14,
            padding: '15px 20px', fontWeight: 700, fontSize: '1rem',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 18px rgba(52,97,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <MessageCircle size={18} />
          Telegram orqali buyurtma berish
        </motion.button>
      </motion.div>

      {/* ── How to buy ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.46, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'white', border: '1px solid rgba(15,23,42,0.05)',
          borderRadius: 24, padding: '24px',
          boxShadow: '0 2px 12px rgba(15,23,42,0.02)',
        }}
      >
        <p className="outfit-font" style={{ margin: '0 0 20px', fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>
          Qanday sotib olish mumkin?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                paddingBottom: i < STEPS.length - 1 ? 18 : 0,
                position: 'relative',
              }}
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute', left: 19, top: 38,
                  width: 2, height: '100%',
                  background: 'linear-gradient(to bottom, rgba(15,23,42,0.06), transparent)',
                  borderRadius: 2,
                }} />
              )}

              {/* Step dot */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? '#EFF6FF' : '#F8FAFC',
                border: `1px solid ${i === 0 ? 'rgba(52,97,255,0.15)' : 'rgba(15,23,42,0.06)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.125rem',
              }}>
                {step.emoji}
              </div>

              <div style={{ paddingTop: 10 }}>
                <span style={{ color: '#334155', fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 }}>
                  {step.text}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
