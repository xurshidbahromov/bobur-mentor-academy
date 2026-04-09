-- ══════════════════════════════════════════════════════════════
-- 09_video_progress.sql
-- Video darslardagi progressni saqlash tizimi
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id         UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  last_pos_seconds  INT DEFAULT 0 NOT NULL,
  is_completed      BOOLEAN DEFAULT FALSE NOT NULL,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

-- RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own progress" ON public.lesson_progress;
CREATE POLICY "Users view own progress" ON public.lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own progress" ON public.lesson_progress;
CREATE POLICY "Users update own progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress modify" ON public.lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);
  
-- RPC to upsert progress
CREATE OR REPLACE FUNCTION public.upsert_lesson_progress(
  p_lesson_id UUID,
  p_pos_seconds INT,
  p_is_completed BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.lesson_progress (user_id, lesson_id, last_pos_seconds, is_completed, updated_at)
  VALUES (auth.uid(), p_lesson_id, p_pos_seconds, p_is_completed, now())
  ON CONFLICT (user_id, lesson_id)
  DO UPDATE SET
    last_pos_seconds = EXCLUDED.last_pos_seconds,
    is_completed = EXCLUDED.is_completed OR public.lesson_progress.is_completed, -- once completed, stays completed
    updated_at = EXCLUDED.updated_at;
END;
$$;
