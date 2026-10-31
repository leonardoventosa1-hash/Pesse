-- Pesse: soft deletion. Execute only after review, before deploying recycle-bin UI.
begin;
alter table public.articles add column if not exists deleted_at timestamptz;
create index if not exists articles_active_idx on public.articles(published_at desc) where deleted_at is null;
drop policy if exists "public can read published articles" on public.articles;
create policy "public can read published articles" on public.articles for select to anon,authenticated
using (deleted_at is null and status='published' and published_at is not null and published_at <= now());
-- Trashed stories become drafts, preventing disclosure through legacy public read policies.
-- Editorial reading policy remains unchanged; admins can inspect trashed articles.
create or replace function public.trash_article(target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Only administrators can trash articles' using errcode='42501'; end if;
 update public.articles set deleted_at=now(), status='draft', published_at=null, is_featured=false, updated_at=now()
 where id=target_id and deleted_at is null;
end $$;
create or replace function public.restore_article(target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Only administrators can restore articles' using errcode='42501'; end if;
 update public.articles set deleted_at=null,status='draft',published_at=null,is_featured=false,updated_at=now()
 where id=target_id and deleted_at is not null;
end $$;
-- Block direct edits to trashed articles and prevent non-admins from changing deletion state.
-- Administrators retain the ability to restore through the guarded RPC.
create or replace function public.guard_article_trash()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.deleted_at is not null then
   raise exception 'New articles cannot start in the trash' using errcode='42501';
  end if;
 elsif tg_op='UPDATE' then
  if old.deleted_at is not null and not public.is_admin() then
   raise exception 'Restore this article before editing' using errcode='42501';
  end if;
  if new.deleted_at is distinct from old.deleted_at and not public.is_admin() then
   raise exception 'Only admins can move articles to or from trash' using errcode='42501';
  end if;
 end if;
 return new;
end $$;
drop trigger if exists trg_guard_article_trash on public.articles;
create trigger trg_guard_article_trash before insert or update on public.articles
for each row execute function public.guard_article_trash();

-- Prevent permanent deletion from client sessions, even when old DELETE policies exist.
-- Database maintenance through postgres/service_role remains possible.
create or replace function public.prevent_client_article_delete()
returns trigger language plpgsql set search_path='' as $
begin
 if auth.role() in ('anon','authenticated') then
  raise exception 'Use the recycle bin instead of permanently deleting articles' using errcode='42501';
 end if;
 return old;
end $;
drop trigger if exists trg_prevent_client_article_delete on public.articles;
create trigger trg_prevent_client_article_delete before delete on public.articles
for each row execute function public.prevent_client_article_delete();

revoke all on function public.trash_article(uuid) from public,anon;
revoke all on function public.restore_article(uuid) from public,anon;
grant execute on function public.trash_article(uuid) to authenticated;
grant execute on function public.restore_article(uuid) to authenticated;
commit;
