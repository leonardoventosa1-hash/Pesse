-- PREVUELO / PRE-FLIGHT: solo lectura. Ejecutar ANTES de instalar la papelera.
-- Si alguna fila devuelve false, revisar el esquema antes de aplicar la migración.
select
 to_regclass('public.articles') is not null as articles_exists,
 to_regprocedure('public.is_admin()') is not null as admin_guard_exists,
 to_regprocedure('public.is_editor()') is not null as editor_guard_exists,
 exists(select 1 from information_schema.columns where table_schema='public' and table_name='articles' and column_name='is_featured') as featured_column_exists,
 exists(select 1 from information_schema.columns where table_schema='public' and table_name='articles' and column_name='updated_at') as updated_at_exists;

select policyname,cmd,roles,qual,with_check from pg_policies
where schemaname='public' and tablename='articles'
order by cmd,policyname;

-- Resumen para cotejar contra respaldo exportado.
select count(*) as articles_before,
 count(*) filter (where status='published') as published_before,
 count(*) filter (where status='draft') as drafts_before
from public.articles;

-- La columna deleted_at no se consulta aquí porque todavía podría no existir.
