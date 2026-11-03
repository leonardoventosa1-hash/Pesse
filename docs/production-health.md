# Pesse — Comprobación de salud de producción

Endpoint público: `GET /api/health`. Disponible para máquinas y revisión operativa; devuelve únicamente estado y cuatro indicadores booleanos. No expone contenido, usuarios, nombres de tablas con errores, credenciales ni datos personales.

- Respuesta `200`, `status=ok`: Supabase responde, existe configuración institucional, se pueden consultar categorías y el sitio tiene los tres bloques previstos.
- Respuesta `503`, `status=degraded`: falta conexión o alguno de los controles falla. Es una señal operativa para investigar, no necesariamente que todos los visitantes estén viendo errores.
- Cabeceras `no-store` y `noindex` para impedir caché y listado en buscadores.

El workflow `.github/workflows/production-health.yml` comprueba el dominio público cada hora y también permite ejecución manual desde Actions. Una ejecución con error deja una alerta en GitHub Actions; no envía correos a terceros ni reinicia servicios automáticamente.

La comprobación no reemplaza pruebas de inicio de sesión, lectura del editor, permisos de roles, carga de imágenes o el envío de invitaciones; esos flujos todavía deben probarse con cuentas reales controladas. En Vercel, verificar que producción tenga las variables públicas del proyecto Supabase **Pesse**, no las de otro proyecto.

La URL pública es `https://pesse-gilt.vercel.app/api/health`. Si cambia el dominio principal, actualizar también el workflow.
