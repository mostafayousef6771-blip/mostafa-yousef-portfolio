-- 01_schema.sql
-- Supabase Schema Migration for Personal Portfolio

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profile Table
CREATE TABLE IF NOT EXISTS public.profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL DEFAULT '',
  headline TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  hero_greeting TEXT DEFAULT '',
  hero_cta_work_label TEXT DEFAULT 'View My Work',
  hero_cta_contact_label TEXT DEFAULT 'Contact Me',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. About Table
CREATE TABLE IF NOT EXISTS public.about (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT DEFAULT '',
  content TEXT DEFAULT '',
  story TEXT DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Skills Table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  level INTEGER DEFAULT 80,
  icon TEXT DEFAULT 'Code',
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skills_display_order ON public.skills(display_order);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'Web',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  demo_url TEXT DEFAULT '',
  github_url TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);

-- 5. Certificates Table
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
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_display_order ON public.certificates(display_order);

-- 6. Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  is_current BOOLEAN DEFAULT false,
  description TEXT[] DEFAULT '{}',
  skills_used TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experience_display_order ON public.experience(display_order);

-- 7. Education Table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT DEFAULT '',
  location TEXT DEFAULT '',
  start_date TEXT NOT NULL,
  end_date TEXT DEFAULT '',
  is_current BOOLEAN DEFAULT false,
  grade TEXT DEFAULT '',
  description TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_education_display_order ON public.education(display_order);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_photo TEXT DEFAULT '',
  company TEXT DEFAULT '',
  position TEXT DEFAULT '',
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  date TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_is_published ON public.reviews(is_published);
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON public.reviews(display_order);

-- 9. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  label TEXT DEFAULT '',
  url TEXT NOT NULL,
  icon TEXT DEFAULT '',
  is_enabled BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_links_is_enabled ON public.social_links(is_enabled);
CREATE INDEX IF NOT EXISTS idx_social_links_display_order ON public.social_links(display_order);

-- 10. Resume Table
CREATE TABLE IF NOT EXISTS public.resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'Curriculum Vitae',
  file_url TEXT NOT NULL DEFAULT '',
  file_size TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_is_active ON public.resume(is_active);

-- 11. Contact Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT DEFAULT 'Portfolio Inquiry',
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 12. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT DEFAULT 'Mostafa Portfolio',
  meta_description TEXT DEFAULT '',
  keywords TEXT DEFAULT '',
  og_image_url TEXT DEFAULT '',
  google_analytics_id TEXT DEFAULT '',
  google_search_console_code TEXT DEFAULT '',
  allow_indexing BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Media Library Table
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  size BIGINT DEFAULT 0,
  file_type TEXT DEFAULT '',
  storage_bucket TEXT DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);
