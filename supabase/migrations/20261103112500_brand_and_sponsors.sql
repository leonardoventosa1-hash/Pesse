-- Pesse: optional logo and scheduled sponsor banners. Safe additive rollout.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('pesse-media','pesse-media',true,5242880,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];
DROP POLICY IF EXISTS "pesse admins upload brand and sponsor media" ON storage.objects;
CREATE POLICY "pesse admins upload brand and sponsor media" ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id='pesse-media' AND (SELECT public.is_admin()) AND (storage.foldername(name))[1] IN ('brand','sponsors'));
-- No UPDATE or DELETE client privileges granted on media: assets are immutable.
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_path text NOT NULL DEFAULT '';
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_logo_path_safe CHECK
 (logo_path='' OR logo_path ~ '^brand/[0-9a-f-]{36}\.(png|jpg|jpeg|webp)$');
GRANT UPDATE (logo_path) ON public.site_settings TO authenticated;
CREATE TABLE IF NOT EXISTS public.sponsor_banners(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 advertiser_name text NOT NULL CHECK (length(advertiser_name) BETWEEN 2 AND 110),
 alt_text text NOT NULL CHECK (length(alt_text) BETWEEN 5 AND 180),
 image_path text NOT NULL CHECK (image_path ~ '^sponsors/[0-9a-f-]{36}\.(png|jpg|jpeg|webp)$'),
 target_url text NOT NULL CHECK (target_url ~ '^https://[^[:space:]]+$' AND length(target_url)<=1500),
 placement text NOT NULL DEFAULT 'home_mid' CHECK (placement IN ('home_mid','home_bottom')),
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','paused','archived')),
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT sponsor_dates_valid CHECK (ends_at IS NULL OR (starts_at IS NOT NULL AND ends_at>starts_at))
);
CREATE INDEX IF NOT EXISTS sponsor_banners_live_idx ON public.sponsor_banners (placement,status,starts_at,ends_at);
ALTER TABLE public.sponsor_banners ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sponsor_banners FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sponsor_banners TO anon,authenticated;
GRANT INSERT (advertiser_name,alt_text,image_path,target_url,placement,status,starts_at,ends_at) ON public.sponsor_banners TO authenticated;
GRANT UPDATE (advertiser_name,alt_text,image_path,target_url,placement,status,starts_at,ends_at,updated_at) ON public.sponsor_banners TO authenticated;
DROP POLICY IF EXISTS "public sees active sponsors" ON public.sponsor_banners;
CREATE POLICY "public sees active sponsors" ON public.sponsor_banners FOR SELECT TO anon,authenticated
 USING (
  (status='scheduled' AND starts_at IS NOT NULL AND starts_at<=now() AND (ends_at IS NULL OR ends_at>now()))
  OR (SELECT public.is_admin())
 );
-- Anon cannot EXECUTE is_admin(); split policies to avoid privilege errors.
DROP POLICY IF EXISTS "public sees active sponsors" ON public.sponsor_banners;
CREATE POLICY "public sees active sponsors" ON public.sponsor_banners FOR SELECT TO anon,authenticated
 USING (status='scheduled' AND starts_at IS NOT NULL AND starts_at<=now() AND (ends_at IS NULL OR ends_at>now()));
CREATE POLICY "admins see all sponsors" ON public.sponsor_banners FOR SELECT TO authenticated USING ((SELECT public.is_admin()));
CREATE POLICY "admins create sponsor banners" ON public.sponsor_banners FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_admin()));
CREATE POLICY "admins update sponsor banners" ON public.sponsor_banners FOR UPDATE TO authenticated USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
COMMENT ON TABLE public.sponsor_banners IS 'Sponsored image links; never store payment details or secrets. Scheduled publication is gated by UTC timestamp.';
