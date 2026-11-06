# Publicación editorial: permisos por rol

Estado al 6/11/2026: **preparado en GitHub, NO aplicado a Supabase ni desplegado en Vercel**.

## Flujo propuesto

- **Redactor:** prepara la noticia, la guarda como borrador y solicita revisión desde el editor.
- **Administrador:** revisa el artículo y decide si lo publica. También puede retirar y modificar una noticia publicada.
- **Lectores:** solo acceden a publicaciones aprobadas por el equipo editorial y efectivamente publicadas.
- La aprobación registrada en la bandeja de revisión **no publica automáticamente** una noticia.

La interfaz ahora ofrece la opción de publicar solo a administradores. Esto es una barrera de experiencia de usuario, **no una medida de autorización suficiente por sí sola**: los permisos definitivos deben aplicarse también en Supabase.

## Migración de seguridad pendiente

Archivo: `supabase/migrations/20261106193000_guard_admin_publication.sql`.

Contiene una función y un trigger que bloquean a usuarios que no son administradores cuando intentan:
1. Insertar o actualizar una noticia dejándola con `status = 'published'`.
2. Modificar una noticia que ya estaba publicada.

La función consulta `public.is_admin()` y se ejecuta antes de escribir en `public.articles`. No modifica noticias existentes por sí misma. Mantiene las políticas RLS de autoría actuales. La comprobación del rol ocurre **en base de datos**, no depende del navegador.

**Importante:** ninguna edición de archivos en GitHub instala esta migración automáticamente en la base de datos conectada a Pesse.

## Plan de activación y comprobación antes de publicar

1. Revisar el archivo SQL y los permisos actuales de RLS en Supabase.
2. Tomar primero un respaldo real recuperable de base de datos y medios, o al menos seguir el procedimiento de backup antes de aplicar migraciones productivas.
3. Aplicar la migración mediante el historial de migraciones de Supabase; comprobar que el trigger esté instalado.
4. Usar cuentas de **prueba** administradora y redactora. Confirmar que una redactora puede crear/editar su borrador pero no publicar, modificar noticias publicadas ni cambiar artículos ajenos.
5. Confirmar que un administrador sí puede publicar y retirar, y que los lectores nunca acceden a los borradores.
6. Comprobar el circuito de solicitudes de revisión y sus notas. Finalmente, publicar la nueva interfaz en Vercel cuando el límite de despliegues lo permita.

## Limitación conocida

El trigger restringe quién puede publicar, pero **no exige necesariamente una revisión aprobada para cada publicación administrativa**. Para imponer doble aprobación de forma estricta habría que diseñar una política adicional y resolver el caso de noticias del propio administrador, correcciones posteriores y versiones revisadas.

No se deben presentar estas verificaciones como completas hasta ejecutarlas con los roles reales en Supabase.
