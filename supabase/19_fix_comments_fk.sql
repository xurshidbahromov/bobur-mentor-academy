-- ══════════════════════════════════════════════════════════════
-- 19_fix_comments_fk.sql — Izohlarda user ma'lumotlarini (avatar/ism) olishni to'g'rilash
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- Izohlar (comments) jadvalida user_id auth.users ga qarab qolgan edi.
-- Profil ma'lumotlari (full_name, avatar_url) ni React da oson tortib olish uchun
-- Foreign key ni public.profiles jadvaliga uzatamiz.

ALTER TABLE public.comments 
  DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE public.comments 
  ADD CONSTRAINT comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
