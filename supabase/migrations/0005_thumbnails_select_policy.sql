-- Run manually in the Supabase dashboard SQL editor (project not linked to CLI).
--
-- Storage RLS: 0001 created insert/update/delete policies for the thumbnails
-- bucket but no select policy. Without select, authenticated users cannot
-- "see" their own thumbnail objects, so remove()/upsert silently match zero
-- rows and every re-upload fails with 409 Duplicate, leaving stale previews.
create policy "Thumbnails are viewable by everyone"
  on storage.objects for select
  using (bucket_id = 'thumbnails');
