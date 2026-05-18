// src/pages/DtmCalculatorPage.jsx
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, BookOpen, Trophy, TrendingUp, Minus, ChevronDown, ChevronUp, ExternalLink, Star, Filter, X, Info, Coins, Lightbulb, GraduationCap, Building2, Globe, Languages } from 'lucide-react'
import { ALL_UNIVERSITIES, REGIONS, STUDY_TYPES, LANGUAGES as DTM_LANGUAGES, UNIVERSITY_TYPES } from '../data/universities'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

const MAX_SCORE = 189
const UNLOCK_COST = 10 // calculation cost in coins

function formatPrice(p) {
  if (p >= 1_000_000) return (p / 1_000_000).toFixed(1) + " mln so'm"
  return p.toLocaleString() + " so'm"
}

function getStatus(score, spec) {
  if (score >= spec.grant)    return 'grant'
  if (score >= spec.contract) return 'contract'
  return 'none'
}

function StatusBadge({ status, score, spec }) {
  const diff = status === 'grant'
    ? score - spec.grant
    : status === 'contract'
    ? score - spec.contract
    : score - spec.contract

  const cfg = {
    grant:    { bg: 'linear-gradient(135deg,#10B981,#059669)', label: 'GRANT',    icon: <Trophy size={11}/> },
    contract: { bg: 'linear-gradient(135deg,#F59E0B,#D97706)', label: 'KONTRAKT', icon: <Star size={11}/> },
    none:     { bg: 'linear-gradient(135deg,#94A3B8,#64748B)', label: "YETMAYDI", icon: <Minus size={11}/> },
  }[status]

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
      <div style={{ background: cfg.bg, color:'white', fontSize:'0.6rem', fontWeight:900,
        padding:'4px 10px', borderRadius:100, display:'flex', alignItems:'center', gap:4,
        textTransform:'uppercase', letterSpacing:'0.08em', whiteSpace:'nowrap' }}>
        {cfg.icon}{cfg.label}
      </div>
      {status !== 'none' ? (
        <span style={{ fontSize:'0.65rem', fontWeight:700, color: status==='grant'?'#10B981':'#F59E0B' }}>
          +{diff.toFixed(1)} ball
        </span>
      ) : (
        <span style={{ fontSize:'0.65rem', fontWeight:700, color:'#EF4444' }}>
          {Math.abs(diff).toFixed(1)} ball kam
        </span>
      )}
    </div>
  )
}

