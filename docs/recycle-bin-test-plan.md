# Pruebas de la papelera en un proyecto Supabase separado

Estas pruebas se realizan **solo en un proyecto de pruebas**, nunca en la base `main` de Pesse.

## Preparación
1. Crear un segundo proyecto de Supabase para pruebas.
2. Replicar en ese proyecto el esquema y funciones esenciales de Pesse, incluyendo `articles`, `editor_roles`, `is_admin()`, `is_editor()` y las políticas. No es necesario copiar información real de usuarios.
3. Crear usuarios de prueba independientes con roles `admin` y `redactor`.
4. Ejecutar `supabase/migrations/20261031_recycle_bin.sql` solo en ese proyecto de pruebas.
5. Ejecutar `supabase/checks/recycle_bin_readonly.sql` para comprobar estructura, permisos e invariantes.

## Casos a probar
- Admin: publicar un artículo de prueba; enviarlo a papelera; debe quedar `deleted_at` no nulo, `status=draft`, `published_at=null` e `is_featured=false`.
- Visitante anónimo: no debe poder leer el artículo retirado.
- Redactor: no debe poder ejecutar `trash_article` ni `restore_article`, ni editar artículos retirados.
- Admin: restaurar desde papelera; el artículo debe seguir en estado borrador hasta publicarlo de nuevo.
- Segundo intento de restauración: debe informar que el artículo no existe en la papelera.
- Eliminación directa desde una sesión autenticada: debe ser rechazada.

## Activación
Solo después de que esas pruebas pasen, generar un respaldo restaurable del entorno de producción y decidir la ventana de instalación. Los CSV de noticias, políticas y funciones son referencias útiles, pero **no constituyen un respaldo completo**.

La configuración de GitHub Actions valida TypeScript, Next.js y la forma de los delimitadores SQL; **no sustituye la ejecución real de PostgreSQL**.
