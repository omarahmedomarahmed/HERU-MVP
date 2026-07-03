-- ============================================================================
-- 018: Supabase Storage — heru-uploads bucket and RLS policies
-- ============================================================================

-- Create the bucket (public read, 10MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'heru-uploads',
  'heru-uploads',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Drop any existing storage policies to avoid conflicts on re-run
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage all files" ON storage.objects;
DROP POLICY IF EXISTS "heru_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "heru_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "heru_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "heru_service_role_policy" ON storage.objects;

-- Authenticated users can upload to heru-uploads
CREATE POLICY "heru_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'heru-uploads');

-- Public can read any file in heru-uploads
CREATE POLICY "heru_read_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'heru-uploads');

-- Users can delete their own uploads (files in their user folder)
CREATE POLICY "heru_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'heru-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Service role can manage all files
CREATE POLICY "heru_service_role_policy"
ON storage.objects FOR ALL
USING (bucket_id = 'heru-uploads' AND auth.role() = 'service_role');
