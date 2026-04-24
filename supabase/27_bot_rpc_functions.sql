-- ══════════════════════════════════════════════════════════════
-- 27_bot_rpc_functions.sql — Bot buyruqlari uchun funksiyalar
-- ══════════════════════════════════════════════════════════════

-- 1. Telegram ID orqali profil ma'lumotlarini olish (RLS ni chetlab o'tish uchun)
CREATE OR REPLACE FUNCTION public.get_profile_by_telegram_id(p_tg_id TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  coins INT,
  streak_count INT,
  longest_streak INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.coins, p.streak_count, p.longest_streak
  FROM public.profiles p
  WHERE p.telegram_id = p_tg_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Admin uchun statistika (Jami o'quvchilar, bugungi ro'yxatdan o'tganlar, tangalar)
CREATE OR REPLACE FUNCTION public.get_bot_stats()
RETURNS JSON AS $$
DECLARE
  total_users INT;
  today_new_users INT;
  total_coins INT;
  result JSON;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO today_new_users FROM public.profiles WHERE created_at >= CURRENT_DATE;
  SELECT COALESCE(SUM(coins), 0) INTO total_coins FROM public.profiles;

  result := json_build_object(
    'total_users', total_users,
    'today_new_users', today_new_users,
    'total_coins', total_coins
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
