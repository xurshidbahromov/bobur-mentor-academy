-- 35_attendance_reminder.sql
-- Davomat eslatmasi: har kuni dars tugashiga 15 daqiqa qolganida
-- Vercel Cron (api/attendance-cron.js) bu RPC ni chaqiradi

-- 1. Eslatma yuborilganini kuzatish uchun jadval (takror xabar ketmasin)
CREATE TABLE IF NOT EXISTS public.attendance_reminders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id      UUID REFERENCES public.crm_groups(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  sent_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (group_id, reminder_date)
);

ALTER TABLE public.attendance_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only" ON public.attendance_reminders
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Bugun eslatma kerak bo'lgan guruhlarni topuvchi RPC
DROP FUNCTION IF EXISTS public.get_groups_needing_reminder();
CREATE OR REPLACE FUNCTION public.get_groups_needing_reminder()
RETURNS TABLE (
  group_id         UUID,
  group_name       TEXT,
  end_time         TEXT,
  attendance_count BIGINT,
  student_count    BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_name TEXT;
BEGIN
  today_name := CASE EXTRACT(DOW FROM CURRENT_DATE)
    WHEN 1 THEN 'Dushanba'
    WHEN 2 THEN 'Seshanba'
    WHEN 3 THEN 'Chorshanba'
    WHEN 4 THEN 'Payshanba'
    WHEN 5 THEN 'Juma'
    WHEN 6 THEN 'Shanba'
    WHEN 0 THEN 'Yakshanba'
  END;

  RETURN QUERY
  SELECT
    g.id,
    g.name,
    g.end_time,
    COUNT(DISTINCT a.student_id) AS attendance_count,
    COUNT(DISTINCT s.id)         AS student_count
  FROM public.crm_groups g
  LEFT JOIN public.crm_students s   ON s.group_id = g.id
  LEFT JOIN public.crm_attendance a ON a.group_id = g.id AND a.lesson_date = CURRENT_DATE
  LEFT JOIN public.attendance_reminders ar ON ar.group_id = g.id AND ar.reminder_date = CURRENT_DATE
  WHERE
    g.is_active = TRUE
    AND g.end_time IS NOT NULL
    AND today_name = ANY(g.schedule_days)
    AND ar.group_id IS NULL  -- bugun hali eslatma yuborilmagan
    AND (
      to_timestamp(CURRENT_DATE::TEXT || ' ' || g.end_time, 'YYYY-MM-DD HH24:MI')
      - INTERVAL '15 minutes'
    ) <= NOW()
  GROUP BY g.id, g.name, g.end_time;
END;
$$;
