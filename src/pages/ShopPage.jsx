// src/pages/ShopPage.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, ShoppingCart, CreditCard, Zap, Star, Rocket, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import PaymentModal from '../components/PaymentModal'

// ── Data ──────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: 'starter', icon: Zap, color: '#3461FF', bg: 'rgba(52,97,255,0.08)',
    name: 'Starter', coins: 100, priceRaw: 20000,
    price: '20 000', originalPrice: null, discount: null,
    perCoin: "200 so'm / coin", featured: false,
  },
  {
    id: 'standard', icon: Star, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',
    name: 'Standard', coins: 300, priceRaw: 52000,
    price: '52 000', originalPrice: '60 000', discount: 13,
    badge: 'Mashhur', perCoin: "173 so'm / coin", featured: false,
  },
  {
    id: 'pro', icon: Rocket, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',
    name: 'Pro', coins: 700, priceRaw: 105000,
    price: '105 000', originalPrice: '140 000', discount: 25,
    badge: 'Eng foydali', perCoin: "150 so'm / coin", featured: true,
  },
]

const STEPS = [
  { icon: ShoppingCart, color: '#3461FF', title: 'Paket tanlang', text: 'Kerakli coin paketini tanlang' },
  { icon: CreditCard, color: '#8B5CF6', title: "Karta orqali to'lang", text: "Ko'rsatilgan raqamga summani o'tkazing" },
  { icon: CheckCircle2, color: '#10B981', title: 'Kvitansiya yuboring', text: 'Skrinshot orqali adminga yuboring' },
  { icon: Zap, color: '#F59E0B', title: 'Coinlar tushadi', text: "Admin tasdiqlashi bilan hisobga qo'shiladi" },
]

// ── Animation variants ──────────────────────────────────────
// (Removed per-element fade-up — page already has route-level transition)

