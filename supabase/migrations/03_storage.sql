-- 03_storage.sql
-- Storage Buckets and Access Control Policies Setup

-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('profile', 'profile', true),
  ('projects', 'projects', true),
  ('certificates', 'certificates', true),
  ('resume', 'resume', true),
  ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public READ access to storage objects for portfolio assets
CREATE POLICY "Public Storage Objects Read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('profile', 'projects', 'certificates', 'resume', 'media'));

-- Authenticated Admin WRITE access to storage objects
CREATE POLICY "Admin Storage Objects Insert" ON storage.objects
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Storage Objects Update" ON storage.objects
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Storage Objects Delete" ON storage.objects
  FOR DELETE USING (public.is_admin());
