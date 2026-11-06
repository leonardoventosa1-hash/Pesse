-- PESSE: publicación y modificación de noticias publicadas solo por administradores.
-- IMPORTANTE: este archivo está preparado EN GITHUB. NO se ejecuta automáticamente.
-- Aplicar y verificar en Supabase en una intervención posterior, antes de anunciar
-- que la publicación está protegida a nivel de base de datos.
--
-- Los redactores conservan INSERT/UPDATE de sus borradores propios por RLS.
-- Para cualquier cambio que afecte a una noticia publicada se exige is_admin().
--
-- La comprobación de auth.uid() evita bloquear tareas internas de servicio
-- sin JWT de un usuario; no se deben conceder llamadas privilegiadas desde clientes.

create or replace function public.guard_article_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if (select auth.uid()) is not null and not public.is_admin() then
    if new.status = 'published'
      or (tg_op = 'UPDATE' and old.status = 'published') then
      raise exception 'Only administrators can publish or edit published articles'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$function$;

revoke all on function public.guard_article_publication() from public, anon, authenticated;

drop trigger if exists guard_article_publication_trigger on public.articles;
create trigger guard_article_publication_trigger
before insert or update on public.articles
for each row execute function public.guard_article_publication();

comment on function public.guard_article_publication() is
  'Pesse: bloquea publicación y edición de noticias publicadas por redactores a nivel de BD.';
