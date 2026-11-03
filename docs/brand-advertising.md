# Identidad visual y publicidad de Pesse

## Funciones incorporadas

- Configuración general permite cargar un logo PNG/JPEG/WebP de hasta 5 MB. La imagen se sube al bucket público `pesse-media` en `brand/<uuid>.<ext>`. Se aplica **solo** al presionar «Guardar configuración». Hay opción para volver al logotipo original.
- El logo guardado se utiliza en encabezado y pie de página. Si no hay logo configurado o el archivo es inválido, permanece el SVG original del repositorio. No se cambió el favicon.
- Publicidad en `/admin/configuracion/publicidad`: crear una campaña como borrador, indicar anunciante, texto alternativo, imagen, destino HTTPS, ubicación y fechas.
- Los administradores pueden programar, pausar o archivar. No se muestra publicidad sin campañas activas.
- Los únicos espacios públicos previstos son `home_mid` y `home_bottom`, ambos identificados como **Contenido patrocinado · Publicidad** y con enlaces `rel="sponsored noopener noreferrer"`.

## Backend y seguridad

Migración `supabase/migrations/20261103112500_brand_and_sponsors.sql`. Aplicada a **Supabase Pesse** el 3 de noviembre de 2026.

- Tabla `public.sponsor_banners` con RLS. Solo admin puede crear o modificar registros. Los visitantes solo ven campañas `scheduled` dentro de sus fechas. No existe permiso de DELETE para el cliente autenticado.
- Bucket `pesse-media` público para **lectura**; la subida se restringe por política a administradores y rutas `brand/` y `sponsors/`. Solo se aceptan JPEG/PNG/WebP, hasta 5 MB. No se permite subir SVG.
- Los archivos se guardan con nombres aleatorios; no se permiten sobrescrituras o eliminación desde el panel.
- `site_settings.logo_path` valida rutas internas `brand/<uuid>.<ext>`. La URL pública se obtiene del SDK de Supabase, no se acepta una URL arbitraria.
- El destino de cada anuncio usa HTTPS y el sitio lo abre en una pestaña nueva, sin acceso a la pestaña de Pesse.
- No se creó ningún banner de muestra ni se cambió el logo actual.

## Pruebas de aceptación antes de publicarlo

1. Entrar como admin a ambas pantallas y comprobar carga y validación de formularios.
2. Subir un logo de prueba y confirmar que no modifica la identidad hasta hacer clic en Guardar; restaurar después el logo original.
3. Crear un anuncio de prueba como **borrador**, comprobar que es invisible públicamente.
4. Programar la campaña con horario controlado y comprobar su aparición y vencimiento en ambas posiciones; pausar y comprobar desaparición.
5. Comprobar que un Redactor no pueda subir archivos al bucket ni crear banners mediante API directa; el público no puede ver anuncios en borrador.
6. Revisar contraste, dimensiones, diseño responsive, métricas básicas de carga y contenido patrocinado accesible.
7. Verificar que Vercel Preview use el proyecto Supabase Pesse correcto, antes de probar cambios reales.

## Próximas mejoras

- Inventario por precio, facturas y métricas de clics requieren diseño separado.
- Paletas de colores configurables y variantes de logo requieren prueba de contraste; el CSS cromático actual sigue siendo fijo.
- Limpieza de medios huérfanos con control de referencias y backups; los archivos subidos pero no usados no se eliminan automáticamente.
