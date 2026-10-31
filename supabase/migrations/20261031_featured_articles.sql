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
