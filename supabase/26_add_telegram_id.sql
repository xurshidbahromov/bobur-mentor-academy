-- ══════════════════════════════════════════════════════════════
-- 26_add_telegram_id.sql — Telegram xabarlari uchun
-- ══════════════════════════════════════════════════════════════

-- 1. Profiles jadvaliga telegram_id ustunini qo'shish
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- 2. Eski ma'lumotlarni auth.users'dan yangilash (agar mavjud bo'lsa)
UPDATE public.profiles p
SET telegram_id = u.raw_user_meta_data->>'telegram_id'
FROM auth.users u
WHERE p.id = u.id AND u.raw_user_meta_data->>'telegram_id' IS NOT NULL;

-- 3. Trigger orqali avtomatik to'ldirishni yangilash
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, telegram_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'telegram_id'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Kunlik eslatma uchun foydalanuvchilarni olish (RPC)
CREATE OR REPLACE FUNCTION public.get_users_for_daily_reminder()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  telegram_id TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.telegram_id
  FROM public.profiles p
  WHERE p.telegram_id IS NOT NULL 
    AND (p.last_claimed_date IS NULL OR p.last_claimed_date < CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
