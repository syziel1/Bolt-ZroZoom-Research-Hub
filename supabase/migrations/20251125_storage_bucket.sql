-- Create the storage bucket for resource thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('resource-thumbnails', 'resource-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Note: RLS is already enabled on storage.objects by default in Supabase

-- Allow public access to view thumbnails
CREATE POLICY "public_access"
ON storage.objects FOR SELECT
USING (bucket_id = 'resource-thumbnails');

-- Allow authenticated users to upload thumbnails
CREATE POLICY "authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (
bucket_id = 'resource-thumbnails'
AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own thumbnails
CREATE POLICY "authenticated_update"
ON storage.objects FOR UPDATE
USING (
bucket_id = 'resource-thumbnails'
AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete thumbnails
CREATE POLICY "authenticated_delete"
ON storage.objects FOR DELETE
USING (
bucket_id = 'resource-thumbnails'
AND auth.role() = 'authenticated'
);
