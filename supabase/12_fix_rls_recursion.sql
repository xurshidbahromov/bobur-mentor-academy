-- ══════════════════════════════════════════════════════════════
-- 12_fix_rls_recursion.sql
-- Fixes "infinite recursion" by using a security definer function
-- ══════════════════════════════════════════════════════════════

-- 1. Create a helper function to check admin status without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. Update Profiles Policies
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR is_admin()
  );

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  USING (is_admin());

-- 3. Update Courses Policies
DROP POLICY IF EXISTS "Admins can do everything with courses" ON public.courses;
CREATE POLICY "Admins can do everything with courses"
  ON public.courses
  FOR ALL
  USING (is_admin());

-- 4. Update Lessons Policies
DROP POLICY IF EXISTS "Admins can do everything with lessons" ON public.lessons;
CREATE POLICY "Admins can do everything with lessons"
  ON public.lessons
  FOR ALL
  USING (is_admin());

-- 5. Update Quizzes Policies
DROP POLICY IF EXISTS "Admins can do everything with quizzes" ON public.quizzes;
CREATE POLICY "Admins can do everything with quizzes"
  ON public.quizzes
  FOR ALL
  USING (is_admin());
