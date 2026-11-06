# Seguridad operativa de Pesse

Auditoría inicial: **6 de noviembre de 2026**. Proyecto: `pesse` (Next.js, Vercel, Supabase). Este archivo no contiene contraseñas, tokens ni datos personales.

## Controles verificados

- **Noticias:** se restringieron los permisos `anon` a `SELECT`; se eliminaron `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `TRIGGER` y `REFERENCES`. El rol `authenticated` conserva `SELECT/INSERT/UPDATE/DELETE`, sujetos a las políticas RLS, pero no `TRUNCATE/TRIGGER/REFERENCES`.
- **Borradores privados:** se comprobó una consulta real con `SET LOCAL ROLE anon`. Con un borrador existente, el resultado público fue **0 borradores visibles**. Esta verificación no sustituye las pruebas autenticadas con cuentas de distintos roles.
- **Biblioteca audiovisual:** los visitantes únicamente tienen `SELECT`. `authenticated` recibió `INSERT/UPDATE` que antes faltaban; las políticas RLS de ambas operaciones exigen `is_admin()`. Ningún video fue modificado.
- **Asignación de roles:** `public.editor_roles` tiene RLS activo y ningún permiso de tabla para `anon` ni `authenticated`. Es deliberado; las funciones `is_admin()` e `is_editor()` consultan el rol del usuario autenticado.
- **Operaciones de administración:** `restore_article`, `trash_article` y `set_featured_article` son funciones `SECURITY DEFINER` que verifican `is_admin()` antes de actuar. `anon` no puede ejecutarlas. Requieren mantener y probar estas restricciones en cada cambio.
- **Supabase Health Advisor:** sin hallazgos en la última consulta.

Las modificaciones de permisos se aplicaron como migraciones de Supabase: `harden_article_table_privileges` y `grant_admin_video_management_through_rls`. Se verificaron los privilegios efectivos tras ambas.

## Riesgos pendientes de atender

1. **Protección contra contraseñas comprometidas desactivada.** Activar la opción *Leaked Password Protection* en Supabase Auth si la configuración y el plan la permiten. Documentación: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
2. **Prueba con dos cuentas reales:** una administradora y una redactora. Confirmar que el redactor no pueda modificar noticias ajenas, gestionar anuncios o videos ni invocar operaciones restringidas. Confirmar que el administrador sí pueda revisar y publicar.
3. **Diferenciar revisión y publicación:** el envío a revisión actual es opcional; un redactor todavía puede publicar según las políticas y el flujo existente. Si Pesse decide exigir doble aprobación, implementar un nuevo control en base de datos (no solo ocultar botones).
4. **Respaldo:** acordar una periodicidad y verificar un procedimiento de restauración de la base de datos y Storage. El repositorio GitHub **no** respalda las noticias ni las fotografías que están en Supabase. No eliminar ni modificar buckets o datos durante las pruebas de respaldo.
5. **Funciones privilegiadas:** Supabase Security Advisor avisa del `EXECUTE` de cinco funciones `SECURITY DEFINER` para usuarios autenticados. Se examinó el código de las funciones administrativas y todas requieren `is_admin()`; la exposición de estas funciones parece intencional para la aplicación. Se deben realizar pruebas de acceso entre roles antes de modificar sus grants.
6. **Inventario de accesos:** mantener pocas cuentas administradoras; usar contraseñas únicas y MFA para las cuentas que lo admitan, revisar cuentas inactivas y registrar quién puede desplegar en GitHub/Vercel.
7. **Dominio:** cuando se conecte uno propio, verificar HTTPS, URLs canónicas, redirecciones, URLs permitidas de Supabase Auth y política de cookies.

## Protocolo ante una incidencia

1. Registrar fecha y alcance; guardar pruebas sin copiar tokens ni contraseñas en chats o tickets.
2. Identificar si afecta al contenido, usuarios, credenciales, Storage o infraestructura.
3. Si se sospecha acceso indebido, revisar accesos y sesiones y revocar credenciales afectadas desde sus paneles; no publicar capturas de secretos.
4. Inspeccionar logs y el último despliegue de Vercel; no borrar la base de datos como medida de emergencia.
5. Recuperar desde un respaldo **verificado**, probar en un entorno aislado y documentar la restauración.
6. Repetir pruebas de roles, lectura pública, publicación y medios antes de dar por cerrada la incidencia.

**Nota:** esta revisión es una primera auditoría de configuración; no equivale a un pentest, auditoría de código completa ni certificación de seguridad.
