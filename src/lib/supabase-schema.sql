-- Mostafa Portfolio - Complete Supabase PostgreSQL Schema
-- Copy and run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  hero_greeting TEXT NOT NULL DEFAULT '',
  hero_cta_work_label TEXT NOT NULL DEFAULT 'View My Work',
  hero_cta_contact_label TEXT NOT NULL DEFAULT 'Contact Me',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ABOUT TABLE
CREATE TABLE IF NOT EXISTS public.about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  level INT NOT NULL DEFAULT 80,
  icon TEXT DEFAULT 'Code',
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Web',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT NOT NULL DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  demo_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT DEFAULT '',
  credential_id TEXT DEFAULT '',
  credential_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  pdf_url TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT[] DEFAULT '{}',
  skills_used TEXT[] DEFAULT '{}',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL DEFAULT '',
  location TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  is_current BOOLEAN NOT NULL DEFAULT false,
  grade TEXT DEFAULT '',
  description TEXT DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_photo TEXT DEFAULT '',
  company TEXT DEFAULT '',
  position TEXT DEFAULT '',
  rating INT NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. SOCIAL_LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  icon TEXT DEFAULT '',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. RESUME TABLE
CREATE TABLE IF NOT EXISTS public.resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Curriculum Vitae',
  file_url TEXT NOT NULL,
  file_size TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. SITE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL DEFAULT 'Mostafa Portfolio',
  meta_description TEXT NOT NULL DEFAULT '',
  keywords TEXT NOT NULL DEFAULT '',
  og_image_url TEXT DEFAULT '',
  google_analytics_id TEXT DEFAULT '',
  google_search_console_code TEXT DEFAULT '',
  allow_indexing BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  size INT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'image',
  storage_bucket TEXT NOT NULL DEFAULT 'portfolio-media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
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

-- PUBLIC READ POLICIES (Allow visitors to view portfolio data)
CREATE POLICY "Allow public read profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Allow public read about" ON public.about FOR SELECT USING (true);
CREATE POLICY "Allow public read skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public read published projects" ON public.projects FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Allow public read experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Allow public read education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Allow public read published reviews" ON public.reviews FOR SELECT USING (is_published = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public read active social links" ON public.social_links FOR SELECT USING (is_enabled = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public read active resume" ON public.resume FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public insert messages" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read media" ON public.media FOR SELECT USING (true);

-- AUTHENTICATED ADMIN WRITE & DELETE POLICIES (Guarded by public.is_admin())
-- Profile
CREATE POLICY "Admin write profile" ON public.profile FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete profile" ON public.profile FOR DELETE TO authenticated USING (public.is_admin());

-- About
CREATE POLICY "Admin write about" ON public.about FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete about" ON public.about FOR DELETE TO authenticated USING (public.is_admin());

-- Skills
CREATE POLICY "Admin write skills" ON public.skills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete skills" ON public.skills FOR DELETE TO authenticated USING (public.is_admin());

-- Projects
CREATE POLICY "Admin write projects" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete projects" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

-- Certificates
CREATE POLICY "Admin write certificates" ON public.certificates FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete certificates" ON public.certificates FOR DELETE TO authenticated USING (public.is_admin());

-- Experience
CREATE POLICY "Admin write experience" ON public.experience FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete experience" ON public.experience FOR DELETE TO authenticated USING (public.is_admin());

-- Education
CREATE POLICY "Admin write education" ON public.education FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete education" ON public.education FOR DELETE TO authenticated USING (public.is_admin());

-- Reviews
CREATE POLICY "Admin write reviews" ON public.reviews FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.is_admin());

-- Social Links
CREATE POLICY "Admin write social_links" ON public.social_links FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete social_links" ON public.social_links FOR DELETE TO authenticated USING (public.is_admin());

-- Resume
CREATE POLICY "Admin write resume" ON public.resume FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete resume" ON public.resume FOR DELETE TO authenticated USING (public.is_admin());

-- Messages
CREATE POLICY "Admin write messages" ON public.messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete messages" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());

-- Site Settings
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete site_settings" ON public.site_settings FOR DELETE TO authenticated USING (public.is_admin());

-- Media
CREATE POLICY "Admin write media" ON public.media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete media" ON public.media FOR DELETE TO authenticated USING (public.is_admin());

-- STORAGE BUCKETS AND STORAGE POLICIES
-- 1) Create default storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('portfolio-media', 'portfolio-media', true, 15728640, NULL),
  ('media', 'media', true, 15728640, NULL),
  ('profile', 'profile', true, 15728640, NULL),
  ('projects', 'projects', true, 15728640, NULL),
  ('certificates', 'certificates', true, 15728640, NULL),
  ('resume', 'resume', true, 15728640, NULL),
  ('resumes', 'resumes', true, 15728640, NULL)
ON CONFLICT (id) DO NOTHING;

-- 2) Allow public read access to storage objects in portfolio buckets
CREATE POLICY "Public Read Storage Objects" ON storage.objects
FOR SELECT USING (bucket_id IN ('portfolio-media', 'media', 'profile', 'projects', 'certificates', 'resume', 'resumes'));

-- 3) Allow authenticated admins to upload/insert storage objects
CREATE POLICY "Admin Insert Storage Objects" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id IN ('portfolio-media', 'media', 'profile', 'projects', 'certificates', 'resume', 'resumes') 
  AND public.is_admin()
);

-- 4) Allow authenticated admins to update storage objects
CREATE POLICY "Admin Update Storage Objects" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id IN ('portfolio-media', 'media', 'profile', 'projects', 'certificates', 'resume', 'resumes')
  AND public.is_admin()
) WITH CHECK (
  bucket_id IN ('portfolio-media', 'media', 'profile', 'projects', 'certificates', 'resume', 'resumes')
  AND public.is_admin()
);

-- 5) Allow authenticated admins to delete storage objects
CREATE POLICY "Admin Delete Storage Objects" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id IN ('portfolio-media', 'media', 'profile', 'projects', 'certificates', 'resume', 'resumes')
  AND public.is_admin()
);

