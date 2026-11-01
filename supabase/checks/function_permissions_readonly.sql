-- Security permissions audit: read-only.
select p.proname, pg_get_function_identity_arguments(p.oid) as arguments,
       p.prosecdef as security_definer,
       has_function_privilege('anon',p.oid,'EXECUTE') as executable_by_anon,
       has_function_privilege('authenticated',p.oid,'EXECUTE') as executable_by_authenticated
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
and p.proname in ('guard_article_featured','guard_article_trash','prevent_client_article_delete','trash_article','restore_article','is_admin','is_editor','set_featured_article')
order by p.proname;
