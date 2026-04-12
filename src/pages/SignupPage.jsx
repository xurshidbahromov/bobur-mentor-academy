import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

// ─── Icons ────────────────────────────────────────────────────
const IconMail    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
const IconLock    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEye     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconEyeOff  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const IconArrow   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconTelegram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.08 9.8c-.156.7-.566.87-1.146.54l-3.163-2.33-1.527 1.47c-.17.17-.313.313-.64.313l.228-3.238 5.9-5.328c.257-.228-.056-.356-.397-.127L7.1 14.47l-3.11-.97c-.676-.21-.69-.676.142-.998l12.155-4.686c.562-.204 1.053.137.875.432z"/></svg>
const IconGoogle  = () => <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
const IconCheckCircle = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>

// ─── Telegram Button ──────────────────────────────────────────
function TelegramBtn({ label }) {
  const { tgUser, isTelegram } = useTelegram()
  const { signInWithTelegram } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState('idle') // idle | loading | error

  const handleClick = async () => {
    if (!isTelegram || !tgUser) {
      // Open bot in Telegram
      window.open('https://t.me/' + (import.meta.env.VITE_TG_BOT_USERNAME || ''), '_blank')
      return
    }
    setState('loading')
    const { error } = await signInWithTelegram(tgUser)
      if (error) {
        toast.error("Xatolik yuz berdi")
        setState('idle')
      } else {
      navigate('/dashboard')
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading'}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        width: '100%', padding: '14px 20px', borderRadius: 16, border: 'none',
        background: state === 'error'
          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
          : 'linear-gradient(135deg, #229ED9 0%, #1880B8 100%)',
        color: 'white', fontWeight: 700, fontSize: '0.9375rem',
        fontFamily: 'inherit', cursor: state === 'loading' ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: '0 4px 18px rgba(34,158,217,0.32)',
        opacity: state === 'loading' ? 0.8 : 1,
      }}
    >
      {state === 'loading' ? (
        <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Yuklanmoqda...</>
      ) : state === 'error' ? (
        <><IconTelegram /> Xatolik yuz berdi</>
      ) : (
        <><IconTelegram /> {label}</>
      )}
    </motion.button>
  )
}


const Logo = ({ size = 36 }) => (
  <img src="/logo.svg" alt="Bobur Mentor" width={size} height={size} style={{ objectFit: 'contain' }} />
)

// ─── Field ────────────────────────────────────────────────────
function Field({ icon: Icon, type: baseType, label, placeholder, value, onChange, required, minLength }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  const isPw = baseType === 'password'
  const type = isPw ? (show ? 'text' : 'password') : baseType

  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        height: 52, padding: '0 16px', borderRadius: 16,
        border: `1.5px solid ${focused ? '#3461FF' : 'rgba(100,120,255,0.18)'}`,
        background: focused ? 'rgba(52,97,255,0.025)' : 'rgba(255,255,255,0.95)',
        boxShadow: focused ? '0 0 0 3px rgba(52,97,255,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}>
        <span style={{ color: focused ? '#3461FF' : '#94A3B8', display: 'flex', flexShrink: 0 }}><Icon /></span>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          required={required} minLength={minLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: '#0F172A', fontFamily: 'inherit', borderRadius: 0, WebkitAppearance: 'none' }}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4, flexShrink: 0 }}>
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Brand Panel (Signup version) ────────────────────────────
const PERKS = [
  "1,000 dan ortiq faol o'quvchilar",
  "DTM me'yori asosida qurilgan darslar",
  'Gamification: coin va mukofot tizimi',
  "Telegram orqali bir marta bosib kirish",
]

