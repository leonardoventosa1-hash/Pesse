-- Reparación de lectura pública, sin afectar borradores ni permisos de escritura.
begin;
drop policy if exists "read published own or all admin" on public.articles;
create policy "public can read published articles" on public.articles
for select to anon, authenticated
using (status='published' and published_at is not null and published_at <= now());
create policy "staff can read own or all admin articles" on public.articles
for select to authenticated
using (public.is_admin() or (public.is_editor() and author_id=(select auth.uid())));
grant usage on schema public to anon,authenticated;
grant select on public.articles to anon,authenticated;
commit;

-- Comprobar sin privilegios de administrador: debe mostrar la noticia publicada.
begin;
set local role anon;
select title,status,published_at from public.articles
where status='published' and published_at <= now()
order by published_at desc limit 10;
rollback;