function UniversityCard({ uni, score, expanded, onToggle }) {
  const matchedSpecs = useMemo(() => {
    const baseSpecs = uni._filteredSpecs || uni.specialties.map(s => ({ ...s, status: getStatus(score, s) }))
    return [...baseSpecs].sort((a,b) => {
      const order = { grant:0, contract:1, none:2 }
      return order[a.status] - order[b.status] || b.grant - a.grant
    })
  }, [uni, score])

  const bestStatus = matchedSpecs[0]?.status || 'none'
  const grantCount = matchedSpecs.filter(s => s.status === 'grant').length
  const contractCount = matchedSpecs.filter(s => s.status === 'contract').length

  const cardBorderColor = bestStatus === 'grant' ? '#10B981' : bestStatus === 'contract' ? '#F59E0B' : '#E2E8F0'
  const visibleSpecs = expanded ? matchedSpecs : matchedSpecs.slice(0, 2)

  if (!uni.specialties || uni.specialties.length === 0) {
    return (
      <motion.div layout initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.96 }}
        style={{ background:'white', borderRadius:20, border:'1.5px solid #E2E8F0', overflow:'hidden', boxShadow:'0 2px 8px rgba(15,23,42,0.04)' }}>
        <div style={{ padding:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${uni.color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Building2 size={22} color={uni.color} strokeWidth={1.5}/>
            </div>
            <div style={{ minWidth:0, flex:1 }}>
              <p style={{ margin:0, fontWeight:800, fontSize:'0.9375rem', color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{uni.short}</p>
              <p style={{ margin:0, fontSize:'0.7rem', color:'#64748B', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{uni.name}</p>
            </div>
            <span style={{ background: uni.type==='Nodavlat'?'#EFF6FF': uni.type==='Xorijiy'?'#F0FDF4':'#FEF3C7', color: uni.type==='Nodavlat'?'#3461FF': uni.type==='Xorijiy'?'#16A34A':'#92400E', fontSize:'0.6rem', fontWeight:800, padding:'4px 10px', borderRadius:100, whiteSpace:'nowrap', textTransform:'uppercase' }}>
              {uni.type || 'Davlat'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10 }}>
            <MapPin size={11} color="#94A3B8"/><span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{uni.region}</span>
            <span style={{ color:'#E2E8F0' }}>·</span>
            <Globe size={11} color="#94A3B8"/><span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{uni.website}</span>
          </div>
          <p style={{ margin:'10px 0 0', fontSize:'0.75rem', color:'#94A3B8', fontStyle:'italic' }}>Ball ma'lumoti mavjud emas</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity:0, y:12 }}
      animate={{ opacity:1, y:0 }}
      exit={{ opacity:0, scale:0.96 }}
      style={{ background:'white', borderRadius:20, border:`1.5px solid ${cardBorderColor}`,
        overflow:'hidden', boxShadow: bestStatus!=='none'
          ? `0 4px 20px ${bestStatus==='grant'?'rgba(16,185,129,0.12)':'rgba(245,158,11,0.12)'}`
          : '0 2px 8px rgba(15,23,42,0.04)' }}
    >
      {/* Header */}
      <div style={{ padding:'16px', borderBottom:'1px solid #F1F5F9' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, flex:'1 1 auto', minWidth:0 }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${uni.color}15`,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Building2 size={22} color={uni.color} strokeWidth={1.5}/>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ margin:0, fontWeight:800, fontSize:'0.9375rem', color:'#0F172A',
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {uni.short}
              </p>
              <p style={{ margin:0, fontSize:'0.7rem', color:'#64748B', fontWeight:500,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {uni.name}
              </p>
            </div>
          </div>
          {/* Responsive Badge Container */}
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', justifyContent:'flex-end', flexShrink:0 }}>
            {grantCount > 0 && (
              <span style={{ background:'#DCFCE7', color:'#15803D', fontSize:'0.65rem', fontWeight:800,
                padding:'3px 8px', borderRadius:100, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                <Trophy size={10}/> {grantCount} grant
              </span>
            )}
            {contractCount > 0 && (
              <span style={{ background:'#FEF3C7', color:'#92400E', fontSize:'0.65rem', fontWeight:800,
                padding:'3px 8px', borderRadius:100, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                <Star size={10}/> {contractCount} kontrakt
              </span>
            )}
            {grantCount === 0 && contractCount === 0 && (
              <span style={{ background:'#F1F5F9', color:'#94A3B8', fontSize:'0.65rem', fontWeight:800,
                padding:'3px 8px', borderRadius:100, display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                <Minus size={10}/> Mos emas
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <MapPin size={11} color="#94A3B8" />
          <span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{uni.region}</span>
          <span style={{ color:'#E2E8F0' }}>·</span>
          <Globe size={11} color="#94A3B8" />
          <span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{uni.website}</span>
          {uni.studyTypes && uni.studyTypes.length > 0 && (
            <>
              <span style={{ color:'#E2E8F0' }}>·</span>
              <BookOpen size={11} color="#94A3B8" />
              <span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{uni.studyTypes.join(', ')}</span>
            </>
          )}
          {uni.languages && uni.languages.length > 0 && (
            <>
              <span style={{ color:'#E2E8F0' }}>·</span>
              <Languages size={11} color="#94A3B8" />
              <span style={{ fontSize:'0.7rem', color:'#94A3B8', fontWeight:600 }}>{uni.languages.join(', ')}</span>
            </>
          )}
        </div>
      </div>

      {/* Specialties */}
      <div style={{ padding:'12px 16px' }}>
        {visibleSpecs.map(spec => (
          <div key={spec.id} style={{ display:'flex', alignItems:'center', gap:10, paddingBottom:10,
            marginBottom:10, borderBottom:'1px solid #F8FAFC' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:'0.8125rem', color:'#1E293B',
                lineHeight: 1.3 }}>
                {spec.name}
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.65rem', color:'#64748B', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                  <Trophy size={10} color="#10B981"/> Grant: {spec.grant} ball
                </span>
                <span style={{ fontSize:'0.65rem', color:'#64748B', fontWeight:600, display:'flex', alignItems:'center', gap:3 }}>
                  <Star size={10} color="#F59E0B"/> Kontrakt: {spec.contract} ball
                </span>
              </div>
              {spec.status !== 'none' && (
                <p style={{ margin:'4px 0 0', fontSize:'0.65rem', color:'#94A3B8', fontWeight:500 }}>
                  Kontrakt narxi: {formatPrice(spec.price)}/yil
                </p>
              )}
            </div>
            <StatusBadge status={spec.status} score={score} spec={spec} />
          </div>
        ))}

        {matchedSpecs.length > 2 && (
          <button onClick={onToggle} style={{ width:'100%', border:'none', background:'#F8FAFC',
            borderRadius:10, padding:'8px', display:'flex', alignItems:'center', justifyContent:'center',
            gap:6, cursor:'pointer', color:'#64748B', fontSize:'0.75rem', fontWeight:700 }}>
            {expanded ? <><ChevronUp size={14}/>Kamroq ko'rsat</> : <><ChevronDown size={14}/>+{matchedSpecs.length-2} ta yo'nalish</>}
          </button>
        )}
      </div>
    </motion.div>
  )
}

// All unique specialties across all universities
const ALL_SPECIALTIES = ['Hammasi', ...Array.from(
  new Set(ALL_UNIVERSITIES.flatMap(u => u.specialties.map(s => s.name)))
).sort()]

export default function DtmCalculatorPage() {
  const { user, profile, setProfile } = useAuth()
  const userCoins = profile?.coins ?? 0

  const [score, setScore] = useState(0)
  const [inputVal, setInputVal] = useState('0')
  const [regionFilter, setRegionFilter] = useState('Hammasi')
  const [specialtyFilter, setSpecialtyFilter] = useState('Hammasi')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState({})
  const [hasCalculated, setHasCalculated] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleScoreInput = (v) => {
    setInputVal(v)
    const n = parseFloat(v)
    if (!isNaN(n) && n >= 0 && n <= MAX_SCORE) {
      setScore(n)
      setHasCalculated(false) // require recalculation on score change
    }
  }

  const results = useMemo(() => {
    return ALL_UNIVERSITIES
      .filter(u => {
        if (regionFilter !== 'Hammasi' && u.region !== regionFilter) return false
        if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
            !u.short.toLowerCase().includes(search.toLowerCase())) return false
        if (specialtyFilter !== 'Hammasi') {
          return u.specialties.some(s => s.name === specialtyFilter)
        }
        return true
      })
      .map(u => {
        const filteredSpecs = specialtyFilter !== 'Hammasi'
          ? u.specialties.filter(s => s.name === specialtyFilter)
          : u.specialties
        
        // Faqat yetarli ball to'plangan (mos) yo'nalishlarni qoldiramiz
        const specs = filteredSpecs.map(s => ({ ...s, status: getStatus(score, s) }))
                                   .filter(s => s.status !== 'none')
        
        const best = specs.some(s=>s.status==='grant') ? 'grant'
          : specs.some(s=>s.status==='contract') ? 'contract' : 'none'
        
        return { ...u, _best: best, _filteredSpecs: specs }
      })
      // Faqat kamida bitta mos yo'nalishi bor universitetlarni qoldiramiz
      .filter(u => u._filteredSpecs.length > 0)
      .sort((a,b) => {
        const order = { grant:0, contract:1, none:2 }
        return order[a._best] - order[b._best]
      })
  }, [score, regionFilter, specialtyFilter, search])

  const grantCount    = results.filter(u=>u._best==='grant').length
  const contractCount = results.filter(u=>u._best==='contract').length

  const handleCalculate = async () => {
    if (userCoins < UNLOCK_COST) {
      toast.error('Coinlar yetarli emas!', {
        description: "DTM hisob-kitobini o'tkazish uchun sizda kamida 10 coin bo'lishi kerak."
      })
      return
    }

    setIsCalculating(true)
    try {
      const newCoins = userCoins - UNLOCK_COST
      // Optimistic Update
      if (setProfile) {
        setProfile(prev => ({ ...prev, coins: newCoins }))
      }

      // Persist in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', user.id)

      if (error) throw error

      setHasCalculated(true)
      toast.success('Natijalar hisoblandi! ✨', {
        description: `${score} ball uchun barcha imkoniyatlar yuklandi.`
      })
    } catch (err) {
      // Rollback
      if (setProfile) {
        setProfile(prev => ({ ...prev, coins: userCoins }))
      }
      toast.error("Xatolik yuz berdi. Iltimos qaytadan urunib ko'ring.")
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <>
      <style>{`
        .dtm-page { width:100%; padding-bottom:100px; }
        .dtm-hero {
          background: linear-gradient(145deg, #0F172A 0%, #1E293B 40%, #1a1040 70%, #0d1f4f 100%);
          padding: 60px 0 160px; border-radius:0 0 40px 40px; margin-bottom:-100px;
          position:relative; overflow:hidden; box-shadow:0 20px 40px rgba(15,23,42,0.15);
        }
        @media(max-width:768px){ .dtm-hero{ padding:40px 0 140px; border-radius:0 0 32px 32px; margin-bottom:-80px; } }
        .dtm-container { max-width:1040px; margin:0 auto; position:relative; z-index:20; }
        .dtm-hero-content { max-width:1040px; margin:0 auto; padding:0 24px; position:relative; z-index:20; }
        @media(max-width:768px){ .dtm-hero-content{ padding:0 16px; } }
        .dtm-content { padding:0 24px; position:relative; z-index:2; }
        @media(max-width:768px){ .dtm-content{ padding:0 16px; } }
        .dtm-score-card {
          background:white; border-radius:28px; padding:32px 24px;
          box-shadow:0 20px 60px rgba(15,23,42,0.12); position:relative; z-index:10;
          border:1px solid rgba(255,255,255,0.6); max-width:680px; margin:0 auto;
        }
        @media(max-width:768px){
          .dtm-score-card { padding:24px 16px; border-radius:20px; }
        }
        .dtm-filter-chip {
          padding:6px 14px; border-radius:100px; border:1.5px solid #E2E8F0;
          background:white; font-size:0.75rem; font-weight:700; color:#64748B;
          cursor:pointer; white-space:nowrap; transition:all 0.15s ease;
        }
        .dtm-filter-chip.active { border-color:#3461FF; background:#3461FF; color:white; }
        .results-grid {
          display: grid; gap: 16px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          width: 100%; box-sizing: border-box;
        }
        .dtm-filters-grid {
          display: grid; gap: 16px; margin-bottom: 24px;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          width: 100%; box-sizing: border-box;
        }
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number] { -moz-appearance:textfield; }
      `}</style>

      <div className="dtm-page">
        {/* Hero */}
        <div className="dtm-hero">
          {/* Ambient glows */}
          <div style={{ position:'absolute', top:-100, right:-50, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(52,97,255,0.15) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-50, left:-50, width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)', pointerEvents:'none' }}/>

          {/* Floating GraduationCap icons — like ShopPage floating coins */}
          {[
            { top:'15%', right:'8%',  size:48, delay:0 },
            { top:'60%', right:'18%', size:28, delay:0.4 },
            { top:'25%', left:'6%',   size:36, delay:0.2 },
            { bottom:'25%', left:'22%', size:22, delay:0.6 },
          ].map((c, i) => (
            <motion.div key={i}
              animate={{ y:[0,-12,0], rotate:[0,8,-8,0] }}
              transition={{ repeat:Infinity, duration:4+i*0.5, delay:c.delay, ease:'easeInOut' }}
              style={{ position:'absolute', opacity:0.12, pointerEvents:'none', ...c }}
            >
              <GraduationCap size={c.size} color="white" />
            </motion.div>
          ))}

          <div className="dtm-hero-content">
            <div style={{ maxWidth:800 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <div style={{ padding:'6px 12px', background:'rgba(255,255,255,0.1)', borderRadius:100,
                  border:'1px solid rgba(255,255,255,0.15)', display:'inline-flex', alignItems:'center', gap:6 }}>
                  <TrendingUp size={14} color="#34D399"/>
                  <span style={{ color:'#6EE7B7', fontSize:'0.7rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em' }}>
                    DTM Kalkulator 2024
                  </span>
                </div>
              </div>
              <h1 className="outfit-font" style={{ margin:'0 0 16px', fontSize:'clamp(2.25rem,7vw,3.75rem)',
                fontWeight:900, color:'white', letterSpacing:'-0.04em', lineHeight:1.1 }}>
                OTM Yo'nalishlari<br/>Kalkulyatori
              </h1>
              <p style={{ margin:'0 0 0', color:'rgba(255,255,255,0.65)', fontSize:'1rem', fontWeight:500 }}>
                Imtihon ballingizni kiriting va barcha imkoniyatlaringizni bir zumda tahlil qiling
              </p>
            </div>
          </div>
        </div>

        <div className="dtm-container">
          <div className="dtm-content">
          {/* Score Card */}
          <div className="dtm-score-card">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ margin:'0 0 12px', fontSize:'0.75rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                Umumiy ballingizni kiriting
              </p>
              <div style={{ display:'inline-flex', alignItems:'center', gap:10, background: '#F8FAFC', padding: '12px 24px', borderRadius: 20, border: '2px solid #E2E8F0', transition: 'border-color 0.2s' }} className="input-glow-wrapper">
                <input
                  type="number"
                  min={0}
                  max={MAX_SCORE}
                  step="0.1"
                  value={inputVal}
                  onChange={e => handleScoreInput(e.target.value)}
                  className="input-glow"
                  style={{
                    width: 130,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '3rem',
                    fontWeight: 900,
                    color: '#0F172A',
                    outline: 'none',
                    fontFamily: 'inherit',
                    textAlign: 'center',
                    padding: 0
                  }}
                />
                <span style={{ fontSize:'1.5rem', color:'#94A3B8', fontWeight:800 }}>/ {MAX_SCORE}</span>
              </div>
            </div>

            {/* Filters on Main Card */}
            <div className="dtm-filters-grid">
              {/* Region Selector */}
              <div>
                <p style={{ margin:'0 0 8px', fontSize:'0.75rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'center' }}>Hudud</p>
                <div style={{ position: 'relative' }}>
                  <select value={regionFilter} onChange={e => { setRegionFilter(e.target.value); setHasCalculated(false) }}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '2px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', transition: 'border-color 0.2s', textAlign: 'center' }}
                    onFocus={e => e.target.style.borderColor = '#3461FF'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} >
                    {['Hammasi', ...REGIONS].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Specialty Selector */}
              <div>
                <p style={{ margin:'0 0 8px', fontSize:'0.75rem', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.1em', textAlign:'center' }}>Yo'nalish</p>
                <div style={{ position: 'relative' }}>
                  <select value={specialtyFilter} onChange={e => { setSpecialtyFilter(e.target.value); setHasCalculated(false) }}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '2px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', outline: 'none', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748B\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', transition: 'border-color 0.2s', textAlign: 'center' }}
                    onFocus={e => e.target.style.borderColor = '#3461FF'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} >
                    {ALL_SPECIALTIES.map(sp => <option key={sp} value={sp}>{sp}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={isCalculating || hasCalculated}
              style={{
                width: '100%',
                background: hasCalculated ? '#E2E8F0' : 'linear-gradient(135deg, #3461FF 0%, #8B5CF6 100%)',
                color: hasCalculated ? '#94A3B8' : 'white',
                border: 'none',
                borderRadius: 16,
                padding: '16px 20px',
                fontSize: '1.05rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: hasCalculated ? 'default' : 'pointer',
                boxShadow: hasCalculated ? 'none' : '0 8px 25px rgba(52, 97, 255, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              {isCalculating ? 'Hisoblanmoqda...' : hasCalculated ? 'Natijalar ko\'rsatilmoqda' : (
                <>
                  <Search size={20} />
                  Hisoblash ({UNLOCK_COST} Coin)
                </>
              )}
            </button>

            {!hasCalculated && userCoins < UNLOCK_COST && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link to="/shop" style={{ color:'#EF4444', textDecoration:'none', fontWeight:700, fontSize: '0.9rem' }}>
                  Sizda coin yetarli emas. Sotib olish →
                </Link>
              </div>
            )}

            {/* Premium Info Header after calculation */}
            {hasCalculated && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display:'flex', gap:8, marginTop:20, flexWrap:'wrap', justifyContent: 'center' }}>
                <div style={{ background:'#DCFCE7', borderRadius:100, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
                  <Trophy size={13} color="#10B981"/>
                  <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#15803D' }}>{grantCount} ta Grant</span>
                </div>
                <div style={{ background:'#FEF3C7', borderRadius:100, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
                  <Star size={13} color="#F59E0B"/>
                  <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#92400E' }}>{contractCount} ta Kontrakt</span>
                </div>
                <div style={{ background:'#F1F5F9', borderRadius:100, padding:'6px 14px', display:'flex', alignItems:'center', gap:6 }}>
                  <BookOpen size={13} color="#64748B"/>
                  <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#475569' }}>{results.length} ta OTM</span>
                </div>
              </motion.div>
            )}
          </div>

          {!hasCalculated ? (
            /* Information Screen Before Calculation */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              style={{
                marginTop: 24,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: '32px 24px',
                textAlign: 'center',
                border: '1.5px solid rgba(255, 255, 255, 1)',
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, rgba(52, 97, 255, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
              }}>
                <Lightbulb size={28} color="#3461FF" />
              </div>
              <h3 className="outfit-font" style={{ margin: '0 0 12px', fontSize: '1.25rem', fontWeight:800, color: '#0F172A' }}>
                Kalkulyator qanday ishlaydi?
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.9rem', color: '#64748B', lineHeight: 1.6 }}>
                DTM Kalkulyatori orqali siz o'z ballingizga mos bo'lgan barcha davlat universitetlarini, grant va kontrakt o'tish ballarini, hamda to'lov-kontrakt miqdorini aniq bilib olishingiz mumkin.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.85rem', color: '#3461FF', fontWeight: 700 }}>
                <Info size={16} /> Har bir hisoblash 10 coin talab qiladi
              </div>
            </motion.div>
          ) : (
            /* Unlocked Results Panel */
            <>
              {/* Search + Filter */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ margin:'24px 0 0', display:'flex', gap:10 }}>
                  <div style={{ flex:1, display:'flex', alignItems:'center', gap:10, background:'white',
                    borderRadius:14, padding:'10px 14px', border:'1.5px solid #E2E8F0' }}>
                    <Search size={16} color="#94A3B8"/>
                    <input
                      placeholder="Universitet qidirish..."
                      value={search} onChange={e=>setSearch(e.target.value)}
                      style={{ flex:1, border:'none', outline:'none', fontSize:'0.875rem',
                        fontWeight:600, color:'#0F172A', background:'transparent', fontFamily:'inherit' }}
                    />
                    {search && <button onClick={()=>setSearch('')} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8', display:'flex' }}><X size={14}/></button>}
                  </div>
                </div>

                {/* Active specialty indicator pill */}
                {specialtyFilter !== 'Hammasi' && (
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10 }}>
                    <span style={{ fontSize:'0.75rem', color:'#64748B', fontWeight:600 }}>Tanlangan yo'nalish:</span>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,rgba(52,97,255,0.1),rgba(139,92,246,0.1))',
                      border:'1px solid rgba(52,97,255,0.25)', borderRadius:100, padding:'4px 12px' }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:800, color:'#3461FF' }}>{specialtyFilter}</span>
                      <button onClick={()=>setSpecialtyFilter('Hammasi')} style={{ background:'none', border:'none', color:'#3461FF', cursor:'pointer', display:'flex', padding:0 }}>
                        <X size={12} strokeWidth={3}/>
                      </button>
                    </div>
                  </div>
                )}

                {/* margin below the top bar */}
                <div style={{ marginBottom: 16 }} />

                {/* Filters panel removed since all filters are now on main card */}

                {/* Results */}
                <AnimatePresence mode="popLayout">
                  {results.length === 0 ? (
                    <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                      style={{ textAlign:'center', padding:'48px 24px', background:'white', borderRadius:20 }}>
                      <div style={{ fontSize:'3rem', marginBottom:12 }}>😔</div>
                      <p style={{ margin:0, fontWeight:800, color:'#0F172A' }}>Mos OTM topilmadi</p>
                      <p style={{ margin:'6px 0 0', color:'#94A3B8', fontSize:'0.875rem' }}>
                        Ballingizni oshiring yoki filtrlarni o'zgartiring
                      </p>
                    </motion.div>
                  ) : (
                    <div className="results-grid">
                      {results.map((uni, idx) => (
                        <motion.div 
                          key={uni.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <UniversityCard
                            uni={uni} score={score}
                            expanded={!!expanded[uni.id]}
                            onToggle={()=>setExpanded(e=>({...e,[uni.id]:!e[uni.id]}))}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </>
          )}
          </div>
        </div>
      </div>
    </>
  )
}
