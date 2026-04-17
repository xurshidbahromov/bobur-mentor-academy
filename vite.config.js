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
    minify: 'esbuild',
    target: 'es2020',
    sourcemap: false,
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

