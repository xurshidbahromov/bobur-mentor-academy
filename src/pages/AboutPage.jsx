import { Link } from 'react-router-dom'
import { ArrowLeft, Award, Clock, Users, CheckCircle2, Shield, TrendingUp, GraduationCap, ArrowRight, Star, Send, ExternalLink } from 'lucide-react'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

// Inline SVG icons for social platforms not in lucide-react
const InstagramIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const YoutubeIcon = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
)

const SOCIAL = [
  {
    icon: <InstagramIcon size={22} />,
    label: 'Instagram',
    handle: '@bobur_mentor',
    href: 'https://instagram.com/bobur_mentor',
    color: '#E1306C',
    bg: 'rgba(225,48,108,0.08)',
  },
  {
    icon: <Send size={22} />,
    label: 'Telegram',
    handle: '@bobur_mentor_uz',
    href: 'https://t.me/bobur_mentor_uz',
    color: '#229ED9',
    bg: 'rgba(34,158,217,0.08)',
  },
  {
    icon: <YoutubeIcon size={22} />,
    label: 'YouTube',
    handle: 'Bobur Mentor',
    href: 'https://youtube.com/@bobur_mentor',
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.08)',
  },
]

export default function AboutPage() {
  const stats = [
    { icon: <Users size={24} />, value: '1,000+', label: "O'quvchilar", color: '#3461FF', bg: 'rgba(52,97,255,0.1)' },
    { icon: <TrendingUp size={24} />, value: '95%', label: "DTM natijalari", color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { icon: <Clock size={24} />, value: '5+ Yil', label: "Tajriba", color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { icon: <Star size={24} />, value: '4.9', label: "O'rtacha baho", color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  ]

  const methodCards = [
    {
      icon: <Shield size={22} />,
      title: 'DTM Standarti',
      desc: "O'zbekiston davlat test markazi qoidalariga asoslangan eng so'nggi tayyorgarlik tizimi.",
      color: '#3461FF', bg: 'rgba(52,97,255,0.1)'
    },
    {
      icon: <CheckCircle2 size={22} />,
      title: 'Zero-to-Hero',
      desc: "Eng soddadan to murakkab olimpiada masalalarigacha zinamapoya kabi olib chiquvchi yondashuv.",
      color: '#10B981', bg: 'rgba(16,185,129,0.1)'
    },
    {
      icon: <Award size={22} />,
      title: 'Sifat Kafolati',
      desc: "Premium vizual materiallar, mustahkamlash quizlari va kuzatuv statistikasi bilan.",
      color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'
    },
    {
      icon: <GraduationCap size={22} />,
      title: 'Shaxsiy Yondashuv',
      desc: "Har bir o'quvchining darajasini inobatga olgan holda individual sur'atda olib borish.",
      color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'
    },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>

      {/* ── HERO BANNER ──────────────────────────── */}
      <div style={{
        background: 'linear-gradient(140deg, #3461FF 0%, #1e3a8a 100%)',
        padding: '120px 24px 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%)', filter: 'blur(10px)' }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(100,200,255,0.15) 0%, transparent 60%)', filter: 'blur(20px)' }} />
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }} className="about-hero-grid">
            <style>{`
              @media (max-width: 768px) { .about-hero-grid { grid-template-columns: 1fr !important; } .about-photo-col { display: none !important; } }
            `}</style>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
                Asoschi & Bosh Mentor
              </div>
              <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '24px', color: 'white' }}>
                Bobur<br />
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>Mentor</span>
              </h1>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65, maxWidth: '520px', marginBottom: '40px' }}>
                Matematika — bu shunchaki raqamlar yig'indisi emas, bu hayotiy qarorlar va mantiqiy fikrlash poydevoridir.
              </p>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg" style={{ background: 'white', color: '#3461FF' }}>
                  Darslarni ko'rish <ArrowRight size={18} />
                </Button>
              </Link>
            </div>

            {/* Photo column */}
            <div className="about-photo-col" style={{ position: 'relative' }}>
              <div style={{
                width: '100%',
                maxWidth: 380,
                aspectRatio: '3/4',
                borderRadius: '32px',
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                marginLeft: 'auto'
              }}>
                <img
                  src="/person.jpeg"
                  alt="Bobur Mentor"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {/* Floating badge */}
              <div style={{
                position: 'absolute', bottom: '-20px', left: '20px',
                background: 'white', borderRadius: '20px',
                padding: '16px 20px', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ width: 44, height: 44, borderRadius: '14px', background: 'rgba(52,97,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={24} color="#3461FF" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>5+ Yil</div>
                  <div style={{ fontSize: '0.8125rem', color: '#8897B4' }}>Professional Tajriba</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BENTO ──────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '-32px auto 80px', padding: '0 24px', position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-grid">
          <style>{`@media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
          {stats.map(({ icon, value, label, color, bg }) => (
            <Card key={label} style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '18px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color }}>
                {icon}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '0.875rem', color: '#8897B4', fontWeight: 500 }}>{label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── STORY SECTION ────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          alignItems: 'center'
        }} className="story-grid">
          <style>{`@media (max-width: 768px) { .story-grid { grid-template-columns: 1fr !important; } }`}</style>

          <div>
            <Badge variant="accent" style={{ marginBottom: '24px' }}>Bizning Maqsad</Badge>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '24px' }}>
              Nega aynan<br />Matematika?
            </h2>
            <p style={{ color: '#4B5E84', fontSize: '1.125rem', lineHeight: 1.75, marginBottom: '20px' }}>
              Loyihamiz orqali minglab o'quvchilarni oliy ta'lim muassasalariga kirishlariga va matematika bilan samimiy do'stlashishlariga yordam berib kelmoqdamiz.
            </p>
            <p style={{ color: '#4B5E84', fontSize: '1.125rem', lineHeight: 1.75 }}>
              Biz zerikarli kitob yodlash mexanizmidan voz kechib, har bir darsni "Zero-to-Hero" strategiyasi asosida miyada 100% fiksatsiya bo'ladigan vizual qismlarga bo'lamiz.
            </p>
          </div>

          {/* Second photo — person2 */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: '28px', overflow: 'hidden', aspectRatio: '4/3', boxShadow: 'var(--shadow-xl)' }}>
              <img
                src="/person2.jpeg"
                alt="Bobur Mentor dars jarayonida"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Floating caption badge */}
            <div style={{
              position: 'absolute', bottom: '-16px', right: '24px',
              background: 'white', borderRadius: '16px',
              padding: '12px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex', alignItems: 'center', gap: '10px',
              border: '1px solid rgba(100,120,255,0.1)'
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#10B981" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.875rem' }}>Jonli dars</div>
                <div style={{ fontSize: '0.75rem', color: '#8897B4' }}>O'quvchilar bilan</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL MEDIA ─────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ marginBottom: '40px' }}>
          <Badge variant="primary" style={{ marginBottom: '16px' }}>Ijtimoiy Tarmoqlar</Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#0F172A', letterSpacing: '-0.03em', fontWeight: 800, marginBottom: '12px' }}>
            Bog'laning
          </h2>
          <p style={{ color: '#4B5E84', fontSize: '1.0625rem', lineHeight: 1.65, maxWidth: '520px' }}>
            Yangi darslar, maslahatlar va jonli efirlar uchun ijtimoiy tarmoqlarda kuzatib boring.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {SOCIAL.map(({ icon, label, handle, href, color, bg }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              className={`social-card-${label.toLowerCase()}`}
            >
              <style>{`
                .social-card-${label.toLowerCase()} > div {
                  transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
                }
                .social-card-${label.toLowerCase()}:hover > div {
                  transform: translateY(-3px);
                  box-shadow: 0 16px 40px rgba(0,0,0,0.1);
                }
              `}</style>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '24px 28px',
                background: 'var(--bg-glass)',
                backdropFilter: 'var(--blur-glass)',
                WebkitBackdropFilter: 'var(--blur-glass)',
                border: '1px solid var(--border-glass)',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-glass)',
                borderLeft: `4px solid ${color}`
              }}>
                <div style={{ width: 52, height: 52, borderRadius: '18px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', marginBottom: '4px' }}>{label}</div>
                  <div style={{ color: '#4B5E84', fontSize: '0.9375rem' }}>{handle}</div>
                </div>
                <ExternalLink size={18} color="#8897B4" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── METHODOLOGY ──────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px', padding: '0 24px' }}>
        <div style={{ marginBottom: '56px' }}>
          <Badge variant="primary" style={{ marginBottom: '16px' }}>Metodika</Badge>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#0F172A', letterSpacing: '-0.03em', fontWeight: 800, marginBottom: '12px' }}>
            O'qitish falsafasi
          </h2>
          <p style={{ color: '#4B5E84', fontSize: '1.125rem', maxWidth: '560px', lineHeight: 1.65 }}>
            Nima uchun platformamiz darslari o'zgacha natija beradi?
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {methodCards.map(({ icon, title, desc, color, bg }) => (
            <Card hover key={title} style={{ padding: '36px', borderTop: `3px solid ${color}` }}>
              <div style={{ width: 48, height: 48, borderRadius: '16px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color }}>
                {icon}
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px', letterSpacing: '-0.01em' }}>{title}</h3>
              <p style={{ color: '#4B5E84', lineHeight: 1.65, fontSize: '0.9375rem' }}>{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(140deg, #3461FF 0%, #1e3a8a 100%)',
          borderRadius: '32px',
          padding: 'clamp(48px, 6vw, 80px) clamp(32px, 5vw, 72px)',
          display: 'flex', flexDirection: 'column', gap: '32px',
          position: 'relative', overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 90% -30%, rgba(255,255,255,0.13) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <Shield size={220} color="white" style={{ position: 'absolute', right: '-50px', bottom: '-60px', opacity: 0.06, transform: 'rotate(15deg)' }} />

          <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: 'white', marginBottom: '16px', lineHeight: 1.1 }}>
              Tajribani o'z ko'zingiz bilan ko'ring
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.65 }}>
              Bugundan boshlab professional ta'lim sari ilk qadamni tashlang. O'rganish hech qachon bunchalik premium bo'lmagan.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Link to="/courses" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="lg" style={{ background: 'white', color: '#3461FF' }}>
                Darslarni boshlash <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