export default function ShopPage() {
  const { profile } = useAuth()
  const coins = profile?.coins ?? 0
  const [customCoins, setCustomCoins] = useState('')
  const [selectedPkg, setSelectedPkg] = useState(null)

  const handleCustomBuy = () => {
    const amount = parseInt(customCoins)
    if (!amount || amount < 10) { toast.error('Kamida 10 coin kiriting!'); return }
    const priceRaw = amount * 200
    setSelectedPkg({
      id: 'custom', name: `Maxsus (${amount} coin)`,
      coins: amount, priceRaw, price: priceRaw.toLocaleString(),
      perCoin: "200 so'm/coin", color: '#3461FF', bg: 'rgba(52,97,255,0.08)'
    })
  }

  const estimatedPrice = customCoins ? (parseInt(customCoins || 0) * 200).toLocaleString() : null

  return (
    <>
      <style>{`
        .shop-page-wrapper { width: 100%; padding-bottom: 50px; }
        .shop-container { max-width: 1040px; margin: 0 auto; position: relative; z-index: 20; }
        
        .shop-hero {
          background: linear-gradient(145deg, #0F172A 0%, #1E293B 50%, #1a1040 100%);
          position: relative;
          overflow: hidden;
          padding: 40px 0 120px;
          border-radius: 0 0 24px 24px;
          margin-bottom: -80px;
          box-shadow: 0 15px 30px rgba(15,23,42,0.1);
        }
        
        @media (max-width: 768px) {
          .shop-hero {
            padding: 30px 0 100px;
            border-radius: 0 0 16px 16px;
            margin-bottom: -60px;
          }
        }

        .shop-hero-title {
          margin: 0 0 14px;
          font-weight: 900;
          color: white;
          letter-spacing: -0.04em;
          line-height: 1.1;
          font-size: clamp(1.75rem, 5vw, 2.5rem);
        }

        .shop-content { padding: 0 20px; position: relative; z-index: 2; }
        @media (max-width: 768px) { .shop-content { padding: 0 14px; } }

        .packages-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 24px;
        }

        @media (min-width: 768px) {
          .packages-grid {
            grid-template-columns: repeat(3, 1fr);
            align-items: stretch;
          }
        }

        .step-grid {
          display: grid;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .step-grid { grid-template-columns: repeat(2, 1fr); gap: 20px 32px; }
        }
        @media (min-width: 1000px) {
          .step-grid { grid-template-columns: repeat(4, 1fr); }
        }

        /* Input */
        .shop-input-row {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid rgba(15,23,42,0.08); border-radius: 12px;
          padding: 0 14px; height: 48px; background: #FFF; margin-bottom: 14px;
          transition: border-color 0.2s;
        }
        .shop-input-row:focus-within {
          border-color: #3461FF;
          box-shadow: 0 0 0 3px rgba(52,97,255,0.08);
        }
        .shop-input-row input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 1rem; font-weight: 700; color: #0F172A; font-family: inherit;
          -webkit-appearance: none;
        }
      `}</style>

      <div className="shop-page-wrapper">
        {/* ── FULL WIDTH HERO ── */}
          <div className="shop-hero">
          {/* Ambient Glows */}
          <div style={{ position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '20%', left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Floating Coins Animation */}
          {[
            { top: '15%', right: '10%', size: 48, delay: 0 },
            { top: '65%', right: '20%', size: 28, delay: 0.4 },
            { top: '25%', left: '8%', size: 36, delay: 0.2 },
            { bottom: '20%', left: '25%', size: 22, delay: 0.6 },
          ].map((c, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 + i * 0.5, delay: c.delay, ease: 'easeInOut' }}
              style={{ position: 'absolute', opacity: 0.15, pointerEvents: 'none', ...c }}
            >
              <Coins size={c.size} color="white" />
            </motion.div>
          ))}

          <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ShoppingCart size={12} color="#F59E0B" />
                  <span style={{ color: '#FDE68A', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market va Bonuslar</span>
                </div>
              </div>

              <h1 className="outfit-font shop-hero-title">
                Market
              </h1>
              <p style={{ margin: '-6px 0 16px', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500 }}>
                Bilimingiz uchun coin paketlari va bonuslar
              </p>

              {/* Premium Balance Pill */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 100, padding: '6px 18px 6px 8px',
                  boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #FCD34D, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px rgba(245,158,11,0.25)' }}>
                  <Coins size={15} color="white" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1 }}>Sizning Balansingiz</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 1 }}>
                    <span className="outfit-font" style={{ color: 'white', fontSize: '1.125rem', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {coins.toLocaleString()}
                    </span>
                    <span style={{ color: '#FCD34D', fontSize: '0.6875rem', fontWeight: 700 }}>coin</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          </div>

        {/* ── 1040px CONSTRAINED CONTENT ── */}
        <div className="shop-container">
          <div className="shop-content">

            {/* Section Indicator */}
            <div style={{ maxWidth: 1040, margin: '0 auto' }}>
              <p style={{ margin: '0 0 16px', fontWeight: 800, fontSize: '0.75rem', color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Coin Paketlari
              </p>

              {/* Packages Grid */}
              <div className="packages-grid">
                {PACKAGES.map((pkg, i) => {
                  const isPro = pkg.featured;
                  const IconComp = pkg.icon;

                  return (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ y: -4, boxShadow: isPro ? '0 24px 48px rgba(245,158,11,0.3)' : '0 16px 32px rgba(15,23,42,0.12)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`glass-card-premium ${isPro ? 'pro-package-card' : ''}`}
                      style={{
                        background: isPro ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : undefined,
                        backdropFilter: isPro ? 'none' : undefined,
                        WebkitBackdropFilter: isPro ? 'none' : undefined,
                        padding: isPro ? '24px 18px' : '20px 16px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        display: 'flex', flexDirection: 'column',
                        transform: isPro ? 'scale(1.02)' : 'scale(1)', 
                        zIndex: isPro ? 2 : 1,
                      }}
                    >
                      {/* Inner glowing element for Pro */}
                      {isPro && (
                        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
                      )}

                      {/* Top Row: Icon + Title + Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 10, background: isPro ? 'rgba(255,255,255,0.2)' : 'rgba(255, 255, 255, 0.7)', color: isPro ? 'white' : pkg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: isPro ? 'none' : '1px solid rgba(255,255,255,0.8)' }}>
                            <IconComp size={16} />
                          </div>
                          <p style={{ margin: 0, color: isPro ? 'rgba(255,255,255,0.9)' : '#475569', fontSize: '0.875rem', fontWeight: 700 }}>{pkg.name}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {pkg.discount && (
                            <span style={{ background: isPro ? '#065F46' : '#10B981', color: isPro ? '#A7F3D0' : 'white', fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderRadius: 100 }}>
                              -{pkg.discount}%
                            </span>
                          )}
                          {pkg.badge && (
                            <span style={{ background: isPro ? 'rgba(0,0,0,0.2)' : '#F1F5F9', color: isPro ? 'white' : '#475569', fontSize: '0.6rem', fontWeight: 800, padding: '3px 8px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {isPro && <Sparkles size={10} />}
                              {pkg.badge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                          <span className="outfit-font" style={{ fontWeight: 900, fontSize: '1.75rem', color: isPro ? 'white' : '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>
                            {pkg.coins}
                          </span>
                          <span style={{ color: isPro ? 'rgba(255,255,255,0.7)' : '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>coin</span>
                        </div>

                        <div style={{ paddingTop: 16, borderTop: isPro ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(15,23,42,0.06)', marginTop: 'auto' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                              {pkg.originalPrice && (
                                <p style={{ margin: '0 0 1px', fontSize: '0.65rem', textDecoration: 'line-through', color: isPro ? 'rgba(255,255,255,0.4)' : '#94A3B8', fontWeight: 600 }}>{pkg.originalPrice} so'm</p>
                              )}
                              <p style={{ margin: 0, fontWeight: 900, fontSize: '1.05rem', color: isPro ? 'white' : '#0F172A', letterSpacing: '-0.02em' }}>{pkg.price} <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>so'm</span></p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: isPro ? 'rgba(255,255,255,0.6)' : '#64748B', fontWeight: 600 }}>{pkg.perCoin}</p>
                            </div>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: isPro ? 'white' : `${pkg.color}15`, color: isPro ? '#D97706' : pkg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}>
                              <ArrowRight size={16} strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Custom Amount & Guide container grid (Desktop) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Custom Input */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                    border: '1px solid rgba(15,23,42,0.06)', borderRadius: 20, padding: '20px',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <h3 className="outfit-font" style={{ margin: '0 0 4px', fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>O'zingiz miqdor kiriting</h3>
                      <p style={{ margin: 0, color: '#64748B', fontSize: '0.8125rem', fontWeight: 500 }}>1 coin = 200 so'm (o'zingiz kiritgan miqdorda chegirma yo'q)</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, alignItems: 'center' }}>
                      <div className="shop-input-row" style={{ margin: 0 }}>
                        <Coins size={18} color="#D97706" />
                        <input
                          type="number" min="10" placeholder="Minimum 10 coin"
                          value={customCoins} onChange={e => setCustomCoins(e.target.value)}
                        />
                        <AnimatePresence mode="wait">
                          {customCoins && (
                            <motion.span
                              key={estimatedPrice}
                              initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.2 }}
                              style={{ color: '#0F172A', fontSize: '0.9375rem', fontWeight: 800, whiteSpace: 'nowrap', background: '#F1F5F9', padding: '5px 10px', borderRadius: 7 }}
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
                          background: 'linear-gradient(135deg, #3461FF 0%, #214CE5 100%)',
                          color: 'white', border: 'none', borderRadius: 12,
                          padding: '0 20px', height: 48, fontWeight: 700, fontSize: '0.9375rem',
                          cursor: 'pointer', fontFamily: 'inherit',
                          boxShadow: '0 6px 18px rgba(52,97,255,0.22)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <span>To'lovga o'tish</span>
                        <ArrowRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* How to Buy Guide */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
                    border: '1px solid rgba(15,23,42,0.04)', borderRadius: 20, padding: '20px',
                  }}
                >
                  <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 8px rgba(15,23,42,0.05)' }}>
                      <ShoppingCart size={16} color="#0F172A" />
                    </div>
                    <h3 className="outfit-font" style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>Qanday ishlaydi?</h3>
                  </div>

                  <div className="step-grid">
                    {STEPS.map((step, i) => {
                      const StepIcon = step.icon;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 3px 8px rgba(15,23,42,0.06)', marginTop: 2 }}>
                            <span className="outfit-font" style={{ color: step.color, fontWeight: 900, fontSize: '0.8125rem' }}>{i + 1}</span>
                          </div>
                          <div>
                            <p className="outfit-font" style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '0.875rem', color: '#0F172A' }}>{step.title}</p>
                            <p style={{ margin: 0, color: '#64748B', fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.5 }}>{step.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal pkg={selectedPkg} onClose={() => setSelectedPkg(null)} />
    </>
  )
}
