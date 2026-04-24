-- ══════════════════════════════════════════════════════════════
-- 28_enable_realtime_profiles.sql — Real-time tangalarni yangilash
-- ══════════════════════════════════════════════════════════════

-- 'profiles' jadvali uchun Supabase Realtime funksiyasini yoqamiz.
-- Bu kod orqali admin tanga qo'shsa yoki o'quvchi tanga yig'sa,
-- ma'lumot sahifa yangilanmasdan turib darhol (real-time) ko'rinadi.

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
