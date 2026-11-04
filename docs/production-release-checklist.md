# Checklist de salida a producción — Pesse

> Este documento no autoriza una fusión ni un despliegue. Completar y registrar evidencias antes de publicar.

## 1. Código y revisión
- [ ] Identificar el SHA exacto de `main` y del candidato a release.
- [ ] Revisar PR abiertos, conflictos y cambios incluidos; evitar duplicar correcciones ya integradas (por ejemplo, #60).
- [ ] Ejecutar `npm ci`, `npm run check` y `npm run build` sobre el SHA candidato.
- [ ] Confirmar resultados de GitHub Actions y Vercel Preview asociados al **mismo SHA**.
- [ ] Revisar variables de entorno y confirmar que la preview no escriba en producción.

## 2. Staging aislado
- [ ] Crear proyecto Supabase de staging separado, con datos sintéticos y credenciales independientes.
- [ ] Verificar políticas RLS para lector anónimo, redactor y administrador, incluidas operaciones denegadas.
- [ ] Probar invitación, activación, sesión vencida, cierre de sesión y recuperación.
- [ ] Probar creación, edición, borrador, publicación y despublicación de noticias.
- [ ] Probar carga de imágenes, errores de red, búsquedas sin resultados y búsquedas fallidas.
- [ ] Revisar videoteca, enlaces externos y visualización responsive en móvil.

## 3. Seguridad y recuperación
- [ ] Documentar respaldo recuperable y ensayo de restauración antes de cualquier migración o eliminación.
- [ ] No ejecutar ni integrar la papelera #18 sin staging y backup restaurable.
- [ ] Verificar que los secretos no se expongan al navegador ni en logs.
- [ ] Preparar procedimiento de rollback y responsables de la decisión.

## 4. Autorización final
- [ ] Revisar diferencias entre staging y producción.
- [ ] Registrar aprobación explícita para fusionar a `main` y desplegar.
- [ ] Tras el despliegue autorizado, verificar salud, navegación, autenticación y publicación; monitorizar errores.

**Estado:** pendiente de completar con evidencia; ningún casillero implica validación automática.
