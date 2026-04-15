-- ══════════════════════════════════════════════════════════════
-- 16_storage_setup.sql — Test rasmlari uchun Storage sozlash
-- Supabase SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- 1. 'quizzes' nomli ommaviy (public) bucket yaratish
-- Eslatma: Agar storage.buckets jadvali mavjud bo'lmasa, uni Supabase panelidan qo'lda yaratish kerak.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quizzes', 'quizzes', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Yuklash siyosati (Faqat autentifikatsiyadan o'tgan adminlar uchun)
-- Admin paneli ochiq ekanligini hisobga olib, oddiy authenticated userlarga ruxsat beramiz.
CREATE POLICY "Adminlar rasm yuklay oladi" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'quizzes');

-- 3. Ko'rish siyosati (Barcha uchun ochiq)
CREATE POLICY "Barcha rasmlarni ko'ra oladi" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'quizzes');

-- 4. O'chirish siyosati
CREATE POLICY "Adminlar rasmlarni o'chira oladi" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'quizzes');
