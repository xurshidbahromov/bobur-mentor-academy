// src/components/ui/Badge.jsx
// Pill badge primitive for states and counts

export default function Badge({ 
  children, 
  variant = 'default', // 'default' | 'success' | 'error' | 'accent' | 'primary'
  className = '',
  style = {},
  ...props 
}) {
  const variants = {
    default: {
      background: 'var(--color-lock)',
      color: 'var(--text-secondary)',
    },
    success: {
      background: 'var(--color-success-dim)',
      color: 'var(--color-success)',
    },
    error: {
      background: 'var(--color-error-dim)',
      color: 'var(--color-error)',
    },
    accent: {
      background: 'var(--color-accent-dim)',
      color: 'var(--color-accent)',
    },
    primary: {
      background: 'var(--color-primary-dim)',
      color: 'var(--color-primary)',
    }
  }

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    ...variants[variant],
    ...style
  }

  return (
    <span className={className} style={baseStyle} {...props}>
      {children}
    </span>
  )
}
