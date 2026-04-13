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
    background: glass ? 'rgba(255, 255, 255, 0.82)' : 'var(--bg-surface)',
    backdropFilter: glass ? 'blur(20px) saturate(2)' : 'none',
    WebkitBackdropFilter: glass ? 'blur(20px) saturate(2)' : 'none',
    border: '1.2px solid var(--border-medium)',
    borderRadius: 'var(--radius-card)',
    padding,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 8px 32px rgba(15, 23, 42, 0.05)',
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
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
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
