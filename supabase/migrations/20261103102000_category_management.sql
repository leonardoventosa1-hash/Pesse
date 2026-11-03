-- Pesse category presentation; safe, additive migration.
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 100;
ALTER TABLE public.categories ADD CONSTRAINT categories_description_length CHECK (char_length(description)<=300);
ALTER TABLE public.categories ADD CONSTRAINT categories_display_order_bounds CHECK (display_order BETWEEN 0 AND 10000);
UPDATE public.categories SET display_order=CASE slug
 WHEN 'politica' THEN 10 WHEN 'sociedad' THEN 20 WHEN 'deportes' THEN 30
 WHEN 'cultura' THEN 40 WHEN 'musica' THEN 50 WHEN 'turismo' THEN 60
 WHEN 'entretenimiento' THEN 70 ELSE display_order END
WHERE display_order=100;
REVOKE INSERT,UPDATE,DELETE ON public.categories FROM authenticated;
GRANT INSERT (slug,name,description,is_visible,display_order) ON public.categories TO authenticated;
GRANT UPDATE (name,description,is_visible,display_order) ON public.categories TO authenticated;
DROP POLICY IF EXISTS "admin create categories" ON public.categories;
CREATE POLICY "admin create categories" ON public.categories FOR INSERT TO authenticated
 WITH CHECK ((SELECT public.is_admin()));
DROP POLICY IF EXISTS "admin update categories" ON public.categories;
CREATE POLICY "admin update categories" ON public.categories FOR UPDATE TO authenticated
 USING ((SELECT public.is_admin())) WITH CHECK ((SELECT public.is_admin()));
-- No DELETE policy, and slug is immutable to preserve published links.
