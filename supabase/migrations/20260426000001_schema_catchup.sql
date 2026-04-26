-- Schema catchup migration
-- Adds columns, tables, and RPC functions that were referenced by application code
-- but missing from the migration history. Idempotent so it is safe on environments
-- where these were already applied out-of-band via the Supabase dashboard.

-- ============================================================================
-- 1. profiles: admin flag, display name, preferred categories
-- ============================================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS preferred_categories TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS profiles_is_admin_idx ON profiles(is_admin) WHERE is_admin = TRUE;

-- ============================================================================
-- 2. courses: slug / category / publish flag
-- ============================================================================
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_unique_idx ON courses(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS courses_is_published_idx ON courses(is_published) WHERE is_published = TRUE;

-- ============================================================================
-- 3. sections: description
-- ============================================================================
ALTER TABLE sections
  ADD COLUMN IF NOT EXISTS description TEXT;

-- ============================================================================
-- 4. videos: youtube_video_id, description
-- ============================================================================
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS youtube_video_id TEXT;

-- ============================================================================
-- 5. user_progress: watch tracking
-- ============================================================================
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS watch_time INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_watched_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 6. site_settings (singleton row, id = 1)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_title TEXT NOT NULL DEFAULT 'Shincode Course Platform',
  hero_title TEXT NOT NULL DEFAULT 'AIで学ぶプログラミング講座',
  hero_description TEXT NOT NULL DEFAULT '',
  footer_text TEXT NOT NULL DEFAULT '',
  allow_signups BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 7. Admin RPC functions
-- All marked SECURITY DEFINER so they can read auth.users / aggregate across
-- tables, but each function gates access with an explicit is_admin check.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- List all users (admin only)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  is_admin BOOLEAN,
  display_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(p.is_admin, FALSE) AS is_admin,
    p.display_name,
    p.avatar_url
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC;
END;
$$;

-- Toggle admin flag for a target user (admin only, cannot toggle self)
CREATE OR REPLACE FUNCTION public.admin_toggle_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_value BOOLEAN;
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own admin status';
  END IF;

  UPDATE public.profiles
  SET is_admin = NOT COALESCE(is_admin, FALSE),
      updated_at = CURRENT_TIMESTAMP
  WHERE id = target_user_id
  RETURNING is_admin INTO new_value;

  IF new_value IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  RETURN new_value;
END;
$$;

-- Aggregated platform metrics (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_analytics_summary()
RETURNS TABLE (
  total_users BIGINT,
  total_admins BIGINT,
  total_courses BIGINT,
  published_courses BIGINT,
  total_sections BIGINT,
  total_videos BIGINT,
  free_videos BIGINT,
  total_progress BIGINT,
  completed_progress BIGINT,
  new_users_7d BIGINT,
  new_users_30d BIGINT,
  active_users_7d BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users)::BIGINT,
    (SELECT COUNT(*) FROM public.profiles WHERE is_admin = TRUE)::BIGINT,
    (SELECT COUNT(*) FROM public.courses)::BIGINT,
    (SELECT COUNT(*) FROM public.courses WHERE is_published = TRUE)::BIGINT,
    (SELECT COUNT(*) FROM public.sections)::BIGINT,
    (SELECT COUNT(*) FROM public.videos)::BIGINT,
    (SELECT COUNT(*) FROM public.videos WHERE is_free = TRUE)::BIGINT,
    (SELECT COUNT(*) FROM public.user_progress)::BIGINT,
    (SELECT COUNT(*) FROM public.user_progress WHERE completed = TRUE)::BIGINT,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '7 days')::BIGINT,
    (SELECT COUNT(*) FROM auth.users WHERE created_at >= NOW() - INTERVAL '30 days')::BIGINT,
    (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at >= NOW() - INTERVAL '7 days')::BIGINT;
END;
$$;

-- Per-course statistics (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_course_analytics()
RETURNS TABLE (
  course_id UUID,
  course_title TEXT,
  course_slug TEXT,
  is_published BOOLEAN,
  section_count BIGINT,
  video_count BIGINT,
  learner_count BIGINT,
  completion_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.title,
    c.slug,
    COALESCE(c.is_published, FALSE),
    (SELECT COUNT(*) FROM public.sections s WHERE s.course_id = c.id)::BIGINT,
    (SELECT COUNT(*) FROM public.videos v
       JOIN public.sections s ON s.id = v.section_id
       WHERE s.course_id = c.id)::BIGINT,
    (SELECT COUNT(DISTINCT up.user_id) FROM public.user_progress up
       JOIN public.videos v ON v.id = up.video_id
       JOIN public.sections s ON s.id = v.section_id
       WHERE s.course_id = c.id)::BIGINT,
    (SELECT COUNT(*) FROM public.user_progress up
       JOIN public.videos v ON v.id = up.video_id
       JOIN public.sections s ON s.id = v.section_id
       WHERE s.course_id = c.id AND up.completed = TRUE)::BIGINT
  FROM public.courses c
  ORDER BY (SELECT COUNT(DISTINCT up.user_id) FROM public.user_progress up
             JOIN public.videos v ON v.id = up.video_id
             JOIN public.sections s ON s.id = v.section_id
             WHERE s.course_id = c.id) DESC,
           c.created_at DESC;
END;
$$;

-- Recent signups (admin only)
CREATE OR REPLACE FUNCTION public.admin_get_recent_signups(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  avatar_url TEXT,
  display_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_current_user_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::TEXT,
    u.created_at,
    p.avatar_url,
    p.display_name
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY u.created_at DESC
  LIMIT GREATEST(limit_count, 1);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_analytics_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_course_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_recent_signups(INTEGER) TO authenticated;
