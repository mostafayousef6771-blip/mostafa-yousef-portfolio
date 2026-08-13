-- 04_admin_role.sql
-- Administrator Role and Database-level Authorization Checks

-- Create table to track administrator user IDs
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Function: public.is_admin()
-- Securely determines if auth.uid() belongs to an authorized administrator.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- RLS Policy for admin_users
DROP POLICY IF EXISTS "Admin users select" ON public.admin_users;
CREATE POLICY "Admin users select" ON public.admin_users
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin users write" ON public.admin_users;
CREATE POLICY "Admin users write" ON public.admin_users
  FOR ALL USING (public.is_admin());

-- Update Write and Protected Read Policies on Portfolio Tables to use public.is_admin()

-- Projects
DROP POLICY IF EXISTS "Projects select policy" ON public.projects;
CREATE POLICY "Projects select policy" ON public.projects
  FOR SELECT USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin projects write" ON public.projects;
CREATE POLICY "Admin projects write" ON public.projects
  FOR ALL USING (public.is_admin());

-- Reviews
DROP POLICY IF EXISTS "Reviews select policy" ON public.reviews;
CREATE POLICY "Reviews select policy" ON public.reviews
  FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin reviews write" ON public.reviews;
CREATE POLICY "Admin reviews write" ON public.reviews
  FOR ALL USING (public.is_admin());

-- Social Links
DROP POLICY IF EXISTS "Social links select policy" ON public.social_links;
CREATE POLICY "Social links select policy" ON public.social_links
  FOR SELECT USING (is_enabled = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin social_links write" ON public.social_links;
CREATE POLICY "Admin social_links write" ON public.social_links
  FOR ALL USING (public.is_admin());

-- Resume
DROP POLICY IF EXISTS "Resume select policy" ON public.resume;
CREATE POLICY "Resume select policy" ON public.resume
  FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin resume write" ON public.resume;
CREATE POLICY "Admin resume write" ON public.resume
  FOR ALL USING (public.is_admin());

-- Messages (Admin read/update/delete only)
DROP POLICY IF EXISTS "Admin messages select" ON public.messages;
CREATE POLICY "Admin messages select" ON public.messages
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin messages update" ON public.messages;
CREATE POLICY "Admin messages update" ON public.messages
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admin messages delete" ON public.messages;
CREATE POLICY "Admin messages delete" ON public.messages
  FOR DELETE USING (public.is_admin());

-- Other Admin Write Policies
DROP POLICY IF EXISTS "Admin profile write" ON public.profile;
CREATE POLICY "Admin profile write" ON public.profile
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin about write" ON public.about;
CREATE POLICY "Admin about write" ON public.about
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin skills write" ON public.skills;
CREATE POLICY "Admin skills write" ON public.skills
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin certificates write" ON public.certificates;
CREATE POLICY "Admin certificates write" ON public.certificates
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin experience write" ON public.experience;
CREATE POLICY "Admin experience write" ON public.experience
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin education write" ON public.education;
CREATE POLICY "Admin education write" ON public.education
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin site_settings write" ON public.site_settings;
CREATE POLICY "Admin site_settings write" ON public.site_settings
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admin media write" ON public.media;
CREATE POLICY "Admin media write" ON public.media
  FOR ALL USING (public.is_admin());

