import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target, Play, BookOpen, Lock, Sparkles, Brain,
  Flame, HelpCircle, Coins, CheckCircle2, ChevronRight, ChevronDown, ArrowRight, Zap
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'

// ── Tab definitions ──────────────────────────────────────────
const TABS = [
  { id: 'daily',   label: 'Kunlik Test',         icon: <Flame size={15} strokeWidth={2.5} /> },
  { id: 'topic',   label: 'Mavzulashgan',         icon: <BookOpen size={15} strokeWidth={2.5} /> },
  { id: 'general', label: 'Umumiy Test',          icon: <Sparkles size={15} strokeWidth={2.5} /> },
]

export default function QuizzesHubPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('daily')
  const [openCourse, setOpenCourse] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['quizzes-hub', user?.id],
    queryFn: async () => {
      const d = new Date()
      const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const [cRes, lRes, qRes, aRes, dailyRes] = await Promise.all([
        supabase.from('courses').select('id,title').eq('is_published',true).order('created_at',{ascending:false}),
        supabase.from('lessons').select('id,course_id,title,is_free').eq('is_published',true).order('order_index',{ascending:true}),
        supabase.from('quizzes').select('id,lesson_id').not('lesson_id','is',null),
        user ? supabase.from('user_access').select('lesson_id').eq('user_id',user.id) : {data:[]},
        supabase.from('daily_quizzes').select('*').eq('is_active', true).order('quiz_date', { ascending: false }),
      ])
      const dailyQuizzes = dailyRes.data || []

      // Fetch attempt status for each active quiz
      let attemptsMap = {}
      if (user && dailyQuizzes.length > 0) {
        const ids = dailyQuizzes.map(q => q.id)
        const { data: atts } = await supabase
          .from('daily_quiz_attempts')
          .select('id,score,total_questions,daily_quiz_id')
          .eq('user_id', user.id)
          .in('daily_quiz_id', ids)
        atts?.forEach(a => { attemptsMap[a.daily_quiz_id] = a })
      }

      const map = {}
      lRes.data?.forEach(l => {
        const count = qRes.data?.filter(q => q.lesson_id === l.id).length || 0
        if (count > 0) {
          if (!map[l.course_id]) map[l.course_id] = []
          map[l.course_id].push({ ...l, quizCount: count })
        }
      })
      const courses = (cRes.data||[]).filter(c => map[c.id]?.length > 0)
      const unlockedSet = new Set((aRes.data||[]).map(a => a.lesson_id))
      return { courses, map, unlockedSet, dailyQuizzes, attemptsMap }
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const { courses=[], map:lessonsMap={}, unlockedSet=new Set(), dailyQuizzes=[], attemptsMap={} } = data || {}

  return (
    <>
      <style>{`
        .qhub-wrapper { width: 100%; padding-bottom: 80px; }

        .qhub-hero {
          background: linear-gradient(145deg, #0F172A 0%, #134E4A 50%, #064E3B 100%);
          position: relative; overflow: hidden;
          padding: 48px 0 90px;
          border-radius: 0 0 40px 40px;
          margin-bottom: -50px;
          box-shadow: 0 20px 40px rgba(6,78,59,0.2);
        }
        .qhub-hero-inner { max-width: 1040px; margin: 0 auto; padding: 0 24px; }

        .qhub-tab-wrap {
          max-width: 1040px; margin: 0 auto;
          padding: 0 24px; position: relative; z-index: 10;
        }
        .qhub-tab-inner { /* unused but kept for compat */ }
        .qhub-tab-wrap {
          max-width: 540px;
          margin: 16px auto 0;
          padding: 0 16px;
        }
        .qhub-tab-bar {
          display: flex;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 100px;
          padding: 4px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        @supports (backdrop-filter: blur(20px)) or (-webkit-backdrop-filter: blur(20px)) {
          .qhub-tab-bar {
            background: rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        }
        .qhub-tab-bar::-webkit-scrollbar { display: none; }
        .qhub-tab-btn {
          flex: 1 0 auto; padding: 12px 20px;
          border: none; background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 600; font-size: 0.875rem;
          cursor: pointer; position: relative;
          display: flex; align-items: center;
          justify-content: center; gap: 6px;
          transition: color 0.3s ease;
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
          z-index: 1;
          white-space: nowrap;
        }
        .qhub-tab-btn.active {
          color: #064E3B;
          font-weight: 800;
        }

        /* Content area */
        .qhub-content {
          max-width: 1040px; margin: 24px auto 0;
          padding: 0 24px;
        }

        /* Lesson card */
        .qhub-lesson-card {
          display: flex; align-items: center; gap: 16px;
          padding: 18px 24px; border-radius: 20px;
          background: #FFFFFF;
          border: 1px solid rgba(15,23,42,0.05);
          cursor: pointer; transition: all 0.24s cubic-bezier(0.22, 1, 0.36, 1);
          -webkit-tap-highlight-color: transparent;
          box-shadow: 0 4px 12px rgba(15,23,42,0.02);
          position: relative; overflow: hidden;
        }
        .qhub-lesson-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; background: #3461FF; opacity: 0;
          transition: opacity 0.2s;
        }
        .qhub-lesson-card:hover {
          background: #FFFFFF;
          box-shadow: 0 12px 32px rgba(15,23,42,0.06);
          transform: translateY(-2px);
          border-color: rgba(52,97,255,0.1);
        }
        .qhub-lesson-card:hover::before { opacity: 1; }
        
        .qhub-lesson-card.locked { cursor: default; opacity: 0.6; grayscale: 1; }
        .qhub-lesson-card.locked:hover { transform: none; box-shadow: none; border-color: rgba(15,23,42,0.05); }
        .qhub-lesson-card.locked::before { display: none; }

        @media (max-width: 640px) {
          .qhub-hero { padding: 36px 0 72px; border-radius: 0 0 28px 28px; }
          .qhub-hero-inner, .qhub-content, .qhub-tab-wrap { padding: 0 16px; }
          .qhub-tab-btn { padding: 12px 16px; font-size: 0.875rem; }
        }
      `}</style>

      <div className="qhub-wrapper">

        {/* ── HERO ── */}
        <div className="qhub-hero">
          <div style={{ position:'absolute', top:-80, right:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 65%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-60, left:-60, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(52,211,153,0.12) 0%,transparent 65%)', pointerEvents:'none' }} />
          {[{top:'18%',right:'8%',s:44,d:0},{top:'55%',right:'22%',s:24,d:.4},{top:'25%',left:'5%',s:32,d:.2}].map((c,i)=>(
            <motion.div key={i} animate={{y:[0,-12,0],rotate:[0,8,-8,0]}} transition={{repeat:Infinity,duration:4+i*.5,delay:c.d,ease:'easeInOut'}} style={{position:'absolute',opacity:.08,pointerEvents:'none',top:c.top,right:c.right,left:c.left}}>
              <Brain size={c.s} color="white" strokeWidth={1.5} />
            </motion.div>
          ))}
          <div className="qhub-hero-inner">
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.6,ease:[0.16,1,0.3,1]}}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:100, padding:'5px 14px', marginBottom:14 }}>
                <Zap size={13} color="#A78BFA" fill="#A78BFA" />
                <span style={{ color:'#DDD6FE', fontSize:'0.7rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>Testlar Markazi</span>
              </div>
              <h1 className="outfit-font" style={{ margin:'0 0 10px', fontSize:'clamp(2.25rem, 7vw, 3.75rem)', fontWeight:900, color:'white', letterSpacing:'-0.04em', lineHeight:1.05 }}>
                Testlar
              </h1>
              <p style={{ margin:'0 0 32px', color:'rgba(255,255,255,0.6)', fontSize:'0.9375rem', fontWeight:500 }}>
                Kunlik test, mavzulashtirilgan va umumiy testlar — bir joyda.
              </p>


              {/* ── XP Level Card ── */}
              {(() => {
                const xp = profile?.rating_score ?? 0
                const level = Math.floor(xp / 100)
                const xpInLevel = xp % 100
                const pct = Math.min((xpInLevel / 100) * 100, 100)
                return (
                  <div style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.13)',
                    borderRadius: 40, padding: '18px 22px',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:'rgba(52,97,255,0.3)', border:'1px solid rgba(52,97,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Sparkles size={18} color="#93C5FD" fill="#93C5FD" />
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:'0.75rem', color:'rgba(255,255,255,0.5)', fontWeight:700 }}>Sizning darajangiz</p>
                          <p style={{ margin:0, fontSize:'1.125rem', color:'white', fontWeight:900, lineHeight:1 }}>
                            Level {level}
                          </p>
                        </div>
                      </div>
                      {/* XP Score badge */}
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                        <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Jami ball</span>
                        <span style={{ fontSize:'1.375rem', color:'white', fontWeight:900, lineHeight:1 }}>{xp} <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', fontWeight:700 }}>XP</span></span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height:8, borderRadius:100, background:'rgba(255,255,255,0.1)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, borderRadius:100, background:'linear-gradient(90deg,#6366F1,#3461FF)', transition:'width 0.8s ease', boxShadow:'0 0 12px rgba(99,102,241,0.5)' }} />
                    </div>
                    <p style={{ margin:'8px 0 0', fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', fontWeight:600 }}>
                      Keyingi daraja uchun {100 - xpInLevel} XP kerak
                    </p>
                  </div>
                )
              })()}

            </motion.div>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="qhub-tab-wrap">
          <div className="qhub-tab-bar">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  className={`qhub-tab-btn${isActive ? ' active' : ''}`}
                  onClick={() => { setActiveTab(tab.id); setOpenCourse(null) }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="qhubTab"
                      style={{ 
                        position: 'absolute', inset: 0, 
                        background: '#D1FAE5', borderRadius: 100, 
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)' 
                      }}
                      transition={{ type: 'spring', bounce: 0.1, duration: 0.5 }}
                    />
                  )}
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ opacity: isActive ? 1 : 0.6, display: 'flex', alignItems: 'center' }}>
                      {isActive ? tab.activeIcon : tab.icon}
                    </span>
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="qhub-content">
          {isLoading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:8 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton-loader" style={{ height:72, borderRadius:18 }} />)}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity:0, y:14 }}
                animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, y:-10 }}
                transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}
              >

                {/* ══ TAB: KUNLIK TEST ══ */}
                {activeTab === 'daily' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {dailyQuizzes.length > 0 ? dailyQuizzes.map(dQuiz => {
                      const today = new Date().toISOString().split('T')[0]
                      const isToday = dQuiz.quiz_date === today
                      const attempt = attemptsMap[dQuiz.id] || null
                      return (
                        <div key={dQuiz.id} className="glass-card-premium card-glow-hover" style={{
                          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
                          padding: '24px 24px',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          {/* Decorative glow */}
                          <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, background: isToday ? 'rgba(239,68,68,0.08)' : 'rgba(52,97,255,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
                          <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: isToday ? 'rgba(239,68,68,0.1)' : 'rgba(52,97,255,0.1)', color: isToday ? '#EF4444' : '#3461FF', padding: '4px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                <Flame size={12} fill="currentColor" /> {isToday ? 'Bugungi' : 'Faol Test'}
                              </div>
                              <span style={{ fontSize: '0.8125rem', color: '#94A3B8', fontWeight: 600 }}>{dQuiz.quiz_date}</span>
                            </div>
                            <h2 className="outfit-font" style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.2 }}>
                              {dQuiz.title}
                            </h2>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>
                                <HelpCircle size={14} /> {dQuiz.questions?.length || 0} savol
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 700, color: dQuiz.entry_fee_coins > 0 ? '#D97706' : '#059669' }}>
                                <Coins size={14} /> {dQuiz.entry_fee_coins > 0 ? `${dQuiz.entry_fee_coins} Coin` : 'Bepul'}
                              </span>
                            </div>
                          </div>

                          {attempt ? (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/leaderboard')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FDF4', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', padding: '12px 24px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', fontSize: '0.9375rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>
                              <CheckCircle2 size={18} /> Natija: {attempt.score}/{attempt.total_questions}
                            </motion.button>
                          ) : (
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate(`/quiz/daily-${dQuiz.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: isToday ? '#EF4444' : '#3461FF', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 100, fontWeight: 800, cursor: 'pointer', fontSize: '0.9375rem', flexShrink: 0, boxShadow: isToday ? '0 8px 24px rgba(239,68,68,0.3)' : '0 8px 24px rgba(52,97,255,0.3)' }}>
                              <Play size={18} fill="white" /> Boshlash
                            </motion.button>
                          )}
                        </div>
                      )
                    }) : (
                      <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'white', borderRadius: 24, border: '1px dashed rgba(239,68,68,0.2)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                          <Flame size={32} color="#EF4444" style={{ opacity: 0.5 }} />
                        </div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>Bugun uchun kunlik test hali tayyor emas.</p>
                        <p style={{ margin: '6px 0 0', fontWeight: 500, color: '#94A3B8', fontSize: '0.875rem' }}>Ertaga qaytib keling!</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ TAB: MAVZULASHGAN ══ */}
                {activeTab === 'topic' && (
                  <div>
                    {courses.length > 0 ? (
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {courses.map((course, ci) => {
                          const isOpen = openCourse === course.id
                          const lessons = lessonsMap[course.id] || []
                          const unlockedCount = lessons.filter(l => l.is_free || unlockedSet.has(l.id)).length
                          const accent = `hsl(${ci * 53 + 210}, 75%, 50%)`
                          const accentBg = `hsl(${ci * 53 + 210}, 85%, 96%)`
                          return (
                            <div key={course.id} className="glass-card-premium card-glow-hover" style={{ overflow: 'hidden', transition: 'all 0.3s ease' }}>
                              {/* Course Header */}
                              <button
                                onClick={() => setOpenCourse(isOpen ? null : course.id)}
                                style={{ 
                                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                                  padding: '24px', background: 'transparent', border: 'none', cursor: 'pointer', 
                                  textAlign: 'left', WebkitTapHighlightColor: 'transparent'
                                }}
                              >
                                 <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                   <div style={{ 
                                     width: 56, height: 56, borderRadius: 18, 
                                     background: isOpen ? `linear-gradient(135deg, ${accent}, #1E1B4B)` : '#F8FAFC', 
                                     color: isOpen ? 'white' : accent, 
                                     display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                     fontWeight: 900, fontSize: '1.4rem', flexShrink: 0,
                                     transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                     boxShadow: isOpen ? `0 10px 25px ${accent}44` : 'inset 0 2px 4px rgba(0,0,0,0.02)',
                                     border: isOpen ? 'none' : '1.5px solid rgba(15,23,42,0.04)'
                                   }}>
                                     {ci + 1}
                                   </div>
                                   <div>
                                     <h3 className="outfit-font" style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{course.title}</h3>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                       <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                         <BookOpen size={14} /> {lessons.length} ta dars
                                       </span>
                                       <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#CBD5E1' }} />
                                       <span style={{ fontSize: '0.875rem', color: accent, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                                         <Sparkles size={14} /> {unlockedCount} ochiq
                                       </span>
                                     </div>
                                   </div>
                                 </div>
                                 <motion.div 
                                   animate={{ rotate: isOpen ? 180 : 0 }} 
                                   style={{ 
                                     width: 40, height: 40, borderRadius: 12, 
                                     background: isOpen ? '#F1F5F9' : 'transparent',
                                     color: isOpen ? '#0F172A' : '#94A3B8',
                                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                                     border: isOpen ? '1px solid rgba(15,23,42,0.06)' : 'none'
                                   }}
                                 >
                                   <ChevronDown size={22} strokeWidth={3} />
                                 </motion.div>
                               </button>

                              {/* Lessons List with minimalist grouping */}
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ overflow: 'hidden' }}
                                  >
                                    <div style={{ padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                      <div style={{ height: 2, background: '#FFFFFF', margin: '0 8px 12px' }} />
                                      {lessons.map(lesson => {
                                        const canAccess = lesson.is_free || unlockedSet.has(lesson.id)
                                        return (
                                           <motion.div
                                             key={lesson.id}
                                             whileHover={{ x: 4 }}
                                             className={`qhub-lesson-card${canAccess ? '' : ' locked'}`}
                                             onClick={() => {
                                               if (!canAccess) { toast.info('Dars qulflangan', { description: 'Bu testni ishlash uchun avval darsni oching.' }); return }
                                               navigate(`/quiz/${lesson.id}`)
                                             }}
                                             style={{
                                               background: canAccess ? 'white' : '#F8FAFC',
                                               border: `2px solid ${canAccess ? '#FFFFFF' : 'rgba(255,255,255,0.4)'}`,
                                               padding: '16px 20px',
                                               borderRadius: 20,
                                               boxShadow: canAccess ? '0 4px 12px rgba(52,97,255,0.03)' : 'none',
                                               display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                                               transition: 'all 0.2s'
                                             }}
                                           >
                                             <div style={{ 
                                               width: 44, height: 44, borderRadius: 14, flexShrink: 0, 
                                               background: canAccess ? accentBg : '#E2E8F0', 
                                               color: canAccess ? accent : '#94A3B8', 
                                               display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                               boxShadow: canAccess ? `0 4px 12px ${accent}22` : 'none'
                                             }}>
                                               {canAccess ? <Play size={18} fill={accent} strokeWidth={0} /> : <Lock size={16} />}
                                             </div>
                                             <div style={{ flex: 1, minWidth: 0 }}>
                                               <p className="outfit-font" style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 800, color: canAccess ? '#0F172A' : '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{lesson.title}</p>
                                               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                 <span style={{ fontSize: '0.8125rem', color: canAccess ? '#64748B' : '#CBD5E1', fontWeight: 600 }}>{lesson.quizCount} ta savol</span>
                                               </div>
                                             </div>
                                             <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: canAccess ? accent : '#F1F5F9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: canAccess ? 1 : 0.4 }}>
                                               {canAccess ? <ChevronRight size={18} strokeWidth={3} /> : <Lock size={14} />}
                                             </div>
                                           </motion.div>
                                        )
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div style={{ padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: '#F8FAFC', borderRadius: 24, border: '1px dashed rgba(52,97,255,0.15)' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(52,97,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                          <BookOpen size={32} color="#3461FF" style={{ opacity: 0.5 }} />
                        </div>
                        <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '1.125rem' }}>Hozircha mavzulashtirilgan testlar mavjud emas.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ══ TAB: UMUMIY TEST ══ */}
                {activeTab === 'general' && (
                  <div className="glass-card-premium card-glow-hover" style={{
                    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
                    padding: '24px 24px',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {/* Decorative glass glow */}
                    <div style={{ position: 'absolute', top: -30, left: -30, width: 150, height: 150, background: 'rgba(16,185,129,0.12)', borderRadius: '50%', filter: 'blur(50px)' }} />

                    <div style={{ flex: '1 1 300px', position: 'relative', zIndex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                        <div style={{ 
                          width: 52, height: 52, borderRadius: 16, 
                          background: 'linear-gradient(135deg, #10B981, #059669)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          boxShadow: '0 8px 20px rgba(16,185,129,0.3)'
                        }}>
                          <Target size={26} color="white" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h2 className="outfit-font" style={{ margin: '0 0 2px', fontSize: '1.375rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>Aralash Mavzular</h2>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>Barcha mavzulardan tasodifiy savollar to'plami</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {['Barcha mavzular', 'Tasodifiy tartib', 'Cheksiz urinish'].map((tag, i) => (
                          <span key={i} style={{ background: 'rgba(16,185,129,0.06)', color: '#059669', padding: '6px 14px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(16,185,129,0.1)' }}>{tag}</span>
                        ))}
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/quiz/general')}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, 
                        background: '#10B981', color: 'white', border: 'none', 
                        padding: '16px 32px', borderRadius: 100, fontWeight: 800, 
                        cursor: 'pointer', fontSize: '1rem', flexShrink: 0, 
                        boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
                        transition: 'all 0.3s'
                      }}
                    >
                      <Play size={20} fill="white" /> Boshlash
                    </motion.button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  )
}