function BrandPanelSignup() {
  return (
    <div style={{
      width: '460px', flexShrink: 0,
      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)',
      padding: '44px 52px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 65%)', filter: 'blur(40px)', animation: 'floatOrb 15s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.3) 0%, transparent 60%)', filter: 'blur(40px)', animation: 'floatOrbReverse 18s ease-in-out infinite', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={28} />
        </div>
        <span className="outfit-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Bobur Mentor</span>
      </Link>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Nima uchun biz
        </div>
        <h2 style={{ fontSize: 'clamp(1.375rem, 2.2vw, 1.875rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 32 }}>
          O'zbekistonning eng sifatli matematika platformasi
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {PERKS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(52,97,255,0.35)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem', fontWeight: 500 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// SIGNUP PAGE
// ════════════════════════════════════════════════════════════════
export default function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)

  // Confetti + auto-redirect on success
  useEffect(() => {
    if (!success) return

    // 🎉 First burst — center
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { x: 0.5, y: 0.55 },
      colors: ['#3461FF', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'],
      scalar: 1.1,
    })

    // 🎉 Second burst — sides
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#3461FF', '#8B5CF6', '#FBBF24'] })
      confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#10B981', '#EC4899', '#F97316'] })
    }, 350)

    // Auto-redirect to login after 3.5s
    const timer = setTimeout(() => navigate('/login'), 3500)
    return () => clearTimeout(timer)
  }, [success, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp({ email, password })
    setLoading(false)
    if (error) toast.error("Bu email allaqachon ro'yxatdan o'tgan yoki server xatosi.")
    else setSuccess(true)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#EEF2FF' }}>
      <style>{`
        @media (max-width: 860px) { .auth-panel-su { display: none !important; } .auth-logo-su { display: flex !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* LEFT BRAND */}
      <div className="auth-panel-su" style={{ display: 'flex' }}>
        <BrandPanelSignup />
      </div>

      {/* RIGHT FORM */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>

        {/* Mobile logo */}
        <div className="auth-logo-su" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <Logo size={36} />
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Bobur Mentor</span>
        </div>

        {/* Back to home */}
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#3461FF', fontSize: '0.9375rem', fontWeight: 700,
            textDecoration: 'none', marginBottom: 40,
            padding: '10px 22px', borderRadius: 100,
            background: 'rgba(52,97,255,0.08)',
            border: '1.5px solid rgba(52,97,255,0.2)',
            boxShadow: '0 2px 10px rgba(52,97,255,0.08)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(52,97,255,0.14)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(52,97,255,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(52,97,255,0.08)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(52,97,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Bosh sahifaga
        </Link>

        <div style={{ width: '100%', maxWidth: 400 }}>
          <AnimatePresence mode="wait">
            {success ? (
              /* ── SUCCESS STATE ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ textAlign: 'center', padding: '20px 0' }}
              >
                {/* Animated check circle */}
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 18 }}
                  style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}
                >
                  <IconCheckCircle />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.035em', marginBottom: 10 }}>
                    Tabriklaymiz!
                  </h2>
                  <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: 10 }}>
                    <strong style={{ color: '#0F172A' }}>{email}</strong> manziliga tasdiqlash xati yuborildi.
                  </p>
                  <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: 32 }}>
                    Kirish sahifasiga yo'naltirilmoqda...
                  </p>

                  {/* Progress bar */}
                  <div style={{ height: 3, borderRadius: 2, background: 'rgba(52,97,255,0.1)', overflow: 'hidden', marginBottom: 24 }}>
                    <motion.div
                      initial={{ width: '0%' }} animate={{ width: '100%' }}
                      transition={{ duration: 3.5, ease: 'linear' }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #10B981, #3461FF)', borderRadius: 2 }}
                    />
                  </div>

                  <Link to="/login" style={{ textDecoration: 'none', display: 'block' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      style={{ width: '100%', padding: '14px 20px', borderRadius: 16, border: '1.5px solid rgba(52,97,255,0.2)', background: 'white', color: '#3461FF', fontWeight: 700, fontSize: '0.9375rem', fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                    >
                      Hoziroq kirish sahifasiga o'tish
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              /* ── SIGNUP FORM ── */
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div style={{ marginBottom: 36 }}>
                  <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: 8 }}>
                    Hisob yaratish
                  </h1>
                  <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Platformaga qo'shilish bepul va bir necha soniyada amalga oshadi
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Google button */}
                  <motion.button
                    type="button"
                    onClick={signInWithGoogle}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: 16,
                      border: '1.5px solid rgba(100,120,255,0.2)',
                      background: 'white', color: '#0F172A',
                      fontWeight: 600, fontSize: '0.9375rem',
                      fontFamily: 'inherit', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    <IconGoogle /> Gmail orqali ro'yxatdan o'tish
                  </motion.button>

                  {/* Telegram */}
                  <TelegramBtn label="Telegram orqali ro'yxatdan o'tish" />

                  {/* Divider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(100,120,255,0.15)' }} />
                    <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>yoki email orqali</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(100,120,255,0.15)' }} />
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field icon={IconMail} type="email" label="Email manzil" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    <Field icon={IconLock} type="password" label="Parol (kamida 6 belgi)" placeholder="Yangi parol kiriting" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />

                    <motion.button
                      type="submit" disabled={loading}
                      whileTap={!loading ? { scale: 0.96 } : {}}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      style={{
                        width: '100%', padding: '15px 20px', borderRadius: 16, border: 'none',
                        background: loading ? '#94A3B8' : 'linear-gradient(135deg, #3461FF 0%, #214CE5 100%)',
                        color: 'white', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: loading ? 'none' : '0 4px 18px rgba(52,97,255,0.32)', marginTop: 4,
                      }}
                    >
                      {loading
                        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        : <>Ro'yxatdan o'tish <IconArrow /></>
                      }
                    </motion.button>
                  </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: 28, color: '#64748B', fontSize: '0.9375rem' }}>
                  Allaqachon hisobingiz bormi?{' '}
                  <Link to="/login" style={{ color: '#3461FF', fontWeight: 700, textDecoration: 'none' }}>Kirish</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
