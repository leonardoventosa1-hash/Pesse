# Ficha editorial para noticias — 2026-11-05

## Nuevos campos
- `author_name`: firma pública opcional, máx. 120 caracteres. En las notas sin firma se mantiene «Publicado en Pesse»; no se infiere una persona a partir del usuario que cargó la noticia.
- `cover_caption`: epígrafe opcional de la imagen principal, máx. 300 caracteres.
- `cover_credit`: crédito opcional de la imagen principal, máx. 120 caracteres.
- `editorial_updated_at`: fecha de revisión editorial. Diferente de `updated_at`, que se modifica por operaciones técnicas.

Los campos nuevos son nulos en las notas anteriores. No se modifican títulos, cuerpos, publicaciones ni fotografías preexistentes.

## Comportamiento del editor
1. «Ficha editorial» aparece en el formulario de nueva noticia y de edición, y en la vista previa completa.
2. Los campos se incluyen en la detección de cambios y en la recuperación temporal de borradores, con compatibilidad con copias anteriores de siete elementos.
3. Guardar un borrador o publicarlo por primera vez no genera una fecha de actualización editorial.
4. Si se edita el título, bajada, texto o imagen de una noticia **ya publicada** y esta sigue publicada, se actualiza `editorial_updated_at`. Editar solo clasificación o créditos no cambia la fecha. Al retirar la publicación se borra esa fecha, para no mostrar una revisión anterior al nuevo ciclo de publicación.
5. Si la noticia no tiene fotografía principal, no se muestran epígrafe ni crédito.

## Página pública y SEO
- Firma opcional («Por …») junto a la fecha de publicación.
- «Actualizada el …» solo si existe una revisión editorial registrada.
- Epígrafe y crédito debajo de la fotografía principal.
- `NewsArticle.author`, `NewsArticle.dateModified` y `openGraph.modifiedTime` solamente con datos disponibles.

## Verificaciones
- Abrir una noticia anterior: debe mantenerse intacta y no mostrar campos vacíos.
- Crear borrador con firma/epígrafe/crédito, recargar y editar sin pérdida de campos.
- Publicar por primera vez: aparece la firma, pero no «Actualizada».
- Editar cuerpo de noticia publicada: debe aparecer fecha de revisión.
- Editar solo un crédito: la fecha de revisión debe conservarse.
- Quitar imagen principal: no debe mostrar créditos debajo.
- Confirmar validaciones de 120/300/120 caracteres y datos almacenados en Supabase.
