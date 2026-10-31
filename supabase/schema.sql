-- Ejecutar en Supabase SQL Editor de un proyecto EXCLUSIVO para Pesse.
create extension if not exists pgcrypto;
create table if not exists public.editor_roles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','editor'))
);
create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
 name text not null
);
insert into public.categories(slug,name) values ('politica','Política'),('sociedad','Sociedad'),('deportes','Deportes'),('cultura','Cultura') on conflict (slug) do nothing;
create table if not exists public.articles(
 id uuid primary key default gen_random_uuid(),
 slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
 title text not null check (char_length(title) between 8 and 180),
 excerpt text not null default '',
 body text not null default '',
 cover_url text,
 category_id uuid references public.categories(id),
 author_id uuid references auth.users(id),
 status text not null default 'draft' check (status in ('draft','published')),
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists articles_public_idx on public.articles(status,published_at desc);
alter table public.editor_roles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
revoke all on public.editor_roles from anon;
grant select on public.categories to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
create policy "categories readable" on public.categories for select to anon,authenticated using (true);
create policy "articles published or editorial" on public.articles for select to anon,authenticated using (
 (status = 'published' and published_at is not null and published_at <= now())
 or (select auth.uid()) in (select user_id from public.editor_roles)
);
create policy "editors can insert articles" on public.articles for insert to authenticated with check (
 (select auth.uid()) in (select user_id from public.editor_roles)
 and author_id = (select auth.uid())
);
create policy "editors can update articles" on public.articles for update to authenticated using (
 (select auth.uid()) in (select user_id from public.editor_roles)
) with check ((select auth.uid()) in (select user_id from public.editor_roles));
create policy "admins can delete articles" on public.articles for delete to authenticated using (
 (select auth.uid()) in (select user_id from public.editor_roles where role = 'admin')
);
-- La tabla editor_roles NO tiene políticas de lectura ni escritura para clientes.
-- Para autorizar un editor, usar SQL Editor (privilegiado), después de crear usuario:
-- insert into public.editor_roles(user_id,role) values ('UUID-DEL-USUARIO','admin');
-- Nunca agregar service_role a variables NEXT_PUBLIC_*.
