-- Pesse: mantener trazabilidad de las revisiones cuando cambia el borrador.
-- PREPARADA EN GITHUB; NO se ejecuta automáticamente en Supabase.
-- Aplicar tras respaldar y con pruebas de roles en entorno aislado.
ALTER TABLE public.editorial_review_requests
  ADD COLUMN IF NOT EXISTS article_updated_at timestamptz;

-- Las solicitudes antiguas que no tienen huella no podrán aprobarse.
ALTER TABLE public.editorial_review_requests
  DROP CONSTRAINT IF EXISTS editorial_review_requests_status_check;
ALTER TABLE public.editorial_review_requests
  ADD CONSTRAINT editorial_review_requests_status_check
  CHECK (status IN ('pending','approved','changes_requested','outdated'));

ALTER TABLE public.editorial_review_requests
  DROP CONSTRAINT IF EXISTS review_response_consistency;
ALTER TABLE public.editorial_review_requests
  ADD CONSTRAINT review_response_consistency
  CHECK (
    (status IN ('pending','outdated') AND reviewer_id IS NULL AND reviewed_at IS NULL)
    OR (status IN ('approved','changes_requested') AND reviewer_id IS NOT NULL AND reviewed_at IS NOT NULL)
  );

-- La versión del artículo la registra el servidor, no el navegador.
CREATE OR REPLACE FUNCTION public.capture_editorial_review_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE current_version timestamptz;
BEGIN
  IF TG_OP='INSERT' THEN
    SELECT updated_at INTO current_version
      FROM public.articles WHERE id=NEW.article_id AND status='draft' AND deleted_at IS NULL;
    IF current_version IS NULL THEN
      RAISE EXCEPTION 'Article draft not found for review' USING errcode='23514';
    END IF;
    NEW.article_updated_at := current_version;
  ELSIF TG_OP='UPDATE' THEN
    -- Nadie puede cambiar la huella de revisión una vez presentada.
    IF NEW.article_updated_at IS DISTINCT FROM OLD.article_updated_at THEN
      RAISE EXCEPTION 'Review version cannot change' USING errcode='42501';
    END IF;
    IF NEW.status='approved' AND OLD.status='pending' THEN
      SELECT updated_at INTO current_version FROM public.articles
        WHERE id=OLD.article_id AND status='draft' AND deleted_at IS NULL;
      IF current_version IS NULL OR OLD.article_updated_at IS DISTINCT FROM current_version THEN
        RAISE EXCEPTION 'Article changed: request a new review' USING errcode='23514';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.capture_editorial_review_version() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS capture_editorial_review_version_trigger ON public.editorial_review_requests;
CREATE TRIGGER capture_editorial_review_version_trigger
BEFORE INSERT OR UPDATE ON public.editorial_review_requests
FOR EACH ROW EXECUTE FUNCTION public.capture_editorial_review_version();

-- La modificación del texto invalida cualquier solicitud pendiente.
-- Los cambios de formato mínimos también deben revisarse si afectan el contenido.
CREATE OR REPLACE FUNCTION public.invalidate_stale_editorial_reviews()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
 IF OLD.title IS DISTINCT FROM NEW.title
    OR OLD.excerpt IS DISTINCT FROM NEW.excerpt
    OR OLD.body IS DISTINCT FROM NEW.body
    OR OLD.cover_url IS DISTINCT FROM NEW.cover_url
    OR OLD.category_id IS DISTINCT FROM NEW.category_id
    OR OLD.slug IS DISTINCT FROM NEW.slug
    OR OLD.author_name IS DISTINCT FROM NEW.author_name
    OR OLD.cover_caption IS DISTINCT FROM NEW.cover_caption
    OR OLD.cover_credit IS DISTINCT FROM NEW.cover_credit
    OR OLD.locality_slug IS DISTINCT FROM NEW.locality_slug
 THEN
    UPDATE public.editorial_review_requests
       SET status='outdated'
     WHERE article_id=NEW.id AND status='pending';
 END IF;
 RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.invalidate_stale_editorial_reviews() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS invalidate_stale_editorial_reviews_trigger ON public.articles;
CREATE TRIGGER invalidate_stale_editorial_reviews_trigger
AFTER UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.invalidate_stale_editorial_reviews();

-- Solicitudes antiguas no versionadas permanecen visibles en el historial,
-- pero se dejan obsoletas para impedir aprobaciones retrospectivas.
UPDATE public.editorial_review_requests
   SET status='outdated'
 WHERE status='pending' AND article_updated_at IS NULL;
