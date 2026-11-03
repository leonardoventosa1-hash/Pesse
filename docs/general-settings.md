# Pesse — Configuración general (primera versión funcional)

Ruta: `/admin/configuracion`, accesible desde el panel editorial **solo para administradores**.

## Ajustes disponibles

- Identidad pública: nombre del medio, frase institucional y descripción SEO.
- Portada: título, texto destacado y presentación principal.
- Redes oficiales: Instagram, Facebook, YouTube y TikTok. No se incluye X.
- Guardar y descartar cambios, validación de formatos y aviso de cambios sin guardar.

Estos ajustes se guardan en `public.site_settings` y se muestran en la portada, el footer y los metadatos. No se almacenan tokens ni contraseñas en esta tabla.

## Migración y protección

- Archivo: `supabase/migrations/20261103100000_site_settings.sql`.
- Migración `site_settings` **aplicada el 3/11/2026** al proyecto de Supabase Pesse (`sabfvfeletrinwloyryw`), sin alterar noticias ni categorías.
- Una sola fila (id=1), RLS activada, SELECT público y UPDATE sobre columnas explícitas solo para `authenticated` con política `is_admin()`. No existe INSERT público.
- Comprobado en una transacción revertida: un administrador puede actualizar la fila; una identidad autenticada sin rol no puede cambiarla.
- Defaults definidos en `src/lib/site-settings.ts`, para que las páginas sigan funcionando si el servicio no responde.
- Las URLs sociales se validan para que solo admitan HTTPS y el dominio correcto.

## Pruebas de aceptación pendientes antes de publicar

1. Iniciar sesión como administrador real en la Preview y entrar a Configuración general.
2. Cambiar la frase institucional de forma temporal y verificar el footer en una página nueva.
3. Cambiar el título principal y comprobar portada, adaptabilidad móvil y accesibilidad.
4. Modificar la descripción SEO y comprobar la etiqueta de metadatos.
5. Guardar y descartar modificaciones; comprobar rechazo de URLs inválidas.
6. Entrar como Redactor y comprobar que no accede al panel ni puede actualizar `site_settings`.
7. Restaurar el texto acordado y comprobar el resultado final; nunca tocar datos de Finanzas.

## Próximas ampliaciones (no habilitadas)

- Gestión de categorías y orden del menú (requiere reemplazar navegación hardcodeada en todas las vistas).
- Logo e identidad cromática (requieren validar contraste y formatos de imagen).
- Orden de bloques de portada (requiere configurar composición editorial).
- Inventario publicitario y banners (requiere reglas de programación y seguridad del contenido).

No presentar estas funciones como operativas antes de implementar y probar sus permisos y su renderizado.
