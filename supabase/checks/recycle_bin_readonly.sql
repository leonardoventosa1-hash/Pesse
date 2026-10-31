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
