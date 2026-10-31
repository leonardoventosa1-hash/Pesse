# Activación segura de la papelera Pesse

Esta funcionalidad permanece en una rama y no debe fusionarse antes de aplicar y comprobar la migración.

1. Generar y verificar **un respaldo PostgreSQL restaurable**, incluyendo esquema, datos y permisos, con un procedimiento de restauración probado. **Un CSV de `public.articles` no sustituye ese respaldo.** Ejecutar `supabase/checks/recycle_bin_preflight.sql` (solo lectura) y revisar esquema, políticas y conteos antes de continuar.
2. Tras validar la misma migración en un proyecto Supabase de pruebas (no solo PostgreSQL simulado), ejecutar una única vez `supabase/migrations/20261031_recycle_bin.sql` en SQL Editor.
3. Ejecutar el script **de solo lectura** `supabase/checks/recycle_bin_readonly.sql` para comprobar que `articles.deleted_at` exista, que las funciones `trash_article(uuid)` y `restore_article(uuid)` estén disponibles, que el rol `anon` no pueda ejecutarlas y que la política pública excluya `deleted_at is not null`. Revisar sus resultados antes de continuar.
4. Verificar con un administrador: enviar una noticia de prueba a papelera. La operación debe cambiar `deleted_at`, `status=draft`, `published_at=null` y `is_featured=false`.
5. Verificar que la noticia no aparezca en portada, categorías, últimas noticias ni por URL; y que un visitante anónimo no pueda leerla en Supabase.
6. Restaurar esa misma noticia: vuelve como borrador, nunca publicada automáticamente.
7. Verificar que usuarios con rol redactor no puedan ejecutar ninguna de las funciones administrativas y que una eliminación directa con el cliente autenticado sea rechazada por `trg_prevent_client_article_delete`.
8. Coordinar una ventana corta de activación: aplicar la migración, comprobar las consultas, fusionar el PR y confirmar el despliegue de Vercel. No realizar el paso 8 si falla cualquier validación; evitar dejar el código antiguo activo mucho tiempo con los nuevos disparadores de borrado.

Importante: el entorno de GitHub Actions usa un esquema simulado y **no comprueba la integración completa con Supabase Auth, Storage, RLS y datos reales**. La prueba en un proyecto Supabase aislado sigue siendo obligatoria.

Importante: **no** revertir eliminando la columna `deleted_at` si ya se utilizaron funciones de papelera. La restauración de contenido depende de esa columna.
