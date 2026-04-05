import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Coins, ArrowRight, RefreshCw, Trophy } from 'lucide-react'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

export default function QuizBlock({ quizzes = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [shake, setShake] = useState(false)

  if (!quizzes.length) return null

  const currentQuiz = quizzes[currentIndex]
  const options = [
    { label: currentQuiz.option_a, key: 'a' },
    { label: currentQuiz.option_b, key: 'b' },
    { label: currentQuiz.option_c, key: 'c' },
    { label: currentQuiz.option_d, key: 'd' }
  ].filter(opt => opt.label) 

  const progressPercentage = ((currentIndex) / quizzes.length) * 100

  const handleOptionSelect = (key) => {
    if (isRevealed) return
    setSelectedOption(key)
  }

  const handleCheck = () => {
    if (!selectedOption) return
    setIsRevealed(true)
    const isCorrect = selectedOption === currentQuiz.correct_option
    
    if (isCorrect) {
      setScore(s => s + 1)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleNext = () => {
    if (currentIndex < quizzes.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedOption(null)
      setIsRevealed(false)
    } else {
      setShowResult(true)
    }
  }

  const handleRetry = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsRevealed(false)
    setScore(0)
    setShowResult(false)
  }

  // --- RESULT SCREEN ---
  if (showResult) {
    const earnedCoins = score * 10

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={containerStyle}
      >
        <div style={{ textAlign: 'center', padding: '40px 20px', position: 'relative' }}>
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.6 } }}
            style={{ fontSize: '5rem', marginBottom: '8px' }}
          >
            🏆
          </motion.div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '2rem', fontWeight: 800 }}>Ajoyib Natija!</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '32px' }}>
            Siz {quizzes.length} ta savoldan <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{score}</span> tasiga to'g'ri javob berdingiz.
          </p>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { delay: 0.4, type: 'spring' } }}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: 'white',
              borderRadius: '32px',
              fontWeight: 800,
              fontSize: '1.5rem',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)',
              marginBottom: '40px'
            }}
          >
            <Coins size={32} />
            + {earnedCoins} Tangalar
          </motion.div>

          <Button variant="secondary" onClick={handleRetry} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RefreshCw size={18} /> Qayta topshirish
          </Button>
        </div>
      </motion.div>
    )
  }

  // --- QUIZ PLAYER SCREEN ---
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
      transition={shake ? { duration: 0.4 } : { duration: 0.3 }}
      style={{ ...containerStyle, position: 'relative', overflow: 'hidden' }}
    >
      {/* Progress Bar Top Edge */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--border-soft)' }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: 'var(--color-accent)' }}
        />
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--color-primary)' }}>{currentIndex + 1}</span> / {quizzes.length}
          </span>
          <Badge variant="primary" style={{ background: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}>Test</Badge>
        </div>

        <h4 style={{ color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '1.25rem', fontWeight: 600, marginBottom: '32px' }}>
          {currentQuiz.question}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
          <AnimatePresence mode="popLayout">
            {options.map((option, idx) => {
              const isCorrect = option.key === currentQuiz.correct_option
              const isSelected = option.key === selectedOption
              
              let borderColor = 'var(--border-soft)'
              let background = 'var(--bg-elevated)'
              let color = 'var(--text-primary)'
              let outline = 'none'

              if (isRevealed) {
                if (isCorrect) {
                  borderColor = 'var(--color-success)'
                  background = 'rgba(16, 185, 129, 0.08)'
                  outline = '2px solid var(--color-success)'
                } else if (isSelected) {
                  borderColor = 'var(--color-error)'
                  background = 'rgba(239, 68, 68, 0.08)'
                  outline = '2px solid var(--color-error)'
                }
              } else if (isSelected) {
                borderColor = 'var(--color-primary)'
                background = 'var(--color-primary-dim)'
                outline = '2px solid var(--color-primary)'
              }

              return (
                <motion.button
                  key={option.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleOptionSelect(option.key)}
                  disabled={isRevealed}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    borderRadius: '20px',
                    border: `1px solid ${borderColor}`,
                    background: background,
                    color: color,
                    outline: outline,
                    outlineOffset: '-2px',
                    textAlign: 'left',
                    cursor: isRevealed ? 'default' : 'pointer',
                    transition: 'background 0.2s, transform 0.1s',
                    fontSize: '1rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                  whileTap={!isRevealed ? { scale: 0.98 } : {}}
                  whileHover={!isRevealed && !isSelected ? { backgroundColor: 'var(--bg-glass)' } : {}}
                >
                  <span style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: isRevealed && isCorrect ? 'var(--color-success)' : (isRevealed && isSelected ? 'var(--color-error)' : 'rgba(0,0,0,0.05)'),
                    color: isRevealed && (isCorrect || isSelected) ? 'white' : 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {isRevealed && isCorrect ? <CheckCircle2 size={18} /> : (isRevealed && isSelected ? <XCircle size={18} /> : option.key)}
                  </span>
                  <span style={{ flex: 1 }}>{option.label}</span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        <div style={{ minHeight: '80px' }}>
          {!isRevealed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button 
                variant={selectedOption ? "primary" : "secondary"} 
                disabled={!selectedOption} 
                onClick={handleCheck}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1.125rem' }}
              >
                Javobni tasdiqlash
              </Button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ 
                padding: '20px', 
                borderRadius: '16px', 
                background: selectedOption === currentQuiz.correct_option ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {selectedOption === currentQuiz.correct_option ? (
                  <CheckCircle2 color="var(--color-success)" style={{ marginTop: '2px' }} />
                ) : (
                  <XCircle color="var(--color-error)" style={{ marginTop: '2px' }} />
                )}
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: '6px', color: selectedOption === currentQuiz.correct_option ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {selectedOption === currentQuiz.correct_option ? 'Ajoyib!' : 'Noto\'g\'ri'}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    {currentQuiz.explanation || (selectedOption === currentQuiz.correct_option ? "To'g'ri javobni tanladingiz." : "Afsuski xato qildingiz. Keyingi savollarda e'tiborliroq bo'ling.")}
                  </p>
                </div>
              </div>

              <Button variant="primary" onClick={handleNext} style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                {currentIndex < quizzes.length - 1 ? 'Keyingi savol' : 'Natijani ko\'rish'} <ArrowRight size={20} />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const containerStyle = {
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '32px',
  boxShadow: 'var(--shadow-xl)'
}
