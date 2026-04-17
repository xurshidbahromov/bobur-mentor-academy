-- ══════════════════════════════════════════════════════════════
-- 23_notifications.sql
-- Real-time Notifications System
-- ══════════════════════════════════════════════════════════════

-- 1. Create table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('success', 'info', 'warning', 'error')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can select their own notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Admins can do anything
CREATE POLICY "Admins can manage notifications" ON public.notifications
    FOR ALL USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- 3. Enable realtime for notifications
-- (Need to ensure the publication exists and add the table)
BEGIN;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'notifications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END
$$;
COMMIT;

-- 4. Create an RPC to mark all as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.notifications 
    SET is_read = true 
    WHERE user_id = auth.uid() AND is_read = false;
$$;

-- 5. Modify existing approve_coin_request to also insert a notification
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

    -- Insert Real-time notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        v_request.user_id,
        'To''lov tasdiqlandi 🎉',
        v_request.package_coins || ' coin hisobingizga muvaffaqiyatli qo''shildi!',
        'success'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Tasdiqlandi va coinlar o''tkazildi.');
END;
$$;
