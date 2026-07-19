-- ══════════════════════════════════════════════════════════════
-- 33_homework.sql — Uyga vazifa / Dars holati jadvali
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS crm_homework (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES crm_students(id) ON DELETE CASCADE,
  group_id    UUID REFERENCES crm_groups(id)   ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  done        BOOLEAN DEFAULT FALSE,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, lesson_date)
);

ALTER TABLE crm_homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on crm_homework" ON crm_homework
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert crm_homework" ON crm_homework FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update crm_homework" ON crm_homework FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete crm_homework" ON crm_homework FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Bot RPC: o'quvchining so'nggi 10 ta darsidagi vazifa holati + izoh
DROP FUNCTION IF EXISTS public.bot_get_student_homework(UUID);

CREATE OR REPLACE FUNCTION public.bot_get_student_homework(p_student_id UUID)
RETURNS TABLE (
  lesson_date DATE,
  done        BOOLEAN,
  note        TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT h.lesson_date, h.done, h.note
  FROM public.crm_homework h
  WHERE h.student_id = p_student_id
  ORDER BY h.lesson_date DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
