-- ══════════════════════════════════════════════════════════════
-- 32_bot_parent_queries.sql — Ota-ona bot so'rovlari uchun RPC
-- RLS ni xavfsiz chetlab o'tadi (SECURITY DEFINER)
-- ══════════════════════════════════════════════════════════════

-- 1. Telegram ID bo'yicha ota-onaning farzandlari va guruh ma'lumotlari
DROP FUNCTION IF EXISTS public.bot_get_parent_students(BIGINT);

CREATE OR REPLACE FUNCTION public.bot_get_parent_students(p_tg_id BIGINT)
RETURNS TABLE (
  student_id    UUID,
  student_name  TEXT,
  group_name    TEXT,
  schedule_days TEXT[],
  start_time    TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    g.name,
    g.schedule_days,
    g.start_time
  FROM public.crm_parents p
  JOIN public.crm_students s ON p.student_id = s.id
  LEFT JOIN public.crm_groups g ON s.group_id = g.id
  WHERE p.telegram_chat_id = p_tg_id
    AND p.is_verified = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. O'quvchi ID bo'yicha so'nggi 10 ta davomat yozuvi
DROP FUNCTION IF EXISTS public.bot_get_student_attendance(UUID);

CREATE OR REPLACE FUNCTION public.bot_get_student_attendance(p_student_id UUID)
RETURNS TABLE (
  lesson_date DATE,
  status      TEXT,
  note        TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.lesson_date, a.status, a.note
  FROM public.crm_attendance a
  WHERE a.student_id = p_student_id
  ORDER BY a.lesson_date DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
