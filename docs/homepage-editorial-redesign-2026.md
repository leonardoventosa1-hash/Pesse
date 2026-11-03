# Portada editorial de Pesse — rediseño noviembre 2026

## Objetivo
Convertir la portada en una página informativa jerarquizada, con identidad verde de Pesse, protagonistas editoriales reconocibles y exploración rápida de secciones y archivo. Sin introducir noticias falsas, fotos de stock, módulos decorativos vacíos ni modificar datos existentes.

## Componentes
- Encabezado editorial compacto que toma título, énfasis y texto de la tabla `site_settings`. No cambia los ajustes guardados.
- Barra de accesos rápidos a categorías visibles y a la búsqueda.
- Portada principal: un artículo destacado, hasta cuatro artículos secundarios y hasta cuatro titulares adicionales. Todos provienen de consultas de artículos publicados. La selección editorial de destacado conserva el comportamiento vigente.
- Etiquetas de categoría derivadas de la configuración existente; ninguna fecha ni noticia se inventa.
- Estado vacío explícito si aún no existen artículos. No hay bloques falsos.
- Se conservan espacios de patrocinio y los bloques configurables de portada (`HomepageBlocks`), así como las opciones de paleta ya disponibles para administradores.
- Diseño adaptado a escritorio, tablet y móviles, con titulares legibles, imágenes proporcionales y navegación por teclado.

## Pruebas previas al lanzamiento
1. Portada con 0, 1, 3, 5 y más de 9 artículos publicados; comprobar que no aparecen noticias de prueba ni contenido duplicado dentro del bloque de apertura.
2. Enlaces de noticia y categoría, búsqueda, portada vacía y botones de navegación.
3. Validación móvil en 375 y 430 px, tablet 768 px y escritorio 1280 px; no debe haber desborde horizontal.
4. Comprobar que las imágenes se mantienen dentro de sus contenedores y que el principal no tiene desplazamiento inesperado.
5. Controlar la legibilidad de las tres paletas verdes administrables y el foco visible de los enlaces.
6. Publicidad programada: sigue en su ubicación habitual y claramente identificada.
7. Verificar `npm run check`, `npm run build`, GitHub Actions, Vercel y errores recientes de ejecución.
