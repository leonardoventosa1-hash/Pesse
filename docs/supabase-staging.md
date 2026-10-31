# Preparación de Supabase staging — papelera Pesse

## Objetivo

Probar la migración de la papelera con **Supabase Auth y RLS reales** antes de instalarla en el proyecto de producción. Esta etapa no está ejecutada: las pruebas de GitHub usan PostgreSQL sintético.

## Preparar staging sin noticias privadas

1. En el panel Supabase crear un proyecto *diferente* del proyecto Pesse en producción, si el plan permite otro proyecto gratuito.
2. Recrear el **esquema real** de Pesse y sus funciones auxiliares, roles/políticas y triggers. Utilizar `supabase/checks/staging_inventory_readonly.sql` para identificar dependencias. No introducir claves ni contraseñas en GitHub.
3. Crear una cuenta **administradora de prueba** y otra **redactora de prueba** mediante Supabase Auth en staging; asignar roles con el mismo mecanismo que la aplicación. No copiar usuarios ni tokens reales.
4. Configurar localmente/como preview las variables Supabase de **staging**, sin cambiar las variables de producción en Vercel. Confirmar que ambas URLs de proyecto sean distintas.
5. Crear una noticia **descartable** desde el panel editorial de staging. Verificar publicación, envío a papelera, invisibilidad en consultas anónimas, restauración como borrador y bloqueo para redactores.
6. Ejecutar `supabase/checks/recycle_bin_readonly.sql` en staging y comprobar que no haya artículos descartados que permanezcan publicados.
7. Registrar resultado y solo entonces pasar a la lista de activación en `docs/recycle-bin-rollout.md`.

## Respaldo de producción: requisito separado

Los CSV descargados NO permiten restaurar todo el esquema/roles/permisos. Antes de modificar producción se necesita un **dump PostgreSQL restaurable**, almacenado fuera del repositorio y **probado restaurando en base independiente**. No guardar conexión ni contraseñas en el repositorio o en mensajes.

Si no hay posibilidad de crear staging o un respaldo restaurable, **mantener PR #18 como borrador**, sin desplegar.

## Checklist de aceptación

- [ ] Staging Supabase creado y separado de producción
- [ ] Esquema, Auth y RLS reproducidos
- [ ] Administrador puede enviar a papelera y restaurar como borrador
- [ ] Redactor no puede enviar ni restaurar
- [ ] Visitante anónimo no puede leer noticia descartada ni borrador restaurado
- [ ] Borrado definitivo bloqueado para sesiones cliente
- [ ] Respaldo completo de producción verificado mediante restauración
