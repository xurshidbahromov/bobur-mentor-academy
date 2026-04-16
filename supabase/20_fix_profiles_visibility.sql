-- ══════════════════════════════════════════════════════════════
-- 20_fix_profiles_visibility.sql — Profillarni ommaviy o'qishga ochish
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- Izoh yozganda ismlar "Foydalanuvchi" bo'lib qolmasligi uchun (RLS Blockni olib tashlaymiz)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view top profiles" ON public.profiles;

-- Hamma barcha profillarni o'qiy olsin (Ism va Rasm uchun majburiy)
CREATE POLICY "Public can view profiles" 
  ON public.profiles FOR SELECT 
  USING (true);
