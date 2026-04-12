import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

// ─── Icons ────────────────────────────────────────────────────
const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><polyline points="2,4 12,13 22,4" /></svg>
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
const IconEye = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
const IconEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
const IconArrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
const IconTelegram = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.08 9.8c-.156.7-.566.87-1.146.54l-3.163-2.33-1.527 1.47c-.17.17-.313.313-.64.313l.228-3.238 5.9-5.328c.257-.228-.056-.356-.397-.127L7.1 14.47l-3.11-.97c-.676-.21-.69-.676.142-.998l12.155-4.686c.562-.204 1.053.137.875.432z" /></svg>
const IconGoogle = () => <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>

// Logo
const Logo = ({ size = 36 }) => (
  <img src="/logo.svg" alt="Bobur Mentor" width={size} height={size} style={{ objectFit: 'contain' }} />
)

// ─── Input Field ──────────────────────────────────────────────
function Field({ icon: Icon, type: baseType, label, placeholder, value, onChange, required, minLength }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow] = useState(false)
  const isPw = baseType === 'password'
  const type = isPw ? (show ? 'text' : 'password') : baseType

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: 8 }}>
          {label}
        </label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        height: 52, padding: '0 16px', borderRadius: 16,
        border: `1.5px solid ${focused ? '#3461FF' : 'rgba(100,120,255,0.18)'}`,
        background: focused ? 'rgba(52,97,255,0.025)' : 'rgba(255,255,255,0.95)',
        boxShadow: focused ? '0 0 0 3px rgba(52,97,255,0.1)' : '0 2px 6px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
      }}>
        <span style={{ color: focused ? '#3461FF' : '#94A3B8', display: 'flex', flexShrink: 0 }}><Icon /></span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: '#0F172A', fontFamily: 'inherit', borderRadius: 0, WebkitAppearance: 'none' }}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4, borderRadius: 8, flexShrink: 0 }}>
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Brand Panel ──────────────────────────────────────────────
function BrandPanel() {
  return (
    <div style={{
      width: '460px', flexShrink: 0,
      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)',
      padding: '44px 52px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: '-100px', right: '-80px', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.4) 0%, transparent 65%)', filter: 'blur(40px)', animation: 'floatOrb 15s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-60px', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 60%)', filter: 'blur(40px)', animation: 'floatOrbReverse 18s ease-in-out infinite', pointerEvents: 'none' }} />

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Logo size={28} />
        </div>
        <span className="outfit-font" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Bobur Mentor</span>
      </Link>

      {/* Quote */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          Mentor so'zi
        </div>
        <blockquote style={{ fontSize: 'clamp(1.25rem, 2vw, 1.625rem)', fontWeight: 700, color: 'white', lineHeight: 1.3, letterSpacing: '-0.025em', marginBottom: 24 }}>
          "Matematikani sevishni o'rgataman, natijalarni siz ko'rasiz."
        </blockquote>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}>
            <img src="/person.jpeg" alt="Bobur Mentor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>Bobur Mentor</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem' }}>Asoschi va bosh o'qituvchi</div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div style={{ width: '100%' }}>
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={state === 'loading'}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%', padding: '16px 20px', borderRadius: 20, border: 'none',
          background: state === 'error'
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #229ED9 0%, #1880B8 100%)',
          color: 'white', fontWeight: 800, fontSize: '1rem',
          fontFamily: 'inherit', cursor: state === 'loading' ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          boxShadow: '0 8px 24px rgba(34,158,217,0.3)',
          opacity: state === 'loading' ? 0.8 : 1,
          position: 'relative'
        }}
      >
        {state === 'loading' ? (
          <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        ) : state === 'error' ? (
          <>Xatolik yuz berdi</>
        ) : (
          <>
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="tg" style={{ width: 22, height: 22, filter: 'brightness(0) invert(1)' }} />
            {isTelegram ? "Telegram orqali kirish" : "Telegram orqali bog'lanish"}
          </>
        )}
      </motion.button>
      
      {isTelegram && (
        <p style={{ marginTop: 12, fontSize: '0.75rem', color: '#64748B', textAlign: 'center', lineHeight: 1.4 }}>
          Bir marta kirganingizdan so'ng, tizim sizni eslab qoladi va keyingi safar avtomatik profilingizga olib kiradi. ✨
        </p>
      )}
    </div>
  )
}


// ─── Divider ──────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(100,120,255,0.15)' }} />
      <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>yoki email orqali</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(100,120,255,0.15)' }} />
    </div>
  )
}

// ─── Submit Button ────────────────────────────────────────────
function SubmitBtn({ loading, label }) {
  return (
    <motion.button
      type="submit"
      disabled={loading}
      whileTap={!loading ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        width: '100%', padding: '15px 20px', borderRadius: 16, border: 'none',
        background: loading ? '#94A3B8' : 'linear-gradient(135deg, #3461FF 0%, #214CE5 100%)',
        color: 'white', fontWeight: 700, fontSize: '1rem',
        fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: loading ? 'none' : '0 4px 18px rgba(52,97,255,0.32)',
        marginTop: 4,
      }}
    >
      {loading
        ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        : <>{label} <IconArrow /></>
      }
    </motion.button>
  )
}

// ════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const redirectTo = location.state?.from || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) toast.error("Email yoki parol xato.")
    else navigate(redirectTo, { replace: true })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#EEF2FF' }}>
      <style>{`
        @media (max-width: 860px) { .auth-panel { display: none !important; } .auth-mobile-logo { display: flex !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* LEFT BRAND PANEL */}
      <div className="auth-panel" style={{ display: 'flex' }}>
        <BrandPanel />
      </div>

      {/* RIGHT FORM */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>

        {/* Mobile logo */}
        <div className="auth-mobile-logo" style={{ display: 'none', alignItems: 'center', gap: 10, marginBottom: 40 }}>
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

        <motion.div
          key="login-form"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: 8 }}>
              Tizimga kirish
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9375rem', lineHeight: 1.5 }}>
              Darslarni davom ettirish uchun hisobingizga kiring
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Google button */}
            <motion.button
              type="button"
              onClick={signInWithGoogle}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
              <IconGoogle /> Gmail orqali kirish
            </motion.button>

            {/* Telegram button */}
            <TelegramBtn label="Telegram orqali kirish" />
            <Divider />

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field icon={IconMail} type="email" label="Email manzil" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <Field icon={IconLock} type="password" label="Parol" placeholder="Parolingizni kiriting" value={password} onChange={e => setPassword(e.target.value)} required />
              <SubmitBtn loading={loading} label="Kirish" />
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 28, color: '#64748B', fontSize: '0.9375rem' }}>
            Hisobingiz yo'qmi?{' '}
            <Link to="/signup" style={{ color: '#3461FF', fontWeight: 700, textDecoration: 'none' }}>
              Ro'yxatdan o'tish
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
