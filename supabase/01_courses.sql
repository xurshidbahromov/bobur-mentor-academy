-- ══════════════════════════════════════════════════════════════
-- 01_courses.sql — Kurslar jadvali
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.courses (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  lesson_count INT DEFAULT 0,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Published Courses" ON public.courses;
CREATE POLICY "Public Read Published Courses" ON public.courses
  FOR SELECT USING (is_published = true);
