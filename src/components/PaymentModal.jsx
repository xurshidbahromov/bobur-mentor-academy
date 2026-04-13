// src/components/PaymentModal.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, ChevronRight, Zap, Star, Rocket, Crown, Gift } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
const PAYMENT_METHODS = [
  {
    id: 'click',
    name: 'Click',
    description: "O'zbekiston eng mashhur to'lov tizimi",
    color: '#FF6B00',
    bgColor: 'rgba(255, 107, 0, 0.08)',
    borderColor: 'rgba(255, 107, 0, 0.2)',
    logo: (
      <svg width="72" height="24" viewBox="0 0 72 24" fill="none">
        <text x="0" y="20" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="#FF6B00">click</text>
      </svg>
    ),
  },
  {
    id: 'payme',
    name: 'Payme',
    description: "Tez va xavfsiz onlayn to'lov",
    color: '#00AAFF',
    bgColor: 'rgba(0, 170, 255, 0.08)',
    borderColor: 'rgba(0, 170, 255, 0.2)',
    logo: (
      <svg width="82" height="24" viewBox="0 0 82 24" fill="none">
        <text x="0" y="20" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="22" fill="#00AAFF">payme</text>
      </svg>
    ),
  },
]

const PACKAGE_ICONS = { starter: Zap, standard: Star, pro: Rocket, premium: Crown, ultimate: Gift }

export default function PaymentModal({ pkg, onClose }) {
  const [selected, setSelected] = useState('click')
  const [step, setStep] = useState('select') // 'select' | 'confirm'

  const IconComp = PACKAGE_ICONS[pkg?.id] || Zap
  const chosenMethod = PAYMENT_METHODS.find(m => m.id === selected)

  const handleProceed = () => {
    if (step === 'select') {
      setStep('confirm')
    } else {
      // Placeholder — backend ready bo'lgandan keyin real redirect
      onClose()
    }
  }

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {pkg && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              zIndex: 201, maxWidth: 540, margin: '0 auto',
              background: 'rgba(248, 250, 252, 0.92)',
              backdropFilter: 'blur(40px) saturate(2.5)',
              WebkitBackdropFilter: 'blur(40px) saturate(2.5)',
              borderTopLeftRadius: 32, borderTopRightRadius: 32,
              border: '1px solid rgba(255,255,255,0.7)',
              borderBottom: 'none',
              boxShadow: '0 -24px 80px rgba(15,23,42,0.15)',
              padding: '0 0 40px',
              overflow: 'hidden',
            }}
          >
            {/* Handle bar */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(15,23,42,0.12)' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 0' }}>
              <h2 className="outfit-font" style={{ margin: 0, fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                {step === 'select' ? "To'lov usulini tanlang" : "To'lovni tasdiqlang"}
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(15,23,42,0.06)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <X size={18} color="#475569" strokeWidth={2.5} />
              </button>
            </div>

            {/* Package Summary Card */}
            <div style={{ margin: '20px 24px 0', padding: '16px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(15,23,42,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: pkg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <IconComp size={22} color={pkg.color} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="outfit-font" style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                  {pkg.name} — <span style={{ color: pkg.color }}>{pkg.coins.toLocaleString()} coin</span>
                </p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>{pkg.perCoin}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p className="outfit-font" style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.03em' }}>
                  {pkg.price}
                </p>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94A3B8' }}>so'm</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {step === 'select' ? (
                <motion.div key="select" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  {/* Payment Methods */}
                  <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {PAYMENT_METHODS.map(method => (
                      <motion.button
                        key={method.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(method.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '16px 20px', borderRadius: 20, cursor: 'pointer',
                          background: selected === method.id ? method.bgColor : 'rgba(255,255,255,0.6)',
                          border: `1.5px solid ${selected === method.id ? method.borderColor : 'rgba(255,255,255,0.6)'}`,
                          boxShadow: selected === method.id ? `0 8px 24px ${method.color}15` : '0 2px 8px rgba(15,23,42,0.03)',
                          textAlign: 'left', WebkitTapHighlightColor: 'transparent',
                          transition: 'all 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
                        }}
                      >
                        {/* Logo box */}
                        <div style={{ width: 80, display: 'flex', alignItems: 'center' }}>
                          {method.logo}
                        </div>

                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>
                            {method.name}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 500 }}>
                            {method.description}
                          </p>
                        </div>

                        {/* Radio indicator */}
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${selected === method.id ? method.color : 'rgba(15,23,42,0.15)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}>
                          {selected === method.id && (
                            <div style={{ width: 11, height: 11, borderRadius: '50%', background: method.color }} />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Security note */}
                  <div style={{ margin: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={15} color="#10B981" strokeWidth={2} />
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>
                      256-bit SSL orqali himoyalangan xavfsiz to'lov
                    </p>
                  </div>
                </motion.div>
              ) : (
                /* Confirm step */
                <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
                  <div style={{ padding: '20px 24px 0' }}>
                    <div style={{ padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 16px rgba(15,23,42,0.04)' }}>
                      {[
                        { label: "To'lov tizimi", value: chosenMethod?.name, valueColor: chosenMethod?.color },
                        { label: "Paket", value: `${pkg.name} (${pkg.coins} coin)` },
                        { label: "Narx", value: `${pkg.price} so'm`, bold: true },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < 2 ? 14 : 0, marginBottom: i < 2 ? 14 : 0, borderBottom: i < 2 ? '1px solid rgba(15,23,42,0.05)' : 'none' }}>
                          <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>{row.label}</span>
                          <span className={row.bold ? 'outfit-font' : ''} style={{ fontSize: row.bold ? '1.125rem' : '0.9375rem', fontWeight: row.bold ? 900 : 700, color: row.valueColor || '#0F172A' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <p style={{ margin: '12px 0 0', fontSize: '0.8125rem', color: '#94A3B8', textAlign: 'center' }}>
                      "To'lash" tugmasini bosgach {chosenMethod?.name} sahifasiga o'tasiz
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CTA Button */}
            <div style={{ padding: '20px 24px 0' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {step === 'confirm' && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep('select')}
                    style={{
                      width: 52, height: 52, borderRadius: 16, border: 'none',
                      background: 'rgba(15,23,42,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0, WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <ChevronRight size={20} color="#64748B" style={{ transform: 'rotate(180deg)' }} />
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleProceed}
                  style={{
                    flex: 1, height: 52, borderRadius: 16, border: 'none',
                    background: step === 'confirm'
                      ? `linear-gradient(135deg, ${chosenMethod?.color}, ${chosenMethod?.color}cc)`
                      : 'linear-gradient(135deg, #3461FF, #214CE5)',
                    color: 'white',
                    fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: step === 'confirm'
                      ? `0 8px 24px ${chosenMethod?.color}40`
                      : '0 8px 24px rgba(52,97,255,0.3)',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 0.3s, box-shadow 0.3s',
                  }}
                >
                  {step === 'select' ? 'Davom etish' : `${chosenMethod?.name} orqali to'lash`}
                  <ChevronRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
