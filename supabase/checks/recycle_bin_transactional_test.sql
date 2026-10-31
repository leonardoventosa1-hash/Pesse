-- Pesse: inspección de solo lectura. No simula un usuario autenticado.
-- El SQL Editor usa habitualmente el rol postgres: NO sirve para validar is_admin()
-- ni la autorización de las funciones RPC como si fuera un usuario del panel.
-- Ejecutar únicamente después de instalar la migración, en el proyecto de pruebas.
select id,title,status,published_at,deleted_at,is_featured
from public.articles
where title='PRUEBA PAPELERA - DESCARTABLE'
order by created_at desc;

-- Para validar las operaciones reales, iniciar sesión como administrador EN LA APP
-- y utilizar los botones Enviar a papelera y Restaurar como borrador.
-- Comprobar los resultados con supabase/checks/recycle_bin_readonly.sql.
-- Nunca usar la única noticia de producción para estas pruebas.
