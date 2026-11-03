-- Homepage sections: safe admin-only ordering and visibility.
CREATE TABLE IF NOT EXISTS public.homepage_sections (
 section_key text PRIMARY KEY CHECK (section_key IN ('news_by_category','category_directory','video_promo')),
 display_order integer NOT NULL DEFAULT 100 CHECK (display_order BETWEEN 0 AND 1000),
 is_visible boolean NOT NULL DEFAULT true,
 updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.homepage_sections(section_key,display_order,is_visible) VALUES
 ('news_by_category',10,true),('category_directory',20,true),('video_promo',30,true)
ON CONFLICT (section_key) DO NOTHING;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.homepage_sections FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.homepage_sections TO anon,authenticated;
GRANT UPDATE (display_order,is_visible,updated_at) ON public.homepage_sections TO authenticated;
DROP POLICY IF EXISTS "homepage sections readable" ON public.homepage_sections;
CREATE POLICY "homepage sections readable" ON public.homepage_sections FOR SELECT TO anon,authenticated USING (true);
DROP POLICY IF EXISTS "admins update homepage sections" ON public.homepage_sections;
CREATE POLICY "admins update homepage sections" ON public.homepage_sections FOR UPDATE TO authenticated
 USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
-- Restrict palette to vetted green-only variants and preserve original default.
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS brand_variant text NOT NULL DEFAULT 'original';
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_brand_variant_allowed CHECK (brand_variant IN ('original','deep_green','light_green'));
GRANT UPDATE (brand_variant) ON public.site_settings TO authenticated;
COMMENT ON TABLE public.homepage_sections IS 'Home section visibility and ordering, limited to fixed public blocks. Never store HTML.';
