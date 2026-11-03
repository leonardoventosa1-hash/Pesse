-- Curated official YouTube videos. No third-party API key or automated ingestion.
CREATE TABLE IF NOT EXISTS public.editorial_videos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 youtube_id text NOT NULL UNIQUE CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
 title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 180),
 description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 420),
 category text NOT NULL DEFAULT 'videos' CHECK (category IN ('stream','entrevista','cobertura','videos')),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
 display_order integer NOT NULL DEFAULT 100 CHECK (display_order BETWEEN 0 AND 10000),
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT video_publication_date CHECK (status <> 'published' OR published_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS editorial_videos_public_idx
 ON public.editorial_videos (status,display_order,published_at DESC);
ALTER TABLE public.editorial_videos ENABLE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON public.editorial_videos FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.editorial_videos TO anon,authenticated;
GRANT INSERT (youtube_id,title,description,category,status,display_order,published_at) ON public.editorial_videos TO authenticated;
GRANT UPDATE (title,description,category,status,display_order,published_at,updated_at) ON public.editorial_videos TO authenticated;
DROP POLICY IF EXISTS "public read published videos" ON public.editorial_videos;
CREATE POLICY "public read published videos" ON public.editorial_videos FOR SELECT TO anon,authenticated
 USING (status='published' AND published_at<=now());
DROP POLICY IF EXISTS "admin read all videos" ON public.editorial_videos;
CREATE POLICY "admin read all videos" ON public.editorial_videos FOR SELECT TO authenticated
 USING ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "admin insert videos" ON public.editorial_videos;
CREATE POLICY "admin insert videos" ON public.editorial_videos FOR INSERT TO authenticated
 WITH CHECK ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "admin update videos" ON public.editorial_videos;
CREATE POLICY "admin update videos" ON public.editorial_videos FOR UPDATE TO authenticated
 USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
COMMENT ON TABLE public.editorial_videos IS 'Curated YouTube links displayed on public Pesse video gallery; drafts never public.';
