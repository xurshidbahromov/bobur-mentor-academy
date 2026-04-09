-- ══════════════════════════════════════════════════════════════
-- 11_admin_rls.sql
-- Admin-only permissions for courses and lessons
-- ══════════════════════════════════════════════════════════════

-- 1. Courses RLS
DROP POLICY IF EXISTS "Admins can do everything with courses" ON public.courses;
CREATE POLICY "Admins can do everything with courses"
  ON public.courses
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 2. Lessons RLS
DROP POLICY IF EXISTS "Admins can do everything with lessons" ON public.lessons;
CREATE POLICY "Admins can do everything with lessons"
  ON public.lessons
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 3. Quizzes RLS
DROP POLICY IF EXISTS "Admins can do everything with quizzes" ON public.quizzes;
CREATE POLICY "Admins can do everything with quizzes"
  ON public.quizzes
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
