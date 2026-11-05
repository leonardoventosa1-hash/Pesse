-- Optional editorial credits for news articles. Existing rows remain unchanged.
ALTER TABLE public.articles
 ADD COLUMN IF NOT EXISTS author_name text,
 ADD COLUMN IF NOT EXISTS cover_caption text,
 ADD COLUMN IF NOT EXISTS cover_credit text,
 ADD COLUMN IF NOT EXISTS editorial_updated_at timestamptz;
ALTER TABLE public.articles
 DROP CONSTRAINT IF EXISTS articles_author_name_length,
 ADD CONSTRAINT articles_author_name_length CHECK (author_name IS NULL OR char_length(author_name)<=120),
 DROP CONSTRAINT IF EXISTS articles_cover_caption_length,
 ADD CONSTRAINT articles_cover_caption_length CHECK (cover_caption IS NULL OR char_length(cover_caption)<=300),
 DROP CONSTRAINT IF EXISTS articles_cover_credit_length,
 ADD CONSTRAINT articles_cover_credit_length CHECK (cover_credit IS NULL OR char_length(cover_credit)<=120),
 DROP CONSTRAINT IF EXISTS articles_editorial_updated_not_before_published,
 ADD CONSTRAINT articles_editorial_updated_not_before_published CHECK (editorial_updated_at IS NULL OR published_at IS NULL OR editorial_updated_at>=published_at);
COMMENT ON COLUMN public.articles.author_name IS 'Optional public byline, entered and verified by editor';
COMMENT ON COLUMN public.articles.cover_caption IS 'Optional descriptive caption for primary image';
COMMENT ON COLUMN public.articles.cover_credit IS 'Optional photographer or source credit for primary image';
COMMENT ON COLUMN public.articles.editorial_updated_at IS 'When published article content was subsequently revised; distinct from technical updated_at';
