-- ══════════════════════════════════════════════════════════════
-- 31_bot_verify_parent.sql — Ota-onani bot orqali xavfsiz tasdiqlash
-- ══════════════════════════════════════════════════════════════

-- Bot anonim API key ishlatsa ham, crm_parents jadvalini o'qishi
-- va yangilashi uchun maxsus SECURITY DEFINER funksiya.
-- RLS (Row Level Security) ni xavfsiz chetlab o'tadi.

CREATE OR REPLACE FUNCTION public.bot_verify_parent_phone(
  p_phones TEXT[],
  p_tg_id BIGINT
)
RETURNS TABLE (
  parent_id UUID,
  student_name TEXT
) AS $$
DECLARE
  v_parent_id UUID;
BEGIN
  -- Topilgan birinchi ota-onani ID sini olish (qidiruv ro'yxatidan)
  SELECT id INTO v_parent_id
  FROM public.crm_parents
  WHERE phone = ANY(p_phones)
  LIMIT 1;

  -- Agar ota-ona topilsa, uning telegram ID sini yangilash va tasdiqlash
  IF v_parent_id IS NOT NULL THEN
    UPDATE public.crm_parents
    SET telegram_chat_id = p_tg_id,
        is_verified = TRUE,
        verified_at = NOW()
    WHERE id = v_parent_id;

    -- Uning barcha o'quvchilarini qaytarish
    RETURN QUERY
    SELECT p.id as parent_id, s.full_name as student_name
    FROM public.crm_parents p
    JOIN public.crm_students s ON p.student_id = s.id
    WHERE p.id = v_parent_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
