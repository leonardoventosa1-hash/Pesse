-- Pesse: soft deletion. Execute only after review, before deploying recycle-bin UI.
begin;
alter table public.articles add column if not exists deleted_at timestamptz;
create index if not exists articles_active_idx on public.articles(published_at desc) where deleted_at is null;
drop policy if exists "public can read published articles" on public.articles;
create policy "public can read published articles" on public.articles for select to anon,authenticated
using (deleted_at is null and status='published' and published_at is not null and published_at <= now());
-- Editorial reading policy remains unchanged; admins can inspect trashed articles.
create or replace function public.trash_article(target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Only administrators can trash articles' using errcode='42501'; end if;
 update public.articles set deleted_at=now(), is_featured=false, updated_at=now()
 where id=target_id and deleted_at is null;
end $$;
create or replace function public.restore_article(target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Only administrators can restore articles' using errcode='42501'; end if;
 update public.articles set deleted_at=null,status='draft',published_at=null,is_featured=false,updated_at=now()
 where id=target_id and deleted_at is not null;
end $$;
revoke all on function public.trash_article(uuid) from public,anon;
revoke all on function public.restore_article(uuid) from public,anon;
grant execute on function public.trash_article(uuid) to authenticated;
grant execute on function public.restore_article(uuid) to authenticated;
commit;
