-- Create the storage bucket for resource thumbnails
insert into storage.buckets (id, name, public)
values ('resource-thumbnails', 'resource-thumbnails', true)
on conflict (id) do nothing;

-- Note: RLS is already enabled on storage.objects by default in Supabase

-- Allow public access to view thumbnails
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'resource-thumbnails' );

-- Allow authenticated users to upload thumbnails
create policy "Authenticated users can upload thumbnails"
  on storage.objects for insert
  with check (
    bucket_id = 'resource-thumbnails'
    and auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own thumbnails
create policy "Authenticated users can update thumbnails"
  on storage.objects for update
  using (
    bucket_id = 'resource-thumbnails'
    and auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete thumbnails
create policy "Authenticated users can delete thumbnails"
  on storage.objects for delete
  using (
    bucket_id = 'resource-thumbnails'
    and auth.role() = 'authenticated'
  );
