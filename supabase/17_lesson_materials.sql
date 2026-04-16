-- ══════════════════════════════════════════════════════════════
-- 17_lesson_materials.sql — Darslarga material (fayl) biriktirish
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. `lessons` jadvaliga `materials` kolonkasini JSONB qilib qo'shish
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS materials JSONB DEFAULT '[]'::jsonb;

-- 2. 'lesson_materials' nomli ommaviy (public) bucket yaratish
-- Eslatma: Agar storage.buckets jadvali mavjud bo'lmasa, uni Supabase panelidan Storage -> New Bucket qilib qo'lda yarating (Public qiling).
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson_materials', 'lesson_materials', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Yuklash siyosati (Faqat autentifikatsiyadan o'tganlar, masalan Adminlar)
CREATE POLICY "Adminlar material yuklay oladi" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'lesson_materials');

-- 4. Ko'rish siyosati (Barcha uchun ochiq, url orqali tortish uchun)
CREATE POLICY "Barcha materiallarni ko'ra oladi" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'lesson_materials');

-- 5. O'chirish siyosati
CREATE POLICY "Adminlar materialni o'chira oladi" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'lesson_materials');
