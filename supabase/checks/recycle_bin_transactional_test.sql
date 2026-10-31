-- PRUEBA TRANSACCIONAL: ejecutar SOLO DESPUÉS de instalar la migración.
-- No persiste cambios: ROLLBACK revierte los cambios efectuados en esta sesión.
-- Usa un artículo EXISTENTE solo si el usuario ejecutor es administrador.
-- No probar con la única noticia real salvo que se tenga backup integral y se comprenda el riesgo.
begin;
do $$
declare
  test_id uuid;
  old_status text;
begin
  if not public.is_admin() then
    raise exception 'Esta prueba requiere una sesión de administrador autenticada.';
  end if;
  select id into test_id from public.articles where title='PRUEBA PAPELERA - DESCARTABLE' and deleted_at is null limit 1;
  if test_id is null then
    raise exception 'Crear antes un artículo DESCARTABLE titulado PRUEBA PAPELERA - DESCARTABLE';
  end if;
  perform public.trash_article(test_id);
  if not exists(select 1 from public.articles where id=test_id and deleted_at is not null and status='draft' and published_at is null and is_featured=false) then
    raise exception 'La noticia no quedó correctamente retirada.';
  end if;
  perform public.restore_article(test_id);
  if not exists(select 1 from public.articles where id=test_id and deleted_at is null and status='draft' and published_at is null and is_featured=false) then
    raise exception 'La restauración no dejó un borrador seguro.';
  end if;
  raise notice 'Prueba de enviar a papelera y restaurar completada; se revertirá con ROLLBACK.';
end $$;
rollback;
