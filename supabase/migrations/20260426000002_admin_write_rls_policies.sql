-- Admin-only write RLS policies for content tables and missing profile policies.
-- Without these, the courses/sections/videos tables only had SELECT policies, so
-- any authenticated user could call the Supabase REST API with the anon key and
-- INSERT/UPDATE/DELETE arbitrary content. This migration locks writes to admins.

-- Helper used by every admin write policy. Defined in 20260426000001_schema_catchup.sql.
-- We re-reference it here so this migration is self-documenting.

-- ============================================================================
-- profiles: keep public SELECT, restrict writes
-- ============================================================================
-- Direct INSERT is not needed by the app — profiles are seeded by the
-- handle_new_user() trigger which runs as SECURITY DEFINER and therefore
-- bypasses RLS. Block direct INSERT to prevent users from forging rows.
DROP POLICY IF EXISTS "Profiles cannot be inserted directly" ON profiles;
CREATE POLICY "Profiles cannot be inserted directly"
  ON profiles FOR INSERT
  WITH CHECK (false);

-- Users can delete their own profile; the cascading FK to auth.users will
-- handle account deletion when triggered from auth.
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- The original "Users can update own profile" policy uses `USING` only, which
-- means a user could change `is_admin` on their own row. Replace it with a
-- policy that prevents privilege escalation: a non-admin user cannot set
-- is_admin = TRUE on their own row.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- is_admin must match what's already in the row, OR the caller is admin.
      is_admin = (SELECT is_admin FROM profiles WHERE id = auth.uid())
      OR public.is_current_user_admin()
    )
  );

-- Admins can update any profile (used by admin_toggle_admin RPC, but also
-- allows manual admin tooling).
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- ============================================================================
-- courses: admin-only writes
-- ============================================================================
DROP POLICY IF EXISTS "Admins can insert courses" ON courses;
CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can update courses" ON courses;
CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can delete courses" ON courses;
CREATE POLICY "Admins can delete courses"
  ON courses FOR DELETE
  USING (public.is_current_user_admin());

-- ============================================================================
-- sections: admin-only writes
-- ============================================================================
DROP POLICY IF EXISTS "Admins can insert sections" ON sections;
CREATE POLICY "Admins can insert sections"
  ON sections FOR INSERT
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can update sections" ON sections;
CREATE POLICY "Admins can update sections"
  ON sections FOR UPDATE
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can delete sections" ON sections;
CREATE POLICY "Admins can delete sections"
  ON sections FOR DELETE
  USING (public.is_current_user_admin());

-- ============================================================================
-- videos: admin-only writes
-- ============================================================================
DROP POLICY IF EXISTS "Admins can insert videos" ON videos;
CREATE POLICY "Admins can insert videos"
  ON videos FOR INSERT
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can update videos" ON videos;
CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can delete videos" ON videos;
CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  USING (public.is_current_user_admin());

-- ============================================================================
-- user_progress: complete the policy set (DELETE was missing)
-- ============================================================================
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;
CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- site_settings: public read, admin-only write
-- ============================================================================
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings are viewable by everyone" ON site_settings;
CREATE POLICY "Site settings are viewable by everyone"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  USING (public.is_current_user_admin())
  WITH CHECK (public.is_current_user_admin());

-- INSERT/DELETE are intentionally not allowed: site_settings is a singleton
-- (id = 1) seeded by 20260426000001_schema_catchup.sql.
