-- ========================================================================================
-- 30_rating_score.sql
-- Description: Adds rating_score (XP) to profiles and creates RPC for quiz submission
-- ========================================================================================

-- 1. Add rating_score to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating_score INT DEFAULT 0;

-- 2. Create RPC function to finish daily quiz attempt and increment rating_score securely
--    This prevents users from tampering with their score arbitrarily.
CREATE OR REPLACE FUNCTION finish_daily_quiz_attempt(
    p_attempt_id UUID,
    p_score INT,
    p_time_ms INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_daily_quiz_id UUID;
    v_completed_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get the attempt details
    SELECT user_id, daily_quiz_id, completed_at
    INTO v_user_id, v_daily_quiz_id, v_completed_at
    FROM public.daily_quiz_attempts
    WHERE id = p_attempt_id;

    -- If attempt doesn't exist, fail
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Attempt not found';
    END IF;

    -- Ensure the user owns this attempt
    IF v_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Prevent submitting a score multiple times for the same attempt
    IF v_completed_at IS NOT NULL THEN
        RAISE EXCEPTION 'Attempt already completed';
    END IF;

    -- Update the attempt
    UPDATE public.daily_quiz_attempts
    SET 
        score = p_score,
        time_taken_ms = p_time_ms,
        completed_at = now()
    WHERE id = p_attempt_id;

    -- Add the score to the user's rating_score
    UPDATE public.profiles
    SET rating_score = COALESCE(rating_score, 0) + p_score
    WHERE id = v_user_id;

    RETURN TRUE;
END;
$$;
