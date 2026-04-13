-- ══════════════════════════════════════════════════════════════
-- 11_general_quizzes.sql — Umumiy Quizlar uchun is_general column
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. quizzes jadvaliga is_general ustunini qo'shing
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS is_general BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. time_limit ustunini ham qo'shing (agar avval qo'shilmagan bo'lsa)
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS time_limit INT DEFAULT 600;

-- 3. Indeks — tezkor qidirish uchun
CREATE INDEX IF NOT EXISTS idx_quizzes_is_general ON public.quizzes(is_general);

-- 4. Tekshirish: umumiy quizlar sonini ko'rish
-- SELECT COUNT(*) FROM public.quizzes WHERE is_general = TRUE;
