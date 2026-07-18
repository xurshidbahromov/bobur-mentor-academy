-- ============================================
-- Bobur Mentor Academy — CRM Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Groups Table
CREATE TABLE crm_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  schedule_days TEXT[],          -- ['Dushanba', 'Chorshanba', 'Juma']
  start_time    TEXT,            -- '14:00'
  end_time      TEXT,            -- '16:00'
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Students Table
CREATE TABLE crm_students (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID REFERENCES crm_groups(id) ON DELETE CASCADE,
  full_name  TEXT NOT NULL,
  phone      TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Parents Table (phone entered by admin, telegram linked via bot)
CREATE TABLE crm_parents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES crm_students(id) ON DELETE CASCADE UNIQUE,
  phone            TEXT NOT NULL,
  telegram_chat_id BIGINT,
  is_verified      BOOLEAN DEFAULT FALSE,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- 4. Attendance Table
CREATE TABLE crm_attendance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  UUID REFERENCES crm_students(id) ON DELETE CASCADE,
  group_id    UUID REFERENCES crm_groups(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
  note        TEXT,
  notified_at TIMESTAMPTZ,       -- When parent was notified
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, lesson_date)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE crm_groups     ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_students   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_parents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_attendance ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access on crm_groups" ON crm_groups
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access on crm_students" ON crm_students
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access on crm_parents" ON crm_parents
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin full access on crm_attendance" ON crm_attendance
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow insert for admin
CREATE POLICY "Admin insert crm_groups" ON crm_groups FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert crm_students" ON crm_students FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert crm_parents" ON crm_parents FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert crm_attendance" ON crm_attendance FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Allow update/delete for admin
CREATE POLICY "Admin update crm_groups" ON crm_groups FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update crm_students" ON crm_students FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update crm_parents" ON crm_parents FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update crm_attendance" ON crm_attendance FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete crm_students" ON crm_students FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete crm_groups" ON crm_groups FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Bot service role can update parents (for telegram_chat_id)
-- This uses service role key in the bot — no RLS needed there

-- ============================================
-- Helper: Get group attendance summary
-- ============================================
CREATE OR REPLACE FUNCTION get_group_attendance_stats(p_group_id UUID, p_date DATE)
RETURNS TABLE(
  student_id UUID,
  full_name  TEXT,
  status     TEXT,
  note       TEXT
) LANGUAGE sql AS $$
  SELECT 
    s.id,
    s.full_name,
    a.status,
    a.note
  FROM crm_students s
  LEFT JOIN crm_attendance a 
    ON a.student_id = s.id AND a.lesson_date = p_date
  WHERE s.group_id = p_group_id
  ORDER BY s.full_name;
$$;
