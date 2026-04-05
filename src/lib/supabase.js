// src/lib/supabase.js
// Single Supabase client instance — import this everywhere you need DB access
// Never create multiple clients — one instance per app

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY required.\n' +
    'Create a .env.local file in the project root. See .env.example for reference.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
