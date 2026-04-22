import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTelegram } from '../context/TelegramProvider'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

// ─── Inline SVG Icons ─────────────────────────────────────────
const IconMail   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polyline points="2,4 12,13 22,4"/></svg>
const IconLock   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEye    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconEyeOff = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
const IconArrow  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
const IconBack   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconGoogle = () => <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
const IconTelegram = ({ size = 24 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-15.779l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.198-.054-.308-.346-.11l-6.4 4.024-2.76-.86c-.6-.188-.61-.6.126-.89l10.81-4.167c.5-.188.948.118.828.814z"/></svg>
const Logo       = ({ size = 32 }) => <img src="/logo.svg" alt="BMA" width={size} height={size} style={{ objectFit: 'contain' }} />

// ─── Shared Input Field ────────────────────────────────────────
function Field({ icon: Icon, type: baseType, label, placeholder, value, onChange, required, minLength }) {
  const [focused, setFocused] = useState(false)
  const [show, setShow]       = useState(false)
  const isPw = baseType === 'password'
  const type = isPw ? (show ? 'text' : 'password') : baseType
  return (
    <div>
      {label && <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#334155', marginBottom: 7, letterSpacing: '-0.01em' }}>{label}</label>}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, height: 52, padding: '0 16px', borderRadius: 16,
        border: `1.5px solid ${focused ? '#3461FF' : 'rgba(15,23,42,0.1)'}`,
        background: focused ? 'rgba(52,97,255,0.03)' : 'rgba(255,255,255,0.9)',
        boxShadow: focused ? '0 0 0 3px rgba(52,97,255,0.1), 0 2px 8px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.04)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.2s cubic-bezier(0.22,1,0.36,1)',
      }}>
        <span style={{ color: focused ? '#3461FF' : '#94A3B8', display: 'flex', flexShrink: 0, transition: 'color 0.2s' }}><Icon /></span>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          required={required} minLength={minLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', color: '#0F172A', fontFamily: 'inherit', WebkitAppearance: 'none' }}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(s => !s)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 4, flexShrink: 0, borderRadius: 8 }}>
            {show ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Telegram Primary CTA ─────────────────────────────────────
function TelegramBtn({ label, onSuccess }) {
  const { tgUser, isTelegram } = useTelegram()
  const { signInWithTelegram } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState('idle')

  const handle = async () => {
    if (!isTelegram || !tgUser) {
      window.open('https://t.me/' + (import.meta.env.VITE_TG_BOT_USERNAME || ''), '_blank')
      return
    }
    setState('loading')
    const { error } = await signInWithTelegram(tgUser)
    if (error) { toast.error('Xatolik yuz berdi'); setState('idle') }
    else navigate('/dashboard')
  }

  return (
    <motion.button type="button" onClick={handle} disabled={state === 'loading'}
      whileHover={{ scale: 1.015, y: -1 }} whileTap={{ scale: 0.97 }}
      style={{
        width: '100%', padding: '17px 22px', borderRadius: 20, border: 'none',
        background: 'linear-gradient(135deg, #229ED9 0%, #0B6FAD 100%)',
        color: 'white', fontWeight: 800, fontSize: '1.0625rem',
        fontFamily: 'inherit', cursor: state === 'loading' ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(34,158,217,0.38), 0 2px 8px rgba(34,158,217,0.2)',
        opacity: state === 'loading' ? 0.85 : 1, position: 'relative', overflow: 'hidden',
        letterSpacing: '-0.01em',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)', transform: 'skewX(-20deg)', animation: 'tgShine 2.8s infinite' }} />
      {state === 'loading'
        ? <div style={{ width: 22, height: 22, border: '3px solid rgba(255,255,255,0.35)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        : <>
            <IconTelegram size={24} />
            {isTelegram ? label : "Telegram orqali tizimga kirish"}
          </>
      }
    </motion.button>
  )
}

// ─── Google Button ─────────────────────────────────────────────
function GoogleBtn({ onClick }) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.97 }}
      style={{
        width: '100%', padding: '14px 20px', borderRadius: 16,
        border: '1.5px solid rgba(15,23,42,0.1)',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        color: '#0F172A', fontWeight: 600, fontSize: '0.9375rem',
        fontFamily: 'inherit', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'white'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
    >
      <IconGoogle /> Gmail orqali kirish
    </motion.button>
  )
}

// ─── Divider ──────────────────────────────────────────────────
function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(15,23,42,0.08)' }} />
      <span style={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>yoki email bilan</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(15,23,42,0.08)' }} />
    </div>
  )
}

// ════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const redirectTo = location.state?.from || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) toast.error('Email yoki parol xato.')
    else navigate(redirectTo, { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes tgShine  { 0%{ left:-100%; } 100%{ left:200%; } }
        @keyframes loginOrb { 0%,100%{transform:translateY(0) scale(1);opacity:.5} 50%{transform:translateY(-24px) scale(1.08);opacity:.7} }
      `}</style>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(145deg, #0F172A 0%, #1e3a8a 55%, #172554 100%)',
        position: 'sticky', top: 0, zIndex: 0, overflow: 'hidden',
        padding: '48px 24px 120px',
        borderRadius: '0 0 40px 40px',
        marginBottom: '-80px',
        boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
      }}>
        {/* Ambient orbs */}
        <div style={{ position:'absolute', top:-60, right:-40, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(34,158,217,0.2) 0%,transparent 70%)', filter:'blur(40px)', animation:'loginOrb 14s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle,rgba(52,97,255,0.18) 0%,transparent 65%)', filter:'blur(40px)', animation:'loginOrb 18s ease-in-out infinite reverse', pointerEvents:'none' }} />

        <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Top nav: Logo + Back */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Logo size={24} />
              </div>
              <span className="outfit-font" style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Bobur Mentor</span>
            </Link>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', fontWeight: 600,
              textDecoration: 'none', padding: '8px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              transition: 'all 0.2s',
            }}>
              <IconBack /> Orqaga
            </Link>
          </div>

          {/* Hero text */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(34,158,217,0.2)', border: '1px solid rgba(34,158,217,0.35)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
            <span style={{ display: 'flex', color: '#7DD3FC' }}><IconTelegram size={14} /></span>
            <span style={{ color: '#7DD3FC', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Telegram bilan darhol kiring</span>
          </div>
          <h1 className="outfit-font" style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 10 }}>
            Xush kelibsiz!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 }}>
            Darslarni davom ettirish uchun hisobingizga kiring
          </p>
        </div>
      </div>

      {/* ── GLASS CARD ── */}
      <div style={{ maxWidth: 480, width: '100%', margin: '0 auto', padding: '0 16px 60px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="card-glow-hover"
          style={{ borderRadius: 28, padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          {/* Telegram — Hero */}
          <TelegramBtn label="Telegram orqali kirish" />

          {/* Google */}
          <GoogleBtn onClick={signInWithGoogle} />

          <Divider />

          {/* Email form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Field icon={IconMail} type="email" label="Email manzil" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Field icon={IconLock} type="password" label="Parol" placeholder="Parolingizni kiriting" value={password} onChange={e => setPassword(e.target.value)} required />
            <motion.button type="submit" disabled={loading} whileTap={!loading ? { scale: 0.97 } : {}}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 16, border: 'none',
                background: loading ? '#94A3B8' : 'linear-gradient(135deg,#3461FF,#214CE5)',
                color: 'white', fontWeight: 700, fontSize: '1rem', fontFamily: 'inherit',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 4px 18px rgba(52,97,255,0.32)',
              }}
            >
              {loading
                ? <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                : <>Kirish <IconArrow /></>}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', color: '#64748B', fontSize: '0.9375rem', margin: 0 }}>
            Hisob yo'qmi?{' '}
            <Link to="/signup" style={{ color: '#3461FF', fontWeight: 700, textDecoration: 'none' }}>Ro'yxatdan o'tish</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
