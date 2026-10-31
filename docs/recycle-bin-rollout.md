# Activación segura de la papelera Pesse

Esta funcionalidad permanece en una rama y no debe fusionarse antes de aplicar y comprobar la migración.

1. Realizar respaldo de `public.articles` desde Supabase.
2. Ejecutar una única vez `supabase/migrations/20261031_recycle_bin.sql` en SQL Editor.
3. Ejecutar el script **de solo lectura** `supabase/checks/recycle_bin_readonly.sql` para comprobar que `articles.deleted_at` exista, que las funciones `trash_article(uuid)` y `restore_article(uuid)` estén disponibles, que el rol `anon` no pueda ejecutarlas y que la política pública excluya `deleted_at is not null`. Revisar sus resultados antes de continuar.
4. Verificar con un administrador: enviar una noticia de prueba a papelera. La operación debe cambiar `deleted_at`, `status=draft`, `published_at=null` y `is_featured=false`.
5. Verificar que la noticia no aparezca en portada, categorías, últimas noticias ni por URL; y que un visitante anónimo no pueda leerla en Supabase.
6. Restaurar esa misma noticia: vuelve como borrador, nunca publicada automáticamente.
7. Verificar que usuarios con rol redactor no puedan ejecutar ninguna de las funciones administrativas.
8. Fusionar PR y comprobar compilación y despliegue Vercel. No realizar el paso 8 si falla cualquier validación.

Importante: **no** revertir eliminando la columna `deleted_at` si ya se utilizaron funciones de papelera. La restauración de contenido depende de esa columna.
