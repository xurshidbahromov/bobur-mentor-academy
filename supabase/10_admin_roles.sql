-- ══════════════════════════════════════════════════════════════
-- 10_admin_roles.sql
-- Role-based access control and Admin statistics
-- ══════════════════════════════════════════════════════════════

-- 1. Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' 
CHECK (role IN ('student', 'admin'));

-- 2. Function to fetch admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'total_courses', (SELECT count(*) FROM public.courses),
    'total_lessons', (SELECT count(*) FROM public.lessons),
    'total_coins_in_circulation', (SELECT sum(coins) FROM public.profiles),
    'active_streaks', (SELECT count(*) FROM public.profiles WHERE streak_count > 0)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 3. RLS - Admins can see all profiles
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. RLS - Admins can update all profiles
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- IMPORTANT: To make yourself an admin, run this in SQL Editor:
-- UPDATE public.profiles SET role = 'admin' WHERE full_name = 'Sizning Ismingiz';
