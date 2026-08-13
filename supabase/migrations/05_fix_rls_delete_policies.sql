-- ============================================================================
-- MIGRATION: 05_fix_rls_delete_policies.sql
-- Targeted minimal fix for service_role table permissions across portfolio tables
-- ============================================================================

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.skills TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.certificates TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.experience TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.education TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reviews TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.social_links TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resume TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.about TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_settings TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media TO service_role;





