# Pesse 2.0

Portal periodístico de Pesse desarrollado con **Next.js 15, React 19, TypeScript y Supabase**. Repositorio independiente de otras aplicaciones.

## Identidad editorial

- Color principal: verde oscuro `#162A23`; logo blanco.
- Secciones: Política, Sociedad, Deportes, Cultura, Música, Turismo y Entretenimiento.
- Perfiles: **Administrador** (control total) y **Redactor** (publicación directa). Los permisos efectivos deben comprobarse en Supabase Auth y RLS.

## Funciones implementadas en el código

- Portada editorial adaptable, secciones y páginas de noticias.
- Autenticación y panel editorial para administrar contenido.
- Archivo administrativo paginado y filtros del panel con restablecimiento rápido.
- Búsqueda pública de noticias con relevancia, tolerancia a tildes y paginación respaldada por SQL.
- SEO: sitemap, metadatos canónicos y preparación para verificación en Google Search Console.
- Comprobación automatizada diaria de rutas públicas, incluida búsqueda y RSS.

**Importante:** la presencia de una función en el repositorio no acredita que esté funcionando en el entorno publicado. Revisar las migraciones SQL requeridas y las verificaciones de CI antes de desplegar.

## Desarrollo local

1. Usar exclusivamente el proyecto Supabase de **Pesse**, nunca el de Finanzas.
2. Revisar `supabase/schema.sql` y las migraciones posteriores; aplicarlas en orden y únicamente a una base autorizada. No ejecutar el esquema inicial sobre producción existente sin una revisión previa.
3. En Supabase Auth, deshabilitar el registro público y crear usuarios editoriales de forma controlada.
4. Asignar los roles con identificadores reales siguiendo las políticas RLS vigentes.
5. Copiar `.env.example` a `.env.local` y completar las variables públicas. **Nunca exponer una clave `service_role` en el navegador, GitHub ni en `NEXT_PUBLIC_*`.**
6. Ejecutar `npm install`, `npm run check` y `npm run build`; para desarrollo usar `npm run dev`.
7. Acceder a `/admin/login` para comprobar el flujo editorial usando cuentas de prueba.

## Funcionalidades pendientes de habilitación

### Papelera de noticias

La papelera está desarrollada en la rama `feature/recycle-bin` y documentada en [PR #18](https://github.com/leonardoventosa1-hash/Pesse/pull/18). **No fusionar ni desplegar a producción por ahora.**

Antes de habilitarla:

1. Preparar un entorno aislado de Supabase con Auth y RLS representativos.
2. Realizar una copia de seguridad completa y restaurable de la base de producción y ensayar su recuperación.
3. Probar la migración, permisos y flujos de eliminar, restaurar y publicar por rol en el entorno aislado.
4. Coordinar migración y despliegue; comprobar funcionamiento y plan de reversión.

### Otras validaciones antes de producción

- Verificar las migraciones SQL efectivamente aplicadas y las políticas de Supabase.
- Probar carga y permisos de imágenes con Storage.
- Comprobar los flujos de publicación con Administrador, Redactor y visitante anónimo.
- Confirmar dominio definitivo, Search Console, SEO, RSS y monitoreo en el sitio real.
- Revisar visualmente la identidad de Pesse y migrar contenido cuando corresponda.

## Seguridad y publicación

- No reutilizar cuentas, tablas ni credenciales de Finanzas.
- No modificar producción para probar migraciones.
- No asumir que los checks de compilación sustituyen las pruebas de RLS o recuperación.
- La rama `main` es la base estable de integración; preparar cambios en ramas y revisarlos antes de fusionar.

Este documento resume el estado del código al **1 de noviembre de 2026**. Las comprobaciones de despliegue y Supabase deben registrarse por separado.

## Vercel: vista previa y publicación controlada

- Proyecto identificado en Vercel: **pesse**. Dominio público actual: [pesse-gilt.vercel.app](https://pesse-gilt.vercel.app/).
- La rama de integración `integration/editorial-improvements-53-59` genera despliegues **Preview** en Vercel. Estos despliegues no publican automáticamente los cambios en el dominio de producción.
- Las vistas previas pueden estar protegidas por inicio de sesión de Vercel (SSO); un build **READY** no confirma por sí solo las funciones con Supabase.
- Las redes oficiales en el footer son [Instagram](https://www.instagram.com/pesse.info/), [Facebook](https://www.facebook.com/share/1Bu3f2ArLs/), [YouTube](https://www.youtube.com/@pesseinfo) y [TikTok](https://www.tiktok.com/@pesse.info). **No incluir X.** Se pueden reemplazar mediante variables `NEXT_PUBLIC_PESSE_*` con URL HTTPS válida.
- **Antes de fusionar a `main` o promocionar un despliegue:** comprobar CI, abrir la vista previa, validar navegación móvil, enlaces externos, búsqueda, RSS y flujos reales con Supabase autorizado, además de tener un plan de reversión.
- El PR de la papelera **#18** sigue bloqueado para producción hasta realizar las verificaciones de base de datos detalladas arriba.
