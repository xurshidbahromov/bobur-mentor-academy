-- ══════════════════════════════════════════════════════════════
-- 25_fix_lesson_trigger.sql
-- "course_id" xatoligini to'g'rilaydi. "user_access" jadvalida faqat "lesson_id" bor.
-- KODNI NUXSALAB SUPABASE SQL EDITORIDA ISHGA TUSHIRING!
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_course_access()
RETURNS TRIGGER AS $$
DECLARE
  v_lesson_title TEXT;
BEGIN
  -- Dars nomini olish
  SELECT title INTO v_lesson_title FROM public.lessons WHERE id = NEW.lesson_id;

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.user_id,
    '🔓 Dars qulfdan chiqarildi!',
    '"' || COALESCE(v_lesson_title, 'Yangi dars') || '" darsi muvaffaqiyatli ochildi. Darsni boshlashingiz mumkin!',
    'success'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
