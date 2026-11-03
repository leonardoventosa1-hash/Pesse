# Configuración de portada y paletas verdes

## Funciones disponibles en desarrollo

- `/admin/configuracion/portada`: Administrador puede mostrar/ocultar y ordenar los tres bloques **Noticias por sección**, **Explorá las secciones** y **Conocé nuestros videos**.
- Las noticias principales siguen arriba. Las ubicaciones de publicidad existentes permanecen en su sitio; ningún anuncio cambia de estado.
- `/admin/configuracion`: selector de paleta institucional **Original Pesse**, **Verde bosque** o **Verde esmeralda**. La paleta original es el valor inicial y no se modifica.
- Los colores elegidos se aplican exclusivamente a partes específicas del sitio con CSS; los títulos sobre fondo claro usan tonos oscuros para legibilidad.
- Ocultar un bloque no borra noticias, secciones ni videos.

## Backend

- Migración: `supabase/migrations/20261103114000_homepage_layout.sql`, aplicada a Supabase Pesse el 03/11/2026.
- Tabla `public.homepage_sections`: lectura pública, escritura de columnas de orden/visibilidad solo a usuarios autenticados con `is_admin()` mediante RLS.
- `site_settings.brand_variant` es una enumeración restringida por CHECK a original, deep_green, light_green.
- El frontend vuelve a la configuración original si la consulta pública falla; no ejecuta HTML arbitrario ni almacena scripts.

## Pruebas pendientes antes de producción

1. Iniciar sesión como Administrador en Preview y cambiar el orden; comprobar portada en desktop y móvil.
2. Ocultar cada bloque y luego restaurarlo; confirmar que las páginas de noticias y categorías siguen accesibles.
3. Cambiar a cada paleta y revisar contraste visual, navegación, títulos y botones en móvil.
4. Intentar guardar como Redactor, comprobar rechazo RLS; controlar que el panel no sea navegable.
5. Verificar que las noticias destacadas y publicidades no cambian al ordenar bloques.
6. Restaurar el orden (10/20/30) y la paleta Original antes de publicar.

Se mantiene `main` sin modificaciones durante esta fase.
