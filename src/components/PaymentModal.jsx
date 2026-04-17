// src/components/PaymentModal.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle2, Zap, Star, Rocket, Crown, Gift, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

const PACKAGE_ICONS = { starter: Zap, standard: Star, pro: Rocket, premium: Crown, ultimate: Gift, custom: Zap }

export default function PaymentModal({ pkg, onClose }) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  const IconComp = PACKAGE_ICONS[pkg?.id] || Zap
  const CARD_NUMBER = "8600 9999 9999 9999" // Sizning real kartangiz (uzbek/humo)
  const CARD_NAME = "BOBURBEK"
  const ADMIN_TG = "@BoburMentor_Admin"
  const ADMIN_PHONE = "+998 90 123 45 67"

  useEffect(() => setMounted(true), [])

  const handleCopy = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ''))
    setCopied(true)
    toast.success("Karta raqami nusxalandi!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Avval tizimga kiring!')
      return
    }

    setIsSubmitting(true)
    try {
      const priceRaw = typeof pkg.price === 'string' ? parseInt(pkg.price.replace(/\D/g, '')) : pkg.price;

      const { error } = await supabase.from('coin_requests').insert({
        user_id: user.id,
        package_coins: pkg.coins,
        package_price: priceRaw
      })

      if (error) throw error

      toast.success(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <strong style={{ fontSize: '15px' }}>So'rov muvaffaqiyatli yuborildi!</strong>
          <span style={{ fontSize: '13px', opacity: 0.9 }}>Admin tasdiqlashi bilan 30 daqiqa ichida coinlar hisobingizga tushadi.</span>
        </div>,
        { duration: 6000 }
      )
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {pkg && (
        <>
          {/* Backdrop */}
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             transition={{ duration: 0.25 }} onClick={!isSubmitting ? onClose : undefined}
             style={{
               position: 'fixed', inset: 0, zIndex: 20000,
               background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
             }}
          />

          {/* Bottom Sheet Modal */}
          <motion.div
             initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
             transition={{ type: 'spring', stiffness: 340, damping: 34 }}
             style={{
               position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20001,
               maxWidth: 540, margin: '0 auto', background: '#FFFFFF',
               borderTopLeftRadius: 32, borderTopRightRadius: 32,
               boxShadow: '0 -24px 80px rgba(15,23,42,0.15)',
               padding: '0 0 32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
             }}
          >
             {/* Handle */}
             <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
               <div style={{ width: 36, height: 4, borderRadius: 99, background: 'rgba(15,23,42,0.12)' }} />
             </div>

             {/* Header */}
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px 0' }}>
               <h2 className="outfit-font" style={{ margin: 0, fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                 Coin sotib olish
               </h2>
               <button
                 onClick={!isSubmitting ? onClose : undefined}
                 style={{
                   width: 36, height: 36, borderRadius: '50%', background: 'rgba(15,23,42,0.06)', border: 'none',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                 }}
               >
                 <X size={18} color="#475569" strokeWidth={2.5} />
               </button>
             </div>

             <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
                
                {/* 1. Package Info */}
                <div style={{ padding: '16px 20px', borderRadius: 20, background: 'rgba(241, 245, 249, 0.7)', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: pkg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconComp size={22} color={pkg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>{pkg.name} Paket</p>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>{pkg.coins.toLocaleString()} coin olish uchun</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p className="outfit-font" style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#0F172A', letterSpacing: '-0.03em' }}>
                      {pkg.price} <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 600 }}>so'm</span>
                    </p>
                  </div>
                </div>

                {/* 2. Instruction & Card Details */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A' }}>1. To'lovni amalga oshiring</p>
                  <p style={{ margin: '0 0 16px', fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>
                    Quyidagi karta raqamiga belgilangan summani <b>({pkg.price} so'm)</b> o'tkazing. Ulanishni tekshirish uchun o'z ma'lumotlaringizni to'ldirishingiz kerak bo'ladi.
                  </p>

                  <div style={{ 
                    background: 'linear-gradient(135deg, #1E293B, #0F172A)', 
                    borderRadius: 20, padding: 20, color: 'white', position: 'relative', overflow: 'hidden',
                    boxShadow: '0 12px 24px rgba(15,23,42,0.15)'
                  }}>
                    {/* Visual Card Elements */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -20, right: 20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
                    
                    <p style={{ margin: '0 0 16px', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', color: '#94A3B8', textTransform: 'uppercase' }}>Bank Kartasi</p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <p className="outfit-font" style={{ margin: 0, fontSize: '1.375rem', fontWeight: 800, letterSpacing: '0.05em' }}>{CARD_NUMBER}</p>
                      <button 
                        onClick={handleCopy}
                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'white', transition: 'all 0.2s' }}
                      >
                       {copied ? <CheckCircle2 size={18} color="#10B981" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{CARD_NAME}</p>
                  </div>
                </div>

                {/* 3. Admin Contact Info */}
                <div>
                  <p style={{ margin: '0 0 12px', fontSize: '0.9375rem', fontWeight: 600, color: '#0F172A' }}>2. Chekni (skrinshot) adminga yuboring</p>
                  
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 16 }}>
                    <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                      To'lov qilinganidan so'ng, tasdiqlash uchun kvitansiya nusxasini Telegram orqali adminga jo'nating.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Telegram:</span>
                        <a href={`https://t.me/${ADMIN_TG.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.9375rem', color: '#3461FF', fontWeight: 700, textDecoration: 'none' }}>
                          {ADMIN_TG}
                        </a>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Telefon:</span>
                        <a href={`tel:${ADMIN_PHONE.replace(/\s/g, '')}`} style={{ fontSize: '0.9375rem', color: '#0F172A', fontWeight: 700, textDecoration: 'none' }}>
                          {ADMIN_PHONE}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning note */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 16px', borderRadius: 14, marginTop: 24 }}>
                  <AlertCircle size={18} color="#D97706" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#B45309', fontWeight: 500, lineHeight: 1.5 }}>
                    Siz kvitansiyani yuborib pastdagi tugmani bosganingizdan keyin admin sizaning so'rovingizni tekshirib tasdiqlaydi. Yolg'on so'rov bermang.
                  </p>
                </div>

             </div>

             {/* Footer Actions */}
             <div style={{ padding: '0 24px', flexShrink: 0 }}>
               <button
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 style={{
                   width: '100%', height: 54, borderRadius: 16, border: 'none',
                   background: isSubmitting ? '#94A3B8' : '#3461FF',
                   color: 'white', fontWeight: 800, fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                   boxShadow: isSubmitting ? 'none' : '0 8px 24px rgba(52,97,255,0.3)',
                   transition: 'all 0.2s', padding: 0
                 }}
               >
                 {isSubmitting ? "Yuborilmoqda..." : "To'lov qildim (Chekni Adminga yubordim)"}
               </button>
             </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
