-- Pesse CMS: public presentation settings, never secrets.
-- One row only; non-admin visitors can READ for site rendering.
CREATE TABLE IF NOT EXISTS public.site_settings (
 id smallint PRIMARY KEY DEFAULT 1 CHECK (id=1),
 site_name text NOT NULL DEFAULT 'Pesse' CHECK (char_length(site_name) BETWEEN 2 AND 70),
 tagline text NOT NULL DEFAULT 'Información con otra mirada.' CHECK (char_length(tagline)<=150),
 description text NOT NULL DEFAULT 'Noticias, entrevistas y actualidad en Pesse' CHECK (char_length(description) BETWEEN 20 AND 300),
 hero_title text NOT NULL DEFAULT 'Las noticias,' CHECK (char_length(hero_title) BETWEEN 3 AND 120),
 hero_emphasis text NOT NULL DEFAULT 'con otra mirada.' CHECK (char_length(hero_emphasis) BETWEEN 3 AND 120),
 hero_description text NOT NULL DEFAULT 'Lo que pasa, las historias detrás de los hechos y las voces que importan. Informate con Pesse.' CHECK (char_length(hero_description) BETWEEN 10 AND 350),
 instagram_url text NOT NULL DEFAULT 'https://www.instagram.com/pesse.info/' CHECK (instagram_url ~ '^https://(www\.)?instagram\.com/'),
 facebook_url text NOT NULL DEFAULT 'https://www.facebook.com/share/1Bu3f2ArLs/' CHECK (facebook_url ~ '^https://(www\.)?facebook\.com/'),
 youtube_url text NOT NULL DEFAULT 'https://www.youtube.com/@pesseinfo' CHECK (youtube_url ~ '^https://(www\.)?youtube\.com/'),
 tiktok_url text NOT NULL DEFAULT 'https://www.tiktok.com/@pesse.info' CHECK (tiktok_url ~ '^https://(www\.)?tiktok\.com/'),
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_settings(id) VALUES (1) ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_settings FROM anon, authenticated;
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE (site_name, tagline, description, hero_title, hero_emphasis, hero_description, instagram_url, facebook_url, youtube_url, tiktok_url, updated_at)
 ON public.site_settings TO authenticated;
DROP POLICY IF EXISTS "public read presentation settings" ON public.site_settings;
CREATE POLICY "public read presentation settings" ON public.site_settings
 FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admins update presentation settings" ON public.site_settings;
CREATE POLICY "admins update presentation settings" ON public.site_settings
 FOR UPDATE TO authenticated USING ((SELECT public.is_admin()))
 WITH CHECK ((SELECT public.is_admin()));
COMMENT ON TABLE public.site_settings IS 'Public-only site appearance and social settings; do not place secrets here.';
