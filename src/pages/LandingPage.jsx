// src/pages/LandingPage.jsx
// Public landing — platformaga kiruvchi hamma uchun.
// Ma'lumotlar: kurslar haqida, qanday ishlaydi, statistika, CTA.
// Profil / coin tugmalari yo'q — faqat "Kirish" va "Boshlash".

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Award, GraduationCap, CheckCircle, Coins, Users, Zap, Lock } from 'lucide-react'

// ── Fade-up animation variant ──
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] } })
}

// ══════════════════════════════════════════════════════
// KURS KARTALARI
// ══════════════════════════════════════════════════════
const COURSES = [
  {
    icon: <GraduationCap size={28} />,
    color: '#3461FF',
    bg: 'rgba(52,97,255,0.08)',
    title: "Imtihonga Tayyorlov",
    subtitle: "Majburiy fanlar (DTM, SAT)",
    desc: "O'zbek matematika imtihonlariga stratejik tayyorgarlik — teoriya + yuzlab test savollari bilan.",
    lessons: 120,
    quizzes: 600,
  },
  {
    icon: <Award size={28} />,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.08)',
    title: "Sertifikat Kurslari",
    subtitle: "Tan olingan bilim tasdiqlash",
    desc: "Tugallangandan so'ng rasmiy sertifikat beruvchi chuqurlashtirilgan matematik kurs.",
    lessons: 80,
    quizzes: 400,
  },
  {
    icon: <BookOpen size={28} />,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    title: "Asosiy Matematika",
    subtitle: "Poydevor bilimlar",
    desc: "Maktab dasturidan tortib olimpiada va universitetgacha bo'lgan barcha asosiy mavzular.",
    lessons: 60,
    quizzes: 300,
  },
]

// ══════════════════════════════════════════════════════
// QADAMLAR
// ══════════════════════════════════════════════════════
const STEPS = [
  { n: "01", label: "Ro'yxatdan o'ting", desc: "30 soniya ichida hisob yarating — email yoki Telegram orqali." },
  { n: "02", label: "Kursni tanlang", desc: "Maqsadingizga mos kursni tanlang: imtihon, sertifikat yoki asosiy." },
  { n: "03", label: "O'rganing va o'sing", desc: "Video darslar ko'ring, quizlarni yeching va coinlar to'plang." },
]

