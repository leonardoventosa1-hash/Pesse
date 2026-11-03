# Pesse — Videoteca y Pesse Stream

## Para visitantes

- Portada: el bloque configurado como `video_promo` ahora muestra una sección audiovisual. Si hay videos publicados, se ven tarjetas editoriales con miniatura oficial de YouTube, título, tipo de contenido y enlace al video concreto.
- Si no hay videos publicados, aparece un módulo institucional sin videos falsos, con acceso al canal oficial de Pesse.
- Se añade una franja de **Pesse Stream — lunes, 22:30**, con acceso al canal para ver el programa. No se afirma que esté transmitiendo en directo fuera de ese horario.
- La página `/videos` es una galería completa y ya no muestra una pantalla vacía. No se carga un reproductor pesado al abrir la portada: el usuario decide al pulsar el enlace.
- Las miniaturas se obtienen de `i.ytimg.com` a partir del ID validado del video, nunca de imágenes inventadas.

## Para administradores

- Nueva ruta `/admin/configuracion/videos` enlazada desde Configuración general.
- Solo Administrador puede cargar un link de YouTube verificado en formato (YouTube watch, Shorts, live o youtu.be), indicar título, descripción, tipo, orden y publicar u ocultar el material.
- El video nuevo se guarda **siempre como borrador**. Publicar requiere una acción posterior con confirmación.
- La migración `supabase/migrations/20261103162000_editorial_videos.sql` crea `public.editorial_videos` y habilita RLS: el público solo ve videos publicados; administradores pueden revisar todos, crear y modificar. Sin privilegios de eliminar videos ni de cambiar su `youtube_id` mediante API.
- Si se cambia el dominio oficial del canal, el botón utiliza `site_settings.youtube_url`, administrable desde el panel.

## Pruebas de aceptación

1. Verificar que sin videos cargados la portada y /videos muestran el módulo institucional y el enlace al canal correcto.
2. Como administrador, cargar un enlace real de YouTube en borrador. Confirmar que no aparece públicamente.
3. Publicar el borrador y verificar miniatura, título, reproducción en YouTube y aparición en portada y /videos.
4. Archivar u ocultar el video; comprobar que desaparece del sitio sin borrar el registro.
5. Verificar que un Redactor no puede acceder al panel ni insertar o modificar filas a través de API.
6. Validar dispositivos 375/430/768/1280px, navegación con teclado, contraste, tamaño de imágenes y ausencia de desbordes.
7. Confirmar que el bloque sigue respetando orden y visibilidad de `homepage_sections`.

La integración del feed automático de YouTube requiere un ID verificable de canal o API confiable; no se inventaron videos ni sus URLs.
