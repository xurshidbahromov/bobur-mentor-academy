-- ══════════════════════════════════════════════════════════════
-- 04_user_access.sql — Foydalanuvchi kirish huquqlari jadvali
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_access (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id  UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own access" ON public.user_access;
CREATE POLICY "Users view own access" ON public.user_access
  FOR SELECT USING (auth.uid() = user_id);
