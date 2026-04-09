-- ══════════════════════════════════════════════════════════════
-- 08_referrals_and_leaderboard.sql 
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. Profiles jadvaliga taklif tizimini qo'shish
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- 2. Referral qabul qilinganda ikkala tarafga ham coin berish funksiyasi
CREATE OR REPLACE FUNCTION public.handle_referral(p_referred_by_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_already_referred BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Foydalanuvchi o'z-o'zini taklif qila olmaydi
  IF v_user_id = p_referred_by_id THEN
    RETURN FALSE;
  END IF;

  -- Oldin taklif qilinganmi tekshiramiz
  SELECT (referred_by IS NOT NULL) INTO v_already_referred
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_already_referred THEN
    RETURN FALSE; -- Oldin allqachon kimdir orqali kirgan
  END IF;

  -- Taklif qilinganni saqlaymiz va unga 10 Coin beramiz
  UPDATE public.profiles
  SET referred_by = p_referred_by_id,
      coins = coins + 10
  WHERE id = v_user_id;

  -- Taklif qilgan insonga ham (Referrer) 15 Coin beramiz
  UPDATE public.profiles
  SET coins = coins + 15
  WHERE id = p_referred_by_id;

  RETURN TRUE;
END;
$$;

-- 3. Liderlar doskasi (Leaderboard) uchun ochiq ruxsat berilishi kerak
-- (Barcha userlar top oynalarini ko'rishini ta'minlash)
DROP POLICY IF EXISTS "Public can view top profiles" ON public.profiles;
CREATE POLICY "Public can view top profiles" 
  ON public.profiles FOR SELECT 
  USING (true);
