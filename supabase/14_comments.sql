-- ══════════════════════════════════════════════════════════════
-- 14_comments.sql — Izohlar (Comments) tizimi
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Comments jadvali
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id   UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id   UUID REFERENCES public.lessons(id) ON DELETE CASCADE, -- Kursning umumiy izohi bo'lsa null bo'ladi
  content     TEXT NOT NULL CHECK (char_length(content) > 0)
);

-- 2. Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Politikalar
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can post comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- Hamma ko'ra oladi
CREATE POLICY "Anyone can view comments"
  ON public.comments FOR SELECT
  USING (true);

-- Faqat login qilganlar o'z nomidan yoza oladi
CREATE POLICY "Users can post comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- O'z izohini o'chirish
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Indexlar (Tezkorlik uchun)
CREATE INDEX IF NOT EXISTS idx_comments_course ON public.comments(course_id);
CREATE INDEX IF NOT EXISTS idx_comments_lesson ON public.comments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments(created_at DESC);
