// src/components/ui/Card.jsx
// Premium glassmorphism card — Apple-inspired

export default function Card({ 
  children, 
  className = '', 
  style = {}, 
  hover = false,
  glass = true,
  padding = '28px',
  ...props 
}) {
  const baseStyle = {
    background: glass ? 'var(--bg-glass)' : 'var(--bg-surface)',
    backdropFilter: glass ? 'var(--blur-glass)' : 'none',
    WebkitBackdropFilter: glass ? 'var(--blur-glass)' : 'none',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-card)',
    padding,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: 'var(--shadow-glass)',
    ...style
  }

  return (
    <div 
      className={`ui-card ${hover ? 'ui-card--hover' : ''} ${className}`}
      style={baseStyle}
      {...props}
    >
      <style>
        {`
          .ui-card {
            transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                        border-color 0.35s ease;
          }
          .ui-card--hover:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-elevated);
            border-color: var(--border-medium);
          }
          .ui-card--hover:active {
            transform: scale(0.985) translateY(-1px);
            transition: transform 0.1s ease;
          }
        `}
      </style>
      {children}
    </div>
  )
}
