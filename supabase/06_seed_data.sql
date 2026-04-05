-- ══════════════════════════════════════════════════════════════
-- 06_seed_data.sql — Namuna ma'lumotlar (ixtiyoriy)
-- Faqat birinchi marta ishlatiladi
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

INSERT INTO public.courses (title, description, is_published, lesson_count)
VALUES (
  'Matematika 0 dan 1 gacha',
  'Matematika kursini noldan o''rganing va poydevoringizni mustahkamlang.',
  true,
  2
)
ON CONFLICT DO NOTHING;

DO $$
DECLARE
  course_uuid   UUID;
  lesson_uuid_1 UUID;
  lesson_uuid_2 UUID;
BEGIN
  SELECT id INTO course_uuid
  FROM public.courses
  WHERE title = 'Matematika 0 dan 1 gacha'
  LIMIT 1;

  IF course_uuid IS NULL THEN
    RAISE NOTICE 'Course not found, skipping seed.';
    RETURN;
  END IF;

  -- Free lesson
  INSERT INTO public.lessons
    (course_id, title, description, youtube_video_id, is_free, is_published, order_index)
  VALUES
    (course_uuid, 'Kirish va Sonlar',
     'Matematik darsimizga xush kelibsiz. Sonlar va ularning turlari.',
     'dQw4w9WgXcQ', true, true, 1)
  ON CONFLICT DO NOTHING
  RETURNING id INTO lesson_uuid_1;

  -- Paid lesson
  INSERT INTO public.lessons
    (course_id, title, description, youtube_video_id, is_free, is_published, order_index, price)
  VALUES
    (course_uuid, 'Amallar va Tenglamalar',
     'Murakkabroq matematik amallarni o''rganamiz.',
     'dQw4w9WgXcQ', false, true, 2, 25000)
  ON CONFLICT DO NOTHING
  RETURNING id INTO lesson_uuid_2;

  -- Quizzes (only if lesson created)
  IF lesson_uuid_1 IS NOT NULL THEN
    INSERT INTO public.quizzes
      (lesson_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, order_index)
    VALUES
      (lesson_uuid_1, 'Eng kichik tub son qaysi?',
       '0', '1', '2', '3', 'c',
       'Tub son — faqat o''ziga va birga bo''linadigan son. Eng kichik tub son 2.', 1),
      (lesson_uuid_1, '2 + 2 * 2 natijasi qanday?',
       '8', '6', '4', '2', 'b',
       'Hisoblash tartibi: avval ko''paytirish (2*2=4), so''ng qo''shish (2+4=6).', 2);
  END IF;

END $$;
