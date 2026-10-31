-- Inventario sin cambios, para preparar pruebas en Supabase STAGING.
-- Ejecutar en producción únicamente como consulta de lectura. NO incluye credenciales.
select 'articles' as objeto, column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema='public' and table_name='articles'
order by ordinal_position;

select 'dependencies' as grupo, n.nspname as schema, p.proname as nombre,
       pg_get_function_identity_arguments(p.oid) as argumentos,
       pg_get_functiondef(p.oid) as definicion
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('is_admin','is_editor','set_featured_article');

select policyname,cmd,roles,qual,with_check
from pg_policies where schemaname='public' and tablename='articles'
order by cmd,policyname;

select count(*) as noticias, count(*) filter(where status='published') as publicadas
from public.articles;
