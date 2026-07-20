-- ══════════════════════════════════════════════════════════════
-- 34_topic_quizzes.sql — Mustaqil mavzulashgan test to'plamlari
-- ══════════════════════════════════════════════════════════════

-- 1. To'plamlar jadvali
CREATE TABLE IF NOT EXISTS topic_quiz_sets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  icon_emoji  TEXT DEFAULT '📚',
  is_published BOOLEAN DEFAULT FALSE,
  order_index  INT  DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE topic_quiz_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads published topic_quiz_sets" ON topic_quiz_sets
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admin full access topic_quiz_sets" ON topic_quiz_sets
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert topic_quiz_sets" ON topic_quiz_sets FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update topic_quiz_sets" ON topic_quiz_sets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete topic_quiz_sets" ON topic_quiz_sets FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 2. Savollar jadvali
CREATE TABLE IF NOT EXISTS topic_quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id          UUID REFERENCES topic_quiz_sets(id) ON DELETE CASCADE,
  question        TEXT NOT NULL,
  option_a        TEXT NOT NULL,
  option_b        TEXT NOT NULL,
  option_c        TEXT NOT NULL,
  option_d        TEXT NOT NULL,
  correct_option  TEXT NOT NULL CHECK (correct_option IN ('a','b','c','d')),
  explanation     TEXT,
  image_url       TEXT,
  time_limit      INT DEFAULT 60,
  order_index     INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE topic_quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads topic_quiz_questions" ON topic_quiz_questions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM topic_quiz_sets s WHERE s.id = set_id AND s.is_published = TRUE)
  );

CREATE POLICY "Admin full access topic_quiz_questions" ON topic_quiz_questions
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin insert topic_quiz_questions" ON topic_quiz_questions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin update topic_quiz_questions" ON topic_quiz_questions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin delete topic_quiz_questions" ON topic_quiz_questions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
