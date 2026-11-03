-- Remove inherited broad grants; preserve read-only public category API.
REVOKE ALL PRIVILEGES ON TABLE public.categories FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT INSERT (slug,name,description,is_visible,display_order) ON TABLE public.categories TO authenticated;
GRANT UPDATE (name,description,is_visible,display_order) ON TABLE public.categories TO authenticated;
-- RLS administrator-only policies were installed by category_management.
