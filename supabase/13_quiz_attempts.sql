-- ══════════════════════════════════════════════════════════════
-- 13_quiz_attempts.sql — Test urinishlari jadvali
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. quiz_attempts jadvali
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id       UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  score           INT NOT NULL DEFAULT 0,
  total           INT NOT NULL DEFAULT 0,
  time_spent_sec  INT NOT NULL DEFAULT 0,
  answers         JSONB,           -- { "quiz_id": "a", ... }
  completed       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. RLS
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own attempts"   ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users insert own attempts" ON public.quiz_attempts;

CREATE POLICY "Users view own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Best score view (leaderboard uchun foydali)
CREATE OR REPLACE VIEW public.quiz_best_scores AS
SELECT
  user_id,
  lesson_id,
  MAX(score) AS best_score,
  MAX(total)  AS total,
  COUNT(*)    AS attempt_count
FROM public.quiz_attempts
GROUP BY user_id, lesson_id;

GRANT SELECT ON public.quiz_best_scores TO authenticated;
