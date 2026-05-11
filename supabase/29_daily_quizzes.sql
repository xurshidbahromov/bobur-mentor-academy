-- ========================================================================================
-- 29_daily_quizzes.sql
-- Description: Kunlik testlar (Daily Challenge) va ularning urinishlari uchun jadvallar
-- ========================================================================================

-- 1. daily_quizzes jadvali
CREATE TABLE IF NOT EXISTS public.daily_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    quiz_date DATE NOT NULL UNIQUE, -- Bir kunda faqat bitta test bo'ladi
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    entry_fee_coins INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. daily_quiz_attempts jadvali
CREATE TABLE IF NOT EXISTS public.daily_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    daily_quiz_id UUID REFERENCES public.daily_quizzes(id) ON DELETE CASCADE NOT NULL,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    time_taken_ms INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, daily_quiz_id) -- Bitta user bitta daily quizga faqat 1 marta kira oladi
);

-- RLS Enable
ALTER TABLE public.daily_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- RLS POLICIES FOR daily_quizzes
-- ====================================================================

-- Hamma o'quvchilar aktiv daily_quiz larni ko'ra oladi
CREATE POLICY "Users can view active daily quizzes"
    ON public.daily_quizzes FOR SELECT
    USING (is_active = true);

-- Admin hamma amallarni bajara oladi
CREATE POLICY "Admins can do everything on daily_quizzes"
    ON public.daily_quizzes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ====================================================================
-- RLS POLICIES FOR daily_quiz_attempts
-- ====================================================================

-- Hamma barcha natijalarni ko'ra oladi (Reyting uchun kerak!)
CREATE POLICY "Users can view all attempts for leaderboard"
    ON public.daily_quiz_attempts FOR SELECT
    TO authenticated
    USING (true);

-- User faqat o'ziga attempt qo'shishi mumkin
CREATE POLICY "Users can insert their own attempts"
    ON public.daily_quiz_attempts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- User o'zining attemptini update qila oladi (Test tugatilganda)
CREATE POLICY "Users can update their own attempts"
    ON public.daily_quiz_attempts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Adminlar barchasini ko'ra oladi/boshqaradi
CREATE POLICY "Admins can do everything on attempts"
    ON public.daily_quiz_attempts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ====================================================================
-- RPC FUNCTION FOR DEDUCTING ENTRY FEE (Coin to'lash uchun)
-- ====================================================================
CREATE OR REPLACE FUNCTION pay_daily_quiz_fee(p_user_id UUID, p_fee INT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS to update coins
AS $$
DECLARE
    current_coins INT;
BEGIN
    -- Narx 0 bo'lsa, bepul kiradi
    IF p_fee <= 0 THEN
        RETURN TRUE;
    END IF;

    -- Userning joriy coinlarini olish
    SELECT coins INTO current_coins FROM public.profiles WHERE id = p_user_id;

    IF current_coins >= p_fee THEN
        -- Coin yechib olish
        UPDATE public.profiles SET coins = coins - p_fee WHERE id = p_user_id;
        RETURN TRUE;
    ELSE
        -- Pul yetarli emas
        RETURN FALSE;
    END IF;
END;
$$;
