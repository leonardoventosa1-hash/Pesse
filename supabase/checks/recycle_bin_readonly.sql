-- Pesse: comprobaciones de solo lectura después de instalar la migración.
-- No modifica ni elimina artículos.
select column_name,data_type,is_nullable
from information_schema.columns
where table_schema='public' and table_name='articles' and column_name='deleted_at';

select proname, pg_get_function_identity_arguments(p.oid) as arguments,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_can_execute,
       has_function_privilege('anon',p.oid,'EXECUTE') as anonymous_can_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and proname in ('trash_article','restore_article')
order by proname;

select policyname,roles,cmd,qual from pg_policies
where schemaname='public' and tablename='articles' and cmd='SELECT'
order by policyname;

select count(*) as news_total,
       count(*) filter (where deleted_at is null) as news_active,
       count(*) filter (where deleted_at is not null) as news_trashed
from public.articles;

select id,title,status,published_at,deleted_at,is_featured
from public.articles
where deleted_at is not null
order by deleted_at desc limit 20;

-- Confirm all defensive triggers are enabled on the article table.
select t.tgname as trigger_name, t.tgenabled as enabled_flag,
       pg_get_triggerdef(t.oid) as definition
from pg_trigger t
where t.tgrelid='public.articles'::regclass
  and not t.tgisinternal
  and t.tgname in ('trg_guard_article_trash','trg_prevent_client_article_delete')
order by t.tgname;

-- Confirm protected functions cannot be called by anonymous visitors.
select p.proname,
       has_function_privilege('anon',p.oid,'EXECUTE') as anonymous_can_execute,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_can_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('trash_article','restore_article','guard_article_trash','prevent_client_article_delete')
order by p.proname;

-- Deleted rows must never remain published or featured.
select count(*) as unsafe_trashed_records
from public.articles
where deleted_at is not null and
      (status <> 'draft' or published_at is not null or is_featured is true);
