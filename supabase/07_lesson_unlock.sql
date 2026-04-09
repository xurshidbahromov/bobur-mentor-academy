-- ══════════════════════════════════════════════════════════════
-- 07_lesson_unlock.sql — Coin orqali darsni qulfdan chiqarish
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Darslarga 'coin_price' ustunini qo'shish
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS coin_price INT DEFAULT 5;

-- Bizdagi bor darslarning narxini qo'lda sozlab qoyamiz (ixtiyoriy)
UPDATE public.lessons SET coin_price = 10 WHERE title = 'Amallar va Tenglamalar';

-- 2. Coin yechib olib darsga ruxsat beruvchi xavfsiz funksiya (RPC)
CREATE OR REPLACE FUNCTION public.unlock_lesson_with_coins(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_coin_price INT;
  v_user_coins INT;
BEGIN
  -- 1) Joriy foydalanuvchini aniqlash
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Tizimga kirmagansiz (Not authenticated)';
  END IF;

  -- 2) Darsning coin narxini bilish
  SELECT coin_price INTO v_coin_price
  FROM public.lessons
  WHERE id = p_lesson_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dars topilmadi';
  END IF;

  -- Bepul narx bo'lsa to'g'ridan to'g'ri ruxsat
  IF v_coin_price <= 0 THEN
    INSERT INTO public.user_access (user_id, lesson_id)
    VALUES (v_user_id, p_lesson_id)
    ON CONFLICT DO NOTHING;
    RETURN TRUE;
  END IF;

  -- 3) Agar oldin xarid qilingan bo'lsa (ruxsat bor bo'lsa), qaytish
  IF EXISTS (SELECT 1 FROM public.user_access WHERE user_id = v_user_id AND lesson_id = p_lesson_id) THEN
    RETURN TRUE;
  END IF;

  -- 4) Foydalanuvchida qancha coin borligini tekshirish
  SELECT coins INTO v_user_coins
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_user_coins < v_coin_price THEN
    RAISE EXCEPTION 'Coin yetarli emas';
  END IF;

  -- 5) Coinlarni ayirish
  UPDATE public.profiles
  SET coins = coins - v_coin_price
  WHERE id = v_user_id;

  -- 6) Ruxsat berish
  INSERT INTO public.user_access (user_id, lesson_id)
  VALUES (v_user_id, p_lesson_id);

  RETURN TRUE;
END;
$$;
