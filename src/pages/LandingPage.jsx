import { Link } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { ArrowRight, Sparkles, Trophy, BookOpen, MapPin, Users, Star, Target } from 'lucide-react'
import CourseCard from '../components/course/CourseCard'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

export default function LandingPage() {
  const { courses, loading } = useCourses()
  const { user } = useAuth()
  const featuredCourses = courses.slice(0, 3)

  // If logged in → /dashboard, else → /signup
  const ctaLink = user ? '/dashboard' : '/signup'

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '20px',
        padding: '120px 0 80px',
        position: 'relative'
      }}>
        {/* Decorative orbs */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
          borderRadius: '0 0 80px 80px'
        }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.25) 0%, transparent 60%)', filter: 'blur(60px)', animation: 'floatOrb 15s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', top: '30%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)', filter: 'blur(60px)', animation: 'floatOrbReverse 20s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '-10%', left: '30%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 60%)', filter: 'blur(60px)', animation: 'floatOrb 18s ease-in-out infinite' }} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 18px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          border: '1px solid var(--border-glass)',
          fontSize: '0.8125rem', fontWeight: 600,
          color: 'var(--color-primary)',
          boxShadow: 'var(--shadow-glass)'
        }}>
          <Sparkles size={13} /> Matematikani yangicha o'rganing
        </div>

        <h1 className="outfit-font text-gradient-premium" style={{
          maxWidth: '780px', margin: '0 auto',
          fontSize: 'clamp(2.8rem, 8vw, 5rem)',
          letterSpacing: '-0.04em', fontWeight: 900, lineHeight: 1.08,
          position: 'relative', zIndex: 1
        }}>
          Matematikani chuqur va oson o'rganing
        </h1>

        <p style={{
          maxWidth: '520px', color: 'var(--text-secondary)',
          fontSize: '1.2rem', margin: '4px auto 24px', lineHeight: 1.6,
          position: 'relative', zIndex: 1
        }}>
          DTM, abituriyentlar va olimpiadalarga tayyorlanuvchilar uchun professional interaktiv darslar platformasi.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Link to={ctaLink} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Darslarni boshlash</Button>
          </Link>
          <Link to="/about" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg">Biz haqimizda</Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center',
          marginTop: '48px', position: 'relative', zIndex: 1
        }}>
          {[
            { icon: <Users size={16} />, text: "1,000+ o'quvchi" },
            { icon: <Star size={16} />, text: '4.9 reyting' },
            { icon: <Trophy size={16} />, text: '95% DTM natija' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: 'var(--radius-full)',
              background: 'var(--bg-glass)',
              backdropFilter: 'var(--blur-glass)',
              WebkitBackdropFilter: 'var(--blur-glass)',
              border: '1px solid var(--border-glass)',
              fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-glass)'
            }}>
              <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* ── BENTO FEATURES ───────────────────────── */}
      <section style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <Badge variant="primary" style={{ marginBottom: '16px' }}>Platforma imkoniyatlari</Badge>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Nimalarni taqdim etamiz?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Biz faqatgina onlayn videolar emas, balki to'laqonli ekotizim taklif qilamiz.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridAutoRows: 'minmax(240px, auto)',
          gap: '20px'
        }} className="landing-bento">
          <style>{`
            @media (max-width: 900px) {
              .landing-bento { grid-template-columns: 1fr !important; }
              .landing-bento > * { grid-column: span 1 !important; grid-row: span 1 !important; }
            }
          `}</style>

          {/* Big card — DTM (span 2) */}
          <div className="card-glow-hover" style={{
            gridColumn: 'span 2',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #1E3A8A 100%)',
            borderRadius: 'var(--radius-card)',
            padding: '48px',
            color: 'white',
            border: '1.2px solid rgba(255,255,255,0.25)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <Trophy size={28} color="#FBBF24" style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }} />
            <h3 style={{ fontSize: '1.75rem', marginBottom: '14px', color: 'white', fontWeight: 700, position: 'relative', zIndex: 1, letterSpacing: '-0.02em' }}>
              DTM & Milliy Sertifikat
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, fontSize: '1.05rem', maxWidth: '420px', position: 'relative', zIndex: 1, fontWeight: 400 }}>
              Davlat standartidagi eng murakkab testlarga har tomonlama mukammal tayyorlov darslari ro'yxati.
            </p>
          </div>

          {/* Tall card — Quiz (span 2 rows) */}
          <Card className="card-glow-hover" style={{
            gridColumn: 'span 1', gridRow: 'span 2',
            display: 'flex', flexDirection: 'column', padding: '40px 32px'
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Sparkles size={24} color="var(--color-accent)" />
            </div>
            <h3 style={{ fontSize: '1.375rem', marginBottom: '14px', color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>
              Interaktiv Quiz<br />Tizimi
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '32px', flex: 1 }}>
              Har bir dars so'ngida bilimlaringizni gamification elementlari bilan sinab ko'ring va tangalar to'plang.
            </p>
            <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--border-soft)', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Target size={18} color="#8B5CF6" />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Gamification</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>O'ynab o'rganing</div>
              </div>
            </div>
          </Card>

          {/* Small card — Zero to Hero */}
          <Card className="card-glow-hover" style={{ gridColumn: 'span 1', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <BookOpen size={22} color="var(--color-teal)" />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '10px', color: 'var(--text-primary)' }}>Zero-to-Hero</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem' }}>
              Matematikadan tayyorgarligi yo'q o'quvchilarni eng yuqori natijagacha yetaklash.
            </p>
          </Card>

          {/* Small card — Offline */}
          <Card className="card-glow-hover" style={{ gridColumn: 'span 1', padding: '32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <MapPin size={22} color="#8B5CF6" />
            </div>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '10px', color: 'var(--text-primary)' }}>Offline Kurslar</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem' }}>
              Jonli darslarda ishtirok etish uchun o'quv markazimizdagi qabullarga qo'shilish.
            </p>
          </Card>
        </div>
      </section>

      {/* ── FEATURED COURSES ─────────────────────── */}
      <section style={{ padding: '40px 0 80px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '40px', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <h2 style={{ marginBottom: '8px', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Mashhur Darslar
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
              Eng ko'p o'rganilayotgan matematik yo'nalishlar
            </p>
          </div>
          <Link to={ctaLink} style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9375rem' }}>
            Barchasini ko'rish <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-loader" style={{ aspectRatio: '4/5', borderRadius: 'var(--radius-card)' }} />
            ))}
          </div>
        ) : featuredCourses.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {featuredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          /* Fallback placeholder cards when no published courses yet */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Imtihonga Tayyorlov', desc: 'DTM va Milliy Sertifikat testlariga professional tayyorgarlik.', color: '#3461FF' },
              { title: 'Sertifikat Kursi', desc: "Matematik bilimingizni rasmiy sertifikat bilan tasdiqlang.", color: '#3461FF' },
              { title: 'Asosiy Matematika', desc: "Algebra, geometriya va analitika asoslarini puxta o'rganing.", color: '#3461FF' },
            ].map((item) => (
              <div key={item.title} style={{
                background: 'white', borderRadius: 'var(--radius-card)',
                border: '1.5px solid rgba(100,120,255,0.1)',
                padding: '28px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <BookOpen size={24} color={item.color} />
                </div>
                <h3 style={{ margin: '0 0 10px', fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{item.title}</h3>
                <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.9375rem' }}>{item.desc}</p>
                <Link to={ctaLink} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: item.color, fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem'
                }}>
                  Ko'rish <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SOCIAL PROOF ─────────────────────────── */}
      <section style={{ padding: '40px 0 80px' }}>
        <Card style={{
          padding: 'clamp(40px, 6vw, 72px)',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '40px',
          position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,97,255,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div>
            <Badge variant="accent" style={{ marginBottom: '20px' }}>Nima uchun biz?</Badge>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', marginBottom: '16px', color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Muvaffaqiyat — ko'rsatkich
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', maxWidth: '560px', lineHeight: 1.65 }}>
              Ko'p yillar davomida minglab abituriyentlarni oliy ta'lim muassasalariga tayyorlab kelmoqdamiz.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', width: '100%' }}>
            {[
              { value: '1,000+', label: "O'quvchilar" },
              { value: '95%',    label: "DTM natijalari" },
              { value: '5+ Yil', label: "Tajriba" },
              { value: '4.9', label: "O'rtacha baho" },
            ].map(({ value, label }) => (
              <div key={label} style={{
                padding: '24px', borderRadius: '20px',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-soft)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em' }}>{value}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
              </div>
            ))}
          </div>
          <Link to="/about" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Batafsil tanishish <ArrowRight size={18} /></Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
