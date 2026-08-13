-- 02_rls.sql
-- Row Level Security (RLS) Policies for Personal Portfolio

-- Enable RLS on all 13 tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------
-- PUBLIC READ POLICIES (Unauthenticated / Public visitors)
-- ----------------------------------------------------

-- Profile: Public read
CREATE POLICY "Public profile select" ON public.profile
  FOR SELECT USING (true);

-- About: Public read
CREATE POLICY "Public about select" ON public.about
  FOR SELECT USING (true);

-- Skills: Public read
CREATE POLICY "Public skills select" ON public.skills
  FOR SELECT USING (true);

-- Projects: Public can only view published projects; authenticated admins can view all
CREATE POLICY "Projects select policy" ON public.projects
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

-- Certificates: Public read
CREATE POLICY "Public certificates select" ON public.certificates
  FOR SELECT USING (true);

-- Experience: Public read
CREATE POLICY "Public experience select" ON public.experience
  FOR SELECT USING (true);

-- Education: Public read
CREATE POLICY "Public education select" ON public.education
  FOR SELECT USING (true);

-- Reviews: Public can only view published reviews; authenticated admins can view all
CREATE POLICY "Reviews select policy" ON public.reviews
  FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');

-- Social Links: Public can only view enabled social links; authenticated admins can view all
CREATE POLICY "Social links select policy" ON public.social_links
  FOR SELECT USING (is_enabled = true OR auth.role() = 'authenticated');

-- Resume: Public can view active resumes; authenticated admins can view all
CREATE POLICY "Resume select policy" ON public.resume
  FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');

-- Site Settings: Public read
CREATE POLICY "Public site_settings select" ON public.site_settings
  FOR SELECT USING (true);

-- Media: Public read
CREATE POLICY "Public media select" ON public.media
  FOR SELECT USING (true);

-- ----------------------------------------------------
-- MESSAGES POLICIES
-- ----------------------------------------------------
-- Public visitors can submit contact messages (INSERT)
CREATE POLICY "Public messages insert" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Only authenticated admins can read, update, or delete messages
CREATE POLICY "Admin messages select" ON public.messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin messages update" ON public.messages
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin messages delete" ON public.messages
  FOR DELETE USING (auth.role() = 'authenticated');

-- ----------------------------------------------------
-- ADMIN WRITE POLICIES (INSERT / UPDATE / DELETE for all content tables)
-- ----------------------------------------------------
CREATE POLICY "Admin profile write" ON public.profile
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin about write" ON public.about
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin skills write" ON public.skills
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin projects write" ON public.projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin certificates write" ON public.certificates
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin experience write" ON public.experience
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin education write" ON public.education
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin reviews write" ON public.reviews
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin social_links write" ON public.social_links
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin resume write" ON public.resume
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin site_settings write" ON public.site_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin media write" ON public.media
  FOR ALL USING (auth.role() = 'authenticated');
