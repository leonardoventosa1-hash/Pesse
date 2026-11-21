# Validación del editor antes de producción (sin datos reales)

Este protocolo es manual y **no acredita pruebas ejecutadas**. Usar exclusivamente staging aislado, cuentas de prueba y archivos de prueba sin información sensible. No modificar Supabase de producción.

## Imágenes de portada y cuerpo

- [ ] JPG de 8,32 MB: seleccionar, ver progreso, comprimir, previsualizar y guardar; comprobar que la imagen aparece al reabrir el borrador.
- [ ] PNG con transparencia: verificar formato, proporciones, previsualización y visualización final.
- [ ] Imagen pequeña válida: comprobar que no se degrada ni cambia la orientación.
- [ ] Archivo corrupto, tipo no admitido y tamaño original superior al límite: mensaje claro, sin perder título, texto, imagen anterior ni borrador.
- [ ] Fallo de red durante la subida: error visible y posibilidad de reintento; no insertar enlaces rotos.
- [ ] Insertar varias imágenes en el cuerpo: respetar el punto de inserción, orden y textos alternativos.

## Recuperación y navegación

- [ ] En escritorio y móvil, redactar sin publicar, navegar hacia atrás y regresar: verificar conservación del texto.
- [ ] Guardar una copia válida en sessionStorage y otra dañada en localStorage; verificar recuperación de la válida **antes de eliminar cualquier respaldo**.
- [ ] Repetir con la copia válida en localStorage y la dañada en sessionStorage.
- [ ] Dos copias dañadas: mostrar un aviso y limpiar únicamente después de comprobar que ninguna es recuperable.
- [ ] Probar cierre/reapertura de pestaña y conflicto entre edición local y remota.

## Seguridad y autorización

- [ ] Validar roles de administrador/redactor con usuarios de staging y comprobar permisos de publicación.
- [ ] Verificar que las imágenes no queden públicas antes de la publicación cuando corresponda.
- [ ] Ejecutar CI en el commit exacto del PR y documentar resultado; verificar despliegue de preview sin tocar producción.
- [ ] Registrar evidencia (capturas, navegador, dispositivo, commit y fecha) y plan de reversión.

**Bloqueos:** no integrar el PR #18 (papelera) ni migraciones/permisos del #113 sin staging y respaldo probado mediante restauración. No fusionar a main ni desplegar sin aprobación expresa.
