# Gestión de integrantes de Pesse

Esta función agrega el acceso **Gestionar integrantes** al panel editorial, visible solo para un administrador. La ruta es `/admin/integrantes`. Permite invitar usuarios por correo, ver integrantes, cambiar roles `admin`/`redactor` y suspender/restablecer accesos.

## Arquitectura y controles de seguridad

- El navegador solo usa la clave **pública** de Supabase y el JWT de la sesión.
- El backend `supabase/functions/manage-pesse-members/index.ts` verifica el JWT con Auth y consulta `public.editor_roles` **en cada solicitud**, de modo que solo un administrador pueda llamar a estas operaciones.
- El `SUPABASE_SERVICE_ROLE_KEY` debe existir únicamente en el entorno privado de la Edge Function; nunca agregarlo a Vercel, GitHub ni `NEXT_PUBLIC_*`.
- Los usuarios son invitados con `auth.admin.inviteUserByEmail`, después se asigna su rol en `editor_roles`. Si falla la asignación, se informa para revisión manual.
- No se puede suspender ni quitar el rol de administrador a la propia cuenta; no se eliminan cuentas ni noticias.
- Suspender retira el registro de `editor_roles` y guarda el rol anterior en `auth.app_metadata` desde el servidor. Esto corta los permisos de RLS incluso si queda un token JWT anterior. Reactivar restaura ese registro. La persona aún podría autenticarse en Supabase, pero no acceder al panel editorial mientras el rol esté retirado.
- La vista de integrantes consulta Auth en páginas de 100, hasta 1.000 cuentas. Si alcanza el límite, muestra una advertencia de lista incompleta. Para instalaciones mayores es necesario implementar paginación completa o filtros de búsqueda en el servidor.

## Pasos necesarios para habilitar invitaciones reales

1. Revisar el PR y verificar `npm run check`, `npm run build` y Vercel Preview.
2. En **Supabase Pesse**, configurar en Auth → URL Configuration el dominio de la web y permitir como Redirect URL `https://pesse-gilt.vercel.app/admin/activar` (u otro destino HTTPS definitivo).
3. Verificar que Supabase Auth pueda enviar correos de invitación: proveedor de correo, límites y plantilla. Las invitaciones usan la configuración del proyecto.
4. Desplegar la Edge Function `manage-pesse-members` con JWT verificado y las credenciales internas gestionadas por Supabase.
5. Publicar la ruta `/admin/activar` en el dominio de destino **antes de enviar invitaciones reales**.
6. Entrar con una cuenta administradora, invitar un correo de prueba, activar su contraseña y verificar el rol asignado.
7. Verificar con una cuenta Redactor que la pantalla no sea accesible y que llamadas directas a la función respondan 403.
8. Comprobar el flujo de suspensión, restablecimiento de acceso y cambios de rol con cuentas de prueba, incluyendo que el administrador no pueda desactivarse.

**Importante:** desplegar código en Preview o añadir la ruta no constituye por sí mismo una prueba de funcionamiento. No crear ni invitar cuentas reales mientras falten pruebas de correo y permisos.

## Progreso de integración — 3 de noviembre de 2026

- PR #62 integrado únicamente en `integration/editorial-improvements-53-59`. No se publicó en `main`.
- Edge Function `manage-pesse-members` versión 2 activa en Supabase Pesse con `verify_jwt=true`.
- **Permisos SQL reforzados en Supabase Pesse:** se ejecutó `REVOKE ALL PRIVILEGES ON TABLE public.editor_roles FROM authenticated`. Se verificó que SELECT y UPDATE directos están denegados, mientras que `is_editor()` e `is_admin()` siguen ejecutables para el rol autenticado.
- **Invitaciones intencionalmente deshabilitadas** hasta configurar `PESSE_INVITE_REDIRECT_URL` con una URL HTTPS activada y permitida por Supabase Auth. La ausencia de esta variable devuelve un error controlado sin enviar correos.
- La URL de producción actual contiene aún la versión anterior del portal. No usar el dominio público como destino de invitación hasta publicar `/admin/activar`.
- Pendiente: verificar el correo con un usuario de prueba, RLS y permisos de Administrador/Redactor en sesiones reales, y la experiencia completa de cambio de contraseña.

## Activación por correo: configuración pendiente en el panel de Supabase

Las APIs conectadas permiten desplegar Edge Functions y revisar roles, pero **no exponen una operación para cambiar Auth → URL Configuration ni para crear secretos de funciones**. Por eso no se enviaron invitaciones reales.

1. Publicar primero `/admin/activar` en el dominio que recibirán los integrantes. No usar una vista previa efímera para correos permanentes.
2. En [Supabase Auth URL Configuration](https://supabase.com/dashboard/project/sabfvfeletrinwloyryw/auth/url-configuration), autorizar exactamente la URL HTTPS `https://pesse-gilt.vercel.app/admin/activar`, una vez que el portal público incluya esa ruta.
3. En [Supabase Edge Functions](https://supabase.com/dashboard/project/sabfvfeletrinwloyryw/functions) configurar el secreto **`PESSE_INVITE_REDIRECT_URL`** con el mismo destino. No utilizar una clave `service_role` en ninguna variable `NEXT_PUBLIC_*`.
4. Verificar el proveedor de correo de Supabase, remitente y cuota de invitaciones.
5. Probar invitación a una cuenta controlada, establecimiento de contraseña de 12 caracteres o más, login y lectura de rol. Validar rechazo como Redactor al administrar integrantes y suspensión de acceso.

El código trata ahora enlaces expirados o inválidos mostrando un aviso de nueva invitación, y actualiza el estado de Auth sin encadenar consultas asíncronas dentro de `onAuthStateChange`.

## Endurecimiento operativo — 3 de noviembre de 2026

- La gestión de integrantes consulta hasta diez páginas de Supabase Auth y evita omitir silenciosamente integrantes al superar 100 usuarios.
- La función sólo considera habilitadas las invitaciones cuando `PESSE_INVITE_REDIRECT_URL` es exactamente `https://pesse-gilt.vercel.app/admin/activar` (HTTPS, sin parámetros). Cambiar de dominio requiere actualizar explícitamente esta validación y las URLs permitidas de Supabase Auth.
- Esta validación **no comprueba** por sí misma que Supabase Auth tenga allowlisted la URL ni que el servicio SMTP pueda entregar correos. Siguen siendo necesarias pruebas de invitación reales con un buzón controlado.
- No enviar correos al equipo antes de validar contraseña y acceso como Administrador y Redactor.
