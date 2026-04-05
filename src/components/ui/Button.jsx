// src/components/ui/Button.jsx
// Premium Apple-style button with Framer Motion press animation + ripple effect

import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  style = {},
  ...props 
}) {
  const [ripples, setRipples] = React.useState([])
  const [isHovered, setIsHovered] = React.useState(false)
  const btnRef = useRef(null)

  const sizes = {
    sm: { padding: '7px 16px',  fontSize: '0.875rem',  letterSpacing: '-0.005em' },
    md: { padding: '11px 24px', fontSize: '0.9375rem', letterSpacing: '-0.01em'  },
    lg: { padding: '15px 32px', fontSize: '1rem',      letterSpacing: '-0.01em'  },
  }

  const variants = {
    primary: {
      background: isHovered && !disabled ? '#2450e8' : '#3461FF',
      color: 'white',
      boxShadow: isHovered && !disabled
        ? '0 6px 20px rgba(52,97,255,0.45)'
        : '0 3px 12px rgba(52,97,255,0.25)',
    },
    secondary: {
      background: isHovered && !disabled ? '#f0f4ff' : '#FFFFFF',
      color: '#0F172A',
      border: '1px solid rgba(100,120,255,0.2)',
      boxShadow: isHovered && !disabled
        ? '0 4px 16px rgba(52,97,255,0.12)'
        : '0 2px 8px rgba(0,0,0,0.06)',
    },
    ghost: {
      background: isHovered && !disabled ? 'rgba(52,97,255,0.08)' : 'transparent',
      color: isHovered && !disabled ? '#3461FF' : '#4B5E84',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    danger: {
      background: isHovered && !disabled ? '#DC2626' : 'rgba(239,68,68,0.08)',
      color: isHovered && !disabled ? 'white' : '#EF4444',
      border: '1px solid rgba(239,68,68,0.2)',
      boxShadow: 'none',
    },
  }

  // Ripple colors per variant
  const rippleColor = {
    primary:   'rgba(255,255,255,0.35)',
    secondary: 'rgba(52,97,255,0.15)',
    ghost:     'rgba(52,97,255,0.12)',
    danger:    'rgba(255,255,255,0.3)',
  }[variant] || 'rgba(255,255,255,0.3)'

  const handleClick = (e) => {
    if (disabled) return
    const btn = btnRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600)

    onClick?.(e)
  }

  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <motion.button
      ref={btnRef}
      type={type}
      disabled={disabled}
      className={className}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // Framer Motion spring physics on press
      whileTap={disabled ? {} : { scale: 0.94 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      style={{
        // Layout
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        // Shape
        borderRadius: '9999px',
        border: 'none',
        outline: 'none',
        // Text
        fontWeight: 600,
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        // State
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        // Position (for ripple)
        position: 'relative',
        overflow: 'hidden',
        // Apply variant + size + custom
        ...v,
        ...s,
        ...style,
      }}
      {...props}
    >
      {/* Ripple layer */}
      <AnimatePresence>
        {ripples.map(({ id, x, y }) => (
          <motion.span
            key={id}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: rippleColor,
              transform: 'translate(-50%, -50%)',
              left: x,
              top: y,
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content on top of ripple */}
      <span style={{ position: 'relative', zIndex: 1, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        {children}
      </span>
    </motion.button>
  )
}
