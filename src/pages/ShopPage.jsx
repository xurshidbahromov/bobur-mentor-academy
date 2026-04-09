import { motion } from 'framer-motion'
import { ShoppingBag, Coins, ArrowRight } from 'lucide-react'

const PACKAGES = [
  { coins: 50,  price: '9 900',  label: 'Starter', color: '#6366F1', popular: false },
  { coins: 200, price: '34 900', label: 'Popular',  color: '#3461FF', popular: true  },
  { coins: 500, price: '74 900', label: 'Pro',      color: '#8B5CF6', popular: false },
]

export default function ShopPage() {
  return (
    <div style={{ maxWidth: 620, margin: '0 auto', padding: '100px 20px 100px 20px' }}>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
        <div style={{ background: 'white', border: '1.5px solid rgba(100,120,255,0.1)', borderRadius: 20, padding: '22px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(217,119,6,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} color="#D97706" strokeWidth={1.75} />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>Coin sotib olish</p>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8125rem' }}>Click • Payme (Tez orada)</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PACKAGES.map(pkg => (
              <motion.button key={pkg.coins}
                whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => alert(`Tez orada! ${pkg.coins} coin = ${pkg.price} so'm`)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '13px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
                  border: pkg.popular ? `1.5px solid ${pkg.color}30` : '1.5px solid rgba(100,120,255,0.08)',
                  background: pkg.popular ? `${pkg.color}06` : 'transparent',
                  position: 'relative',
                }}
              >
                {pkg.popular && (
                  <span style={{ position: 'absolute', top: -1, right: 12, background: pkg.color, color: 'white', fontSize: '0.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: '0 0 6px 6px', letterSpacing: '0.06em' }}>
                    POPULAR
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: `${pkg.color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={18} color={pkg.color} strokeWidth={1.75} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 800, color: '#0F172A', fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{pkg.coins} Coin</p>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.8rem' }}>{pkg.label}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ margin: 0, fontWeight: 900, color: pkg.color, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>{pkg.price} so'm</p>
                  <ArrowRight size={16} color={pkg.color} strokeWidth={2.5} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
