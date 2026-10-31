-- Pesse: manual homepage highlight, safe for existing articles.
alter table public.articles add column if not exists is_featured boolean not null default false;
create index if not exists articles_featured_idx on public.articles(is_featured,published_at desc) where status='published';
-- Featured control is administrator-only, enforced in DB rather than only UI.
create or replace function public.guard_article_featured() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  if new.is_featured and not public.is_admin() then raise exception 'Only administrators can feature articles' using errcode='42501'; end if;
 elsif new.is_featured is distinct from old.is_featured and not public.is_admin() then
  raise exception 'Only administrators can change featured status' using errcode='42501';
 end if;
 return new;
end $$;
drop trigger if exists trg_guard_article_featured on public.articles;
create trigger trg_guard_article_featured before insert or update on public.articles
for each row execute function public.guard_article_featured();

-- Atomic operation to choose the ONE featured story.
create or replace function public.set_featured_article(target_id uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin() then raise exception 'Only admins may feature stories' using errcode='42501'; end if;
 if not exists(select 1 from public.articles where id=target_id and status='published' and published_at <= now()) then
  raise exception 'Choose an already published story';
 end if;
 update public.articles set is_featured=false where is_featured=true and id<>target_id;
 update public.articles set is_featured=true where id=target_id;
end $$;
revoke all on function public.set_featured_article(uuid) from public,anon;
grant execute on function public.set_featured_article(uuid) to authenticated;