// ══════════════════════════════════════════════════════
// STATISTIKA
// ══════════════════════════════════════════════════════
const STATS = [
  { value: "2,400+", label: "Faol O'quvchi" },
  { value: "260+",   label: "Video Dars" },
  { value: "1,300+", label: "Test Savoli" },
  { value: "98%",    label: "Muvaffaqiyat darajasi" },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh' }}>

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section style={{
        minHeight: '92vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(52,97,255,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(52,97,255,0.08)', border: '1px solid rgba(52,97,255,0.15)',
              borderRadius: 100, padding: '6px 16px', marginBottom: 28,
            }}>
              <Zap size={14} color="#3461FF" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#3461FF' }}>
                O'zbek tilidagi premium matematika platformasi
              </span>
            </div>
          </motion.div>

          <motion.h1 initial="hidden" animate="show" variants={fadeUp} custom={1}
            style={{ fontSize: 'clamp(2.5rem, 7vw, 4.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', color: '#0F172A', margin: '0 0 24px' }}
          >
            Matematikani<br />
            <span style={{ background: 'linear-gradient(135deg, #3461FF, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ustozlar bilan
            </span>{' '}o'rgan
          </motion.h1>

          <motion.p initial="hidden" animate="show" variants={fadeUp} custom={2}
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#64748B', lineHeight: 1.65, margin: '0 auto 40px', maxWidth: 540 }}
          >
            Imtihonga tayyorlov, sertifikat kurslari va asosiy matematik bilimlar — barchasi bitta platformada.
          </motion.p>

          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <Link to="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'linear-gradient(135deg, #3461FF, #214CE5)',
              color: 'white', fontWeight: 700, fontSize: '1.0625rem',
              padding: '15px 32px', borderRadius: 16, textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(52,97,255,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(52,97,255,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(52,97,255,0.35)' }}
            >
              Bepul Boshlash <ArrowRight size={20} />
            </Link>
            <Link to="/about" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'white', color: '#334155', fontWeight: 600, fontSize: '1.0625rem',
              padding: '15px 32px', borderRadius: 16, textDecoration: 'none',
              border: '1.5px solid rgba(100,120,255,0.15)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              Biz haqimizda
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────── STATS ─────────────────────── */}
      <section style={{ background: 'white', padding: '48px 20px', borderTop: '1px solid rgba(100,120,255,0.08)', borderBottom: '1px solid rgba(100,120,255,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500, marginTop: 6 }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────────────────────── KURSLAR ──────────────────── */}
      <section style={{ padding: '80px 20px', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', color: '#3461FF', textTransform: 'uppercase', marginBottom: 14 }}>Kurslar</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0F172A', margin: '0 0 16px' }}>
            Maqsadingizga mos kursni tanlang
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', maxWidth: 480, margin: '0 auto' }}>
            Har bir kurs bosqichma-bosqich video darslar va quizlar bilan ta'minlangan.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {COURSES.map((c, i) => (
            <motion.div key={c.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} custom={i * 0.5}
              style={{
                background: 'white',
                borderRadius: 24,
                padding: 28,
                border: '1.5px solid rgba(100,120,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, background: c.bg, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                {c.icon}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{c.subtitle}</div>
              <h3 style={{ margin: '0 0 12px', fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0F172A' }}>{c.title}</h3>
              <p style={{ margin: '0 0 24px', color: '#64748B', lineHeight: 1.6, fontSize: '0.9375rem', flex: 1 }}>{c.desc}</p>
              <div style={{ display: 'flex', gap: 16, paddingTop: 20, borderTop: '1px solid rgba(100,120,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: '0.875rem' }}>
                  <BookOpen size={15} color={c.color} />
                  <span><strong style={{ color: '#0F172A' }}>{c.lessons}</strong> dars</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: '0.875rem' }}>
                  <CheckCircle size={15} color={c.color} />
                  <span><strong style={{ color: '#0F172A' }}>{c.quizzes}</strong> test</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─────────────────── QANDAY ISHLAYDI ──────────────── */}
      <section style={{ background: 'white', padding: '80px 20px', borderTop: '1px solid rgba(100,120,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp} style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', color: '#3461FF', textTransform: 'uppercase', marginBottom: 14 }}>Jarayon</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#0F172A', margin: 0 }}>
              3 qadam bilan boshlang
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {STEPS.map((step, i) => (
              <motion.div key={step.n} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={fadeUp} custom={i * 0.5}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div style={{ fontWeight: 900, fontSize: '3rem', color: 'rgba(52,97,255,0.12)', letterSpacing: '-0.05em', lineHeight: 1 }}>{step.n}</div>
                <div>
                  <h3 style={{ margin: '0 0 8px', fontWeight: 800, fontSize: '1.1875rem', color: '#0F172A', letterSpacing: '-0.02em' }}>{step.label}</h3>
                  <p style={{ margin: 0, color: '#64748B', lineHeight: 1.6, fontSize: '0.9375rem' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────── COIN TIZIMI ─────────────────── */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}
            style={{
              background: 'linear-gradient(135deg, #0F172A 60%, #1E293B)',
              borderRadius: 28, padding: 'clamp(32px, 6vw, 56px)',
              display: 'flex', flexDirection: 'column', gap: 24,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Background decoration */}
            <div style={{ position: 'absolute', right: -60, top: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Coins size={26} color="#F59E0B" />
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px', fontWeight: 900, fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', color: 'white', letterSpacing: '-0.03em' }}>Coin tizimi bilan o'rganing</h2>
                <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9375rem' }}>Darslar ko'ring, quizlar yeching, coin to'plang va qulfli darslarni oching.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { icon: <BookOpen size={18} color="#F59E0B" />, text: "Har bir dars uchun coin yeching" },
                { icon: <CheckCircle size={18} color="#10B981" />, text: "Quizlarni yeching — coin qozonasiz" },
                { icon: <Lock size={18} color="#3461FF" />, text: "Qulfli darslarni coinlar bilan oching" },
              ].map(item => (
                <div key={item.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 18px' }}>
                  {item.icon}
                  <span style={{ color: '#CBD5E1', fontSize: '0.9375rem', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ──────────────────────── CTA ─────────────────────── */}
      <section style={{ padding: '40px 20px 100px', textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={fadeUp}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.035em', color: '#0F172A', margin: '0 0 16px' }}>
            Bugun boshlang — bepul!
          </h2>
          <p style={{ color: '#64748B', fontSize: '1.0625rem', margin: '0 0 36px' }}>
            Kredit karta talab qilinmaydi. 30 soniyada hisob yarating.
          </p>
          <Link to="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, #3461FF, #214CE5)',
            color: 'white', fontWeight: 700, fontSize: '1.125rem',
            padding: '17px 40px', borderRadius: 18, textDecoration: 'none',
            boxShadow: '0 10px 36px rgba(52,97,255,0.35)',
          }}>
            Hozir Boshlash <ArrowRight size={22} />
          </Link>
        </motion.div>
      </section>

    </div>
  )
}
