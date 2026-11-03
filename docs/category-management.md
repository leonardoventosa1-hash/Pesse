# Pesse — Administración de secciones editoriales

La segunda etapa de Configuración general está disponible en `/admin/configuracion/secciones`, para administradores.

## Alcance funcional

- Crear secciones (slug inmutable para proteger enlaces).
- Editar nombre y descripción de las secciones.
- Definir el orden mediante un número y controlar su visibilidad en el menú, la portada y el sitemap.
- Ocultar una sección **no borra** su contenido ni invalida una URL ya compartida.
- La navegación, la portada, la página de sección y el sitemap consultan la configuración desde la base.

## Backend y migraciones

- `supabase/migrations/20261103102000_category_management.sql`: campos aditivos, roles RLS admin en INSERT y UPDATE.
- `supabase/migrations/20261103104000_harden_category_grants.sql`: elimina permisos genéricos heredados para el público y limita actualizaciones a columnas específicas. Ambos cambios se aplicaron al proyecto Supabase **Pesse**.
- No se concede DELETE ni UPDATE de `slug` al rol `authenticated`.
- Comprobado: lectura pública, bloqueo de UPDATE anónimo, bloqueo de editar slugs y bloqueo de DELETE general.
- Sin migración ni efecto sobre el proyecto Finanzas.

## Casos por validar en vista previa

1. Inicio de sesión como admin y lectura de siete secciones existentes.
2. Cambiar temporalmente el orden y revisar menú de escritorio, móvil, portada y sitemap.
3. Ocultar una sección y confirmar que desaparece del menú pero mantiene su ruta pública.
4. Crear una sección con slug nuevo y comprobar que la ruta /categoria/[slug] funciona.
5. Verificar que un Redactor no pueda abrir el panel ni modificar categorías mediante API.
6. Restaurar los valores acordados antes de publicar.

## Pendiente fuera de este módulo

Logo, paleta cromática, banners patrocinados y programación publicitaria requieren una fase independiente de gestión de archivos y reglas de publicación. No presentarlos como controles disponibles.
