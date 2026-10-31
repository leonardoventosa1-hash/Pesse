-- Pesse: administrador y redactor, ambos pueden publicar.
-- Ejecutar en SQL Editor del proyecto Pesse tras schema.sql.
begin;
alter table public.editor_roles drop constraint if exists editor_roles_role_check;
update public.editor_roles set role='redactor' where role='editor';
alter table public.editor_roles add constraint editor_roles_role_check check(role in ('admin','redactor'));
drop policy if exists "articles published or editorial" on public.articles;
drop policy if exists "editors can insert articles" on public.articles;
drop policy if exists "editors can update articles" on public.articles;
drop policy if exists "admins can delete articles" on public.articles;
drop policy if exists "published or own or admin" on public.articles;
drop policy if exists "create own drafts" on public.articles;
drop policy if exists "update owned drafts or admin" on public.articles;
drop policy if exists "admins delete" on public.articles;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
select exists (select 1 from public.editor_roles where user_id=(select auth.uid()) and role='admin');
$$;
create or replace function public.is_editor() returns boolean language sql stable security definer set search_path = '' as $$
select exists (select 1 from public.editor_roles where user_id=(select auth.uid()) and role in ('admin','redactor'));
$$;
revoke all on function public.is_admin() from PUBLIC,anon;
revoke all on function public.is_editor() from PUBLIC,anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_editor() to authenticated;
create policy "read published own or all admin" on public.articles for select to anon,authenticated using (
(status='published' and published_at is not null and published_at<=now())
or public.is_admin() or (public.is_editor() and author_id=(select auth.uid()))
);
create policy "staff create own articles" on public.articles for insert to authenticated with check (
public.is_editor() and author_id=(select auth.uid())
);
create policy "admin or author update" on public.articles for update to authenticated using (
public.is_admin() or (public.is_editor() and author_id=(select auth.uid()))
) with check (
public.is_admin() or (public.is_editor() and author_id=(select auth.uid()))
);
create policy "admin delete" on public.articles for delete to authenticated using (public.is_admin());
commit;
