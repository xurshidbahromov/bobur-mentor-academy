import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    // Vite 8 uses Oxc/rolldown by default — fastest minifier, no config needed
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core — most stable, longest cache life
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'react-vendor'
          }
          // Framer motion — large animation library, rarely changes
          if (id.includes('node_modules/framer-motion')) {
            return 'motion'
          }
          // Supabase — auth + DB client
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
          // React Query — data fetching
          if (id.includes('node_modules/@tanstack')) {
            return 'query'
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-router-dom')) {
            return 'router'
          }
          // Lucide icons — large icon set
          if (id.includes('node_modules/lucide-react')) {
            return 'icons'
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', '@supabase/supabase-js',
      'lucide-react', 'sonner',
      '@vercel/analytics/react',
      '@vercel/speed-insights/react',
    ],
  },
})

