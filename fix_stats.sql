CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'total_courses', (SELECT count(*) FROM public.courses),
    'total_lessons', (SELECT count(*) FROM public.lessons),
    'total_coins_in_circulation', (SELECT sum(coins) FROM public.profiles),
    'active_streaks', (SELECT count(*) FROM public.profiles WHERE streak_count > 0),
    'total_revenue', (SELECT COALESCE(sum(package_price), 0) FROM public.coin_requests WHERE status = 'approved'),
    'revenue_weekly', (
      SELECT jsonb_agg(t) FROM (
        SELECT to_char(d, 'DD.MM') as label, COALESCE(sum(package_price), 0) as amount
        FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') d
        LEFT JOIN public.coin_requests r ON r.created_at::date = d::date AND r.status = 'approved'
        GROUP BY d ORDER BY d
      ) t
    ),
    'revenue_monthly', (
      SELECT jsonb_agg(t) FROM (
        SELECT to_char(d, 'DD.MM') as label, COALESCE(sum(package_price), 0) as amount
        FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day') d
        LEFT JOIN public.coin_requests r ON r.created_at::date = d::date AND r.status = 'approved'
        GROUP BY d ORDER BY d
      ) t
    ),
    'revenue_yearly', (
      SELECT jsonb_agg(t) FROM (
        SELECT to_char(d, 'MM/YY') as label, COALESCE(sum(package_price), 0) as amount
        FROM generate_series(date_trunc('month', CURRENT_DATE - INTERVAL '11 months'), date_trunc('month', CURRENT_DATE), '1 month') d
        LEFT JOIN public.coin_requests r ON date_trunc('month', r.created_at::date) = d::date AND r.status = 'approved'
        GROUP BY d ORDER BY d
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
