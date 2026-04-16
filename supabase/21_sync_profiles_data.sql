-- ══════════════════════════════════════════════════════════════
-- 21_sync_profiles_data.sql — Eslkdan qolgan profillarni yangilash
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- Barcha foydalanuvchilarning Google/Email dagi nomlarini public.profiles jadvaliga zudlik bilan yozish xamda avatarlarini yangilash.
-- Bu faqat bo'sh (null) ismlarni Auth hisobidan olib to'ldirib qo'yadi.

UPDATE public.profiles p
SET 
  full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  avatar_url = COALESCE(p.avatar_url, u.raw_user_meta_data->>'avatar_url')
FROM auth.users u
WHERE p.id = u.id;
