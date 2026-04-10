// src/pages/ShopPage.jsx
// Coin paketlarini ko'rsatadi.
// To'lov tizimi hozircha Telegram orqali manual — tez orada avtomatik bo'ladi.

import { motion } from 'framer-motion'
import { Coins, MessageCircle, Check, Zap, Star, Rocket } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PACKAGES = [
  {
    icon: <Zap size={28} />,
    color: '#3461FF',
    bg: 'rgba(52,97,255,0.08)',
    name: "Starter",
    coins: 100,
    price: "5 000 so'm",
    popular: false,
  },
  {
    icon: <Star size={28} />,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
    name: "Popular",
    coins: 500,
    price: "20 000 so'm",
    popular: true,
    badge: "Eng ko'p tanlanadi",
  },
  {
    icon: <Rocket size={28} />,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    name: "Pro",
    coins: 1000,
    price: "35 000 so'm",
    popular: false,
    badge: "Tejamkor",
  },
]

export default function ShopPage() {
  const { profile } = useAuth()
  const coins = profile?.coins ?? 0

  const handleBuy = (pkg) => {
    const text = encodeURIComponent(`Assalomu alaykum! ${pkg.coins} coin sotib olmoqchiman (${pkg.price}).`)
    window.open(`https://t.me/BMASupport?text=${text}`, '_blank')
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 32px' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: '1.625rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
          Coinlar Do'koni
        </h1>
        <p style={{ margin: 0, color: '#64748B', fontSize: '0.9375rem' }}>Qulfli darslarni ochish uchun coin sotib oling.</p>
      </motion.div>

      {/* ── Current Balance ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        style={{
          background: 'linear-gradient(135deg, #0F172A, #1E293B)',
          borderRadius: 20, padding: '20px 24px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Coins size={26} color="#F59E0B" />
        </div>
        <div>
          <p style={{ margin: '0 0 2px', color: '#94A3B8', fontSize: '0.8125rem', fontWeight: 600 }}>Hozirgi balans</p>
          <p style={{ margin: 0, color: 'white', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {coins.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#F59E0B' }}>coin</span>
          </p>
        </div>
      </motion.div>

      {/* ── Packages ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
        {PACKAGES.map((pkg, i) => (
          <motion.div key={pkg.name} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{
              background: 'white',
              border: pkg.popular ? '2px solid #8B5CF6' : '1.5px solid rgba(100,120,255,0.1)',
              borderRadius: 20, padding: '20px',
              boxShadow: pkg.popular ? '0 8px 32px rgba(139,92,246,0.15)' : '0 2px 12px rgba(0,0,0,0.04)',
              position: 'relative',
            }}
          >
            {pkg.badge && (
              <div style={{
                position: 'absolute', top: -10, right: 16,
                background: pkg.popular ? '#8B5CF6' : '#F59E0B',
                color: 'white', fontSize: '0.6875rem', fontWeight: 800,
                padding: '3px 10px', borderRadius: 8, letterSpacing: '0.04em',
              }}>
                {pkg.badge}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: pkg.bg, color: pkg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {pkg.icon}
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '1.0625rem', color: '#0F172A' }}>{pkg.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Coins size={14} color={pkg.color} />
                    <span style={{ fontWeight: 900, fontSize: '1.375rem', color: pkg.color, letterSpacing: '-0.02em' }}>{pkg.coins}</span>
                    <span style={{ color: '#94A3B8', fontSize: '0.875rem', fontWeight: 500 }}>coin</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '1.125rem', color: '#0F172A' }}>{pkg.price}</p>
                <button
                  onClick={() => handleBuy(pkg)}
                  style={{
                    background: pkg.popular ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)' : 'linear-gradient(135deg, #3461FF, #214CE5)',
                    color: 'white', border: 'none', borderRadius: 12,
                    padding: '9px 20px', fontWeight: 700, fontSize: '0.875rem',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    boxShadow: pkg.popular ? '0 4px 14px rgba(139,92,246,0.3)' : '0 4px 14px rgba(52,97,255,0.25)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sotib olish
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── How to buy info ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{
          background: 'rgba(52,97,255,0.04)', border: '1px solid rgba(52,97,255,0.1)',
          borderRadius: 16, padding: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <MessageCircle size={20} color="#3461FF" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#0F172A', fontSize: '0.9375rem' }}>Qanday sotib olish mumkin?</p>
            {[
              "\"Sotib olish\" tugmasini bosing",
              "Telegram orqali bizga murojaat qiling",
              "To'lovni amalga oshiring",
              "Coinlar 5-10 daqiqa ichida qo'shiladi",
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(52,97,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#3461FF' }}>{i + 1}</span>
                </div>
                <span style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.5 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  )
}
