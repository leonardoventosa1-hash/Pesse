# Matriz de pruebas editoriales en staging — Pesse

**Alcance:** validación manual con un proyecto Supabase de staging **independiente** y usuarios/datos sintéticos. No ejecutar contra producción. Este documento no autoriza migraciones, fusiones ni despliegues.

## Preparación y evidencias
- Registrar SHA candidato, URL de preview, fecha, responsable y resultado de `npm ci`, `npm run check`, `npm run build`.
- Confirmar que la preview utiliza URL y claves del Supabase de staging; no publicar valores secretos en capturas o logs.
- Crear usuarios de prueba con roles anónimo, redactor A, redactor B y administrador; crear dos noticias sintéticas por autor.
- Para cada caso registrar **Aprobado / Falló / Bloqueado**, captura o log sin datos sensibles y issue asociado.

## Casos mínimos de aceptación

| ID | Actor / acción | Resultado esperado |
| --- | --- | --- |
| AUTH-01 | Anónimo abre `/admin` | Redirección al inicio de sesión; ningún contenido editorial privado visible |
| AUTH-02 | Cuenta sin rol editorial abre el panel | Acceso denegado; no aparecen acciones de edición |
| AUTH-03 | Invitación válida y activación | Estado final explícito y acceso según rol |
| AUTH-04 | Invitación vencida o sesión ausente | Mensaje de error o acción recuperable; nunca carga infinita |
| ROLE-01 | Redactor A consulta listado | Solo ve noticias autorizadas; no accede a las del redactor B |
| ROLE-02 | Redactor A intenta editar/publicar noticia ajena por URL/API | Operación denegada por RLS, no solo por interfaz |
| ROLE-03 | Redactor intenta destacar, despublicar o gestionar integrantes | Operaciones administrativas denegadas por RLS |
| ROLE-04 | Administrador consulta y gestiona noticias | Operaciones permitidas según política documentada |
| EDIT-01 | Crear borrador, editarlo y volver a abrirlo | Cambios persistidos correctamente |
| EDIT-02 | Publicar y despublicar noticia sintética | Estado público consistente, sin duplicados |
| EDIT-03 | Buscar sin coincidencias | Mensaje de cero resultados, sin error |
| EDIT-04 | Simular fallo de búsqueda en staging | Mensaje de error, sin afirmar «0 resultados» |
| EDIT-05 | Crear más de 100 noticias sintéticas y paginar | Sin omisiones ni duplicados; cifras y filtros comprensibles |
| MEDIA-01 | Subir imagen permitida e intentar archivo inválido | Archivo válido disponible; inválido rechazado con explicación |
| VIDEO-01 | Añadir enlace de YouTube sintético/de prueba | Miniatura y enlace correctos; URL inválida controlada |
| SAFE-01 | Intentar funciones de papelera sin staging/backup probado | No ejecutar pruebas destructivas; marcar bloqueado |

## Criterios de bloqueo
- Cualquier permiso que dependa solo del cliente, fuga de datos entre autores o preview conectada a producción bloquea el lanzamiento.
- La papelera PR #18 y cualquier migración destructiva permanecen fuera de alcance hasta contar con backup **restaurado y verificado** en entorno aislado.
- Un check de Vercel en verde no reemplaza GitHub Actions ni pruebas funcionales.
- Ninguna casilla se considera aprobada por el solo hecho de existir este documento.

## Cierre
Registrar los resultados en el PR candidato y solicitar aprobación explícita antes de fusionar a `main` o promover a producción.
