-- ══════════════════════════════════════════════════════════════
-- 24_smart_notifications.sql
-- Avtomatik Bildirishnomalar Tizimi
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────
-- 1. YANGI FOYDALANUVCHI TABRIK XABARI
-- profiles jadvaliga INSERT bo'lganda avtomatik tabrik xabari
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_welcome()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id,
    'Xush kelibsiz! 🎉',
    'Bobur Mentor Academy oilasiga qo''shilganingizdan xursandmiz! Har kuni dars oling va coinlar yig''ing.',
    'success'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_notify ON public.profiles;
CREATE TRIGGER on_profile_created_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.notify_welcome();


-- ──────────────────────────────────────────────────────────────
-- 2. STREAK MILESTONES (7, 14, 30 kunlik streak)
-- profiles jadvalidagi streak_count o'zgarganda tekshiradi
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_streak_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- 7 kunlik streak
  IF NEW.streak_count = 7 AND OLD.streak_count < 7 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '🔥 7 kunlik streak!',
      'Ajoyib! Siz 7 kun ketma-ket dars oldingiz. Shunday davom eting!',
      'success'
    );
  END IF;

  -- 14 kunlik streak
  IF NEW.streak_count = 14 AND OLD.streak_count < 14 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '⚡ 2 haftalik streak!',
      'Zo''r natija! 14 kun davomida har kuni o''qidingiz. Siz haqiqiy professional!',
      'success'
    );
  END IF;

  -- 30 kunlik streak
  IF NEW.streak_count = 30 AND OLD.streak_count < 30 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '🏆 30 kunlik streak! Legenda!',
      'Bir oy to''xtovsiz o''qidingiz — siz platformamizning eng topshirig''i o''quvchisiz! 🎖️',
      'success'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_streak_update_notify ON public.profiles;
CREATE TRIGGER on_streak_update_notify
  AFTER UPDATE OF streak_count ON public.profiles
  FOR EACH ROW
  WHEN (NEW.streak_count IS DISTINCT FROM OLD.streak_count)
  EXECUTE FUNCTION public.notify_streak_milestone();


-- ──────────────────────────────────────────────────────────────
-- 3. COIN MILESTONES (100, 500, 1000 coin)
-- profilesdagi coin o'zgarganda tekshiradi
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.notify_coin_milestone()
RETURNS TRIGGER AS $$
BEGIN
  -- Birinchi 10 coin (onboarding)
  IF NEW.coins >= 10 AND OLD.coins < 10 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '💰 Birinchi coinlaringiz!',
      'Do''koningizda endi kurslar sotib olishingiz mumkin. Coinlarni ko''paytiring!',
      'info'
    );
  END IF;

  -- 100 coin
  IF NEW.coins >= 100 AND OLD.coins < 100 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '💎 100 coin to''pladingiz!',
      'Siz 100 ta coin yig''ingiz! Do''konga kirib maxsus kurslarni ko''rib chiqing.',
      'success'
    );
  END IF;

  -- 500 coin
  IF NEW.coins >= 500 AND OLD.coins < 500 THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.id,
      '👑 500 coin! Super o''quvchi!',
      'Ajoyib natija — 500 ta coin! Siz platformamizning eng faol o''quvchilaridan birisiz.',
      'success'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_coin_update_notify ON public.profiles;
CREATE TRIGGER on_coin_update_notify
  AFTER UPDATE OF coins ON public.profiles
  FOR EACH ROW
  WHEN (NEW.coins IS DISTINCT FROM OLD.coins)
  EXECUTE FUNCTION public.notify_coin_milestone();


-- ──────────────────────────────────────────────────────────────
-- 4. DARS KIRISH HUQUQI BERILGANDA BILDIRISHNOMA
-- user_access jadvaliga INSERT bo'lganda (coin bilan ochilganda yoki admin orqali)
-- ──────────────────────────────────────────────────────────────
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

DROP TRIGGER IF EXISTS on_course_access_granted_notify ON public.user_access;
CREATE TRIGGER on_course_access_granted_notify
  AFTER INSERT ON public.user_access
  FOR EACH ROW EXECUTE FUNCTION public.notify_course_access();


-- ──────────────────────────────────────────────────────────────
-- 5. RPC: Admin tomonidan barcha userlarga xabar yuborish
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_role TEXT;
  v_count INT;
BEGIN
  -- Faqat admin chaqira oladi
  SELECT role INTO v_admin_role FROM public.profiles WHERE id = auth.uid();
  IF v_admin_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Faqat admin ruxsatiga ega!';
  END IF;

  -- Barcha foydalanuvchilarga xabar yuborish
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT id, p_title, p_message, p_type
  FROM public.profiles
  WHERE role != 'admin' OR role IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'sent_to', v_count);
END;
$$;
