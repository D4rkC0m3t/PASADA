-- ================================================
-- PASADA CRM - Storage Buckets Setup
-- Version: 1.0
-- Run this in Supabase SQL Editor
-- ================================================

-- ================================================
-- CREATE STORAGE BUCKETS
-- ================================================

-- Bucket for company logos and branding
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for quotation PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotations', 'quotations', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for material catalog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- STORAGE POLICIES - LOGOS BUCKET
-- ================================================

-- Anyone can view logos (public bucket)
CREATE POLICY "Public Access to Logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Only admins can upload logos
CREATE POLICY "Admins can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'logos' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Only admins can update logos
CREATE POLICY "Admins can update logos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'logos' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- Only admins can delete logos
CREATE POLICY "Admins can delete logos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'logos' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin'
);

-- ================================================
-- STORAGE POLICIES - QUOTATIONS BUCKET
-- ================================================

-- Staff can view all quotation PDFs
CREATE POLICY "Staff can view quotation PDFs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'quotations' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Clients can view their own quotation PDFs
CREATE POLICY "Clients can view own quotation PDFs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'quotations' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'client' AND
    -- PDF name should start with their client_id or quotation_id they have access to
    EXISTS (
        SELECT 1 FROM quotations q
        INNER JOIN projects p ON q.project_id = p.id
        INNER JOIN clients c ON p.client_id = c.id
        WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND (storage.foldername(storage.objects.name))[1] = q.id::text
    )
);

-- Staff can upload quotation PDFs
CREATE POLICY "Staff can upload quotation PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'quotations' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can update quotation PDFs
CREATE POLICY "Staff can update quotation PDFs"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'quotations' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can delete quotation PDFs
CREATE POLICY "Staff can delete quotation PDFs"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'quotations' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- ================================================
-- STORAGE POLICIES - PROJECTS BUCKET
-- ================================================

-- Anyone can view project images (public bucket)
CREATE POLICY "Public Access to Project Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'projects');

-- Staff can upload project images
CREATE POLICY "Staff can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'projects' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can update project images
CREATE POLICY "Staff can update project images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'projects' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can delete project images
CREATE POLICY "Staff can delete project images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'projects' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- ================================================
-- STORAGE POLICIES - MATERIALS BUCKET
-- ================================================

-- Anyone can view material images (public bucket)
CREATE POLICY "Public Access to Material Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'materials');

-- Staff can upload material images
CREATE POLICY "Staff can upload material images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'materials' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can update material images
CREATE POLICY "Staff can update material images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'materials' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Staff can delete material images
CREATE POLICY "Staff can delete material images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'materials' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- ================================================
-- STORAGE POLICIES - AVATARS BUCKET
-- ================================================

-- Users can view their own avatars
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Staff can view all avatars
CREATE POLICY "Staff can view all avatars"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'avatars' AND
    (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================================
-- STORAGE ORGANIZATION STRUCTURE
-- ================================================

/*
RECOMMENDED FOLDER STRUCTURE:

logos/
  - company-logo.png
  - quotation-header.png
  - invoice-header.png

quotations/
  - {quotation_id}/
    - {quotation_number}.pdf
    - {quotation_number}-v2.pdf

projects/
  - {project_id}/
    - before/
    - after/
    - progress/
    - designs/

materials/
  - {category}/
    - {material_id}.jpg
    - {material_id}-detail.jpg

avatars/
  - {user_id}/
    - avatar.jpg
*/

-- ================================================
-- FILE SIZE LIMITS
-- ================================================

/*
Recommended file size limits (configure in Supabase Dashboard):

- logos: 2MB max
- quotations: 10MB max per PDF
- projects: 5MB max per image
- materials: 3MB max per image
- avatars: 1MB max

Recommended file types:
- Images: jpg, jpeg, png, webp
- Documents: pdf
*/
