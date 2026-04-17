-- ══════════════════════════════════════════════════════════════
-- 22_coin_requests.sql
-- Manual Payment System
-- ══════════════════════════════════════════════════════════════

CREATE TABLE public.coin_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_coins INTEGER NOT NULL,
    package_price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.coin_requests ENABLE ROW LEVEL SECURITY;

-- 1. Users can insert their own requests
CREATE POLICY "Users can insert their own requests" ON public.coin_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Users can view their own requests
CREATE POLICY "Users can view their own requests" ON public.coin_requests
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Admins can view all requests
CREATE POLICY "Admins can view all requests" ON public.coin_requests
    FOR SELECT USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 4. Admins can update all requests
CREATE POLICY "Admins can update all requests" ON public.coin_requests
    FOR UPDATE USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 5. RPC Function to Approve Request and Add Coins Atomically
CREATE OR REPLACE FUNCTION public.approve_coin_request(p_request_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request RECORD;
    v_admin_role TEXT;
BEGIN
    -- Check caller is admin
    SELECT role INTO v_admin_role FROM public.profiles WHERE id = auth.uid();
    IF v_admin_role IS DISTINCT FROM 'admin' THEN
        RAISE EXCEPTION 'Faqat admin ruxsatiga ega!';
    END IF;

    -- Get request
    SELECT * INTO v_request FROM public.coin_requests WHERE id = p_request_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'So''rov topilmadi.';
    END IF;

    IF v_request.status != 'pending' THEN
        RAISE EXCEPTION 'Ushbu so''rov allaqachon % holatida', v_request.status;
    END IF;

    -- Update request status
    UPDATE public.coin_requests 
    SET status = 'approved', updated_at = now()
    WHERE id = p_request_id;

    -- Give coins
    UPDATE public.profiles
    SET coins = COALESCE(coins, 0) + v_request.package_coins
    WHERE id = v_request.user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Tasdiqlandi va coinlar o''tkazildi.');
END;
$$;
