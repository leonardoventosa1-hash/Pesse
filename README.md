# Pesse 2.0

Portal periodístico con Next.js 15, TypeScript y Supabase. Desarrollo aislado de Finanzas.

## Preparación

1. Crear un proyecto **nuevo** en Supabase (no reutilizar el de Finanzas).
2. Ejecutar `supabase/schema.sql` en Supabase SQL Editor. Revisar políticas y función RPC.
3. En Supabase Auth, deshabilitar registro público y crear manualmente un usuario editorial.
4. En Supabase SQL Editor, insertar su UUID: `insert into public.editor_roles(user_id, role) values ('UUID', 'admin');`.
5. Configurar `.env.local` usando `.env.example` con la URL y la clave pública (anon/publishable). **No usar service_role**.
6. Instalar dependencias: `npm install`. Iniciar: `npm run dev`.
7. Entrar a `/admin/login` y crear noticias. La RLS de Supabase controla la autorización.
8. Configurar `NEXT_PUBLIC_SITE_URL` con el dominio propio cuando se publique.

## Estado

- Diseño editorial responsive inicial.
- Portada, listado, páginas de artículos, categorías, sección de videos.
- Editor de texto plano, estado borrador/publicado, URL de portada, acceso por Supabase Auth.
- SQL inicial con políticas RLS y verificación editorial.
- SEO básico y sitemap.

**Pendiente:** integración y pruebas reales con Supabase, carga de imágenes con Storage, validación de despliegue, programación editorial avanzada, migración de noticias y revisión de identidad visual fiel al sitio anterior. No es una versión lista para producción.

## Seguridad

La base de datos debe ser independiente, con registro público deshabilitado. Las claves privilegiadas no deben aparecer en el navegador, GitHub ni variables `NEXT_PUBLIC_*`. RLS evita la lectura de borradores a visitantes. Revisar accesos antes de publicar.
