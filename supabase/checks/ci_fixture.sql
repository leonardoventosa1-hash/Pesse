-- Fixture exclusivamente para GitHub Actions (base PostgreSQL descartable).
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth to authenticated;
create function auth.role() returns text language sql stable as $$select current_setting('request.jwt.claim.role',true)$$;
create table public.articles (
 id uuid primary key,
 title text not null,
 status text not null default 'draft',
 published_at timestamptz,
 updated_at timestamptz,
 is_featured boolean not null default false
);
create function public.is_admin() returns boolean language sql stable as $$select current_setting('app.test_is_admin',true)='true'$$;
create function public.is_editor() returns boolean language sql stable as $$select true$$;
grant usage on schema public to anon,authenticated;
grant select on public.articles to anon;
grant select,update,delete,insert on public.articles to authenticated;
alter table public.articles enable row level security;
create policy "ci authenticated access" on public.articles for all to authenticated using (true) with check (true);
insert into public.articles(id,title,status,published_at) values
 ('00000000-0000-0000-0000-000000000001','Prueba descartable','published',now());
