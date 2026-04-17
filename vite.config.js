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
    // Code splitting: separate heavy vendor chunks
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':  ['react', 'react-dom'],
          'router':        ['react-router-dom'],
          'motion':        ['framer-motion'],
          'supabase':      ['@supabase/supabase-js'],
          'ui':            ['lucide-react', 'sonner'],
        }
      }
    },
    // Raise chunk size warning limit (our chunks are intentional)
    chunkSizeWarningLimit: 600,
    // Minification
    minify: 'esbuild',
    target: 'es2020',
    // Source maps only in dev
    sourcemap: false,
  },
  // Dependency pre-bundling
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
