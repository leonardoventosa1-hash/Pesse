-- Ejecutar en SQL Editor de Pesse (una sola vez).
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('news-images','news-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
drop policy if exists "news images public select" on storage.objects;
drop policy if exists "news images upload by staff" on storage.objects;
drop policy if exists "news images delete admin" on storage.objects;
create policy "news images public select" on storage.objects for select to anon,authenticated using (bucket_id='news-images');
create policy "news images upload by staff" on storage.objects for insert to authenticated with check (bucket_id='news-images' and public.is_editor() and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "news images delete admin" on storage.objects for delete to authenticated using (bucket_id='news-images' and public.is_admin());
