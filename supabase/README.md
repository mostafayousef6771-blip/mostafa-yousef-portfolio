# Supabase Setup & Database Instructions

This directory contains the database schema, Row-Level Security (RLS) policies, and storage setup files for the Personal Portfolio application.

## 📁 Migration Files

1. `migrations/01_schema.sql` - Primary PostgreSQL database schema for all 13 application entities (`profile`, `about`, `skills`, `projects`, `certificates`, `experience`, `education`, `reviews`, `social_links`, `resume`, `messages`, `site_settings`, `media`).
2. `migrations/02_rls.sql` - Row Level Security policies guaranteeing public access to published items and restricting sensitive read/write operations to authenticated admins.
3. `migrations/03_storage.sql` - Storage bucket provisioning (`profile`, `projects`, `certificates`, `resume`, `media`) and access control policies.

## ⚙️ Environment Configuration

Define the following environment variables in your deployment settings or `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # (Server-side only)
```

## 🔒 Security Architecture

- **Public Access**: Visitors can only read content where `published = true`, `is_published = true`, `is_enabled = true`, or `is_active = true`.
- **Contact Submissions**: Public visitors can submit contact messages via `INSERT` on the `messages` table. Visitors cannot read or edit submitted messages.
- **Admin Access**: Privileged read and write actions require an authenticated Supabase Auth administrator session (`auth.role() = 'authenticated'`).
- **Secrets Management**: Service role keys and database passwords are never bundled or exposed in client-side bundles.
