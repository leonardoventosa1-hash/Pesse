-- Optional geographic classification independent from editorial categories.
ALTER TABLE public.articles
 ADD COLUMN IF NOT EXISTS locality_slug text;
ALTER TABLE public.articles
 DROP CONSTRAINT IF EXISTS articles_locality_slug_format,
 ADD CONSTRAINT articles_locality_slug_format
 CHECK (locality_slug IS NULL OR (length(locality_slug)<=80 AND locality_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'));
CREATE INDEX IF NOT EXISTS articles_published_locality_idx
 ON public.articles(locality_slug,published_at DESC)
 WHERE status='published' AND deleted_at IS NULL AND locality_slug IS NOT NULL;
COMMENT ON COLUMN public.articles.locality_slug IS 'Optional geographic edition, chosen by an authorized editor. Not automatically inferred from article text.';
