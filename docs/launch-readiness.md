# Pesse — Validación para el lanzamiento

Estado: **candidato en revisión, no autorizado para producción**. Este documento evita confundir un build exitoso con una prueba funcional completa.

## Puertas de salida obligatorias

| Control | Estado inicial | Evidencia exigida |
| --- | --- | --- |
| CI de la rama final (TypeScript y build) | Revisar por commit | Ejecución verde asociada al SHA que se publicará |
| Preview de Vercel del mismo SHA | Revisar por commit | Despliegue READY y verificación visual real |
| Variables de entorno de Preview | Pendiente | `NEXT_PUBLIC_SUPABASE_URL` y clave pública de **staging** disponibles en Preview, sin usar Finanzas |
| Autenticación y RLS | Pendiente | Pruebas con Administrador, Redactor y anónimo en Supabase aislado |
| Storage `news-images` | Pendiente | Subida y lectura permitidas; operaciones no autorizadas bloqueadas |
| Publicación de noticia | Pendiente | Crear borrador, recuperar edición, publicar, editar y comprobar búsquedas |
| Experiencia pública | Pendiente | Inicio, categorías, noticias, búsqueda, videos, móvil, enlaces externos, RSS y sitemap |
| SEO de lanzamiento | Pendiente | Canonical, robots de producción, noindex en Preview y metadatos al compartir |
| Copia y reversión | Pendiente | Backup restaurable de datos, referencia del despliegue anterior y pasos de rollback |
| Aprobación final | Pendiente | Autorización explícita antes de modificar `main` o producción |

## Casos de prueba de permisos (en staging)

1. **Anónimo:** puede leer una noticia publicada; no puede leer borradores ni abrir el editor ni escribir en las tablas o Storage.
2. **Redactor:** inicia sesión, crea borrador, sube una imagen JPEG/PNG/WebP, completa texto alternativo, publica según la política vigente y edita una noticia autorizada.
3. **Administrador:** realiza las acciones editoriales permitidas y ve el conjunto completo de contenidos; se comprueban los controles de acceso a operaciones administrativas.
4. **Concurrencia:** dos sesiones abren una noticia; si una guarda primero, la segunda recibe aviso de conflicto sin sobrescribir la edición reciente.
5. **Errores:** simular RPC indisponible y sesión expirada; el buscador y el editor muestran fallos comprensibles sin divulgar credenciales.

## Recorrido editorial de punta a punta

- Crear una noticia de prueba con título, bajada, cuerpo, categoría, slug e imagen.
- Guardarla como borrador y confirmar que no es pública.
- Recargar el editor y comprobar recuperación de cambios no guardados.
- Publicar y confirmar URL, portada, página de categoría, resultados de búsqueda y RSS.
- Editar título y slug y confirmar que el vínculo final sea el esperado.
- Probar en pantalla angosta, teclado y lector de pantalla básico.
- Retirar la noticia de prueba de manera autorizada y comprobar que no quede visible.

## Riesgos que bloquean el lanzamiento

- **No activar PR #18 (papelera)** sin staging, backup recuperable y validación de migraciones y RLS.
- Un despliegue `READY` en Vercel no garantiza que Supabase esté configurado ni que publicar noticias funcione.
- No copiar variables secretas a GitHub, comentarios de PR, documentación o un cliente con `NEXT_PUBLIC_*`.
- No apuntar Preview a la base de datos real solo para hacer funcionar una demostración.
- No asumir que la rama `main` está desconectada de publicación automática.

## Procedimiento de publicación, cuando estén aprobados los controles

1. Registrar el SHA exacto, el PR, los checks y el deployment de Preview revisado.
2. Confirmar respaldo y procedimiento de reversión; resolver duplicados entre PRs y excluir la papelera.
3. Solicitar aprobación para integrar a `main` y activar el despliegue de producción.
4. Verificar en el dominio público las rutas, login, carga de una noticia, redes sociales, RSS y los metadatos SEO.
5. Si algo falla, volver al despliegue conocido como estable y preservar los datos.

**Registro de resultados:** completar cada fila con fecha, responsable, SHA, URL de evidencia y resultado antes de autorizar producción.
