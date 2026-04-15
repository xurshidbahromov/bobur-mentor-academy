-- ══════════════════════════════════════════════════════════════
-- 15_quiz_image_support.sql — Test savollariga rasm qo'shish
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- Savollar jadvaliga image_url ustunini qo'shish
ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Izoh: Matematika va boshqa fanlar uchun chizmalar/diagrammalar linkini saqlash uchun.
