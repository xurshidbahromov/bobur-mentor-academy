import { motion } from 'framer-motion'

export default function PageSkeleton() {
  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '100px 20px 100px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <SkeletonCircle size={64} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBar width="60%" height={24} />
          <SkeletonBar width="40%" height={16} />
        </div>
      </div>

      {/* Cards Skeleton */}
      <SkeletonCard height={120} />
      <SkeletonCard height={120} />
      
      {/* List Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        <SkeletonBar width={100} height={20} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
        <SkeletonCard height={80} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

const SkeletonBase = ({ style }) => (
  <motion.div
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
    style={{
      background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite',
      ...style
    }}
  />
)

const SkeletonBar = ({ width, height }) => (
  <SkeletonBase style={{ width, height, borderRadius: 8 }} />
)

const SkeletonCircle = ({ size }) => (
  <SkeletonBase style={{ width: size, height: size, borderRadius: '50%' }} />
)

const SkeletonCard = ({ height }) => (
  <SkeletonBase style={{ width: '100%', height, borderRadius: 24, border: '1.5px solid rgba(148,163,184,0.1)' }} />
)
