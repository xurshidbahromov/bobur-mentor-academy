-- ══════════════════════════════════════════════════════════════
-- 10_admin_roles.sql (REPAIRED & ENHANCED)
-- ══════════════════════════════════════════════════════════════

-- 1. Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' 
CHECK (role IN ('student', 'admin'));

-- 2. Security helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  -- SECURITY DEFINER bypasses RLS on the profiles table itself
  SELECT (role = 'admin') FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. RLS - Profiles policies
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR 
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- 4. Function to fetch admin dashboard statistics (Fixed with Revenue History)
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
    'active_streaks', (SELECT count(*) FROM public.profiles WHERE streak_count > 0),
    'total_revenue', (SELECT COALESCE(sum(package_price), 0) FROM public.coin_requests WHERE status = 'approved'),
    'revenue_weekly', (
      SELECT jsonb_agg(t) FROM (
        SELECT to_char(d, 'DD.MM') as label, COALESCE(sum(package_price), 0) as amount
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d
        LEFT JOIN public.coin_requests r ON date_trunc('day', r.created_at) = d AND r.status = 'approved'
        GROUP BY d ORDER BY d
      ) t
    ),
    'revenue_monthly', (
      SELECT jsonb_agg(t) FROM (
        SELECT to_char(d, 'DD.MM') as label, COALESCE(sum(package_price), 0) as amount
        FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') d
        LEFT JOIN public.coin_requests r ON date_trunc('day', r.created_at) = d AND r.status = 'approved'
        GROUP BY d ORDER BY d
      ) t
    ),
    'revenue_yearly', (
      SELECT jsonb_agg(t) FROM (
        SELECT to_char(d, 'MM/YY') as label, COALESCE(sum(package_price), 0) as amount
        FROM generate_series(date_trunc('month', CURRENT_DATE - INTERVAL '11 months'), date_trunc('month', CURRENT_DATE), '1 month') d
        LEFT JOIN public.coin_requests r ON date_trunc('month', r.created_at) = d AND r.status = 'approved'
        GROUP BY d ORDER BY d
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
