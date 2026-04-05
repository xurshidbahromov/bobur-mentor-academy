-- ══════════════════════════════════════════════════════════════
-- 02_lessons.sql — Darslar jadvali
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.lessons (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id        UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT,
  youtube_video_id TEXT,
  is_free          BOOLEAN DEFAULT FALSE,
  is_published     BOOLEAN DEFAULT FALSE,
  order_index      INT DEFAULT 0,
  price            INT DEFAULT 0,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Published Lessons" ON public.lessons;
CREATE POLICY "Public Read Published Lessons" ON public.lessons
  FOR SELECT USING (is_published = true);
