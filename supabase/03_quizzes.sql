-- ══════════════════════════════════════════════════════════════
-- 03_quizzes.sql — Testlar jadvali
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.quizzes (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id      UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  question       TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT,
  option_d       TEXT,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  explanation    TEXT,
  order_index    INT DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Quizzes" ON public.quizzes;
CREATE POLICY "Public Read Quizzes" ON public.quizzes
  FOR SELECT USING (true);
