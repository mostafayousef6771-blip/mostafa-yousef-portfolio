export interface Profile {
  id?: string;
  full_name: string;
  headline: string;
  bio: string;
  location: string;
  avatar_url: string;
  hero_greeting: string;
  hero_cta_work_label: string;
  hero_cta_contact_label: string;
  created_at?: string;
  updated_at?: string;
}

export interface About {
  id?: string;
  title: string;
  content: string;
  story: string;
  highlights: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string; // e.g. 'Frontend', 'Backend', 'Database', 'DevOps', 'Mobile', 'Tools'
  level: number; // 1 - 100
  icon: string;
  featured: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  cover_image: string;
  gallery: string[];
  demo_url: string;
  github_url: string;
  featured: boolean;
  published: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  image_url?: string;
  pdf_url?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string[];
  skills_used: string[];
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  grade?: string;
  description?: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  client_name: string;
  client_photo?: string;
  company?: string;
  position?: string;
  rating: number; // 1 - 5
  review_text: string;
  date: string;
  is_published: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export type SocialPlatform = 'LinkedIn' | 'GitHub' | 'WhatsApp' | 'Email' | 'Phone' | 'Custom';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  icon?: string;
  is_enabled: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface Resume {
  id: string;
  title: string;
  file_url: string;
  file_size?: string;
  updated_at: string;
  is_active: boolean;
  created_at?: string;
}

export interface ContactMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface SiteSettings {
  id?: string;
  site_title: string;
  meta_description: string;
  keywords: string;
  og_image_url: string;
  google_analytics_id: string;
  google_search_console_code: string;
  allow_indexing: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  file_path: string;
  file_url: string;
  size: number;
  file_type: string;
  storage_bucket: string;
  created_at: string;
}
