-- =============================================
-- HERU.gg — Supabase Storage Setup
-- Migration 004
-- =============================================

-- Create the heru-uploads bucket (public read, authenticated write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'heru-uploads',
  'heru-uploads',
  true,
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'heru-uploads');

-- Allow public to read files
CREATE POLICY "Public can read uploaded files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'heru-uploads');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'heru-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
