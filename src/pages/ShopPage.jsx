import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, ArrowRight, Wallet, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

// Base calculation: 1 Coin = 300 UZS
const PACKAGES = [
  { id: 1, coins: 5,   price: 1500,   label: 'Starter' },
  { id: 2, coins: 15,  price: 4500,   label: 'Basic' },
  { id: 3, coins: 50,  price: 15000,  label: 'Student' },
  { id: 4, coins: 100, price: 27000,  label: '+10% Bonus', popular: true },
  { id: 5, coins: 500, price: 120000, label: '+20% Bonus' },
]

export default function ShopPage() {
  const { profile } = useAuth()
  const [customCoins, setCustomCoins] = useState('')

  const handlePurchase = (coins, amount) => {
    alert(`Tez orada!\n\nSiz sotib olmoqchisiz: ${coins} Coin\nTo'lov summasi: ${amount.toLocaleString()} UZS\n\nBu yerga Click/Payme yoki Telegram Stars ulanadi.`)
  }

  const customPrice = customCoins ? (parseInt(customCoins, 10) * 300) : 0

  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '80px 20px 100px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* ── Top Balance Card ── */}
        <div style={{ 
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
          borderRadius: 24, 
          padding: '28px 24px', 
          color: 'white', 
          boxShadow: '0 12px 32px rgba(245, 158, 11, 0.3)',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative Background Icon */}
          <Coins size={140} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', right: -20, top: -20, transform: 'rotate(15deg)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Joriy balansingiz</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Coins size={44} strokeWidth={2} />
              <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {profile?.coins || 0}
              </h1>
            </div>
          </div>
        </div>

        {/* ── Standard Packages ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Coin xarid qilish</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PACKAGES.map(pkg => (
              <motion.button key={pkg.id}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                onClick={() => handlePurchase(pkg.coins, pkg.price)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 20px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                  border: pkg.popular ? `1.5px solid rgba(52,97,255,0.3)` : '1.5px solid rgba(148,163,184,0.15)',
                  background: pkg.popular ? `rgba(52,97,255,0.03)` : 'white',
                  position: 'relative',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
                }}
              >
                {pkg.popular && (
                  <span style={{ position: 'absolute', top: -10, right: 24, background: '#3461FF', color: 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px 10px', borderRadius: 10, letterSpacing: '0.04em', boxShadow: '0 2px 8px rgba(52,97,255,0.4)' }}>
                    ENG MASHHUR
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={22} color="#D97706" strokeWidth={1.75} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.125rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{pkg.coins} Coin</p>
                    <p style={{ margin: 0, color: pkg.popular ? '#3461FF' : '#64748B', fontSize: '0.8125rem', fontWeight: 600, marginTop: 4 }}>{pkg.label}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>{pkg.price.toLocaleString()} so'm</p>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(148,163,184,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={16} color="#64748B" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Custom Coin Calculator ── */}
        <div style={{ background: 'white', border: '1.5px solid rgba(148,163,184,0.15)', borderRadius: 24, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Wallet size={20} color="#3461FF" />
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: '#0F172A' }}>Boshqa miqdor</h3>
          </div>
          
          <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.875rem', lineHeight: 1.5 }}>
            O'zingizga kerakli bo'lgan coin miqdorini tering va avtomatik ravishda to'lov summasini bilib oling. (1 Coin = 300 so'm)
          </p>

          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input 
              type="number" 
              value={customCoins}
              onChange={(e) => setCustomCoins(e.target.value)}
              placeholder="Coin miqdori... (masalan, 32)"
              style={{
                width: '100%',
                padding: '16px 20px',
                paddingLeft: '48px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#0F172A',
                background: '#F8FAFC',
                border: '2px solid transparent',
                borderRadius: 16,
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3461FF'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
            />
            <Coins size={20} color="#94A3B8" style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ background: '#F1F5F9', borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.9375rem' }}>To'lov summasi:</span>
            <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>{customPrice.toLocaleString()} UZS</span>
          </div>

          <Button 
            variant="primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.0625rem', borderRadius: 16 }}
            disabled={!customCoins || customCoins <= 0}
            onClick={() => handlePurchase(customCoins, customPrice)}
          >
            {customCoins > 0 ? `${customPrice.toLocaleString()} UZS to'lash` : 'Miqdorni kiriting'}
          </Button>
        </div>

        {/* Note */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 24, padding: '16px', background: 'rgba(52,97,255,0.05)', borderRadius: 16 }}>
          <Info size={18} color="#3461FF" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
            Xarid qilingan coinlar darhol balansingizga qo'shiladi va u orqali istalgan yopiq darslarni (unlock) faollashtirishingiz mumkin.
          </p>
        </div>

      </motion.div>
    </div>
  )
}
