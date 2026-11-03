# Pesse — Mejoras para visitantes (lectura y archivo)

## Noticias individuales

Se integra `ArticleReader` en `/noticias/[slug]`: botones accesibles A− y A+ para tres tamaños de letra, porcentaje orientativo de progreso, barra de lectura y enlace de vuelta al inicio. No se modifica el contenido de artículos, el SEO ni las acciones existentes para compartir.

El porcentaje toma como referencia la porción visible de la región de lectura; **no** mide el tiempo real leído ni rastrea visitantes.

## Archivo

`/noticias` ahora pagina las noticias publicadas de 12 en 12, mostrando fecha y extracto, y proporciona navegación Anterior/Siguiente. Consulta Supabase con `range`, `count: exact`, orden estable por fecha e ID, y filtra artículos publicados y no eliminados. Los números de página tienen límite y los enlaces existentes a noticias no cambian.

Errores de Supabase muestran un estado de reintento en vez de comunicar falsamente que no existen noticias.

## Verificaciones para producción

- Probar una noticia corta y una larga en móvil; botones A−/A+, progreso y regreso al principio.
- Probar primera, segunda y última página de noticias; URL `?page=N`, metadatos y anuncio de páginas.
- Verificar navegación por teclado, el lector de pantalla y movimiento reducido.
- Verificar que ninguna noticia en borrador, eliminada o con fecha futura aparezca.
- Si hay menos de 13 noticias, la paginación se oculta.
- Los cambios se pueden revertir mediante GitHub/Vercel; no requieren migración de datos.
