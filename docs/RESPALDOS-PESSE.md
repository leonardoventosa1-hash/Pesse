# Procedimiento de respaldos cifrados de Pesse

Estado (6/11/2026): herramientas preparadas, **respaldo real aún NO ejecutado ni restauración comprobada**.

## Alcance

El proyecto Supabase de Pesse utiliza el plan Free, que no ofrece respaldos diarios automáticos. Los backups de base de datos no incluyen los bytes de los archivos de Storage. Por eso se necesitan ambos componentes.

Los scripts de este repositorio generan cuatro exportaciones:
- roles.sql (roles SQL)
- schema.sql (esquema de base de datos)
- data.sql (datos, incluidos borradores privados)
- storage/ (fotografías y otros objetos de todos los buckets disponibles) y storage-manifest.json (SHA-256 y tamaño por archivo)

Se empaqueta todo en un único archivo **.tar.gz.age** cifrado, con SHA-256 del archivo final. Los archivos y datos de trabajo descifrados son temporales. NO subir respaldos a GitHub ni enviarlos por chat.

Documentación oficial: https://supabase.com/docs/guides/platform/backups
Guía de CLI: https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore

## Requisitos para Windows

1. En una máquina confiable con disco cifrado: instalar Node.js, Docker Desktop, Supabase CLI, tar y age.
2. Verificar versiones y parámetros con "supabase --help", "supabase db dump --help" y "age --help". Las opciones y CLI pueden cambiar.
3. Ejecutar "npm ci" en la raíz de Pesse; el script de Storage utiliza la dependencia existente @supabase/supabase-js.
4. Crear una clave age con "age-keygen -o pesse-backup-key.txt" en una carpeta segura **FUERA del repositorio**. Guardar la clave privada cifrada y una copia independiente. La línea de clave pública que comienza por "age1" es el recipient de cifrado; nunca entregar la privada.
5. Obtener la conexión de Postgres por **Session pooler** desde el botón Connect del proyecto Supabase (o conexión directa si la red admite IPv6). Utilizar un usuario con permiso de respaldo.
6. Obtener de Supabase la clave secreta/service_role para descargar objetos de Storage; es privilegiada y jamás debe quedar en el código, el cliente web, logs ni este documento.

Variables de entorno privadas de la sesión de PowerShell:
- PESSE_DB_URL: cadena de conexión completa a Postgres, con contraseña.
- PESSE_SUPABASE_URL: URL del proyecto Supabase.
- PESSE_SERVICE_ROLE_KEY: clave privilegiada de Storage.
- PESSE_AGE_RECIPIENT: clave pública age (age1...).

No pegar estas claves en ChatGPT. Introducirlas mediante un gestor de secretos o mecanismo local seguro para evitar guardarlas en el historial de terminal.

## Ejecutar una copia

Desde la raíz del proyecto:

    npm ci
    .\scripts\backup-pesse.ps1

La salida se encuentra en la carpeta backups/ (ignorada por Git), con un archivo cifrado del tipo:
- pesse-AAAAMMDD-HHMMSS.tar.gz.age
- pesse-AAAAMMDD-HHMMSS.tar.gz.age.sha256

Si falla una etapa, el script debe terminar con error y retirar sus archivos parciales. No realiza cambios en Supabase; sólo lee la base y descarga los archivos existentes. **Un archivo existente no demuestra que pueda restaurarse**.

Guardar el archivo cifrado en dos ubicaciones independientes, por ejemplo un disco externo cifrado y almacenamiento privado con autenticación fuerte. Guardar la clave privada age **separada** del respaldo.

Frecuencia inicial sugerida: al menos semanal y antes de modificaciones importantes de la base de datos. Aumentar según la frecuencia editorial y valorar el plan Pro para mecanismos gestionados.

## Verificar el respaldo

En una computadora confiable, con la clave privada age disponible **solo localmente**:

    Get-FileHash -Algorithm SHA256 -LiteralPath "backups\pesse-AAAAMMDD-HHMMSS.tar.gz.age"
    age -d -i "RUTA_PRIVADA\pesse-backup-key.txt" -o "pesse-restauracion.tar.gz" "backups\pesse-AAAAMMDD-HHMMSS.tar.gz.age"
    New-Item -ItemType Directory -Force -Path ".\pesse-restauracion"
    tar -xzf "pesse-restauracion.tar.gz" -C ".\pesse-restauracion"
    node .\scripts\verify-backup.mjs .\pesse-restauracion

Comparar el hash de Get-FileHash con el .sha256 del respaldo cifrado. El verificador comprueba las huellas de los archivos de Storage y la presencia de exportaciones SQL. Limpiar los archivos descifrados al terminar, sin dejarlos en carpetas públicas o sincronizadas.

## Prueba de recuperación: nunca sobre el proyecto productivo

1. Preparar una base Postgres de ensayo o proyecto aislado de Supabase, no conectado a la web pública ni a usuarios reales. Consultar costos antes de crear recursos.
2. Utilizar la guía oficial de recuperación de Supabase para restaurar roles, esquema y datos con las herramientas adecuadas a la versión. No ejecutar restauraciones en la base de Pesse.
3. Verificar en el entorno de ensayo tablas, claves, roles y permisos, RLS, datos y recuento de noticias.
4. Recuperar las fotografías desde la carpeta storage/ hacia Storage **de ensayo** mediante un proceso controlado; la restauración de SQL no trae los bytes de las imágenes.
5. Comprobar la lectura pública, los borradores privados, el acceso por roles, la apertura de fotos y el catálogo de videos.
6. Registrar fecha, copia usada, resultados, duración e incidencias. Eliminar datos descifrados de prueba cuando corresponda.

## Checklist antes del lanzamiento

- [ ] Primera ejecución real de respaldo (la herramienta por sí sola no constituye una copia)
- [ ] Segundo ejemplar cifrado fuera del equipo principal
- [ ] Hash SHA-256 comprobado
- [ ] Recuperación aislada de base de datos verificada
- [ ] Recuperación aislada de fotos verificada
- [ ] Frecuencia, responsable y destino seguro acordados
- [ ] Claves privadas fuera de GitHub y fuera del sitio web
- [ ] Registro periódico de simulacros de recuperación

El procedimiento es una copia lógica y no sustituye por sí solo un servicio de respaldos automáticos de Supabase.
